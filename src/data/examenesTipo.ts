import type { QuizPregunta } from "../features/academia/quizData";

// Insignias por avión: un examen teórico con lo esencial de cada avión de la flota. Aprobarlo da
// el nivel "Teórico" de la insignia "Experto en …"; el nivel práctico se agregará después.
// Los números salen de los mismos datos del POH que usan los checklists del sitio
// (checklistC152.ts y checklistPremium.ts), para que examen y checklist nunca se contradigan.

export type AreaExamen = "Velocidades" | "Limitaciones" | "Sistemas" | "Procedimientos normales" | "Emergencias";

export interface PreguntaTipo extends QuizPregunta {
  area: AreaExamen;
}

export interface ExamenTipo {
  /** Misma clave que en la flota (flota.ts), para reusar su foto y matrícula. */
  clave: string;
  modelo: string;
  /** El primero es gratis para enganchar; el resto va dentro de Contenido Exclusivo. */
  gratis: boolean;
  preguntas: PreguntaTipo[];
}

export const REGLAS_EXAMEN_TIPO = {
  preguntasPorIntento: 20,
  /** Porcentaje mínimo para aprobar. */
  aprobacion: 80,
  /** Tras reprobar se espera un día: así se estudia el tema en vez de memorizar las opciones. */
  esperaHoras: 24,
};

