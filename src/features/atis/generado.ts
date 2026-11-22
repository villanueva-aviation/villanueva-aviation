// Arma el ATIS bilingüe de México (texto en pantalla + piezas de audio) a partir de un METAR.
import { visibilidadSM, type Metar } from "../../lib/clima.ts";
import type { AeropuertoAtis, ExtremoPista } from "./datos.ts";
import { FRASES, palabraDigito, type Idioma, type Pieza } from "./frases.ts";

export type TipoParte = "aeropuerto" | "letra" | "hora" | "pista" | "viento" | "visibilidad" | "tiempo" | "nubes"
  | "temperatura" | "altimetro" | "observaciones" | "cierre";
export type Parte = { tipo: TipoParte; idioma: Idioma; texto: string; piezas: Pieza[]; soloTexto?: boolean };
export type Atis = { icao: string; letra: string; inicioMs: number; partes: Parte[]; conControlador: boolean }; // partes es primero, luego en

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// ponytail: a SPECI in the same hour keeps the letter; key on rawOb hash if that matters
export function letraDe(obsTime: number): string {
  return ALFABETO[Math.floor(obsTime / 3600) % 26];
}

const viento = (wdir: number, p: ExtremoPista) => Math.cos(((wdir - p.rumboV) * Math.PI) / 180);

// Más viento de frente; empate (≤ 0.01) para la pista más larga. Viento flojo o variable: la más larga, extremo le.
export function pistaEnUso(pistas: ExtremoPista[], wdir: number | string | null, wspd: number | null): ExtremoPista | null {
  if (pistas.length === 0) return null;
  if (typeof wdir !== "number" || wspd === null || wspd < 5) {
    return pistas.filter((_, i) => i % 2 === 0).reduce((a, b) => (b.largoFt > a.largoFt ? b : a));
  }
  return pistas.reduce((a, b) => {
    const d = viento(wdir, b) - viento(wdir, a);
    if (Math.abs(d) <= 0.01) return b.largoFt > a.largoFt ? b : a;
    return d > 0 ? b : a;
  });
}

// Trozo de una frase: texto en pantalla + claves de las piezas que lo dicen.
type Trozo = { texto: string; claves: string[] };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const punto = (t: Trozo): Trozo => ({ ...t, texto: `${t.texto}.` });
const coma = (t: Trozo): Trozo => ({ ...t, texto: t.texto.replace(/\.$/, ",") });

const SUFIJO: Record<string, string> = { L: "f-izquierda", R: "f-derecha", C: "f-central" };
const FRACCION: Record<number, string> = { 0.25: "f-cuarto", 0.5: "f-medio", 0.75: "f-tres-cuartos" };
const DESPEJADO = ["CLR", "SKC", "NSC", "NCD", "CAVOK"];
const CAPAS = ["FEW", "SCT", "BKN", "OVC"];

