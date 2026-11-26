// Perilla de cabina: rueda del ratón encima = ±paso, arrastre vertical = un paso cada 8 px,
// clic en el valor = sincronizar (si hay `onSync`), y botones − / + para el dedo.
import { useEffect, useRef } from "react";

export function Perilla(props: {
  valor: number;
  paso: number;
  min?: number;
  max?: number;
  circular?: boolean;
  onCambio: (v: number) => void;
  onSync?: () => void;
  etiqueta: string;
  formato?: (v: number) => string;
}) {
  const { valor, onSync, etiqueta, formato = (v) => String(v) } = props;
  const caja = useRef<HTMLDivElement>(null);
  const ultimo = useRef(props);
  useEffect(() => {
    ultimo.current = props;
  });

  const mover = (pasos: number) => {
    const p = ultimo.current;
    let v = p.valor + pasos * p.paso;
    if (p.circular) v = ((v % 360) + 360) % 360 || 360;
    else v = Math.min(p.max ?? Infinity, Math.max(p.min ?? -Infinity, v));
    v = Math.round(v * 1000) / 1000;
    // Varios clics antes del siguiente render se suman.
    ultimo.current = { ...p, valor: v };
    p.onCambio(v);
  };

  // La rueda necesita un listener no pasivo para que la página no se desplace.
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const rueda = (ev: WheelEvent) => {
      ev.preventDefault();
      mover(ev.deltaY < 0 ? 1 : -1);
    };
    el.addEventListener("wheel", rueda, { passive: false });
    return () => el.removeEventListener("wheel", rueda);
  }, []);

  const arrastre = useRef<{ y: number; pasos: number; movio: boolean } | null>(null);

  return (
    <div ref={caja} className="flex select-none items-center gap-1 rounded-md border border-[#1f2b3d] bg-[#0a1220] px-1.5 py-1" title={`${etiqueta}: rueda del ratón o arrastra hacia arriba y abajo`}>
      <button type="button" aria-label={`Bajar ${etiqueta}`} onClick={() => mover(-1)} className="h-7 w-7 rounded bg-[#16233a] text-sm font-bold text-white active:bg-[#24365a]">−</button>
      <div
        role="spinbutton"
        aria-label={etiqueta}
        aria-valuenow={valor}
        tabIndex={0}
        onKeyDown={(ev) => {
          if (ev.key === "ArrowUp") { ev.preventDefault(); ev.stopPropagation(); mover(1); }
          if (ev.key === "ArrowDown") { ev.preventDefault(); ev.stopPropagation(); mover(-1); }
        }}
        onPointerDown={(ev) => {
          (ev.target as HTMLElement).setPointerCapture(ev.pointerId);
          arrastre.current = { y: ev.clientY, pasos: 0, movio: false };
        }}
        onPointerMove={(ev) => {
          const a = arrastre.current;
          if (!a) return;
          const pasos = Math.trunc((a.y - ev.clientY) / 8);
          if (pasos !== a.pasos) {
            mover(pasos - a.pasos);
            a.pasos = pasos;
            a.movio = true;
          }
        }}
        onPointerUp={() => {
          if (arrastre.current && !arrastre.current.movio) onSync?.();
          arrastre.current = null;
        }}
        className="min-w-16 cursor-ns-resize touch-none text-center leading-tight"
      >
        <div className="text-[10px] uppercase tracking-wide text-[#7d8da3]">{etiqueta}</div>
        <div className="font-display text-sm font-bold tabular-nums text-[#4cc9f0]">{formato(valor)}</div>
      </div>
      <button type="button" aria-label={`Subir ${etiqueta}`} onClick={() => mover(1)} className="h-7 w-7 rounded bg-[#16233a] text-sm font-bold text-white active:bg-[#24365a]">+</button>
    </div>
  );
}
