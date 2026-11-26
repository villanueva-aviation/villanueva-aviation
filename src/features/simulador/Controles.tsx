// Entrada del piloto: teclado en window, ratón con Pointer Lock sobre la vista 3D y palancas táctiles.
import { useRef, useState, type ReactNode } from "react";
import type { Sim } from "./bucle.ts";
import { MANTENER, type Asignacion, type Mandos } from "./mandos.ts";
import { elegirAsignacion, useAsignacion } from "./useControles";

type Accion = (f: (s: Sim) => Sim, avisar?: boolean) => void;
const CLAVE_GUIA = "simulador-guia";

/**
 * Palanca táctil: devuelve x, y de −1 a 1 (y + = arriba). Al soltar, los ejes con `regresa` vuelven a 0
 * y los demás se quedan donde los dejaste.
 */
function Palanca({ etiqueta, valor, onCambio, regresa, onActiva }: { etiqueta: ReactNode; valor: { x: number; y: number }; onCambio: (x: number, y: number, soltar: boolean) => void; regresa: { x: boolean; y: boolean }; onActiva: (si: boolean) => void }) {
  const caja = useRef<HTMLDivElement>(null);
  const activa = useRef(false);
  // Levantar el dedo, o que el sistema cancele el toque: se suelta una sola vez.
  const soltar = () => {
    if (!activa.current) return;
    activa.current = false;
    onCambio(regresa.x ? 0 : valor.x, regresa.y ? 0 : valor.y, true);
    onActiva(false);
  };
  const leer = (ev: React.PointerEvent) => {
    const r = caja.current!.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((ev.clientX - r.left) / r.width) * 2 - 1));
    const y = Math.max(-1, Math.min(1, 1 - ((ev.clientY - r.top) / r.height) * 2));
    return { x, y };
  };
  return (
    <div
      ref={caja}
      className="relative aspect-square w-full max-w-40 touch-none select-none rounded-2xl border border-[#2b3a52] bg-[#0a1220]"
      onPointerDown={(ev) => {
        ev.currentTarget.setPointerCapture(ev.pointerId);
        activa.current = true;
        onActiva(true);
        const p = leer(ev);
        onCambio(p.x, p.y, false);
      }}
      onPointerMove={(ev) => {
        if (!ev.currentTarget.hasPointerCapture(ev.pointerId)) return;
        const p = leer(ev);
        onCambio(p.x, p.y, false);
      }}
      onPointerUp={soltar}
      onPointerCancel={soltar}
      onLostPointerCapture={soltar}
    >
      <div className="pointer-events-none absolute inset-x-1/2 inset-y-2 w-px bg-[#2b3a52]" />
      <div className="pointer-events-none absolute inset-x-2 inset-y-1/2 h-px bg-[#2b3a52]" />
      <div
        className="pointer-events-none absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#16233a]"
        style={{ left: `${((valor.x + 1) / 2) * 100}%`, top: `${((1 - valor.y) / 2) * 100}%` }}
      />
      <span className="pointer-events-none absolute bottom-1 left-2 text-[10px] text-[#7d8da3]">{etiqueta}</span>
    </div>
  );
}

/** Dos palancas: izquierda colectivo (vertical) y pedales (horizontal); derecha cíclico. */
export function PalancasTactiles({ sim, accion, teclas }: { sim: Sim; accion: Accion; teclas: Set<string> }) {
  // MANTENER mientras haya al menos un dedo en alguna palanca.
  const dedos = useRef(0);
  const activa = (si: boolean) => {
    dedos.current = Math.max(0, dedos.current + (si ? 1 : -1));
    if (dedos.current) teclas.add(MANTENER);
    else teclas.delete(MANTENER);
  };
  const m = sim.mandos;
  return (
    <div className="grid grid-cols-2 gap-4">
      <Palanca
        etiqueta="Colectivo ↕ · Pedales ↔"
        valor={{ x: m.pedales, y: m.colectivo * 2 - 1 }}
        regresa={{ x: true, y: false }}
        onActiva={activa}
        onCambio={(x, y) => accion((s) => ({ ...s, mandos: { ...s.mandos, pedales: x, colectivo: (y + 1) / 2 } }))}
      />
      <Palanca
        etiqueta="Cíclico"
        valor={{ x: m.cx, y: m.cy }}
        regresa={{ x: true, y: false }}
        onActiva={activa}
        onCambio={(x, y) => accion((s) => ({ ...s, mandos: { ...s.mandos, cx: x, cy: y } }))}
      />
    </div>
  );
}

