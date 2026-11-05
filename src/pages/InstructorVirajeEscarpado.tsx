import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Download, Volume2, VolumeX } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { useAuth } from "../features/auth/AuthContext";
import { TOLERANCIA, type Campo } from "../features/instructor/evaluador";
import { Explicacion } from "../features/instructor/ExplicacionInstructor";
import { Grafica } from "../features/instructor/Grafica";
import { HojaCheckride } from "../features/instructor/HojaCheckride";
import { Progreso } from "../features/instructor/Progreso";
import { puedeMandar } from "../features/instructor/reglasIntentos";
import { ReporteExamen } from "../features/instructor/ReporteExamen";
import { useIntentoViraje } from "../features/instructor/useIntentoViraje";
import { ALTURA_SEGURA_AGL } from "../features/instructor/virajeEscarpado";
import { avisoVoz, textoEspera } from "../features/instructor/voz";
import { ROUTES } from "../lib/routes";

const CLAVE_SONIDO = "instructor-sonido";

const INSTRUCCION: Record<string, string> = {
  armado: "Haz tus virajes de limpieza y entra a 45°.",
  viraje1: "Sostén 45°, la altitud y la velocidad. Nivela en tu rumbo de entrada.",
  entre: "Ahora al lado contrario.",
  viraje2: "Sostén 45° y nivela en tu rumbo de entrada.",
};

const GRAFICAS: { campo: Campo; nombre: string; unidad: string }[] = [
  { campo: "altitud", nombre: "Altitud", unidad: "ft" },
  { campo: "velocidad", nombre: "Velocidad", unidad: "kt" },
  { campo: "inclinacion", nombre: "Inclinación (contra 45°)", unidad: "°" },
  { campo: "bola", nombre: "Bola", unidad: "" },
];

function leerSonido(): boolean {
  try {
    return localStorage.getItem(CLAVE_SONIDO) !== "no";
  } catch {
    return true;
  }
}

let audio: AudioContext | null = null;
function pitido() {
  try {
    audio ??= new AudioContext();
    const osc = audio.createOscillator();
    const vol = audio.createGain();
    osc.frequency.value = 440;
    vol.gain.value = 0.15;
    osc.connect(vol).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.15);
  } catch {
    // Sin audio no pasa nada: el aviso se ve en pantalla.
  }
}

function Banner({ estado }: { estado: "sin-lector" | "sin-simulador" | "conectado" }) {
  if (estado === "conectado") {
    return <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Conectado: el instructor está leyendo tu avión.</p>;
  }
  if (estado === "sin-simulador") {
    return <p className="rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm text-gold-200">Abre MSFS 2020 y entra a un vuelo con el C172.</p>;
  }
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80">
      <p>
        No encuentro el lector en tu PC. Descárgalo gratis en{" "}
        <Link to={ROUTES.descargas} className="font-semibold text-gold-400 underline underline-offset-2">Descargas</Link>, ábrelo y deja su ventana abierta.
      </p>
      <p className="mt-1 text-white/55">La primera vez, Chrome o Edge te preguntan si la página puede tener acceso a la red local: da clic en Permitir.</p>
    </div>
  );
}

