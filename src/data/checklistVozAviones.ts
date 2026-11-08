// Checklists por voz del C152 y del Arrow, con las mismas secciones del C172. Los revisó Erik el 2026-11-07.
// El Arrow se completó con los procedimientos normales del PA28R (Carenado) el 2026-11-07.
// El calentador de carburador y la palanca de la hélice quedan solo por voz: el lector no los lee todavía.
// El trim de despegue del C152 y del Arrow queda por voz (Erik, 2026-11-07).
import { LIMITES_C172, type Limites } from "../features/instructor/revisionSim.ts";
import { AP, AVIONICA, CHECKLIST_VOZ_C172, FLAPS, LUZ_ATT, LUZ_TAXI, S, STROBE, TRIM, type Renglon, type SeccionId, type SeccionVoz } from "./checklistVozC172.ts";

const sec = (id: SeccionId, renglones: Renglon[]) => {
  const c172 = CHECKLIST_VOZ_C172.find((s) => s.id === id)!;
  return S(id, c172.titulo, c172.claves, renglones);
};

const CARB = ["calentador", "carburador", "carb heat", "carb"];
const BOMBA = ["bomba", "fuel pump"];
const HELICE_ADELANTE: Renglon = ["Hélice — toda adelante", ["helice", "prop"]];
const MEZCLA_AJUSTADA: Renglon = ["Mezcla — ajustada", ["mezcla"], "mezcla-aeropuerto"];
const ALTIMETRO: Renglon = ["Altímetro — ajustado", ["altimetro"], "altimetro"];
const FRENO: Renglon = ["Freno de estacionamiento — puesto", ["freno"], "freno"];

