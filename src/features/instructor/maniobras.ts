import { briefing, listaPasos, masFalladoViraje, queHacer } from "./briefing.ts";
import { armar, armarSolo, avanzar, crearEvaluacion, type Evaluacion, type Muestra, type Resultado } from "./evaluador.ts";
import { armarLento, armarSoloLento, avanzarLento, type EvaluacionLento, type ResultadoLento } from "./evaluadorLento.ts";
import { armarRecto, armarSoloRecto, avanzarRecto, type EvaluacionRecto, type ResultadoRecto } from "./evaluadorRecto.ts";
import { explicar, repetir, type Linea } from "./explicacion.ts";
import { briefingLento, explicarLento, listaPasosLento, masFalladoLento, paraGuardarLento, queHacerLento, repetirLento } from "./explicacionLento.ts";
import { briefingRecto, explicarRecto, listaPasosRecto, masFalladoRecto, paraGuardarRecto, queHacerRecto, repetirRecto } from "./explicacionRecto.ts";
import { textosReporte, traducirAviso, type Idioma } from "./idiomaInstructor.ts";
import type { Tema } from "./preguntas.ts";
import { paraGuardar } from "./reglasIntentos.ts";
import { elementosAcs } from "./virajeEscarpado.ts";
import { tolAltitud, tolLento, tolRecto, tolRumbos, type Nivel } from "./nivel.ts";
import { armarAltitud, armarSoloAltitud, avanzarAltitud, BANDA, type EvaluacionAltitud, type ResultadoAltitud } from "./evaluadorAltitud.ts";
import {
  avisoAltitud, briefingAltitud, explicarAltitud, listaPasosAltitud, masFalladoAltitud, ordenAltitud, paraGuardarAltitud, pasoAltitud, queHacerAltitud,
  repetirAltitud, semaforoAltitud, textoPasoAltitud, type PasoAltitud,
} from "./textosAltitud.ts";
import { avisoVoz, ordenVoz, paraVoz, pasoVoz, semaforo, textoPaso, type Aviso, type Luz, type PasoVoz } from "./voz.ts";
import { avisoLento, ordenLento, pasoLento, semaforoLento, textoPasoLento, type PasoLento } from "./vozLento.ts";
import { avisoRecto, ordenRecto, pasoRecto, semaforoRecto, textoPasoRecto, type PasoRecto } from "./vozRecto.ts";
import { INCLINACION_VIRAJE, OBJETIVO_KT } from "./vueloLento.ts";
import { armarRumbos, armarSoloRumbos, avanzarRumbos, INCLINACION_RUMBOS, type EvaluacionRumbos, type ResultadoRumbos } from "./evaluadorRumbos.ts";
import {
  avisoRumbos, briefingRumbos, explicarRumbos, listaPasosRumbos, masFalladoRumbos, ordenRumbos, paraGuardarRumbos, pasoRumbos, queHacerRumbos,
  repetirRumbos, semaforoRumbos, textoPasoRumbos, type PasoRumbos,
} from "./textosRumbos.ts";
import { ALTURA_SEGURA_AGL } from "./virajeEscarpado.ts";

// Cada maniobra del instructor en un solo lugar: el programa sigue la definición de la actividad elegida.

export type ManiobraId = "viraje-escarpado" | "recto-nivelado" | "vuelo-lento" | "virajes-rumbos" | "ascensos-descensos";
export type FaseComun = "armado" | "en-curso" | "terminado" | "invalido";
export interface ResultadoComun {
  aprobado: boolean;
  calificacion: number;
  elementos: Record<string, "S" | "NS">;
  avisos: string[];
  muestras: Muestra[];
  /** Falta en los intentos de antes de los niveles = Difícil. */
  nivel?: Nivel;
}

