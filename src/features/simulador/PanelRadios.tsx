// COM1, NAV1 y NAV2: frecuencia activa, en espera (perillas MHz y kHz o se escribe), ⇄ y estación recibida. Perilla CRS.
import { useState } from "react";
import { Perilla } from "./Perilla";
import { ajustarFrecuencia } from "./radios.ts";

type Par = [number, number];
const tres = (n: number) => String(Math.round(n) % 360 || 360).padStart(3, "0");

function Radio({ nombre, banda, par, recibido, onCambio }: { nombre: string; banda: "nav" | "com"; par: Par; recibido: string | null; onCambio: (p: Par) => void }) {
  const [activa, espera] = par;
  const dec = banda === "nav" ? 2 : 3;
  const [texto, setTexto] = useState<string | null>(null);
  const poner = (v: number) => onCambio([activa, ajustarFrecuencia(v, banda)]);
  const mhz = Math.floor(espera + 1e-6);
  return (
    <div className="rounded-md border border-[#1f2b3d] bg-[#05090f] p-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wide text-[#7d8da3]">{nombre}</span>
        <span className="truncate text-[11px] text-[#9fb0c6]">{recibido ?? "Sin estación"}</span>
      </div>
      <div className="flex items-center gap-2">
        <b className="font-display text-base tabular-nums text-[#3ddc84]">{activa.toFixed(dec)}</b>
        <button type="button" aria-label={`Intercambiar ${nombre}`} onClick={() => onCambio([espera, activa])} className="rounded bg-[#16233a] px-2 py-0.5 text-sm text-white active:bg-[#24365a]">⇄</button>
        <input
          aria-label={`${nombre} en espera`}
          inputMode="decimal"
          value={texto ?? espera.toFixed(dec)}
          onChange={(ev) => setTexto(ev.target.value)}
          onFocus={(ev) => ev.target.select()}
          onBlur={() => {
            const v = Number((texto ?? "").replace(",", "."));
            if (texto !== null && Number.isFinite(v) && v > 0) poner(v);
            setTexto(null);
          }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") (ev.target as HTMLInputElement).blur();
          }}
          className="w-20 rounded bg-[#0a1220] px-1 font-display text-base tabular-nums text-white outline-none focus:ring-1 focus:ring-[#4cc9f0]"
        />
      </div>
      <div className="mt-1 flex gap-1">
        <Perilla etiqueta="MHz" valor={mhz} paso={1} onCambio={(v) => poner(v + (espera - mhz))} />
        <Perilla etiqueta="kHz" valor={Math.round((espera - mhz) * 1000)} paso={banda === "nav" ? 50 : 25} onCambio={(k) => poner(mhz + (((k % 1000) + 1000) % 1000) / 1000)} />
      </div>
    </div>
  );
}

export function PanelRadios(props: {
  radios: { com1: Par; nav1: Par; nav2: Par; obs: number };
  recibido: { com1: string | null; nav1: string | null; nav2: string | null };
  onCambio: (r: Partial<{ com1: Par; nav1: Par; nav2: Par; obs: number }>) => void;
  onSyncCrs: () => void;
}) {
  const { radios, recibido, onCambio, onSyncCrs } = props;
  return (
    <div className="grid gap-1.5 rounded-lg border border-[#1f2b3d] bg-[#0a1220] p-2">
      <Radio nombre="COM1" banda="com" par={radios.com1} recibido={recibido.com1} onCambio={(com1) => onCambio({ com1 })} />
      <Radio nombre="NAV1" banda="nav" par={radios.nav1} recibido={recibido.nav1} onCambio={(nav1) => onCambio({ nav1 })} />
      <Radio nombre="NAV2" banda="nav" par={radios.nav2} recibido={recibido.nav2} onCambio={(nav2) => onCambio({ nav2 })} />
      <Perilla etiqueta="CRS" valor={radios.obs} paso={1} circular onCambio={(obs) => onCambio({ obs })} onSync={onSyncCrs} formato={tres} />
    </div>
  );
}
