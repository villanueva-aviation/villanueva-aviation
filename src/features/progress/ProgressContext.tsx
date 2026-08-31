import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ACADEMIA_MODULOS } from "../../data/academia";
import { CADETE_BASE, CERTIFICADOS_BASE, LOGROS_BASE, type Certificado, type Logro } from "../../data/cadete";
import { readStorage, writeStorage } from "../../lib/storage";

export type ModuloEstado = "bloqueado" | "disponible" | "en-progreso" | "completado";

interface QuizResult {
  score: number;
  passed: boolean;
}

interface ProgressState {
  completadas: Record<string, string[]>;
  examenes: Record<string, QuizResult>;
}

interface ModuloProgreso {
  slug: string;
  estado: ModuloEstado;
  progresoPct: number;
  completadasCount: number;
  totalActividades: number;
}

interface ProgressContextValue {
  modulos: ModuloProgreso[];
  moduloProgreso: (slug: string) => ModuloProgreso;
  isActividadCompletada: (slug: string, actividadId: string) => boolean;
  completarActividad: (slug: string, actividadId: string) => void;
  registrarExamen: (slug: string, actividadId: string, score: number, passed: boolean) => void;
  examenResultado: (slug: string) => QuizResult | null;
  progresoGeneralPct: number;
  xp: number;
  nivel: number;
  horasSimulador: number;
  moduloActualSlug: string;
  logros: Logro[];
  certificados: Certificado[];
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const STORAGE_KEY = "cadet-progress";

function estadoDeModulo(index: number, completadasCount: number, total: number, moduloAnteriorCompletado: boolean): ModuloEstado {
  if (index > 0 && !moduloAnteriorCompletado) return "bloqueado";
  if (completadasCount === 0) return "disponible";
  if (completadasCount >= total) return "completado";
  return "en-progreso";
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() =>
    readStorage(STORAGE_KEY, { completadas: {}, examenes: {} } as ProgressState),
  );

  const persist = (next: ProgressState) => {
    setState(next);
    writeStorage(STORAGE_KEY, next);
  };

  const value = useMemo<ProgressContextValue>(() => {
    let completadoAnterior = true;
    const modulos: ModuloProgreso[] = ACADEMIA_MODULOS.map((modulo, index) => {
      const completadas = state.completadas[modulo.slug] ?? [];
      const total = modulo.actividades.length;
      const estado = estadoDeModulo(index, completadas.length, total, completadoAnterior);
      completadoAnterior = estado === "completado";
      return {
        slug: modulo.slug,
        estado,
        progresoPct: total === 0 ? 0 : Math.round((completadas.length / total) * 100),
        completadasCount: completadas.length,
        totalActividades: total,
      };
    });

    const totalActividades = modulos.reduce((sum, m) => sum + m.totalActividades, 0);
    const totalCompletadas = modulos.reduce((sum, m) => sum + m.completadasCount, 0);
    const progresoGeneralPct = totalActividades === 0 ? 0 : Math.round((totalCompletadas / totalActividades) * 100);
    const xp = totalCompletadas * CADETE_BASE.xpPorActividad;
    const nivel = Math.max(1, Math.floor(xp / CADETE_BASE.xpPorNivel) + 1);

    const moduloActual = modulos.find((m) => m.estado === "en-progreso" || m.estado === "disponible") ?? modulos[modulos.length - 1];

    const meteorologiaCompletada = modulos.find((m) => m.slug === "meteorologia")?.estado === "completado";
    const comunicacionesCompletada = modulos.find((m) => m.slug === "comunicaciones")?.estado === "completado";
    const vfrCompletado = modulos.find((m) => m.slug === "vfr")?.estado === "completado";
    const algunaPerfecta = Object.values(state.examenes).some((r) => r.score === 100);

    const logros = LOGROS_BASE.map((logro) => {
      switch (logro.id) {
        case "primer-vuelo":
          return { ...logro, desbloqueado: totalCompletadas > 0 };
        case "meteorologo":
          return { ...logro, desbloqueado: meteorologiaCompletada };
        case "comunicador":
          return { ...logro, desbloqueado: comunicacionesCompletada };
        case "piloto-vfr":
          return { ...logro, desbloqueado: vfrCompletado };
        case "francotirador":
          return { ...logro, desbloqueado: algunaPerfecta };
        case "cadete-destacado":
          return { ...logro, desbloqueado: nivel >= 3 };
        default:
          return logro;
      }
    });

    const certificados: Certificado[] = CERTIFICADOS_BASE.map((cert) => {
      const modulo = modulos.find((m) => m.slug === cert.id);
      const obtenido = modulo?.estado === "completado";
      return { ...cert, obtenido, fecha: obtenido ? new Date().toLocaleDateString("es-ES") : null };
    });

    return {
      modulos,
      moduloProgreso: (slug: string) => modulos.find((m) => m.slug === slug) ?? modulos[0],
      isActividadCompletada: (slug: string, actividadId: string) =>
        (state.completadas[slug] ?? []).includes(actividadId),
      completarActividad: (slug: string, actividadId: string) => {
        const current = state.completadas[slug] ?? [];
        if (current.includes(actividadId)) return;
        persist({ ...state, completadas: { ...state.completadas, [slug]: [...current, actividadId] } });
      },
      registrarExamen: (slug: string, actividadId: string, score: number, passed: boolean) => {
        const current = state.completadas[slug] ?? [];
        const nextCompletadas = passed && !current.includes(actividadId) ? [...current, actividadId] : current;
        persist({
          ...state,
          completadas: { ...state.completadas, [slug]: nextCompletadas },
          examenes: { ...state.examenes, [slug]: { score, passed } },
        });
      },
      examenResultado: (slug: string) => state.examenes[slug] ?? null,
      progresoGeneralPct,
      xp,
      nivel,
      horasSimulador: CADETE_BASE.horasSimulador,
      moduloActualSlug: moduloActual.slug,
      logros,
      certificados,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
