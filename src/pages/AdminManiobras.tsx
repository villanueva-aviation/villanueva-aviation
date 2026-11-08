import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { CheckCircle2, ClipboardList, XCircle } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { useAuth } from "../features/auth/AuthContext";
import { defDe } from "../features/instructor/maniobras";
import { HOJA } from "../features/instructor/vistasManiobra";
import { fetchPorRevisar, fetchSesionesRecientes, revisarIntento } from "../features/instructor/intentos";
import { agruparSesiones, type ResumenSesion } from "../features/instructor/reglasIntentos";
import { ReporteExamen } from "../features/instructor/ReporteExamen";
import { FOUNDER_EMAIL } from "../lib/constants";
import { ROUTES } from "../lib/routes";

type PorRevisar = Awaited<ReturnType<typeof fetchPorRevisar>>[number];

export function AdminManiobras() {
  const { user, loading: authLoading } = useAuth();
  const [pendientes, setPendientes] = useState<PorRevisar[]>([]);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [revisando, setRevisando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sesiones, setSesiones] = useState<ResumenSesion[] | "error" | null>(null);

  useEffect(() => {
    if (authLoading || user?.email !== FOUNDER_EMAIL) return;
    fetchPorRevisar().then(
      (data) => {
        setPendientes(data);
        setEstado("listo");
      },
      () => setEstado("error"),
    );
    fetchSesionesRecientes().then(
      (data) => setSesiones(agruparSesiones(data)),
      () => setSesiones("error"),
    );
  }, [authLoading, user]);

  if (authLoading) return null;
  if (user?.email !== FOUNDER_EMAIL) return <Navigate to={ROUTES.home} replace />;

  async function revisar(id: string, aprobado: boolean) {
    setRevisando(id);
    const res = await revisarIntento(id, aprobado);
    setError(res.error);
    if (!res.error) setPendientes((prev) => prev.filter((i) => i.id !== id));
    setRevisando(null);
  }

  return (
    <div>
      <PageHero
        eyebrow="Panel del fundador"
        title="Checkrides del instructor virtual"
        description="Checkrides aprobados que los cadetes mandaron para su insignia. Revisa la hoja y el reporte antes de aprobar: la calificación la calcula el navegador del cadete."
      />
      <Container className="py-12 md:py-16">
        {error && <p className="mb-4 text-sm text-red-300">No se pudo guardar la revisión: {error}</p>}
        {estado === "cargando" ? (
          <p className="text-sm text-white/50">Cargando...</p>
        ) : estado === "error" ? (
          <p className="text-sm text-red-300">No se pudieron leer los intentos. ¿Ya corriste la migración 0022 en Supabase?</p>
        ) : pendientes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
            <ClipboardList size={22} className="text-white/30" />
            <p className="text-sm text-white/55">No hay checkrides por revisar.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pendientes.map((i) => (
              <div key={i.id} className="rounded-xl border border-gold-500/20 bg-gold-500/[0.05] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" className="text-left" onClick={() => setAbierto(abierto === i.id ? null : i.id)} aria-expanded={abierto === i.id}>
                    <p className="text-sm font-medium text-white">{defDe(i.maniobra).titulo.es} · {i.calificacion}/100</p>
                    <p className="mt-1 text-xs text-white/55">
                      {i.email ?? "sin correo"} · {new Date(i.created_at).toLocaleString("es-MX")} · {abierto === i.id ? "ocultar" : "ver reporte"}
                    </p>
                  </button>
                  <div className="flex shrink-0 gap-2">
                    <Button disabled={revisando === i.id} onClick={() => revisar(i.id, true)}>
                      <CheckCircle2 size={15} /> Aprobar insignia
                    </Button>
                    <Button variant="secondary" disabled={revisando === i.id} onClick={() => revisar(i.id, false)}>
                      <XCircle size={15} /> No aprobar
                    </Button>
                  </div>
                </div>
                {abierto === i.id && (
                  <div className="mt-4 space-y-4">
                    <HojaIntento maniobra={i.maniobra} resultado={i.detalle} />
                    <ReporteExamen
                      resultado={i.detalle}
                      intento={i}
                      nombre={i.email?.split("@")[0] ?? "Cadete"}
                      def={defDe(i.maniobra)}
                      calificado={defDe(i.maniobra).id === "recto-nivelado" ? "intento" : "checkride"}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <h2 className="mt-12 font-display text-lg font-semibold text-white">Sesiones del programa</h2>
        {sesiones === null ? (
          <p className="mt-3 text-sm text-white/50">Cargando...</p>
        ) : sesiones === "error" ? (
          <p className="mt-3 text-sm text-red-300">No se pudieron leer las sesiones. ¿Ya corriste la migración 0023 en Supabase?</p>
        ) : sesiones.length === 0 ? (
          <p className="mt-3 text-sm text-white/55">Todavía no hay sesiones desde el programa.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-white/50">
                <tr>
                  <th className="py-1.5 pr-4 font-normal">Fecha</th>
                  <th className="py-1.5 pr-4 font-normal">Cadete</th>
                  <th className="py-1.5 pr-4 font-normal">Intentos</th>
                  <th className="py-1.5 pr-4 font-normal">Checkride</th>
                  <th className="py-1.5 font-normal">Lección</th>
                </tr>
              </thead>
              <tbody>
                {sesiones.map((s) => (
                  <tr key={s.sesionId} className="border-t border-white/5 text-white/80">
                    <td className="py-1.5 pr-4 whitespace-nowrap">{new Date(s.inicio).toLocaleString("es-MX")}</td>
                    <td className="py-1.5 pr-4">{s.email ?? "sin correo"}</td>
                    <td className="py-1.5 pr-4">{s.intentos}</td>
                    <td className={`py-1.5 pr-4 ${s.checkride ? (s.checkride.aprobado ? "text-emerald-300" : "text-red-300") : "text-white/40"}`}>
                      {s.checkride ? `${s.checkride.calificacion}/100 · ${s.checkride.aprobado ? "aprobado" : "no aprobado"}` : "—"}
                    </td>
                    <td className={`py-1.5 ${!s.leccion ? "text-white/40" : s.leccion.modo === "practica" ? "" : s.leccion.aprobado ? "text-emerald-300" : "text-red-300"}`}>
                      {s.leccion
                        ? `${s.leccion.nombre} · ${s.leccion.calificacion}/100 · ${s.leccion.modo === "practica" ? "práctica" : s.leccion.aprobado ? "aprobado" : "no aprobado"}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </div>
  );
}

/** La hoja de la maniobra de ese intento. */
function HojaIntento({ maniobra, resultado }: { maniobra: string; resultado: unknown }) {
  const Hoja = HOJA[defDe(maniobra).id];
  return <Hoja resultado={resultado} idioma="es" />;
}
