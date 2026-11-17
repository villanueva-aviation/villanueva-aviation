// Motor de la lección estilo Rise: arma los capítulos de un módulo, cada uno con su lista de bloques,
// usando solo el contenido que ya existe (no escribe texto técnico nuevo). Los componentes solo pintan bloques.
import { ACADEMIA_MODULOS, type ModuloActividad } from "../../../data/academia.ts";
import { checkpointsDeModulo, flattenTemas, MODULE_LECCIONES, type Tema } from "../../../data/moduleContent.ts";
import { MISIONES } from "../../../data/misiones.ts";
import { ESCENAS, type Visual } from "../../../data/escenas.ts";
import { pasosDeTema } from "../lecturaScroll.ts";
import type { QuizPregunta } from "../quizData.ts";

export interface Tarjeta {
  /** Título del tema del punto: algunos puntos son genéricos («Qué es») y sin el tema no se entienden. */
  tema: string;
  frente: string;
  reverso: string;
}

export type Bloque =
  | { tipo: "portada"; imagen: string | null; gancho: string | null }
  | { tipo: "video"; youtubeId: string }
  | { tipo: "lectura"; temas: Tema[] }
  | { tipo: "candado"; pregunta: QuizPregunta }
  | { tipo: "tarjetas"; tarjetas: Tarjeta[] }
  | { tipo: "interactivo"; actividad: ModuloActividad }
  | { tipo: "simulador"; pasos: string[] }
  | { tipo: "cierre" };

export interface Capitulo {
  id: string;
  titulo: string;
  minutos: number;
  /** Ids de las actividades "leccion" que se leen en el capítulo. */
  temas: string[];
  /** Ids de las actividades "interactividad" del capítulo. */
  interactivos: string[];
  bloques: Bloque[];
}

const MAX_TARJETAS = 6;
const PALABRAS_POR_MINUTO = 180;
const MINUTOS_POR_INTERACTIVO = 2;

/** Un visual por paso del tema: la escena hecha a mano si existe; si no, sus imágenes repartidas entre los pasos. */
export function visualesDeTema(tema: Tema): Visual[] {
  const escena = ESCENAS[tema.id];
  if (escena) return escena;
  const imgs = tema.imagenes ?? [];
  if (imgs.length === 0) return [];
  const n = pasosDeTema(tema).length;
  return Array.from({ length: n }, (_, p) => ({ tipo: "foto", src: imgs[Math.floor((p * imgs.length) / n)], alt: tema.titulo }));
}

function imagenDe(v: Visual | undefined): string | null {
  if (!v) return null;
  return v.tipo === "foto" ? v.src : v.poster;
}

const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Repaso del capítulo: el primer punto de cada tema (hasta 6, repartidos); sin bloque si salen menos de 2. */
function tarjetasDe(temas: Tema[]): Bloque[] {
  const todas = temas.flatMap((t) => (t.puntos?.length ? [{ tema: t.titulo, frente: t.puntos[0].titulo, reverso: mayuscula(t.puntos[0].texto) }] : []));
  const n = todas.length;
  const tarjetas = n <= MAX_TARJETAS ? todas : Array.from({ length: MAX_TARJETAS }, (_, k) => todas[Math.floor((k * n) / MAX_TARJETAS)]);
  return tarjetas.length >= 2 ? [{ tipo: "tarjetas", tarjetas }] : [];
}

function contarPalabras(temas: Tema[]): number {
  const texto = temas.flatMap((t) => [t.clave ?? "", ...(t.puntos ?? []).flatMap((p) => [p.titulo, p.texto])]).join(" ");
  return texto.split(/\s+/).filter(Boolean).length;
}

function interactivo(actividad: ModuloActividad): Bloque {
  return { tipo: "interactivo", actividad };
}

export function armarCapitulos(slug: string): Capitulo[] {
  const modulo = ACADEMIA_MODULOS.find((m) => m.slug === slug);
  const temas = flattenTemas(slug);
  if (!modulo || !temas) return [];
  const actividad = (id: string) => modulo.actividades.find((a) => a.id === id);

  const misiones = MISIONES[slug];
  if (misiones) {
    return misiones.map((m) => {
      const propios = m.temas.flatMap((id) => temas.filter((t) => t.id === id));
      const bloques: Bloque[] = [
        { tipo: "portada", imagen: propios[0] ? imagenDe(visualesDeTema(propios[0])[0]) : null, gancho: m.gancho },
        ...(m.videoId ? [{ tipo: "video", youtubeId: m.videoId } as const] : []),
        { tipo: "lectura", temas: propios },
        ...tarjetasDe(propios),
        ...m.interactivos.flatMap((id) => {
          const a = actividad(id);
          return a ? [interactivo(a)] : [];
        }),
        { tipo: "simulador", pasos: m.enSimulador },
        ...m.preguntas.map((pregunta) => ({ tipo: "candado", pregunta }) as const),
        { tipo: "cierre" },
      ];
      return { id: m.id, titulo: m.titulo, minutos: m.minutos, temas: m.temas, interactivos: m.interactivos, bloques };
    });
  }

  const grupos = MODULE_LECCIONES[slug] ?? [];
  const inter = modulo.actividades.filter((a) => a.tipo === "interactividad");
  const checkpoints = checkpointsDeModulo(slug);
  let inicio = 0;
  return grupos.map((g, i) => {
    const propios = temas.slice(inicio, inicio + g.temas.length);
    const desde = inicio;
    inicio += g.temas.length;
    const suyos = inter.slice(Math.floor((i * inter.length) / grupos.length), Math.floor(((i + 1) * inter.length) / grupos.length));

    // Tramos de lectura cortados por un candado justo después del tema de cada comprobación.
    const lectura: Bloque[] = [];
    let tramo: Tema[] = [];
    propios.forEach((tema, k) => {
      tramo.push(tema);
      const cp = checkpoints.find((c) => c.despuesDeTema === desde + k);
      if (cp) {
        lectura.push({ tipo: "lectura", temas: tramo }, { tipo: "candado", pregunta: cp.pregunta });
        tramo = [];
      }
    });
    if (tramo.length) lectura.push({ tipo: "lectura", temas: tramo });

    const imagen = propios.find((t) => t.imagenes?.length)?.imagenes?.[0] ?? null;
    const bloques: Bloque[] = [
      { tipo: "portada", imagen, gancho: null },
      ...lectura,
      ...tarjetasDe(propios),
      ...suyos.map(interactivo),
      { tipo: "cierre" },
    ];
    const minutos = Math.max(3, Math.round(contarPalabras(propios) / PALABRAS_POR_MINUTO + MINUTOS_POR_INTERACTIVO * suyos.length));
    return {
      id: `${slug}-cap${i + 1}`,
      titulo: g.titulo,
      minutos,
      temas: propios.map((t) => t.id),
      interactivos: suyos.map((a) => a.id),
      bloques,
    };
  });
}

export function capituloCompleto(c: Capitulo, hecha: (id: string) => boolean): boolean {
  return [...c.temas, ...c.interactivos].every(hecha);
}

/** El primer capítulo sin terminar (o el último, si todos están completos). */
export function capituloInicial(caps: Capitulo[], hecha: (id: string) => boolean): number {
  const i = caps.findIndex((c) => !capituloCompleto(c, hecha));
  return i === -1 ? caps.length - 1 : i;
}
