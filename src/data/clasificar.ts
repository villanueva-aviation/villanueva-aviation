// Ejercicios de «clasificar» de la lección: cada tarjeta va en una columna. No cuentan para el avance.
// Las tarjetas van mezcladas a propósito (nunca tres seguidas de la misma columna).

export interface Clasificacion {
  instruccion: string;
  columnas: string[];
  tarjetas: { texto: string; columna: number }[];
}

export const CLASIFICAR: Record<string, Clasificacion> = {
  // Superficie, mando y movimiento de cada eje (PHAK cap. 5 y 6).
  "fundamentos-ejes": {
    instruccion: "¿A qué movimiento pertenece cada tarjeta? Tócala y luego toca su columna.",
    columnas: ["Alabeo · eje longitudinal", "Cabeceo · eje lateral", "Guiñada · eje vertical"],
    tarjetas: [
      { texto: "Alerones", columna: 0 },
      { texto: "Pisar el pedal derecho", columna: 2 },
      { texto: "Elevador", columna: 1 },
      { texto: "Inclinar las alas", columna: 0 },
      { texto: "Timón de dirección", columna: 2 },
      { texto: "Empujar el yoke hacia adelante", columna: 1 },
      { texto: "Girar el yoke a la izquierda", columna: 0 },
      { texto: "Subir o bajar la nariz", columna: 1 },
      { texto: "Mover la nariz a izquierda o derecha", columna: 2 },
    ],
  },
};
