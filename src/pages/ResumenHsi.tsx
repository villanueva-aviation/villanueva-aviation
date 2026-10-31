import { useEffect } from "react";
import { ArrowRight, Download } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { registrarVisitaRuta } from "../features/rutaRed/fuente";
import { ROUTES } from "../lib/routes";

const GLOSARIO = [
  { termino: "Mariposa o mosca", texto: "Selector de rumbo (HDG)." },
  { termino: "CRS", texto: "Perilla que coloca el curso en la flecha del HSI." },
  { termino: "CDI vivo", texto: "La barra del CDI empieza a moverse hacia el centro." },
  { termino: "Flecha VOR", texto: "Su cabeza apunta a la estación; su cola, al lado opuesto." },
];

const REGLAS = [
  {
    titulo: "DC30 · hacia la estación",
    dicho: "Deseada, Cabeza, me paso 30°",
    texto: "Desde el rumbo deseado, ve hacia la cabeza de la flecha VOR y pásala 30°. Ese es tu rumbo de interceptación.",
    ejemplo: "Deseada 090°, cabeza en 060°. De 090° voy a 060° y me paso 30°: rumbo 030°.",
  },
  {
    titulo: "CD45 · alejándote",
    dicho: "Cola, Deseada, me paso 45°",
    texto: "Desde la cola de la flecha VOR, ve hacia el rumbo deseado y pásalo 45°. Ese es tu rumbo de interceptación.",
    ejemplo: "Deseada 090°, cola en 060°. De 060° voy a 090° y me paso 45°: rumbo 135°.",
  },
];

const FLECHA_ARCO = "Donde apunta la cabeza de la flecha VOR es la dirección de viraje (derecha-derecha o izquierda-izquierda).";

const MOVIMIENTOS = [
  {
    seccion: "Interceptaciones",
    tarjetas: [
      {
        titulo: "Acercamiento",
        pasos: ["Mariposa al rumbo solicitado.", "Aplica DC30 y vira.", "CRS al rumbo solicitado.", "CDI vivo: vira hacia la estación, hasta el rumbo solicitado."],
      },
      {
        titulo: "Alejamiento",
        pasos: ["Mariposa al rumbo/radial solicitado (coinciden).", "Aplica CD45 y vira.", "CRS al rumbo solicitado.", "CDI vivo: vira al lado contrario de la estación."],
      },
    ],
  },
  {
    seccion: "Rutas pasadas (más de 90°)",
    tarjetas: [
      {
        titulo: "Acercamiento · regla de 1 minuto",
        pasos: [
          "Mariposa al radial solicitado.",
          "CRS al rumbo contrario.",
          "Vira al radial solicitado.",
          "Al través de la estación (cambia la flechita), cronómetro 1 min.",
          "Pasado el minuto, vira 90° hacia el lado del CDI.",
          "CDI vivo: vira hacia la estación.",
        ],
      },
      {
        titulo: "Alejamiento · regla de 45°",
        pasos: [
          "Mariposa y CRS al radial/rumbo solicitado (coinciden).",
          "Vira a ese radial/rumbo.",
          "Al través de la estación (cambia la flechita), mariposa en la marca de 45° de la rosa (pínula), del lado de la estación, donde está el CDI.",
          "Vira esos 45°.",
          "CDI vivo: vira al lado contrario de la estación.",
        ],
      },
    ],
  },
  {
    seccion: "Arcos DME",
    nota: "Los 0.5 NM funcionan a unos 100–120 kt. A mayor velocidad respecto al suelo, anticipa más.",
    tarjetas: [
      {
        titulo: "Salida · terminas alejándote por un radial",
        pasos: ["CRS al radial de salida indicado.", "0.5 NM antes de llegar, vira 90° a la derecha o a la izquierda.", FLECHA_ARCO, "CDI vivo: vira al lado contrario de la estación."],
      },
      {
        titulo: "Entrada · terminas acercándote a la estación",
        pasos: ["CRS al curso de acercamiento (radial de entrada ± 180°).", "0.5 NM antes de llegar, vira 90° a la derecha o a la izquierda.", FLECHA_ARCO, "CDI vivo: vira hacia la estación."],
      },
    ],
  },
];

