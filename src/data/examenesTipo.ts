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
  /** Entre intentos se espera un día (hasta llegar al dominio): así se estudia el tema en vez de memorizar las opciones. */
  esperaHoras: 24,
  /** Calificación del teórico que pide el nivel Oro. */
  dominio: 95,
};

/** Cómo se llama cada nivel de la insignia, a partir del nombre corto del avión ("C152"). */
export const NIVELES_INSIGNIA = {
  bronce: { medalla: "Bronce", titulo: (avion: string) => `${avion} · Teórico` },
  plata: { medalla: "Plata", titulo: (avion: string) => `${avion} · Práctico` },
  oro: { medalla: "Oro", titulo: (avion: string) => `Experto en ${avion}` },
} as const;

/** Lo que el fundador evalúa en el vuelo práctico (nivel Plata), igual para todos los aviones. */
export const EVALUACION_PRACTICA = [
  "Prevuelo y arranque siguiendo el checklist del avión",
  "Rodaje y prueba de motor antes del despegue",
  "Despegue a la velocidad de rotación y ascenso a Vy",
  "Circuito de tráfico con sus comunicaciones",
  "Una emergencia sorpresa elegida por el instructor (falla de motor, fuego o falla eléctrica), resuelta de memoria",
  "Aproximación estabilizada y aterrizaje",
];

export function nombreCorto(examen: ExamenTipo) {
  return examen.modelo.replace(/^Cessna /, "C");
}

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

