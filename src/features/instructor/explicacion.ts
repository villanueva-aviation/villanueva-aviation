import { difRumbo, type Campo, type Muestra, type Resultado, type ResultadoLado, type Tramo } from "./evaluador.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { INCLINACION_OBJETIVO, TOLERANCIAS } from "./virajeEscarpado.ts";

export interface Linea {
  tipo: "bien" | "mal";
  texto: string;
}

const nombre = (l: ResultadoLado, idioma: Idioma = "es") =>
  idioma === "en" ? (l.lado === "izquierda" ? "Left turn" : "Right turn") : l.lado === "izquierda" ? "Viraje izquierdo" : "Viraje derecho";
const segundos = (tramos: Tramo[]) => tramos.reduce((s, tr) => s + tr.fin - tr.inicio, 0);

/** Grados girados desde la entrada del lado hasta el instante t. */
function giradoEn(muestras: Muestra[], l: ResultadoLado, t: number): number {
  const tramo = muestras.filter((m) => m.t >= l.entrada.t && m.t <= t);
  return tramo.reduce((s, m, k) => (k === 0 ? 0 : s + Math.abs(difRumbo(m.rumbo, tramo[k - 1].rumbo))), 0);
}

function errores(r: Resultado, l: ResultadoLado, idioma: Idioma): string[] {
  const en = idioma === "en";
  const L = nombre(l, idioma);
  const out: string[] = [];
  const bajo = l.fuera.altitud.filter((tr) => tr.peor < 0);
  const alto = l.fuera.altitud.filter((tr) => tr.peor > 0);
  if (bajo.length) {
    const peor = bajo.reduce((a, b) => (b.peor < a.peor ? b : a));
    const g = Math.round(giradoEn(r.muestras, l, bajo[0].inicio) / 10) * 10;
    const ft = Math.round(-peor.peor);
    out.push(
      en
        ? `${L}: you lost ${ft} ft at ${g}°. Entering the turn you needed more back pressure on the yoke to make up for the lift that tilts sideways.`
        : `${L}: perdiste ${ft} ft al llegar a ${g}°. Al entrar al viraje faltó presión atrás en el yugo para compensar la sustentación que se va de lado.`,
    );
  }
  if (alto.length) {
    const ft = Math.round(Math.max(...alto.map((tr) => tr.peor)));
    out.push(en ? `${L}: you gained ${ft} ft. Ease the back pressure a little and use the trim.` : `${L}: subiste ${ft} ft. Afloja un poco la presión atrás y usa el compensador.`);
  }
  const sobre = l.fuera.inclinacion.filter((tr) => tr.peor > 0);
  const debajo = l.fuera.inclinacion.filter((tr) => tr.peor < 0);
  if (sobre.length) {
    const g = Math.round(INCLINACION_OBJETIVO + Math.max(...sobre.map((tr) => tr.peor)));
    const s = Math.max(1, Math.round(segundos(sobre)));
    out.push(
      en
        ? `${L}: you went to ${g}° for about ${s} seconds. Stop the roll a little before 45°.`
        : `${L}: te pasaste a ${g}° unos ${s} segundos. Detén el alabeo un poco antes de los 45°.`,
    );
  }
  if (debajo.length) {
    const g = Math.round(INCLINACION_OBJETIVO + Math.min(...debajo.map((tr) => tr.peor)));
    out.push(en ? `${L}: you stayed at ${g}°. Add a little more bank and hold it.` : `${L}: te quedaste en ${g}°. Mete un poco más de alabeo y sostenlo.`);
  }
  if (l.fuera.velocidad.length) {
    const kt = Math.round(l.entrada.velocidad + l.peor.velocidad);
    out.push(
      en
        ? `${L}: airspeed reached ${kt} kt. Adjust power on entry: drag goes up in the turn.`
        : `${L}: la velocidad llegó a ${kt} kt. Ajusta potencia al entrar: en el viraje la resistencia sube.`,
    );
  }
  if (l.fuera.bola.length) {
    out.push(
      en
        ? `${L}: the turn wasn't coordinated. Center the ball with the rudder on the side it went to.`
        : `${L}: el viraje no fue coordinado. Centra la bola con el pedal del lado al que se fue.`,
    );
  }
  if (Math.abs(l.rumboSalida) > TOLERANCIAS.rumboSalidaGrados) {
    // Izquierdo: el rumbo baja, así que quedar arriba del de entrada es nivelar antes.
    const antes = l.lado === "izquierda" ? l.rumboSalida > 0 : l.rumboSalida < 0;
    const g = Math.round(Math.abs(l.rumboSalida));
    out.push(
      en
        ? `${L}: you rolled out ${g}° ${antes ? "before" : "past"} your entry heading. Start rolling out about 20° early.`
        : `${L}: saliste ${g}° ${antes ? "antes" : "después"} del rumbo de entrada. Empieza a nivelar unos 20° antes.`,
    );
  }
  return out;
}

