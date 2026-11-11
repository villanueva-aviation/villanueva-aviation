import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { DebriefingMapa } from "../features/instructor/DebriefingMapa";
import type { Idioma } from "../features/instructor/idiomaInstructor";
import { fetchIntento, fetchRecorrido } from "../features/instructor/intentos";
import { LECCIONES_GUARDADAS, type IntentoManiobra } from "../features/instructor/reglasIntentos";
import type { Grabacion } from "../features/instructor/recorrido";
import { grabacionDemo } from "../features/instructor/recorridoDemo";
import { ROUTES } from "../lib/routes";

const T = {
  es: {
    volver: "Volver al programa",
    demo: "Vuelo de demostración · Lección 4 · Virajes a rumbos",
    cargando: "Cargando el vuelo…",
    noExiste: "No encontramos ese vuelo.",
    sinRecorrido: "Este vuelo no tiene recorrido guardado.",
    error: (e: string) => `No se pudo cargar el vuelo: ${e}`,
    reintentar: "Reintentar",
    resumen: (c: number, a: boolean) => `${c}/100 · ${a ? "aprobado" : "a repetir"}`,
  },
  en: {
    volver: "Back to the program",
    demo: "Demo flight · Lesson 4 · Turns to headings",
    cargando: "Loading the flight…",
    noExiste: "We couldn't find that flight.",
    sinRecorrido: "This flight has no saved track.",
    error: (e: string) => `Couldn't load the flight: ${e}`,
    reintentar: "Try again",
    resumen: (c: number, a: boolean) => `${c}/100 · ${a ? "passed" : "to repeat"}`,
  },
};

function leerIdioma(): Idioma {
  try {
    return localStorage.getItem("instructor-idioma") === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

type Carga = { estado: "cargando" } | { estado: "error"; error: string } | { estado: "listo"; intento: IntentoManiobra | null; grabacion: Grabacion | null };

/** Un vuelo de lección guardado, con su mapa. «demo» muestra un vuelo simulado sin tocar la base. */
export function InstructorVuelo() {
  const { id = "" } = useParams();
  const [idioma] = useState<Idioma>(leerIdioma);
  const t = T[idioma];
  const demo = useMemo(() => (id === "demo" ? grabacionDemo() : null), [id]);
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" });

  const cargar = useCallback(async () => {
    if (demo) return;
    // Un id que no es uuid no existe; preguntarle a la base solo daría un error de sintaxis de Postgres.
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return setCarga({ estado: "listo", intento: null, grabacion: null });
    setCarga({ estado: "cargando" });
    try {
      const [intento, grabacion] = await Promise.all([fetchIntento(id), fetchRecorrido(id)]);
      setCarga({ estado: "listo", intento, grabacion });
    } catch (e) {
      setCarga({ estado: "error", error: e instanceof Error ? e.message : String(e) });
    }
  }, [id, demo]);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const intento = carga.estado === "listo" ? carga.intento : null;
  const grabacion = demo ?? (carga.estado === "listo" ? carga.grabacion : null);
  const titulo = demo ? t.demo : intento ? (LECCIONES_GUARDADAS[intento.maniobra] ?? intento.maniobra) : null;

  return (
    <Container className="max-w-4xl py-10">
      <Link to={ROUTES.instructorPrograma} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-gold-400">
        <ArrowLeft size={14} /> {t.volver}
      </Link>
      {titulo && (
        <header className="mt-4">
          <h1 className="font-display text-2xl font-bold text-white">{titulo}</h1>
          {intento && (
            <p className="mt-1 text-sm text-white/60">
              {new Date(intento.created_at).toLocaleString(idioma === "en" ? "en-US" : "es-MX")} · {t.resumen(intento.calificacion, intento.aprobado)}
            </p>
          )}
        </header>
      )}
      <div className="mt-6">
        {!demo && carga.estado === "cargando" && <p className="text-white/60">{t.cargando}</p>}
        {!demo && carga.estado === "error" && (
          <div className="space-y-3">
            <p className="text-red-300">{t.error(carga.error)}</p>
            <Button onClick={cargar}>{t.reintentar}</Button>
          </div>
        )}
        {!demo && carga.estado === "listo" && !intento && <p className="text-white/70">{t.noExiste}</p>}
        {!demo && carga.estado === "listo" && intento && !grabacion && <p className="text-white/70">{t.sinRecorrido}</p>}
        {grabacion && <DebriefingMapa grabacion={grabacion} idioma={idioma} />}
      </div>
    </Container>
  );
}
