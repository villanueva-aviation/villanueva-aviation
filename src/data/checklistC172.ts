export interface ChecklistItem {
  id: string;
  texto: string;
}

export interface ChecklistFase {
  id: string;
  titulo: string;
  items: ChecklistItem[];
}

/**
 * Checklist estándar de referencia para un Cessna 172 de motor a carburador
 * con panel clásico (six-pack) — punto de partida para que la escuela lo
 * ajuste a su avión y procedimientos específicos.
 */
export const CHECKLIST_NORMAL: ChecklistFase[] = [
  {
    id: "prevuelo",
    titulo: "Inspección prevuelo",
    items: [
      { id: "n1", texto: "Documentos de la aeronave (certificados, bitácora) — a bordo y vigentes" },
      { id: "n2", texto: "Interruptor de batería — ON momentáneamente para revisar combustible y flaps, luego OFF" },
      { id: "n3", texto: "Palanca de control — libre y correcta en todo su recorrido" },
      { id: "n4", texto: "Niveles de combustible — verificados visualmente en ambos tanques" },
      { id: "n5", texto: "Drenado de combustible (sumps) — sin agua ni sedimento" },
      { id: "n6", texto: "Aceite del motor — nivel dentro de rango, tapa asegurada" },
      { id: "n7", texto: "Hélice y spinner — sin daños ni grietas" },
      { id: "n8", texto: "Llantas y frenos — presión y desgaste correctos" },
      { id: "n9", texto: "Superficies de control (alerones, elevador, timón) — libres, sin daño, seguros de fijación en su lugar" },
      { id: "n10", texto: "Flaps — sin daño, movimiento correcto" },
      { id: "n11", texto: "Antenas y luces — aseguradas y en buen estado" },
      { id: "n12", texto: "Calzos y amarres — retirados antes de abordar" },
    ],
  },
  {
    id: "antes-arrancar",
    titulo: "Antes de arrancar",
    items: [
      { id: "n13", texto: "Asientos, cinturones y arneses — ajustados y asegurados" },
      { id: "n14", texto: "Frenos — aplicados" },
      { id: "n15", texto: "Interruptores eléctricos y avión — OFF salvo lo necesario" },
      { id: "n16", texto: "Palanca de mezcla — RICA" },
      { id: "n17", texto: "Selector de combustible — AMBOS (BOTH)" },
    ],
  },
  {
    id: "arranque",
    titulo: "Arranque del motor",
    items: [
      { id: "n18", texto: "Ventana o puerta — abierta si se va a dar la llamada 'DESPEJADO'" },
      { id: "n19", texto: "Cebado (primer) — según temperatura del motor" },
      { id: "n20", texto: "'DESPEJADO' — llamado en voz alta antes de girar la llave" },
      { id: "n21", texto: "Llave de encendido — START, soltar al arrancar" },
      { id: "n22", texto: "Presión de aceite — verificar que suba en los primeros segundos" },
      { id: "n23", texto: "RPM — ajustadas a ralentí estable (aprox. 1000 RPM)" },
    ],
  },
  {
    id: "rodaje",
    titulo: "Rodaje",
    items: [
      { id: "n24", texto: "Frenos — probados al iniciar el movimiento" },
      { id: "n25", texto: "Instrumentos de vuelo — verificados durante virajes (indicador de viraje, compás)" },
      { id: "n26", texto: "Velocidad de rodaje — controlada, apropiada para la superficie" },
    ],
  },
  {
    id: "antes-despegue",
    titulo: "Antes de despegue (run-up)",
    items: [
      { id: "n27", texto: "Avión orientado contra el viento, frenos aplicados" },
      { id: "n28", texto: "Potencia — ajustada según manual para prueba de motor" },
      { id: "n29", texto: "Magnetos — probados individualmente, caída de RPM dentro de rango" },
      { id: "n30", texto: "Calentador de carburador — probado" },
      { id: "n31", texto: "Instrumentos del motor — temperaturas y presiones en rango normal" },
      { id: "n32", texto: "Flaps — configurados para despegue según distancia disponible" },
      { id: "n33", texto: "Trim — ajustado para despegue" },
      { id: "n34", texto: "Briefing de despegue — repasado (qué hacer si falla el motor)" },
    ],
  },
  {
    id: "despegue",
    titulo: "Despegue y ascenso",
    items: [
      { id: "n35", texto: "Potencia — máxima aplicada suavemente" },
      { id: "n36", texto: "Instrumentos del motor — verificados en los primeros segundos" },
      { id: "n37", texto: "Rotación — a la velocidad indicada (Vr)" },
      { id: "n38", texto: "Flaps — retraídos a la altura/velocidad segura indicada" },
      { id: "n39", texto: "Velocidad de ascenso — Vx u Vy según necesidad de obstáculos" },
    ],
  },
  {
    id: "crucero",
    titulo: "Crucero",
    items: [
      { id: "n40", texto: "Potencia — reducida al ajuste de crucero recomendado" },
      { id: "n41", texto: "Mezcla — ajustada (leaning) según altitud" },
      { id: "n42", texto: "Navegación — posición confirmada contra el plan de vuelo" },
      { id: "n43", texto: "Escaneo visual de tráfico — constante" },
    ],
  },
  {
    id: "descenso",
    titulo: "Descenso y aproximación",
    items: [
      { id: "n44", texto: "Altímetro — reajustado con el reporte meteorológico de destino" },
      { id: "n45", texto: "Mezcla — enriquecida progresivamente al descender" },
      { id: "n46", texto: "Combustible — selector en AMBOS (BOTH)" },
      { id: "n47", texto: "Calentador de carburador — aplicado si hay riesgo de hielo" },
    ],
  },
  {
    id: "antes-aterrizar",
    titulo: "Antes de aterrizar",
    items: [
      { id: "n48", texto: "Velocidad — reducida a la de aproximación" },
      { id: "n49", texto: "Flaps — extendidos progresivamente según etapas" },
      { id: "n50", texto: "Aproximación estabilizada — velocidad, tasa de descenso y alineación correctas" },
    ],
  },
  {
    id: "despues-aterrizar",
    titulo: "Después de aterrizar",
    items: [
      { id: "n51", texto: "Flaps — retraídos" },
      { id: "n52", texto: "Calentador de carburador — retirado (frío)" },
      { id: "n53", texto: "Luces de aterrizaje — apagadas si aplica" },
    ],
  },
  {
    id: "apagado",
    titulo: "Apagado",
    items: [
      { id: "n54", texto: "Frenos de estacionamiento — aplicados" },
      { id: "n55", texto: "Radios y equipos electrónicos — apagados" },
      { id: "n56", texto: "Mezcla — CORTE (idle cutoff)" },
      { id: "n57", texto: "Magnetos y batería — OFF" },
      { id: "n58", texto: "Bitácora — anotaciones de tiempo de vuelo y anomalías" },
      { id: "n59", texto: "Avión asegurado — calzos y amarres si aplica" },
    ],
  },
];

