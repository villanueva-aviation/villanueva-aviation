import type { ChecklistFase } from "./checklistC172";
import type { Flujo, VSpeed } from "./checklistPremium";

export interface AvionChecklist {
  id: string;
  nombre: string;
  /** Qué es el avión y cómo leer este checklist (aparece en el encabezado). */
  nota: string;
  normal: ChecklistFase[];
  emergencia: ChecklistFase[];
  flujos: Flujo[];
  vspeeds: VSpeed[];
}

type Fase = [id: string, titulo: string, items: string[]];

const fases = (pre: string, lista: Fase[]): ChecklistFase[] =>
  lista.map(([id, titulo, items]) => ({ id, titulo, items: items.map((texto, i) => ({ id: `${pre}-${id}-${i + 1}`, texto })) }));

const flujos = (pre: string, lista: [string, string, string[]][]): Flujo[] =>
  lista.map(([id, titulo, pasos]) => ({ id: `${pre}-${id}`, titulo, pasos }));

const AVISO = "Referencia para simulación y formación, basada en procedimientos típicos. El checklist oficial es el del manual (AFM/POH) del avión y el del propio simulador; sus valores mandan sobre estos.";

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

  sr22: {
    id: "sr22",
    nombre: "Cirrus SR22",
    nota: `Monomotor de alto rendimiento (motor de seis cilindros con mezcla y hélice de velocidad constante), panel Garmin y paracaídas de célula CAPS. ${AVISO}`,
    normal: fases("sr22n", [
      ["prevuelo", "Inspección prevuelo", [
        "Documentos de la aeronave — a bordo y vigentes",
        "CAPS — pasador de seguridad retirado y manija libre antes del vuelo",
        "Combustible — cantidad verificada visualmente, tapas aseguradas",
        "Drenado de combustible (sumps) — sin agua ni sedimento",
        "Motor — aceite en rango, sin fugas, capó asegurado",
        "Hélice y spinner — sin daños ni grietas",
        "Superficies de control y flaps — libres y sin daño",
        "Pitot y estática — libres",
        "Tren y llantas — presión y desgaste correctos",
        "Cabina — equipaje asegurado y pasajeros informados",
      ]],
      ["antes-arrancar", "Antes de arrancar", [
        "Cinturones y arneses — ajustados; puertas cerradas y aseguradas",
        "Freno de estacionamiento — aplicado",
        "Mezcla — RICA; hélice — ALTA RPM (todo adelante)",
        "Selector de combustible — tanque más lleno según manual",
        "Master ON; aviónica OFF",
      ]],
      ["arranque", "Arranque del motor", [
        "Bomba de combustible — BOOST según el procedimiento (frío o caliente)",
        "Luz anticolisión — ON",
        "'DESPEJADO' — llamado en voz alta",
        "Arrancador — accionado, soltar al encender",
        "Presión de aceite — sube en los primeros segundos",
        "Alternador y aviónica — ON",
      ]],
      ["rodaje", "Rodaje", [
        "Frenos — probados al iniciar el movimiento",
        "Instrumentos de vuelo — verificados en virajes",
        "Velocidad de rodaje — controlada; motor cuidando temperatura",
      ]],
      ["antes-despegue", "Antes de despegue (run-up)", [
        "Avión contra el viento, frenos aplicados",
        "Magnetos — probados, caída de RPM dentro de rango",
        "Ciclo de hélice — presión de aceite y RPM estables",
        "Flaps — 50 % para despegue; trim en posición de despegue",
        "Controles — libres y correctos",
        "Briefing de despegue — incluido cuándo considerar el CAPS",
      ]],
      ["despegue", "Despegue y ascenso", [
        "Bomba de combustible — BOOST para el despegue",
        "Potencia — máxima aplicada suavemente; mezcla RICA",
        "Rotación a Vr; ascenso a Vy (Vx si hay obstáculos)",
        "Flaps — retraídos a la altura y velocidad seguras",
      ]],
      ["crucero", "Crucero", [
        "Potencia y RPM — ajustadas al crucero recomendado",
        "Mezcla — ajustada según el procedimiento del POH para la altitud",
        "Combustible — consumo y cantidad vs. plan",
        "Temperaturas de cilindros y aceite — dentro de rango",
      ]],
      ["descenso", "Descenso y aproximación", [
        "Altímetro — ajustado con el reporte de destino",
        "Mezcla — enriquecida al descender; hélice — ALTA RPM antes de la aproximación",
        "Briefing de aproximación — circuito, pista y salida",
      ]],
      ["antes-aterrizar", "Antes de aterrizar", [
        "Bomba de combustible — BOOST",
        "Velocidad — reducida; flaps por etapas (50 %, luego 100 %)",
        "Aproximación estabilizada — velocidad, tasa de descenso y alineación",
      ]],
      ["apagado", "Después de aterrizar y apagado", [
        "Flaps — retraídos; bomba — OFF",
        "Frenos de estacionamiento — aplicados",
        "Aviónica y luces — OFF",
        "Mezcla — CORTE",
        "Master — OFF",
        "CAPS — pasador de seguridad colocado si se deja el avión",
        "Bitácora — tiempos y anomalías anotados",
      ]],
    ]),
    emergencia: fases("sr22e", [
      ["falla-motor", "Falla de motor en vuelo", [
        "Velocidad de mejor planeo — establecida",
        "Bomba de combustible — BOOST; mezcla — RICA",
        "Selector de combustible y magnetos — verificados",
        "Área de aterrizaje — seleccionada",
        "Si no hay reencendido y la altura no alcanza para aterrizar: considera el CAPS con altura suficiente",
        "MAYDAY y squawk 7700",
      ]],
      ["caps", "Despliegue del paracaídas (CAPS)", [
        "Decidir con altura suficiente sobre el terreno (según POH)",
        "Reducir velocidad por debajo del límite de despliegue si es posible",
        "Motor — cortar, combustible OFF",
        "Manija CAPS — jalar con firmeza hasta el fin del recorrido",
        "Posición de impacto; puertas sin asegurar según manual",
      ]],
      ["fuego-motor", "Fuego en el motor", [
        "Mezcla — CORTE; combustible — OFF",
        "Bomba — OFF; calefacción — cerrada",
        "Planeo y área; considerar CAPS",
        "MAYDAY y 7700",
      ]],
      ["falla-electrica", "Falla eléctrica", [
        "Alternador y breakers — verificados",
        "Cargas no esenciales — OFF; instrumentos de respaldo",
        "Aeropuerto más cercano y aviso al ATC",
      ]],
      ["humo-cabina", "Humo o fuego en cabina", [
        "Master OFF si el fuego es eléctrico",
        "Ventilación — abrir",
        "Aterrizar lo antes posible; MAYDAY y 7700",
      ]],
    ]),
    flujos: flujos("sr22", [
      ["falla-motor", "Falla de motor en vuelo", ["Velocidad de planeo", "Bomba BOOST y mezcla RICA", "Selector y magnetos", "Área de aterrizaje", "Decidir CAPS con altura", "MAYDAY y 7700"]],
      ["caps", "Despliegue del CAPS", ["Decisión con altura", "Motor y combustible OFF", "Jalar manija con firmeza", "Posición de impacto"]],
      ["fuego-motor", "Fuego en el motor", ["Mezcla CORTE", "Combustible OFF", "Planeo y área", "MAYDAY"]],
    ]),
    vspeeds: [
      { clave: "Vr", nombre: "Rotación", valor: "78 kt" },
      { clave: "Vy", nombre: "Mejor tasa de ascenso", valor: "100 kt" },
      { clave: "Va", nombre: "Velocidad de maniobra (a peso máximo)", valor: "133 kt" },
      { clave: "Vglide", nombre: "Mejor planeo", valor: "88 kt" },
      { clave: "Vfe", nombre: "Máxima con flaps extendidos", valor: "119 kt (50 %) / 104 kt (100 %)" },
      { clave: "Vno", nombre: "Máxima estructural normal", valor: "165 kt" },
      { clave: "Vne", nombre: "Nunca exceder", valor: "200 kt" },
      { clave: "Vcaps", nombre: "Máxima de despliegue del CAPS", valor: "133 kt" },
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

  pa28: {
    id: "pa28",
    nombre: "Piper PA-28 Archer",
    nota: `Cuatro cilindros a carburador con hélice de paso fijo, selector de combustible por tanque (sin posición AMBOS) y estabilizador con trim. ${AVISO}`,
    normal: fases("pa28n", [
      ["prevuelo", "Inspección prevuelo", [
        "Documentos de la aeronave — a bordo y vigentes",
        "Interruptor maestro — ON un momento para revisar combustible y luces, luego OFF",
        "Combustible — cantidad verificada en ambos tanques, tapas aseguradas",
        "Drenado de combustible (sumps) — sin agua ni sedimento",
        "Aceite — nivel en rango; capó asegurado",
        "Hélice y spinner — sin daños ni grietas",
        "Superficies de control (estabilizador, timón, alerones) y flaps — libres y sin daño",
        "Pitot y estática — libres",
        "Tren y llantas — presión y desgaste correctos",
      ]],
      ["antes-arrancar", "Antes de arrancar", [
        "Asientos, cinturones — ajustados; puertas cerradas",
        "Freno de estacionamiento — aplicado",
        "Mezcla — RICA; calefacción de carburador — OFF",
        "Selector de combustible — tanque más lleno (no hay posición AMBOS)",
      ]],
      ["arranque", "Arranque del motor", [
        "Bomba eléctrica de combustible — ON",
        "Cebado (prime) según temperatura; acelerador ligeramente abierto",
        "'DESPEJADO' en voz alta",
        "Llave — START; soltar al encender",
        "Presión de aceite — sube en los primeros segundos; RPM estables",
        "Bomba eléctrica — OFF; aviónica — ON",
      ]],
      ["rodaje", "Rodaje", [
        "Frenos — probados al iniciar el movimiento",
        "Instrumentos de vuelo — verificados en virajes",
        "Velocidad de rodaje — controlada",
      ]],
      ["antes-despegue", "Antes de despegue (run-up)", [
        "Avión contra el viento, frenos aplicados",
        "Cambiar de tanque — verificar que el motor responde bien",
        "Magnetos — probados; caída de RPM dentro de rango",
        "Calefacción de carburador — probada",
        "Instrumentos del motor — en rango; amperímetro y succión correctos",
        "Flaps — configurados para despegue; trim — en posición",
        "Bomba eléctrica — ON para el despegue",
        "Briefing de despegue — qué hacer si falla el motor",
      ]],
      ["despegue", "Despegue y ascenso", [
        "Potencia — máxima aplicada suavemente",
        "Rotación a Vr; ascenso a Vy (Vx si hay obstáculos)",
        "Flaps — retraídos a la altura y velocidad seguras",
        "Bomba eléctrica — OFF después del ascenso inicial",
      ]],
      ["crucero", "Crucero", [
        "Potencia — ajustada al crucero recomendado",
        "Mezcla — ajustada según altitud",
        "Combustible — cambiar de tanque a intervalos; anotar hora del cambio",
        "Escaneo de tráfico — constante",
      ]],
      ["descenso", "Descenso y aproximación", [
        "Altímetro — ajustado con el reporte de destino",
        "Mezcla — enriquecida; calefacción de carburador — según riesgo de hielo",
        "Selector de combustible — tanque con más combustible",
      ]],
      ["antes-aterrizar", "Antes de aterrizar", [
        "Bomba eléctrica — ON",
        "Velocidad — reducida a la de aproximación",
        "Flaps — extendidos por etapas",
        "Aproximación estabilizada — velocidad, tasa de descenso y alineación",
      ]],
      ["apagado", "Después de aterrizar y apagado", [
        "Flaps — retraídos; calefacción de carburador — OFF",
        "Frenos de estacionamiento — aplicados",
        "Aviónica y luces — OFF",
        "Mezcla — CORTE",
        "Magnetos y master — OFF",
        "Bitácora — tiempos y anomalías anotados",
      ]],
    ]),
    emergencia: fases("pa28e", [
      ["falla-motor", "Falla de motor en vuelo", [
        "Velocidad de mejor planeo — establecida",
        "Cambiar de tanque de combustible; bomba eléctrica — ON",
        "Mezcla — RICA; calefacción de carburador — ON",
        "Magnetos — BOTH, luego cada uno",
        "Área de aterrizaje — seleccionada",
        "MAYDAY y squawk 7700; combustible y magnetos OFF antes del contacto",
      ]],
      ["fuego-motor", "Fuego en el motor", [
        "Selector de combustible — OFF; mezcla — CORTE",
        "Bomba eléctrica — OFF; calefacción — cerrada",
        "Planeo y área de aterrizaje forzado; MAYDAY y 7700",
      ]],
      ["falla-electrica", "Falla eléctrica", [
        "Alternador y breakers — verificados",
        "Cargas no esenciales — OFF",
        "Prioridad: radio y transponder; aeropuerto más cercano",
      ]],
      ["hielo-carburador", "Hielo en el carburador", [
        "Calefacción de carburador — ON completa",
        "Esperar que las RPM se recuperen tras la caída inicial",
        "Mantener la calefacción hasta que se resuelva",
      ]],
    ]),
    flujos: flujos("pa28", [
      ["falla-motor", "Falla de motor en vuelo", ["Velocidad de planeo", "Otro tanque y bomba ON", "Mezcla RICA y carb heat ON", "Magnetos BOTH", "MAYDAY y 7700"]],
      ["fuego-motor", "Fuego en el motor", ["Combustible OFF", "Mezcla CORTE", "Bomba OFF", "Planeo y área", "MAYDAY"]],
      ["aterrizaje-forzado", "Aterrizaje forzado sin motor", ["Velocidad de planeo", "Área seleccionada", "Combustible y magnetos OFF", "Puertas sin asegurar", "Cinturones ajustados"]],
    ]),
    vspeeds: [
      { clave: "Vr", nombre: "Rotación", valor: "60 kt" },
      { clave: "Vx", nombre: "Mejor ángulo de ascenso", valor: "64 kt" },
      { clave: "Vy", nombre: "Mejor tasa de ascenso", valor: "76 kt" },
      { clave: "Va", nombre: "Velocidad de maniobra (a peso máximo)", valor: "113 kt" },
      { clave: "Vglide", nombre: "Mejor planeo", valor: "73 kt" },
      { clave: "Vfe", nombre: "Máxima con flaps extendidos", valor: "102 kt" },
      { clave: "Vno", nombre: "Máxima estructural normal", valor: "125 kt" },
      { clave: "Vne", nombre: "Nunca exceder", valor: "154 kt" },
      { clave: "Vs", nombre: "Pérdida, configuración limpia", valor: "55 kt" },
      { clave: "Vs0", nombre: "Pérdida, configuración de aterrizaje", valor: "50 kt" },
    ],
  },
};
