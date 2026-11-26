// Entrada del piloto: teclado en window, ratón con Pointer Lock sobre la vista 3D y palancas táctiles.
import { useRef, type ReactNode } from "react";
import type { Sim } from "./bucle.ts";
import { MANTENER } from "./mandos.ts";

type Accion = (f: (s: Sim) => Sim) => void;

/**
 * Palanca táctil: devuelve x, y de −1 a 1 (y + = arriba). Al soltar, los ejes con `regresa` vuelven a 0
 * y los demás se quedan donde los dejaste.
 */
function Palanca({ etiqueta, valor, onCambio, regresa, onActiva }: { etiqueta: ReactNode; valor: { x: number; y: number }; onCambio: (x: number, y: number, soltar: boolean) => void; regresa: { x: boolean; y: boolean }; onActiva: (si: boolean) => void }) {
  const caja = useRef<HTMLDivElement>(null);
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
        onActiva(true);
        const p = leer(ev);
        onCambio(p.x, p.y, false);
      }}
      onPointerMove={(ev) => {
        if (!ev.currentTarget.hasPointerCapture(ev.pointerId)) return;
        const p = leer(ev);
        onCambio(p.x, p.y, false);
      }}
      onPointerUp={() => {
        onCambio(regresa.x ? 0 : valor.x, regresa.y ? 0 : valor.y, true);
        onActiva(false);
      }}
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
  const activa = (si: boolean) => (si ? teclas.add(MANTENER) : teclas.delete(MANTENER));
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

export function AyudaTeclas() {
  return (
    <details className="rounded-lg border border-[#1f2b3d] bg-[#0a1220] p-2 text-xs text-[#c9d4e3]">
      <summary className="cursor-pointer font-bold text-white">Controles</summary>
      <ul className="mt-1 grid gap-0.5">
        <li><b>Teclado:</b> flechas = cíclico (adelante/atrás se queda puesto), Re Pág / Av Pág = colectivo, Z / X = pedales, C = centrar el cíclico.</li>
        <li><b>Ratón:</b> clic en la vista 3D para tomar el mando. Mover = cíclico, rueda = colectivo, botón derecho + mover = pedales. Esc suelta el ratón.</li>
        <li><b>Celular:</b> palanca izquierda = colectivo (arriba y abajo) y pedales (a los lados); derecha = cíclico.</li>
        <li><b>Piloto automático:</b> mover un mando desconecta ese eje y avisa en ámbar.</li>
      </ul>
    </details>
  );
}
