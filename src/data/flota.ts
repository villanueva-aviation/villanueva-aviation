// Flota virtual de Villanueva Aviation: aviones de Microsoft Flight Simulator con la librea de la academia.
// Ordenada como se sube de categoría en la aviación real, del primer vuelo solo al turbohélice.

export type AvionFlota = {
  clave: string;
  matricula: string;
  modelo: string;
  rasgos: string[];
  descripcion: string;
};

export type EtapaFlota = {
  nombre: string;
  resumen: string;
  aviones: AvionFlota[];
};

export const FLOTA: EtapaFlota[] = [
  {
    nombre: "Primeros vuelos",
    resumen: "Donde se aprende a despegar, a hacer el circuito y, sobre todo, a aterrizar.",
    aviones: [
      {
        clave: "c152",
        matricula: "XB-CDT",
        modelo: "Cessna 152",
        rasgos: ["Monomotor pistón", "2 plazas", "Tren fijo"],
        descripcion:
          "Dos plazas, tren fijo y un motor de 110 hp: el avión donde muchísimos pilotos hicieron su primer vuelo solo. Lento, noble y perfecto para aprender a aterrizar.",
      },
      {
        clave: "c172",
        matricula: "XB-VNA",
        modelo: "Cessna 172S Skyhawk",
        rasgos: ["Monomotor pistón", "4 plazas", "Garmin G1000"],
        descripcion:
          "El avión más fabricado de la historia, aquí con cabina de cristal G1000: el mismo entrenador de siempre, pero volando con pantallas en lugar de relojes.",
      },
    ],
  },
  {
    nombre: "Entrenador moderno",
    resumen: "Materiales compuestos, motor diésel y aviónica integrada.",
    aviones: [
      {
        clave: "da40",
        matricula: "XB-NGD",
        modelo: "Diamond DA40 NG",
        rasgos: ["Motor diésel (Jet A)", "4 plazas", "Garmin G1000"],
        descripcion:
          "Estructura de materiales compuestos y un motor diésel que quema Jet A en lugar de gasolina de aviación. Es el entrenador moderno de muchas escuelas de vuelo.",
      },
    ],
  },
  {
    nombre: "Avión complejo",
    resumen: "Tren retráctil y hélice de paso variable: más cosas que administrar en cada fase del vuelo.",
    aviones: [
      {
        clave: "arrow",
        matricula: "XB-ARW",
        modelo: "Piper PA-28R Arrow III",
        rasgos: ["Tren retráctil", "Hélice de paso variable", "4 plazas"],
        descripcion:
          "El primer avión complejo de muchos pilotos. Aquí la lista de verificación deja de ser un trámite: el tren no baja solo.",
      },
    ],
  },
  {
    nombre: "Alto rendimiento",
    resumen: "Más potencia, más velocidad y menos margen para el descuido.",
    aviones: [
      {
        clave: "v35",
        matricula: "XB-VTB",
        modelo: "Beechcraft V35B Bonanza",
        rasgos: ["Cola en V", "Tren retráctil", "Alto rendimiento"],
        descripcion:
          "La Bonanza clásica de cola en V: rápida, elegante y exigente. Premia al piloto que va adelante del avión.",
      },
      {
        clave: "a36",
        matricula: "XB-BNZ",
        modelo: "Beechcraft A36TC Bonanza",
        rasgos: ["Turbo normalizado", "6 plazas", "Tren retráctil"],
        descripcion:
          "Seis plazas y un motor turbo normalizado de 300 hp que conserva su potencia en altura. Cabina de relojes con GPS, como la de tantas avionetas reales.",
      },
    ],
  },
  {
    nombre: "Multimotor",
    resumen: "Dos motores significan otra forma de pensar: qué hacer cuando uno falla.",
    aviones: [
      {
        clave: "seneca",
        matricula: "XB-SNV",
        modelo: "Piper PA-34 Seneca V",
        rasgos: ["Bimotor pistón", "Turbo", "6 plazas"],
        descripcion:
          "El salto al vuelo multimotor. Con el Seneca se entrena la falla de motor en despegue, la velocidad mínima de control y el vuelo asimétrico.",
      },
    ],
  },
  {
    nombre: "Turbohélice",
    resumen: "Turbinas, más peso y operaciones que ya se parecen a las de una aerolínea regional.",
    aviones: [
      {
        clave: "c208",
        matricula: "XB-CVN",
        modelo: "Cessna 208B Grand Caravan",
        rasgos: ["Turbohélice PT6", "Monomotor", "Utilitario"],
        descripcion:
          "Un turbohélice monomotor que opera en pistas cortas y lleva pasajeros o carga a donde casi nadie más llega.",
      },
      {
        clave: "c90",
        matricula: "XB-KNG",
        modelo: "Beechcraft King Air C90GTx",
        rasgos: ["Bimotor turbohélice", "Presurizado", "Aviación ejecutiva"],
        descripcion:
          "Bimotor turbohélice y presurizado: la puerta de entrada a la aviación ejecutiva y a volar por encima del clima.",
      },
      {
        clave: "c408",
        matricula: "XB-SKY",
        modelo: "Cessna 408 SkyCourier",
        rasgos: ["Bimotor turbohélice", "Ala alta", "Carga y pasajeros"],
        descripcion:
          "Bimotor turbohélice de ala alta, pensado para carga y pasajeros en rutas regionales. Es el avión más grande de la flota.",
      },
    ],
  },
];

export const TOTAL_AVIONES = FLOTA.reduce((n, etapa) => n + etapa.aviones.length, 0);

export function fotoFlota(clave: string) {
  return {
    src: `/images/flota/${clave}-1600.webp`,
    srcSet: `/images/flota/${clave}-800.webp 800w, /images/flota/${clave}-1600.webp 1600w`,
  };
}