const pct = (v: number) => `${Math.round(Math.abs(v) * 100)}%`;
const lado = (v: number, menos: string, mas: string) => (Math.abs(v) < 0.005 ? "centro" : `${v > 0 ? mas : menos} ${pct(v)}`);

/** Dónde va cada mando, para verlo mientras vuelas (también lo que mueve el piloto automático). */
export function PosicionMandos({ m }: { m: Mandos }) {
  const C = "#4cc9f0";
  return (
    <div className="grid grid-cols-[auto_auto_1fr] items-end gap-4 rounded-lg border border-[#1f2b3d] bg-[#0a1220] p-3 text-[11px] text-[#9fb0c6]" aria-label="Posición de los mandos">
      <figure className="grid justify-items-center gap-1">
        <svg viewBox="0 0 24 84" className="h-[84px] w-6" role="img" aria-label={`Colectivo ${pct(m.colectivo)}`}>
          <rect x="1" y="1" width="22" height="82" rx="3" fill="#05090f" stroke="#1f2b3d" />
          <rect x="3" y={3 + 78 * (1 - m.colectivo)} width="18" height={78 * m.colectivo} rx="2" fill={C} opacity="0.8" />
        </svg>
        <figcaption className="text-center"><b className="block text-white">{pct(m.colectivo)}</b>Colectivo</figcaption>
      </figure>
      <figure className="grid justify-items-center gap-1">
        <svg viewBox="0 0 84 84" className="h-[84px] w-[84px]" role="img" aria-label={`Cíclico ${lado(m.cy, "atrás", "adelante")}, ${lado(m.cx, "izquierda", "derecha")}`}>
          <rect x="1" y="1" width="82" height="82" rx="4" fill="#05090f" stroke="#1f2b3d" />
          <path d="M42 4V80M4 42H80" stroke="#1f2b3d" />
          <circle cx={42 + m.cx * 36} cy={42 - m.cy * 36} r="6" fill={C} />
        </svg>
        <figcaption className="text-center"><b className="block text-white">{lado(m.cy, "atrás", "adel.")}</b>Cíclico · {lado(m.cx, "izq.", "der.")}</figcaption>
      </figure>
      <figure className="grid gap-1 self-center">
        <svg viewBox="0 0 120 20" className="h-5 w-full" preserveAspectRatio="none" role="img" aria-label={`Pedales ${lado(m.pedales, "izquierda", "derecha")}`}>
          <rect x="1" y="1" width="118" height="18" rx="3" fill="#05090f" stroke="#1f2b3d" />
          <rect x={60 + Math.min(0, m.pedales) * 57} y="3" width={Math.abs(m.pedales) * 57} height="14" rx="2" fill={C} opacity="0.8" />
          <path d="M60 1V19" stroke="#7d8da3" />
        </svg>
        <figcaption><b className="text-white">{lado(m.pedales, "izq.", "der.")}</b> · Pedales</figcaption>
      </figure>
    </div>
  );
}

// Nombre de cada tecla en las dos asignaciones (ver `traducir` en mandos.ts).
const NOMBRES: Record<Asignacion, { sube: string; baja: string; adelante: string; atras: string; lados: string; pedales: string }> = {
  flechas: { sube: "Re Pág", baja: "Av Pág", adelante: "↑", atras: "↓", lados: "← / →", pedales: "Z / X" },
  wasd: { sube: "R", baja: "F", adelante: "W", atras: "S", lados: "A / D", pedales: "Q / E" },
};
const OPCIONES: { a: Asignacion; texto: string }[] = [
  { a: "flechas", texto: "Flechas y Re Pág" },
  { a: "wasd", texto: "WASD (laptop)" },
];
const mandos = (k: (typeof NOMBRES)[Asignacion]) => [
  { mando: "Colectivo", hace: "Sube o baja: más colectivo, más potencia.", teclado: `${k.sube} / ${k.baja}`, raton: "Rueda", celular: "Palanca izquierda ↕" },
  { mando: "Cíclico adelante / atrás", hace: "La velocidad: adelante baja la nariz y acelera; atrás frena.", teclado: `${k.adelante} / ${k.atras} (se queda donde lo dejas)`, raton: "Mover adelante / atrás", celular: "Palanca derecha ↕" },
  { mando: "Cíclico a los lados", hace: "Inclina y vira.", teclado: `${k.lados} (al soltar se nivela)`, raton: "Mover a los lados", celular: "Palanca derecha ↔" },
  { mando: "Pedales", hace: "Giran la nariz en estacionario y centran la bola.", teclado: k.pedales, raton: "Botón derecho + mover", celular: "Palanca izquierda ↔" },
];

