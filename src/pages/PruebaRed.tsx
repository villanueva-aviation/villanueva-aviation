import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Award, CalendarClock } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { PayPalButton } from "../features/payments/PayPalButton";
import { useProgress } from "../features/progress/ProgressContext";
import { LECCIONES_RED, SLUG_RUTA_RED } from "../data/rutaRed";
import {
  CRITERIOS_RED,
  NOMBRE_PARTE,
  PARTES_RED,
  REGLAS_PRUEBA_RED,
  antesDeVencer,
  cancelacionTardia,
  citaPasada,
  estadoBloque,
  insigniaGanada,
  intentosUsados,
  partesAprobadas,
  partesDelSiguienteIntento,
  partesPendientes,
  precioSiguienteBloque,
  puedeAgendar,
  type EstadoIntento,
  type IntentoRed,
  type PruebaRed as Prueba,
} from "../features/rutaRed/reglas";
import { agendarIntento, cancelarIntento, fetchMisIntentos, fetchMisPruebas } from "../features/rutaRed/pruebasRed";
import { fechaMinima, horariosDisponibles } from "../lib/agendaSlots";
import {
  DIAS_VIGENCIA_PRUEBA,
  HORAS_CANCELACION,
  INTENTOS_POR_BLOQUE,
  PRECIO_PRUEBA_RED_REPETICION,
} from "../lib/constants";
import { ROUTES } from "../lib/routes";
import { fuenteGuardadaRuta } from "../features/rutaRed/fuente";

const ETAPA = 1;

const ESTADO_INTENTO: Record<EstadoIntento, { texto: string; tone: "gold" | "green" | "red" | "neutral" }> = {
  pendiente: { texto: "Por confirmar", tone: "gold" },
  confirmado: { texto: "Confirmado", tone: "green" },
  realizado: { texto: "Realizado", tone: "neutral" },
  no_se_presento: { texto: "No te presentaste", tone: "red" },
  cancelado: { texto: "Cancelado", tone: "neutral" },
  cancelado_tarde: { texto: "Cancelado tarde", tone: "red" },
};

/** Fecha "YYYY-MM-DD" en hora de México (UTC-6 fijo, igual que cancelacionTardia). */
const fechaMexico = (iso: string) => new Date(new Date(iso).getTime() - 6 * 3600_000).toISOString().slice(0, 10);

const fechaLarga = (fecha: string) =>
  new Date(`${fecha}T12:00:00-06:00`).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Mexico_City",
  });

const etiquetaHorario = (fecha: string, horario: string) =>
  horariosDisponibles(fecha).find((h) => h.value === horario)?.label ?? horario;

const campo =
  "rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-white outline-none transition-colors focus:border-gold-500/50 disabled:cursor-not-allowed disabled:opacity-50";
const opcion = { backgroundColor: "#0b1d34", color: "#fff" };

