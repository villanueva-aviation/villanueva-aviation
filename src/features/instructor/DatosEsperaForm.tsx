import type { Giros } from "../entrenador/esperas";
import type { Idioma } from "./idiomaInstructor";
import { inventarEspera, type DatosEspera } from "./navIfr";

const T = {
  es: {
    titulo: "La espera", carta: "Con carta: escribe los datos, o", inventar: "Inventar espera", curso: "Curso de acercamiento", virajes: "Virajes",
    derecha: "a la derecha", izquierda: "a la izquierda", tramo: "Tramo (s)", altitud: "Altitud (ft)", llegada: "Llego por el radial (opcional)",
    sinDatos: "Sin datos, la espera se inventa al despegar y el instructor te la dice.", inventada: "Inventada", deCarta: "De la carta",
  },
  en: {
    titulo: "The hold", carta: "From a chart: type the data, or", inventar: "Make up a hold", curso: "Inbound course", virajes: "Turns",
    derecha: "right", izquierda: "left", tramo: "Leg (s)", altitud: "Altitude (ft)", llegada: "Arriving on radial (optional)",
    sinDatos: "Without data, a hold is made up at takeoff and the instructor reads it to you.", inventada: "Made up", deCarta: "From the chart",
  },
};

const grados = (texto: string): number | null => {
  const n = Number(texto);
  return texto.trim() === "" || !Number.isFinite(n) ? null : ((Math.round(n) % 360) + 360) % 360;
};
const tres = (r: number) => String(r || 360).padStart(3, "0");
const pies = (ft: number) => ft.toLocaleString("en-US");

/** Lección 4, en la plataforma: la espera de la carta del cadete o una inventada, y por qué radial llega. */
export function DatosEsperaForm({
  datos, llegada, cambiar, cambiarLlegada, idioma, elevacionFt,
}: {
  datos: DatosEspera | null;
  llegada: number | null;
  cambiar: (d: DatosEspera | null) => void;
  cambiarLlegada: (r: number | null) => void;
  idioma: Idioma;
  /** Del aeropuerto más cercano, para la altitud de la espera inventada. */
  elevacionFt?: number;
}) {
  const t = T[idioma];
  // Tocar cualquier dato la vuelve «de carta»: se repite igual en cada intento.
  const editar = (x: { acercamiento?: number | null; giros?: Giros; tramoSeg?: number; altitudFt?: number }) => {
    const acercamiento = x.acercamiento === undefined ? (datos?.acercamiento ?? null) : x.acercamiento;
    if (acercamiento === null) return cambiar(null);
    cambiar({ acercamiento, giros: x.giros ?? datos?.giros ?? "derecha", tramoSeg: x.tramoSeg ?? datos?.tramoSeg ?? 60, altitudFt: x.altitudFt ?? datos?.altitudFt, carta: true });
  };
  const campo = "w-full rounded-lg border border-white/15 bg-navy-950 px-2 py-1.5 text-white";
  return (
    <section className="space-y-3 rounded-xl border border-white/10 p-4 text-sm">
      <p className="font-semibold text-white">{t.titulo}</p>
      <div className="flex flex-wrap items-center gap-2 text-white/70">
        <span>{t.carta}</span>
        <button type="button" onClick={() => cambiar(inventarEspera(Math.random, elevacionFt))} className="rounded-full border border-gold-500 px-3 py-1 text-gold-100">
          {t.inventar}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="space-y-1 text-white/70">
          <span className="block text-xs">{t.curso}</span>
          <input type="number" min={0} max={359} inputMode="numeric" className={campo} value={datos?.acercamiento ?? ""}
            onChange={(ev) => editar({ acercamiento: grados(ev.target.value) })} />
        </label>
        <label className="space-y-1 text-white/70">
          <span className="block text-xs">{t.virajes}</span>
          <select className={campo} value={datos?.giros ?? "derecha"} onChange={(ev) => editar({ giros: ev.target.value as Giros })}>
            <option value="derecha">{t.derecha}</option>
            <option value="izquierda">{t.izquierda}</option>
          </select>
        </label>
        <label className="space-y-1 text-white/70">
          <span className="block text-xs">{t.tramo}</span>
          <input type="number" min={30} max={180} step={15} inputMode="numeric" className={campo} value={datos?.tramoSeg ?? 60}
            onChange={(ev) => editar({ tramoSeg: Math.max(30, Number(ev.target.value) || 60) })} />
        </label>
        <label className="space-y-1 text-white/70">
          <span className="block text-xs">{t.altitud}</span>
          <input type="number" min={1000} max={18000} step={500} inputMode="numeric" className={campo} value={datos?.altitudFt ?? ""}
            onChange={(ev) => editar({ altitudFt: Number(ev.target.value) > 0 ? Number(ev.target.value) : undefined })} />
        </label>
      </div>
      <label className="block space-y-1 text-white/70">
        <span className="block text-xs">{t.llegada}</span>
        <input type="number" min={0} max={359} inputMode="numeric" className={`${campo} max-w-[8rem]`} value={llegada ?? ""}
          onChange={(ev) => cambiarLlegada(grados(ev.target.value))} />
      </label>
      <p className="text-white/60">
        {datos
          ? `${datos.carta ? t.deCarta : t.inventada}: ${t.curso.toLowerCase()} ${tres(datos.acercamiento)} · ${t.virajes.toLowerCase()} ${datos.giros === "derecha" ? t.derecha : t.izquierda} · ${datos.tramoSeg} s${datos.altitudFt ? ` · ${pies(datos.altitudFt)} ft` : ""}`
          : t.sinDatos}
      </p>
    </section>
  );
}
