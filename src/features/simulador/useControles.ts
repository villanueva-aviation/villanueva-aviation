// Teclado en window y ratón con Pointer Lock sobre la vista 3D.
import { useEffect, useState } from "react";
import type { Sim } from "./bucle.ts";
import { aplicarRaton, MANTENER } from "./mandos.ts";

const TECLAS_SIM = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "KeyZ", "KeyX", "KeyC"]);
const esCampo = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || t.getAttribute("role") === "spinbutton");

type Accion = (f: (s: Sim) => Sim) => void;

/** Teclado y ratón. `vista` es el elemento que captura el ratón al hacer clic. */
export function useControles(teclas: Set<string>, accion: Accion, vista: { current: HTMLElement | null }) {
  const [capturado, setCapturado] = useState(false);
  useEffect(() => {
    const abajo = (ev: KeyboardEvent) => {
      if (esCampo(ev.target)) return;
      if (TECLAS_SIM.has(ev.code)) {
        ev.preventDefault();
        teclas.add(ev.code);
      }
    };
    const arriba = (ev: KeyboardEvent) => teclas.delete(ev.code);
    const fuera = () => {
      for (const k of [...teclas]) if (k !== MANTENER) teclas.delete(k);
    };
    let derecho = false;
    const mover = (ev: MouseEvent) => {
      if (document.pointerLockElement !== vista.current) return;
      accion((s) => ({ ...s, mandos: aplicarRaton(s.mandos, ev.movementX, ev.movementY, 0, derecho) }));
    };
    const boton = (ev: MouseEvent) => {
      if (document.pointerLockElement !== vista.current || ev.button !== 2) return;
      derecho = ev.type === "mousedown";
      if (!derecho) accion((s) => ({ ...s, mandos: { ...s.mandos, pedales: 0 } }));
    };
    const rueda = (ev: WheelEvent) => {
      if (document.pointerLockElement !== vista.current) return;
      ev.preventDefault();
      accion((s) => ({ ...s, mandos: aplicarRaton(s.mandos, 0, 0, ev.deltaY < 0 ? 1 : -1, false) }));
    };
    const bloqueo = () => {
      const si = document.pointerLockElement === vista.current && !!vista.current;
      setCapturado(si);
      if (si) teclas.add(MANTENER);
      else teclas.delete(MANTENER);
    };
    window.addEventListener("keydown", abajo);
    window.addEventListener("keyup", arriba);
    window.addEventListener("blur", fuera);
    document.addEventListener("mousemove", mover);
    document.addEventListener("mousedown", boton);
    document.addEventListener("mouseup", boton);
    document.addEventListener("wheel", rueda, { passive: false });
    document.addEventListener("pointerlockchange", bloqueo);
    return () => {
      window.removeEventListener("keydown", abajo);
      window.removeEventListener("keyup", arriba);
      window.removeEventListener("blur", fuera);
      document.removeEventListener("mousemove", mover);
      document.removeEventListener("mousedown", boton);
      document.removeEventListener("mouseup", boton);
      document.removeEventListener("wheel", rueda);
      document.removeEventListener("pointerlockchange", bloqueo);
    };
  }, [teclas, accion, vista]);
  const capturar = () => {
    try {
      void vista.current?.requestPointerLock?.();
    } catch {
      /* el navegador no deja: se sigue con teclado */
    }
  };
  return { capturado, capturar };
}

