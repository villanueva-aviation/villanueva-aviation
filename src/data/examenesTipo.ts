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
  /** Nombre para la insignia cuando el del modelo es muy largo (si falta, se abrevia el modelo). */
  corto?: string;
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
  return examen.corto ?? examen.modelo.replace(/^Cessna /, "C").replace(/^Diamond /, "");
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

// DA40 NG: diésel Austro E4 con FADEC y G1000 (AVIONES_CHECKLIST.da40 en checklistAviones.ts). Pesos en kg y presiones en bar, como su AFM.
const DA40: PreguntaTipo[] = [
  // ---------- Velocidades ----------
  { id: "da40-v1", area: "Velocidades", pregunta: "Con la masa máxima de 1,280 kg, ¿a qué velocidad se rota con flaps T/O?", opciones: ["56 KIAS", "62 KIAS", "67 KIAS", "72 KIAS"], correcta: 2 },
  { id: "da40-v2", area: "Velocidades", pregunta: "¿Cuál es la velocidad de mejor tasa de ascenso (Vy) con flaps T/O?", opciones: ["67 KIAS", "72 KIAS", "80 KIAS", "88 KIAS"], correcta: 1 },
  { id: "da40-v3", area: "Velocidades", pregunta: "¿A qué velocidad se hace el ascenso de crucero, con flaps arriba?", opciones: ["72 KIAS", "80 KIAS", "88 KIAS", "101 KIAS"], correcta: 2 },
  { id: "da40-v4", area: "Velocidades", pregunta: "¿Cuál es la velocidad de mejor planeo, con flaps arriba?", opciones: ["68 KIAS", "73 KIAS", "80 KIAS", "88 KIAS"], correcta: 3 },
  { id: "da40-v5", area: "Velocidades", pregunta: "¿Cuál es la velocidad máxima con flaps en T/O?", opciones: ["98 KIAS", "110 KIAS", "113 KIAS", "130 KIAS"], correcta: 1 },
  { id: "da40-v6", area: "Velocidades", pregunta: "¿Cuál es la velocidad máxima con flaps en LDG?", opciones: ["85 KIAS", "92 KIAS", "98 KIAS", "110 KIAS"], correcta: 2 },
  { id: "da40-v7", area: "Velocidades", pregunta: "¿Cuál es la velocidad que nunca debe excederse (Vne)?", opciones: ["149 KIAS", "163 KIAS", "172 KIAS", "178 KIAS"], correcta: 2 },
  { id: "da40-v8", area: "Velocidades", pregunta: "¿Cuál es la velocidad máxima estructural normal (Vno)?", opciones: ["120 KIAS", "129 KIAS", "130 KIAS", "140 KIAS"], correcta: 2 },
  { id: "da40-v9", area: "Velocidades", pregunta: "Con más de 1,180 kg, ¿cuál es la velocidad de maniobra (Va)?", opciones: ["101 KIAS", "105 KIAS", "108 KIAS", "113 KIAS"], correcta: 3 },
  { id: "da40-v10", area: "Velocidades", pregunta: "A 1,200 kg, ¿cuál es la velocidad de pérdida con flaps en LDG?", opciones: ["49 KIAS", "55 KIAS", "59 KIAS", "64 KIAS"], correcta: 2 },

  // ---------- Limitaciones ----------
  { id: "da40-l1", area: "Limitaciones", pregunta: "¿Cuál es la masa máxima de despegue estándar del DA40 NG?", opciones: ["940 kg", "1,150 kg", "1,280 kg", "1,500 kg"], correcta: 2 },
  { id: "da40-l2", area: "Limitaciones", pregunta: "¿Cuánto equipaje admite como máximo (estándar)?", opciones: ["20 kg", "30 kg", "45 kg", "54 kg"], correcta: 1 },
  { id: "da40-l3", area: "Limitaciones", pregunta: "¿Cuál es la RPM máxima continua?", opciones: ["2,100 RPM", "2,300 RPM", "2,500 RPM", "2,700 RPM"], correcta: 0 },
  { id: "da40-l4", area: "Limitaciones", pregunta: "¿Cuánto tiempo se permite la RPM máxima de despegue de 2,300 RPM?", opciones: ["1 minuto", "5 minutos", "10 minutos", "Sin límite"], correcta: 1 },
  { id: "da40-l5", area: "Limitaciones", pregunta: "¿Cuál es la temperatura máxima del refrigerante?", opciones: ["95 °C", "105 °C", "120 °C", "140 °C"], correcta: 1 },
  { id: "da40-l6", area: "Limitaciones", pregunta: "¿Cuál es la temperatura máxima del aceite?", opciones: ["105 °C", "118 °C", "135 °C", "140 °C"], correcta: 3 },
  { id: "da40-l7", area: "Limitaciones", pregunta: "¿Cuál es la altitud máxima de operación?", opciones: ["12,500 ft", "14,000 ft", "16,400 ft", "18,000 ft"], correcta: 2 },
  { id: "da40-l8", area: "Limitaciones", pregunta: "¿Cuál es el factor de carga límite (a Vo)?", opciones: ["+4.4 g / -1.76 g", "+3.8 g / -1.52 g", "+3.0 g / -1.2 g", "+6.0 g / -3.0 g"], correcta: 1 },
  { id: "da40-l9", area: "Limitaciones", pregunta: "¿Se permiten las maniobras negativas intencionales?", opciones: ["Sí, sin límite", "Sí, hasta -1.52 g", "No: están prohibidas", "Solo con flaps arriba"], correcta: 2 },

  // ---------- Sistemas ----------
  { id: "da40-s1", area: "Sistemas", pregunta: "¿Qué motor lleva el DA40 NG?", opciones: ["Lycoming IO-360 a gasolina", "Austro E4, diésel con FADEC", "Continental O-200 a carburador", "Rotax 912 a gasolina"], correcta: 1 },
  { id: "da40-s2", area: "Sistemas", pregunta: "¿Cómo se controla la potencia del motor?", opciones: ["Gases, mezcla y hélice por separado", "Una sola palanca de potencia; el FADEC hace el resto", "Gases y mezcla, con hélice fija", "Gases y calentador de carburador"], correcta: 1 },
  { id: "da40-s3", area: "Sistemas", pregunta: "¿En qué posición va normalmente el interruptor VOTER?", opciones: ["ECU A", "ECU B", "AUTO", "OFF"], correcta: 2 },
  { id: "da40-s4", area: "Sistemas", pregunta: "¿De qué tanque toma combustible el motor?", opciones: ["De los dos tanques a la vez", "Solo del tanque principal; el auxiliar se transfiere con una bomba", "Solo del auxiliar", "Del que elija el selector IZQUIERDA/DERECHA"], correcta: 1 },
  { id: "da40-s5", area: "Sistemas", pregunta: "¿Por qué una falla eléctrica total también es una emergencia de motor?", opciones: ["Porque se apaga la bomba de aceite", "Porque el FADEC necesita electricidad para controlar el motor", "Porque se traba la hélice", "No lo es: el motor es independiente"], correcta: 1 },
  { id: "da40-s6", area: "Sistemas", pregunta: "¿Qué tres interruptores maestros tiene el DA40 NG?", opciones: ["Batería, alternador y aviónica", "Eléctrico, Motor y Aviónica", "Master, magnetos y aviónica", "Batería, FADEC y combustible"], correcta: 1 },
  { id: "da40-s7", area: "Sistemas", pregunta: "¿Para qué sirve la luz GLOW antes de arrancar?", opciones: ["Indica que el aceite está caliente", "Es el precalentamiento del diésel: se espera a que se apague para arrancar", "Avisa que la batería está baja", "Indica que el FADEC está en prueba"], correcta: 1 },
  { id: "da40-s8", area: "Sistemas", pregunta: "¿Por qué se deja el canopy en posición 1 o 2 en tierra antes de arrancar?", opciones: ["Para entrar más rápido", "Deja un hueco de ventilación para no sobrecalentar motor y aviónica en tierra", "Para escuchar la hélice", "Es obligatorio para la prueba de ECU"], correcta: 1 },

  // ---------- Procedimientos normales ----------
  { id: "da40-n1", area: "Procedimientos normales", pregunta: "¿Cuánto tiempo máximo puede operar seguido el motor de arranque?", opciones: ["3 segundos", "10 segundos", "30 segundos", "Sin límite"], correcta: 1 },
  { id: "da40-n2", area: "Procedimientos normales", pregunta: "Después del arranque, ¿en cuánto tiempo debe salir la presión de aceite del rango rojo?", opciones: ["3 segundos", "15 segundos", "30 segundos", "1 minuto"], correcta: 0 },
  { id: "da40-n3", area: "Procedimientos normales", pregunta: "¿Qué verifica la prueba de ECU antes del despegue?", opciones: ["Que la hélice gire libre", "Que los dos canales del FADEC (A y B) funcionen", "Que haya combustible en el auxiliar", "Que el G1000 tenga la base de datos vigente"], correcta: 1 },
  { id: "da40-n4", area: "Procedimientos normales", pregunta: "En el chequeo de potencia con la palanca en MAX, ¿qué RPM debe estabilizar?", opciones: ["1,800–1,900 RPM", "2,000–2,100 RPM", "2,200–2,300 RPM", "2,400–2,500 RPM"], correcta: 2 },
  { id: "da40-n5", area: "Procedimientos normales", pregunta: "Al terminar la prueba de ECU, una luz ECU A FAIL sigue encendida. ¿Qué haces?", opciones: ["Despegar con el VOTER en ECU B", "No volar", "Reiniciar el G1000 y despegar", "Despegar y vigilarla en vuelo"], correcta: 1 },
  { id: "da40-n6", area: "Procedimientos normales", pregunta: "Ya en altura segura tras el despegue, ¿a qué carga se reduce la potencia?", opciones: ["75 %", "85 %", "92 %", "100 %"], correcta: 2 },
  { id: "da40-n7", area: "Procedimientos normales", pregunta: "¿Qué se hace antes de apagar el motor?", opciones: ["Nada: se apaga de inmediato", "1 minuto a 10 % de carga para enfriar el turbocompresor", "5 minutos a 50 % de carga", "Subir a MAX un momento"], correcta: 1 },
  { id: "da40-n8", area: "Procedimientos normales", pregunta: "¿Cómo se apaga correctamente el motor?", opciones: ["Cerrando la válvula de combustible", "Con el interruptor Motor (ENGINE MASTER) en OFF", "Con la palanca de potencia en IDLE", "Con el Eléctrico en OFF"], correcta: 1 },
  { id: "da40-n9", area: "Procedimientos normales", pregunta: "¿Cómo se verifica la cantidad de combustible en el prevuelo?", opciones: ["Mirando por la tapa del tanque", "Con un medio alterno, no por la tapa", "Solo con el indicador del G1000", "No hace falta: el FADEC lo calcula"], correcta: 1 },

  // ---------- Emergencias ----------
  { id: "da40-e1", area: "Emergencias", pregunta: "Falla el motor en el despegue y ya no puedes abortar. ¿Qué haces primero?", opciones: ["Virar de regreso a la pista", "Picar de inmediato para no perder velocidad", "Subir la nariz para ganar altura", "Cambiar el VOTER a ECU A"], correcta: 1 },
  { id: "da40-e2", area: "Emergencias", pregunta: "Falla de motor en vuelo. ¿Qué velocidad y flaps buscas?", opciones: ["72 KIAS, flaps T/O", "80 KIAS, flaps LDG", "88 KIAS, flaps arriba", "101 KIAS, flaps arriba"], correcta: 2 },
  { id: "da40-e3", area: "Emergencias", pregunta: "¿Por qué el reencendido deja de ser confiable después de unos 2 minutos?", opciones: ["Porque se descarga la batería", "Porque el motor se enfría demasiado", "Porque el FADEC se bloquea", "Porque se vacía el tanque principal"], correcta: 1 },
  { id: "da40-e4", area: "Emergencias", pregunta: "El motor sigue sin encender con la válvula en NORMAL. ¿Qué intentas?", opciones: ["Válvula de combustible en EMERGENCY", "Mezcla en RICA", "Calentador de carburador ON", "VOTER en OFF"], correcta: 0 },
  { id: "da40-e5", area: "Emergencias", pregunta: "Avisan ECU A y ECU B a la vez y el motor va áspero. ¿Qué haces con la potencia?", opciones: ["MAX y dejarla así", "IDLE 1 segundo y luego subir despacio sin pasar de 1,975 RPM", "Apagar el motor de inmediato", "No tocarla"], correcta: 1 },
  { id: "da40-e6", area: "Emergencias", pregunta: "La hélice entra en sobrevelocidad. ¿Qué RPM no debes pasar?", opciones: ["2,100 RPM", "2,300 RPM", "2,500 RPM", "2,700 RPM"], correcta: 1 },
  { id: "da40-e7", area: "Emergencias", pregunta: "Falla la bomba de transferencia y pusiste la válvula en EMERGENCY. ¿Cuándo la regresas a NORMAL?", opciones: ["Nunca, hasta aterrizar", "Antes de que el tanque auxiliar llegue a cero", "Cuando el principal esté vacío", "Después de 10 minutos"], correcta: 1 },
  { id: "da40-e8", area: "Emergencias", pregunta: "Fuego de motor en vuelo. Con el sitio de aterrizaje seleccionado, ¿qué haces?", opciones: ["Válvula de combustible OFF, potencia MAX y aterrizar de inmediato", "Encender la calefacción de cabina", "Subir a 16,400 ft", "Seguir al aeropuerto de destino"], correcta: 0 },
  { id: "da40-e9", area: "Emergencias", pregunta: "Hay fuego al arrancar en tierra. ¿Qué haces?", opciones: ["Seguir girando el arrancador", "Cortar combustible, Motor y Eléctrico, abrir el canopy y evacuar", "Subir la potencia a MAX", "Esperar a que se apague solo"], correcta: 1 },
];

