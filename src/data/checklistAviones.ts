import type { ChecklistFase } from "./checklistC172";
import type { Flujo, VSpeed } from "./checklistPremium";

/** Tabla de consulta que solo tienen los aviones cuyos datos salen de un manual (potencia de crucero, rendimiento…). */
export interface TablaReferencia {
  titulo: string;
  nota: string;
  columnas: string[];
  filas: string[][];
}

export interface AvionChecklist {
  id: string;
  nombre: string;
  /** Qué es el avión y cómo leer este checklist (aparece en el encabezado). */
  nota: string;
  normal: ChecklistFase[];
  emergencia: ChecklistFase[];
  flujos: Flujo[];
  vspeeds: VSpeed[];
  /** Si las V-speeds vienen de un manual, esta nota reemplaza al aviso genérico de "valores de referencia". */
  notaVspeeds?: string;
  potencia?: TablaReferencia;
}

type Fase = [id: string, titulo: string, items: string[]];

const fases = (pre: string, lista: Fase[]): ChecklistFase[] =>
  lista.map(([id, titulo, items]) => ({ id, titulo, items: items.map((texto, i) => ({ id: `${pre}-${id}-${i + 1}`, texto })) }));

const flujos = (pre: string, lista: [string, string, string[]][]): Flujo[] =>
  lista.map(([id, titulo, pasos]) => ({ id: `${pre}-${id}`, titulo, pasos }));

const AVISO = "Referencia para simulación y formación, basada en procedimientos típicos. El checklist oficial es el del manual (AFM/POH) del avión y el del propio simulador; sus valores mandan sobre estos.";

/** Nota de origen para los avisos que sí salen de un manual (POH/AFM) del fabricante. */
const avisoPoh = (fuente: string) =>
  `Los procedimientos y las velocidades están tomados del manual del fabricante (${fuente}). El checklist oficial es el de tu manual (AFM/POH) y el del propio simulador: si difieren, mandan los suyos.`;

