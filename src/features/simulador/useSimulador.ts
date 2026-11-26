// Corre la física a 50 Hz fuera del render de React (requestAnimationFrame + paso fijo) y publica
// una foto del estado a la UI como mucho 30 veces por segundo.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { avanzar, inicio, pasosPendientes, type Sim } from "./bucle.ts";
import type { DatosPais } from "./datos.ts";
import type { Terreno } from "./terreno.ts";

export type Arranque = {
  args: Parameters<typeof inicio>;
  ajustar?: (s: Sim) => Sim; // radios, viento… del lugar elegido
  decl: number; // ponytail: declinación del VOR más cercano al inicio; recalcular si se vuela muy lejos
  respaldoFt: number; // suelo si no hay terreno
};

export function useSimulador(datos: DatosPais | null, arranque: Arranque | null, terrenoRef: { current: Terreno | null }) {
  const sim = useRef<Sim | null>(null);
  const publicado = useRef<Sim | null>(null);
  const oyentes = useRef(new Set<() => void>());
  const oyentesMuestras = useRef(new Set<(s: Sim, t: number) => void>());
  const [teclas] = useState(() => new Set<string>());

  const publicar = useCallback(() => {
    publicado.current = sim.current;
    for (const o of oyentes.current) o();
  }, []);

  useEffect(() => {
    if (!arranque || !datos) return;
    const s0 = inicio(...arranque.args);
    sim.current = arranque.ajustar ? arranque.ajustar(s0) : s0;
    publicar();
    let id = 0;
    let antes = performance.now();
    let acumulado = 0;
    let ultimoAviso = 0;
    let ultimaMuestra = -Infinity;
    const suelo = (lat: number, lon: number) => terrenoRef.current?.alturaEn(lat, lon) ?? null;
    const cuadro = (t: number) => {
      id = requestAnimationFrame(cuadro);
      // Pestaña oculta: no se acumula tiempo, así no hay salto al volver.
      if (document.hidden) {
        antes = t;
        return;
      }
      const r = pasosPendientes(acumulado, (t - antes) / 1000);
      antes = t;
      acumulado = r.resto;
      let s = sim.current!;
      for (let i = 0; i < r.pasos; i++) s = avanzar(s, teclas, datos.vors, suelo, arranque.respaldoFt, arranque.decl);
      sim.current = s;
      // Muestras para el instructor a 10 Hz, con reloj de pared: no vuelve a cero al reiniciar y en pausa
      // siguen llegando (con pausa: true), como las del lector de MSFS. Pestaña oculta: ninguna (arriba).
      if (t - ultimaMuestra >= 100) {
        ultimaMuestra = t;
        for (const o of oyentesMuestras.current) o(s, t / 1000);
      }
      if (t - ultimoAviso >= 1000 / 30) {
        ultimoAviso = t;
        publicar();
      }
    };
    id = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(id);
  }, [arranque, datos, teclas, terrenoRef, publicar]);

  const suscribir = useCallback((o: () => void) => {
    oyentes.current.add(o);
    return () => oyentes.current.delete(o);
  }, []);
  const foto = useSyncExternalStore(suscribir, () => publicado.current);
  /** Recibe el estado y el reloj (s) cada 100 ms mientras la pestaña está visible. */
  const suscribirMuestras = useCallback((o: (s: Sim, t: number) => void) => {
    oyentesMuestras.current.add(o);
    return () => {
      oyentesMuestras.current.delete(o);
    };
  }, []);
  const leer = useCallback(() => sim.current!, []);
  const leerEstado = useCallback(() => sim.current!.e, []);
  const accion = useCallback(
    // `avisar = false` para entradas muy frecuentes (ratón): el bucle publica a 30 Hz de todos modos.
    (f: (s: Sim) => Sim, avisar = true) => {
      if (!sim.current) return;
      sim.current = f(sim.current);
      if (avisar) publicar();
    },
    [publicar],
  );
  return { sim: foto, leer, leerEstado, accion, teclas, suscribirMuestras };
}
