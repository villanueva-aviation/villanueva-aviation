// Catálogo de piezas de audio del ATIS: cada clave es un MP3 en public/atis/piezas/{idioma}/{clave}.mp3.
import type { AeropuertoAtis, Nombres } from "./datos.ts";

export type Idioma = "es" | "en";
// url: la voz en vivo sale de esa URL y no de /atis/piezas/.
export type Pieza = { idioma: Idioma; clave: string; url?: string };

const DIGITOS: Record<Idioma, string[]> = {
  es: ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"],
  en: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "niner"],
};

export const LETRAS = ["Alfa", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India", "Juliett", "Kilo", "Lima", "Mike",
  "November", "Oscar", "Papa", "Quebec", "Romeo", "Sierra", "Tango", "Uniform", "Victor", "Whiskey", "Xray", "Yankee", "Zulu"];

export const WX: Record<string, [string, string]> = {
  "-RA": ["Lluvia ligera.", "Light rain."], "RA": ["Lluvia.", "Rain."], "+RA": ["Lluvia fuerte.", "Heavy rain."],
  "-SHRA": ["Chubascos ligeros.", "Light rain showers."], "SHRA": ["Chubascos.", "Rain showers."],
  "TS": ["Tormenta.", "Thunderstorm."], "VCTS": ["Tormenta en las cercanías.", "Thunderstorm in the vicinity."],
  "-TSRA": ["Tormenta con lluvia ligera.", "Thunderstorm, light rain."], "TSRA": ["Tormenta con lluvia.", "Thunderstorm, rain."],
  "VCSH": ["Chubascos en las cercanías.", "Showers in the vicinity."], "-DZ": ["Llovizna ligera.", "Light drizzle."],
  "BR": ["Neblina.", "Mist."], "FG": ["Niebla.", "Fog."], "HZ": ["Bruma.", "Haze."], "FU": ["Humo.", "Smoke."],
};

// Observaciones (RMK) que sí se dicen: {frecuencia} {nube}.
const RMK_FREC: Record<string, [string, string]> = {
  ISOL: ["aislados", "Isolated"], OCNL: ["ocasionales", "Occasional"], FRQ: ["frecuentes", "Frequent"],
};
const RMK_NUBE: Record<string, [string, string]> = {
  SC: ["Estratocúmulos", "stratocumulus"], CB: ["Cumulonimbos", "cumulonimbus"], TCU: ["Cúmulos en torre", "towering cumulus"],
  CU: ["Cúmulos", "cumulus"], AC: ["Altocúmulos", "altocumulus"], ST: ["Estratos", "stratus"],
};