// ponytail: valores de V-speeds de referencia (redondeados, avión típico a peso máximo); confirmar contra el POH antes de usarlos como dato.
export const AVIONES_CHECKLIST: Record<string, AvionChecklist> = {
  da40: {
    id: "da40",
    nombre: "Diamond DA40 NG",
    nota: `Motor diésel con FADEC (una sola palanca de potencia, sin mezcla ni calefacción de carburador) y panel Garmin G1000. ${AVISO}`,
    normal: fases("da40n", [
      ["prevuelo", "Inspección prevuelo", [
        "Documentos de la aeronave — a bordo y vigentes",
        "Master ON un momento: revisar combustible y luces, luego OFF",
        "Superficies de control (cola en T incluida) — libres, sin daño",
        "Alas y tanques — cantidad de combustible verificada, tapas aseguradas",
        "Drenado de combustible (sumps) — sin agua ni sedimento",
        "Motor — aceite y refrigerante en rango, sin fugas, capó cerrado",
        "Hélice y spinner — sin daños ni grietas",
        "Tomas de pitot y estática — libres y sin cubiertas",
        "Tren y llantas — presión y desgaste correctos",
        "Cabina — pasajeros informados, equipaje asegurado, canopy limpio",
      ]],
      ["antes-arrancar", "Antes de arrancar", [
        "Asientos, cinturones y arneses — ajustados y asegurados",
        "Canopy — cerrado y asegurado",
        "Freno de estacionamiento — aplicado",
        "Palanca de potencia — IDLE",
        "Master y ECU — ON; autoprueba del FADEC completada sin alertas",
      ]],
      ["arranque", "Arranque del motor", [
        "Luz anticolisión — ON",
        "'DESPEJADO' — llamado en voz alta antes de arrancar",
        "Arrancador — accionado, soltar al encender",
        "Parámetros del motor — presión de aceite y temperaturas verificadas en el G1000",
        "Alternador y aviónica — ON, sin alertas en el G1000",
      ]],
      ["rodaje", "Rodaje", [
        "Frenos — probados al iniciar el movimiento",
        "Instrumentos de vuelo — verificados en virajes",
        "Velocidad de rodaje — controlada, apropiada para la superficie",
      ]],
      ["antes-despegue", "Antes de despegue (run-up)", [
        "Avión contra el viento, frenos aplicados",
        "Temperatura de aceite — en rango para acelerar",
        "Prueba de ECU (canal A/B) — sin caída ni alertas",
        "Ciclo de hélice — según manual, presión de aceite estable",
        "Controles — libres y correctos",
        "Flaps y trim — en posición de despegue",
        "Briefing de despegue — qué hacer si falla el motor",
      ]],
      ["despegue", "Despegue y ascenso", [
        "Potencia — máxima aplicada suavemente",
        "Parámetros del motor — verificados en los primeros segundos",
        "Rotación — a Vr; ascenso a Vy (Vx si hay obstáculos)",
        "Flaps — retraídos a la altura y velocidad seguras",
      ]],
      ["crucero", "Crucero", [
        "Potencia — ajustada al crucero recomendado (sin mezcla que ajustar)",
        "Temperaturas de aceite y refrigerante — dentro de rango",
        "Combustible — consumo y cantidad vs. plan de vuelo",
        "Escaneo de tráfico — constante",
      ]],
      ["descenso", "Descenso y aproximación", [
        "Altímetro — ajustado con el reporte de destino",
        "Briefing de aproximación — circuito, pista y salidas",
        "Parámetros del motor — sin cambios bruscos de potencia",
      ]],
      ["antes-aterrizar", "Antes de aterrizar", [
        "Velocidad — reducida a la de aproximación",
        "Flaps — extendidos por etapas",
        "Aproximación estabilizada — velocidad, tasa de descenso y alineación",
      ]],
      ["apagado", "Después de aterrizar y apagado", [
        "Flaps — retraídos",
        "Frenos de estacionamiento — aplicados",
        "Aviónica y luces — OFF",
        "Motor — apagado según el procedimiento del FADEC",
        "Master — OFF",
        "Bitácora — tiempos y anomalías anotados",
      ]],
    ]),
    emergencia: fases("da40e", [
      ["falla-motor", "Falla de motor en vuelo", [
        "Velocidad de mejor planeo — establecida",
        "Área de aterrizaje — seleccionada",
        "ECU — revisar alerta; probar el canal de respaldo si el manual lo indica",
        "Reencendido — solo si hay altura suficiente",
        "MAYDAY en 121.5 o la frecuencia activa; squawk 7700",
        "Antes del contacto: Master OFF, cinturones ajustados",
      ]],
      ["fuego-motor", "Fuego en el motor", [
        "Potencia — IDLE",
        "Motor — apagar según manual",
        "Calefacción y ventilación — cerradas",
        "Velocidad de planeo y área de aterrizaje forzado",
        "MAYDAY y 7700",
      ]],
      ["falla-electrica", "Falla eléctrica", [
        "Alternador y breakers — verificados",
        "Cargas no esenciales — OFF",
        "Prioridad: radio, transponder y pantalla de respaldo",
        "Aeropuerto más cercano y aviso al ATC",
      ]],
      ["presion-aceite", "Pérdida de presión de aceite", [
        "Verificar con otros parámetros (temperatura de aceite)",
        "Reducir potencia y planear aterrizaje lo antes posible",
        "Preparar aterrizaje sin motor si la presión cae a cero",
      ]],
      ["humo-cabina", "Humo o fuego en cabina", [
        "Master OFF si el fuego es eléctrico",
        "Ventilación — abrir",
        "Aterrizar lo antes posible; MAYDAY y 7700",
      ]],
    ]),
    flujos: flujos("da40", [
      ["falla-motor", "Falla de motor en vuelo", ["Velocidad de planeo", "Área de aterrizaje", "Revisar alerta ECU", "Reencendido si hay altura", "MAYDAY y 7700"]],
      ["fuego-motor", "Fuego en el motor", ["Potencia IDLE", "Apagar motor", "Ventilación cerrada", "Planeo y área", "MAYDAY"]],
      ["falla-electrica", "Falla eléctrica total", ["Breakers y alternador", "Cargas no esenciales OFF", "Radio y transponder primero", "Aeropuerto más cercano"]],
    ]),
    vspeeds: [
      { clave: "Vr", nombre: "Rotación", valor: "59 kt" },
      { clave: "Vx", nombre: "Mejor ángulo de ascenso", valor: "62 kt" },
      { clave: "Vy", nombre: "Mejor tasa de ascenso", valor: "68 kt" },
      { clave: "Vglide", nombre: "Mejor planeo", valor: "73 kt" },
      { clave: "Vfe", nombre: "Máxima con flaps extendidos", valor: "108 kt (despegue) / 91 kt (aterrizaje)" },
      { clave: "Vno", nombre: "Máxima estructural normal", valor: "129 kt" },
      { clave: "Vne", nombre: "Nunca exceder", valor: "178 kt" },
      { clave: "Vs", nombre: "Pérdida, configuración limpia", valor: "49 kt" },
    ],
  },

  c208: {
    id: "c208",
    nombre: "Cessna 208B Caravan",
    nota: `Turbohélice monoturbina (palancas de potencia, hélice y condición; monitoreo de ITT, Ng y torque). ${AVISO}`,
    normal: fases("c208n", [
      ["prevuelo", "Inspección prevuelo", [
        "Documentos de la aeronave — a bordo y vigentes",
        "Combustible — cantidad verificada; drenado de tanques y filtro sin agua",
        "Motor y entradas de aire — sin obstrucciones ni fugas de aceite",
        "Aceite del motor — nivel correcto, tapas aseguradas",
        "Hélice — sin daños ni grietas; escape libre",
        "Superficies de control y flaps — libres y sin daño",
        "Pitot y estática — libres; cubiertas retiradas",
        "Tren, llantas y frenos — correctos",
        "Carga (o pod) — asegurada y dentro del peso y balance",
      ]],
      ["antes-arrancar", "Antes de arrancar", [
        "Asientos, cinturones — ajustados; puertas cerradas",
        "Freno de estacionamiento — aplicado",
        "Palancas — potencia en IDLE, hélice adelante, condición en CORTE (CUTOFF)",
        "Interruptores de combustible y bomba de refuerzo — según procedimiento",
        "Batería ON; aviónica OFF",
      ]],
      ["arranque", "Arranque del motor", [
        "Luz anticolisión — ON; 'DESPEJADO' en voz alta",
        "Arrancador — accionado; vigilar aumento de Ng",
        "Condición — a ralentí bajo (LOW IDLE) en el Ng indicado por el manual",
        "ITT — vigilar el límite de arranque; abortar si se excede",
        "Presión de aceite — sube; generador — ON",
        "Aviónica — ON",
      ]],
      ["rodaje", "Rodaje", [
        "Frenos — probados; usar beta con moderación",
        "Instrumentos de vuelo — verificados en virajes",
        "Velocidad de rodaje — controlada; motor sin exceso de potencia",
      ]],
      ["antes-despegue", "Antes de despegue", [
        "Avión contra el viento, frenos aplicados",
        "Parámetros del motor — torque, ITT, aceite, combustible en verde",
        "Flaps — 20° para despegue; trim — en posición de despegue",
        "Controles — libres y correctos",
        "Briefing de despegue — qué hacer si falla el motor",
      ]],
      ["despegue", "Despegue y ascenso", [
        "Potencia — aplicada suavemente sin exceder torque, ITT ni Ng",
        "Rotación a Vr; ascenso a Vy (o Vx si hay obstáculos)",
        "Flaps — retraídos a la altura y velocidad seguras",
        "Potencia de ascenso — reducida según manual",
      ]],
      ["crucero", "Crucero", [
        "Potencia y RPM — torque de crucero recomendado",
        "Parámetros del motor — dentro de límites; combustible balanceado",
        "Combustible — consumo y cantidad vs. plan",
        "Hielo — ficha de meteorología y protección antihielo si aplica",
      ]],
      ["descenso", "Descenso y aproximación", [
        "Altímetro — ajustado con el reporte de destino",
        "Briefing de aproximación — circuito, pista y salida",
        "Potencia — reducida progresivamente, evitando enfriamiento brusco",
      ]],
      ["antes-aterrizar", "Antes de aterrizar", [
        "Hélice — hacia adelante; velocidad de aproximación",
        "Flaps — 20° y luego 30° según distancia",
        "Aproximación estabilizada — velocidad, tasa de descenso y alineación",
      ]],
      ["apagado", "Después de aterrizar y apagado", [
        "Flaps — retraídos; freno de estacionamiento — aplicado",
        "Enfriamiento del motor — ralentí el tiempo indicado por el manual",
        "Aviónica y luces — OFF",
        "Condición — CORTE (CUTOFF); esperar que la hélice pare",
        "Interruptores de combustible — OFF; batería — OFF",
        "Bitácora — tiempos y anomalías anotados",
      ]],
    ]),
    emergencia: fases("c208e", [
      ["falla-motor", "Falla de motor en vuelo", [
        "Velocidad de mejor planeo — establecida",
        "Hélice — embanderar según manual",
        "Área de aterrizaje — seleccionada",
        "Reencendido solo si hay altura y el manual lo permite",
        "MAYDAY y squawk 7700",
        "Antes del contacto: combustible OFF, cinturones ajustados",
      ]],
      ["fuego-motor", "Fuego en el motor", [
        "Palanca de condición — CORTE; combustible — OFF",
        "Hélice — embanderar",
        "Calefacción y bleed — cerrados",
        "Planeo y área de aterrizaje forzado; MAYDAY y 7700",
      ]],
      ["itt-alta", "Sobretemperatura (ITT) o torque excedido", [
        "Reducir potencia de inmediato",
        "Verificar parámetros; aterrizar en el aeropuerto más cercano si persiste",
      ]],
      ["falla-electrica", "Falla eléctrica", [
        "Generador y breakers — verificados",
        "Cargas no esenciales — OFF; batería como respaldo",
        "Aeropuerto más cercano y aviso al ATC",
      ]],
      ["humo-cabina", "Humo o fuego en cabina", [
        "Master/baterías OFF si es eléctrico",
        "Ventilación — abrir",
        "Aterrizar lo antes posible; MAYDAY y 7700",
      ]],
    ]),
    flujos: flujos("c208", [
      ["falla-motor", "Falla de motor en vuelo", ["Velocidad de planeo", "Embanderar hélice", "Área de aterrizaje", "MAYDAY y 7700"]],
      ["fuego-motor", "Fuego en el motor", ["Condición CORTE", "Combustible OFF", "Embanderar", "Planeo y área", "MAYDAY"]],
      ["falla-electrica", "Falla eléctrica total", ["Breakers y generador", "Cargas no esenciales OFF", "Radio y transponder primero", "Aeropuerto más cercano"]],
    ]),
    vspeeds: [
      { clave: "Vr", nombre: "Rotación", valor: "80 kt" },
      { clave: "Vy", nombre: "Mejor tasa de ascenso", valor: "87 kt" },
      { clave: "Vglide", nombre: "Mejor planeo", valor: "90 kt" },
      { clave: "Vfe", nombre: "Máxima con flaps extendidos", valor: "150 kt (20°) / 125 kt (30°)" },
      { clave: "Vno", nombre: "Máxima estructural normal", valor: "175 kt" },
      { clave: "Vs0", nombre: "Pérdida, configuración de aterrizaje", valor: "61 kt" },
    ],
  },

  dakota: {
    id: "dakota",
    nombre: "Piper PA-28-236 Dakota",
    nota: `Cuatro plazas de tren fijo con motor Lycoming O-540-J3A5D de 235 hp a carburador, hélice de velocidad constante, selector de combustible por tanque (sin posición AMBOS) y estabilizador con trim. ${avisoPoh("Piper PA-28-236 Dakota, POH VB-910")} Las velocidades están en KIAS.`,
    normal: fases("dkn", [
      ["prevuelo-cabina", "Prevuelo: cabina", [
        "Volante — liberar los seguros; freno de estacionamiento — aplicado",
        "Todos los interruptores y la aviónica — OFF; mezcla — CORTE (idle cut-off)",
        "Master — ON: cantidad de combustible y panel de anunciadores verificados; luego master — OFF",
        "Controles primarios y flaps — operación correcta; trim — neutral",
        "Pitot y estática — drenar; ventanas y parabrisas — limpios",
        "Documentos requeridos — a bordo; equipaje y herramienta de remolque — bien estibados",
      ]],
      ["prevuelo-exterior", "Prevuelo: exterior", [
        "Ala derecha — superficie libre de hielo, escarcha y nieve; flap, alerón, bisagras y luz de la punta",
        "Tanque de combustible — cantidad a la vista y tapa segura; venteo despejado; drenar el sumidero y revisar agua, sedimento y grado",
        "Tren principal — amortiguador con la inflación correcta (4.5 in), llanta y freno; calzas y amarres fuera",
        "Nariz — cofia asegurada, hélice y spinner sin daños, entradas de aire libres y tensión de la banda del alternador",
        "Tren de nariz — amortiguador (3.25 in) y llanta; aceite — cantidad correcta y varilla bien asentada; filtro de combustible — drenar",
        "Ala izquierda — mismo recorrido (superficie, tanque, sumidero, tren, amarres); tubo pitot — cubierta fuera y orificios libres",
        "Fuselaje y cola — antenas, tomas estáticas libres, estabilizador y trim tab, sin hielo; amarre de cola fuera",
        "Master ON: luces de navegación y estrobo, aviso de pérdida y calefacción del pitot — verificados; luego todo OFF",
        "Pasajeros a bordo, puerta cerrada y asegurada; cinturones y arneses ajustados",
      ]],
      ["antes-arrancar", "Antes de arrancar", [
        "Freno de estacionamiento — aplicado",
        "Hélice — RPM altas (full INCREASE)",
        "Selector de combustible — tanque deseado",
        "Calefacción de carburador — OFF; radios — OFF",
      ]],
      ["arranque", "Arranque del motor", [
        "En frío: master ON, bomba eléctrica de combustible ON, mezcla RICH a fondo y acelerador 1/4 abierto",
        "Starter — accionar y ajustar el acelerador; presión de aceite — verificar",
        "Si no enciende: 1 a 3 golpes de la bomba de cebado y repetir; con el motor en marcha, cebador asegurado",
        "En caliente: acelerador 1/2 pulgada abierto y la misma secuencia, sin cebar",
        "Ahogado: acelerador a fondo, bomba eléctrica OFF, mezcla en corte; arrancar, avanzar la mezcla y reducir el acelerador",
      ]],
      ["rodaje", "Calentamiento y rodaje", [
        "Calentamiento — acelerador a 1,000–1,200 RPM",
        "Calzas fuera y área de rodaje despejada; freno de estacionamiento — liberado",
        "Acelerador — aplicar despacio; hélice — RPM altas",
        "Frenos y dirección — probados al iniciar el movimiento",
      ]],
      ["prueba-motor", "Prueba de motor (run-up)", [
        "Freno de estacionamiento — aplicado; hélice — full INCREASE; acelerador — 2,000 RPM",
        "Magnetos — caída máxima de 175 RPM y diferencia máxima entre ambos de 50 RPM",
        "Succión (vacío) — 5.0 in Hg; temperatura y presión de aceite — verificadas",
        "Anunciadores — press-to-test; calefacción de carburador — probada",
        "Hélice — ejercitarla (ciclo) y regresar a full INCREASE",
        "Bomba eléctrica — OFF; presión de combustible — verificada; acelerador — atrás",
      ]],
      ["antes-despegue", "Antes de despegue", [
        "Instrumentos de vuelo y del motor — verificados; selector de combustible — tanque adecuado",
        "Bomba eléctrica — ON; calefacción de carburador — OFF",
        "Respaldos erguidos; cebador asegurado; mezcla y hélice — ajustadas",
        "Cinturones y arneses ajustados, también en los asientos vacíos; puertas aseguradas",
        "Flaps y trim — para el despegue; controles — libres",
        "Aire acondicionado — OFF (si está instalado); freno de estacionamiento — liberado",
      ]],
      ["despegue", "Despegue", [
        "Normal: flaps y trim ajustados; acelerar a 60–65 KIAS y rotar con presión hacia atrás",
        "Pista corta con obstáculo: flaps 25° (segundo punto); rotar a 50–60 KIAS según el peso; ya en el aire, 73 KIAS (Vx) para pasar el obstáculo; luego 85 KIAS (Vy) y retraer flaps despacio",
        "Pista corta sin obstáculo: flaps 25° y el mismo procedimiento, acelerando directamente a 85 KIAS (Vy)",
        "Pista blanda: flaps 25°; levantar la nariz lo antes posible y despegar a la menor velocidad posible; en efecto suelo, 73 KIAS (con obstáculo) u 85 KIAS; retraer flaps despacio",
      ]],
      ["ascenso", "Ascenso", [
        "Mejor tasa (flaps arriba): 85 KIAS; mejor ángulo: 73 KIAS; en ruta: 100 KIAS",
        "Bomba eléctrica de combustible — OFF al alcanzar la altitud deseada",
      ]],
      ["crucero", "Crucero", [
        "Potencia — según la tabla de potencia; máximo normal 75 %",
        "Mezcla — ajustada",
      ]],
      ["descenso", "Descenso", [
        "Normal: acelerador para unos 1,000 ft/min; hélice 2,400 RPM; velocidad no mayor de 137 KIAS (Vno); mezcla rica",
        "Calefacción de carburador — ON si hay riesgo de hielo",
        "Sin potencia: calefacción de carburador ON si hace falta y acelerador cerrado; verificar la potencia con el acelerador cada 30 segundos",
      ]],
      ["aterrizaje", "Aproximación y aterrizaje", [
        "Selector de combustible — tanque adecuado; bomba eléctrica — ON",
        "Respaldos erguidos; cinturones y arneses ajustados; aire acondicionado — OFF",
        "Mezcla y hélice — ajustadas",
        "Flaps — abajo, sin exceder 102 KIAS",
        "Trim — para 72 KIAS (aproximación final con flaps 40°)",
      ]],
      ["apagado", "Apagado y estacionamiento", [
        "Flaps — retraídos; bomba eléctrica, aire acondicionado y radios — OFF",
        "Hélice — full INCREASE; acelerador — atrás; mezcla — CORTE; magnetos — OFF; master — OFF",
        "Freno de estacionamiento — aplicado; volante asegurado con los cinturones; flaps arriba",
        "Calzas y amarres — puestos",
      ]],
    ]),
    emergencia: fases("dke", [
      ["falla-despegue-tierra", "Falla de motor en el despegue (aún en tierra)", [
        "Pista suficiente: acelerador cerrado de inmediato, frenos según se necesite y detenerse recto",
        "Pista insuficiente: acelerador cerrado, frenos, mezcla en corte, selector de combustible OFF, master OFF, magnetos OFF",
        "Mantener el control direccional y esquivar obstáculos",
      ]],
      ["falla-despegue-aire", "Falla de motor en el despegue (ya en el aire)", [
        "Velocidad — sobre la de pérdida; control direccional — mantenido",
        "Pista suficiente delante: aterrizar recto",
        "Pista insuficiente: acelerador cerrado, mezcla en corte, combustible OFF, master OFF, magnetos OFF, flaps según se necesite; solo virajes suaves",
        "Si hay altura para intentar reencender: selector al otro tanque, bomba eléctrica ON, mezcla RICH y calefacción de carburador ON",
        "Si no regresa la potencia: aterrizaje sin motor",
      ]],
      ["falla-motor", "Falla de motor en vuelo", [
        "Selector — al otro tanque con combustible; bomba eléctrica — ON; mezcla — RICH; calefacción de carburador — ON",
        "Instrumentos del motor — buscar la causa; cebador — asegurado",
        "Sin presión de combustible: comprobar que el selector esté en un tanque con combustible",
        "Sin potencia todavía: magnetos en L, luego R y otra vez BOTH; probar otros ajustes de acelerador y mezcla",
        "Con potencia recuperada: calefacción de carburador OFF y bomba eléctrica OFF",
        "Si no se recupera: mejor planeo a 85 KIAS con trim y prepararse para un aterrizaje sin motor",
      ]],
      ["aterrizaje-sin-motor", "Aterrizaje sin motor", [
        "Trim para el mejor planeo (85 KIAS); elegir el mejor terreno y establecer una espiral",
        "1,000 ft sobre el campo en la pierna con el viento para una aproximación normal",
        "Con el campo al alcance: 72 KIAS para el aterrizaje más corto, con toque de pérdida completa y flaps completos",
        "Al comprometerse: ignición OFF, master OFF, selector de combustible OFF, mezcla en corte, cinturones y arneses ajustados",
      ]],
      ["fuego-arranque", "Fuego en el motor durante el arranque", [
        "Seguir girando el motor con el starter; mezcla en corte; acelerador abierto",
        "Bomba eléctrica OFF; selector de combustible OFF",
        "Abandonar el avión si el fuego continúa",
      ]],
      ["fuego-vuelo", "Fuego en vuelo", [
        "Origen del fuego — verificar",
        "Fuego de motor: selector OFF, acelerador cerrado, mezcla en corte, bomba eléctrica OFF, calefacción y defroster OFF; prepararse para aterrizaje sin motor",
        "Fuego eléctrico (humo en cabina): master OFF, calefacción y defroster OFF, ventilas abiertas para despejar la cabina; aterrizar en cuanto sea práctico",
      ]],
      ["indicaciones-motor", "Presiones y temperaturas", [
        "Pérdida de presión de aceite: aterrizar lo antes posible y prepararse para aterrizaje sin motor",
        "Temperatura de aceite alta: aterrizar en el aeropuerto más cercano y prepararse para aterrizaje sin motor",
        "Pérdida de presión de combustible: bomba eléctrica ON y comprobar que el selector esté en un tanque lleno",
      ]],
      ["falla-electrica", "Falla eléctrica (anunciador ALT)", [
        "Amperímetro — verificar que el alternador esté inoperante",
        "Si marca cero: switch ALT OFF, reducir la carga eléctrica al mínimo, revisar y reiniciar el breaker ALT y volver a poner ALT ON",
        "Si no regresa: ALT OFF y aterrizar en cuanto sea práctico; solo queda la batería",
      ]],
      ["hielo-carburador", "Hielo en el carburador y aspereza de motor", [
        "Calefacción de carburador — ON; mezcla ajustada para la máxima suavidad",
        "Si continúa tras un minuto: calefacción OFF, bomba eléctrica ON, cambiar de tanque y revisar instrumentos",
        "Magnetos en L, R y BOTH; si funciona bien con uno, seguir con ese a potencia reducida y mezcla RICH hasta el primer aeropuerto",
      ]],
      ["sobrevelocidad-helice", "Sobrevelocidad de la hélice", [
        "Acelerador — retardar; presión de aceite — revisar",
        "Control de la hélice — full DECREASE y luego ajustar; velocidad — reducir",
        "Acelerador — el necesario para mantenerse por debajo de 2,400 RPM",
      ]],
      ["puerta-abierta", "Puerta abierta en vuelo", [
        "Reducir la velocidad a 83 KIAS; ventilas cerradas; ventana de tormenta abierta",
        "Cerrar el seguro superior y el lateral; si están abiertos los dos, primero el lateral y luego el superior",
      ]],
    ]),
    flujos: flujos("dk", [
      ["falla-motor", "Falla de motor en vuelo", ["Mejor planeo: 85 KIAS", "Otro tanque y bomba eléctrica ON", "Mezcla RICH y calefacción de carburador ON", "Magnetos L, R y BOTH", "Si no regresa: aterrizaje sin motor"]],
      ["fuego-motor", "Fuego en el motor", ["Selector de combustible OFF", "Acelerador cerrado", "Mezcla en corte", "Bomba eléctrica, calefacción y defroster OFF", "Aterrizaje sin motor"]],
      ["aterrizaje-sin-motor", "Aterrizaje sin motor", ["Trim a 85 KIAS", "Campo elegido y espiral", "1,000 ft en la pierna con el viento", "72 KIAS con flaps completos", "Ignición, master y combustible OFF; cinturones ajustados"]],
    ]),
    vspeeds: [
      { clave: "Vr", nombre: "Rotación (despegue normal)", valor: "60–65 kt" },
      { clave: "Vx", nombre: "Mejor ángulo de ascenso", valor: "73 kt" },
      { clave: "Vy", nombre: "Mejor tasa de ascenso", valor: "85 kt" },
      { clave: "Va", nombre: "Velocidad de maniobra", valor: "124 kt a 3,000 lb (96 kt a 1,761 lb)" },
      { clave: "Vglide", nombre: "Mejor planeo (3,000 lb, flaps arriba)", valor: "85 kt" },
      { clave: "Vfe", nombre: "Máxima con flaps extendidos", valor: "102 kt" },
      { clave: "Vno", nombre: "Máxima estructural normal", valor: "137 kt" },
      { clave: "Vne", nombre: "Nunca exceder", valor: "173 kt" },
      { clave: "Vs", nombre: "Pérdida, flaps arriba (3,000 lb)", valor: "65 kt" },
      { clave: "Vs0", nombre: "Pérdida, flaps completos (3,000 lb)", valor: "56 kt" },
      { clave: "Vapp", nombre: "Aproximación final (flaps 40°)", valor: "72 kt" },
      { clave: "Vxw", nombre: "Viento cruzado demostrado", valor: "17 kt" },
    ],
    notaVspeeds: "Valores del manual del fabricante, en KIAS. Confirma los de tu avión y los de tu versión del simulador.",
    potencia: {
      titulo: "Potencia de crucero (presión de admisión)",
      nota: "Presión de admisión en pulgadas de mercurio (in Hg), atmósfera estándar. Para mantener la misma potencia, suma cerca de 1 % por cada 6 °C sobre la estándar y réstalo por cada 6 °C bajo ella. F.T. significa acelerador a fondo: a esa altitud no alcanzas ese porcentaje. El máximo continuo del motor son 2,400 RPM y 75 % es el máximo normal de crucero.",
      columnas: ["Altitud", "65 % · 2,300 RPM", "65 % · 2,400 RPM", "75 % · 2,300 RPM", "75 % · 2,400 RPM"],
      filas: [
        ["Nivel del mar", "21.7", "21.0", "23.9", "23.1"],
        ["2,000 ft", "21.2", "20.6", "23.4", "22.6"],
        ["4,000 ft", "20.8", "20.2", "22.8", "22.1"],
        ["6,000 ft", "20.3", "19.7", "22.3", "21.7"],
        ["8,000 ft", "19.9", "19.3", "—", "F.T."],
      ],
    },
  },

  c185: {
    id: "c185",
    nombre: "Cessna 185 Skywagon",
    nota: `Avión de tren convencional (rueda de cola) y seis plazas, con motor Continental IO-520-D de 300 hp con inyección, hélice de velocidad constante, cowl flaps y seguro de la rueda de cola. ${avisoPoh("Cessna A185F Skywagon, manual del propietario de 1975")} Ese manual usa millas por hora: aquí van en nudos con las mph entre paréntesis.`,
    normal: fases("c185n", [
      ["prevuelo-cabina", "Prevuelo: cabina", [
        "Seguro del volante — retirado; ignición — OFF",
        "Master — ON: cantidad de combustible verificada; luego master — OFF",
        "Válvula de corte de combustible — ON (perilla adentro); selector de tanque, si está instalado — BOTH ON",
        "Puerta de equipaje — cerrada y asegurada",
      ]],
      ["prevuelo-exterior", "Prevuelo: exterior", [
        "Cola — retirar el seguro del timón y el amarre de cola; llanta de la rueda de cola inflada; superficies libres y seguras",
        "Alas — alerones libres y correctos; retirar los amarres; venteos de los tanques libres; llantas principales infladas",
        "Combustible — cantidad a la vista y tapas seguras; drenar el sumidero de cada tanque y la válvula de la línea (bajo el fuselaje) para revisar agua, sedimento y grado",
        "Pitot — retirar la cubierta y comprobar que la entrada esté libre; venteo del aviso de pérdida libre",
        "Nariz — tomas estáticas libres (ambos lados); hélice y spinner sin muescas ni fugas de aceite; filtro de aire de inducción sin restricciones",
        "Aceite — nivel verificado (no operar con menos de 9 cuartos); coladera de combustible — jalar el drenaje unos 4 segundos y comprobar que cierre",
        "En clima frío, retirar hasta la menor acumulación de escarcha, hielo o nieve de alas, cola y superficies",
      ]],
      ["antes-arrancar", "Antes de arrancar", [
        "Inspección exterior — completa; asientos, cinturones y arneses — ajustados y asegurados",
        "Válvula de corte de combustible — ON; selector, si está instalado — BOTH ON",
        "Frenos — probados y aplicados; radios, autopiloto y equipo eléctrico — OFF",
        "Flaps — revisar todas las posiciones; cowl flaps — ABIERTOS",
        "Seguro de la rueda de cola — DESBLOQUEADO",
      ]],
      ["arranque", "Arranque del motor", [
        "Master — ON; mezcla — RICH; hélice — RPM altas; acelerador — cerrado",
        "Bomba auxiliar — ON; acelerador — avanzar para 8–10 GPH y volver a ralentí; bomba — OFF",
        "Área de la hélice — despejada; ignición — START",
        "Acelerador — avanzar despacio; soltar la llave al encender; ralentí",
        "Presión de aceite — verificar (30 s con clima normal, 60 s en frío); si no hay, apagar e investigar",
        "Si no enciende: mezcla en corte, acelerador abierto y girar el motor unos 15 s; luego repetir el arranque normal tras dejar enfriar el motor de arranque",
      ]],
      ["antes-despegue", "Antes de despegue", [
        "Freno de estacionamiento — aplicado; controles — libres y correctos",
        "Compensadores de estabilizador y timón — ajustados; cowl flaps — abiertos",
        "Acelerador a 1,700 RPM: magnetos (caída máxima de 150 RPM y diferencia máxima entre ambos de 50 RPM); hélice — ciclo de RPM altas a bajas y regresar a altas; instrumentos del motor; succión (4.6 a 5.4 in Hg); amperímetro",
        "Instrumentos de vuelo y radios — verificados y ajustados; puertas — cerradas y aseguradas",
        "Seguro de la rueda de cola — según se desee; freno de estacionamiento — liberado",
        "Fricción del acelerador — ajustada; flaps — 0° a 20°",
      ]],
      ["despegue", "Despegue", [
        "Normal: flaps 0° a 20°; acelerador a fondo y 2,850 RPM; elevador moderadamente con la cola baja",
        "Ascenso inicial a 87 kt (100 mph); flaps arriba una vez pasados los obstáculos",
        "Máximo rendimiento: flaps 20°; frenos aplicados; acelerador a fondo y 2,850 RPM; mezcla pobre para la elevación del campo; soltar los frenos",
        "Mantener la cola baja; ascender a 56 kt (64 mph) hasta librar los obstáculos; flaps arriba después",
      ]],
      ["ascenso", "Ascenso", [
        "Normal: 96 a 104 kt (110 a 120 mph); 25 in Hg y 2,550 RPM; mezcla pobre según la altitud; cowl flaps según se requiera",
        "Máximo rendimiento: 88 kt (101 mph) a nivel del mar, hasta 82 kt (94 mph) a 10,000 ft; acelerador a fondo y 2,700 RPM; mezcla pobre según la altitud; cowl flaps abiertos",
      ]],
      ["crucero", "Crucero", [
        "Potencia — de 15 a 25 in Hg y de 2,200 a 2,550 RPM (no más de 75 %)",
        "Mezcla — pobre para crucero según la computadora de potencia o el indicador EGT; cowl flaps según se requiera; compensadores ajustados",
      ]],
      ["descenso", "Descenso", [
        "Mezcla — enriquecer según se requiera; potencia — la deseada; cowl flaps — cerrados",
      ]],
      ["antes-aterrizar", "Antes de aterrizar", [
        "Mezcla — RICH; selector de combustible, si está instalado — BOTH ON; cowl flaps — cerrados; hélice — RPM altas",
        "Velocidad — 74 a 83 kt (85 a 95 mph) con flaps arriba",
        "Flaps — de 0° a 40° (por debajo de 96 kt, 110 mph); velocidad — 65 a 74 kt (75 a 85 mph) con flaps abajo",
        "Compensadores — ajustados para el aterrizaje: aterrizar de tres puntos depende de tener el estabilizador compensado en el planeo",
        "Seguro de la rueda de cola — según se desee",
      ]],
      ["aterrizaje", "Aterrizaje (tren convencional)", [
        "Técnica convencional para todos los ajustes de flaps; toque de tres puntos",
        "Aterrizaje frustrado: acelerador a fondo y 2,850 RPM; flaps a 20°; 70 kt (80 mph); retraer flaps despacio; cowl flaps abiertos",
        "Buena práctica de tren convencional (no viene en ese manual): mantener el timón activo hasta detenerse y frenar solo con la cola abajo",
      ]],
      ["despues-aterrizar", "Después de aterrizar", [
        "Flaps — arriba; seguro de la rueda de cola — desbloqueado",
        "Cowl flaps — abiertos; compensadores de estabilizador y timón — para el despegue",
      ]],
      ["apagado", "Apagado", [
        "Freno de estacionamiento — aplicado; radios y equipo eléctrico — OFF",
        "Mezcla — CORTE; ignición — OFF; master — OFF; seguro del volante — instalado",
      ]],
    ]),
    emergencia: fases("c185e", [
      ["falla-despegue", "Falla de motor después del despegue", [
        "Bajar el morro de inmediato para mantener velocidad y planear; aterrizar al frente con cambios pequeños de rumbo (rara vez hay altura para regresar a la pista)",
        "Velocidad — 74 kt (85 mph); mezcla — corte; válvula de combustible — OFF",
        "Ignición — OFF; master — OFF; flaps — según se requiera (40° recomendado)",
      ]],
      ["falla-vuelo", "Falla de motor en vuelo", [
        "Mientras planeas, buscar la causa; si es posible reencender, velocidad de 78 kt (90 mph)",
        "Válvula de combustible — ON; selector, si está instalado — BOTH ON; mezcla — RICH",
        "Acelerador — abierto 1 pulgada; cebador — adentro y asegurado",
        "Bomba auxiliar — ON para obtener 4 a 6 GPH y luego OFF",
        "Ignición — BOTH (o START si la hélice no gira sola)",
      ]],
      ["aterrizaje-forzado", "Aterrizaje forzado sin motor", [
        "Velocidad — 78 kt (90 mph) con flaps arriba; 70 kt (80 mph) con flaps abajo",
        "Mezcla — corte; válvula de combustible — OFF; ignición — OFF; master — OFF",
        "Flaps — según se requiera (40° recomendado); puertas — sin seguro antes de la aproximación",
        "Toque en actitud de tres puntos; frenos — aplicar con fuerza",
      ]],
      ["aterrizaje-precaucion", "Aterrizaje de precaución con motor", [
        "Sobrevolar el campo bajo con flaps 20° y 78 kt (90 mph) para inspeccionar el terreno; flaps arriba al ganar altura y velocidad",
        "Radio y switches eléctricos — OFF; flaps 40°; velocidad — 70 kt (80 mph)",
        "Master — OFF; puertas sin seguro; toque de tres puntos; ignición — OFF; frenos — aplicar con fuerza",
      ]],
      ["fuego-motor", "Fuego en el motor en vuelo", [
        "Válvula de combustible — OFF; mezcla — corte; master — OFF",
        "Calefacción y aire de cabina — OFF (excepto las ventilas superiores)",
        "Velocidad — 104 kt (120 mph); si el fuego no se apaga, aumentar la velocidad de planeo para hallar una mezcla incombustible",
        "Elegir un campo y hacer el aterrizaje forzado; no intentar reencender",
      ]],
      ["fuego-electrico", "Fuego eléctrico en vuelo", [
        "Master — OFF; todos los switches de radio y eléctricos — OFF; ventilas, aire y calefacción — cerrados",
        "Extintor — activar (si hay uno)",
        "Si el fuego se apagó y necesitas electricidad: master ON, revisar breakers (no reiniciar el que falló) y encender los equipos de uno en uno con una pausa hasta ubicar el cortocircuito",
        "Abrir las ventilas cuando el fuego esté completamente apagado",
      ]],
    ]),
    flujos: flujos("c185", [
      ["falla-despegue", "Falla de motor después del despegue", ["Morro abajo y 74 kt (85 mph)", "Mezcla en corte", "Válvula de combustible OFF", "Ignición y master OFF", "Flaps 40° si hace falta"]],
      ["fuego-motor", "Fuego en el motor", ["Válvula de combustible OFF", "Mezcla en corte", "Master OFF", "Calefacción y aire de cabina OFF", "104 kt (120 mph) y aterrizaje forzado"]],
      ["aterrizaje-forzado", "Aterrizaje forzado sin motor", ["78 kt (90 mph) flaps arriba, 70 kt (80 mph) abajo", "Mezcla en corte y combustible OFF", "Ignición y master OFF", "Flaps 40° y puertas sin seguro", "Tres puntos y frenos"]],
    ]),
    vspeeds: [
      { clave: "Vne", nombre: "Nunca exceder", valor: "182 kt (210 mph)" },
      { clave: "Vno", nombre: "Máxima estructural normal", valor: "148 kt (170 mph)" },
      { clave: "Va", nombre: "Velocidad de maniobra (peso máximo)", valor: "117 kt (135 mph)" },
      { clave: "Vfe", nombre: "Máxima con flaps extendidos", valor: "96 kt (110 mph)" },
      { clave: "Vy", nombre: "Mejor tasa de ascenso (nivel del mar)", valor: "88 kt (101 mph)" },
      { clave: "Vobs", nombre: "Ascenso de máximo rendimiento (flaps 20°)", valor: "56 kt (64 mph)" },
      { clave: "Vglide", nombre: "Planeo de emergencia (flaps arriba)", valor: "78 kt (90 mph)" },
      { clave: "Vs", nombre: "Pérdida, flaps arriba (3,350 lb)", valor: "56 kt (65 mph)" },
      { clave: "Vs0", nombre: "Pérdida, flaps 40° (3,350 lb)", valor: "49 kt (56 mph)" },
      { clave: "Vapp", nombre: "Aproximación con flaps abajo", valor: "65–74 kt (75–85 mph)" },
    ],
    notaVspeeds: "Valores del manual del A185F de 1975, convertidos de mph a nudos (las mph van entre paréntesis). Confirma los de tu avión y los de tu versión del simulador.",
    potencia: {
      titulo: "Rendimiento de crucero",
      nota: "Velocidad verdadera (TAS) y consumo con mezcla de rango extendido, en atmósfera estándar y sin viento. El manual los da en mph y en millas por galón: aquí van en nudos, y el consumo en galones por hora se calcula como TAS entre millas por galón. Las combinaciones exactas de RPM y presión de admisión para cada porcentaje las da la computadora de potencia de Cessna que acompaña al avión; el rango recomendado es de 15 a 25 in Hg y 2,200 a 2,550 RPM, sin pasar de 75 %.",
      columnas: ["Altitud", "75 % de potencia", "65 % de potencia", "55 % de potencia"],
      filas: [
        ["Nivel del mar", "136 kt · 15.8 GPH", "128 kt · 13.6 GPH", "119 kt · 11.7 GPH"],
        ["4,000 ft", "141 kt · 15.7 GPH", "132 kt · 13.6 GPH", "123 kt · 11.7 GPH"],
        ["7,500 ft", "146 kt · 15.7 GPH", "136 kt · 13.7 GPH", "127 kt · 11.7 GPH"],
      ],
    },
  },
};
