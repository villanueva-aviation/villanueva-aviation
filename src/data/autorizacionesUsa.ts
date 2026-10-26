import type { Salida } from "../features/gimnasio/autorizaciones";

// Salidas (SID) para el gimnasio de autorizaciones, sacadas de las cartas de la FAA del ciclo d-TPP 2610
// (vigente del 1 al 29 de octubre de 2026; las cartas están en aeronav.faa.gov/d-tpp/2610/). Al cambiar
// de ciclo, revisa el número de revisión de cada SID: es lo primero que cambia.
// "climb via SID" va cuando la carta publica restricciones de altitud en la ruta (FAA JO 7110.65 §4-3-2);
// si no, "maintain" con la altitud tope. Donde depende de la pista, va la configuración más común.
// Se dejaron fuera los fijos sin una pronunciación clara y las transiciones que solo asigna el ATC.
export const SALIDAS_USA: Salida[] = [
  {
    icao: "KLAX",
    ciudad: "Los Ángeles",
    sids: [
      {
        nombre: "PNDAH2",
        dicho: "Panda two",
        subida: { tipo: "via" },
        minutos: 5,
        frecuencias: ["124.3"],
        transiciones: [
          { fijo: "TCATE", dicho: "Tecate" },
          { fijo: "OTAYY", dicho: "Otay" },
        ],
      },
      {
        nombre: "ZILLI5",
        dicho: "Zilli five",
        subida: { tipo: "via" },
        minutos: 5,
        frecuencias: ["124.3"],
        transiciones: [{ fijo: "FICKY", dicho: "Ficky" }],
      },
    ],
  },
  {
    icao: "KSAN",
    ciudad: "San Diego",
    sids: [
      {
        nombre: "CLSSY3",
        dicho: "Classy three",
        subida: { tipo: "via" },
        minutos: 10,
        frecuencias: ["119.6"],
        transiciones: [
          { fijo: "GBN", dicho: "Gila Bend" },
          { fijo: "CENZA", dicho: "Cenza" },
        ],
      },
      {
        nombre: "ZZOOO4",
        dicho: "Zoo four",
        subida: { tipo: "via" },
        minutos: 10,
        frecuencias: ["125.15"],
        transiciones: [
          { fijo: "GBN", dicho: "Gila Bend" },
          { fijo: "CENZA", dicho: "Cenza" },
        ],
      },
      {
        nombre: "PADRZ2",
        dicho: "Padres two",
        subida: { tipo: "via" },
        minutos: 10,
        frecuencias: ["119.6"],
        transiciones: [{ fijo: "EHF", dicho: "Shafter" }],
      },
    ],
  },
  {
    // Flujo oeste (pistas 25L/R y 26), el más común: sin restricciones, así que "maintain 8000".
    icao: "KPHX",
    ciudad: "Phoenix",
    sids: [
      {
        nombre: "STRRM1",
        dicho: "Storm one",
        subida: { tipo: "mantener", pies: 8000 },
        minutos: 3,
        frecuencias: ["126.8"],
        transiciones: [{ fijo: "TUS", dicho: "Tucson" }],
      },
      {
        nombre: "FYRBD1",
        dicho: "Firebird one",
        subida: { tipo: "mantener", pies: 8000 },
        minutos: 3,
        frecuencias: ["126.8"],
        transiciones: [{ fijo: "MOHAK", dicho: "Mohawk" }],
      },
      {
        nombre: "ECLPS1",
        dicho: "Eclipse one",
        subida: { tipo: "mantener", pies: 8000 },
        minutos: 3,
        frecuencias: ["126.8"],
        transiciones: [{ fijo: "PHASE", dicho: "Phase" }],
      },
    ],
  },
  {
    icao: "KSAT",
    ciudad: "San Antonio",
    sids: [
      {
        nombre: "TJANO2",
        dicho: "Tejano two",
        subida: { tipo: "mantener", pies: 5000 },
        minutos: 10,
        frecuencias: ["125.7"],
        transiciones: [
          { fijo: "KAHAN", dicho: "Kahan" },
          { fijo: "ZANNI", dicho: "Zanni" },
        ],
      },
      {
        nombre: "SLENA2",
        dicho: "Selena two",
        subida: { tipo: "mantener", pies: 5000 },
        minutos: 10,
        frecuencias: ["125.7"],
        transiciones: [{ fijo: "BRENI", dicho: "Breni" }],
      },
    ],
  },
  {
    icao: "KIAH",
    ciudad: "Houston",
    sids: [
      {
        nombre: "RITAA7",
        dicho: "Rita seven",
        subida: { tipo: "via" },
        minutos: 10,
        frecuencias: ["127.125"],
        transiciones: [
          { fijo: "CRP", dicho: "Corpus Christi" },
          { fijo: "PSX", dicho: "Palacios" },
        ],
      },
    ],
  },
  {
    // Flujo sur (pistas 17C/R y 18L/R): restricciones publicadas, así que "climb via SID".
    icao: "KDFW",
    ciudad: "Dallas-Fort Worth",
    sids: [
      {
        nombre: "NELYN6",
        dicho: "Nelyn six",
        subida: { tipo: "via" },
        minutos: 10,
        frecuencias: ["125.125"],
        transiciones: [
          { fijo: "SAT", dicho: "San Antonio" },
          { fijo: "ACT", dicho: "Waco" },
        ],
      },
    ],
  },
];