/** Cómo se vuela el H135 en el simulador: mandos, primer vuelo y piloto automático. Abierta hasta que la cierras. */
export function GuiaControles() {
  const asig = useAsignacion();
  const k = NOMBRES[asig];
  const [abierta, setAbierta] = useState(() => {
    try {
      return localStorage.getItem(CLAVE_GUIA) !== "0";
    } catch {
      return true;
    }
  });
  return (
    <details
      open={abierta}
      onToggle={(ev) => {
        const si = (ev.currentTarget as HTMLDetailsElement).open;
        setAbierta(si);
        try {
          localStorage.setItem(CLAVE_GUIA, si ? "1" : "0");
        } catch {
          /* sin almacenamiento: no pasa nada */
        }
      }}
      className="rounded-lg border border-[#1f2b3d] bg-[#0a1220] p-3 text-xs text-[#c9d4e3]"
    >
      <summary className="cursor-pointer text-sm font-bold text-white">Cómo controlar el helicóptero</summary>
      <div className="mt-2 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Asignación del teclado">
        <span className="text-[#7d8da3]">Teclado:</span>
        {OPCIONES.map((o) => (
          <button
            key={o.a}
            type="button"
            role="radio"
            aria-checked={asig === o.a}
            onClick={() => elegirAsignacion(o.a)}
            className={`rounded-md border px-2.5 py-1 font-bold ${asig === o.a ? "border-[#4cc9f0] bg-[#4cc9f0]/15 text-white" : "border-[#1f2b3d] text-[#9fb0c6] hover:border-[#4cc9f0]"}`}
          >
            {o.texto}
          </button>
        ))}
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="text-[10px] uppercase tracking-wide text-[#7d8da3]">
            <tr>
              <th className="py-1 pr-2">Mando</th>
              <th className="py-1 pr-2">Qué hace</th>
              <th className="py-1 pr-2">Teclado</th>
              <th className="py-1 pr-2">Ratón</th>
              <th className="py-1">Celular</th>
            </tr>
          </thead>
          <tbody>
            {mandos(k).map((m) => (
              <tr key={m.mando} className="border-t border-[#1f2b3d] align-top">
                <td className="py-1.5 pr-2 font-bold text-white">{m.mando}</td>
                <td className="py-1.5 pr-2">{m.hace}</td>
                <td className="py-1.5 pr-2 text-[#4cc9f0]">{m.teclado}</td>
                <td className="py-1.5 pr-2 text-[#4cc9f0]">{m.raton}</td>
                <td className="py-1.5 text-[#4cc9f0]">{m.celular}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2">
        <b className="text-white">Ratón:</b> haz clic en la vista 3D para tomar el mando; Esc lo suelta. <b className="text-white">C</b> centra el cíclico. El teclado funciona siempre.
      </p>
      <h3 className="mt-3 font-bold text-white">Tu primer vuelo</h3>
      <ol className="mt-1 list-decimal space-y-0.5 pl-4">
        <li>Sube el colectivo ({k.sube}) hasta que el helicóptero despegue y suba. En Guadalajara hace falta casi tres cuartos.</li>
        <li>Empuja el cíclico ({k.adelante}) un poco: la nariz baja y acelera. Para crucero, entre 80 y 110 kt.</li>
        <li>Para nivelar, baja el colectivo ({k.baja}) poco a poco hasta que la VS marque 0.</li>
        <li>Vira con {k.lados}. Al soltar, el helicóptero vuelve a nivelarse.</li>
      </ol>
      <h3 className="mt-3 font-bold text-white">Piloto automático</h3>
      <ul className="mt-1 space-y-0.5">
        <li><b className="text-[#3ddc84]">AP</b> lo enciende. <b className="text-[#3ddc84]">HDG</b> sigue el rumbo de la perilla HDG. <b className="text-[#3ddc84]">NAV</b> sigue el curso del VOR (CRS) o del GPS; <b className="text-[#3ddc84]">APR</b> lo sigue más fino.</li>
        <li><b className="text-[#3ddc84]">ALT</b> mantiene la altitud. <b className="text-[#3ddc84]">VS</b> sube o baja al régimen de la perilla VS. <b className="text-[#3ddc84]">ALT.A</b> va a ALT SEL y ahí se nivela. <b className="text-[#3ddc84]">IAS</b> sostiene la velocidad.</li>
        <li>Si mueves un mando con el AP puesto, se desconecta ese eje y sale un aviso en ámbar.</li>
      </ul>
    </details>
  );
}