// conControlador: hay ATC de la red en el aeropuerto pero sin ATIS. No se dicen letra ni pista (son del ATC),
// pero la letra se sigue calculando para saber cuándo cambia el METAR.
export function armarAtisMx(metar: Metar, ap: AeropuertoAtis, { conControlador = false }: { conControlador?: boolean } = {}): Atis {
  const letra = letraDe(metar.obsTime);
  const [cuerpo, rmk = ""] = metar.rawOb.split(/\sRMK\s/);
  const grupo = (re: RegExp) => re.exec(cuerpo);
  const hora = grupo(/\b\d{2}(\d{4})Z\b/)?.[1];
  const variando = grupo(/(?:^|\s)(\d{3})V(\d{3})(?=\s|$)/);
  const temps = grupo(/(?:^|\s)(M?\d{2})\/(M?\d{2})?(?=\s|$)/);
  const altim = grupo(/(?:^|\s)([AQ])(\d{4})(?=\s|$)/);
  const pista = conControlador ? null : pistaEnUso(ap.pistas, metar.wdir, metar.wspd);

  const armar = (idioma: Idioma): Parte[] => {
    const partes: Parte[] = [];
    const F = (clave: string) => FRASES[idioma][clave];
    const t = (clave: string, texto = F(clave)): Trozo => ({ texto, claves: [clave] });
    // Grupo de dígitos: el último cierra, los demás siguen.
    const D = (s: string): Trozo => ({
      texto: [...s].map((d) => palabraDigito(idioma, d)).join(" "),
      claves: [...s].map((d, i) => `d-${d}-${i === s.length - 1 ? "cierra" : "sigue"}`),
    });
    const j = (...trozos: (string | Trozo)[]): Trozo => {
      const ts = trozos.map((x) => (typeof x === "string" ? t(x) : x));
      return { texto: ts.map((x) => x.texto).join(" "), claves: ts.flatMap((x) => x.claves) };
    };
    const p = (tipo: TipoParte, x: Trozo) =>
      partes.push({ tipo, idioma, texto: x.texto, piezas: x.claves.map((clave) => ({ idioma, clave })) });
    const solo = (tipo: TipoParte, texto: string) => partes.push({ tipo, idioma, texto, piezas: [], soloTexto: true });
    // Altura de una capa: miles en dígitos + "mil pies", o "mil" + cientos; debajo de 1000 ft, solo cientos.
    const altura = (base: number | null): Trozo | null => {
      if (base === null || base < 100) return null;
      const miles = Math.floor(base / 1000), cientos = Math.floor((base % 1000) / 100);
      const trozos: (string | Trozo)[] = [];
      if (miles) trozos.push(D(String(miles)), cientos ? "f-mil" : "f-mil-pies");
      if (cientos) trozos.push(`f-cientos-${cientos}`);
      return j(...trozos);
    };

    p("aeropuerto", t(`ap-${ap.icao}`, `${idioma === "es" ? ap.nombreEs : ap.nombreEn}.`));
    if (!conControlador) p("letra", j("f-informacion", `letra-${letra}`));
    if (hora) {
      const x = idioma === "es" ? j("f-observacion", D(hora), "f-zulu") : j(D(hora), "f-zulu");
      p("hora", { ...x, texto: cap(x.texto) });
    }

    if (pista) {
      const m = /^(\d{1,2})([LRC]?)$/.exec(pista.ident);
      if (!m) solo("pista", `${F("f-pista")} ${pista.ident}.`);
      else {
        const d = D(m[1].padStart(2, "0"));
        p("pista", m[2] ? j("f-pista", d, SUFIJO[m[2]]) : punto(j("f-pista", d)));
      }
    }

    if (metar.wspd === 0) p("viento", j("f-calma"));
    else if (metar.wspd != null) {
      const dir = typeof metar.wdir === "number" ? [D(String(metar.wdir).padStart(3, "0")), "f-grados"] : ["f-variable"];
      const vel = D(String(metar.wspd));
      let x = metar.wgst
        ? j("f-viento", ...dir, vel, coma(t("f-nudos")), "f-rafagas", D(String(metar.wgst)), "f-nudos")
        : j("f-viento", ...dir, vel, "f-nudos");
      if (variando) x = j(x, t("f-variando", cap(F("f-variando"))), D(variando[1]), "f-y", punto(D(variando[2])));
      p("viento", x);
    }

    if (metar.visib != null) {
      const s = String(metar.visib);
      const n = visibilidadSM(metar.visib)!; // "1/2" → 0.5, "1 1/2" → 1.5
      if (FRACCION[n]) p("visibilidad", j("f-visibilidad", FRACCION[n]));
      else if (n === 1 && !s.endsWith("+")) p("visibilidad", j("f-visibilidad", "f-milla"));
      else if (Number.isInteger(n)) p("visibilidad", j("f-visibilidad", D(String(n)), s.endsWith("+") ? "f-o-mas" : "f-millas"));
      else solo("visibilidad", `${s} SM`);
    }

    for (const codigo of (metar.wxString ?? "").split(/\s+/).filter(Boolean)) {
      if (F(`wx-${codigo}`)) p("tiempo", j(`wx-${codigo}`));
      else solo("tiempo", codigo);
    }

    const capas = metar.clouds.filter((c) => !DESPEJADO.includes(c.cover));
    if (capas.length === 0) p("nubes", j("f-despejado"));
    capas.forEach((c, n) => {
      const alt = altura(c.base);
      const cubierta = c.cover === "OVX" ? "VV" : c.cover;
      if (!alt || (cubierta !== "VV" && !CAPAS.includes(cubierta))) return solo("nubes", `${c.cover} ${c.base ?? ""}`.trim());
      const inicio = cubierta === "VV" ? ["f-vv"]
        : n === 0 ? [...(idioma === "es" && cubierta !== "OVC" ? ["f-nubes"] : []), `f-${cubierta.toLowerCase()}`]
        : [`f-${cubierta.toLowerCase()}2`];
      const tipo = c.type === "CB" || c.type === "TCU" ? `f-${c.type.toLowerCase()}` : null;
      p("nubes", tipo ? j(...inicio, coma(alt), tipo) : j(...inicio, alt));
    });

    if (temps) {
      const g = (s: string) => punto(s.startsWith("M") ? j("f-menos", D(s.slice(1))) : D(s));
      p("temperatura", temps[2] ? j("f-temperatura", g(temps[1]), "f-rocio", g(temps[2])) : j("f-temperatura", g(temps[1])));
    }
    if (altim) p("altimetro", j(altim[1] === "A" ? "f-altimetro" : "f-qnh", punto(D(altim[2]))));

    // Observaciones: los grupos conocidos se dicen; lo demás va junto en una sola parte de solo texto.
    const tokens = rmk.split(/\s+/).filter(Boolean);
    const dichas: Trozo[] = [], resto: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const clave = `rmk-${tokens[i]}-${tokens[i + 1]}`;
      if (F(clave)) { dichas.push(t(clave)); i++; } else resto.push(tokens[i]);
    }
    if (resto.length) solo("observaciones", resto.join(" "));
    for (const x of dichas) p("observaciones", x);

    p("cierre", conControlador ? j("f-confirme") : j("f-cierre", `letra-${letra}`));
    return partes;
  };

  return { icao: ap.icao, letra, inicioMs: metar.obsTime * 1000, partes: [...armar("es"), ...armar("en")], conControlador };
}

