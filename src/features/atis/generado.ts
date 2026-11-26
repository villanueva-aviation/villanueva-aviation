// Arma el ATIS bilingüe de México (texto en pantalla + piezas de audio) a partir de un METAR.
import { visibilidadSM, type Metar } from "../../lib/clima.ts";
import type { AeropuertoAtis, ExtremoPista } from "./datos.ts";
import type { DatosRed } from "./red.ts";
import { formatoDe, type Formato } from "./formato.ts";
import { FRASES, palabraDigito, type Idioma, type Pieza } from "./frases.ts";

export type TipoParte = "aeropuerto" | "letra" | "hora" | "pista" | "viento" | "visibilidad" | "tiempo" | "nubes"
  | "temperatura" | "altimetro" | "observaciones" | "avisos" | "cierre";
export type Parte = { tipo: TipoParte; idioma: Idioma; texto: string; piezas: Pieza[]; soloTexto?: boolean; vivo?: string }; // vivo: texto normalizado que se manda a Azure
// deRed: la letra y la pista son las del ATIS de texto de la red (IVAO/VATSIM), leído con las piezas.
// cs: callsign de la estación de VATSIM; llegadas y salidas pueden tener la misma letra.
export type Atis = { icao: string; letra: string; inicioMs: number; partes: Parte[]; conControlador: boolean; deRed?: boolean; real?: boolean; huella?: string; cs?: string }; // real: D-ATIS de EE. UU., huella = del texto completo; partes es primero, luego en

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
// Grupos del METAR que el ATIS ya dice (viento, variación, visibilidad, nubes, CAVOK...) o que no se dicen (AUTO, COR).
const CONOCIDO = /^(?:(?:\d{3}|VRB)\d{2,3}(?:G\d{2,3})?(?:KT|MPS)|\d{3}V\d{3}|\d{4}(?:NE|NW|SE|SW|N|S|E|W)?|[PM]?\d+(?:\/\d+)?SM|CAVOK|NSC|NCD|SKC|CLR|AUTO|COR|(?:FEW|SCT|BKN|OVC|VV)(?:\d{3}|\/{3})(?:CB|TCU)?)$/;

// Metros del METAR: primer grupo de 4 dígitos suelto después del viento; el sufijo de dirección (4000NE) no se dice.
function visibMetrica(cuerpo: string): { g: string; sufijo: string } | null {
  const w = /(?:^|\s)(?:\d{3}|VRB)\d{2,3}(?:G\d{2,3})?KT(?:\s\d{3}V\d{3})?(?=\s|$)/.exec(cuerpo);
  const desde = w ? cuerpo.slice(w.index + w[0].length) : cuerpo;
  const antes = desde.split(/\s(?:M?\d{2}\/|[AQ]\d{4}|TEMPO|BECMG|NOSIG)/)[0]; // lo de después (tendencias) no es visibilidad
  const m = /(?:^|\s)(\d{4})(NE|NW|SE|SW|N|S|E|W)?(?=\s|$)/.exec(antes);
  return m ? { g: m[1], sufijo: m[2] ?? "" } : null;
}

