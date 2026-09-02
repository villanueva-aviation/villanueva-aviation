import type { ChecklistFase } from "./checklistC172";

/**
 * Checklist estándar de referencia para un Cessna 152 de motor a carburador
 * con panel clásico (six-pack) — análoga a la del C172, punto de partida
 * para que la escuela la ajuste a su avión y procedimientos específicos.
 */
export const CHECKLIST_C152_NORMAL: ChecklistFase[] = [
  {
    id: "prevuelo",
    titulo: "Inspección prevuelo",
    items: [
      { id: "c152n-n1", texto: "Documentos de la aeronave (certificados, bitácora) — a bordo y vigentes" },
      { id: "c152n-n2", texto: "Interruptor de batería — ON momentáneamente para revisar combustible y flaps, luego OFF" },
      { id: "c152n-n3", texto: "Palanca de control — libre y correcta en todo su recorrido" },
      { id: "c152n-n4", texto: "Niveles de combustible — verificados visualmente en ambos tanques" },
      { id: "c152n-n5", texto: "Drenado de combustible (sumps) — sin agua ni sedimento" },
      { id: "c152n-n6", texto: "Aceite del motor — nivel dentro de rango, tapa asegurada" },
      { id: "c152n-n7", texto: "Hélice y spinner — sin daños ni grietas" },
      { id: "c152n-n8", texto: "Llantas y frenos — presión y desgaste correctos" },
      { id: "c152n-n9", texto: "Superficies de control (alerones, elevador, timón) — libres, sin daño, seguros de fijación en su lugar" },
      { id: "c152n-n10", texto: "Flaps — sin daño, movimiento correcto" },
      { id: "c152n-n11", texto: "Antenas y luces — aseguradas y en buen estado" },
      { id: "c152n-n12", texto: "Calzos y amarres — retirados antes de abordar" },
    ],
  },
  {
    id: "antes-arrancar",
    titulo: "Antes de arrancar",
    items: [
      { id: "c152n-n13", texto: "Asientos, cinturones y arneses — ajustados y asegurados" },
      { id: "c152n-n14", texto: "Frenos — aplicados" },
      { id: "c152n-n15", texto: "Interruptores eléctricos y avión — OFF salvo lo necesario" },
      { id: "c152n-n16", texto: "Palanca de mezcla — RICA" },
      { id: "c152n-n17", texto: "Selector de combustible — AMBOS (BOTH)" },
    ],
  },
  {
    id: "arranque",
    titulo: "Arranque del motor",
    items: [
      { id: "c152n-n18", texto: "Ventana o puerta — abierta si se va a dar la llamada 'DESPEJADO'" },
      { id: "c152n-n19", texto: "Cebado (primer) — según temperatura del motor" },
      { id: "c152n-n20", texto: "'DESPEJADO' — llamado en voz alta antes de girar la llave" },
      { id: "c152n-n21", texto: "Llave de encendido — START, soltar al arrancar" },
      { id: "c152n-n22", texto: "Presión de aceite — verificar que suba en los primeros segundos" },
      { id: "c152n-n23", texto: "RPM — ajustadas a ralentí estable (aprox. 1000 RPM)" },
    ],
  },
  {
    id: "rodaje",
    titulo: "Rodaje",
    items: [
      { id: "c152n-n24", texto: "Frenos — probados al iniciar el movimiento" },
      { id: "c152n-n25", texto: "Instrumentos de vuelo — verificados durante virajes (indicador de viraje, compás)" },
      { id: "c152n-n26", texto: "Velocidad de rodaje — controlada, apropiada para la superficie" },
    ],
  },
  {
    id: "antes-despegue",
    titulo: "Antes de despegue (run-up)",
    items: [
      { id: "c152n-n27", texto: "Avión orientado contra el viento, frenos aplicados" },
      { id: "c152n-n28", texto: "Potencia — ajustada según manual para prueba de motor" },
      { id: "c152n-n29", texto: "Magnetos — probados individualmente, caída de RPM dentro de rango" },
      { id: "c152n-n30", texto: "Calentador de carburador — probado" },
      { id: "c152n-n31", texto: "Instrumentos del motor — temperaturas y presiones en rango normal" },
      { id: "c152n-n32", texto: "Flaps — configurados para despegue según distancia disponible" },
      { id: "c152n-n33", texto: "Trim — ajustado para despegue" },
      { id: "c152n-n34", texto: "Briefing de despegue — repasado (qué hacer si falla el motor)" },
    ],
  },
  {
    id: "despegue",
    titulo: "Despegue y ascenso",
    items: [
      { id: "c152n-n35", texto: "Potencia — máxima aplicada suavemente" },
      { id: "c152n-n36", texto: "Instrumentos del motor — verificados en los primeros segundos" },
      { id: "c152n-n37", texto: "Rotación — a la velocidad indicada (Vr)" },
      { id: "c152n-n38", texto: "Flaps — retraídos a la altura/velocidad segura indicada" },
      { id: "c152n-n39", texto: "Velocidad de ascenso — Vx u Vy según necesidad de obstáculos" },
    ],
  },
  {
    id: "crucero",
    titulo: "Crucero",
    items: [
      { id: "c152n-n40", texto: "Potencia — reducida al ajuste de crucero recomendado" },
      { id: "c152n-n41", texto: "Mezcla — ajustada (leaning) según altitud" },
      { id: "c152n-n42", texto: "Navegación — posición confirmada contra el plan de vuelo" },
      { id: "c152n-n43", texto: "Escaneo visual de tráfico — constante" },
    ],
  },
  {
    id: "descenso",
    titulo: "Descenso y aproximación",
    items: [
      { id: "c152n-n44", texto: "Altímetro — reajustado con el reporte meteorológico de destino" },
      { id: "c152n-n45", texto: "Mezcla — enriquecida progresivamente al descender" },
      { id: "c152n-n46", texto: "Combustible — selector en AMBOS (BOTH)" },
      { id: "c152n-n47", texto: "Calentador de carburador — aplicado si hay riesgo de hielo" },
    ],
  },
  {
    id: "antes-aterrizar",
    titulo: "Antes de aterrizar",
    items: [
      { id: "c152n-n48", texto: "Velocidad — reducida a la de aproximación" },
      { id: "c152n-n49", texto: "Flaps — extendidos progresivamente según etapas" },
      { id: "c152n-n50", texto: "Aproximación estabilizada — velocidad, tasa de descenso y alineación correctas" },
    ],
  },
  {
    id: "despues-aterrizar",
    titulo: "Después de aterrizar",
    items: [
      { id: "c152n-n51", texto: "Flaps — retraídos" },
      { id: "c152n-n52", texto: "Calentador de carburador — retirado (frío)" },
      { id: "c152n-n53", texto: "Luces de aterrizaje — apagadas si aplica" },
    ],
  },
  {
    id: "apagado",
    titulo: "Apagado",
    items: [
      { id: "c152n-n54", texto: "Frenos de estacionamiento — aplicados" },
      { id: "c152n-n55", texto: "Radios y equipos electrónicos — apagados" },
      { id: "c152n-n56", texto: "Mezcla — CORTE (idle cutoff)" },
      { id: "c152n-n57", texto: "Magnetos y batería — OFF" },
      { id: "c152n-n58", texto: "Bitácora — anotaciones de tiempo de vuelo y anomalías" },
      { id: "c152n-n59", texto: "Avión asegurado — calzos y amarres si aplica" },
    ],
  },
];

