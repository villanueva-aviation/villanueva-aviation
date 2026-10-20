import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { ROUTES } from "../lib/routes";
import {
  ALUMNOS_NUEVOS_POR_MES,
  DIAGNOSTICOS_POR_SEMANA,
  HORAS_IVAO,
  INTENTOS_POR_BLOQUE,
  PRECIO_PAQUETE_4_SESIONES,
  PRECIO_PRUEBA_RED,
  PRECIO_SESION_2H,
} from "../lib/constants";
import { fotoFlota } from "../data/flota";
import { EtapasConFoto, type Etapa } from "../features/home/EtapasRuta";

const CASOS = [
  {
    titulo: "Quiero aprender IFR",
    texto: "Instrumentos, procedimientos y aproximaciones, desde cero o para pulir lo que ya sabes.",
    img: fotoFlota("c90"),
    alt: "King Air C90 XB-KNG en vuelo, captura de simulador",
  },
  {
    titulo: "Me preparo para un examen teórico",
    texto: "Repasamos lo que te falta con ejercicios y simulacros, hasta que llegues tranquilo.",
    img: fotoFlota("c172"),
    alt: "Cessna 172 XB-VNA en vuelo, captura de simulador",
  },
  {
    titulo: "Quiero volar en línea sin trabarme",
    texto: "Fraseología y comunicaciones para VATSIM o IVAO, practicando en voz alta.",
    img: { src: "/images/msfs-volaris-climb.jpg" },
    alt: "Avión de línea en ascenso, captura de simulador",
  },
  {
    titulo: "Quiero dominar mi avión",
    texto: "Procedimientos, límites y emergencias de tu avión, con checklists y exámenes por modelo.",
    img: fotoFlota("seneca"),
    alt: "Piper Seneca XB-SNV en vuelo, captura de simulador",
  },
];

const PASOS: Etapa[] = [
  {
    titulo: "Diagnóstico gratis de 30 minutos",
    texto: "Me cuentas tu nivel, tu simulador y qué quieres lograr. Sin costo y sin compromiso.",
    img: fotoFlota("da40"),
    alt: "Diamond DA40 XB-NGD en vuelo, captura de simulador",
    cta: { label: "Pedir mi diagnóstico", to: ROUTES.diagnostico },
  },
  {
    titulo: "Tu plan escrito",
    texto: "Te entrego un plan corto: temas, número de sesiones y meta. Es tuyo aunque decidas no continuar.",
    img: { src: "/images/paneles/c172-panel.webp" },
    alt: "Panel de instrumentos de un Cessna 172, captura de simulador",
  },
  {
    titulo: "Sesiones en vivo",
    texto: "Trabajamos por Discord, en tu simulador, con tareas entre sesión y sesión usando el material de la Academia.",
    img: fotoFlota("a36"),
    alt: "Beechcraft Bonanza A36 XB-BNZ en vuelo, captura de simulador",
  },
];

const TRAMOS = [
  "Scan de instrumentos y viraje estándar",
  "VOR, HSI e interceptación de radiales",
  "Aproximación ILS y aproximación frustrada",
  "Vuelo completo MMGL → MMMX en línea",
];

/** Un ejemplo del plan escrito que recibe el cadete, con forma de plan de vuelo. Ilustrativo, sin datos de nadie. */
function PlanEjemplo() {
  const fila = "grid grid-cols-[6.5rem_1fr] gap-3 border-t border-dashed border-white/15 py-2.5 text-sm";
  return (
    <div className="relative rounded-2xl border border-white/15 bg-[#05090f]/90 p-6 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-sm font-bold tracking-[0.1em] text-gold-400 sm:tracking-[0.2em]">PLAN DE ASESORÍA</p>
        <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/60">
          Ejemplo
        </span>
      </div>
      <dl className="mt-4 font-mono text-[13px]">
        <div className={fila}>
          <dt className="text-white/45">NIVEL</dt>
          <dd className="text-white">Intermedio (test 8/12)</dd>
        </div>
        <div className={fila}>
          <dt className="text-white/45">META</dt>
          <dd className="text-white">Volar IFR en línea</dd>
        </div>
        <div className={fila}>
          <dt className="text-white/45">EQUIPO</dt>
          <dd className="text-white">MSFS · Cessna 172</dd>
        </div>
        <div className={fila}>
          <dt className="text-white/45">SESIONES</dt>
          <dd className="text-white">4 × 2 h por Discord</dd>
        </div>
      </dl>
      <ol className="mt-2 border-t border-dashed border-white/15 pt-3">
        {TRAMOS.map((t, i) => (
          <li key={t} className="flex gap-3 py-1.5 text-sm text-white/85">
            <span className="font-mono text-[13px] font-semibold tabular-nums text-gold-400">S{i + 1}</span>
            {t}
          </li>
        ))}
      </ol>
      <p className="mt-3 border-t border-dashed border-white/15 pt-3 text-xs text-white/50">
        Entre sesiones: módulos de Instrumentos e IFR de la Academia.
      </p>
    </div>
  );
}