// conControlador: hay ATC de la red en el aeropuerto pero sin ATIS. No se dicen letra ni pista (son del ATC),
// pero la letra se sigue calculando para saber cuándo cambia el METAR.
// mx: bilingüe, millas y altímetro. latam: es+en, metros y QNH si el METAR los trae. faa: solo en, viento "at", pista al final.
// oaci: solo en, metros y QNH. Lo que no se entiende va a partes soloTexto; nunca lanza.
function armarFormato(formato: Formato, metar: Metar, ap: AeropuertoAtis, { conControlador = false, deRed }: Opciones = {}): Atis {
  const metrico = formato === "latam" || formato === "oaci";
  const letra = deRed?.letra ?? letraDe(metar.obsTime);
  const [cuerpo, rmk = ""] = metar.rawOb.split(/\sRMK\s/);
  const grupo = (re: RegExp) => re.exec(cuerpo);
  const hora = grupo(/\b\d{2}(\d{4})Z\b/)?.[1];
  const variando = grupo(/(?:^|\s)(\d{3})V(\d{3})(?=\s|$)/);
  const temps = grupo(/(?:^|\s)(M?\d{2})\/(M?\d{2})?(?=\s|$)/);
  const altim = grupo(/(?:^|\s)([AQ])(\d{4})(?=\s|$)/);
  // La pista de la red aunque MSFS no la tenga (solo se dice su ident); si la red no la publica, no se dice.
  const pista = conControlador ? null
    : deRed ? (deRed.pista ? ap.pistas.find((x) => x.ident === deRed.pista) ?? { ident: deRed.pista, rumboV: 0, largoFt: 0 } : null)
    : pistaEnUso(ap.pistas, metar.wdir, metar.wspd);
  const cavok = metrico && /(?:^|\s)CAVOK(?=\s|$)/.test(cuerpo);
  const nsc = metrico && /(?:^|\s)NSC(?=\s|$)/.test(cuerpo);
  const visMetrica = metrico ? visibMetrica(cuerpo) : null;
  const enMillas = !metrico || /SM(?:\s|$)/.test(cuerpo);
  // Lo que no se entiende entre la hora y la temperatura (o el altímetro): R27L/1500, WS R27... va a solo texto.
  const raros = (() => {
    const h = /(?:^|\s)\d{6}Z(?=\s|$)/.exec(cuerpo);
    if (!h) return [];
    const wx = new Set((metar.wxString ?? "").split(/\s+/));
    const ts = cuerpo.slice(h.index + h[0].length, (temps ?? altim)?.index ?? cuerpo.length).split(/\s+/).filter(Boolean);
    // "1 1/2SM": el entero suelto es parte de la visibilidad.
    return ts.filter((x, i) => !CONOCIDO.test(x) && !wx.has(x) && !(/^\d+$/.test(x) && /^\d\/\d+SM$/.test(ts[i + 1] ?? "")));
  })();

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

    const nombre = idioma === "es" ? ap.nombreEs : ap.nombreEn;
    if (nombre) p("aeropuerto", t(`ap-${ap.icao}`, `${nombre}.`));
    else { // sin pieza del nombre: se deletrea el ICAO en fonético, con sus cifras (IL48: India Lima Cuatro Ocho)
      const ls = [...ap.icao.toUpperCase()].filter((c) => /[A-Z0-9]/.test(c));
      const clave = (c: string, i: number) => /\d/.test(c) ? `d-${c}-${i === ls.length - 1 ? "cierra" : "sigue"}` : `letra-${c}`;
      const dicho = (c: string) => /\d/.test(c) ? cap(palabraDigito(idioma, c)) : F(`letra-${c}`).replace(/\.$/, "");
      p("aeropuerto", { texto: `${ls.map(dicho).join(" ")}.`, claves: ls.map(clave) });
    }
    if (!conControlador) p("letra", j("f-informacion", `letra-${letra}`));
    if (hora) {
      const x = idioma === "es" ? j("f-observacion", D(hora), "f-zulu") : j(D(hora), "f-zulu");
      p("hora", { ...x, texto: cap(x.texto) });
    }

    const unaPista = (clave: string, ident: string) => {
      const m = /^(\d{1,2})([LRC]?)$/.exec(ident);
      if (!m) solo("pista", `${F(clave)} ${ident}.`);
      else {
        const d = D(m[1].padStart(2, "0"));
        p("pista", m[2] ? j(clave, d, SUFIJO[m[2]]) : punto(j(clave, d)));
      }
    };
    const pistaParte = () => {
      if (pista && deRed?.salida) {
        unaPista("f-pista-llegada", pista.ident);
        unaPista("f-pista-salida", deRed.salida);
      } else if (pista) unaPista(formato === "faa" ? "f-faa-pista" : "f-pista", pista.ident);
      // Nivel y altitud de transición: solo los que publica el controlador.
      if (deRed?.tl) p("pista", j("f-nivel-transicion", punto(D(deRed.tl))));
      const ta = deRed?.taFt ? altura(deRed.taFt) : null;
      if (ta) p("pista", j("f-altitud-transicion", ta)); // altura() ya cierra con punto («mil pies.»)
    };
    if (formato !== "faa") pistaParte();

    if (metar.wspd === 0) p("viento", j("f-calma"));
    else if (metar.wspd != null) {
      const faa = formato === "faa";
      const dir = typeof metar.wdir === "number" ? [D(String(metar.wdir).padStart(3, "0")), ...(faa ? [] : ["f-grados"])] : ["f-variable"];
      const vel = D(String(metar.wspd));
      let x = faa
        ? punto(metar.wgst ? j("f-faa-viento", ...dir, "f-at", vel, "f-rafagas", D(String(metar.wgst))) : j("f-faa-viento", ...dir, "f-at", vel))
        : metar.wgst
        ? j("f-viento", ...dir, vel, coma(t("f-nudos")), "f-rafagas", D(String(metar.wgst)), "f-nudos")
        : j("f-viento", ...dir, vel, "f-nudos");
      if (variando) x = j(x, t("f-variando", cap(F("f-variando"))), D(variando[1]), "f-y", punto(D(variando[2])));
      p("viento", x);
    }

    if (cavok) p("observaciones", j("f-cavok"));
    else if (visMetrica) {
      const { g, sufijo } = visMetrica;
      if (g === "9999") p("visibilidad", j("f-visibilidad", "f-km-o-mas"));
      else if (Number(g) >= 5000 && Number(g) % 1000 === 0) p("visibilidad", j("f-visibilidad", D(String(Number(g) / 1000)), "f-kilometros"));
      else p("visibilidad", j("f-visibilidad", D(g), "f-metros"));
      if (sufijo) solo("visibilidad", `${g}${sufijo}`);
    } else if (enMillas && metar.visib != null) {
      const s = String(metar.visib);
      const n = visibilidadSM(metar.visib)!; // "1/2" → 0.5, "1 1/2" → 1.5
      if (FRACCION[n]) p("visibilidad", j("f-visibilidad", FRACCION[n]));
      else if (n === 1 && !s.endsWith("+")) p("visibilidad", j("f-visibilidad", "f-milla"));
      else if (Number.isInteger(n)) p("visibilidad", j("f-visibilidad", D(String(n)), s.endsWith("+") ? "f-o-mas" : "f-millas"));
      else solo("visibilidad", `${s} SM`);
    }

    if (!cavok) for (const codigo of (metar.wxString ?? "").split(/\s+/).filter(Boolean)) {
      if (F(`wx-${codigo}`)) p("tiempo", j(`wx-${codigo}`));
      else solo("tiempo", codigo);
    }

    const capas = cavok ? [] : metar.clouds.filter((c) => !DESPEJADO.includes(c.cover));
    if (capas.length === 0 && !cavok) p("nubes", j(nsc ? "f-nsc" : "f-despejado"));
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
    if (altim) {
      if (metrico && altim[1] === "Q") p("altimetro", j("f-qnh", D(altim[2]), "f-hpa"));
      else p("altimetro", j(altim[1] === "A" ? "f-altimetro" : "f-qnh", punto(D(altim[2]))));
    }
    if (raros.length) solo("observaciones", raros.join(" "));
    if (metrico) {
      if (/(?:^|\s)NOSIG(?=\s|$)/.test(cuerpo)) p("observaciones", j("f-nosig"));
      // Lo de después del altímetro (o de la temperatura si no hay altímetro que se entienda, como Q998).
      const tras = altim ?? temps;
      const cola = tras ? cuerpo.slice(tras.index + tras[0].length).split(/\s+/).filter((x) => x && x !== "NOSIG") : [];
      if (cola.length) solo("observaciones", cola.join(" "));
    }
    if (formato === "faa") pistaParte();

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

  const partes = formato === "mx" || formato === "latam" ? [...armar("es"), ...armar("en")] : armar("en");
  return { icao: ap.icao, letra, inicioMs: metar.obsTime * 1000, partes, conControlador, ...(deRed ? { deRed: true } : {}) };
}

type Opciones = { conControlador?: boolean; deRed?: DatosRed };
export const armarAtisMx = (metar: Metar, ap: AeropuertoAtis, o: Opciones = {}): Atis => armarFormato("mx", metar, ap, o);
export const armarAtis = (metar: Metar, ap: AeropuertoAtis, o: Opciones = {}): Atis => armarFormato(formatoDe(ap.icao), metar, ap, o);

