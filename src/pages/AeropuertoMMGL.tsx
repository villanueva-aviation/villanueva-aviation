import { useEffect, useState } from "react";
import { ArrowRight, Check, Copy } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { registrarVisitaRuta } from "../features/rutaRed/fuente";
import { DISCORD_URL } from "../lib/constants";
import { ROUTES } from "../lib/routes";

// Datos: los mismos de la ruta "Listo para volar en red" (cartas Jeppesen vía Navigraph, confirmadas por
// el fundador el 2026-10-19; ver CARTAS_RED en src/data/rutaRed.ts). Si una carta cambia, cambia en los dos.
// ponytail: página de un solo aeropuerto; sacar los datos a un archivo cuando haya un segundo aeropuerto.

const FICHA = [
  { dato: "Elevación", valor: "5013 ft" },
  { dato: "Pistas", valor: "11L/29R · 11R/29L" },
  { dato: "Altitud de transición", valor: "  " },
  { dato: "VOR", valor: "GDL 117.3" },
];

const FRECUENCIAS = [
  { quien: "ATIS", mhz: "127.9", para: "Escuchas la letra, la pista en uso y el QNH. No se le habla." },
  { quien: "Autorizaciones", mhz: "132.8", para: "Pides tu autorización IFR. En la carta: GUADALAJARA Clearance." },
  { quien: "Rampa", mhz: "134.1", para: "Para moverte dentro de la plataforma o salir de ella." },
  { quien: "Rodaje", mhz: "121.9", para: "Te lleva de la plataforma al punto de espera de la pista." },
  { quien: "Torre", mhz: "118.1", para: "Te autoriza a entrar a la pista y a despegar." },
  { quien: "Salida", mhz: "La que te den", para: "Viene en tu autorización (la F de CRAFT). Anótala." },
];

type Linea = { de: "tu" | "atc"; texto: string };
const PASOS: { titulo: string; frecuencia: string; nota: string; dialogo: Linea[] }[] = [
  {
    titulo: "Escucha el ATIS",
    frecuencia: "127.9",
    nota: "Anota la letra, la pista en uso y el QNH antes de hablar con nadie. Con la pista ya sabes qué salida esperar: pistas 11, LONKU 1D; pistas 29, LONKU 1E.",
    dialogo: [],
  },
  {
    titulo: "Pide tu autorización IFR",
    frecuencia: "132.8",
    nota: "Ten la libreta lista con C-R-A-F-T y escribe mientras te dictan. Al final lees todo de vuelta, en el mismo orden.",
    dialogo: [
      { de: "tu", texto: "Guadalajara Autorizaciones, XB-VNA, Cessna 172 en plataforma de aviación general, con información Alfa, solicito autorización IFR a Ciudad de México." },
      { de: "atc", texto: "XB-VNA, autorizado a Ciudad de México, salida LONKU 1D, luego ruta del plan de vuelo, ascienda y mantenga   , frecuencia de salida 124.5, transpondedor 4521." },
      { de: "tu", texto: "Autorizado a Ciudad de México, salida LONKU 1D, luego ruta del plan de vuelo, ascienda y mantenga   , frecuencia de salida 124.5, transpondedor 4521, XB-VNA." },
      { de: "atc", texto: "XB-VNA, colación correcta." },
    ],
  },
  {
    titulo: "Sal de la plataforma con Rampa",
    frecuencia: "134.1",
    nota: "En la plataforma comercial los aviones salen remolcados: en el simulador usa el remolque. Rampa te deja en la orilla y te pasa con Rodaje.",
    dialogo: [
      { de: "tu", texto: "Guadalajara Rampa, XB-VNA, en plataforma de aviación general, listo para rodar." },
      { de: "atc", texto: "XB-VNA, autorizado a salir de la plataforma, contacte Rodaje en 121.9." },
      { de: "tu", texto: "Rodaje en 121.9, XB-VNA." },
    ],
  },
  {
    titulo: "Rueda a la pista con Rodaje",
    frecuencia: "121.9",
    nota: "Lo que nunca te puedes saltar en la colación: la pista y el punto de espera. Si no entendiste las calles, pídelas otra vez antes de moverte.",
    dialogo: [
      { de: "tu", texto: "Guadalajara Rodaje, XB-VNA, con información Alfa, listo para rodar." },
      { de: "atc", texto: "XB-VNA, ruede a punto de espera pista 11R por [las calles que te asigne], QNH [el del ATIS]." },
      { de: "tu", texto: "Ruedo a punto de espera pista 11R por [las calles], QNH [valor], XB-VNA." },
    ],
  },
  {
    titulo: "Despega con Torre",
    frecuencia: "118.1",
    nota: "Llama ya detenido en el punto de espera. Antes de entrar a la pista confirma que el GPS tiene cargada la salida de esa misma pista.",
    dialogo: [
      { de: "tu", texto: "Guadalajara Torre, XB-VNA, en punto de espera pista 11R, listo para salida." },
      { de: "atc", texto: "XB-VNA, viento 110 grados 8 nudos, pista 11R, autorizado a despegar." },
      { de: "tu", texto: "Pista 11R, autorizado a despegar, XB-VNA." },
    ],
  },
  {
    titulo: "Pasa con Salida",
    frecuencia: "La de tu autorización",
    nota: "Torre te pasa con la frecuencia de salida que anotaste. Al primer contacto di tu altitud, a qué altitud subes y en qué salida vas.",
    dialogo: [
      { de: "atc", texto: "XB-VNA, contacte Salida en 124.5." },
      { de: "tu", texto: "124.5, XB-VNA." },
      { de: "tu", texto: "Guadalajara, XB-VNA, pasando 6500 pies para  , en la salida LONKU 1D." },
    ],
  },
];

