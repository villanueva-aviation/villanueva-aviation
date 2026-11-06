import { briefing, listaPasos, masFalladoViraje, queHacer } from "./briefing.ts";
import { armar, armarSolo, avanzar, crearEvaluacion, type Evaluacion, type Muestra, type Resultado } from "./evaluador.ts";
import { armarLento, armarSoloLento, avanzarLento, type EvaluacionLento, type ResultadoLento } from "./evaluadorLento.ts";
import { armarRecto, armarSoloRecto, avanzarRecto, type EvaluacionRecto, type ResultadoRecto } from "./evaluadorRecto.ts";
import { explicar, repetir, type Linea } from "./explicacion.ts";
import { briefingLento, explicarLento, listaPasosLento, masFalladoLento, paraGuardarLento, queHacerLento, repetirLento } from "./explicacionLento.ts";
import { briefingRecto, explicarRecto, listaPasosRecto, masFalladoRecto, paraGuardarRecto, queHacerRecto, repetirRecto } from "./explicacionRecto.ts";
import { textosReporte, traducirAviso, type Idioma } from "./idiomaInstructor.ts";
import type { Tema } from "./preguntas.ts";
import { TOLERANCIAS_RECTO as TOL } from "./rectoNivelado.ts";
import { paraGuardar } from "./reglasIntentos.ts";
import { ELEMENTOS_ACS } from "./virajeEscarpado.ts";
import { avisoVoz, ordenVoz, paraVoz, pasoVoz, semaforo, textoPaso, type Aviso, type Luz, type PasoVoz } from "./voz.ts";
import { avisoLento, ordenLento, pasoLento, semaforoLento, textoPasoLento, type PasoLento } from "./vozLento.ts";
import { avisoRecto, ordenRecto, pasoRecto, semaforoRecto, textoPasoRecto, type PasoRecto } from "./vozRecto.ts";
import { INCLINACION_VIRAJE, OBJETIVO_KT, TOLERANCIAS_LENTO as TL } from "./vueloLento.ts";
import { ALTURA_SEGURA_AGL } from "./virajeEscarpado.ts";

// Cada maniobra del instructor en un solo lugar: el programa sigue la definición de la actividad elegida.

export type ManiobraId = "viraje-escarpado" | "recto-nivelado" | "vuelo-lento";
export type FaseComun = "armado" | "en-curso" | "terminado" | "invalido";
export interface ResultadoComun {
  aprobado: boolean;
  calificacion: number;
  elementos: Record<string, "S" | "NS">;
  avisos: string[];
  muestras: Muestra[];
}

/** Métodos con sintaxis de método: cada definición tipa su E y su R, y el registro las guarda como DefManiobra. */
export interface DefManiobra<E = any, R extends ResultadoComun = any> {
  id: ManiobraId;
  insignia: string;
  avion: "C172";
  titulo: Record<Idioma, string>;
  tarea: Record<Idioma, string>;
  elementosReporte: { codigo: string; texto: string; textoEn: string }[];
  celdas: { campo: string; nombre: Record<Idioma, string> }[];
  temas: Tema[];
  armar(m: Muestra): E;
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
  briefing(idioma: Idioma): string[];
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
  elementosReporte: ELEMENTOS_ACS,
  celdas: [celda("altitud", "Altitud", "Altitude"), celda("velocidad", "Velocidad", "Airspeed"), celda("inclinacion", "Inclinación", "Bank"), celda("bola", "Bola", "Ball")],
  temas: ["viraje-escarpado", "c172"],
  armar: (m) => armar(crearEvaluacion(), m),
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
  elementosReporte: [
    { codigo: "1", texto: `Mantiene la altitud ±${TOL.altitudFt} ft`, textoEn: `Maintains altitude ±${TOL.altitudFt} ft` },
    { codigo: "2", texto: `Mantiene el rumbo ±${TOL.rumboGrados}°`, textoEn: `Maintains heading ±${TOL.rumboGrados}°` },
    { codigo: "3", texto: `Mantiene la velocidad ±${TOL.velocidadKt} kt`, textoEn: `Maintains airspeed ±${TOL.velocidadKt} kt` },
    { codigo: "4", texto: "Vuelo coordinado: bola centrada", textoEn: "Coordinated flight: ball centered" },
  ],
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
  elementosReporte: [
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
  ],
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

export const MANIOBRAS: Record<ManiobraId, DefManiobra> = { "viraje-escarpado": defViraje, "recto-nivelado": defRecto, "vuelo-lento": defLento };

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