export function Asesorias() {
  return (
    <div>
      {/* PORTADA */}
      <section className="relative overflow-hidden bg-navy-950">
        <div className="absolute inset-0" aria-hidden="true">
          <img src="/images/msfs-sunset-wing.jpg" alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-transparent to-navy-950" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>
        <div className="relative mx-auto grid w-full max-w-[100rem] items-center gap-12 px-6 py-14 sm:py-20 md:px-8 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-16 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="animate-fade-up font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl xl:text-6xl">
              Aprende con un plan <span className="text-gold-400">hecho para ti</span>
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg" style={{ animationDelay: "60ms" }}>
              Sesiones personales de simulación de vuelo con el fundador, por Discord y en tu propio simulador. Empezamos con un
              diagnóstico gratis y salimos con tu plan escrito.
            </p>
            <div className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "120ms" }}>
              <Button to={ROUTES.diagnostico} variant="primary" className="group">
                Pedir mi diagnóstico gratis
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
              <Button to={ROUTES.testNivel} variant="secondary">
                Primero, descubre tu nivel
              </Button>
            </div>
            <p className="animate-fade-up mt-4 text-sm text-white/55" style={{ animationDelay: "160ms" }}>
              {`Cupos limitados: ${DIAGNOSTICOS_POR_SEMANA} diagnósticos por semana y ${ALUMNOS_NUEVOS_POR_MES} alumnos nuevos al mes.`}
            </p>
          </div>
          <div className="animate-fade-up lg:rotate-[1.5deg]" style={{ animationDelay: "200ms" }}>
            <PlanEjemplo />
          </div>
        </div>
      </section>

      {/* CASOS */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">
            ¿Qué quieres lograr?
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">
            Estos son los más comunes. Si es otra cosa también sirve: cada plan se arma según lo que tú necesitas.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {CASOS.map((c) => (
              <Link
                key={c.titulo}
                to={ROUTES.diagnostico}
                className="group relative block overflow-hidden rounded-2xl border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
              >
                <img
                  src={c.img.src}
                  srcSet={"srcSet" in c.img ? c.img.srcSet : undefined}
                  sizes="(min-width: 640px) 45vw, 100vw"
                  alt={c.alt}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover transition-transform duration-[1200ms] ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-xl font-bold text-white">{c.titulo}</h3>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/75">{c.texto}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* CÓMO FUNCIONA */}
      <EtapasConFoto titulo="Cómo funciona" descripcion="Tres pasos, sin pagar nada hasta que tengas tu plan." etapas={PASOS} />

      {/* PRECIOS */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">Precios</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="font-display text-sm font-semibold text-white">Diagnóstico</p>
              <p className="mt-3 font-display text-4xl font-bold text-white">Gratis</p>
              <p className="mt-3 text-sm text-white/60">30 minutos y tu plan escrito.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="font-display text-sm font-semibold text-white">Sesión de 2 horas</p>
              <p className="mt-3 font-display text-4xl font-bold text-white tabular-nums">
                ${PRECIO_SESION_2H} <span className="text-base font-semibold text-white/50">USD</span>
              </p>
              <p className="mt-3 text-sm text-white/60">Una sesión suelta, sin compromiso.</p>
            </div>
            <div className="rounded-2xl border border-gold-500/40 bg-gold-500/[0.07] p-6">
              <p className="font-display text-sm font-semibold text-gold-400">Paquete de 4 sesiones</p>
              <p className="mt-3 font-display text-4xl font-bold text-white tabular-nums">
                ${PRECIO_PAQUETE_4_SESIONES} <span className="text-base font-semibold text-white/50">USD</span>
              </p>
              <p className="mt-3 text-sm text-white/60">8 horas en total. Pago por PayPal cuando confirmamos tus fechas.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* RUTA LISTO PARA VOLAR EN RED */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">Listo para volar en red</h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              Una ruta gratuita de 8 lecciones para volar con control aéreo en VATSIM o IVAO. Cuando te sientas listo, puedes
              presentar una prueba en vivo con Erik: ${PRECIO_PRUEBA_RED} USD por {INTENTOS_POR_BLOQUE} intentos. No es una
              evaluación oficial de IVAO, VATSIM ni de la AFAC.
            </p>
            <div className="mt-6">
              <Button to={ROUTES.rutaRed} variant="secondary">
                Ver la ruta gratis <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* QUIÉN TE ASESORA */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <img
              src="/images/founder-erik-poster-sm.jpg"
              alt="Erik Villanueva, fundador de Villanueva Aviation"
              width="640"
              height="960"
              loading="lazy"
              className="mx-auto aspect-[2/3] w-full max-w-xs rounded-3xl border border-white/10 object-cover"
            />
            <div>
              <h2 className="font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">Quién te asesora</h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
                Erik Villanueva es piloto virtual con los exámenes de IVAO Senior Private Pilot y{" "}
                <span className="font-semibold text-white tabular-nums">{HORAS_IVAO.toLocaleString("es-MX")} horas</span> registradas en
                IVAO. Estudia a fondo el material de piloto privado real, arma cada plan y da cada sesión en persona.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55">
                Las asesorías son de simulación de vuelo y preparación teórica. Villanueva Aviation es una academia digital
                independiente: no somos una escuela de aviación certificada ni otorgamos licencias. Los horarios son en hora del
                centro de México.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CIERRE */}
      <section className="border-t border-white/10 bg-gradient-to-b from-navy-950 to-navy-900 py-20 text-center md:py-28">
        <Container>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">
            Empieza con tu diagnóstico gratis
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/70">
            Treinta minutos para conocerte y armar tu plan. Sin pagar nada.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to={ROUTES.diagnostico} variant="primary">
              Pedir mi diagnóstico gratis <ArrowRight size={16} />
            </Button>
            <Button to={ROUTES.testNivel} variant="secondary">
              Descubrir mi nivel
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