const ENTRADAS = [
  {
    nombre: "Directa",
    color: "bg-emerald-600",
    pasos: [
      "CRS en el inbound y mariposa en el outbound.",
      "Sobre la estación, vira al outbound: derecha si es estándar, izquierda si no.",
      "Al través (cambia la flechita), cronómetro 1 min. Si no se distingue, al terminar el viraje.",
      "Pasado el minuto, vira hacia el lado del CDI hasta el inbound.",
      "Sobre la estación, vira de nuevo al outbound.",
    ],
  },
  {
    nombre: "Gota (desplazada)",
    color: "bg-orange-600",
    pasos: [
      "CRS en el inbound.",
      "Mariposa en el outbound −30° si es estándar, +30° si no.",
      "Sobre la estación, vira a ese rumbo.",
      "Ya estabilizado, cronómetro 1 min.",
      "Mariposa en el outbound; el CRS sigue en el inbound.",
      "Pasado el minuto, vira hacia el lado del CDI hasta el inbound.",
      "Sobre la estación, vira de nuevo al outbound.",
    ],
  },
  {
    nombre: "Paralela",
    color: "bg-blue-600",
    pasos: [
      "CRS en el inbound y mariposa en el outbound.",
      "Sobre la estación, vira al outbound: izquierda si es estándar, derecha si no.",
      "Ya estabilizado, cronómetro 1 min.",
      "Pasado el minuto, vira unos 210° por el mismo lado, hasta el inbound −30° si es estándar o +30° si no. Mariposa en ese rumbo.",
      "CDI vivo: vira hacia el lado de la estación, hasta el inbound.",
      "Mariposa en el outbound.",
      "Sobre la estación, vira de nuevo al outbound.",
    ],
  },
];

function Pasos({ pasos }: { pasos: string[] }) {
  return (
    <ol className="list-decimal space-y-1.5 p-4 pl-9 text-sm leading-relaxed text-white/75 marker:text-gold-400">
      {pasos.map((p) => (
        <li key={p}>{p}</li>
      ))}
    </ol>
  );
}

function Sectores() {
  return (
    <svg
      viewBox="0 0 188 188"
      className="mx-auto h-48 w-48 shrink-0"
      role="img"
      aria-label="Sectores alrededor de la cabeza de la flecha VOR: a la derecha, hasta 70 grados, gota; a la izquierda, hasta 110 grados, paralela; el resto, 180 grados, directa."
    >
      <path d="M94 94 L171.1 65.95 A82 82 0 0 1 16.95 122.05 Z" fill="#10b981" opacity=".22" />
      <path d="M94 94 L94 12 A82 82 0 0 1 171.1 65.95 Z" fill="#f97316" opacity=".3" />
      <path d="M94 94 L94 12 A82 82 0 0 0 16.95 122.05 Z" fill="#3b82f6" opacity=".28" />
      <circle cx="94" cy="94" r="82" fill="none" stroke="#fff" strokeOpacity=".5" />
      <line x1="16.95" y1="122.05" x2="171.1" y2="65.95" stroke="#fff" strokeOpacity=".5" strokeDasharray="3 3" />
      <line x1="94" y1="94" x2="94" y2="18" stroke="#fff" strokeWidth="2" />
      <path d="M94 8 L87 22 L101 22 Z" fill="#fff" />
      <g textAnchor="middle" fontSize="11" fontWeight="700">
        <text x="124" y="50" fill="#fdba74">GOTA</text>
        <text x="54" y="74" fill="#93c5fd">PARALELA</text>
        <text x="94" y="140" fill="#6ee7b7">DIRECTA</text>
      </g>
    </svg>
  );
}

