// Checklist del C172 partido en puntos cortos para leerlos en voz alta mientras se hacen.
// Los revisó Erik el 2026-11-06 (80 puntos); completado con el checklist del 172S G1000 el 2026-11-07. Las claves reconocen el punto sin pedir la respuesta exacta.
import type { Revision } from "../features/instructor/revisionSim.ts";

export type SeccionId = "antes-arrancar" | "arranque" | "antes-rodar" | "prueba-motor" | "antes-despegar"
  | "despues-despegar" | "crucero" | "descenso" | "antes-aterrizar" | "despues-aterrizar" | "apagado";
export type PuntoVoz = { id: string; dicho: string; claves: string[]; revisa?: Revision; nota?: string };
export type SeccionVoz = { id: SeccionId; titulo: string; claves: string[]; puntos: PuntoVoz[] };

export type Renglon = [dicho: string, claves: string[], revisa?: Revision, nota?: string];

export const FLAPS = ["flaps", "flap"];
export const LUZ_ATT = ["aterrizaje", "landing"];
export const LUZ_TAXI = ["rodaje", "taxi"];
export const STROBE = ["estroboscopicas", "estroboscopica", "strobes", "strobe"];
export const AP = ["piloto automatico", "autopiloto"];
export const AVIONICA = ["avionica master", "avionica"];
// El reconocimiento en español suele escribir «trim» como «dream».
export const TRIM = ["trim", "dream", "drim", "trin"];

export const S = (id: SeccionId, titulo: string, claves: string[], renglones: Renglon[]): SeccionVoz => ({
  id,
  titulo,
  claves,
  puntos: renglones.map(([dicho, c, revisa, nota], i) => ({
    id: `${id}-${i + 1}`,
    dicho,
    claves: c,
    ...(revisa ? { revisa } : {}),
    ...(nota ? { nota } : {}),
  })),
});

