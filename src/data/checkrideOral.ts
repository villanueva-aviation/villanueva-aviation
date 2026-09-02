import type { PhraseologyCard } from "../features/academia/AudioPhraseology";

/**
 * Preguntas al estilo de un examen oral de PPL, agrupadas por área de
 * conocimiento típica de un checkride. La respuesta modelo es una guía de
 * referencia, no la única forma correcta de contestar.
 */
export const CHECKRIDE_ORAL: PhraseologyCard[] = [
  {
    situacion: "Aerodinámica — ¿Qué es la pérdida aerodinámica (stall) y qué la causa?",
    callout:
      "La pérdida ocurre cuando se excede el ángulo crítico de ataque del ala, sin importar la velocidad o actitud — el flujo de aire se separa de la superficie superior y la sustentación colapsa.",
    elementos: [
      "Se excede el ángulo crítico de ataque, no depende solo de la velocidad",
      "El flujo de aire se separa de la superficie superior del ala",
      "Puede ocurrir a cualquier velocidad y actitud",
    ],
  },
  {
    situacion: "Meteorología — ¿Cuál es la diferencia entre un METAR y un TAF?",
    callout:
      "El METAR es una observación de las condiciones actuales, válida para el momento en que se emitió. El TAF es un pronóstico, válido típicamente por 24 a 30 horas.",
    elementos: [
      "METAR: observación actual, válida para esa hora específica",
      "TAF: pronóstico, válido típicamente 24-30 horas",
      "Ambos usan el mismo lenguaje codificado",
    ],
  },
  {
    situacion: "Reglamentación — ¿Qué documentos debe llevar la aeronave a bordo en todo vuelo?",
    callout:
      "El certificado de matrícula, el certificado de aeronavegabilidad, el manual de vuelo (POH/AFM) y las bitácoras de la aeronave.",
    elementos: [
      "Certificado de matrícula",
      "Certificado de aeronavegabilidad",
      "Manual de vuelo (POH/AFM)",
      "Bitácoras de la aeronave",
    ],
  },
  {
    situacion: "Espacios aéreos — ¿Qué diferencia hay entre el espacio aéreo Clase B y Clase C?",
    callout:
      "La Clase B requiere autorización EXPLÍCITA de control antes de entrar. La Clase C solo requiere establecer contacto bidireccional — basta con que el controlador confirme tu matrícula de vuelta.",
    elementos: [
      "Clase B requiere autorización explícita antes de entrar",
      "Clase C solo requiere contacto bidireccional establecido",
      "Ambos suelen requerir transponder Modo C",
    ],
  },
  {
    situacion: "Peso y balance — ¿Qué pasa si vuelas con el centro de gravedad fuera de límites hacia atrás?",
    callout:
      "El avión se vuelve más ágil pero peligrosamente inestable en cabeceo, con riesgo real de entrar en pérdida sin previo aviso claro y, en casos extremos, sin poder recuperarla.",
    elementos: [
      "Más ágil pero peligrosamente inestable",
      "Riesgo de pérdida sin previo aviso claro",
      "Puede volverse irrecuperable en casos extremos",
    ],
  },
  {
    situacion: "Sistemas de la aeronave — ¿Cómo funciona el sistema de combustible de tu aeronave de entrenamiento?",
    callout:
      "Hay un tanque en cada ala, con un selector que permite elegir izquierdo, derecho o ambos. Antes de volar se drenan los sumps para revisar que no haya agua ni sedimento.",
    elementos: [
      "Tanques en cada ala",
      "Selector de combustible: IZQUIERDO / DERECHO / AMBOS",
      "Drenados (sumps) antes del vuelo",
    ],
  },
  {
    situacion: "Procedimientos de emergencia — Si el motor falla en vuelo, ¿cuáles son tus prioridades en orden?",
    callout:
      "Primero establecer la velocidad de mejor planeo, luego seleccionar un área de aterrizaje dentro del alcance, después intentar restablecer potencia, y declarar la emergencia si el tiempo lo permite.",
    elementos: [
      "Velocidad de mejor planeo de inmediato",
      "Área de aterrizaje dentro del alcance",
      "Intentar restablecer potencia (combustible, mezcla, magnetos)",
      "Declarar emergencia si el tiempo lo permite",
    ],
  },
  {
    situacion: "Operaciones de aeródromo — ¿Cómo determinas la pista activa y el circuito de tráfico en un aeródromo no controlado?",
    callout:
      "Revisando la manga de viento, escuchando reportes de otros pilotos en la frecuencia CTAF, y asumiendo un patrón estándar con virajes a la izquierda salvo que se indique lo contrario.",
    elementos: [
      "Manga de viento y frecuencia CTAF",
      "Reportes de otros pilotos en la frecuencia",
      "Patrón estándar (virajes a la izquierda) salvo indicación contraria",
    ],
  },
];