// C208B Grand Caravan con G1000 y turbohélice PT6A-114A (AVIONES_CHECKLIST.c208 en checklistAviones.ts).
const C208: PreguntaTipo[] = [
  // ---------- Velocidades ----------
  { id: "c208-v1", area: "Velocidades", pregunta: "¿A qué velocidad se rota en el despegue normal del Caravan?", opciones: ["55–60 KIAS", "62–67 KIAS", "70–75 KIAS", "85–90 KIAS"], correcta: 2 },
  { id: "c208-v2", area: "Velocidades", pregunta: "¿Cuál es la velocidad de ascenso inicial con flaps 20°?", opciones: ["70–75 KIAS", "85–95 KIAS", "100–110 KIAS", "120–130 KIAS"], correcta: 1 },
  { id: "c208-v3", area: "Velocidades", pregunta: "¿Cuál es la velocidad de mejor ángulo de ascenso (Vx)?", opciones: ["62 KIAS", "72 KIAS", "87 KIAS", "104 KIAS"], correcta: 1 },
  { id: "c208-v4", area: "Velocidades", pregunta: "Entre el nivel del mar y 10,000 ft, ¿cuál es la velocidad de mejor tasa de ascenso (Vy)?", opciones: ["87 KIAS", "95 KIAS", "104 KIAS", "120 KIAS"], correcta: 2 },
  { id: "c208-v5", area: "Velocidades", pregunta: "Con 8,750 lb y sin pod de carga, ¿cuál es la velocidad de mejor planeo?", opciones: ["80 KIAS", "90 KIAS", "97 KIAS", "110 KIAS"], correcta: 2 },
  { id: "c208-v6", area: "Velocidades", pregunta: "¿Cuál es la velocidad máxima de operación (Vmo)?", opciones: ["148 KIAS", "163 KIAS", "175 KIAS", "190 KIAS"], correcta: 2 },
  { id: "c208-v7", area: "Velocidades", pregunta: "Con 8,750 lb, ¿cuál es la velocidad de maniobra (Va)?", opciones: ["125 KIAS", "137 KIAS", "148 KIAS", "175 KIAS"], correcta: 2 },
  { id: "c208-v8", area: "Velocidades", pregunta: "¿Cuál es la velocidad máxima con flaps de más de 20°?", opciones: ["100 KIAS", "125 KIAS", "150 KIAS", "175 KIAS"], correcta: 1 },
  { id: "c208-v9", area: "Velocidades", pregunta: "¿Cuál es la velocidad máxima con flaps entre 10° y 20°?", opciones: ["125 KIAS", "140 KIAS", "150 KIAS", "175 KIAS"], correcta: 2 },
  { id: "c208-v10", area: "Velocidades", pregunta: "En el despegue, ¿cuándo se retraen los flaps de 20° a 10°?", opciones: ["Al rotar", "Al pasar 85 KIAS", "Al pasar 125 KIAS", "Al llegar a 1,000 ft"], correcta: 1 },

  // ---------- Limitaciones ----------
  { id: "c208-l1", area: "Limitaciones", pregunta: "¿Cuál es el peso máximo de despegue del 208B?", opciones: ["8,000 lb", "8,500 lb", "8,750 lb", "8,785 lb"], correcta: 2 },
  { id: "c208-l2", area: "Limitaciones", pregunta: "¿Cuál es el peso máximo de aterrizaje?", opciones: ["8,000 lb", "8,500 lb", "8,750 lb", "8,785 lb"], correcta: 1 },
  { id: "c208-l3", area: "Limitaciones", pregunta: "¿Cuál es la ITT máxima para el despegue?", opciones: ["685 °C", "740 °C", "805 °C", "1,090 °C"], correcta: 2 },
  { id: "c208-l4", area: "Limitaciones", pregunta: "¿Cuál es la ITT máxima continua (crucero)?", opciones: ["685 °C", "740 °C", "805 °C", "850 °C"], correcta: 1 },
  { id: "c208-l5", area: "Limitaciones", pregunta: "Durante el arranque, ¿cuál es la ITT máxima y por cuánto tiempo?", opciones: ["805 °C, 5 segundos", "1,090 °C, 2 segundos", "1,090 °C, 20 segundos", "740 °C, sin límite"], correcta: 1 },
  { id: "c208-l6", area: "Limitaciones", pregunta: "¿Cuál es el Ng máximo?", opciones: ["52 %", "97 %", "101.6 %", "110 %"], correcta: 2 },
  { id: "c208-l7", area: "Limitaciones", pregunta: "¿Cuál es el torque máximo continuo?", opciones: ["1,600 ft-lb", "1,865 ft-lb", "1,970 ft-lb", "2,200 ft-lb"], correcta: 1 },
  { id: "c208-l8", area: "Limitaciones", pregunta: "¿Cuál es el factor de carga con flaps abajo?", opciones: ["+3.8 g", "+3.0 g", "+2.4 g", "+4.4 g"], correcta: 2 },
  { id: "c208-l9", area: "Limitaciones", pregunta: "¿Cuál es el viento cruzado máximo demostrado?", opciones: ["12 nudos", "15 nudos", "17 nudos", "20 nudos"], correcta: 3 },
  { id: "c208-l10", area: "Limitaciones", pregunta: "¿Cuál es la diferencia máxima de combustible entre tanques en crucero?", opciones: ["50 lb", "100 lb", "200 lb", "500 lb"], correcta: 2 },

  // ---------- Sistemas ----------
  { id: "c208-s1", area: "Sistemas", pregunta: "¿Qué motor lleva el Caravan 208B?", opciones: ["Lycoming TIO-540 a pistón", "Pratt & Whitney PT6A-114A, turbohélice", "Honeywell TPE331", "Austro E4 diésel"], correcta: 1 },
  { id: "c208-s2", area: "Sistemas", pregunta: "¿Qué tres palancas controlan el motor?", opciones: ["Gases, mezcla y hélice", "Potencia, hélice y condición", "Potencia, mezcla y condición", "Gases, hélice y calentador de carburador"], correcta: 1 },
  { id: "c208-s3", area: "Sistemas", pregunta: "¿Qué posiciones tiene la palanca de condición?", opciones: ["RICA, POBRE y CORTE", "CUTOFF, LOW IDLE y HIGH IDLE", "OFF, ON y START", "FEATHER, MIN y MAX"], correcta: 1 },
  { id: "c208-s4", area: "Sistemas", pregunta: "¿Para qué sirve el rango beta de la hélice?", opciones: ["Para embanderar en vuelo", "Paso negativo que frena en el rodaje y el aterrizaje", "Para subir más rápido", "Para arrancar sin batería"], correcta: 1 },
  { id: "c208-s5", area: "Sistemas", pregunta: "¿Qué hace el separador inercial?", opciones: ["Separa el agua del combustible", "Desvía el aire de entrada para proteger el motor de hielo y objetos extraños", "Enfría el aceite", "Separa los dos tanques de combustible"], correcta: 1 },
  { id: "c208-s6", area: "Sistemas", pregunta: "Si falla el generador principal, ¿qué sostiene el sistema eléctrico?", opciones: ["Solo la batería, por 30 minutos", "El alternador de respaldo (STBY ALT PWR), con menos capacidad", "Un generador de aire de impacto", "Nada: hay que aterrizar de inmediato"], correcta: 1 },
  { id: "c208-s7", area: "Sistemas", pregunta: "¿Qué ciclo de uso tiene el motor de arranque con batería?", opciones: ["10 s ON / 10 s OFF", "30 s ON / 60 s OFF", "60 s ON / 30 s OFF", "Sin límite"], correcta: 1 },
  { id: "c208-s8", area: "Sistemas", pregunta: "¿Por qué nunca se lleva la palanca de potencia por debajo de IDLE en vuelo?", opciones: ["Porque apaga el motor", "Porque mete la hélice en beta y puede causar una sobrevelocidad", "Porque se traba la palanca", "Porque se enciende el separador inercial"], correcta: 1 },

  // ---------- Procedimientos normales ----------
  { id: "c208-n1", area: "Procedimientos normales", pregunta: "¿En qué posición va la palanca de condición para arrancar?", opciones: ["HIGH IDLE", "LOW IDLE", "CUTOFF", "No importa"], correcta: 2 },
  { id: "c208-n2", area: "Procedimientos normales", pregunta: "¿Qué Ng mínimo estable se espera antes de pasar la condición a LOW IDLE?", opciones: ["5 %", "12 %", "52 %", "70 %"], correcta: 1 },
  { id: "c208-n3", area: "Procedimientos normales", pregunta: "¿Qué es lo más vigilado al pasar la condición a LOW IDLE en el arranque?", opciones: ["La presión de combustible en los tanques", "La ITT, por el riesgo de un arranque caliente", "La RPM de la hélice", "El voltaje de la batería"], correcta: 1 },
  { id: "c208-n4", area: "Procedimientos normales", pregunta: "Si la ITT sube rápido hacia el límite en el arranque, ¿qué haces?", opciones: ["Subir la potencia", "Regresar la condición a CUTOFF", "Poner la hélice en FEATHER", "Esperar a que baje sola"], correcta: 1 },
  { id: "c208-n5", area: "Procedimientos normales", pregunta: "¿Con cuántos grados de flaps se despega normalmente?", opciones: ["0°", "10°", "20°", "30°"], correcta: 2 },
  { id: "c208-n6", area: "Procedimientos normales", pregunta: "¿Qué ITT se recomienda no superar de forma sostenida en el ascenso?", opciones: ["685 °C", "740 °C", "805 °C", "900 °C"], correcta: 1 },
  { id: "c208-n7", area: "Procedimientos normales", pregunta: "¿Qué rango de RPM de hélice se usa en crucero?", opciones: ["1,200–1,500 RPM", "1,600–1,900 RPM", "2,000–2,200 RPM", "2,300–2,700 RPM"], correcta: 1 },
  { id: "c208-n8", area: "Procedimientos normales", pregunta: "¿Cómo se apaga correctamente la turbina?", opciones: ["Batería OFF", "Tras 1 minuto con la ITT estable al mínimo: hélice FEATHER y condición CUTOFF", "Cerrando la válvula de combustible con potencia MAX", "Con la hélice en beta"], correcta: 1 },
  { id: "c208-n9", area: "Procedimientos normales", pregunta: "¿En qué posición va la palanca de condición antes de aterrizar?", opciones: ["CUTOFF", "LOW IDLE", "HIGH IDLE", "BETA"], correcta: 2 },

  // ---------- Emergencias ----------
  { id: "c208-e1", area: "Emergencias", pregunta: "Falla el motor justo después del despegue. ¿Qué haces con la hélice?", opciones: ["La dejas en MAX", "La embanderas", "La pasas a beta", "Nada"], correcta: 1 },
  { id: "c208-e2", area: "Emergencias", pregunta: "En un aterrizaje forzado sin motor, ¿qué velocidad se vuela con flaps arriba?", opciones: ["80 KIAS", "90 KIAS", "100 KIAS", "120 KIAS"], correcta: 2 },
  { id: "c208-e3", area: "Emergencias", pregunta: "Sin arrancador disponible, ¿qué velocidad mínima necesitas para reencender con la hélice embanderada?", opciones: ["100 KIAS", "120 KIAS", "140 KIAS", "175 KIAS"], correcta: 2 },
  { id: "c208-e4", area: "Emergencias", pregunta: "Fuego de motor en vuelo. ¿Qué haces primero?", opciones: ["Potencia MAX para llegar al aeropuerto", "Potencia IDLE, hélice FEATHER, condición CUTOFF y combustible cerrado", "Encender la calefacción de cabina", "Reiniciar el generador"], correcta: 1 },
  { id: "c208-e5", area: "Emergencias", pregunta: "Falla el generador y no se recupera con RESET. ¿Qué implica?", opciones: ["Aterrizar de inmediato en cualquier campo", "Generador TRIP, reducir carga y continuar con el respaldo alterno", "Apagar el motor", "Seguir igual, sin cambios"], correcta: 1 },
  { id: "c208-e6", area: "Emergencias", pregunta: "El voltaje del bus sube de 32.5 V. ¿Qué haces?", opciones: ["Batería OFF", "Generador TRIP", "Encender más equipos", "Nada, es normal"], correcta: 1 },
  { id: "c208-e7", area: "Emergencias", pregunta: "Tras un fuego eléctrico ya apagado necesitas energía. ¿Qué NO haces?", opciones: ["Encender los equipos uno por uno", "Reiniciar el breaker que falló", "Revisar los breakers", "Poner la batería en ON"], correcta: 1 },
  { id: "c208-e8", area: "Emergencias", pregunta: "Hay fuego de motor al arrancar en tierra. ¿Qué haces?", opciones: ["Seguir con el arrancador y subir la potencia", "Arrancador OFF, combustible cerrado, batería OFF y evacuar", "Condición a HIGH IDLE", "Hélice en beta"], correcta: 1 },
];

export const EXAMENES_TIPO: ExamenTipo[] = [
  { clave: "c152", modelo: "Cessna 152", gratis: true, preguntas: C152 },
  { clave: "c172", modelo: "Cessna 172", gratis: false, preguntas: C172 },
  { clave: "da40", modelo: "Diamond DA40 NG", gratis: false, preguntas: DA40 },
  { clave: "c208", modelo: "Cessna 208B Grand Caravan", corto: "Caravan", gratis: false, preguntas: C208 },
];

export function examenTipo(clave: string | undefined) {
  return EXAMENES_TIPO.find((e) => e.clave === clave) ?? null;
}