export function ResumenHsi() {
  useEffect(() => registrarVisitaRuta("resumen-hsi", window.location.search), []);

  return (
    <div>
      <PageHero
        eyebrow="Gratis · Sin cuenta · IFR"
        title="Resumen de movimientos HSI"
        description="Las secuencias de botones y virajes para interceptar, pasar rutas, volar arcos DME y entrar a una espera."
      />
      <Container className="py-12 md:py-16">
        <div className="flex flex-col gap-6 rounded-3xl border border-gold-500/25 bg-gold-500/[0.05] p-6 sm:flex-row sm:items-center sm:p-8">
          <img
            src="/images/alvaro-aeromedico.webp"
            alt="Álvaro con auriculares de aviación en la cabina de un helicóptero"
            width={480}
            height={480}
            className="h-32 w-32 shrink-0 rounded-2xl object-cover sm:h-36 sm:w-36"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">Preparado por</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">Álvaro</p>
            <p className="text-sm font-medium text-gold-400">Aeromédico y futuro Piloto de Helicóptero</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">
              Álvaro escribió este resumen de lo que hemos trabajado en nuestras sesiones y lo comparte para que otros cadetes también lo aprovechen.
            </p>
          </div>
          <Button href="/downloads/resumen-movimientos-hsi.pdf" target="_blank" rel="noopener">
            <Download size={16} /> Descargar PDF
          </Button>
        </div>

        <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GLOSARIO.map((g) => (
            <div key={g.termino} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <dt className="text-sm font-semibold text-white">{g.termino}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-white/60">{g.texto}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-14 font-display text-2xl font-bold text-white sm:text-3xl">Las dos reglas para interceptar</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {REGLAS.map((r) => (
            <div key={r.titulo} className="rounded-2xl border-l-4 border-gold-500 bg-white/[0.04] p-5">
              <h3 className="font-display text-lg font-semibold text-white">{r.titulo}</h3>
              <p className="mt-1 text-sm font-semibold text-gold-400">"{r.dicho}"</p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{r.texto}</p>
              <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-white/70">
                <span className="font-semibold text-white">Ejemplo:</span> {r.ejemplo}
              </p>
            </div>
          ))}
        </div>

        {MOVIMIENTOS.map((m) => (
          <section key={m.seccion}>
            <h2 className="mt-14 font-display text-2xl font-bold text-white sm:text-3xl">{m.seccion}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {m.tarjetas.map((t) => (
                <div key={t.titulo} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                  <h3 className="border-b border-white/10 bg-white/[0.05] px-4 py-3 font-display text-sm font-semibold text-white">{t.titulo}</h3>
                  <Pasos pasos={t.pasos} />
                </div>
              ))}
            </div>
            {m.nota && <p className="mt-3 text-xs leading-relaxed text-white/50">{m.nota}</p>}
          </section>
        ))}

        <h2 className="mt-14 font-display text-2xl font-bold text-white sm:text-3xl">Regla de los dedos: qué entrada me toca</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">Espera estándar: virajes a la derecha. En una no estándar, intercambia derecha e izquierda.</p>
        <div className="mt-6 grid items-center gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-[auto_1fr] md:p-8">
          <Sectores />
          <div>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-white/75 marker:text-gold-400">
              <li>Vuela directo al fijo y pon el dedo índice en la cabeza de la flecha VOR.</li>
              <li>Pon la mariposa en el outbound.</li>
              <li>Mira de qué lado del dedo queda la mariposa:</li>
            </ol>
            <ul className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 text-sm">
              <li className="flex justify-between gap-4 px-4 py-2.5 text-white/75">A la derecha, hasta 70° <b className="text-orange-300">Gota</b></li>
              <li className="flex justify-between gap-4 px-4 py-2.5 text-white/75">A la izquierda, hasta 110° <b className="text-blue-300">Paralela</b></li>
              <li className="flex justify-between gap-4 px-4 py-2.5 text-white/75">En cualquier otro lugar (hacia la cola) <b className="text-emerald-300">Directa</b></li>
            </ul>
          </div>
        </div>

        <h2 className="mt-14 font-display text-2xl font-bold text-white sm:text-3xl">Cómo se vuela cada entrada</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {ENTRADAS.map((e) => (
            <div key={e.nombre} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              <h3 className={`${e.color} px-4 py-2.5 text-center font-display text-sm font-semibold text-white`}>{e.nombre}</h3>
              <Pasos pasos={e.pasos} />
            </div>
          ))}
        </div>
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-white/50">
          Ya dentro del circuito, cuenta el minuto de alejamiento desde el través. El tiempo habitual es 1 min hasta 14,000 ft y 1½ min por encima, salvo que la carta indique otro.
        </p>

        <div className="mt-8 rounded-2xl border-l-4 border-gold-500 bg-white/[0.04] p-5 text-sm leading-relaxed text-white/70">
          <p className="font-semibold text-white">Ejemplo: espera del ILS RWY 23 de Valladolid/Villanubla (inbound 226°, outbound 046°, estándar)</p>
          <p className="mt-2">Rumbo al llegar 156° a 336°: directa · 336° a 046° (por 360°): gota, volando 016° · 046° a 156°: paralela.</p>
          <p className="mt-2">
            Al volver de la frustrada llegas con unos 046°, justo en el límite entre gota y paralela. Ejemplo de estudio con AD 2-LEVD IAC 2.1, AMDT 06/24; comprueba siempre la carta vigente.
          </p>
        </div>

        <p className="mt-10 max-w-2xl text-xs leading-relaxed text-white/45">
          Material educativo para formación y simulación. No sustituye instrucción oficial, cartas vigentes ni el manual de tu aeronave.
        </p>

        <div className="mt-10 rounded-3xl border border-gold-500/20 bg-gold-500/[0.04] p-8 text-center md:p-12">
          <h2 className="font-display text-2xl font-semibold text-white">Ahora ponlo a prueba</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/65">
            El Entrenador de esperas te da la espera y tu rumbo de llegada. Elige la entrada en menos de 15 segundos.
          </p>
          <div className="mt-6 flex justify-center">
            <Button to={ROUTES.entrenadorEsperas}>
              Practicar entradas <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