const SALIDAS = [
  {
    nombre: "LONKU 1D",
    pistas: "11L y 11R",
    tipo: "RNAV 1 · GNSS · radar",
    vigencia: "11 jul 2024",
    recorrido: "Derrota 108° durante 16.2 NM hasta GL405 y luego 098° durante 35 NM hasta LONKU.",
    restricciones: ["GL405: 9000 ft o más, máximo 220 kt", "Gradiente 3.6 % hasta 7000 ft"],
  },
  {
    nombre: "LONKU 1E",
    pistas: "29L y 29R",
    tipo: "RNAV 1 · GNSS · radar",
    vigencia: "11 jul 2024",
    recorrido: "Pasa por GL710, GL720 y GL726 y termina en LONKU. Es la más exigente de las tres.",
    restricciones: [
      "GL710: 7800 ft o más, máximo 220 kt",
      "GL720:    o más · GL726:    o más",
      "Gradiente 4.0 % hasta 7400 ft y 5.1 % hasta   ",
    ],
  },
  {
    nombre: "OVALI 1",
    pistas: "11L y 11R",
    tipo: "Convencional · VOR GDL 117.3",
    vigencia: "4 sep 2025",
    recorrido: "Radial 108 de GDL hasta 16.0 DME, viraje a la izquierda a rumbo 084° hasta interceptar el radial 101, y por él hasta OVALI.",
    restricciones: ["Gradiente 280 ft por milla (4.6 %) hasta   ", "Sin puntos de GPS: tú corriges el viento"],
  },
];

const ERRORES = [
  {
    error: "Llamar sin haber escuchado el ATIS.",
    mejor: "Primero 127.9. Sin la letra, el controlador te la tiene que dar y ya empezaste atrasado.",
  },
  {
    error: "Pedirle rodaje a Torre desde la plataforma.",
    mejor: "En MMGL son tres llamadas en tierra: Rampa (134.1), Rodaje (121.9) y Torre (118.1).",
  },
  {
    error: "Intentar memorizar la autorización.",
    mejor: "Escríbela en orden CRAFT. Si te falta una parte, pídela antes de colacionar.",
  },
  {
    error: "Volar la SID que cargó SimBrief y no la que te autorizaron.",
    mejor: "Si te dan la LONKU 1E desde la 29R, cámbiala en el GPS antes de rodar y revisa punto por punto contra la carta.",
  },
  {
    error: "Aceptar una salida que tu avión no puede subir.",
    mejor: "MMGL está a 5013 ft y en tarde caliente subes menos. Si no cumples el gradiente o una restricción, contesta «imposible» antes de despegar.",
  },
  {
    error: "Saltarse GL405 porque te autorizaron a   .",
    mejor: "Las restricciones de la salida siguen valiendo: cruzas GL405 a 9000 ft o más y a no más de 220 kt.",
  },
  {
    error: "Cambiar a 29.92 al pasar   .",
    mejor: "En MMGL la altitud de transición es   . Abajo de ella vuelas con el QNH del ATIS.",
  },
  {
    error: "En IVAO o VATSIM, llamar a una frecuencia que nadie atiende.",
    mejor: "Revisa quién está conectado. Si no hay Autorizaciones, llama al siguiente que sí esté: Rodaje, Torre o Aproximación. Si no hay nadie, anuncia tus movimientos en Unicom 122.8.",
  },
];

const ENLACE = "https://villanueva-aviation.pages.dev/aeropuertos/mmgl";