export function InstructorVirajeEscarpado() {
  const { user } = useAuth();
  const {
    estado, muestra, modo, cambiarModo, modoIntento, ev, resultado, series, anulado, bajo, enCurso,
    iniciar, guardado, guardar, intento, numero, intentos, mandar, envio, aprobadoPorErik,
  } = useIntentoViraje();
  const [sonido, setSonido] = useState(leerSonido);
  const ultimoPitido = useRef(0);

  // La página solo avisa cuando ya se salió de la tolerancia, en Práctica; el aviso previo es del programa con voz.
  const previo = modoIntento === "practica" ? avisoVoz(ev, muestra, "practica") : null;
  const aviso = previo?.nivel === "rojo" ? previo.texto : null;
  useEffect(() => {
    if (!aviso || !sonido) return;
    const ahora = Date.now();
    if (ahora - ultimoPitido.current >= 1000) {
      ultimoPitido.current = ahora;
      pitido();
    }
  }, [aviso, muestra, sonido]);

  const cambiarSonido = () => {
    const nuevo = !sonido;
    setSonido(nuevo);
    try {
      localStorage.setItem(CLAVE_SONIDO, nuevo ? "si" : "no");
    } catch {
      // Sin localStorage se queda solo en esta visita.
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="Gratis · Con tu cuenta · C172"
        title="Instructor virtual: viraje escarpado"
        description="Vuela dos virajes de 360° a 45° en tu simulador y el instructor te califica con las tolerancias de un checkride: altitud ±100 ft, velocidad ±10 kt, inclinación ±5° y rumbo de salida ±10°."
      />
      <Container className="space-y-8 py-12">
        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["1. Abre el lector", "Un programa chico que lee tu avión en MSFS 2020. Solo funciona dentro de tu PC."],
            [
              "2. Sube a 1,500 ft sobre el terreno",
              "No sobre el mar: en MMGL son unos 6,500 ft en el altímetro. Recto y nivelado, a no más de Va. Escoge Práctica o Checkride: el instructor empieza solo.",
            ],
            ["3. Vuela", "Virajes de limpieza, 360° a un lado y 360° al otro. Puedes tener MSFS en pantalla completa: deja abierta la ventana del lector."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-white/10 bg-navy-900/60 p-4">
              <h2 className="font-display font-bold text-white">{t}</h2>
              <p className="mt-1 text-sm text-white/65">{d}</p>
            </div>
          ))}
        </section>

        <Banner estado={estado} />

        <section className="rounded-xl border border-white/10 bg-navy-900/60 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div role="radiogroup" aria-label="Modo" className="inline-flex rounded-full border border-white/15 p-1">
              {(["practica", "checkride"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={modo === m}
                  disabled={enCurso && ev?.fase !== "armado"}
                  onClick={() => cambiarModo(m)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${modo === m ? "bg-gold-500 text-navy-950" : "text-white/70"}`}
                >
                  {m === "practica" ? "Práctica" : "Checkride"}
                </button>
              ))}
            </div>
            {ev && ev.fase !== "invalido" && (
              <Button onClick={iniciar} disabled={estado !== "conectado"}>
                {resultado ? "Otro intento" : "Volver a armar"}
              </Button>
            )}
            {modo === "practica" && (
              <button type="button" onClick={cambiarSonido} className="inline-flex items-center gap-1.5 text-sm text-white/70" aria-pressed={sonido}>
                {sonido ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />} Sonido
              </button>
            )}
          </div>
          <p className="mt-3 text-sm text-white/55">
            {modo === "practica"
              ? "Práctica: te avisa en vivo cuando te sales de una tolerancia."
              : "Checkride: no te avisa nada hasta el final, como en el examen. Si apruebas, lo puedes mandar a revisión para tu insignia."}
          </p>

          {!ev && estado === "conectado" && (
            <p className="mt-5 rounded-lg bg-navy-950/60 p-4 font-display text-lg font-bold text-white" aria-live="polite">
              {textoEspera(muestra)}
            </p>
          )}
          {anulado && ev?.fase === "armado" && (
            <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              El intento anterior no se calificó: {anulado} Ya empezó otro.
            </p>
          )}
          {enCurso && ev && (
            <div className="mt-5 rounded-lg bg-navy-950/60 p-4" aria-live="polite">
              {modoIntento === "checkride" ? (
                <p className="font-display text-xl font-bold text-white">Checkride en curso</p>
              ) : (
                <>
                  {!bajo && <p className="font-display text-xl font-bold text-white">{INSTRUCCION[ev.fase]}</p>}
                  {aviso && (
                    <p className="mt-3 flex items-center gap-2 font-display text-2xl font-bold text-red-300">
                      <AlertTriangle className="h-6 w-6 shrink-0" /> {aviso}
                    </p>
                  )}
                </>
              )}
              {bajo && muestra && (
                <p className={modoIntento === "checkride" ? "mt-2 text-white/70" : "font-display text-xl font-bold text-white"}>
                  Vas a {Math.round(muestra.agl).toLocaleString("es-MX")} ft sobre el terreno: sube a {ALTURA_SEGURA_AGL.toLocaleString("es-MX")} o más antes de los virajes.
                </p>
              )}
            </div>
          )}
          {ev?.fase === "invalido" && (
            <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              Intento sin calificar: {ev.motivo} Empieza otro solo en cuanto vueles nivelado.
            </p>
          )}
        </section>

        {resultado && (
          <div className="space-y-6">
            <HojaCheckride resultado={resultado} />
            <Explicacion resultado={resultado} />
            {series.map((s, k) => (
              <section key={k}>
                <h3 className="mb-3 font-display text-lg font-bold text-white">
                  Viraje {resultado.lados[k].lado === "izquierda" ? "izquierdo" : "derecho"}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {GRAFICAS.map((g) => (
                    <Grafica key={g.campo} puntos={s[g.campo]} tol={TOLERANCIA[g.campo]} titulo={g.nombre} unidad={g.unidad} />
                  ))}
                </div>
              </section>
            ))}
            <ReporteExamen resultado={resultado} intento={intento} nombre={user?.nombre ?? "Cadete"} numero={numero} />
            <div className="text-center text-sm">
              {guardado.guardando && <p className="text-white/60">Guardando tu intento…</p>}
              {guardado.error && (
                <div className="space-y-2">
                  <p className="text-red-300">No se pudo guardar: {guardado.error}</p>
                  <Button variant="secondary" onClick={() => guardar(resultado, modoIntento)}>Reintentar guardar</Button>
                </div>
              )}
              {intento?.revision === "mandado" ? (
                <p className="text-emerald-300">Mandado. Erik lo revisa para tu insignia.</p>
              ) : (
                intento && puedeMandar(intento) && <Button onClick={mandar}>Mandar a revisión</Button>
              )}
              {envio && <p className="mt-2 text-red-300">{envio}</p>}
            </div>
          </div>
        )}

        <Progreso intentos={intentos} />

        {!resultado && aprobadoPorErik && (
          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-white">Tu checkride aprobado</h2>
            <ReporteExamen
              resultado={aprobadoPorErik}
              intento={aprobadoPorErik}
              nombre={user?.nombre ?? "Cadete"}
              numero={intentos.indexOf(aprobadoPorErik) + 1}
            />
          </section>
        )}

        <p className="text-center text-sm text-white/50">
          <Download className="mr-1 inline h-4 w-4" />
          ¿No tienes el lector? <Link to={ROUTES.descargas} className="text-gold-400 underline underline-offset-2">Descárgalo gratis</Link>.
        </p>
      </Container>
    </div>
  );
}