export function PruebaRed() {
  const { isActividadCompletada } = useProgress();
  const [pruebas, setPruebas] = useState<Prueba[] | null>(null);
  const [intentos, setIntentos] = useState<IntentoRed[]>([]);
  const [falloCarga, setFalloCarga] = useState(false);

  // Si la lectura falla no se muestra nada del bloque: un "sin bloque" falso pondría el botón de pago
  // a alguien con un bloque activo, y PayPal cobra antes de que el servidor lo rechace.
  const cargar = () =>
    Promise.all([fetchMisPruebas(ETAPA), fetchMisIntentos(ETAPA)]).then(
      ([p, i]) => {
        setIntentos(i);
        setPruebas(p);
        setFalloCarga(false);
      },
      () => setFalloCarga(true),
    );

  function reintentar() {
    setFalloCarga(false);
    setPruebas(null);
    void cargar();
  }

  useEffect(() => {
    void cargar();
  }, []);

  const ahora = new Date();
  const ganada = insigniaGanada(intentos);
  const siguienteLeccion = LECCIONES_RED.find((l) => !isActividadCompletada(SLUG_RUTA_RED, l.id));
  const precio = pruebas ? precioSiguienteBloque(pruebas, intentos, ahora) : null;
  // fetchMisPruebas ordena por bloque, así que el último vigente es el bloque actual.
  const ultimo = pruebas?.filter((p) => p.estado !== "reembolsada").at(-1);
  const intentosDe = (p: Prueba) => intentos.filter((i) => i.prueba_id === p.id);
  const bloqueActivo = pruebas && !ganada && precio === null ? ultimo : undefined;
  const bloquePorId = new Map((pruebas ?? []).map((p) => [p.id, p.bloque]));

  return (
    <div>
      <PageHero
        eyebrow="Listo para volar en red · Etapa 1 (español)"
        title="Tu prueba final"
        description="Paga tu bloque de intentos, agenda tu vuelo MMGL → MMMX con Erik como controlador y revisa aquí tus resultados."
      >
        <Link
          to={ROUTES.rutaRed}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400"
        >
          <ArrowLeft size={15} />
          Volver a la ruta
        </Link>
      </PageHero>

      <Container className="flex flex-col gap-8 py-12 md:py-16">
        {falloCarga ? (
          <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/[0.06] p-5">
            <p className="text-sm text-white/80">No pudimos cargar tu prueba. Revisa tu conexión e intenta de nuevo.</p>
            <Button variant="secondary" className="mt-3" onClick={reintentar}>
              Reintentar
            </Button>
          </div>
        ) : pruebas === null ? (
          <p className="text-sm text-white/50">Cargando tu prueba…</p>
        ) : (
          <>
            {!ganada && siguienteLeccion && (
              <div className="rounded-2xl border border-gold-500/30 bg-gold-500/[0.06] p-5">
                <p className="text-sm leading-relaxed text-white/75">
                  Te recomendamos terminar las {LECCIONES_RED.length} lecciones antes de la prueba. La siguiente
                  pendiente es la lección {siguienteLeccion.numero}: <span className="font-semibold text-white">{siguienteLeccion.titulo}</span>.
                </p>
                <Link
                  to={ROUTES.rutaRedLeccion(siguienteLeccion.id)}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gold-400 hover:text-gold-300"
                >
                  Ir a la lección {siguienteLeccion.numero} <ArrowRight size={15} />
                </Link>
              </div>
            )}

            {ganada ? (
              <TarjetaInsignia />
            ) : (
              <>
                <Reglas />
                {precio !== null && (
                  <section className="rounded-2xl border border-gold-500/40 bg-gold-500/[0.07] p-6">
                    {ultimo && (
                      <p className="mb-3 text-sm leading-relaxed text-white/70">
                        Tu bloque anterior{" "}
                        {estadoBloque(ultimo, intentosDe(ultimo), ahora) === "vencida" ? "venció" : "se agotó"} sin que
                        aprobaras las 4 partes. El siguiente bloque cuesta ${PRECIO_PRUEBA_RED_REPETICION} USD y solo repites
                        las partes pendientes.
                      </p>
                    )}
                    <p className="font-display text-4xl font-bold text-white tabular-nums">
                      ${precio} <span className="text-base font-semibold text-white/50">USD</span>
                    </p>
                    <p className="mt-2 text-sm text-white/70">
                      {INTENTOS_POR_BLOQUE} intentos, válidos {DIAS_VIGENCIA_PRUEBA} días desde el pago.
                    </p>
                    <div className="mt-5 max-w-sm">
                      <PayPalButton
                        monto={precio}
                        funcion="verify-paypal-prueba-red"
                        cuerpo={{ etapa: ETAPA, fuente: fuenteGuardadaRuta() }}
                        descripcion={`Prueba Listo para volar en red · Etapa 1 (${INTENTOS_POR_BLOQUE} intentos)`}
                        onSuccess={cargar}
                      />
                    </div>
                  </section>
                )}
                {bloqueActivo && (
                  <BloqueActivo
                    bloque={bloqueActivo}
                    intentosBloque={intentosDe(bloqueActivo)}
                    intentosEtapa={intentos}
                    ahora={ahora}
                    onCambio={cargar}
                  />
                )}
              </>
            )}

            <section>
              <h2 className="font-display text-lg font-semibold text-white">Tus intentos</h2>
              <div className="mt-4 flex flex-col gap-3">
                {intentos.length === 0 && <p className="text-sm text-white/45">Aún no has agendado ningún intento.</p>}
                {[...intentos].reverse().map((i) => (
                  <TarjetaIntento key={i.id} intento={i} bloque={bloquePorId.get(i.prueba_id)} ahora={ahora} onCambio={cargar} />
                ))}
              </div>
            </section>
          </>
        )}
      </Container>
    </div>
  );
}