export function AeropuertoMMGL() {
  useEffect(() => registrarVisitaRuta("aeropuerto-mmgl", window.location.search), []);
  const [copiado, setCopiado] = useState(false);
  const copiar = () =>
    navigator.clipboard?.writeText(`${ENLACE}?ref=comunidad`).then(
      () => setCopiado(true),
      () => undefined,
    );

  return (
    <div>
      <PageHero
        eyebrow="Guía de aeropuerto · Gratis · Sin cuenta"
        title="Guadalajara MMGL: sal sin trabarte en la radio"
        description="Cada llamada de la salida IFR en orden: a quién le hablas, qué te van a decir y qué contestas. Con las tres salidas publicadas y los errores que más vemos en la red."
      />
      <Container className="py-12 md:py-16">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FICHA.map((f) => (
            <div key={f.dato} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <dt className="text-xs uppercase tracking-wider text-white/45">{f.dato}</dt>
              <dd className="mt-1 font-display text-lg font-semibold text-white">{f.valor}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-14 font-display text-2xl font-bold text-white sm:text-3xl">Las frecuencias, en el orden en que las usas</h2>
        <ol className="mt-6 grid gap-2">
          {FRECUENCIAS.map((f, i) => (
            <li
              key={f.quien}
              className="grid grid-cols-[1.75rem_1fr_auto] items-baseline gap-x-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 sm:grid-cols-[1.75rem_10rem_8rem_1fr]"
            >
              <span className="font-mono text-sm text-white/40">{i + 1}</span>
              <span className="text-sm font-semibold text-white">{f.quien}</span>
              <span className="font-mono text-sm text-gold-400">{f.mhz}</span>
              <span className="col-start-2 col-end-4 mt-1 text-sm text-white/60 sm:col-start-4 sm:mt-0">{f.para}</span>
            </li>
          ))}
        </ol>

        <h2 className="mt-16 font-display text-2xl font-bold text-white sm:text-3xl">La salida, llamada por llamada</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
          Ejemplo con el Cessna 172 XB-VNA, pista 11R, rumbo a Ciudad de México. La altitud, la frecuencia de salida y el código son de
          ejemplo: los tuyos te los da el controlador.
        </p>
        <ol className="mt-8 grid gap-6">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-white">
                  <span className="mr-2 text-gold-400">{i + 1}.</span>
                  {p.titulo}
                </h3>
                <span className="font-mono text-sm text-gold-400">{p.frecuencia}</span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">{p.nota}</p>
              {p.dialogo.length > 0 && (
                <div className="mt-4 grid gap-2">
                  {p.dialogo.map((l, j) => (
                    <p
                      key={j}
                      className={`max-w-2xl rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                        l.de === "tu" ? "border border-gold-500/25 bg-gold-500/[0.06] text-white" : "ml-auto border border-white/10 bg-navy-900 text-white/80"
                      }`}
                    >
                      <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-white/40">{l.de === "tu" ? "Tú" : "Control"}</span>
                      {l.texto}
                    </p>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>

        <h2 className="mt-16 font-display text-2xl font-bold text-white sm:text-3xl">Las tres salidas publicadas</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
          Lo esencial de cada carta para saber si tu avión la puede volar. Vuela siempre con la carta del ciclo vigente.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {SALIDAS.map((s) => (
            <article key={s.nombre} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="font-display text-xl font-bold text-white">{s.nombre}</h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-gold-400">Pistas {s.pistas}</p>
              <p className="mt-1 text-xs text-white/45">{s.tipo}</p>
              <p className="mt-4 text-sm leading-relaxed text-white/70">{s.recorrido}</p>
              <ul className="mt-4 grid gap-1.5">
                {s.restricciones.map((r) => (
                  <li key={r} className="text-sm text-white/80">
                    · {r}
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-4 text-xs text-white/40">Carta vigente desde el {s.vigencia}</p>
            </article>
          ))}
        </div>

        <h2 className="mt-16 font-display text-2xl font-bold text-white sm:text-3xl">Los errores que más vemos</h2>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {ERRORES.map((e) => (
            <li key={e.error} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="font-semibold text-white">{e.error}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">{e.mejor}</p>
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-gold-500/20 bg-gold-500/[0.04] p-8">
            <h2 className="font-display text-2xl font-semibold text-white">Practícalo antes de conectarte</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              La ruta "Listo para volar en red" te lleva de MMGL a MMMX en ocho lecciones, con audios para practicar la autorización. Gratis.
            </p>
            <div className="mt-6">
              <Button to={ROUTES.rutaRed}>
                Ver la ruta <ArrowRight size={16} />
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="font-display text-2xl font-semibold text-white">¿Llevas una comunidad?</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Si eres de una división de IVAO o VATSIM, de una aerolínea virtual o de un grupo de simulador, comparte esta guía con tus
              pilotos nuevos. Es gratis y no pide cuenta. ¿Algo no coincide con tu carta? Avísanos en Discord y lo corregimos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={copiar} variant="secondary">
                {copiado ? <Check size={16} /> : <Copy size={16} />} {copiado ? "Enlace copiado" : "Copiar enlace"}
              </Button>
              <Button href={DISCORD_URL} target="_blank" rel="noopener noreferrer" variant="ghost">
                Escríbenos en Discord
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-white/45">
          Procedimientos y frecuencias de las cartas Jeppesen vía Navigraph, con la fecha de cada una. Las cartas cambian por ciclo: antes de
          volar, revisa la tuya. Solo para simulación, no para navegación real. Material de práctica para simulador, no instrucción
          certificada.
        </p>
      </Container>
    </div>
  );
}