export const CHECKLIST_EMERGENCIA: ChecklistFase[] = [
  {
    id: "falla-despegue",
    titulo: "Falla de motor durante el despegue",
    items: [
      { id: "e1", texto: "Control de la aeronave — mantener actitud de planeo, nariz abajo para conservar velocidad" },
      { id: "e2", texto: "Pista restante — aterrizar recto al frente si aún hay pista suficiente" },
      { id: "e3", texto: "Palanca de mezcla — CORTE si se decide abortar por completo" },
      { id: "e4", texto: "Combustible — OFF antes del impacto si el tiempo lo permite" },
      { id: "e5", texto: "Evitar virajes de regreso a pista a baja altura" },
    ],
  },
  {
    id: "falla-vuelo",
    titulo: "Falla de motor en vuelo",
    items: [
      { id: "e6", texto: "Velocidad de mejor planeo — establecida de inmediato" },
      { id: "e7", texto: "Área de aterrizaje forzado — seleccionada dentro del alcance de planeo" },
      { id: "e8", texto: "Selector de combustible — verificar en AMBOS, cambiar de tanque si aplica" },
      { id: "e9", texto: "Mezcla — RICA, verificar que no esté en corte" },
      { id: "e10", texto: "Magnetos — probar AMBOS, luego cada uno por separado" },
      { id: "e11", texto: "Bomba de combustible auxiliar — ON si aplica" },
      { id: "e12", texto: "Si el motor no responde — declarar emergencia (MAYDAY) con posición, altitud y almas a bordo" },
    ],
  },
  {
    id: "fuego-arranque",
    titulo: "Fuego durante el arranque (en tierra)",
    items: [
      { id: "e13", texto: "Motor de arranque — continuar girando para intentar que el motor aspire el fuego" },
      { id: "e14", texto: "Mezcla — CORTE" },
      { id: "e15", texto: "Magnetos — OFF" },
      { id: "e16", texto: "Combustible — válvula cerrada" },
      { id: "e17", texto: "Evacuar la aeronave con extintor a la mano si el fuego persiste" },
    ],
  },
  {
    id: "fuego-vuelo",
    titulo: "Fuego en vuelo (motor)",
    items: [
      { id: "e18", texto: "Mezcla — CORTE para cortar el suministro de combustible" },
      { id: "e19", texto: "Selector de combustible — OFF" },
      { id: "e20", texto: "Calefacción de cabina — cerrada, para evitar entrada de humo" },
      { id: "e21", texto: "Establecer velocidad de planeo hacia el sitio de aterrizaje más cercano" },
      { id: "e22", texto: "Magnetos — OFF una vez descartado un reencendido" },
    ],
  },
  {
    id: "falla-electrica",
    titulo: "Falla eléctrica total",
    items: [
      { id: "e23", texto: "Alternador y batería — verificar interruptores y breakers" },
      { id: "e24", texto: "Cargas eléctricas no esenciales — apagadas para conservar batería restante" },
      { id: "e25", texto: "Navegar y comunicar priorizando lo esencial (transponder, radio) mientras haya energía" },
      { id: "e26", texto: "Planear aterrizar en el aeropuerto adecuado más cercano" },
    ],
  },
  {
    id: "aterrizaje-forzado",
    titulo: "Aterrizaje forzado sin motor",
    items: [
      { id: "e27", texto: "Velocidad de mejor planeo — mantenida durante todo el descenso" },
      { id: "e28", texto: "Área de aterrizaje — la más plana y despejada disponible, viento a favor si es posible" },
      { id: "e29", texto: "Combustible y magnetos — OFF antes de la aproximación final" },
      { id: "e30", texto: "Puertas — sin asegurar (para evitar que se atasquen tras el impacto)" },
      { id: "e31", texto: "Cinturones y arneses — ajustados al máximo" },
      { id: "e32", texto: "Transpondedor — código 7700 si hay tiempo" },
    ],
  },
  {
    id: "perdida-barrena",
    titulo: "Recuperación de pérdida / barrena incipiente",
    items: [
      { id: "e33", texto: "Potencia — reducida a ralentí" },
      { id: "e34", texto: "Alerones — neutros" },
      { id: "e35", texto: "Timón — aplicado en dirección opuesta a la rotación" },
      { id: "e36", texto: "Elevador — presión hacia adelante para romper la pérdida" },
      { id: "e37", texto: "Una vez recuperado el vuelo recto — nivelar alas y aplicar potencia suavemente" },
    ],
  },
];
