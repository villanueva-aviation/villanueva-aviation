import type { Idioma } from "./idiomaInstructor.ts";

// Preguntas de respuesta corta que el instructor hace en voz alta. Se califican por ideas clave:
// la respuesta es correcta si contiene una de las aceptadas, comparadas sin acentos y con los números en cifras.

export type Tema = "viraje-escarpado" | "c172";
export type TextoPregunta = { pregunta: string; respuesta: string; aceptadas: string[] };
export type Pregunta = { id: string; tema: Tema; es: TextoPregunta; en: TextoPregunta };
export type Respondida = { id: string; correcta: boolean };

const UNIDADES_ES = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
const UNIDADES_EN = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

const VALOR: Record<Idioma, Record<string, number>> = { es: {}, en: {} };
UNIDADES_ES.forEach((w, i) => (VALOR.es[w] = i));
UNIDADES_EN.forEach((w, i) => (VALOR.en[w] = i));
Object.assign(VALOR.es, {
  un: 1, una: 1, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15,
  dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
  veinte: 20, veintiun: 21, veintiuno: 21, veintidos: 22, veintitres: 23, veinticuatro: 24,
  veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
  treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90,
  cien: 100, ciento: 100,
});
for (const [raiz, v] of [["dos", 200], ["tres", 300], ["cuatro", 400], ["quin", 500], ["seis", 600], ["sete", 700], ["ocho", 800], ["nove", 900]] as const) {
  const base = raiz === "quin" ? "quinient" : `${raiz}cient`;
  VALOR.es[`${base}os`] = v;
  VALOR.es[`${base}as`] = v;
}
Object.assign(VALOR.en, {
  niner: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
});
const MULTIPLO: Record<Idioma, Record<string, number>> = { es: { mil: 1000 }, en: { hundred: 100, thousand: 1000 } };
const CONECTOR: Record<Idioma, string> = { es: "y", en: "and" };

const esNumero = (w: string, i: Idioma) => w in VALOR[i] || w in MULTIPLO[i];

/** Una secuencia de palabras-número a cifras. Solo dígitos sueltos («dos siete cero») se juntan como un rumbo. */
function aCifras(palabras: string[], i: Idioma): string {
  if (palabras.length > 1 && palabras.every((w) => w in VALOR[i] && VALOR[i][w] < 10)) {
    return palabras.map((w) => VALOR[i][w]).join("");
  }
  let total = 0;
  let actual = 0;
  for (const w of palabras) {
    const m = MULTIPLO[i][w];
    if (m === 1000) {
      total += (actual || 1) * 1000;
      actual = 0;
    } else if (m === 100) actual = (actual || 1) * 100;
    else actual += VALOR[i][w];
  }
  return String(total + actual);
}

/** Minúsculas, sin acentos ni signos, y los números dichos con palabras en cifras. */
export function normalizar(texto: string, idioma: Idioma): string {
  const palabras = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/(\d),(\d{3})(?!\d)/g, "$1$2") // «1,500» es un número, no dos
    .replace(/(\d)([a-z])/g, "$1 $2")
    .replace(/([a-z])(\d)/g, "$1 $2")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const salida: string[] = [];
  let k = 0;
  while (k < palabras.length) {
    if (!esNumero(palabras[k], idioma)) {
      salida.push(palabras[k++]);
      continue;
    }
    const secuencia: string[] = [];
    while (k < palabras.length) {
      const w = palabras[k];
      if (esNumero(w, idioma)) secuencia.push(w);
      // «cuarenta y cinco», «one hundred and five»: el conector solo cuenta entre dos números.
      else if (w === CONECTOR[idioma] && k + 1 < palabras.length && esNumero(palabras[k + 1], idioma)) {
        // se salta
      } else break;
      k++;
    }
    salida.push(aCifras(secuencia, idioma));
  }
  return salida.join(" ");
}

export function calificarRespuesta(dicho: string, p: Pregunta, idioma: Idioma): boolean {
  const d = ` ${normalizar(dicho, idioma)} `;
  return p[idioma].aceptadas.some((a) => {
    const n = normalizar(a, idioma);
    return n !== "" && d.includes(` ${n} `);
  });
}

/** Una al azar de esos temas que no haya salido; si ya salieron todas, vuelve a usar todas. */
export function siguientePregunta(banco: Pregunta[], temas: Tema[], hechas: string[], azar: () => number = Math.random): Pregunta | null {
  const delTema = banco.filter((p) => temas.includes(p.tema));
  if (!delTema.length) return null;
  const libres = delTema.filter((p) => !hechas.includes(p.id));
  const opciones = libres.length ? libres : delTema;
  return opciones[Math.min(opciones.length - 1, Math.floor(azar() * opciones.length))];
}

/** Para el debriefing: el total y las falladas con su respuesta. Vacía si no hubo preguntas. */
export function lineasPreguntas(respondidas: Respondida[], banco: Pregunta[], idioma: Idioma): string[] {
  if (!respondidas.length) return [];
  const bien = respondidas.filter((r) => r.correcta).length;
  const n = respondidas.length;
  const lineas = [idioma === "en" ? `Questions: ${bien} of ${n} correct.` : `Preguntas: ${bien} de ${n} correctas.`];
  const falladas = [...new Set(respondidas.filter((r) => !r.correcta).map((r) => r.id))];
  for (const id of falladas) {
    const p = banco.find((x) => x.id === id);
    if (!p) continue;
    const t = p[idioma];
    lineas.push(idioma === "en" ? `"${t.pregunta}" → ${t.respuesta}` : `«${t.pregunta}» → ${t.respuesta}`);
  }
  return lineas;
}
