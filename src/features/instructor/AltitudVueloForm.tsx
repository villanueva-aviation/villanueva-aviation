import type { Idioma } from "./idiomaInstructor";
import { textoRango, type RangoAltitud } from "./altitudVuelo";

const T = {
  es: {
    titulo: "Altitud de vuelo (ft)",
    sugerida: "Usar la sugerida",
    obligatoria: "Escribe la altitud a la que vas a volar: sin ella no se puede empezar.",
    fuera: (r: string) => `Fuera del rango: ${r.charAt(0).toLowerCase()}${r.slice(1)}`,
    sinAeropuerto: "Conecta MSFS: el rango sale de la elevación del aeropuerto y sin ella no se puede empezar.",
  },
  en: {
    titulo: "Flight altitude (ft)",
    sugerida: "Use the suggested one",
    obligatoria: "Type the altitude you are going to fly: without it you cannot start.",
    fuera: (r: string) => `Out of range: ${r.charAt(0).toLowerCase()}${r.slice(1)}`,
    sinAeropuerto: "Connect MSFS: the range comes from the airport elevation, and without it you cannot start.",
  },
};

/** La altitud de vuelo (MSL), en la pantalla previa: obligatoria, con el rango de la lección. */
export function AltitudVueloForm({
  valor, cambiar, rango, idioma,
}: {
  valor: number | null;
  cambiar: (ft: number | null) => void;
  rango: RangoAltitud;
  idioma: Idioma;
}) {
  const t = T[idioma];
  const rangoTexto = textoRango(rango, idioma);
  const fuera = valor !== null && (valor < rango.minFt || valor > rango.maxFt);
  return (
    <section className="space-y-2 rounded-xl border border-white/10 p-4 text-sm">
      <div className="flex items-end gap-2">
        <label className="flex-1 space-y-1 text-white/70">
          <span className="block font-semibold text-white">{t.titulo}</span>
          <input
            type="number" min={rango.minFt} max={rango.maxFt} step={100} inputMode="numeric"
            className="w-full rounded-lg border border-white/15 bg-navy-950 px-2 py-1.5 text-white"
            value={valor ?? ""}
            onChange={(ev) => cambiar(ev.target.value.trim() === "" ? null : Number(ev.target.value))}
          />
        </label>
        <button type="button" onClick={() => cambiar(rango.sugeridaFt)} disabled={rango.sinAeropuerto} className="rounded-full border border-gold-500 px-3 py-1 text-gold-100 disabled:opacity-40">
          {t.sugerida}
        </button>
      </div>
      {rango.sinAeropuerto ? (
        <p className="text-gold-300">{t.sinAeropuerto}</p>
      ) : (
        <>
          <p className={fuera ? "text-red-300" : "text-white/60"}>{fuera ? t.fuera(rangoTexto) : rangoTexto}</p>
          {valor === null && <p className="text-gold-300">{t.obligatoria}</p>}
        </>
      )}
    </section>
  );
}
