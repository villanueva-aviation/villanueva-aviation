import { difRumbo, type Campo, type Muestra, type Resultado, type ResultadoLado, type Tramo } from "./evaluador.ts";
import { INCLINACION_OBJETIVO, TOLERANCIAS } from "./virajeEscarpado.ts";

export interface Linea {
  tipo: "bien" | "mal";
  texto: string;
}

const nombre = (l: ResultadoLado) => (l.lado === "izquierda" ? "Viraje izquierdo" : "Viraje derecho");
const segundos = (tramos: Tramo[]) => tramos.reduce((s, tr) => s + tr.fin - tr.inicio, 0);

/** Grados girados desde la entrada del lado hasta el instante t. */
function giradoEn(muestras: Muestra[], l: ResultadoLado, t: number): number {
  const tramo = muestras.filter((m) => m.t >= l.entrada.t && m.t <= t);
  return tramo.reduce((s, m, k) => (k === 0 ? 0 : s + Math.abs(difRumbo(m.rumbo, tramo[k - 1].rumbo))), 0);
}

function errores(r: Resultado, l: ResultadoLado): string[] {
  const L = nombre(l);
  const out: string[] = [];
  const bajo = l.fuera.altitud.filter((tr) => tr.peor < 0);
  const alto = l.fuera.altitud.filter((tr) => tr.peor > 0);
  if (bajo.length) {
    const peor = bajo.reduce((a, b) => (b.peor < a.peor ? b : a));
    const g = Math.round(giradoEn(r.muestras, l, bajo[0].inicio) / 10) * 10;
    out.push(`${L}: perdiste ${Math.round(-peor.peor)} ft al llegar a ${g}°. Al entrar al viraje faltó presión atrás en el yugo para compensar la sustentación que se va de lado.`);
  }
  if (alto.length) {
    out.push(`${L}: subiste ${Math.round(Math.max(...alto.map((tr) => tr.peor)))} ft. Afloja un poco la presión atrás y usa el compensador.`);
  }
  const sobre = l.fuera.inclinacion.filter((tr) => tr.peor > 0);
  const debajo = l.fuera.inclinacion.filter((tr) => tr.peor < 0);
  if (sobre.length) {
    const g = Math.round(INCLINACION_OBJETIVO + Math.max(...sobre.map((tr) => tr.peor)));
    out.push(`${L}: te pasaste a ${g}° unos ${Math.max(1, Math.round(segundos(sobre)))} segundos. Detén el alabeo un poco antes de los 45°.`);
  }
  if (debajo.length) {
    const g = Math.round(INCLINACION_OBJETIVO + Math.min(...debajo.map((tr) => tr.peor)));
    out.push(`${L}: te quedaste en ${g}°. Mete un poco más de alabeo y sostenlo.`);
  }
  if (l.fuera.velocidad.length) {
    out.push(`${L}: la velocidad llegó a ${Math.round(l.entrada.velocidad + l.peor.velocidad)} kt. Ajusta potencia al entrar: en el viraje la resistencia sube.`);
  }
  if (l.fuera.bola.length) {
    out.push(`${L}: el viraje no fue coordinado. Centra la bola con el pedal del lado al que se fue.`);
  }
  if (Math.abs(l.rumboSalida) > TOLERANCIAS.rumboSalidaGrados) {
    // Izquierdo: el rumbo baja, así que quedar arriba del de entrada es nivelar antes.
    const antes = l.lado === "izquierda" ? l.rumboSalida > 0 : l.rumboSalida < 0;
    out.push(`${L}: saliste ${Math.round(Math.abs(l.rumboSalida))}° ${antes ? "antes" : "después"} del rumbo de entrada. Empieza a nivelar unos 20° antes.`);
  }
  return out;
}

const ETIQUETA: Record<Campo | "rumbo", string> = {
  altitud: "altitud",
  inclinacion: "inclinación",
  velocidad: "velocidad",
  bola: "coordinación",
  rumbo: "rumbo de salida",
};

export function explicar(r: Resultado): Linea[] {
  const lineas: Linea[] = [];
  if (r.elementos["PA.V.A.S1"] === "NS") {
    lineas.push({ tipo: "mal", texto: "No hiciste virajes de limpieza antes de entrar: busca tráfico con un viraje de al menos 90°." });
  }
  const rapido = r.lados.find((l) => l.entrada.velocidad > l.entrada.va);
  if (rapido) {
    lineas.push({ tipo: "mal", texto: `Entraste a ${Math.round(rapido.entrada.velocidad)} kt, arriba de Va (${Math.round(rapido.entrada.va)} kt) para tu peso.` });
  }
  for (const l of r.lados) for (const texto of errores(r, l)) lineas.push({ tipo: "mal", texto });

  const limpios = (["altitud", "inclinacion", "velocidad", "bola", "rumbo"] as const).filter((c) =>
    r.lados.every((l) => (c === "rumbo" ? Math.abs(l.rumboSalida) <= TOLERANCIAS.rumboSalidaGrados : l.fuera[c].length === 0)),
  );
  if (limpios.length && r.lados.length === 2) {
    const nombres = limpios.map((c) => ETIQUETA[c]);
    const lista = nombres.length === 1 ? nombres[0] : `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
    lineas.push({ tipo: "bien", texto: `${lista[0].toUpperCase()}${lista.slice(1)}, bien en los dos.` });
  }
  return lineas;
}

export function repetir(r: Resultado): string | null {
  if (r.aprobado) return null;
  const fallados = r.lados.filter((l) => Object.values(l.ns).some(Boolean));
  if (fallados.length === 1) return `Repite: ${nombre(fallados[0]).toLowerCase()}`;
  if (fallados.length === 2) return "Repite: los dos virajes";
  return "Repite: la maniobra completa";
}

/** Desviación respecto a ref (inclinación: |inclinación| − 45), reducida a maxPuntos conservando el extremo de cada tramo. */
export function serie(muestras: Muestra[], campo: Campo, ref: number, maxPuntos = 300): { t: number; v: number }[] {
  const puntos = muestras.map((m) => ({
    t: m.t,
    v: campo === "inclinacion" ? Math.abs(m.inclinacion) - INCLINACION_OBJETIVO : m[campo] - ref,
  }));
  const paso = Math.ceil(puntos.length / maxPuntos);
  if (paso <= 1) return puntos;
  const out: { t: number; v: number }[] = [];
  for (let i = 0; i < puntos.length; i += paso) {
    const cubeta = puntos.slice(i, i + paso);
    out.push(cubeta.reduce((a, b) => (Math.abs(b.v) > Math.abs(a.v) ? b : a)));
  }
  return out;
}

