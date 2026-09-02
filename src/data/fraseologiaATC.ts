import type { PhraseologyCard } from "../features/academia/AudioPhraseology";

export const FRASEOLOGIA_RODAJE_DESPEGUE: PhraseologyCard[] = [
  {
    situacion: "Acabas de encender el motor y quieres solicitar la información meteorológica antes de pedir rodaje.",
    callout: "Guadalajara Torre, XB-VLA, solicito información Alfa.",
    elementos: ["A quién llamas (Torre)", "Tu identificación", "Qué solicitas (información ATIS)"],
  },
  {
    situacion: "Ya tienes la información ATIS y estás listo para pedir rodaje hacia la pista activa.",
    callout: "Guadalajara Torre, XB-VLA, plataforma de aviación general, solicito rodaje, con información Alfa.",
    elementos: ["A quién llamas", "Tu identificación", "Tu posición", "Qué necesitas (rodaje)", "Confirmas información recibida"],
  },
  {
    situacion: "La torre te autoriza a rodar, indicando la ruta y un punto donde debes mantenerte corto.",
    callout: "XB-VLA, ruede a pista 20 por calle Alfa, mantenga corto de pista 02.",
    elementos: ["Repites la ruta exacta", "Repites el punto de espera (hold short)", "Terminas con tu identificación"],
  },
  {
    situacion: "Terminaste tu run-up y checklist previa, y estás listo para solicitar la pista.",
    callout: "Torre, XB-VLA, listo para despegue, pista 20.",
    elementos: ["A quién llamas", "Tu identificación", "Qué solicitas", "Pista"],
  },
  {
    situacion: "La torre te autoriza a despegar, indicando el viento actual.",
    callout: "Autorizado a despegar pista 20, XB-VLA.",
    elementos: ["Repites la instrucción exacta", "Confirmas la pista", "Terminas con tu identificación"],
  },
];

export const FRASEOLOGIA_EMERGENCIAS_APROXIMACION: PhraseologyCard[] = [
  {
    situacion: "Aproximación te da vectores y una altitud para secuenciarte con tráfico al frente.",
    callout: "Vire rumbo 180, descienda y mantenga cinco mil pies, espere vectores para secuencia visual, XB-VLA.",
    elementos: ["Repites rumbo", "Repites altitud", "Confirmas que entendiste la secuencia", "Terminas con tu identificación"],
  },
  {
    situacion: "El controlador te reporta tráfico y necesitas confirmar cuando lo tengas a la vista.",
    callout: "Tráfico a la vista, XB-VLA.",
    elementos: ["Confirmas que ves el tráfico", "Terminas con tu identificación"],
  },
  {
    situacion: "Estás en tramo final y la torre te autoriza a aterrizar.",
    callout: "Autorizado a aterrizar pista 20, XB-VLA.",
    elementos: ["Repites la instrucción exacta", "Confirmas la pista", "Terminas con tu identificación"],
  },
  {
    situacion: "Tienes un pasajero con un malestar que no representa peligro inmediato, pero quieres que control lo sepa.",
    callout: "PAN-PAN, PAN-PAN, PAN-PAN, XB-VLA, pasajero con malestar médico, solicito prioridad para aterrizar, posición 10 millas al sur de Guadalajara, cinco mil pies, dos almas a bordo.",
    elementos: ["PAN-PAN repetido 3 veces", "Tu identificación", "Naturaleza de la urgencia", "Posición y altitud", "Almas a bordo"],
  },
  {
    situacion: "El motor falla en vuelo y necesitas declarar una emergencia grave e inminente.",
    callout: "MAYDAY, MAYDAY, MAYDAY, XB-VLA, falla de motor, posición 5 millas al norte de Manzanillo, tres mil pies, dos almas a bordo, combustible una hora, intento aterrizaje forzado en carretera.",
    elementos: ["MAYDAY repetido 3 veces", "Tu identificación", "Naturaleza de la emergencia", "Posición y altitud", "Almas a bordo", "Combustible restante", "Tus intenciones"],
  },
];
