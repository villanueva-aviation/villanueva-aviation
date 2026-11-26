// Panel del piloto automático: botones de modo y perillas de selección.
import { Perilla } from "./Perilla";
import type { Boton, EstadoAp, Selecciones } from "./piloto.ts";

const BOTONES: Boton[] = ["AP", "HDG", "NAV", "APR", "ALT", "VS", "ALTA", "IAS"];
const tres = (n: number) => String(Math.round(n) % 360 || 360).padStart(3, "0");

function estadoBoton(ap: EstadoAp, b: Boton): "on" | "armado" | "off" {
  if (!ap.ap) return "off";
  if (b === "AP") return "on";
  if (b === "IAS") return ap.ias ? "on" : "off";
  if (ap.armado === b) return "armado";
  if (ap.lat === b || ap.vert === b) return "on";
  return "off";
}

export function PanelAp(props: { ap: EstadoAp; sel: Selecciones; onPulsar: (b: Boton) => void; onSel: (s: Partial<Selecciones>) => void; onSyncHdg: () => void }) {
  const { ap, sel, onPulsar, onSel, onSyncHdg } = props;
  return (
    <div className="rounded-lg border border-[#1f2b3d] bg-[#0a1220] p-2">
      <div className="mb-1 text-[10px] uppercase tracking-wide text-[#7d8da3]">Piloto automático</div>
      <div className="grid grid-cols-4 gap-1">
        {BOTONES.map((b) => {
          const e = estadoBoton(ap, b);
          return (
            <button
              key={b}
              type="button"
              onClick={() => onPulsar(b)}
              aria-pressed={e !== "off"}
              className={`rounded border px-1 py-1.5 font-display text-xs font-bold ${
                e === "on" ? "border-[#3ddc84] text-[#3ddc84]" : e === "armado" ? "border-white text-white" : "border-[#2b3a52] text-[#9fb0c6]"
              } bg-[#05090f] active:bg-[#16233a]`}
            >
              {b === "ALTA" ? "ALT.A" : b}
            </button>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1">
        <Perilla etiqueta="HDG" valor={sel.hdg} paso={1} circular onCambio={(hdg) => onSel({ hdg })} onSync={onSyncHdg} formato={tres} />
        <Perilla etiqueta="ALT SEL" valor={sel.altSel} paso={100} min={0} max={20000} onCambio={(altSel) => onSel({ altSel })} />
        <Perilla etiqueta="VS" valor={sel.vsSel} paso={100} min={-2000} max={2000} onCambio={(vsSel) => onSel({ vsSel })} />
        <Perilla etiqueta="IAS" valor={sel.iasSel} paso={1} min={20} max={150} onCambio={(iasSel) => onSel({ iasSel })} />
      </div>
    </div>
  );
}
