import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import { FOUNDER_EMAIL, INTENTOS_POR_BLOQUE } from "../lib/constants";
import { ROUTES } from "../lib/routes";
import { supabase } from "../lib/supabaseClient";
import { CRITERIOS_RED, NOMBRE_PARTE, PARTES_RED, estadoBloque, intentosUsados, type EstadoBloque, type IntentoRed, type ParteRed } from "../features/rutaRed/reglas";
import {
  cancelarSinCosto,
  confirmarIntento,
  darBloqueSinPago,
  fetchTodasPruebasRed,
  marcarNoSePresento,
  marcarReembolsada,
  registrarResultado,
  type PruebaRedAdmin,
} from "../features/rutaRed/pruebasRed";

const TONO_BLOQUE: Record<EstadoBloque, "gold" | "green" | "red" | "neutral"> = {
  activa: "gold",
  aprobada: "green",
  agotada: "neutral",
  vencida: "red",
  reembolsada: "neutral",
};

const TONO_INTENTO: Record<string, "gold" | "green" | "red" | "neutral"> = {
  pendiente: "gold",
  confirmado: "green",
  realizado: "neutral",
  no_se_presento: "red",
  cancelado: "neutral",
  cancelado_tarde: "red",
};

const ETIQUETA_INTENTO: Record<string, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  realizado: "Realizado",
  no_se_presento: "No se presentó",
  cancelado: "Cancelado",
  cancelado_tarde: "Cancelado tarde",
};

const CAMPO =
  "rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-gold-500/50 disabled:opacity-50";
const BOTON = "!px-4 !py-2 text-xs";

/** Se muestra como enlace solo si es http(s); si no (p. ej. un callsign) va como texto. */
function EnlaceSeguimiento({ valor }: { valor: string }) {
  if (/^https?:\/\//i.test(valor)) {
    return (
      <a href={valor} target="_blank" rel="noopener noreferrer" className="break-all text-gold-400 underline">
        {valor}
      </a>
    );
  }
  return <span className="break-all">{valor}</span>;
}