/** Métodos con sintaxis de método: cada definición tipa su E y su R, y el registro las guarda como DefManiobra. */
export interface DefManiobra<E = any, R extends ResultadoComun = any> {
  id: ManiobraId;
  insignia: string;
  avion: "C172";
  titulo: Record<Idioma, string>;
  tarea: Record<Idioma, string>;
  /** Con las tolerancias del nivel (falta = Difícil). */
  elementosReporte(nivel?: Nivel): { codigo: string; texto: string; textoEn: string }[];
  celdas: { campo: string; nombre: Record<Idioma, string> }[];
  temas: Tema[];
  armar(m: Muestra, nivel?: Nivel): E;
  avanzar(e: E, m: Muestra): E;
  armarSolo(e: E | null, m: Muestra): boolean;
  fase(e: E): FaseComun;
  motivo(e: E): string | undefined;
  resultado(e: E): R | null;
  paso(e: E | null, m: Muestra | null): string | null;
  orden(antes: string | null, ahora: string | null, e: E | null, idioma: Idioma): string | null;
  textoPaso(paso: string | null, e: E | null, idioma: Idioma): string;
  pasos(paso: string | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[];
  queHacer(paso: string | null, idioma: Idioma): string;
  semaforo(e: E | null, m: Muestra | null): Record<string, Luz>;
  aviso(e: E | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null;
  briefing(idioma: Idioma, nivel?: Nivel): string[];
  explicar(r: R, idioma: Idioma): Linea[];
  repetir(r: R, idioma: Idioma): string | null;
  masFallado(rs: R[], idioma: Idioma): string | null;
  paraGuardar(r: R): object;
}

const celda = (campo: string, es: string, en: string) => ({ campo, nombre: { es, en } });

const defViraje: DefManiobra<Evaluacion, Resultado> = {
  id: "viraje-escarpado",
  insignia: "maniobra-viraje-escarpado-c172",
  avion: "C172",
  titulo: { es: "Viraje escarpado C172", en: "C172 steep turn" },
  tarea: { es: textosReporte("es").tarea, en: textosReporte("en").tarea },
  elementosReporte: elementosAcs,
  celdas: [celda("altitud", "Altitud", "Altitude"), celda("velocidad", "Velocidad", "Airspeed"), celda("inclinacion", "Inclinación", "Bank"), celda("bola", "Bola", "Ball")],
  temas: ["viraje-escarpado", "c172"],
  armar: (m, nivel) => armar(crearEvaluacion(), m, nivel),
  avanzar,
  armarSolo,
  fase: (e) => (e.fase === "viraje1" || e.fase === "entre" || e.fase === "viraje2" ? "en-curso" : e.fase),
  motivo: (e) => e.motivo,
  resultado: (e) => e.resultado ?? null,
  paso: pasoVoz,
  orden: (antes, ahora, e, idioma) => ordenVoz(antes as PasoVoz | null, ahora as PasoVoz | null, e, idioma),
  textoPaso: (paso, _e, idioma) => textoPaso(paso as PasoVoz | null, idioma),
  pasos: (paso, idioma) => listaPasos(paso as PasoVoz | null, idioma),
  queHacer: (paso, idioma) => queHacer(paso as PasoVoz | null, idioma),
  semaforo,
  aviso: avisoVoz,
  briefing,
  explicar,
  repetir,
  masFallado: masFalladoViraje,
  paraGuardar,
};

const defRecto: DefManiobra<EvaluacionRecto, ResultadoRecto> = {
  id: "recto-nivelado",
  insignia: "maniobra-recto-nivelado-c172",
  avion: "C172",
  titulo: { es: "Recto y nivelado C172", en: "C172 straight and level" },
  tarea: { es: "Práctica · Recto y nivelado", en: "Practice · Straight and level" },
  elementosReporte: (n) => {
    const TOL = tolRecto(n);
    return [
    { codigo: "1", texto: `Mantiene la altitud ±${TOL.altitudFt} ft`, textoEn: `Maintains altitude ±${TOL.altitudFt} ft` },
    { codigo: "2", texto: `Mantiene el rumbo ±${TOL.rumboGrados}°`, textoEn: `Maintains heading ±${TOL.rumboGrados}°` },
    { codigo: "3", texto: `Mantiene la velocidad ±${TOL.velocidadKt} kt`, textoEn: `Maintains airspeed ±${TOL.velocidadKt} kt` },
    { codigo: "4", texto: "Vuelo coordinado: bola centrada", textoEn: "Coordinated flight: ball centered" },
    ];
  },
  celdas: [celda("altitud", "Altitud", "Altitude"), celda("rumbo", "Rumbo", "Heading"), celda("velocidad", "Velocidad", "Airspeed"), celda("bola", "Bola", "Ball")],
  temas: ["recto-nivelado", "c172"],
  armar: armarRecto,
  avanzar: avanzarRecto,
  armarSolo: armarSoloRecto,
  fase: (e) => (e.fase === "manteniendo" ? "en-curso" : e.fase),
  motivo: (e) => e.motivo,
  resultado: (e) => e.resultado ?? null,
  paso: pasoRecto,
  orden: (antes, ahora, e, idioma) => ordenRecto(antes as PasoRecto | null, ahora as PasoRecto | null, e, idioma),
  textoPaso: (paso, e, idioma) => textoPasoRecto(paso as PasoRecto | null, e, idioma),
  pasos: (paso, idioma) => listaPasosRecto(paso as PasoRecto | null, idioma),
  queHacer: (paso, idioma) => queHacerRecto(paso as PasoRecto | null, idioma),
  semaforo: semaforoRecto,
  aviso: avisoRecto,
  briefing: briefingRecto,
  explicar: explicarRecto,
  repetir: repetirRecto,
  masFallado: masFalladoRecto,
  paraGuardar: paraGuardarRecto,
};

const defLento: DefManiobra<EvaluacionLento, ResultadoLento> = {
  id: "vuelo-lento",
  insignia: "maniobra-vuelo-lento-c172",
  avion: "C172",
  titulo: { es: "Vuelo lento C172", en: "C172 slow flight" },
  tarea: { es: "Área VII · Tarea A: Vuelo lento", en: "Area VII · Task A: Slow flight" },
  elementosReporte: (n) => {
    const TL = tolLento(n);
    return [
    {
      codigo: "PA.VII.A.S2",
      texto: `Entrada que permite terminar a ${ALTURA_SEGURA_AGL.toLocaleString("en-US")} ft AGL o más`,
      textoEn: `Entry allows completion no lower than ${ALTURA_SEGURA_AGL.toLocaleString("en-US")} ft AGL`,
    },
    {
      codigo: "PA.VII.A.S3",
      texto: `Velocidad de vuelo lento ${OBJETIVO_KT} +${TL.velocidadMasKt}/−0 kt`,
      textoEn: `Slow-flight airspeed ${OBJETIVO_KT} +${TL.velocidadMasKt}/−0 kt`,
    },
    { codigo: "PA.VII.A.S4", texto: "Coordinado y sin aviso de pérdida", textoEn: "Coordinated, no stall warning" },
    {
      codigo: "PA.VII.A.S5",
      texto: `Alt ±${TL.altitudFt} · Rumbo ±${TL.rumboGrados} · Incl ±${TL.inclinacionGrados}`,
      textoEn: `Alt ±${TL.altitudFt} · Hdg ±${TL.rumboGrados} · Bank ±${TL.inclinacionGrados}`,
    },
    ];
  },
  celdas: [
    celda("altitud", "Altitud", "Altitude"),
    celda("rumbo", "Rumbo", "Heading"),
    celda("velocidad", "Velocidad", "Airspeed"),
    celda("inclinacion", `Inclinación ${INCLINACION_VIRAJE}°`, `Bank ${INCLINACION_VIRAJE}°`),
    celda("bola", "Bola", "Ball"),
  ],
  temas: ["vuelo-lento", "c172"],
  armar: armarLento,
  avanzar: avanzarLento,
  armarSolo: armarSoloLento,
  fase: (e) => (e.fase === "armado" || e.fase === "terminado" || e.fase === "invalido" ? e.fase : "en-curso"),
  motivo: (e) => e.motivo,
  resultado: (e) => e.resultado ?? null,
  paso: pasoLento,
  orden: (antes, ahora, e, idioma) => ordenLento(antes as PasoLento | null, ahora as PasoLento | null, e, idioma),
  textoPaso: (paso, e, idioma) => textoPasoLento(paso as PasoLento | null, e, idioma),
  pasos: (paso, idioma) => listaPasosLento(paso as PasoLento | null, idioma),
  queHacer: (paso, idioma) => queHacerLento(paso as PasoLento | null, idioma),
  semaforo: semaforoLento,
  aviso: avisoLento,
  briefing: briefingLento,
  explicar: explicarLento,
  repetir: repetirLento,
  masFallado: masFalladoLento,
  paraGuardar: paraGuardarLento,
};

const defRumbos: DefManiobra<EvaluacionRumbos, ResultadoRumbos> = {
  id: "virajes-rumbos",
  insignia: "maniobra-virajes-rumbos-c172",
  avion: "C172",
  titulo: { es: "Virajes a rumbos C172", en: "C172 turns to headings" },
  tarea: { es: "Práctica · Virajes a rumbos", en: "Practice · Turns to headings" },
  elementosReporte: (n) => {
    const T = tolRumbos(n);
    return [
      { codigo: "1", texto: `Mantiene la altitud ±${T.altitudFt} ft`, textoEn: `Maintains altitude ±${T.altitudFt} ft` },
      { codigo: "2", texto: `Inclinación ${INCLINACION_RUMBOS}° ±${T.inclinacionGrados}°`, textoEn: `Bank ${INCLINACION_RUMBOS}° ±${T.inclinacionGrados}°` },
      { codigo: "3", texto: `Nivela en el rumbo asignado ±${T.rumboGrados}°`, textoEn: `Rolls out on the assigned heading ±${T.rumboGrados}°` },
      { codigo: "4", texto: `Mantiene la velocidad ±${T.velocidadKt} kt`, textoEn: `Maintains airspeed ±${T.velocidadKt} kt` },
      { codigo: "5", texto: "Vuelo coordinado: bola centrada", textoEn: "Coordinated flight: ball centered" },
    ];
  },
  celdas: [
    celda("altitud", "Altitud", "Altitude"),
    celda("inclinacion", `Inclinación ${INCLINACION_RUMBOS}°`, `Bank ${INCLINACION_RUMBOS}°`),
    celda("rumbo", "Rumbo", "Heading"),
    celda("velocidad", "Velocidad", "Airspeed"),
    celda("bola", "Bola", "Ball"),
  ],
  temas: ["c172"],
  armar: armarRumbos,
  avanzar: avanzarRumbos,
  armarSolo: armarSoloRumbos,
  fase: (e) => (e.fase === "virando" || e.fase === "manteniendo" ? "en-curso" : e.fase),
  motivo: (e) => e.motivo,
  resultado: (e) => e.resultado ?? null,
  paso: pasoRumbos,
  orden: (antes, ahora, e, idioma) => ordenRumbos(antes as PasoRumbos | null, ahora as PasoRumbos | null, e, idioma),
  textoPaso: (paso, e, idioma) => textoPasoRumbos(paso as PasoRumbos | null, e, idioma),
  pasos: (paso, idioma) => listaPasosRumbos(paso as PasoRumbos | null, idioma),
  queHacer: (paso, idioma) => queHacerRumbos(paso as PasoRumbos | null, idioma),
  semaforo: semaforoRumbos,
  aviso: avisoRumbos,
  briefing: briefingRumbos,
  explicar: explicarRumbos,
  repetir: repetirRumbos,
  masFallado: masFalladoRumbos,
  paraGuardar: paraGuardarRumbos,
};

const defAltitud: DefManiobra<EvaluacionAltitud, ResultadoAltitud> = {
  id: "ascensos-descensos",
  insignia: "maniobra-ascensos-descensos-c172",
  avion: "C172",
  titulo: { es: "Ascensos y descensos C172", en: "C172 climbs and descents" },
  tarea: { es: "Práctica · Ascensos y descensos", en: "Practice · Climbs and descents" },
  elementosReporte: (n) => {
    const T = tolAltitud(n);
    return [
      { codigo: "1", texto: `Velocidad ${BANDA.sube.join("–")} kt al subir y ${BANDA.baja.join("–")} kt al bajar, ±${T.velocidadKt} kt`, textoEn: `Airspeed ${BANDA.sube.join("-")} kt climbing and ${BANDA.baja.join("-")} kt descending, ±${T.velocidadKt} kt` },
      { codigo: "2", texto: `Nivela en la altitud asignada ±${T.altitudFt} ft`, textoEn: `Levels off at the assigned altitude ±${T.altitudFt} ft` },
      { codigo: "3", texto: `Mantiene el rumbo ±${T.rumboGrados}°`, textoEn: `Maintains heading ±${T.rumboGrados}°` },
      { codigo: "4", texto: "Vuelo coordinado: bola centrada", textoEn: "Coordinated flight: ball centered" },
    ];
  },
  celdas: [celda("velocidad", "Velocidad", "Airspeed"), celda("altitud", "Altitud", "Altitude"), celda("rumbo", "Rumbo", "Heading"), celda("bola", "Bola", "Ball")],
  temas: ["c172"],
  armar: armarAltitud,
  avanzar: avanzarAltitud,
  armarSolo: armarSoloAltitud,
  fase: (e) => (e.fase === "cambiando" || e.fase === "manteniendo" ? "en-curso" : e.fase),
  motivo: (e) => e.motivo,
  resultado: (e) => e.resultado ?? null,
  paso: pasoAltitud,
  orden: (antes, ahora, e, idioma) => ordenAltitud(antes as PasoAltitud | null, ahora as PasoAltitud | null, e, idioma),
  textoPaso: (paso, e, idioma) => textoPasoAltitud(paso as PasoAltitud | null, e, idioma),
  pasos: (paso, idioma) => listaPasosAltitud(paso as PasoAltitud | null, idioma),
  queHacer: (paso, idioma) => queHacerAltitud(paso as PasoAltitud | null, idioma),
  semaforo: semaforoAltitud,
  aviso: avisoAltitud,
  briefing: briefingAltitud,
  explicar: explicarAltitud,
  repetir: repetirAltitud,
  masFallado: masFalladoAltitud,
  paraGuardar: paraGuardarAltitud,
};

export const MANIOBRAS: Record<ManiobraId, DefManiobra> = {
  "viraje-escarpado": defViraje, "recto-nivelado": defRecto, "vuelo-lento": defLento, "virajes-rumbos": defRumbos, "ascensos-descensos": defAltitud,
};

/** Desconocida o null → viraje, que es lo que había antes de las actividades. */
export function defDe(id: string | null | undefined): DefManiobra {
  return MANIOBRAS[id as ManiobraId] ?? defViraje;
}

/** Lo que lee la voz al terminar, como `lecturaFinal` del viraje. */
export function lecturaFinalDe(def: DefManiobra, r: ResultadoComun, idioma: Idioma): string[] {
  const rep = def.repetir(r, idioma);
  const cabeza =
    idioma === "en"
      ? `${r.aprobado ? "Passed" : "Not passed"}. Score: ${r.calificacion} out of 100.`
      : `${r.aprobado ? "Aprobado" : "No aprobado"}. Calificación: ${r.calificacion} de 100.`;
  return [cabeza, ...def.explicar(r, idioma).map((l) => l.texto), ...r.avisos.map((a) => traducirAviso(a, idioma)), ...(rep ? [rep] : [])].map((t) =>
    paraVoz(t, idioma),
  );
}