const C152: PreguntaTipo[] = [
  // ---------- Velocidades ----------
  { id: "c152-v1", area: "Velocidades", pregunta: "¿A qué velocidad se rota en el despegue normal del C152?", opciones: ["45 KIAS", "50 KIAS", "55 KIAS", "60 KIAS"], correcta: 1 },
  { id: "c152-v2", area: "Velocidades", pregunta: "¿Cuál es la velocidad de mejor tasa de ascenso (Vy) a nivel del mar?", opciones: ["55 KIAS", "60 KIAS", "67 KIAS", "74 KIAS"], correcta: 2 },
  { id: "c152-v3", area: "Velocidades", pregunta: "¿Cuál es la velocidad de mejor ángulo de ascenso (Vx)?", opciones: ["55 KIAS", "62 KIAS", "67 KIAS", "50 KIAS"], correcta: 0 },
  { id: "c152-v4", area: "Velocidades", pregunta: "¿Cuál es la velocidad máxima con flaps extendidos (Vfe)?", opciones: ["85 KIAS", "100 KIAS", "110 KIAS", "111 KIAS"], correcta: 0 },
  { id: "c152-v5", area: "Velocidades", pregunta: "¿Cuál es la velocidad que nunca debe excederse (Vne)?", opciones: ["129 KIAS", "149 KIAS", "163 KIAS", "111 KIAS"], correcta: 1 },
  { id: "c152-v6", area: "Velocidades", pregunta: "¿Cuál es la velocidad máxima estructural normal (Vno), el final del arco verde?", opciones: ["104 KIAS", "111 KIAS", "129 KIAS", "149 KIAS"], correcta: 1 },
  { id: "c152-v7", area: "Velocidades", pregunta: "Con el peso máximo de 1,670 lb, ¿cuál es la velocidad de maniobra (Va)?", opciones: ["85 KIAS", "98 KIAS", "104 KIAS", "111 KIAS"], correcta: 2 },
  { id: "c152-v8", area: "Velocidades", pregunta: "Si vuelas con menos peso que el máximo, la velocidad de maniobra (Va):", opciones: ["Aumenta", "Disminuye", "Se queda igual", "Deja de aplicar"], correcta: 1 },
  { id: "c152-v9", area: "Velocidades", pregunta: "¿Cuál es la velocidad de mejor planeo si se para el motor?", opciones: ["50 KIAS", "60 KIAS", "67 KIAS", "85 KIAS"], correcta: 1 },
  { id: "c152-v10", area: "Velocidades", pregunta: "¿Cuál es la velocidad de pérdida con flaps a 30° y peso máximo (Vs0)?", opciones: ["35 KIAS", "40 KIAS", "48 KIAS", "55 KIAS"], correcta: 0 },

  // ---------- Limitaciones ----------
  { id: "c152-l1", area: "Limitaciones", pregunta: "¿Cuál es el peso máximo de despegue del C152?", opciones: ["1,500 lb", "1,670 lb", "1,675 lb", "2,550 lb"], correcta: 1 },
  { id: "c152-l2", area: "Limitaciones", pregunta: "¿Cuánto equipaje puedes llevar como máximo?", opciones: ["50 lb", "100 lb", "120 lb", "200 lb"], correcta: 2 },
  { id: "c152-l3", area: "Limitaciones", pregunta: "¿Cuál es el factor de carga límite con flaps arriba?", opciones: ["+3.8 g / -1.52 g", "+4.4 g / -1.76 g", "+6.0 g / -3.0 g", "+3.5 g / -1.0 g"], correcta: 1 },
  { id: "c152-l4", area: "Limitaciones", pregunta: "¿Cuál es el viento cruzado máximo demostrado?", opciones: ["10 nudos", "12 nudos", "15 nudos", "20 nudos"], correcta: 1 },
  { id: "c152-l5", area: "Limitaciones", pregunta: "El viento cruzado máximo demostrado es:", opciones: ["Un límite que no puede excederse nunca", "El valor con el que se probó el avión, no un límite estructural", "El máximo permitido solo de noche", "Un valor que solo aplica con flaps a 30°"], correcta: 1 },
  { id: "c152-l6", area: "Limitaciones", pregunta: "¿Cuál es la RPM máxima continua del motor?", opciones: ["2,300 RPM", "2,450 RPM", "2,550 RPM", "2,700 RPM"], correcta: 2 },
  { id: "c152-l7", area: "Limitaciones", pregunta: "¿Cuál es el rango normal de presión de aceite?", opciones: ["10 a 60 PSI", "25 a 100 PSI", "60 a 90 PSI", "100 a 150 PSI"], correcta: 1 },
  { id: "c152-l8", area: "Limitaciones", pregunta: "¿Cuánto combustible caben en total en los dos tanques?", opciones: ["26 galones", "38 galones", "40 galones", "56 galones"], correcta: 0 },

  // ---------- Sistemas ----------
  { id: "c152-s1", area: "Sistemas", pregunta: "¿Qué motor lleva el Cessna 152?", opciones: ["Lycoming O-320 de 160 hp", "Lycoming O-235 de 110 hp", "Lycoming IO-360 de 180 hp", "Continental O-200 de 100 hp"], correcta: 1 },
  { id: "c152-s2", area: "Sistemas", pregunta: "¿Cómo llega el combustible al motor?", opciones: ["Con una bomba eléctrica y selector de tanques", "Por gravedad, desde ambas alas, con una sola válvula ON/OFF", "Con una bomba mecánica desde el tanque izquierdo", "Por inyección, desde un tanque en el fuselaje"], correcta: 1 },
  { id: "c152-s3", area: "Sistemas", pregunta: "Si falla el suministro de combustible, ¿qué respaldo tiene el C152?", opciones: ["La bomba auxiliar eléctrica", "El selector al otro tanque", "Ninguno: no tiene bomba auxiliar", "El tanque de reserva del fuselaje"], correcta: 2 },
  { id: "c152-s4", area: "Sistemas", pregunta: "¿Qué aire usa el calentador de carburador?", opciones: ["Aire frío filtrado de la toma principal", "Aire caliente sin filtrar, calentado alrededor del escape", "Aire de la cabina", "Aire comprimido del vacuómetro"], correcta: 1 },
  { id: "c152-s5", area: "Sistemas", pregunta: "En el C152, ¿cuál es el primer síntoma típico de hielo en el carburador?", opciones: ["Sube la temperatura del aceite", "Baja la RPM", "Se enciende la luz de baja tensión", "Sube la presión de aceite"], correcta: 1 },
  { id: "c152-s6", area: "Sistemas", pregunta: "¿Cómo te enteras de una falla del alternador?", opciones: ["Por una alarma sonora del G1000", "Por la luz de baja tensión y el amperímetro", "Porque se apaga el motor", "No hay forma de saberlo en vuelo"], correcta: 1 },
  { id: "c152-s7", area: "Sistemas", pregunta: "¿Cómo es el tren de aterrizaje del C152?", opciones: ["Retráctil, triciclo", "Fijo, convencional (patín de cola)", "Fijo, triciclo, con patas principales de resorte de acero", "Retráctil, convencional"], correcta: 2 },

  // ---------- Procedimientos normales ----------
  { id: "c152-n1", area: "Procedimientos normales", pregunta: "En la prueba de magnetos a 1,700 RPM, ¿cuál es la caída máxima permitida?", opciones: ["50 RPM por magneto, 25 de diferencia", "125 RPM por magneto, 50 de diferencia", "200 RPM por magneto, 100 de diferencia", "300 RPM por magneto, sin límite de diferencia"], correcta: 1 },
  { id: "c152-n2", area: "Procedimientos normales", pregunta: "En crucero, ¿cómo se empobrece la mezcla?", opciones: ["Hasta que el motor se apague y luego un cuarto de vuelta", "Hasta que la RPM baje 25 a 50 del pico", "No se toca: siempre va rica", "Hasta que la temperatura del aceite suba 20 °F"], correcta: 1 },
  { id: "c152-n3", area: "Procedimientos normales", pregunta: "¿Qué flaps se usan para el despegue normal?", opciones: ["30°", "20° a 30°", "0° a 10°", "Solo 40°"], correcta: 2 },
  { id: "c152-n4", area: "Procedimientos normales", pregunta: "¿Cómo se apaga correctamente el motor?", opciones: ["Con la llave de encendido en OFF", "Con la mezcla en CORTE", "Con el Master en OFF", "Cerrando la válvula de combustible"], correcta: 1 },
  { id: "c152-n5", area: "Procedimientos normales", pregunta: "¿Qué velocidad se vuela en final con flaps abajo?", opciones: ["45 a 50 KIAS", "55 a 65 KIAS", "70 a 80 KIAS", "85 a 90 KIAS"], correcta: 1 },
  { id: "c152-n6", area: "Procedimientos normales", pregunta: "¿Cuándo se aplica el calentador de carburador en el descenso?", opciones: ["Nunca en descenso", "Antes de cerrar los gases", "Solo después de aterrizar", "Solo si ya se paró el motor"], correcta: 1 },

  // ---------- Emergencias ----------
  { id: "c152-e1", area: "Emergencias", pregunta: "Se para el motor justo después de despegar, a baja altura. ¿Qué haces?", opciones: ["Virar 180° y regresar a la pista", "Mantener 60 KIAS y aterrizar recto al frente", "Subir la nariz para ganar altura", "Intentar reencender antes de todo"], correcta: 1 },
  { id: "c152-e2", area: "Emergencias", pregunta: "Falla de motor en vuelo: ya tienes 60 KIAS. ¿Qué es lo primero para intentar reencenderlo?", opciones: ["Mezcla a CORTE", "Calentador de carburador a ON", "Master a OFF", "Flaps a 30°"], correcta: 1 },
  { id: "c152-e3", area: "Emergencias", pregunta: "En un fuego de motor en vuelo que no se apaga, ¿qué velocidad se busca?", opciones: ["60 KIAS", "67 KIAS", "85 KIAS", "111 KIAS"], correcta: 2 },
  { id: "c152-e4", area: "Emergencias", pregunta: "En la recuperación de una barrena, ¿cómo van los controles?", opciones: ["Alerones contra la rotación y gases a fondo", "Alerones neutros, gases en ralentí y timón a fondo contra la rotación", "Timón a favor de la rotación y mando atrás", "Solo mando atrás hasta que se detenga"], correcta: 1 },
  { id: "c152-e5", area: "Emergencias", pregunta: "Hay fuego durante el arranque en tierra. ¿Qué haces primero?", opciones: ["Soltar la llave y bajar de inmediato", "Seguir girando el motor de arranque para que aspire las llamas", "Abrir la mezcla a RICA", "Encender la bomba auxiliar"], correcta: 1 },
  { id: "c152-e6", area: "Emergencias", pregunta: "En un aterrizaje forzado, ¿qué se hace con las puertas antes del toque?", opciones: ["Se cierran con seguro", "Se dejan sin asegurar", "Se abren por completo", "No importan"], correcta: 1 },
];

export const EXAMENES_TIPO: ExamenTipo[] = [
  { clave: "c152", modelo: "Cessna 152", gratis: true, preguntas: C152 },
];

export function examenTipo(clave: string | undefined) {
  return EXAMENES_TIPO.find((e) => e.clave === clave) ?? null;
}
