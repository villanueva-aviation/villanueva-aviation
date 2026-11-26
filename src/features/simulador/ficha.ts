// Cifras del helicóptero para el modelo de equilibrio (aproximadas al H135, para práctica de instrumentos).
export type Ficha = {
  nombre: string;
  vne: number; // kt IAS
  cabeceoMax: number; // grados, nariz abajo
  cabeceoArribaMax: number; // grados, nariz arriba
  inclinacionMax: number;
  tauActitud: number; // s
  tauVel: number;
  tauVs: number;
  kVs: number; // ft/min por unidad de potencia sobrante
  preqHover: number; // potencia requerida, fracción del colectivo a nivel del mar
  preqMin: number;
  vPreqMin: number; // kt
  preqVne: number;
};

export const H135: Ficha = {
  nombre: "H135",
  vne: 150,
  cabeceoMax: 20,
  cabeceoArribaMax: 15,
  inclinacionMax: 30,
  tauActitud: 0.8,
  tauVel: 8,
  tauVs: 1.5,
  kVs: 2600,
  preqHover: 0.55,
  preqMin: 0.38,
  vPreqMin: 70,
  preqVne: 0.75,
};