export const CHECKLIST_C152_EMERGENCIA: ChecklistFase[] = [
  {
    id: "falla-despegue",
    titulo: "Falla de motor durante el despegue",
    items: [
      { id: "c152e-e1", texto: "Control de la aeronave — mantener actitud de planeo, nariz abajo para conservar velocidad" },
      { id: "c152e-e2", texto: "Pista restante — aterrizar recto al frente si aún hay pista suficiente" },
      { id: "c152e-e3", texto: "Palanca de mezcla — CORTE si se decide abortar por completo" },
      { id: "c152e-e4", texto: "Combustible — OFF antes del impacto si el tiempo lo permite" },
      { id: "c152e-e5", texto: "Evitar virajes de regreso a pista a baja altura" },
    ],
  },
  {
    id: "falla-vuelo",
    titulo: "Falla de motor en vuelo",
    items: [
      { id: "c152e-e6", texto: "Velocidad de mejor planeo — establecida de inmediato" },
      { id: "c152e-e7", texto: "Área de aterrizaje forzado — seleccionada dentro del alcance de planeo" },
      { id: "c152e-e8", texto: "Selector de combustible — verificar en AMBOS, cambiar de tanque si aplica" },
      { id: "c152e-e9", texto: "Mezcla — RICA, verificar que no esté en corte" },
      { id: "c152e-e10", texto: "Magnetos — probar AMBOS, luego cada uno por separado" },
      { id: "c152e-e11", texto: "Bomba de combustible auxiliar — ON si aplica" },
      { id: "c152e-e12", texto: "Si el motor no responde — declarar emergencia (MAYDAY) con posición, altitud y almas a bordo" },
    ],
  },
  {
    id: "fuego-arranque",
    titulo: "Fuego durante el arranque (en tierra)",
    items: [
      { id: "c152e-e13", texto: "Motor de arranque — continuar girando para intentar que el motor aspire el fuego" },
      { id: "c152e-e14", texto: "Mezcla — CORTE" },
      { id: "c152e-e15", texto: "Magnetos — OFF" },
      { id: "c152e-e16", texto: "Combustible — válvula cerrada" },
      { id: "c152e-e17", texto: "Evacuar la aeronave con extintor a la mano si el fuego persiste" },
    ],
  },
  {
    id: "fuego-vuelo",
    titulo: "Fuego en vuelo (motor)",
    items: [
      { id: "c152e-e18", texto: "Mezcla — CORTE para cortar el suministro de combustible" },
      { id: "c152e-e19", texto: "Selector de combustible — OFF" },
      { id: "c152e-e20", texto: "Calefacción de cabina — cerrada, para evitar entrada de humo" },
      { id: "c152e-e21", texto: "Establecer velocidad de planeo hacia el sitio de aterrizaje más cercano" },
      { id: "c152e-e22", texto: "Magnetos — OFF una vez descartado un reencendido" },
    ],
  },
  {
    id: "falla-electrica",
    titulo: "Falla eléctrica total",
    items: [
      { id: "c152e-e23", texto: "Alternador y batería — verificar interruptores y breakers" },
      { id: "c152e-e24", texto: "Cargas eléctricas no esenciales — apagadas para conservar batería restante" },
      { id: "c152e-e25", texto: "Navegar y comunicar priorizando lo esencial (transponder, radio) mientras haya energía" },
      { id: "c152e-e26", texto: "Planear aterrizar en el aeropuerto adecuado más cercano" },
    ],
  },
  {
    id: "aterrizaje-forzado",
    titulo: "Aterrizaje forzado sin motor",
    items: [
      { id: "c152e-e27", texto: "Velocidad de mejor planeo — mantenida durante todo el descenso" },
      { id: "c152e-e28", texto: "Área de aterrizaje — la más plana y despejada disponible, viento a favor si es posible" },
      { id: "c152e-e29", texto: "Combustible y magnetos — OFF antes de la aproximación final" },
      { id: "c152e-e30", texto: "Puertas — sin asegurar (para evitar que se atasquen tras el impacto)" },
      { id: "c152e-e31", texto: "Cinturones y arneses — ajustados al máximo" },
      { id: "c152e-e32", texto: "Transpondedor — código 7700 si hay tiempo" },
    ],
  },
  {
    id: "perdida-barrena",
    titulo: "Recuperación de pérdida / barrena incipiente",
    items: [
      { id: "c152e-e33", texto: "Potencia — reducida a ralentí" },
      { id: "c152e-e34", texto: "Alerones — neutros" },
      { id: "c152e-e35", texto: "Timón — aplicado en dirección opuesta a la rotación" },
      { id: "c152e-e36", texto: "Elevador — presión hacia adelante para romper la pérdida" },
      { id: "c152e-e37", texto: "Una vez recuperado el vuelo recto — nivelar alas y aplicar potencia suavemente" },
    ],
  },
];
