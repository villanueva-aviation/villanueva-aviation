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
  const leer = useCallback(() => sim.current!, []);
  const leerEstado = useCallback(() => sim.current!.e, []);
  const accion = useCallback(
    (f: (s: Sim) => Sim) => {
      if (!sim.current) return;
      sim.current = f(sim.current);
      publicar();
    },
    [publicar],
  );
  return { sim: foto, leer, leerEstado, accion, teclas };
}