export const CHECKLIST_VOZ_C152: SeccionVoz[] = [
  sec("antes-arrancar", [
    ["Briefing de pasajeros — completo", ["briefing", "pasajeros"]],
    ["Autorización de ATC — obtenida", ["autorizacion", "atc"]],
    ["Asientos y cinturones — ajustados y asegurados", ["asientos", "cinturones"]],
    FRENO,
    ["Breakers — adentro", ["breakers", "breaker", "brakers", "braker"]],
    ["Radios y equipo eléctrico — apagados", ["radios", "electrico"]],
    ["Aviónica master — apagado", AVIONICA, "avionica-off"],
    ["Válvula de combustible — abierta", ["valvula", "fuel valve"], "valvula-abierta"],
  ]),
  sec("arranque", [
    ["Mezcla — rica", ["mezcla"], "mezcla-rica"],
    ["Calentador de carburador — frío", CARB],
    ["Cebador — hasta 3 golpes", ["cebador", "cebar", "cebado", "primer"], undefined, "Según la temperatura del motor."],
    ["Acelerador — abierto media pulgada", ["acelerador"], "acelerador-media"],
    ["Master — encendido", ["master"], "master-on"],
    ["Luz anticolisión — encendida", ["anticolision", "beacon"], "beacon-on"],
    ["Área de la hélice — despejada", ["helice"], undefined, "El cadete puede decir «¡libre hélice!»"],
    ["Llave de encendido — arranque", ["llave", "magnetos"], "arranque-motor"],
    ["Acelerador — 1,000 RPM o menos", ["acelerador", "1000"], "rpm-1000"],
    ["Presión de aceite — verificada", ["aceite"], undefined, "Debe subir en los primeros 30 segundos."],
    ["Luces de navegación — encendidas", ["navegacion", "nav"], "nav-on"],
    ["Aviónica master — encendido", AVIONICA, "avionica-on"],
    ["Flaps — arriba", FLAPS, "flaps-arriba"],
    ["Mezcla — empobrecida para rodar", ["mezcla"], "mezcla-empobrecida"],
  ]),
  sec("antes-rodar", [
    ["Radios y aviónica — configurados", ["radios", "radio"]],
    ["Transponder — standby", ["transponder", "transpondedor"]],
    ["Frenos — probados", ["frenos", "freno"], undefined, "Se dice al empezar a moverse."],
    ["Calentador de carburador — frío", CARB],
    ["Luz de rodaje — encendida", LUZ_TAXI, "taxi-on"],
    ["Instrumentos de vuelo — verificados en los virajes", ["instrumentos"]],
    ["Velocidad de rodaje — paso de persona", ["velocidad"]],
  ]),
  sec("prueba-motor", [
    FRENO,
    ["Puertas — cerradas y aseguradas", ["puertas", "puerta"]],
    ["Cinturones — asegurados", ["cinturones", "cinturon"]],
    ["Controles de vuelo — libres y correctos", ["controles"]],
    ["Instrumentos de vuelo — verificados", ["instrumentos"]],
    ALTIMETRO,
    ["Combustible — cantidad verificada", ["cantidad de combustible", "cantidad"]],
    ["Válvula de combustible — abierta", ["valvula", "fuel valve"], "valvula-abierta"],
    MEZCLA_AJUSTADA,
    ["Trim de elevador — despegue", TRIM],
    ["Acelerador — 1,700 RPM", ["acelerador", "1700"], "rpm-prueba"],
    ["Magnetos — probados", ["magnetos", "magneto"], "magnetos"],
    ["Calentador de carburador — probado", CARB, undefined, "Al aplicarlo bajan las RPM."],
    ["Instrumentos del motor y amperímetro — revisados", ["instrumentos del motor", "amperimetro"]],
    ["Ralentí — verificado, 1,000 RPM o menos", ["ralenti"], "ralenti"],
    ["Fricción del acelerador — ajustada", ["friccion"]],
  ]),
  sec("antes-despegar", [
    ["Radios — configurados", ["radios", "radio"]],
    ["Flaps — 0 a 10 grados", FLAPS, "flaps-despegue"],
    ["Transponder — ALT", ["transponder", "transpondedor"], "xpdr-alt"],
    ["Luz de aterrizaje — encendida", LUZ_ATT, "aterrizaje-on"],
    ["Luces estroboscópicas — encendidas", STROBE, "strobe-on"],
    ["Calentador de carburador — frío", CARB],
    ["Briefing de despegue — repasado", ["briefing"], undefined, "Qué hacer si falla el motor. Rotación a 50 nudos."],
  ]),
  sec("despues-despegar", [
    ["Velocidad de ascenso — 65 a 75 nudos", ["velocidad", "ascenso"], "vel-ascenso", "En ruta, 70 a 80 nudos."],
    ["Flaps — arriba", FLAPS, "flaps-arriba", "Se suben a 60 nudos."],
    ["Acelerador — todo abierto", ["acelerador"], "acelerador-completo"],
    MEZCLA_AJUSTADA,
  ]),
  sec("crucero", [
    ["Potencia — 1,900 a 2,550 RPM", ["potencia"], "potencia-crucero"],
    ["Trim — ajustado", TRIM],
    ["Mezcla — empobrecida", ["mezcla"], "mezcla-empobrecida"],
    ["Luces de rodaje y aterrizaje — apagadas", ["luces", ...LUZ_ATT, ...LUZ_TAXI], "aterrizaje-off"],
    ["Vigilancia de tránsito — constante", ["vigilancia", "transito"]],
  ]),
  sec("descenso", [
    ["Briefing de aproximación — repasado", ["briefing"]],
    ["Mezcla — enriquecida", ["mezcla"]],
    ["Calentador de carburador — aplicado", CARB, undefined, "Antes de cerrar el acelerador."],
    ALTIMETRO,
    ["Luz de aterrizaje — encendida", LUZ_ATT, "aterrizaje-on"],
  ]),
  sec("antes-aterrizar", [
    ["Cinturones — asegurados", ["cinturones", "cinturon"]],
    ["Válvula de combustible — abierta", ["valvula", "fuel valve"], "valvula-abierta"],
    MEZCLA_AJUSTADA,
    ["Flaps — abajo de 85 nudos", FLAPS],
    ["Trim — ajustado", TRIM],
    ["Velocidad — 60 a 70 nudos, o 55 a 65 con flaps", ["velocidad"], "vel-aproximacion"],
    ["Aproximación — estabilizada", ["aproximacion"]],
  ]),
  sec("despues-aterrizar", [
    ["Flaps — arriba", FLAPS, "flaps-arriba"],
    ["Calentador de carburador — frío", CARB],
    ["Mezcla — empobrecida para rodar", ["mezcla"], "mezcla-empobrecida"],
    ["Transponder — standby", ["transponder", "transpondedor"]],
    ["Luz de aterrizaje — apagada", LUZ_ATT, "aterrizaje-off"],
    ["Luces estroboscópicas — apagadas", STROBE, "strobe-off"],
  ]),
  sec("apagado", [
    FRENO,
    ["Equipo eléctrico — apagado", ["electrico"]],
    ["Aviónica master — apagado", AVIONICA, "avionica-off"],
    ["Acelerador — ralentí", ["acelerador"], "acelerador-cerrado"],
    ["Mezcla — corte", ["mezcla"], "corte-motor"],
    ["Llave de encendido — apagada", ["llave", "magnetos"], "magnetos-off"],
    ["Master — apagado", ["master"], "master-off"],
    ["Luces anticolisión y de navegación — apagadas", ["anticolision", "navegacion", "beacon"]],
    ["Seguro de control — instalado", ["seguro"]],
    ["Válvula de combustible — cerrada", ["valvula", "fuel valve"], "valvula-cerrada"],
    ["Bitácora — anotada", ["bitacora"]],
    ["Puertas — cerradas con llave", ["puertas", "puerta"]],
    ["Avión asegurado — calzos y amarres", ["calzos", "amarres", "avion asegurado"]],
  ]),
];

