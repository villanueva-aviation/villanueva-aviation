import { Link } from "react-router-dom";
import { CalendarCheck, ClipboardList, Package, Radio, Plane, BookCheck, Navigation } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";
import { ROUTES } from "../lib/routes";
import { ALUMNOS_NUEVOS_POR_MES, DIAGNOSTICOS_POR_SEMANA, PRECIO_PAQUETE_4_SESIONES, PRECIO_SESION_2H } from "../lib/constants";

const CASOS = [
  { icono: Navigation, titulo: "Quiero aprender IFR", texto: "Instrumentos, procedimientos y aproximaciones, desde cero o para pulir lo que ya sabes." },
  { icono: BookCheck, titulo: "Me preparo para un examen teórico", texto: "Repasamos lo que te falta con ejercicios y simulacros, hasta que llegues tranquilo." },
  { icono: Radio, titulo: "Quiero volar en línea sin trabarme", texto: "Fraseología y comunicaciones para VATSIM o IVAO, practicando en voz alta." },
  { icono: Plane, titulo: "Quiero dominar mi avión", texto: "Procedimientos, límites y emergencias de tu avión, con checklists y exámenes por modelo." },
];

const PASOS = [
  {
    icono: ClipboardList,
    titulo: "Diagnóstico gratis (30 min)",
    texto: "Me cuentas tu nivel, tu simulador y qué quieres lograr. Sin costo y sin compromiso.",
  },
  {
    icono: CalendarCheck,
    titulo: "Tu plan escrito",
    texto: "Te entrego un plan corto: temas, número de sesiones y meta. Es tuyo aunque decidas no continuar.",
  },
  {
    icono: Package,
    titulo: "Sesiones en vivo",
    texto: "Trabajamos por Discord, con tareas entre sesión y sesión usando el material de la Academia.",
  },
];

export function Asesorias() {
  return (
    <div>
      <PageHero
        eyebrow="Asesorías 1 a 1"
        title="Aprende con un plan hecho para ti"
        description="Sesiones personales de simulación de vuelo con el fundador, por Discord. Empezamos con un diagnóstico gratis para armar tu plan."
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button to={ROUTES.diagnostico} variant="primary">
            Pedir mi diagnóstico gratis
          </Button>
          <Link to={ROUTES.testNivel} className="text-sm font-medium text-white/70 underline decoration-white/30 underline-offset-4 hover:text-gold-400">
            ¿No sabes tu nivel? Haz el test de 3 minutos
          </Link>
        </div>
      </PageHero>

      <Container className="py-12 md:py-16">
        <Reveal>
          <h2 className="font-display text-xl font-semibold text-white">¿Qué quieres lograr?</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {CASOS.map(({ icono: Icono, titulo, texto }) => (
              <div key={titulo} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <Icono size={20} className="text-gold-400" aria-hidden="true" />
                <h3 className="mt-3 font-display text-sm font-semibold text-white">{titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">{texto}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-white/50">¿Es otra cosa? También sirve: cada plan se arma según lo que tú necesitas.</p>
        </Reveal>

        <Reveal className="mt-14">
          <h2 className="font-display text-xl font-semibold text-white">Cómo funciona</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
              <li key={titulo} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">Paso {i + 1}</span>
                <Icono size={20} className="mt-3 text-gold-400" aria-hidden="true" />
                <h3 className="mt-3 font-display text-sm font-semibold text-white">{titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">{texto}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="mt-14">
          <h2 className="font-display text-xl font-semibold text-white">Precios</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="font-display text-sm font-semibold text-white">Diagnóstico</p>
              <p className="mt-2 font-display text-3xl font-bold text-gold-400">Gratis</p>
              <p className="mt-2 text-sm text-white/55">30 minutos y tu plan escrito.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="font-display text-sm font-semibold text-white">Sesión de 2 horas</p>
              <p className="mt-2 font-display text-3xl font-bold text-gold-400">{`$${PRECIO_SESION_2H} USD`}</p>
              <p className="mt-2 text-sm text-white/55">Una sesión suelta, sin compromiso.</p>
            </div>
            <div className="rounded-2xl border border-gold-500/30 bg-gold-500/[0.06] p-5">
              <p className="font-display text-sm font-semibold text-white">Paquete de 4 sesiones</p>
              <p className="mt-2 font-display text-3xl font-bold text-gold-400">{`$${PRECIO_PAQUETE_4_SESIONES} USD`}</p>
              <p className="mt-2 text-sm text-white/55">8 horas en total. Pago por PayPal cuando confirmamos tus fechas.</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/50">
            {`Cupos limitados: ${DIAGNOSTICOS_POR_SEMANA} diagnósticos por semana y ${ALUMNOS_NUEVOS_POR_MES} alumnos nuevos al mes.`}
          </p>
        </Reveal>

        <Reveal className="mt-14 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
          <p className="text-sm leading-relaxed text-white/60">
            Las asesorías son de <span className="font-semibold text-white">simulación de vuelo y preparación teórica</span>. Villanueva
            Aviation es una academia digital independiente: no somos una escuela de aviación certificada ni otorgamos licencias.
            Los horarios son en hora del centro de México.
          </p>
          <div className="mt-5">
            <Button to={ROUTES.diagnostico} variant="primary">
              Pedir mi diagnóstico gratis
            </Button>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