export function AdminPruebasRed() {
  const { user, loading: authLoading } = useAuth();
  const esFundador = user?.email === FOUNDER_EMAIL;
  const [pruebas, setPruebas] = useState<PruebaRedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCarga, setErrorCarga] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  // Confirmación en la página (sin confirm()): "noshow:<id>", "cancelar:<id>" o "reembolso:<id>".
  const [confirmando, setConfirmando] = useState<string | null>(null);
  // Formulario de resultado abierto.
  const [resultadoId, setResultadoId] = useState<string | null>(null);
  const [aprobadas, setAprobadas] = useState<ParteRed[]>([]);
  const [criterio, setCriterio] = useState("");
  const [notas, setNotas] = useState("");
  // Formulario de "Dar bloque sin pago".
  const [emailRegalo, setEmailRegalo] = useState("");
  const [etapaRegalo, setEtapaRegalo] = useState<1 | 2>(1);
  const [mensajeRegalo, setMensajeRegalo] = useState<string | null>(null);

  // Si la lectura falla se muestra el error con "Reintentar", no "No hay bloques todavía".
  const recargar = useCallback(async () => {
    try {
      setPruebas(await fetchTodasPruebasRed());
      setErrorCarga(false);
    } catch {
      setErrorCarga(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading || !esFundador) return;
    fetchTodasPruebasRed().then(
      (data) => {
        setPruebas(data);
        setLoading(false);
      },
      () => {
        setErrorCarga(true);
        setLoading(false);
      },
    );
  }, [authLoading, esFundador]);

  if (authLoading) return null;
  if (!esFundador) return <Navigate to={ROUTES.home} replace />;

  /** Ejecuta una acción, muestra su error si lo hay y recarga la lista. */
  async function ejecutar(accion: () => Promise<{ error: string | null }>): Promise<boolean> {
    setOcupado(true);
    setError(null);
    const { error: mensaje } = await accion();
    setError(mensaje);
    await recargar();
    setOcupado(false);
    setConfirmando(null);
    return !mensaje;
  }

  function abrirResultado(intento: IntentoRed) {
    setResultadoId(resultadoId === intento.id ? null : intento.id);
    setAprobadas([]);
    setCriterio("");
    setNotas("");
  }

  async function guardarResultado(id: string) {
    const ok = await ejecutar(() =>
      registrarResultado(id, { aprobadas, criterio_fallado: criterio || null, notas: notas.trim() || null }),
    );
    if (ok) setResultadoId(null);
  }

  async function regalarBloque() {
    const email = emailRegalo.trim().toLowerCase();
    if (!email) return;
    setMensajeRegalo(null);
    setOcupado(true);
    setError(null);
    const { data, error: errorPerfil } = await supabase.from("profiles").select("user_id, email").eq("email", email).maybeSingle();
    if (errorPerfil || !data) {
      setError(errorPerfil?.message ?? `No hay ninguna cuenta con el correo ${email}.`);
      setOcupado(false);
      return;
    }
    const ok = await ejecutar(() => darBloqueSinPago(data.user_id as string, data.email as string, etapaRegalo));
    if (ok) {
      setMensajeRegalo(`Bloque sin pago creado para ${email}.`);
      setEmailRegalo("");
    }
  }

  const ahora = new Date();

  return (
    <div>
      <PageHero
        eyebrow="Panel del fundador"
        title="Prueba de red"
        description="Bloques de la prueba de preparación para la red: confirma intentos, registra resultados y regala bloques del paquete de asesorías."
      />

      <Container className="py-12 md:py-16">
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-sm font-medium text-white">Dar bloque sin pago</p>
          <p className="text-xs text-white/55">Para quien compró el paquete de 4 asesorías. Vence a los 30 días.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={emailRegalo}
              onChange={(e) => setEmailRegalo(e.target.value)}
              placeholder="Correo del alumno"
              className={`${CAMPO} flex-1`}
            />
            <select
              value={etapaRegalo}
              onChange={(e) => setEtapaRegalo(Number(e.target.value) === 2 ? 2 : 1)}
              className={CAMPO}
              aria-label="Etapa"
            >
              {[1, 2].map((n) => (
                <option key={n} value={n} style={{ backgroundColor: "#0b1d34" }}>
                  Etapa {n}
                </option>
              ))}
            </select>
            <Button className={BOTON} disabled={ocupado || !emailRegalo.trim()} onClick={regalarBloque}>
              Dar bloque
            </Button>
          </div>
          {mensajeRegalo && <p className="text-xs text-emerald-400">{mensajeRegalo}</p>}
        </div>

        {error && (
          <p className="mb-6 rounded-lg border border-red-500/20 bg-red-500/[0.06] p-3 text-xs text-red-300">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-white/50">Cargando...</p>
        ) : errorCarga ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-6 py-10 text-center">
            <p className="text-sm text-red-300">No se pudieron cargar los bloques.</p>
            <Button
              variant="secondary"
              className={BOTON}
              onClick={() => {
                setLoading(true);
                void recargar();
              }}
            >
              Reintentar
            </Button>
          </div>
        ) : pruebas.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
            <ClipboardList size={22} className="text-white/30" />
            <p className="text-sm text-white/55">No hay bloques todavía.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pruebas.map((p) => {
              const estado = estadoBloque(p, p.intentos, ahora);
              return (
                <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-white">{p.email || p.user_id}</p>
                        <Badge tone={TONO_BLOQUE[estado]}>{estado}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-white/55">
                        Etapa {p.etapa} · Bloque {p.bloque} · ${p.monto} USD · {intentosUsados(p.intentos)} de {INTENTOS_POR_BLOQUE} intentos usados ·
                        Vence {new Date(p.vence_at).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                    {p.estado === "activa" &&
                      (confirmando === `reembolso:${p.id}` ? (
                        <div className="flex shrink-0 items-center gap-2">
                          <Button variant="secondary" className={BOTON} onClick={() => setConfirmando(null)}>
                            Cancelar
                          </Button>
                          <Button className={BOTON} disabled={ocupado} onClick={() => ejecutar(() => marcarReembolsada(p.id))}>
                            Sí, reembolsada
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          className={`${BOTON} shrink-0`}
                          disabled={ocupado}
                          onClick={() => setConfirmando(`reembolso:${p.id}`)}
                        >
                          Marcar reembolsada
                        </Button>
                      ))}
                  </div>

                  {p.intentos.length === 0 ? (
                    <p className="text-xs text-white/40">Sin intentos agendados.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {p.intentos.map((i) => {
                        const abierto = i.estado === "pendiente" || i.estado === "confirmado";
                        return (
                          <div key={i.id} className="flex flex-col gap-2 rounded-lg bg-white/[0.03] p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm text-white">
                                Intento {i.numero} · {new Date(`${i.fecha}T00:00:00`).toLocaleDateString("es-MX")} {i.horario}
                              </p>
                              <Badge tone={TONO_INTENTO[i.estado] ?? "neutral"}>{ETIQUETA_INTENTO[i.estado] ?? i.estado}</Badge>
                            </div>
                            <p className="text-xs text-white/55">Partes: {i.partes.map((x) => NOMBRE_PARTE[x]).join(", ")}</p>
                            <p className="text-xs text-white/55">
                              Seguimiento: <EnlaceSeguimiento valor={i.enlace_seguimiento} />
                            </p>
                            {i.estado === "realizado" && (
                              <p className="text-xs text-white/55">
                                Aprobadas: {i.aprobadas.length ? i.aprobadas.map((x) => NOMBRE_PARTE[x]).join(", ") : "ninguna"}
                                {i.criterio_fallado && ` · ${i.criterio_fallado}`}
                                {i.notas && ` · ${i.notas}`}
                              </p>
                            )}

                            {abierto && (
                              <div className="flex flex-wrap gap-2">
                                {i.estado === "pendiente" && (
                                  <Button className={BOTON} disabled={ocupado} onClick={() => ejecutar(() => confirmarIntento(i.id))}>
                                    Confirmar
                                  </Button>
                                )}
                                <Button variant="secondary" className={BOTON} disabled={ocupado} onClick={() => abrirResultado(i)}>
                                  Registrar resultado
                                </Button>
                                {confirmando === `cancelar:${i.id}` ? (
                                  <>
                                    <span className="self-center text-xs text-white/70">No cuenta como intento.</span>
                                    <Button variant="secondary" className={BOTON} onClick={() => setConfirmando(null)}>
                                      No
                                    </Button>
                                    <Button className={BOTON} disabled={ocupado} onClick={() => ejecutar(() => cancelarSinCosto(i.id))}>
                                      Sí, cancelar sin costo
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    variant="secondary"
                                    className={BOTON}
                                    disabled={ocupado}
                                    onClick={() => setConfirmando(`cancelar:${i.id}`)}
                                  >
                                    Cancelar sin costo
                                  </Button>
                                )}
                                {confirmando === `noshow:${i.id}` ? (
                                  <>
                                    <Button variant="secondary" className={BOTON} onClick={() => setConfirmando(null)}>
                                      Cancelar
                                    </Button>
                                    <Button className={BOTON} disabled={ocupado} onClick={() => ejecutar(() => marcarNoSePresento(i.id))}>
                                      Sí, no se presentó
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    variant="secondary"
                                    className={BOTON}
                                    disabled={ocupado}
                                    onClick={() => setConfirmando(`noshow:${i.id}`)}
                                  >
                                    No se presentó
                                  </Button>
                                )}
                              </div>
                            )}

                            {abierto && resultadoId === i.id && (
                              <div className="flex flex-col gap-3 rounded-lg border border-white/10 p-3">
                                <fieldset className="flex flex-col gap-1">
                                  <legend className="mb-1 text-xs text-white/55">Partes aprobadas</legend>
                                  {PARTES_RED.filter((x) => i.partes.includes(x)).map((x) => (
                                    <label key={x} className="flex items-center gap-2 text-sm text-white">
                                      <input
                                        type="checkbox"
                                        checked={aprobadas.includes(x)}
                                        onChange={(e) =>
                                          setAprobadas((prev) => (e.target.checked ? [...prev, x] : prev.filter((y) => y !== x)))
                                        }
                                      />
                                      {NOMBRE_PARTE[x]}
                                    </label>
                                  ))}
                                </fieldset>
                                <select
                                  value={criterio}
                                  onChange={(e) => setCriterio(e.target.value)}
                                  className={CAMPO}
                                  aria-label="Criterio fallado"
                                >
                                  <option value="" style={{ backgroundColor: "#0b1d34" }}>
                                    Sin criterio fallado
                                  </option>
                                  {CRITERIOS_RED.map((c) => (
                                    <option key={c} value={c} style={{ backgroundColor: "#0b1d34" }}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                                <textarea
                                  value={notas}
                                  onChange={(e) => setNotas(e.target.value)}
                                  rows={2}
                                  placeholder="Notas para el alumno..."
                                  className={CAMPO}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button variant="secondary" className={BOTON} onClick={() => setResultadoId(null)}>
                                    Cancelar
                                  </Button>
                                  <Button className={BOTON} disabled={ocupado} onClick={() => guardarResultado(i.id)}>
                                    Guardar resultado
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