const SELECTOR: Renglon = ["Selector de combustible — tanque más lleno", ["selector"], "selector-tanque", "El Arrow no tiene «ambos»."];
const BOMBA_ON: Renglon = ["Bomba de combustible eléctrica — encendida", BOMBA, "bomba-on"];
const BOMBA_OFF: Renglon = ["Bomba de combustible eléctrica — apagada", BOMBA, "bomba-off"];

export const CHECKLIST_VOZ_ARROW: SeccionVoz[] = [
  sec("antes-arrancar", [
    ["Asientos y cinturones — ajustados y asegurados", ["asientos", "cinturones"]],
    ["Seguro del volante — quitado", ["seguro", "volante"]],
    ["Palanca del tren — abajo", ["tren", "gear"], "tren-abajo"],
    FRENO,
    ["Breakers — adentro", ["breakers", "breaker", "brakers", "braker"]],
    ["Aire alterno — cerrado", ["aire alterno", "alterno", "alternate air"]],
    HELICE_ADELANTE,
    ["Aviónica master — apagado", AVIONICA, "avionica-off"],
    ["Interruptores eléctricos — apagados", ["interruptores", "electrico", "switches"]],
    SELECTOR,
  ]),
  sec("arranque", [
    ["Acelerador — abierto media pulgada", ["acelerador"], "acelerador-media"],
    ["Alternador y master — encendidos", ["alternador", "master"], "master-on"],
    ["Luz anticolisión — encendida", ["anticolision", "beacon"], "beacon-on"],
    BOMBA_ON,
    ["Mezcla — rica hasta ver flujo, luego corte", ["mezcla", "cebar", "cebado"], undefined, "Es el cebado del motor de inyección."],
    ["Área de la hélice — despejada", ["helice"], undefined, "El cadete puede decir «¡libre hélice!»"],
    ["Llave de encendido — arranque", ["llave", "magnetos"], "arranque-motor"],
    ["Mezcla — rica", ["mezcla"], "mezcla-rica"],
    ["Acelerador — ajustado", ["acelerador"]],
    ["Presión de aceite — verificada", ["aceite"], undefined, "Debe subir en los primeros 30 segundos."],
    ["Amperímetro — cargando", ["amperimetro"], undefined, "Sin carga del alternador no se vuela."],
    ["Luces de navegación — encendidas", ["navegacion", "nav"], "nav-on"],
    ["Aviónica master — encendido", AVIONICA, "avionica-on"],
  ]),
  sec("antes-rodar", [
    ["Calentamiento — 1,400 a 1,500 RPM", ["calentamiento"], "rpm-calentamiento"],
    ["Luz de rodaje — encendida", LUZ_TAXI, "taxi-on"],
    ["Área de rodaje — despejada", ["area de rodaje", "area"]],
    ["Freno de estacionamiento — quitado", ["freno de estacionamiento", "estacionamiento"], "freno-quitado"],
    ["Hélice — altas RPM", ["helice", "prop"]],
    ["Frenos — probados", ["frenos", "freno"], undefined, "Se dice al empezar a moverse."],
    ["Dirección — probada", ["direccion", "steering"]],
    ["Instrumentos de vuelo — verificados en los virajes", ["instrumentos"]],
  ]),
  sec("prueba-motor", [
    FRENO,
    ALTIMETRO,
    HELICE_ADELANTE,
    ["Acelerador — 2,000 RPM", ["acelerador", "2000"], "rpm-prueba"],
    ["Magnetos — probados", ["magnetos", "magneto"], "magnetos"],
    ["Succión, aceite y amperímetro — en verde", ["succion", "aceite", "amperimetro"], undefined, "Succión entre 4.8 y 5.1."],
    ["Panel de anunciadores — probado", ["anunciadores", "anunciador"]],
    ["Aire alterno — probado", ["aire alterno", "alterno", "alternate air"]],
    ["Hélice — ejercitada", ["helice", "prop"], undefined, "Se mueve la palanca atrás y adelante 2 o 3 veces y se ve la caída de RPM."],
    [BOMBA_OFF[0], BOMBA_OFF[1], BOMBA_OFF[2], "Se apaga para probar la bomba del motor."],
    ["Presión de combustible — verificada", ["presion de combustible", "presion"]],
    ["Acelerador — atrás", ["acelerador"], "acelerador-cerrado"],
  ]),
  sec("antes-despegar", [
    ["Alternador y master — encendidos", ["alternador", "master"], "master-on"],
    ["Instrumentos de vuelo — verificados", ["instrumentos"]],
    [SELECTOR[0], SELECTOR[1], SELECTOR[2]],
    BOMBA_ON,
    ["Instrumentos del motor — revisados", ["instrumentos del motor", "motor"]],
    ["Aire alterno — cerrado", ["aire alterno", "alterno", "alternate air"]],
    ["Respaldos — verticales", ["respaldos", "respaldo"]],
    MEZCLA_AJUSTADA,
    HELICE_ADELANTE,
    ["Cinturones y puertas — asegurados", ["cinturones", "puertas"]],
    ["Asientos vacíos — cinturones abrochados", ["asientos vacios", "vacios"]],
    ["Flaps — arriba", FLAPS, "flaps-despegue", "Arriba en el despegue normal."],
    ["Trim de elevador — despegue", TRIM],
    ["Controles de vuelo — libres y correctos", ["controles"]],
    ["Piloto automático — apagado", AP, "autopiloto-off"],
    ["Aire acondicionado — apagado", ["aire acondicionado", "acondicionado"]],
    ["Transponder — ALT", ["transponder", "transpondedor"], "xpdr-alt"],
    ["Luz de aterrizaje — encendida", LUZ_ATT, "aterrizaje-on"],
    ["Luces estroboscópicas — encendidas", STROBE, "strobe-on"],
    ["Briefing de despegue — repasado", ["briefing"], undefined, "Qué hacer si falla el motor. Rotación entre 65 y 75 nudos."],
  ]),
  sec("despues-despegar", [
    ["Tren — arriba", ["tren", "gear"], "tren-arriba", "Con ascenso positivo y abajo de 107 nudos."],
    ["Velocidad de ascenso — 90 nudos", ["velocidad", "ascenso"], "vel-ascenso", "Ya en ruta, 104 nudos."],
    ["Flaps — arriba", FLAPS, "flaps-arriba"],
    [BOMBA_OFF[0], BOMBA_OFF[1], BOMBA_OFF[2], "Se apaga ya a una altitud segura."],
    MEZCLA_AJUSTADA,
  ]),
  sec("crucero", [
    ["Potencia — 75 % o menos", ["potencia"], undefined, "Por la tabla de potencia; el lector no lee la presión de admisión."],
    ["Trim — ajustado", TRIM],
    ["Mezcla — empobrecida", ["mezcla"], "mezcla-empobrecida"],
    ["Tanques — alternar cada hora", ["tanques", "tanque", "alternar"]],
    ["Vigilancia de tránsito — constante", ["vigilancia", "transito"]],
  ]),
  sec("descenso", [
    ["Mezcla — ajustada", ["mezcla"]],
    ALTIMETRO,
    [SELECTOR[0], SELECTOR[1], SELECTOR[2]],
  ]),
  sec("antes-aterrizar", [
    [SELECTOR[0], SELECTOR[1], SELECTOR[2]],
    ["Respaldos — verticales", ["respaldos", "respaldo"]],
    ["Cinturones — asegurados", ["cinturones", "cinturon"]],
    BOMBA_ON,
    MEZCLA_AJUSTADA,
    HELICE_ADELANTE,
    ["Tren — abajo, tres verdes", ["tren", "gear", "tres verdes"], "tren-abajo", "Abajo de 129 nudos."],
    ["Flaps — abajo de 103 nudos", FLAPS],
    ["Aire acondicionado — apagado", ["aire acondicionado", "acondicionado"]],
    ["Luz de aterrizaje — encendida", LUZ_ATT, "aterrizaje-on"],
    ["Luz de rodaje — encendida", LUZ_TAXI, "taxi-on"],
    ["Piloto automático — apagado", AP, "autopiloto-off"],
    ["Velocidad — 75 nudos en final con flaps", ["velocidad"], "vel-aproximacion"],
    ["Trim — ajustado para 75 nudos", TRIM],
    ["Aproximación — estabilizada", ["aproximacion"]],
  ]),
  sec("despues-aterrizar", [
    ["Flaps — arriba", FLAPS, "flaps-arriba"],
    BOMBA_OFF,
    ["Luz de aterrizaje — apagada", LUZ_ATT, "aterrizaje-off"],
    ["Luces estroboscópicas — apagadas", STROBE, "strobe-off"],
  ]),
  sec("apagado", [
    FRENO,
    ["Aire acondicionado — apagado", ["aire acondicionado", "acondicionado"]],
    ["Aviónica master — apagado", AVIONICA, "avionica-off"],
    ["Equipo eléctrico — apagado", ["electrico"]],
    HELICE_ADELANTE,
    ["Acelerador — cerrado", ["acelerador"], "acelerador-cerrado"],
    ["Mezcla — corte", ["mezcla"], "corte-motor"],
    ["Llave de encendido — apagada", ["llave", "magnetos"], "magnetos-off"],
    ["Alternador y master — apagados", ["alternador", "master"], "master-off"],
    ["Volante — asegurado", ["volante", "seguro"]],
    ["Bitácora — anotada", ["bitacora"]],
    ["Avión asegurado — calzas y amarres", ["calzas", "calzos", "amarres", "avion asegurado"]],
  ]),
];

export type AvionVoz = "c172" | "c152" | "arrow";
export const AVIONES_VOZ: Record<AvionVoz, { nombre: string; secciones: SeccionVoz[]; limites: Limites }> = {
  c172: { nombre: "Cessna 172", secciones: CHECKLIST_VOZ_C172, limites: LIMITES_C172 },
  c152: {
    nombre: "Cessna 152",
    secciones: CHECKLIST_VOZ_C152,
    limites: { rpmPrueba: [1600, 1800], caidaMag: 125, velAscenso: [60, 80], crucero: [1900, 2550], aproximacion: { flaps: [55, 65], limpio: [60, 70] } },
  },
  arrow: {
    nombre: "Piper Arrow III",
    secciones: CHECKLIST_VOZ_ARROW,
    // crucero no se usa: el Arrow va por presión de admisión. Sin flaps en final, 80 a 90 (Erik, 2026-11-07).
    limites: { rpmPrueba: [1900, 2100], caidaMag: 175, velAscenso: [85, 100], crucero: [2100, 2700], aproximacion: { flaps: [70, 80], limpio: [80, 90] } },
  },
};
