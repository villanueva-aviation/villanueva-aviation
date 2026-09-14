import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { CONTACT_EMAIL, PRECIO_CONTENIDO_EXCLUSIVO, SITE } from "../lib/constants";

const SECCIONES = [
  { id: "terminos", label: "Términos de uso" },
  { id: "privacidad", label: "Privacidad" },
  { id: "reembolsos", label: "Reembolsos" },
];

export function Legal() {
  return (
    <div>
      <PageHero
        eyebrow="Información legal"
        title="Términos, privacidad y reembolsos"
        description={`Última actualización: ${new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long" })}.`}
      />

      <Container className="py-12 md:py-16">
        <nav className="flex flex-wrap gap-2">
          {SECCIONES.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:border-gold-500/40 hover:text-gold-400"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="mt-10 flex flex-col gap-14 text-sm leading-relaxed text-white/70">
          <section id="terminos" className="scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white">Términos de uso</h2>
            <div className="mt-4 flex flex-col gap-4">
              <p>
                {SITE.name} es una comunidad y academia digital independiente para el aprendizaje teórico de aviación y
                práctica de simulación de vuelo. No somos una escuela de aviación certificada ni estamos afiliados a
                ninguna autoridad aeronáutica, aerolínea o institución oficial. El contenido de Academia, Contenido
                Exclusivo y Descargas es material de apoyo educativo y no sustituye la instrucción de un instructor de
                vuelo certificado ni los requisitos oficiales para obtener una licencia de piloto.
              </p>
              <p>
                La <span className="text-white">bitácora de práctica de vuelo</span> dentro de Contenido Exclusivo es una
                herramienta de seguimiento personal para cadetes de la comunidad, confirmada manualmente por el
                fundador. No es una bitácora oficial reconocida por ninguna autoridad aeronáutica y no debe usarse como
                sustituto de tu bitácora de vuelo oficial.
              </p>
              <p>
                Al crear una cuenta, aceptas usarla de forma personal e intransferible. El contenido de pago
                (Contenido Exclusivo) es para tu uso individual — no está permitido compartir tu acceso, redistribuir
                o revender el material descargable ni el contenido de los módulos.
              </p>
              <p>
                Todo el contenido (textos, diagramas, audios, PDFs y ejercicios) es propiedad de {SITE.name}, salvo el
                formato oficial de plan de vuelo OACI incluido en Descargas, que es un documento público de la OACI
                (Doc 4444) provisto sin modificaciones.
              </p>
              <p>
                Podemos actualizar estos términos conforme agreguemos funciones nuevas a la plataforma. Los cambios
                relevantes se reflejarán en la fecha de "última actualización" al inicio de esta página.
              </p>
            </div>
          </section>

          <section id="privacidad" className="scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white">Privacidad</h2>
            <div className="mt-4 flex flex-col gap-4">
              <p>
                Para crear tu cuenta usamos autenticación por correo (enlace de acceso) o con tu cuenta de Google,
                gestionada por Supabase. Guardamos tu correo, nombre y tu progreso dentro de la plataforma (módulos
                completados, exámenes, vuelos de práctica registrados) para poder mostrarte tu avance y tus
                certificados.
              </p>
              <p>
                Tu progreso teórico en Academia (lecciones, quizzes) se guarda localmente en tu navegador — si cambias
                de dispositivo, ese progreso no se transfiere automáticamente. Tu acceso a Contenido Exclusivo, tus
                pagos y tus vuelos de práctica sí se guardan de forma centralizada y están ligados a tu cuenta.
              </p>
              <p>
                Los pagos de Contenido Exclusivo se procesan directamente por PayPal — nosotros nunca vemos ni
                almacenamos los datos de tu tarjeta o cuenta bancaria, solo la confirmación de que el pago se
                completó.
              </p>
              <p>
                No vendemos ni compartimos tus datos con terceros para fines publicitarios. Los únicos servicios
                externos que procesan tus datos son Supabase (base de datos y autenticación), Google (si eliges
                iniciar sesión con Google) y PayPal (procesamiento de pagos).
              </p>
              <p>
                Puedes solicitar la eliminación de tu cuenta y tus datos escribiendo a{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold-400 hover:text-gold-300">
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </div>
          </section>

          <section id="reembolsos" className="scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white">Reembolsos</h2>
            <div className="mt-4 flex flex-col gap-4">
              <p>
                Contenido Exclusivo es un pago único de ${PRECIO_CONTENIDO_EXCLUSIVO} USD que desbloquea acceso
                inmediato y de por vida a contenido digital (checklists, simulacros, audios y la bitácora de
                práctica). Por tratarse de contenido digital de acceso inmediato,{" "}
                <span className="text-white">no ofrecemos reembolsos</span> una vez completado el pago.
              </p>
              <p>
                La única excepción es un error técnico comprobado de nuestro lado (por ejemplo, un cobro duplicado o
                un pago confirmado por PayPal que no desbloqueó el acceso). En esos casos, escríbenos a{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold-400 hover:text-gold-300">
                  {CONTACT_EMAIL}
                </a>{" "}
                con tu comprobante de pago y lo resolvemos.
              </p>
            </div>
          </section>
        </div>

        <p className="mt-14 border-t border-white/10 pt-6 text-sm text-white/50">
          ¿Preguntas sobre estos términos?{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold-400 hover:text-gold-300">
            {CONTACT_EMAIL}
          </a>
        </p>
      </Container>
    </div>
  );
}