export const CHECKLIST_VOZ_C172: SeccionVoz[] = [
  S("antes-arrancar", "Antes de arrancar", ["antes de arrancar", "antes del arranque"], [
    ["Briefing de pasajeros — completo", ["briefing", "pasajeros"]],
    ["Seguro de control — quitado", ["seguro de control", "seguro"]],
    ["Asientos y cinturones — ajustados y asegurados", ["asientos", "cinturones"]],
    ["Freno de estacionamiento — puesto", ["freno"], "freno"],
    ["Breakers — adentro", ["breakers", "breaker", "brakers", "braker"]],
    ["Equipo eléctrico — apagado", ["electrico"]],
    ["Aviónica master — apagado", AVIONICA, "avionica-off"],
    ["Selector de combustible — ambos", ["selector"], "selector-ambos"],
    ["Válvula de corte de combustible — abierta", ["valvula"], "valvula-abierta"],
    ["Batería de reserva — probada y armada", ["bateria de reserva", "bateria", "standby"], undefined, "Luz verde en la prueba de 20 segundos; el PFD enciende."],
    ["Indicaciones del motor — sin X rojas", ["indicaciones", "x rojas"]],
  ]),
  S("arranque", "Arranque", ["arranque", "arrancar motor"], [
    ["Acelerador — abierto un cuarto de pulgada", ["acelerador"], "acelerador-cuarto"],
    ["Mezcla — corte", ["mezcla"], "mezcla-corte"],
    ["Área de la hélice — despejada", ["helice"], undefined, "El cadete puede decir «¡libre hélice!»"],
    ["Master — encendido", ["master"], "master-on"],
    ["Luz anticolisión — encendida", ["anticolision", "beacon"], "beacon-on"],
    ["Bomba de combustible auxiliar — encendida", ["bomba"], "bomba-on"],
    ["Mezcla — rica de 3 a 5 segundos, luego corte", ["mezcla", "cebar", "cebado"]],
    ["Bomba de combustible auxiliar — apagada", ["bomba"], "bomba-off"],
    ["Llave de encendido — arranque", ["llave", "magnetos"], "arranque-motor"],
    ["Mezcla — rica", ["mezcla"], "mezcla-rica"],
    ["Acelerador — 800 RPM", ["acelerador", "800"], "rpm-800"],
    ["Presión de aceite — verificada", ["aceite"]],
    ["Luces de navegación — encendidas", ["navegacion", "nav"], "nav-on"],
    ["Aviónica master — encendido", AVIONICA, "avionica-on"],
    ["Mezcla — empobrecida para rodar", ["mezcla"], "mezcla-empobrecida"],
    ["Flaps — arriba", FLAPS, "flaps-arriba"],
    ["Transponder — código y ON", ["transponder", "transpondedor"]],
  ]),
  S("antes-rodar", "Antes de rodar", ["antes de rodar", "antes del rodaje"], [
    ["ATIS y autorización de rodaje — obtenidas", ["atis y autorizacion de rodaje", "autorizacion de rodaje", "atis", "autorizacion"]],
    ["Frenos — probados", ["frenos", "freno"], undefined, "Se dice al empezar a moverse."],
    ["Luz de rodaje — encendida", LUZ_TAXI, "taxi-on"],
    ["Instrumentos de vuelo — verificados en los virajes", ["instrumentos"]],
  ]),
  S("prueba-motor", "Prueba de motor", ["prueba de motor", "prueba de motores", "run up", "runup"], [
    ["Freno de estacionamiento — puesto", ["freno"], "freno"],
    ["Puertas — cerradas y aseguradas", ["puertas", "puerta"]],
    ["Controles de vuelo — libres y correctos", ["controles"]],
    ["Instrumentos de vuelo — verificados", ["instrumentos"]],
    ["Instrumentos de respaldo — ajustados", ["respaldo"]],
    ["Altímetro — ajustado", ["altimetro"], "altimetro"],
    ["Combustible — cantidad verificada", ["cantidad de combustible", "cantidad"]],
    ["Selector de combustible — ambos", ["selector"], "selector-ambos"],
    ["Mezcla — ajustada", ["mezcla"], "mezcla-aeropuerto", "Se saca la mezcla hasta que quede balanceada con el aire."],
    ["Acelerador — 1,800 RPM", ["acelerador", "1800"], "rpm-prueba"],
    ["Magnetos — probados", ["magnetos", "magneto"], "magnetos"],
    ["Amperímetro — revisado", ["amperimetro"]],
    ["Presión y temperatura de aceite — revisadas", ["aceite"]],
    ["Panel de anunciadores — sin luces", ["anunciadores", "anunciador"]],
    ["Ralentí — verificado, 1,000 RPM o menos", ["ralenti"], "ralenti"],
    ["Fricción del acelerador — ajustada", ["friccion"]],
  ]),
  S("antes-despegar", "Antes de despegar", ["antes de despegar", "antes del despegue"], [
    ["Radios y aviónica — configurados", ["radios", "radio", "avionica"], undefined, "En las lecciones con torre se revisa que COM1 esté en la frecuencia de torre."],
    ["Trim eléctrico — configurado", TRIM.map((t) => `${t} electrico`)],
    ["Piloto automático — apagado", AP, "autopiloto-off"],
    ["Trim de elevador — despegue", TRIM, "trim-despegue"],
    ["Flaps — 0 a 10 grados", FLAPS, "flaps-despegue"],
    ["Transponder — ALT", ["transponder", "transpondedor"], "xpdr-alt"],
    ["Luz de aterrizaje — encendida", LUZ_ATT, "aterrizaje-on"],
    ["Luces estroboscópicas — encendidas", STROBE, "strobe-on"],
    ["Briefing de despegue — repasado", ["briefing"], undefined, "Qué hacer si falla el motor. Rotación a 55 nudos."],
  ]),
  S("despues-despegar", "Después de despegar", ["despues de despegar", "despues del despegue"], [
    ["Velocidad de ascenso — 70 a 85 nudos", ["velocidad", "ascenso"], "vel-ascenso"],
    ["Flaps — arriba", FLAPS, "flaps-arriba"],
    ["Mezcla — ajustada", ["mezcla"], "mezcla-aeropuerto"],
    ["Luz de aterrizaje — apagada", LUZ_ATT, "aterrizaje-off"],
    ["Instrumentos de vuelo y del motor — revisados", ["instrumentos"]],
  ]),
  S("crucero", "Crucero", ["crucero"], [
    ["Potencia — 2,100 a 2,700 RPM", ["potencia"], "potencia-crucero"],
    ["Trim — ajustado", TRIM],
    ["Mezcla — empobrecida", ["mezcla"], "mezcla-empobrecida"],
    ["Altímetros — ajustados", ["altimetros", "altimetro"], "altimetro"],
    ["Vigilancia de tránsito — constante", ["vigilancia", "transito"]],
  ]),
  S("descenso", "Descenso", ["descenso"], [
    ["Potencia — según se necesite", ["potencia"]],
    ["Mezcla — ajustada", ["mezcla"]],
    ["Altímetro — ajustado", ["altimetro"], "altimetro"],
    ["Selector de combustible — ambos", ["selector"], "selector-ambos"],
    ["Flaps — según se necesite", FLAPS],
  ]),
  S("antes-aterrizar", "Antes de aterrizar", ["antes de aterrizar", "antes del aterrizaje"], [
    ["Selector de combustible — ambos", ["selector"], "selector-ambos"],
    ["Tren — abajo y fijo", ["tren"]],
    ["Mezcla — ajustada", ["mezcla"], "mezcla-aeropuerto"],
    ["Potencia — ajustada", ["potencia"]],
    ["Cinturones — asegurados", ["cinturones", "cinturon"]],
    ["Flaps — ajustados", FLAPS],
    ["Luz de aterrizaje — encendida", LUZ_ATT, "aterrizaje-on"],
    ["Luz de rodaje — encendida", LUZ_TAXI, "taxi-on"],
    ["Piloto automático — apagado", AP, "autopiloto-off"],
    ["Velocidad — 65 a 75 nudos, o 60 a 70 con flaps", ["velocidad"], "vel-aproximacion"],
    ["Aproximación — estabilizada", ["aproximacion"]],
  ]),
  S("despues-aterrizar", "Después de aterrizar", ["despues de aterrizar", "despues del aterrizaje"], [
    ["Flaps — arriba", FLAPS, "flaps-arriba"],
    ["Mezcla — empobrecida para rodar", ["mezcla"], "mezcla-empobrecida"],
    ["Luz de aterrizaje — apagada", LUZ_ATT, "aterrizaje-off"],
    ["Luces estroboscópicas — apagadas", STROBE, "strobe-off"],
    ["Calefacción del pitot — apagada", ["pitot", "calefaccion"]],
    ["Transponder — ON", ["transponder", "transpondedor"]],
  ]),
  S("apagado", "Apagado", ["apagado", "apagar motor"], [
    ["Freno de estacionamiento — puesto", ["freno"], "freno"],
    ["Equipo eléctrico — apagado", ["electrico"]],
    ["Piloto automático — apagado", AP, "autopiloto-off"],
    ["Aviónica master — apagado", AVIONICA, "avionica-off"],
    ["Mezcla — corte", ["mezcla"], "corte-motor"],
    ["Llave de encendido — apagada", ["llave", "magnetos"], "magnetos-off"],
    ["Master — apagado", ["master"], "master-off"],
    ["Batería de reserva — apagada", ["bateria de reserva", "bateria", "standby"]],
    ["Seguro de control — instalado", ["seguro"]],
    ["Tapones del pitot y cubierta — instalados", ["tapones", "pitot", "cubierta"]],
    ["Selector de combustible — izquierdo o derecho", ["selector"], "selector-tanque"],
    ["Bitácora — anotada", ["bitacora"]],
    ["Avión asegurado — calzos y amarres", ["calzos", "amarres", "avion asegurado"]],
    ["Puertas — cerradas con llave", ["puertas", "puerta"]],
  ]),
];