const ETIQUETA: Record<Idioma, Record<Campo | "rumbo", string>> = {
  es: { altitud: "altitud", inclinacion: "inclinación", velocidad: "velocidad", bola: "coordinación", rumbo: "rumbo de salida" },
  en: { altitud: "altitude", inclinacion: "bank", velocidad: "airspeed", bola: "coordination", rumbo: "exit heading" },
};

export function explicar(r: Resultado, idioma: Idioma = "es"): Linea[] {
  const en = idioma === "en";
  const lineas: Linea[] = [];
  if (r.elementos["PA.V.A.S1"] === "NS") {
    lineas.push({
      tipo: "mal",
      texto: en
        ? "You didn't do clearing turns before entering: look for traffic with a turn of at least 90°."
        : "No hiciste virajes de limpieza antes de entrar: busca tráfico con un viraje de al menos 90°.",
    });
  }
  const rapido = r.lados.find((l) => l.entrada.velocidad > l.entrada.va);
  if (rapido) {
    const v = Math.round(rapido.entrada.velocidad);
    const va = Math.round(rapido.entrada.va);
    lineas.push({
      tipo: "mal",
      texto: en ? `You entered at ${v} kt, above Va (${va} kt) for your weight.` : `Entraste a ${v} kt, arriba de Va (${va} kt) para tu peso.`,
    });
  }
  for (const l of r.lados) for (const texto of errores(r, l, idioma)) lineas.push({ tipo: "mal", texto });

  const limpios = (["altitud", "inclinacion", "velocidad", "bola", "rumbo"] as const).filter((c) =>
    r.lados.every((l) => (c === "rumbo" ? Math.abs(l.rumboSalida) <= TOLERANCIAS.rumboSalidaGrados : l.fuera[c].length === 0)),
  );
  if (limpios.length && r.lados.length === 2) {
    const nombres = limpios.map((c) => ETIQUETA[idioma][c]);
    const y = en ? "and" : "y";
    const lista = nombres.length === 1 ? nombres[0] : `${nombres.slice(0, -1).join(", ")} ${y} ${nombres[nombres.length - 1]}`;
    lineas.push({ tipo: "bien", texto: `${lista[0].toUpperCase()}${lista.slice(1)}${en ? ", good on both turns." : ", bien en los dos."}` });
  }
  return lineas;
}

export function repetir(r: Resultado, idioma: Idioma = "es"): string | null {
  if (r.aprobado) return null;
  const en = idioma === "en";
  const fallados = r.lados.filter((l) => Object.values(l.ns).some(Boolean));
  if (fallados.length === 1) return `${en ? "Repeat" : "Repite"}: ${nombre(fallados[0], idioma).toLowerCase()}`;
  if (fallados.length === 2) return en ? "Repeat: both turns" : "Repite: los dos virajes";
  return en ? "Repeat: the whole maneuver" : "Repite: la maniobra completa";
}

/** Desviación respecto a ref (inclinación: |inclinación| − 45), reducida a maxPuntos conservando el extremo de cada tramo. */
export function serie(muestras: Muestra[], campo: Campo, ref: number, maxPuntos = 300): { t: number; v: number }[] {
  const puntos = muestras.map((m) => ({
    t: m.t,
    v: campo === "inclinacion" ? Math.abs(m.inclinacion) - INCLINACION_OBJETIVO : m[campo] - ref,
  }));
  return reducir(puntos, maxPuntos);
}

/** A lo más maxPuntos, guardando el punto más alejado de cero de cada cubeta. */
export function reducir(puntos: { t: number; v: number }[], maxPuntos = 300): { t: number; v: number }[] {
  const paso = Math.ceil(puntos.length / maxPuntos);
  if (paso <= 1) return puntos;
  const out: { t: number; v: number }[] = [];
  for (let i = 0; i < puntos.length; i += paso) {
    const cubeta = puntos.slice(i, i + paso);
    out.push(cubeta.reduce((a, b) => (Math.abs(b.v) > Math.abs(a.v) ? b : a)));
  }
  return out;
}
