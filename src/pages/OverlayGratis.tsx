import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { registrarVisitaRuta } from "../features/rutaRed/fuente";
import { DISCORD_URL } from "../lib/constants";

const ORIGEN = "https://villanueva-aviation.pages.dev";
const URL_OVERLAY = `${ORIGEN}/overlay/en-vivo`;
const URL_CONTROL = `${ORIGEN}/overlay/control`;

const QUE_TRAE = [
  { titulo: "Mapa en vivo", texto: "Tu avión, la ruta de SimBrief y los aeropuertos, tomados de IVAO o VATSIM cada 15 segundos." },
  { titulo: "Datos de vuelo", texto: "Altitud, velocidad, rumbo, squawk, fase del vuelo y cuánto falta para llegar." },
  { titulo: "Plan de SimBrief", texto: "Crucero, pistas, alterno, combustible, ruta y el próximo punto, incluyendo TOC y TOD." },
  { titulo: "Control en línea", texto: "Qué controladores están conectados en tu salida y en tu llegada." },
  { titulo: "METAR", texto: "El clima real de salida y llegada, con su categoría VFR, MVFR, IFR o LIFR." },
  { titulo: "Momentos con tu chat", texto: "Saludos, \"nos ven desde\", pregunta del día con quién acertó y la tarjeta de aterrizaje." },
];

function CopiarUrl({ url }: { url: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-navy-900 py-1.5 pl-3 pr-1.5">
      <code className="min-w-0 flex-1 truncate font-mono text-sm text-gold-300">{url}</code>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(url).then(() => setOk(true), () => undefined)}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-transform duration-[160ms] active:scale-[0.97]"
      >
        {ok ? <Check size={14} /> : <Copy size={14} />} {ok ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}

/** El overlay real en modo prueba, escalado de 1920×1080 al ancho de la tarjeta. */
function Vista() {
  const caja = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.3);
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setEscala(el.clientWidth / 1920));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={caja} className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10">
      <img src="/images/msfs-xbvla-farmland-1280.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <iframe
        title="Vista previa del overlay"
        src="/overlay/en-vivo.html?demo"
        loading="lazy"
        tabIndex={-1}
        className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
        style={{ width: 1920, height: 1080, transform: `scale(${escala})` }}
      />
    </div>
  );
}

const PASOS = [
  {
    titulo: "Agrega el overlay como fuente",
    texto: "En OBS: Fuentes → + → Navegador. Pega esta URL, pon 1920 de ancho y 1080 de alto, y deja sin marcar \"Archivo local\". Ponla arriba de la captura del simulador.",
    url: URL_OVERLAY,
  },
  {
    titulo: "Agrega el panel de control como dock",
    texto: "En OBS: Docks → Docks de navegador personalizados. Ponle de nombre \"Control\" y pega esta URL. Desde ahí manejas todo sin tocar la escena.",
    url: URL_CONTROL,
  },
  {
    titulo: "Pon tu canal",
    texto: "En el panel abre \"Tu canal\": nombre del canal, logo (un enlace a tu imagen PNG), tu nombre y, si quieres, una invitación a tu Discord. Dale Guardar canal.",
  },
  {
    titulo: "Carga tu vuelo",
    texto: "En \"Vuelo\" pon tu usuario de SimBrief y dale Cargar de SimBrief. Elige IVAO o VATSIM y revisa que el callsign sea el mismo con el que te conectas a la red.",
  },
  {
    titulo: "Acomoda tu cámara",
    texto: "El marco de cámara está abajo a la izquierda: posición 40, 744 y tamaño 480 × 270. Pon ahí tu cámara, o apaga \"Marco de cámara\" en el panel si no usas.",
  },
];

export function OverlayGratis() {
  useEffect(() => registrarVisitaRuta("overlay-gratis", window.location.search), []);

  return (
    <div>
      <PageHero
        eyebrow="Para streamers · Gratis"
        title="Overlay gratis para tu transmisión de simulador"
        description="Mapa en vivo, datos de IVAO o VATSIM, tu plan de SimBrief, METAR y momentos para tu chat. Funciona en OBS, sin instalar nada y en español."
      />
      <Container className="py-12 md:py-16">
        <Vista />
        <p className="mt-3 text-xs text-white/45">Vista con datos de prueba. Con tu canal configurado, arriba a la izquierda va tu nombre y tu logo.</p>

        <h2 className="mt-14 font-display text-2xl font-bold text-white sm:text-3xl">Qué trae</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUE_TRAE.map((q) => (
            <li key={q.titulo} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="font-display text-lg font-semibold text-white">{q.titulo}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">{q.texto}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-16 font-display text-2xl font-bold text-white sm:text-3xl">Cómo ponerlo en 5 pasos</h2>
        <ol className="mt-6 grid gap-4">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <h3 className="font-display text-lg font-semibold text-white">
                <span className="mr-2 text-gold-400">{i + 1}.</span>
                {p.titulo}
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">{p.texto}</p>
              {p.url && <CopiarUrl url={p.url} />}
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-xl font-semibold text-white">Bueno saber</h2>
            <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-white/60">
              <li>· Necesita internet: los datos llegan de IVAO, VATSIM, SimBrief y del METAR real.</li>
              <li>· La tasa de aterrizaje la escribes en el panel y sale la tarjeta con su calificación.</li>
              <li>· Lo probamos en OBS 32. Si algo no se ve en tu versión, avísanos.</li>
              <li>· Lo que guardas en el panel se queda en tu OBS; no nos llega nada.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-gold-500/20 bg-gold-500/[0.04] p-6">
            <h2 className="font-display text-xl font-semibold text-white">Lo único que pedimos</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Que dejes el pequeño crédito "Overlay gratis de Villanueva Aviation" debajo de tu nombre. Así otros streamers lo encuentran y
              lo seguimos mejorando. Si lo usas, cuéntanos en Discord: nos encanta ver tus transmisiones.
            </p>
            <div className="mt-5">
              <Button href={DISCORD_URL} target="_blank" rel="noopener noreferrer" variant="secondary">
                Escríbenos en Discord
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
