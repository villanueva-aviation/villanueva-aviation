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
    audioUrl: "/audio/fraseologia/checkride-1.mp3",
    elementos: [
      { descripcion: "Se excede el ángulo crítico de ataque, no depende solo de la velocidad", palabrasClave: ["ángulo crítico", "angulo critico", "ángulo de ataque"] },
      { descripcion: "El flujo de aire se separa de la superficie superior del ala", palabrasClave: ["flujo de aire", "se separa", "superficie superior"] },
      { descripcion: "Puede ocurrir a cualquier velocidad y actitud", palabrasClave: ["cualquier velocidad", "cualquier actitud"] },
    ],
  },
  {
    situacion: "Meteorología — ¿Cuál es la diferencia entre un METAR y un TAF?",
    callout:
      "El METAR es una observación de las condiciones actuales, válida para el momento en que se emitió. El TAF es un pronóstico, válido típicamente por 24 a 30 horas.",
    audioUrl: "/audio/fraseologia/checkride-2.mp3",
    elementos: [
      { descripcion: "METAR: observación actual, válida para esa hora específica", palabrasClave: ["observación actual", "observacion actual", "metar"] },
      { descripcion: "TAF: pronóstico, válido típicamente 24-30 horas", palabrasClave: ["pronóstico", "pronostico", "taf"] },
      { descripcion: "Ambos usan el mismo lenguaje codificado", palabrasClave: ["lenguaje codificado", "código", "codigo"] },
    ],
  },
  {
    situacion: "Reglamentación — ¿Qué documentos debe llevar la aeronave a bordo en todo vuelo?",
    callout:
      "El certificado de matrícula, el certificado de aeronavegabilidad, el manual de vuelo (POH/AFM) y las bitácoras de la aeronave.",
    audioUrl: "/audio/fraseologia/checkride-3.mp3",
    elementos: [
      { descripcion: "Certificado de matrícula", palabrasClave: ["matrícula", "matricula"] },
      { descripcion: "Certificado de aeronavegabilidad", palabrasClave: ["aeronavegabilidad"] },
      { descripcion: "Manual de vuelo (POH/AFM)", palabrasClave: ["manual de vuelo", "poh", "afm"] },
      { descripcion: "Bitácoras de la aeronave", palabrasClave: ["bitácoras", "bitacoras"] },
    ],
  },
  {
    situacion: "Espacios aéreos — ¿Qué diferencia hay entre el espacio aéreo Clase B y Clase C?",
    callout:
      "La Clase B requiere autorización EXPLÍCITA de control antes de entrar. La Clase C solo requiere establecer contacto bidireccional — basta con que el controlador confirme tu matrícula de vuelta.",
    audioUrl: "/audio/fraseologia/checkride-4.mp3",
    elementos: [
      { descripcion: "Clase B requiere autorización explícita antes de entrar", palabrasClave: ["autorización explícita", "autorizacion explicita", "clase b"] },
      { descripcion: "Clase C solo requiere contacto bidireccional establecido", palabrasClave: ["contacto bidireccional", "clase c"] },
      { descripcion: "Ambos suelen requerir transponder Modo C", palabrasClave: ["transponder", "modo c"] },
    ],
  },
  {
    situacion: "Peso y balance — ¿Qué pasa si vuelas con el centro de gravedad fuera de límites hacia atrás?",
    callout:
      "El avión se vuelve más ágil pero peligrosamente inestable en cabeceo, con riesgo real de entrar en pérdida sin previo aviso claro y, en casos extremos, sin poder recuperarla.",
    audioUrl: "/audio/fraseologia/checkride-5.mp3",
    elementos: [
      { descripcion: "Más ágil pero peligrosamente inestable", palabrasClave: ["inestable", "ágil", "agil"] },
      { descripcion: "Riesgo de pérdida sin previo aviso claro", palabrasClave: ["pérdida", "perdida", "sin previo aviso"] },
      { descripcion: "Puede volverse irrecuperable en casos extremos", palabrasClave: ["irrecuperable"] },
    ],
  },
  {
    situacion: "Sistemas de la aeronave — ¿Cómo funciona el sistema de combustible de tu aeronave de entrenamiento?",
    callout:
      "Hay un tanque en cada ala, con un selector que permite elegir izquierdo, derecho o ambos. Antes de volar se drenan los sumps para revisar que no haya agua ni sedimento.",
    audioUrl: "/audio/fraseologia/checkride-6.mp3",
    elementos: [
      { descripcion: "Tanques en cada ala", palabrasClave: ["tanque", "cada ala"] },
      { descripcion: "Selector de combustible: IZQUIERDO / DERECHO / AMBOS", palabrasClave: ["izquierdo", "derecho", "ambos", "selector"] },
      { descripcion: "Drenados (sumps) antes del vuelo", palabrasClave: ["sumps", "drenado", "drenados"] },
    ],
  },
  {
    situacion: "Procedimientos de emergencia — Si el motor falla en vuelo, ¿cuáles son tus prioridades en orden?",
    callout:
      "Primero establecer la velocidad de mejor planeo, luego seleccionar un área de aterrizaje dentro del alcance, después intentar restablecer potencia, y declarar la emergencia si el tiempo lo permite.",
    audioUrl: "/audio/fraseologia/checkride-7.mp3",
    elementos: [
      { descripcion: "Velocidad de mejor planeo de inmediato", palabrasClave: ["mejor planeo", "velocidad de planeo"] },
      { descripcion: "Área de aterrizaje dentro del alcance", palabrasClave: ["área de aterrizaje", "area de aterrizaje", "alcance"] },
      { descripcion: "Intentar restablecer potencia (combustible, mezcla, magnetos)", palabrasClave: ["restablecer potencia", "mezcla", "magnetos"] },
      { descripcion: "Declarar emergencia si el tiempo lo permite", palabrasClave: ["declarar emergencia"] },
    ],
  },
  {
    situacion: "Operaciones de aeródromo — ¿Cómo determinas la pista activa y el circuito de tráfico en un aeródromo no controlado?",
    callout:
      "Revisando la manga de viento, escuchando reportes de otros pilotos en la frecuencia CTAF, y asumiendo un patrón estándar con virajes a la izquierda salvo que se indique lo contrario.",
    audioUrl: "/audio/fraseologia/checkride-8.mp3",
    elementos: [
      { descripcion: "Manga de viento y frecuencia CTAF", palabrasClave: ["manga de viento", "ctaf"] },
      { descripcion: "Reportes de otros pilotos en la frecuencia", palabrasClave: ["reportes", "otros pilotos"] },
      { descripcion: "Patrón estándar (virajes a la izquierda) salvo indicación contraria", palabrasClave: ["patrón estándar", "patron estandar", "virajes a la izquierda"] },
    ],
  },
];
