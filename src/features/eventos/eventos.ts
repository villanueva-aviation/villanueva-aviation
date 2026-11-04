// Eventos públicos de IVAO y VATSIM en el mundo hispano. Las dos APIs son abiertas (CORS *), así que se
// leen directo desde el navegador. IVAO solo devuelve sus ~20 próximos eventos; VATSIM, todos los publicados.

export const URL_IVAO = "https://api.ivao.aero/v1/events";
export const URL_VATSIM = "https://my.vatsim.net/api/v2/events/latest";

export type Red = "IVAO" | "VATSIM";
export interface Evento {
  red: Red;
  id: string;
  titulo: string;
  inicio: string; // ISO UTC
  fin: string;
  aeropuertos: string[];
  enlace: string;
  imagen: string | null;
}

// México, Centroamérica, Caribe hispano, Sudamérica hispana, España y Canarias. Sin Brasil (SB/SD/SN/SS/SW).
const PREFIJOS = ["MM", "MG", "MH", "MN", "MR", "MP", "MS", "MD", "MU", "TJ", "SK", "SE", "SP", "SL", "SC", "SA", "SU", "SG", "SV", "LE", "GC"];
export const esHispano = (icao: string) => PREFIJOS.some((p) => icao.startsWith(p));

/** IVAO manda los aeropuertos a veces como lista y a veces pegados ("LSGGLSGS"); los partimos de 4 en 4. */
function icaos(v: unknown): string[] {
  const texto = Array.isArray(v) ? v.join(" ") : String(v ?? "");
  return [...new Set((texto.toUpperCase().match(/[A-Z0-9]+/g) ?? []).flatMap((t) => t.match(/[A-Z0-9]{4}/g) ?? []))];
}

type Crudo = Record<string, unknown>;

export function desdeIvao(lista: Crudo[]): Evento[] {
  return lista.map((e) => ({
    red: "IVAO",
    id: String(e.id),
    titulo: String(e.title ?? "").trim(),
    inicio: String(e.startDate),
    fin: String(e.endDate),
    aeropuertos: icaos(e.airports),
    enlace: String(e.infoUrl || "https://www.ivao.aero/events"),
    imagen: typeof e.imageUrl === "string" && e.imageUrl.startsWith("https://") ? e.imageUrl : null,
  }));
}

export function desdeVatsim(datos: { data?: Crudo[] }): Evento[] {
  return (datos.data ?? [])
    .filter((e) => e.type !== "Controller Examination")
    .map((e) => ({
      red: "VATSIM",
      id: String(e.id),
      titulo: String(e.name ?? "").trim(),
      inicio: String(e.start_time),
      fin: String(e.end_time),
      aeropuertos: icaos((e.airports as { icao: string }[] | undefined)?.map((a) => a.icao)),
      enlace: String(e.link || "https://my.vatsim.net/events"),
      imagen: typeof e.banner === "string" && e.banner.startsWith("https://") ? e.banner : null,
    }));
}

/** Solo los que tocan algún aeropuerto hispano y no han terminado, del más próximo al más lejano. */
export function filtrar(eventos: Evento[], ahora = Date.now()): Evento[] {
  return eventos
    .filter((e) => e.aeropuertos.some(esHispano) && Date.parse(e.fin) > ahora)
    .sort((a, b) => Date.parse(a.inicio) - Date.parse(b.inicio));
}

/** Si una red falla, se muestran los de la otra. */
export async function cargarEventos(): Promise<{ eventos: Evento[]; fallaron: Red[] }> {
  const pedir = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))));
  const [ivao, vatsim] = await Promise.allSettled([pedir(URL_IVAO), pedir(URL_VATSIM)]);
  const fallaron: Red[] = [];
  const todos: Evento[] = [];
  if (ivao.status === "fulfilled" && Array.isArray(ivao.value)) todos.push(...desdeIvao(ivao.value));
  else fallaron.push("IVAO");
  if (vatsim.status === "fulfilled") todos.push(...desdeVatsim(vatsim.value));
  else fallaron.push("VATSIM");
  return { eventos: filtrar(todos), fallaron };
}
