import { useEffect, useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { cargarEventos, type Evento, type Red } from "../features/eventos/eventos";
import { registrarVisitaRuta } from "../features/rutaRed/fuente";
import { DISCORD_URL } from "../lib/constants";
import { ROUTES } from "../lib/routes";

/** El evento que volamos en grupo este mes. Lo elige el fundador; null mientras no hay uno anunciado. */
type VueloDelMes = { red: Red; titulo: string; inicio: string; aeropuertos: string[]; enlace: string; nota: string };
const VUELO_DEL_MES = {
  red: "VATSIM",
  titulo: "El Vuelo Vaquero",
  inicio: "2026-11-19T23:59:00Z",
  aeropuertos: ["MMMY", "MMMX", "KSAT", "KAUS"],
  enlace: "https://my.vatsim.net/events/el-vuelo-vaquero",
  nota: "VATMEX y VATUSA ponen control en todo el evento, de 23:59Z a 03:00Z. Vuela entre Monterrey o Ciudad de México y San Antonio o Austin, en el sentido que quieras. Del lado de Texas el control habla en inglés: si sales de San Antonio, practica antes en el gimnasio de autorizaciones, que trae sus salidas reales. Apúntate en Discord para salir juntos.",
} as VueloDelMes | null;

// Guías nuestras por aeropuerto, para enlazarlas desde cada evento que pase por ahí.
const GUIAS: Record<string, string> = { MMGL: ROUTES.aeropuertoMMGL, MMMX: ROUTES.aeropuertoMMMX, MMMY: ROUTES.aeropuertoMMMY };

const CONSEJOS = [
  { titulo: "Conéctate temprano", texto: "Entra 30 a 45 minutos antes. En un evento hay fila para la autorización y para el rodaje." },
  { titulo: "Usa la ruta del evento", texto: "Muchos eventos publican la ruta o la salida que esperan. Ponla en SimBrief y llega con la carta abierta." },
  { titulo: "Mensajes cortos", texto: "La frecuencia va llena: escucha antes de hablar, di solo lo necesario y colaciona completo." },
  { titulo: "Si es tu primera vez", texto: "Practica antes con la ruta \"Listo para volar en red\" y, si vas a Estados Unidos, con el gimnasio de autorizaciones." },
];

const fecha = (iso: string) => {
  const t = new Date(iso).toLocaleString("es-MX", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const utc = (iso: string) => `${iso.slice(11, 16)}Z`;

function Insignia({ red }: { red: Red }) {
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-bold tracking-wider ${red === "IVAO" ? "bg-sky-500/15 text-sky-300" : "bg-emerald-500/15 text-emerald-300"}`}>
      {red}
    </span>
  );
}

function Tarjeta({ e }: { e: Evento }) {
  const guias = e.aeropuertos.filter((a) => GUIAS[a]);
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      {e.imagen && <img src={e.imagen} alt="" loading="lazy" className="aspect-[16/7] w-full object-cover" />}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
          <Insignia red={e.red} />
          <span className="text-white">{fecha(e.inicio)}</span>
          <span className="font-mono text-xs text-white/40">{utc(e.inicio)}</span>
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-white">{e.titulo}</h3>
        <p className="mt-2 font-mono text-sm text-gold-400">{e.aeropuertos.slice(0, 8).join(" · ")}</p>
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-4 text-sm">
          <a href={e.enlace} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-gold-400 hover:text-gold-300">
            Ver en {e.red} <ExternalLink size={14} />
          </a>
          {guias.map((a) => (
            <Link key={a} to={GUIAS[a]} className="font-semibold text-white/80 hover:text-white">
              Guía de {a}
            </Link>
          ))}
        </div>
      </div>
    </li>
  );
}

export function Eventos() {
  useEffect(() => registrarVisitaRuta("eventos", window.location.search), []);
  const [estado, setEstado] = useState<{ eventos: Evento[]; fallaron: Red[] } | null>(null);
  useEffect(() => {
    let vivo = true;
    cargarEventos().then((r) => vivo && setEstado(r), () => vivo && setEstado({ eventos: [], fallaron: ["IVAO", "VATSIM"] }));
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <div>
      <PageHero
        eyebrow="Comunidad · IVAO y VATSIM"
        title="Vuela los eventos de la red, en grupo"
        description="Los eventos traen control en todas las posiciones y mucho tráfico. Cada mes elegimos uno para volarlo juntos: te preparamos la ruta y la radio, y nos vemos en Discord y en vivo."
      />
      <Container className="py-12 md:py-16">
        <div className="rounded-3xl border border-gold-500/25 bg-gold-500/[0.05] p-6 md:p-8">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">Vuelo del mes</span>
          {VUELO_DEL_MES ? (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Insignia red={VUELO_DEL_MES.red} />
                <span className="text-white">{fecha(VUELO_DEL_MES.inicio)}</span>
                <span className="font-mono text-xs text-white/40">{utc(VUELO_DEL_MES.inicio)}</span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{VUELO_DEL_MES.titulo}</h2>
              <p className="mt-1 font-mono text-sm text-gold-400">{VUELO_DEL_MES.aeropuertos.join(" · ")}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">{VUELO_DEL_MES.nota}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                  Apúntate en Discord <ArrowRight size={16} />
                </Button>
                <Button href={VUELO_DEL_MES.enlace} target="_blank" rel="noopener noreferrer" variant="secondary">
                  Ver el evento
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">El próximo lo anunciamos en Discord</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
                Entra al Discord para votar cuál volamos y enterarte de la fecha. Mientras, abajo están los eventos que vienen en IVAO y VATSIM.
              </p>
              <div className="mt-6">
                <Button href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                  Entrar al Discord <ArrowRight size={16} />
                </Button>
              </div>
            </>
          )}
        </div>

        <h2 className="mt-16 font-display text-2xl font-bold text-white sm:text-3xl">Próximos eventos en el mundo hispano</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
          De México, Centroamérica, el Caribe, Sudamérica y España, directo de IVAO y VATSIM. La hora va en la de tu equipo y en UTC.
        </p>
        {!estado ? (
          <p className="mt-8 text-sm text-white/50">Buscando eventos…</p>
        ) : (
          <>
            {estado.fallaron.length > 0 && (
              <p className="mt-6 text-sm text-white/50">
                No pudimos leer los eventos de {estado.fallaron.join(" ni de ")} en este momento. Intenta más tarde.
              </p>
            )}
            {estado.eventos.length ? (
              <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {estado.eventos.map((e) => (
                  <Tarjeta key={`${e.red}-${e.id}`} e={e} />
                ))}
              </ul>
            ) : (
              estado.fallaron.length < 2 && <p className="mt-8 text-sm text-white/50">Por ahora no hay eventos publicados en la región.</p>
            )}
          </>
        )}

        <h2 className="mt-16 font-display text-2xl font-bold text-white sm:text-3xl">Cómo llegar preparado</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {CONSEJOS.map((c) => (
            <li key={c.titulo} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="font-display text-lg font-semibold text-white">{c.titulo}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">{c.texto}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button to={ROUTES.rutaRed} variant="secondary">
            Ruta "Listo para volar en red"
          </Button>
          <Button to={ROUTES.gimnasioAutorizaciones} variant="ghost">
            Gimnasio de autorizaciones
          </Button>
        </div>

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-white/45">
          Los eventos los organizan IVAO, VATSIM y sus divisiones; aquí solo los mostramos. Fechas, rutas y requisitos pueden cambiar: revisa la
          página de cada evento antes de volar.
        </p>
      </Container>
    </div>
  );
}
