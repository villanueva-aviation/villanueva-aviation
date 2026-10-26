import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { GimnasioAutorizaciones } from "../features/gimnasio/GimnasioAutorizaciones";
import { registrarVisitaRuta } from "../features/rutaRed/fuente";
import { ROUTES } from "../lib/routes";

const ORDEN = [
  { letra: "C", que: "Hasta dónde vas", ingles: "cleared to ___ airport" },
  { letra: "R", que: "Por dónde sales", ingles: "via the ___ departure, ___ transition, then as filed" },
  { letra: "A", que: "Cuánto subes", ingles: "climb via SID · o · maintain ___, expect ___ one zero minutes after departure" },
  { letra: "F", que: "Con quién hablas al despegar", ingles: "departure frequency ___" },
  { letra: "T", que: "Tu código de transpondedor", ingles: "squawk ___" },
];

const SALVAVIDAS = [
  { ingles: "Say again.", espanol: "Repita. Sirve para todo o para una parte: \"say again departure frequency\"." },
  { ingles: "Speak slower.", espanol: "Que hable más despacio; es frase estándar de la OACI. Nadie se molesta: es mejor que un readback mal." },
  { ingles: "Ready to copy.", espanol: "Avisas que ya tienes lápiz en mano antes de que te dicte." },
  { ingles: "Unable.", espanol: "No puedes cumplir la instrucción. Luego explicas por qué o pides otra." },
];

export function GimnasioAutorizacionesPage() {
  useEffect(() => registrarVisitaRuta("gimnasio", window.location.search), []);

  return (
    <div>
      <PageHero
        eyebrow="Gratis · Sin cuenta · Inglés"
        title="Gimnasio de autorizaciones"
        description="En Estados Unidos el controlador te dicta la autorización rápido y de corrido. Aquí la escuchas las veces que quieras, a la velocidad que elijas, hasta que la copias a la primera."
      />
      <Container className="py-12 md:py-16">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Siempre llega en el mismo orden</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
          Si sabes qué viene, solo escuchas lo que cambia. Prepara tu libreta con estas cinco letras (CRAFT) antes de llamar.
        </p>
        <ol className="mt-6 grid gap-2">
          {ORDEN.map((o) => (
            <li key={o.letra} className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 sm:grid-cols-[2.5rem_14rem_1fr]">
              <span className="font-display text-2xl font-bold text-gold-400">{o.letra}</span>
              <span className="text-sm font-semibold text-white">{o.que}</span>
              <span className="col-start-2 font-mono text-sm text-white/60 sm:col-start-3">{o.ingles}</span>
            </li>
          ))}
        </ol>

        <div className="mt-12">
          <GimnasioAutorizaciones />
        </div>

        <h2 className="mt-16 font-display text-2xl font-bold text-white sm:text-3xl">Frases salvavidas</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
          Ponerse nervioso es normal. Lo que no se vale es quedarse callado o adivinar.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {SALVAVIDAS.map((s) => (
            <li key={s.ingles} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="font-display text-lg font-semibold text-white">"{s.ingles}"</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">{s.espanol}</p>
            </li>
          ))}
        </ul>

        <p className="mt-12 max-w-2xl text-xs leading-relaxed text-white/45">
          Las salidas (SID), transiciones y frecuencias son de las cartas de la FAA, pero los procedimientos cambian cada ciclo: antes de
          volar, revisa la carta vigente. La voz es la del navegador, así que suena distinta en cada equipo. Herramienta de práctica para
          simulador, no instrucción certificada.
        </p>

        <div className="mt-12 rounded-3xl border border-gold-500/20 bg-gold-500/[0.04] p-8 text-center md:p-12">
          <h2 className="font-display text-2xl font-semibold text-white">¿Primera vez volando en red?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/65">
            La ruta "Listo para volar en red" te lleva de MMGL a MMMX en IVAO o VATSIM, paso a paso y en español. Gratis.
          </p>
          <div className="mt-6 flex justify-center">
            <Button to={ROUTES.rutaRed}>
              Ver la ruta <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