function Reglas() {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="font-display text-sm font-semibold text-white">Las 4 partes</p>
        <ol className="mt-3 flex flex-col gap-1.5 text-sm text-white/75">
          {PARTES_RED.map((p, i) => (
            <li key={p} className="flex gap-3">
              <span className="font-mono font-semibold tabular-nums text-gold-400">{i + 1}</span>
              {NOMBRE_PARTE[p]}
            </li>
          ))}
        </ol>
        <p className="mt-5 font-display text-sm font-semibold text-white">No apruebas una parte si</p>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm text-white/75">
          {CRITERIOS_RED.map((c) => (
            <li key={c} className="flex gap-2">
              <span aria-hidden="true" className="text-gold-400">
                ·
              </span>
              {c}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="font-display text-sm font-semibold text-white">Reglas</p>
        <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-white/70">
          <li>El primer intento es el vuelo completo (unas 2 h). Los siguientes repiten solo las partes pendientes (20 a 30 min).</li>
          {REGLAS_PRUEBA_RED.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TarjetaInsignia() {
  return (
    <section className="rounded-2xl border border-gold-500/40 bg-gold-500/[0.07] p-6 md:p-8">
      <Award size={32} className="text-gold-400" aria-hidden="true" />
      <p className="mt-3 font-display text-2xl font-bold text-white">Listo para volar en red · Etapa 1 (español)</p>
      <p className="mt-2 text-sm leading-relaxed text-white/70">
        Aprobaste las 4 partes de la prueba. La insignia ya aparece en tu perfil.
      </p>
      <p className="mt-4 text-xs leading-relaxed text-white/50">
        La insignia es de Villanueva Aviation y no es una evaluación oficial de IVAO, VATSIM ni la AFAC.
      </p>
    </section>
  );
}

function ListaPartes({ titulo, partes }: { titulo: string; partes: IntentoRed["partes"] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/50">{titulo}</p>
      <p className="mt-1 text-sm text-white/80">{partes.length ? partes.map((p) => NOMBRE_PARTE[p]).join(", ") : "Ninguna"}</p>
    </div>
  );
}

function BloqueActivo({
  bloque,
  intentosBloque,
  intentosEtapa,
  ahora,
  onCambio,
}: {
  bloque: Prueba;
  intentosBloque: IntentoRed[];
  intentosEtapa: IntentoRed[];
  ahora: Date;
  onCambio: () => void;
}) {
  const restantes = INTENTOS_POR_BLOQUE - intentosUsados(intentosBloque);
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-white">Bloque {bloque.bloque}</h2>
        <p className="text-sm text-white/60">Vence el {fechaLarga(fechaMexico(bloque.vence_at))}</p>
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-gold-400 tabular-nums">
        {restantes} <span className="text-base font-semibold text-white/60">de {INTENTOS_POR_BLOQUE} intentos restantes</span>
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <ListaPartes titulo="Partes aprobadas" partes={partesAprobadas(intentosEtapa)} />
        <ListaPartes titulo="Partes pendientes" partes={partesPendientes(intentosEtapa)} />
      </div>
      <div className="mt-6 border-t border-white/10 pt-6">
        {puedeAgendar(bloque, intentosBloque, intentosEtapa, ahora) ? (
          <FormularioAgenda
            bloque={bloque}
            numero={intentosBloque.length + 1}
            partes={partesDelSiguienteIntento(intentosEtapa)}
            onAgendado={onCambio}
          />
        ) : (
          <p className="text-sm text-white/65">
            Ya tienes un intento agendado. Cuando se realice o lo canceles, podrás agendar el siguiente.
          </p>
        )}
      </div>
    </section>
  );
}

function FormularioAgenda({
  bloque,
  numero,
  partes,
  onAgendado,
}: {
  bloque: Prueba;
  numero: number;
  partes: IntentoRed["partes"];
  onAgendado: () => void;
}) {
  const [fecha, setFecha] = useState("");
  const [horario, setHorario] = useState("");
  const [enlace, setEnlace] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const minFecha = fechaMinima();
  const maxFecha = fechaMexico(bloque.vence_at);
  // El último día solo valen los horarios antes de que venza el bloque (el trigger de la base revisa lo mismo).
  const slots = horariosDisponibles(fecha).filter((s) => antesDeVencer(fecha, s.value, bloque));

  if (maxFecha < minFecha) {
    return (
      <p className="text-sm text-white/70">
        Tu bloque vence antes de la siguiente fecha disponible; escríbenos para reprogramar.
      </p>
    );
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const enlaceLimpio = enlace.trim();
    if (!fecha || fecha < minFecha || fecha > maxFecha) {
      return setError(`Elige una fecha entre el ${fechaLarga(minFecha)} y el ${fechaLarga(maxFecha)}.`);
    }
    if (!slots.some((s) => s.value === horario)) return setError("Elige un horario disponible para esa fecha.");
    if (!enlaceLimpio) return setError("Escribe tu callsign de IVAO o VATSIM, o tu enlace de Volanta.");
    if (enlaceLimpio.length > 300) return setError("El callsign o enlace no puede pasar de 300 caracteres.");

    setEnviando(true);
    setError(null);
    const { error: err } = await agendarIntento({
      pruebaId: bloque.id,
      numero,
      fecha,
      horario,
      partes,
      enlaceSeguimiento: enlaceLimpio,
    });
    // Si salió bien, el botón queda deshabilitado mientras la página recarga y quita el formulario.
    if (err) {
      setEnviando(false);
      return setError(err);
    }
    onAgendado();
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <h3 className="font-display text-base font-semibold text-white">Agenda tu intento</h3>
      <ListaPartes titulo="Partes de este intento" partes={partes} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-white/70">
          Fecha
          <input
            type="date"
            value={fecha}
            min={minFecha}
            max={maxFecha}
            onChange={(e) => {
              setFecha(e.target.value);
              setHorario("");
            }}
            className={campo}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-white/70">
          Horario (hora de México)
          <select value={horario} onChange={(e) => setHorario(e.target.value)} disabled={!fecha} className={campo}>
            <option value="" style={opcion}>
              {!fecha ? "Elige primero una fecha" : slots.length ? "Elige un horario" : "No hay horarios ese día"}
            </option>
            {slots.map((s) => (
              <option key={s.value} value={s.value} style={opcion}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="-mt-2 text-xs text-white/45">
        Puedes agendar del {fechaLarga(minFecha)} al {fechaLarga(maxFecha)}.
      </p>
      <label className="flex flex-col gap-1.5 text-sm text-white/70">
        Callsign de IVAO o VATSIM, o enlace de Volanta
        <input
          value={enlace}
          onChange={(e) => setEnlace(e.target.value)}
          maxLength={300}
          required
          placeholder="Ej. VNA101 o https://volanta.app/…"
          className={campo}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={enviando}>
        <CalendarClock size={16} /> {enviando ? "Agendando..." : "Agendar intento"}
      </Button>
    </form>
  );
}

function TarjetaIntento({
  intento,
  bloque,
  ahora,
  onCambio,
}: {
  intento: IntentoRed;
  bloque?: number;
  ahora: Date;
  onCambio: () => void;
}) {
  // null = sin confirmación abierta; si no, si la cancelación es tardía al momento de pulsar "Cancelar".
  const [tardia, setTardia] = useState<boolean | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const estado = ESTADO_INTENTO[intento.estado];
  const abierto = intento.estado === "pendiente" || intento.estado === "confirmado";
  // Ya pasó la hora de la cita: no se cancela, Erik la califica.
  const porCalificar = abierto && citaPasada(intento.fecha, intento.horario, ahora);
  const cancelable = abierto && !porCalificar;
  const confirmando = tardia !== null;
  const esTardia = () => cancelacionTardia(intento.fecha, intento.horario, new Date());

  async function cancelar() {
    // Si cruzó las 24 h con el aviso abierto, se actualiza el aviso y se pide confirmar otra vez.
    if (esTardia() !== tardia) return setTardia(esTardia());
    // Si llegó la hora de la cita con el aviso abierto, se recarga y queda "Pendiente de calificación".
    if (citaPasada(intento.fecha, intento.horario, new Date())) {
      setTardia(null);
      return onCambio();
    }
    setCancelando(true);
    setError(null);
    const { error: err } = await cancelarIntento(intento, new Date());
    setCancelando(false);
    if (err) return setError(err);
    setTardia(null);
    onCambio();
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-white">
          {bloque ? `Bloque ${bloque} · ` : ""}Intento {intento.numero}
        </span>
        <Badge tone={estado.tone}>{estado.texto}</Badge>
      </div>
      <p className="mt-1.5 text-xs text-white/55">
        {fechaLarga(intento.fecha)} · {etiquetaHorario(intento.fecha, intento.horario)} (hora de México) ·{" "}
        {intento.enlace_seguimiento}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <ListaPartes titulo="Partes" partes={intento.partes} />
        {intento.estado === "realizado" && <ListaPartes titulo="Aprobadas" partes={intento.aprobadas} />}
      </div>
      {intento.criterio_fallado && (
        <p className="mt-3 text-sm text-white/75">
          <span className="font-semibold text-white">Criterio no cumplido:</span> {intento.criterio_fallado}
        </p>
      )}
      {intento.notas && (
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          <span className="font-semibold text-white">Notas de Erik:</span> {intento.notas}
        </p>
      )}
      {porCalificar && <p className="mt-3 text-sm text-white/60">Pendiente de calificación</p>}
      {cancelable && !confirmando && (
        <button
          type="button"
          onClick={() => setTardia(esTardia())}
          className="mt-3 text-sm font-medium text-white/60 underline-offset-4 hover:text-red-400 hover:underline"
        >
          Cancelar
        </button>
      )}
      {cancelable && confirmando && (
        <div role="alert" className="mt-3 rounded-lg border border-red-500/30 bg-red-500/[0.06] p-3">
          <p className="text-sm leading-relaxed text-white/80">
            {tardia
              ? `Faltan menos de ${HORAS_CANCELACION} horas: si cancelas ahora, este intento se cuenta como usado.`
              : `Faltan más de ${HORAS_CANCELACION} horas: puedes cancelar sin perder el intento.`}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={cancelar}
              disabled={cancelando}
              className="rounded-full border border-red-500/40 px-4 py-1.5 text-sm font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50"
            >
              {cancelando ? "Cancelando..." : "Sí, cancelar"}
            </button>
            <button
              type="button"
              onClick={() => setTardia(null)}
              disabled={cancelando}
              className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-white/70 hover:text-white"
            >
              No, conservarlo
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