// C172S con G1000 y motor a inyección (checklistC172.ts y VSPEEDS_C172). El viento cruzado demostrado (15 kt) es el del POH del 172S.
const C172: PreguntaTipo[] = [
  // ---------- Velocidades ----------
  { id: "c172-v1", area: "Velocidades", pregunta: "¿A qué velocidad se rota en el despegue normal del C172?", opciones: ["50 KIAS", "55 KIAS", "62 KIAS", "70 KIAS"], correcta: 1 },
  { id: "c172-v2", area: "Velocidades", pregunta: "¿Cuál es la velocidad de mejor tasa de ascenso (Vy)?", opciones: ["62 KIAS", "67 KIAS", "74 KIAS", "85 KIAS"], correcta: 2 },
  { id: "c172-v3", area: "Velocidades", pregunta: "¿Cuál es la velocidad de mejor ángulo de ascenso (Vx)?", opciones: ["55 KIAS", "62 KIAS", "68 KIAS", "74 KIAS"], correcta: 1 },
  { id: "c172-v4", area: "Velocidades", pregunta: "¿Cuál es la velocidad máxima para extender los flaps hasta 10°?", opciones: ["85 KIAS", "100 KIAS", "110 KIAS", "129 KIAS"], correcta: 2 },
  { id: "c172-v5", area: "Velocidades", pregunta: "¿Cuál es la velocidad máxima con flaps de 10° a 30°?", opciones: ["85 KIAS", "95 KIAS", "105 KIAS", "110 KIAS"], correcta: 0 },
  { id: "c172-v6", area: "Velocidades", pregunta: "¿Cuál es la velocidad que nunca debe excederse (Vne)?", opciones: ["129 KIAS", "149 KIAS", "163 KIAS", "175 KIAS"], correcta: 2 },
  { id: "c172-v7", area: "Velocidades", pregunta: "¿Cuál es la velocidad máxima estructural normal (Vno), el final del arco verde?", opciones: ["111 KIAS", "120 KIAS", "129 KIAS", "140 KIAS"], correcta: 2 },
  { id: "c172-v8", area: "Velocidades", pregunta: "Con el peso máximo de 2,550 lb, ¿cuál es la velocidad de maniobra (Va)?", opciones: ["90 KIAS", "98 KIAS", "105 KIAS", "110 KIAS"], correcta: 2 },
  { id: "c172-v9", area: "Velocidades", pregunta: "¿Cuál es la velocidad de mejor planeo si se para el motor en vuelo?", opciones: ["60 KIAS", "65 KIAS", "68 KIAS", "74 KIAS"], correcta: 2 },
  { id: "c172-v10", area: "Velocidades", pregunta: "¿Cuál es la velocidad de pérdida con flaps a 30° y peso máximo (Vs0)?", opciones: ["35 KIAS", "40 KIAS", "48 KIAS", "55 KIAS"], correcta: 1 },
  { id: "c172-v11", area: "Velocidades", pregunta: "¿Cuál es la velocidad de pérdida con flaps arriba y peso máximo (Vs)?", opciones: ["40 KIAS", "44 KIAS", "48 KIAS", "53 KIAS"], correcta: 2 },

  // ---------- Limitaciones ----------
  { id: "c172-l1", area: "Limitaciones", pregunta: "¿Cuál es el peso máximo de despegue del C172S en categoría normal?", opciones: ["1,670 lb", "2,300 lb", "2,450 lb", "2,550 lb"], correcta: 3 },
  { id: "c172-l2", area: "Limitaciones", pregunta: "¿Cuál es el factor de carga límite con flaps arriba?", opciones: ["+4.4 g / -1.76 g", "+3.8 g / -1.52 g", "+3.0 g / -1.0 g", "+6.0 g / -3.0 g"], correcta: 1 },
  { id: "c172-l3", area: "Limitaciones", pregunta: "Con los flaps abajo, el factor de carga positivo máximo:", opciones: ["Sube a +4.4 g", "Se queda en +3.8 g", "Baja a +3.0 g", "Deja de tener límite"], correcta: 2 },
  { id: "c172-l4", area: "Limitaciones", pregunta: "¿Cuál es la RPM máxima continua del motor?", opciones: ["2,400 RPM", "2,550 RPM", "2,700 RPM", "2,800 RPM"], correcta: 2 },
  { id: "c172-l5", area: "Limitaciones", pregunta: "¿Cuál es el rango de presión de aceite (mínimo a máximo)?", opciones: ["20 a 115 PSI", "25 a 100 PSI", "10 a 60 PSI", "50 a 150 PSI"], correcta: 0 },
  { id: "c172-l6", area: "Limitaciones", pregunta: "¿Cuál es el mínimo de aceite para poder volar?", opciones: ["3 cuartos", "4 cuartos", "5 cuartos", "8 cuartos"], correcta: 2 },
  { id: "c172-l7", area: "Limitaciones", pregunta: "¿Cuánto combustible utilizable tiene el C172S?", opciones: ["26 galones", "40 galones", "53 galones", "56 galones"], correcta: 2 },
  { id: "c172-l8", area: "Limitaciones", pregunta: "¿Cuál es la temperatura máxima de aceite?", opciones: ["200 °F", "225 °F", "245 °F", "275 °F"], correcta: 2 },
  { id: "c172-l9", area: "Limitaciones", pregunta: "¿Cuál es el viento cruzado máximo demostrado del C172S?", opciones: ["12 nudos", "15 nudos", "17 nudos", "20 nudos"], correcta: 1 },
  { id: "c172-l10", area: "Limitaciones", pregunta: "¿Se puede volar el C172S hacia condiciones de hielo conocidas?", opciones: ["Sí, con la calefacción de pitot encendida", "Sí, si es de noche", "No: está prohibido", "Sí, abajo de 5,000 ft"], correcta: 2 },

  // ---------- Sistemas ----------
  { id: "c172-s1", area: "Sistemas", pregunta: "¿Qué motor lleva el C172S?", opciones: ["Lycoming O-235 de 110 hp", "Lycoming O-320 de 160 hp", "Lycoming IO-360-L2A de 180 hp", "Continental IO-550 de 300 hp"], correcta: 2 },
  { id: "c172-s2", area: "Sistemas", pregunta: "¿Por qué el C172S no tiene calentador de carburador?", opciones: ["Porque el G1000 lo controla solo", "Porque su motor es a inyección, no a carburador", "Porque nunca vuela con humedad", "Porque la bomba auxiliar calienta el combustible"], correcta: 1 },
  { id: "c172-s3", area: "Sistemas", pregunta: "¿Qué posiciones tiene el selector de combustible?", opciones: ["Solo ON y OFF", "IZQUIERDA, DERECHA y AMBOS", "PRINCIPAL y RESERVA", "IZQUIERDA y DERECHA, sin AMBOS"], correcta: 1 },
  { id: "c172-s4", area: "Sistemas", pregunta: "¿Para qué sirve la bomba de combustible auxiliar eléctrica?", opciones: ["Para cebar el motor al arrancar y como respaldo si falla la bomba del motor", "Para pasar combustible de un tanque al otro", "Para enfriar el motor en ascenso", "Para drenar el agua de los tanques"], correcta: 0 },
  { id: "c172-s5", area: "Sistemas", pregunta: "¿Qué energiza el interruptor de Aviónica Master?", opciones: ["La batería y el alternador", "Solo las radios y el G1000", "Los magnetos", "Las luces exteriores"], correcta: 1 },
  { id: "c172-s6", area: "Sistemas", pregunta: "¿Por qué la Aviónica Master va en OFF durante el arranque?", opciones: ["Para ahorrar combustible", "Para no dañar la aviónica con el pico de voltaje del arranque", "Porque el G1000 no funciona en tierra", "Para que el motor de arranque tenga más fuerza"], correcta: 1 },
  { id: "c172-s7", area: "Sistemas", pregunta: "¿Cómo te avisa el C172S de una baja tensión eléctrica?", opciones: ["Con el anunciador de baja tensión (VOLTS)", "Con la bocina de pérdida", "Apagando el G1000", "No hay aviso: hay que mirar la batería"], correcta: 0 },
  { id: "c172-s8", area: "Sistemas", pregunta: "¿Cómo funcionan los flaps del C172S?", opciones: ["Manuales, con palanca entre los asientos", "Eléctricos, de 0° a 30°", "Hidráulicos, de 0° a 40°", "Eléctricos, de 0° a 40°"], correcta: 1 },

  // ---------- Procedimientos normales ----------
  { id: "c172-n1", area: "Procedimientos normales", pregunta: "¿Cómo se ceba el motor antes del arranque?", opciones: ["Con el primer manual, tres bombeadas", "Con el calentador de carburador", "Bomba auxiliar ON y mezcla RICA 3 a 5 segundos, luego CORTE", "Con la mezcla en RICA y los gases a fondo"], correcta: 2 },
  { id: "c172-n2", area: "Procedimientos normales", pregunta: "¿Cómo van gases y mezcla para el arranque?", opciones: ["Gases abiertos 1/4 de pulgada y mezcla en CORTE", "Gases a fondo y mezcla RICA", "Gases cerrados y mezcla a la mitad", "Gases a la mitad y mezcla RICA"], correcta: 0 },
  { id: "c172-n3", area: "Procedimientos normales", pregunta: "En la prueba de magnetos a 1,800 RPM, ¿cuál es la caída máxima permitida?", opciones: ["125 RPM por magneto, 50 de diferencia", "150 RPM por magneto, 50 de diferencia", "175 RPM por magneto, 75 de diferencia", "200 RPM por magneto, 100 de diferencia"], correcta: 1 },
  { id: "c172-n4", area: "Procedimientos normales", pregunta: "En el despegue, ¿a partir de qué altitud se empobrece la mezcla para la RPM máxima?", opciones: ["Desde el nivel del mar", "Sobre 1,000 ft", "Sobre 3,000 ft", "Sobre 8,000 ft"], correcta: 2 },
  { id: "c172-n5", area: "Procedimientos normales", pregunta: "¿Qué potencia máxima se recomienda en crucero?", opciones: ["55 %", "65 %", "75 %", "100 %"], correcta: 2 },
  { id: "c172-n6", area: "Procedimientos normales", pregunta: "¿Qué velocidad se vuela en la aproximación con flaps abajo?", opciones: ["50 a 55 KIAS", "60 a 70 KIAS", "75 a 85 KIAS", "90 a 100 KIAS"], correcta: 1 },
  { id: "c172-n7", area: "Procedimientos normales", pregunta: "¿Cómo se apaga correctamente el motor a inyección?", opciones: ["Llave de encendido en OFF", "Master en OFF", "Mezcla en CORTE", "Válvula de corte de combustible en OFF"], correcta: 2 },
  { id: "c172-n8", area: "Procedimientos normales", pregunta: "Al estacionar, ¿dónde se deja el selector de combustible y por qué?", opciones: ["En AMBOS, para el siguiente arranque", "En IZQUIERDA o DERECHA, para evitar el contraflujo entre tanques", "En OFF, porque no tiene otra posición", "Da igual dónde quede"], correcta: 1 },
  { id: "c172-n9", area: "Procedimientos normales", pregunta: "¿Qué RPM de ralentí se verifica en el run-up?", opciones: ["1,000 RPM o menos", "1,200 a 1,500 RPM", "1,800 RPM", "500 RPM exactas"], correcta: 0 },

  // ---------- Emergencias ----------
  { id: "c172-e1", area: "Emergencias", pregunta: "Se para el motor justo después de despegar, con flaps arriba. ¿Qué haces?", opciones: ["Virar 180° y regresar a la pista", "Mantener 70 KIAS y aterrizar recto al frente", "Subir la nariz para ganar altura", "Encender la bomba auxiliar y esperar"], correcta: 1 },
  { id: "c172-e2", area: "Emergencias", pregunta: "Falla de motor en vuelo, ya en 68 KIAS. ¿Qué haces para intentar reencenderlo?", opciones: ["Mezcla a CORTE y Master OFF", "Válvula de combustible ON, selector AMBOS, bomba auxiliar ON y mezcla RICA", "Calentador de carburador ON", "Flaps a 30° y gases a fondo"], correcta: 1 },
  { id: "c172-e3", area: "Emergencias", pregunta: "Intentas reencender y la hélice está detenida. ¿Dónde pones la llave de encendido?", opciones: ["En OFF", "En L", "En START", "En R"], correcta: 2 },
  { id: "c172-e4", area: "Emergencias", pregunta: "En un fuego de motor en vuelo que no se apaga, ¿qué velocidad se busca?", opciones: ["68 KIAS", "85 KIAS", "100 KIAS", "129 KIAS"], correcta: 2 },
  { id: "c172-e5", area: "Emergencias", pregunta: "Se enciende el anunciador de baja tensión (VOLTS). ¿Qué es lo primero?", opciones: ["Declarar MAYDAY", "Aviónica Master OFF, revisar el breaker del alternador y reiniciar el Master", "Apagar el motor", "Bomba auxiliar ON"], correcta: 1 },
  { id: "c172-e6", area: "Emergencias", pregunta: "Sospechas que la toma estática está bloqueada. ¿Qué haces?", opciones: ["Encender la calefacción de pitot", "Activar la fuente de presión estática alterna", "Romper el vidrio del velocímetro", "Seguir volando sin cambios"], correcta: 1 },
  { id: "c172-e7", area: "Emergencias", pregunta: "Entras sin querer en hielo. ¿Qué haces con los flaps en la aproximación?", opciones: ["Extenderlos a 30° lo antes posible", "No extenderlos: con hielo en la cola pueden quitar efectividad al elevador", "Extenderlos y retraerlos varias veces", "Extenderlos solo a 10°"], correcta: 1 },
  { id: "c172-e8", area: "Emergencias", pregunta: "Hay fuego durante el arranque en tierra. ¿Qué haces primero?", opciones: ["Soltar la llave y bajar de inmediato", "Seguir girando el motor de arranque para que aspire las llamas", "Encender la bomba auxiliar", "Poner la mezcla en RICA"], correcta: 1 },
];

export const EXAMENES_TIPO: ExamenTipo[] = [
  { clave: "c152", modelo: "Cessna 152", gratis: true, preguntas: C152 },
  { clave: "c172", modelo: "Cessna 172", gratis: false, preguntas: C172 },
];

export function examenTipo(clave: string | undefined) {
  return EXAMENES_TIPO.find((e) => e.clave === clave) ?? null;
}
