// Textos del clima compartidos por el Briefing (web) y el bot de Discord.
import {
  altitudDensidad, categoriaVuelo, componentesViento, fenomenos, techoFt, textoNube, textoViento,
  textoVisibilidad, visibilidadSM,
  type Categoria, type Metar, type PeriodoTaf, type Taf,
} from "./clima.ts";

export const DESCRIPCION_CATEGORIA: Record<Categoria, string> = {
  VFR: "Condiciones visuales",
  MVFR: "Visuales marginales",
  IFR: "Condiciones por instrumentos",
  LIFR: "Instrumentos, muy bajas",
};

const COLOR_EMBED: Record<Categoria, number> = { VFR: 0x34d399, MVFR: 0x3b82f6, IFR: 0xef4444, LIFR: 0xd946ef };
const COLOR_SIN_CATEGORIA = 0x5a6472;

/** Solo la primera letra: "SM" y "kt" se quedan como están. */
export const minuscula = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
export const pies = (n: number) => `${Math.round(n).toLocaleString("es-MX")} ft`;

export function horaZ(ts: number) {
  const d = new Date(ts * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}/${p(d.getUTCHours())}${p(d.getUTCMinutes())}Z`;
}

const ETIQUETA_CAMBIO: Record<string, string> = { FM: "Desde", BECMG: "Cambio gradual", TEMPO: "Temporal", PROB: "Probabilidad" };

export function etiquetaPeriodo(p: PeriodoTaf) {
  if (p.fcstChange === null) return "Pronóstico base";
  const base = ETIQUETA_CAMBIO[p.fcstChange] ?? p.fcstChange;
  return p.fcstChange === "PROB" && p.probability ? `${base} ${p.probability} %` : base;
}

export function resumenPeriodo(p: PeriodoTaf): string[] {
  const partes: string[] = [];
  if (p.wspd !== null) partes.push(`Viento ${minuscula(textoViento(p.wdir, p.wspd, p.wgst))}`);
  if (p.visib !== null) partes.push(`Visibilidad ${minuscula(textoVisibilidad(p.visib))}`);
  partes.push(...fenomenos(p.wxString));
  partes.push(...p.clouds.map(textoNube));
  return partes;
}

export function categoriaPeriodo(p: PeriodoTaf): Categoria | null {
  return p.clouds.length || p.visib !== null ? categoriaVuelo(techoFt(p.clouds), visibilidadSM(p.visib)) : null;
}

// ---------- Discord ----------

export interface Embed {
  title: string;
  description: string;
  color: number;
  fields: { name: string; value: string; inline?: boolean }[];
  footer: { text: string };
  timestamp?: string;
}

const PIE = "Datos de aviationweather.gov · Solo para simulación y formación";
const cortar = (t: string, max: number) => (t.length > max ? `${t.slice(0, max - 1)}…` : t);
const bloque = (t: string) => "```\n" + t.replace(/`/g, "'") + "\n```";
const nombreCorto = (n?: string) => n?.split(",")[0] ?? "";

export function embedMetar(m: Metar, pista?: number | null): Embed {
  const techo = techoFt(m.clouds);
  const cat = (m.fltCat as Categoria | null | undefined) ?? categoriaVuelo(techo, visibilidadSM(m.visib));
  const fen = fenomenos(m.wxString);
  const spread = m.temp !== null && m.dewp !== null ? m.temp - m.dewp : null;
  const dens = m.elev !== null && m.altim !== null && m.temp !== null ? altitudDensidad(m.elev, m.altim, m.temp) : null;

  const campos: Embed["fields"] = [
    { name: "Viento", value: textoViento(m.wdir, m.wspd, m.wgst), inline: true },
    { name: "Visibilidad", value: textoVisibilidad(m.visib), inline: true },
    { name: "Fenómenos", value: fen.length ? fen.join("\n") : "Ninguno", inline: true },
    {
      name: "Nubes",
      value: (m.clouds.length ? m.clouds.map(textoNube).join("\n") : "Despejado") +
        (techo !== null ? `\nTecho: ${pies(techo)}` : "\nSin techo"),
    },
    {
      name: "Temperatura / rocío",
      value: `${m.temp ?? "?"} °C / ${m.dewp ?? "?"} °C` + (spread !== null && spread <= 3 ? `\n⚠️ Diferencia de ${spread} °C: riesgo de niebla o nubes bajas` : ""),
      inline: true,
    },
    { name: "Altímetro", value: m.altim !== null ? `${(m.altim * 0.02953).toFixed(2)} inHg · ${Math.round(m.altim)} hPa` : "Sin dato", inline: true },
  ];
  if (dens) campos.push({ name: "Altitud de densidad", value: pies(dens.densidad), inline: true });
  if (pista && typeof m.wdir === "number" && m.wspd) {
    const c = componentesViento(m.wdir, m.wspd, pista);
    const r = m.wgst ? componentesViento(m.wdir, m.wgst, pista) : null;
    campos.push({
      name: `Viento en la pista ${String(pista).padStart(2, "0")}`,
      value: `Cruzado: ${Math.round(c.cruzado)} kt por la ${c.lado}${r ? ` (${Math.round(r.cruzado)} en ráfagas)` : ""}\n${c.frente >= 0 ? "De frente" : "De cola"}: ${Math.round(Math.abs(c.frente))} kt`,
      inline: true,
    });
  }

  return {
    title: cortar(`${m.rawOb.startsWith("SPECI") ? "SPECI" : "METAR"} ${m.icaoId} · ${nombreCorto(m.name)}`, 250),
    description: (cat ? `**${cat}** · ${DESCRIPCION_CATEGORIA[cat]}\n` : "") + bloque(m.rawOb),
    color: cat ? COLOR_EMBED[cat] : COLOR_SIN_CATEGORIA,
    fields: campos.map((c) => ({ ...c, value: cortar(c.value, 1024) })),
    footer: { text: PIE },
    timestamp: new Date(m.obsTime * 1000).toISOString(),
  };
}

const MAX_PERIODOS = 8;

export function embedTaf(t: Taf, nombre?: string): Embed {
  const periodos = t.fcsts.slice(0, MAX_PERIODOS);
  const campos = periodos.map((p) => {
    const cat = categoriaPeriodo(p);
    return {
      name: cortar(`${etiquetaPeriodo(p)} · ${horaZ(p.timeFrom)} a ${horaZ(p.timeTo)}${cat ? ` · ${cat}` : ""}`, 256),
      value: cortar(resumenPeriodo(p).join(" · ") || "Sin cambios en los elementos principales", 1024),
    };
  });
  if (t.fcsts.length > MAX_PERIODOS) {
    campos.push({ name: "…", value: `Y ${t.fcsts.length - MAX_PERIODOS} periodos más en el Briefing del sitio.` });
  }
  const base = t.fcsts.find((p) => p.fcstChange === null);
  const cat = base ? categoriaPeriodo(base) : null;
  return {
    title: cortar(`TAF ${t.icaoId} · ${nombreCorto(nombre)}`.replace(/ · $/, ""), 250),
    description: `Válido de ${horaZ(t.validTimeFrom)} a ${horaZ(t.validTimeTo)} (hora Z = UTC)\n${bloque(cortar(t.rawTAF, 3000))}`,
    color: cat ? COLOR_EMBED[cat] : COLOR_SIN_CATEGORIA,
    fields: campos,
    footer: { text: PIE },
    timestamp: new Date(t.validTimeFrom * 1000).toISOString(),
  };
}