const CIENTOS_ES = ["cien", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

const FIJAS: Record<string, [string | null, string | null]> = {
  "f-informacion": ["Información", "Information"],
  "f-observacion": ["Observación de las", null],
  "f-zulu": ["zulú.", "zulu weather."],
  "f-pista": ["Pista en uso,", "Runway in use,"],
  // Del ATIS de texto de la red: llegada y salida distintas, nivel y altitud de transición.
  "f-pista-llegada": ["Pista para aterrizajes,", "Landing runway,"],
  "f-pista-salida": ["Pista para despegues,", "Departure runway,"],
  "f-nivel-transicion": ["Nivel de transición, nivel de vuelo", "Transition level, flight level"],
  "f-altitud-transicion": ["Altitud de transición,", "Transition altitude,"],
  "f-derecha": ["derecha.", "right."], "f-izquierda": ["izquierda.", "left."], "f-central": ["central.", "center."],
  "f-viento": ["Viento,", "Wind,"],
  "f-grados": ["grados,", "degrees,"],
  "f-nudos": ["nudos.", "knots."],
  "f-calma": ["Viento en calma.", "Wind calm."],
  "f-variable": ["variable,", "variable,"],
  "f-rafagas": ["ráfagas de", "gusts"],
  "f-variando": ["variando entre", "variable between"],
  "f-y": ["y", "and"],
  "f-visibilidad": ["Visibilidad,", "Visibility,"],
  "f-millas": ["millas.", "miles."],
  "f-milla": ["una milla.", "one mile."], // 1 SM: lleva el número, como f-medio
  "f-o-mas": ["millas o más.", "miles or more."],
  "f-cuarto": ["un cuarto de milla.", "one quarter mile."],
  "f-medio": ["media milla.", "one half mile."],
  "f-tres-cuartos": ["tres cuartos de milla.", "three quarters mile."],
  "f-nubes": ["Nubes", null],
  "f-few": ["escasas a", "Few clouds at"], "f-sct": ["dispersas a", "Scattered clouds at"],
  "f-bkn": ["fragmentadas a", "Broken clouds at"], "f-ovc": ["Cielo cubierto a", "Overcast at"],
  "f-few2": ["Escasas a", "Few,"], "f-sct2": ["Dispersas a", "Scattered,"],
  "f-bkn2": ["Fragmentadas a", "Broken,"], "f-ovc2": ["Cielo cubierto a", "Overcast,"],
  "f-vv": ["Visibilidad vertical,", "Vertical visibility,"],
  "f-despejado": ["Cielo despejado.", "Sky clear."],
  "f-mil-pies": ["mil pies.", "thousand."],
  "f-mil": ["mil", "thousand"],
  "f-cb": ["cumulonimbos.", "cumulonimbus."], "f-tcu": ["cúmulos en torre.", "towering cumulus."],
  "f-temperatura": ["Temperatura,", "Temperature,"],
  "f-rocio": ["Punto de rocío,", "Dewpoint,"],
  "f-menos": ["menos", "minus"],
  "f-altimetro": ["Altímetro,", "Altimeter,"],
  "f-qnh": ["QNH,", "QNH,"],
  "f-confirme": ["Confirme pista y QNH con el controlador.", "Confirm runway and QNH with the controller."],
  "f-km-o-mas": ["diez kilómetros o más.", "one zero kilometers or more."],
  "f-kilometros": ["kilómetros.", "kilometers."],
  "f-metros": ["metros.", "meters."],
  "f-cavok": ["CAVOK.", "CAVOK."],
  "f-nsc": ["Sin nubes significativas.", "No significant cloud."],
  "f-hpa": ["hectopascales.", "hectopascals."],
  "f-nosig": ["Sin cambios significativos.", "No significant change."],
  "f-faa-viento": [null, "Wind"], "f-at": [null, "at"], "f-faa-pista": [null, "Landing and departing runway"],
  "f-cierre": ["Al primer contacto, notifique que tiene la información", "Advise on initial contact you have information"],
};

function catalogo(idioma: Idioma): Record<string, string> {
  const i = idioma === "es" ? 0 : 1;
  const f: Record<string, string> = {};
  DIGITOS[idioma].forEach((d, n) => { f[`d-${n}-sigue`] = `${d},`; f[`d-${n}-cierra`] = `${d}.`; });
  LETRAS.forEach((l, n) => { f[`letra-${String.fromCharCode(65 + n)}`] = `${l}.`; });
  for (const [clave, textos] of Object.entries(FIJAS)) if (textos[i] !== null) f[clave] = textos[i] as string;
  for (let n = 1; n <= 9; n++) f[`f-cientos-${n}`] = idioma === "es" ? `${CIENTOS_ES[n - 1]} pies.` : `${DIGITOS.en[n]} hundred.`;
  for (const [codigo, textos] of Object.entries(WX)) f[`wx-${codigo}`] = textos[i];
  for (const [fr, tf] of Object.entries(RMK_FREC)) {
    for (const [nu, tn] of Object.entries(RMK_NUBE)) {
      f[`rmk-${fr}-${nu}`] = idioma === "es" ? `${tn[0]} ${tf[0]}.` : `${tf[1]} ${tn[1]}.`;
    }
  }
  return f;
}

export const FRASES: Record<Idioma, Record<string, string>> = { es: catalogo("es"), en: catalogo("en") };

// Palabra hablada de un dígito, sin puntuación (para el texto en pantalla).
export const palabraDigito = (idioma: Idioma, d: string): string => DIGITOS[idioma][Number(d)];

// Lo que la voz en español dice distinto de lo que se escribe: «Echo» lo lee «echo» (hecho); en radio se dice «eco».
const VOZ_ES: Record<string, string> = { "letra-E": "Eco." };

export function textoDePieza(p: Pieza, aeropuertos: AeropuertoAtis[]): string | null {
  if (p.clave.startsWith("ap-")) {
    const a = aeropuertos.find((x) => x.icao === p.clave.slice(3));
    const n = a && (p.idioma === "es" ? a.nombreEs : a.nombreEn);
    return n ? `${n}.` : null;
  }
  return (p.idioma === "es" ? VOZ_ES[p.clave] : undefined) ?? FRASES[p.idioma][p.clave] ?? null;
}

export function todasLasPiezas(nombres: Nombres): Pieza[] {
  const piezas: Pieza[] = [];
  for (const idioma of ["es", "en"] as const) {
    for (const clave of Object.keys(FRASES[idioma])) piezas.push({ idioma, clave });
    for (const [icao, n] of Object.entries(nombres)) if (idioma === "en" || n.es) piezas.push({ idioma, clave: `ap-${icao}` });
  }
  return piezas;
}
