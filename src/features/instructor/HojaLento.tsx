import type { ResultadoLento } from "./evaluadorLento.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { ALTURA_SEGURA_AGL } from "./virajeEscarpado.ts";
import { INCLINACION_VIRAJE, OBJETIVO_KT } from "./vueloLento.ts";
import { tolLento, type Nivel } from "./nivel.ts";

// Sirve para el resultado en vivo y para el guardado (sin muestras).
type R = Pick<ResultadoLento, "aprobado" | "peor" | "fuera" | "objetivo" | "perdidas" | "bajo" | "salio" | "flaps"> & { nivel?: Nivel };

const signo = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Math.round(v))}`;
const rumbo3 = (r: number) => String(Math.round(r) % 360 || 360).padStart(3, "0");
const ALTURA = ALTURA_SEGURA_AGL.toLocaleString("en-US");

type Fila = { clave: string; nombre: Record<Idioma, string>; bien: (r: R) => boolean; valor: (r: R, idioma: Idioma) => string };

/** Las filas con las tolerancias del nivel con que se voló. */
const filas = (TOL: ReturnType<typeof tolLento>): Fila[] => [
  { clave: "altitud", nombre: { es: `Altitud ±${TOL.altitudFt} ft`, en: `Altitude ±${TOL.altitudFt} ft` }, bien: (r) => !r.fuera.altitud.length, valor: (r) => `${signo(r.peor.altitud)} ft` },
  {
    clave: "rumbo",
    nombre: { es: `Rumbo ±${TOL.rumboGrados}° (recto y salida)`, en: `Heading ±${TOL.rumboGrados}° (straight leg and recovery)` },
    bien: (r) => !r.fuera.rumbo.length,
    valor: (r) => `${signo(r.peor.rumbo)}°`,
  },
  {
    clave: "velocidad",
    nombre: { es: `Velocidad ${OBJETIVO_KT} +${TOL.velocidadMasKt}/−0 kt`, en: `Airspeed ${OBJETIVO_KT} +${TOL.velocidadMasKt}/−0 kt` },
    bien: (r) => !r.fuera.velocidad.length,
    valor: (r) => `${Math.round(OBJETIVO_KT + r.peor.velocidad)} kt`,
  },
  {
    clave: "inclinacion",
    nombre: { es: `Inclinación ${INCLINACION_VIRAJE}° ±${TOL.inclinacionGrados}°`, en: `Bank ${INCLINACION_VIRAJE}° ±${TOL.inclinacionGrados}°` },
    bien: (r) => !r.fuera.inclinacion.length,
    valor: (r) => `${Math.round(INCLINACION_VIRAJE + r.peor.inclinacion)}°`,
  },
  {
    clave: "bola",
    nombre: { es: "Coordinación (bola)", en: "Coordination (ball)" },
    bien: (r) => !r.fuera.bola.length,
    valor: (r, idioma) => (r.fuera.bola.length ? (idioma === "en" ? "out" : "fuera") : idioma === "en" ? "centered" : "centrada"),
  },
  {
    clave: "perdida",
    nombre: { es: "Aviso de pérdida", en: "Stall warning" },
    bien: (r) => !r.perdidas.length,
    valor: (r, idioma) => {
      const n = r.perdidas.length;
      if (!n) return idioma === "en" ? "did not sound" : "no sonó";
      return idioma === "en" ? `sounded ${n === 1 ? "once" : `${n} times`}` : `sonó ${n === 1 ? "una vez" : `${n} veces`}`;
    },
  },
  {
    clave: "altura",
    nombre: { es: "Altura", en: "Height" },
    bien: (r) => !r.bajo,
    valor: (r, idioma) =>
      r.bajo ? (idioma === "en" ? `below ${ALTURA} ft AGL` : `abajo de ${ALTURA} ft AGL`) : `≥ ${ALTURA} ft AGL`,
  },
  {
    clave: "salida",
    nombre: { es: "Salida con potencia", en: "Recovery with power" },
    bien: (r) => r.salio,
    valor: (r, idioma) => (r.salio ? (idioma === "en" ? "yes" : "sí") : "no"),
  },
];

const T = {
  es: { titulo: "Vuelo lento", si: "APROBADO", no: "NO APROBADO", tolerancia: "Tolerancia", peor: "Peor valor", objetivo: "Objetivo", flaps: "Flaps al empezar: posición" },
  en: { titulo: "Slow flight", si: "PASSED", no: "NOT PASSED", tolerancia: "Tolerance", peor: "Worst value", objetivo: "Target", flaps: "Flaps at the start: position" },
};

/** Cada tolerancia con su peor valor, más el aviso de pérdida, la altura y la salida. */
export function HojaLento({ resultado, idioma = "es" }: { resultado: R; idioma?: Idioma }) {
  const t = T[idioma];
  const o = resultado.objetivo;
  const TOL = tolLento(resultado.nivel);
  const FILAS = filas(TOL);
  const malos = FILAS.filter((f) => !f.bien(resultado)).length;
  const resumen =
    idioma === "en"
      ? malos === 0 ? `All ${FILAS.length} criteria within tolerance.` : `${malos} of ${FILAS.length} criteria out of tolerance.`
      : malos === 0 ? `Los ${FILAS.length} criterios dentro de tolerancia.` : `${malos} de ${FILAS.length} criterios fuera de tolerancia.`;
  return (
    <section className="rounded-xl border border-white/10 bg-navy-900/60 p-5">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-white">{t.titulo}</h3>
        <span className={`rounded px-2 py-0.5 text-sm font-semibold ${resultado.aprobado ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/60 text-red-300"}`}>
          {resultado.aprobado ? t.si : t.no}
        </span>
      </div>
      <p className="mb-3 text-sm text-white/60">
        {t.objetivo}: {(Math.round(o.altitud / 10) * 10).toLocaleString("en-US")} ft · {rumbo3(o.rumbo)}° · {OBJETIVO_KT}–{OBJETIVO_KT + TOL.velocidadMasKt} kt
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-white/50">
            <th className="py-1 pr-3 font-normal">{t.tolerancia}</th>
            <th className="py-1 pr-3 font-normal">{t.peor}</th>
          </tr>
        </thead>
        <tbody>
          {FILAS.map((f) => {
            const bien = f.bien(resultado);
            return (
              <tr key={f.clave} className="border-t border-white/5">
                <td className="py-1.5 pr-3 text-white/80">{f.nombre[idioma]}</td>
                <td className={`py-1.5 pr-3 font-medium ${bien ? "text-emerald-300" : "text-red-300"}`}>
                  {f.valor(resultado, idioma)} {bien ? "✓" : "✗"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-sm text-white/50">{resumen}</p>
      <p className="mt-1 text-xs text-white/40">
        {t.flaps} {resultado.flaps}
      </p>
    </section>
  );
}
