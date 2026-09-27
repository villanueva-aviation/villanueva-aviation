import type { ChecklistFase } from "./checklistC172";
import type { Sistema, TablaReferencia } from "./checklistAviones";

/**
 * Checklist del Cessna 152 con motor a carburador Lycoming O-235-L2C y panel
 * clásico (six-pack). A diferencia del C172S/G1000: no tiene selector de
 * tanques (una sola válvula de combustible ON/OFF que alimenta de ambas alas
 * por gravedad) ni bomba de combustible auxiliar — el cebado es manual con
 * el primer. Procedimientos y valores tomados del POH del C152.
 */
export const CHECKLIST_C152_NORMAL: ChecklistFase[] = [
  {
    id: "prevuelo",
    titulo: "Inspección prevuelo",
    items: [
      { id: "c152n-n1", texto: "POH — a bordo; seguro de control — retirado", porque: "Volar sin el manual es ilegal, y un control trabado solo se detecta en tierra." },
      { id: "c152n-n2", texto: "Encendido — OFF; Aviónica Master — OFF; Master ON un momento para revisar combustible, luego OFF", porque: "Confirma el combustible real sin encender la aviónica todavía." },
      { id: "c152n-n3", texto: "Luces y calefacción de pitot — probadas ON y luego OFF si vas a volar de noche o en instrumentos", porque: "Sin luces no puedes volar de noche legalmente, y el pitot debe calentar en 30 segundos para el anti-hielo." },
      { id: "c152n-n4", texto: "Válvula de combustible — ON", porque: "El C152 no tiene selector de tanques: una sola válvula alimenta de ambas alas por gravedad, y debe quedar abierta antes de rodar." },
      { id: "c152n-n5", texto: "Seguro de timón (rudder gust lock) — retirado; amarre de cola — desconectado", porque: "Un seguro olvidado en el timón restringe el control direccional justo al rodar." },
      { id: "c152n-n6", texto: "Superficies de control (timón, elevador, alerones) — libres, sin daño, amarres retirados", porque: "Una bisagra suelta o un daño aquí hace que el avión no responda como esperas en el aire." },
      { id: "c152n-n7", texto: "Llantas y frenos — presión y desgaste correctos; líneas de freno sin fugas", porque: "Una llanta baja o un freno con fuga puede fallar en el rodaje o el aterrizaje." },
      { id: "c152n-n8", texto: "Drenado de combustible (sumideros de ambas alas) — sin agua ni sedimento, antes del primer vuelo del día y tras cada reabastecimiento", porque: "El agua es más pesada que la gasolina y se asienta en el fondo del tanque; si llega al motor lo apaga sin aviso." },
      { id: "c152n-n9", texto: "Niveles de combustible — verificados visualmente en ambas alas; tapas aseguradas", porque: "El indicador de cabina puede fallar; ver el combustible directo en el tanque es la única confirmación confiable." },
      { id: "c152n-n10", texto: "Aceite del motor — entre 4 y 6 cuartos (5 máx. para vuelos de menos de 3 horas), tapa asegurada", porque: "Menos de 4 cuartos no cumple el mínimo del manual y puede dejar al motor sin lubricación suficiente." },
      { id: "c152n-n11", texto: "Drenado del colador de combustible (fuel strainer) — tirado 4 segundos, antes del primer vuelo del día y tras reabastecer", porque: "Es un tercer punto de drenado, además de los tanques, que también puede acumular agua." },
      { id: "c152n-n12", texto: "Hélice y spinner — sin daños ni grietas", porque: "Una grieta pequeña puede crecer con la vibración del motor y romper la hélice en pleno vuelo." },
      { id: "c152n-n13", texto: "Toma de aire del motor — libre de obstrucciones; tren de nariz — presión correcta", porque: "Un filtro de aire obstruido reduce la potencia disponible del motor." },
      { id: "c152n-n14", texto: "Aviso de pérdida (stall warning vane) — probado", porque: "Es tu única alerta antes de una pérdida; si no funciona en tierra, tampoco lo hará en el aire." },
      { id: "c152n-n15", texto: "Calzos y amarres — retirados antes de abordar", porque: "Olvidarlos puede dañar el tren o impedir que el avión se mueva al rodar." },
    ],
  },
  {
    id: "antes-arrancar",
    titulo: "Antes de arrancar",
    items: [
      { id: "c152n-n16", texto: "Asientos, cinturones y arneses — ajustados y asegurados", porque: "Un asiento que se desliza en el despegue puede alejarte de los controles justo cuando más los necesitas." },
      { id: "c152n-n17", texto: "Válvula de combustible — ON (confirmar de nuevo)", porque: "Es la única fuente de combustible del avión; si quedó cerrada, el motor se apaga poco después de arrancar." },
      { id: "c152n-n18", texto: "Radios y equipo eléctrico — OFF", porque: "Reduce la carga eléctrica en el arranque y evita sorpresas como luces o equipos encendiéndose solos." },
      { id: "c152n-n19", texto: "Frenos — probados y puestos; breakers — revisados adentro", porque: "Confirma que el avión no se mueva al arrancar y que no haya un problema eléctrico ya presente." },
    ],
  },
  {
    id: "arranque",
    titulo: "Arranque del motor",
    items: [
      { id: "c152n-n20", texto: "Mezcla — RICA; calentador de carburador — FRÍO (adentro)", porque: "El carburador necesita mezcla rica para arrancar, y el calentador solo se usa en vuelo, no para arrancar." },
      { id: "c152n-n21", texto: "Cebado (primer) — hasta 3 golpes según temperatura; gases — abiertos 1/2 pulgada", porque: "Muy poco cebado y el motor no prende en frío; demasiado ahoga el motor con humo negro en el escape." },
      { id: "c152n-n22", texto: "Área de la hélice — despejada; 'DESPEJADO' — llamado en voz alta", porque: "Avisa a cualquiera cerca de la hélice antes de que empiece a girar." },
      { id: "c152n-n23", texto: "Llave de encendido — START, soltar al arrancar", porque: "Sostenerla más tiempo del necesario en START daña el motor de arranque." },
      { id: "c152n-n24", texto: "Gases — ajustados a 1,000 RPM o menos; presión de aceite — verificada que suba en los primeros 30 segundos", porque: "Si la presión no sube a tiempo, el motor se está quedando sin lubricación y hay que apagarlo." },
    ],
  },
  {
    id: "rodaje",
    titulo: "Rodaje",
    items: [
      { id: "c152n-n25", texto: "Frenos — probados al iniciar el movimiento", porque: "Confirma que responden antes de necesitarlos para detener el avión." },
      { id: "c152n-n26", texto: "Calentador de carburador — FRÍO durante el rodaje", porque: "Con el calentador puesto, el motor respira aire sin filtrar; solo se usa cuando realmente hay riesgo de hielo." },
      { id: "c152n-n27", texto: "Instrumentos de vuelo — verificados durante virajes", porque: "Si no se mueven bien, es un problema que debes conocer antes de despegar, no en el aire." },
      { id: "c152n-n28", texto: "Velocidad de rodaje — controlada, apropiada para la superficie", porque: "Rodar rápido en superficie irregular puede dañar el tren de aterrizaje." },
    ],
  },
  {
    id: "antes-despegue",
    titulo: "Antes de despegue (run-up)",
    items: [
      { id: "c152n-n29", texto: "Freno de estacionamiento — puesto; puertas — cerradas y aseguradas", porque: "Confirma lo básico antes de comprometer potencia y atención al motor." },
      { id: "c152n-n30", texto: "Controles de vuelo — libres y correctos; instrumentos de vuelo — verificados y ajustados", porque: "Un control restringido solo se detecta con seguridad en tierra." },
      { id: "c152n-n31", texto: "Combustible — válvula ON; mezcla — RICA (bajo 3,000 ft); trim — ajustado para despegue", porque: "Deja el avión listo para máxima potencia en el despegue." },
      { id: "c152n-n32", texto: "A 1,700 RPM — magnetos probados (caída máx. 125 RPM cada uno, diferencial máx. 50 RPM)", porque: "Una caída mayor a la normal señala una bujía o magneto fallando, que puede dejarte con menos potencia o sin motor en vuelo." },
      { id: "c152n-n33", texto: "Calentador de carburador — probado (debe notarse una caída de RPM)", porque: "Confirma que el sistema anti-hielo del carburador funciona antes de necesitarlo en vuelo." },
      { id: "c152n-n34", texto: "Instrumentos del motor, amperímetro y vacuómetro — en rango normal", porque: "Detecta un problema mientras aún estás en tierra y puedes abortar con seguridad." },
      { id: "c152n-n35", texto: "Radios configurados; luces (anticolisión, navegación, estroboscópicas) — según se requiera; fricción de gases — ajustada", porque: "Deja todo listo para no distraerte justo al iniciar el despegue." },
      { id: "c152n-n36", texto: "Flaps — 0°–10° según distancia disponible; briefing de despegue — repasado", porque: "10° de flaps reduce la distancia sobre obstáculo cerca de un 10%; el briefing te da segundos valiosos si falla el motor." },
    ],
  },
  {
    id: "despegue",
    titulo: "Despegue y ascenso",
    items: [
      { id: "c152n-n37", texto: "Calentador de carburador — FRÍO; gases — máxima potencia aplicada suavemente", porque: "Con el calentador puesto se pierde potencia justo cuando más se necesita." },
      { id: "c152n-n38", texto: "Rotación — nariz arriba a 50 KIAS", porque: "Rotar antes de esta velocidad puede hacer que el avión despegue sin suficiente sustentación." },
      { id: "c152n-n39", texto: "Ascenso — 65–75 KIAS; flaps retraídos a la velocidad segura (60 KIAS si usaste flaps de despegue)", porque: "Retirar los flaps muy pronto reduce sustentación de golpe." },
    ],
  },
  {
    id: "crucero",
    titulo: "Crucero",
    items: [
      { id: "c152n-n40", texto: "Potencia — 1,900–2,550 RPM, no más del 75% recomendado", porque: "Reduce el desgaste del motor y el consumo de combustible frente a volar a máxima potencia." },
      { id: "c152n-n41", texto: "Trim — ajustado; mezcla — empobrecida hasta que la RPM baje 25–50 desde el pico", porque: "El aire se enrarece con la altitud; sin ajustar la mezcla el motor recibe demasiado combustible y pierde eficiencia." },
      { id: "c152n-n42", texto: "Escaneo visual de tráfico — constante", porque: "La mayoría de las colisiones en vuelo ocurren en espacio aéreo no controlado, en vuelo recto y nivelado." },
    ],
  },
  {
    id: "descenso",
    titulo: "Descenso y aproximación",
    items: [
      { id: "c152n-n43", texto: "Mezcla — RICA; calentador de carburador — aplicado antes de cerrar gases", porque: "El riesgo de hielo en el carburador aumenta justo al reducir potencia para descender." },
      { id: "c152n-n44", texto: "Altímetro — reajustado con el reporte meteorológico de destino", porque: "Sin el dato de presión del destino, tu altímetro puede marcar una altura distinta a la real." },
      { id: "c152n-n45", texto: "Asientos, cinturones y arneses — ajustados y asegurados para el aterrizaje", porque: "Un cinturón flojo importa más justo antes de un aterrizaje que en crucero." },
    ],
  },
  {
    id: "antes-aterrizar",
    titulo: "Antes de aterrizar",
    items: [
      { id: "c152n-n46", texto: "Velocidad — 60–70 KIAS (flaps arriba) o 55–65 KIAS (flaps abajo)", porque: "Aterrizar rápido alarga la carrera de aterrizaje y complica el control cerca del suelo." },
      { id: "c152n-n47", texto: "Flaps — extendidos progresivamente según etapas, siempre bajo 85 KIAS", porque: "Extenderlos por encima de esa velocidad excede el límite estructural del flap." },
      { id: "c152n-n48", texto: "Aproximación estabilizada — velocidad, tasa de descenso y alineación correctas", porque: "Una aproximación inestable es la causa más común de aterrizajes duros o salidas de pista." },
    ],
  },
  {
    id: "despues-aterrizar",
    titulo: "Después de aterrizar",
    items: [
      { id: "c152n-n49", texto: "Flaps — arriba; calentador de carburador — FRÍO", porque: "Con flaps arriba mejoran los frenos, y el calentador ya no se necesita en tierra." },
    ],
  },
  {
    id: "apagado",
    titulo: "Apagado (asegurar el avión)",
    items: [
      { id: "c152n-n50", texto: "Freno de estacionamiento — puesto", porque: "Evita que el avión ruede solo mientras está desatendido." },
      { id: "c152n-n51", texto: "Radios y equipo eléctrico — OFF", porque: "Evita descargar la batería entre vuelos." },
      { id: "c152n-n52", texto: "Mezcla — CORTE (a fondo)", porque: "Es la forma correcta de apagar un motor a carburador: corta el combustible en vez de solo la ignición." },
      { id: "c152n-n53", texto: "Llave de encendido — OFF; Master — OFF; seguro de control — instalado", porque: "Un magneto vivo puede hacer que la hélice arranque sola si alguien la mueve." },
      { id: "c152n-n54", texto: "Bitácora — anotaciones de tiempo de vuelo y anomalías", porque: "Es el registro legal del avión y la forma de detectar un problema que se repite vuelo tras vuelo." },
      { id: "c152n-n55", texto: "Avión asegurado — calzos y amarres si aplica", porque: "El viento puede mover o dañar un avión sin calzos ni amarres." },
    ],
  },
];

export const CHECKLIST_C152_EMERGENCIA: ChecklistFase[] = [
  {
    id: "falla-despegue",
    titulo: "Falla de motor durante la carrera de despegue",
    items: [
      { id: "c152e-e1", texto: "Gases — IDLE; frenos — aplicados; flaps — retraídos", porque: "Detener el avión en la pista restante es más seguro que intentar volar con el motor ya fallando." },
      { id: "c152e-e2", texto: "Mezcla — CORTE; llave de encendido — OFF; Master — OFF", porque: "Corta combustible y chispa para reducir el riesgo de incendio mientras el avión aún se desliza." },
    ],
  },
  {
    id: "falla-inmediata-despegue",
    titulo: "Falla de motor inmediatamente después del despegue",
    items: [
      { id: "c152e-e3", texto: "Velocidad — 60 KIAS", porque: "Es la velocidad de mejor planeo justo después de despegar; cualquier otra reduce tus opciones de dónde aterrizar." },
      { id: "c152e-e4", texto: "Mezcla — CORTE; válvula de combustible — OFF; llave de encendido — OFF", porque: "Reduce el riesgo de incendio antes del aterrizaje forzado." },
      { id: "c152e-e5", texto: "Flaps — según se requiera; Master — OFF", porque: "Deja el avión configurado para el aterrizaje sin distraer con equipo eléctrico innecesario." },
      { id: "c152e-e6", texto: "Aterrizar recto al frente", porque: "Rara vez hay altura y velocidad suficientes para un viraje de 180° de regreso a la pista sin motor." },
    ],
  },
  {
    id: "falla-vuelo",
    titulo: "Falla de motor en vuelo (intento de reencendido)",
    items: [
      { id: "c152e-e7", texto: "Velocidad — 60 KIAS (mejor planeo)", porque: "Es la velocidad a la que el avión recorre la mayor distancia posible sin motor." },
      { id: "c152e-e8", texto: "Calentador de carburador — ON; primer — adentro y trabado", porque: "El hielo en el carburador es una causa común de falla de motor en el C152; aplicar calor puede resolverla sin más." },
      { id: "c152e-e9", texto: "Válvula de combustible — ON; mezcla — RICA", porque: "Confirma que el combustible pueda llegar al motor y que no esté en corte." },
      { id: "c152e-e10", texto: "Llave de encendido — AMBOS (o START si la hélice está detenida)", porque: "Si la hélice sigue girando por el viento, el motor reenciende solo al restablecer combustible y chispa." },
      { id: "c152e-e11", texto: "Si no responde — área de aterrizaje forzado seleccionada y declarar MAYDAY con posición, altitud y almas a bordo", porque: "Da a control de tránsito tu posición para dirigir ayuda incluso si pierdes las comunicaciones después." },
    ],
  },
  {
    id: "aterrizaje-forzado",
    titulo: "Aterrizaje forzado sin motor",
    items: [
      { id: "c152e-e12", texto: "Velocidad — 65 KIAS (flaps arriba) o 60 KIAS (flaps abajo)", porque: "Cualquier desviación de la velocidad de mejor planeo reduce el área alcanzable para aterrizar." },
      { id: "c152e-e13", texto: "Mezcla — CORTE; válvula de combustible — OFF; llave de encendido — OFF", porque: "Reduce el riesgo de incendio en el impacto." },
      { id: "c152e-e14", texto: "Flaps — según se requiera (30° recomendado); Master — OFF", porque: "Más flaps reduce la velocidad de toque, a costa de una senda de descenso más empinada." },
      { id: "c152e-e15", texto: "Puertas — sin asegurar antes del toque; toque — ligeramente de cola baja; frenos — aplicados con fuerza", porque: "Una puerta cerrada puede quedar atascada si la estructura se deforma en el impacto." },
    ],
  },
  {
    id: "fuego-arranque",
    titulo: "Fuego durante el arranque (en tierra)",
    items: [
      { id: "c152e-e16", texto: "Continuar girando el motor de arranque para intentar que el motor aspire las llamas", porque: "Puede apagar el fuego al aspirarlo hacia el motor, en vez de dejarlo alimentándose de aire quieto." },
      { id: "c152e-e17", texto: "Si no arranca — seguir girando; extintor — obtenido; Master, encendido y válvula de combustible — OFF", porque: "Corta el combustible y la electricidad mientras se sigue intentando aspirar el fuego." },
      { id: "c152e-e18", texto: "Fuego — extinguido con extintor, manta o tierra; evacuar la aeronave", porque: "Un fuego de combustible en tierra puede propagarse en segundos; no vale la pena quedarse a apagarlo desde dentro." },
    ],
  },
  {
    id: "fuego-vuelo",
    titulo: "Fuego de motor en vuelo",
    items: [
      { id: "c152e-e19", texto: "Mezcla — CORTE; válvula de combustible — OFF; Master — OFF", porque: "Elimina la fuente de combustible y la corriente eléctrica que podrían seguir alimentando el fuego." },
      { id: "c152e-e20", texto: "Calefacción y aire de cabina — cerrados (excepto ventilas de la raíz del ala)", porque: "El sistema de calefacción toma aire del compartimento del motor; dejarlo abierto mete humo a la cabina." },
      { id: "c152e-e21", texto: "Velocidad — 85 KIAS si el fuego no se apaga, buscando una mezcla incombustible; ejecutar aterrizaje forzado", porque: "Más velocidad de aire a través del compartimento del motor puede sofocar el fuego." },
    ],
  },
  {
    id: "fuego-electrico",
    titulo: "Fuego eléctrico en vuelo",
    items: [
      { id: "c152e-e22", texto: "Master — OFF; todos los interruptores excepto el de encendido — OFF; ventilas y calefacción — cerradas", porque: "Corta la corriente que alimenta el fuego sin apagar el motor." },
      { id: "c152e-e23", texto: "Extintor — activado si está disponible; ventilar la cabina solo cuando el fuego esté completamente apagado", porque: "Abrir ventilas antes puede reavivar el fuego con más oxígeno." },
    ],
  },
  {
    id: "falla-electrica",
    titulo: "Falla eléctrica (carga excesiva o baja tensión)",
    items: [
      { id: "c152e-e24", texto: "Amperímetro a fondo de escala (sobrecarga) — Alternador OFF; equipo no esencial OFF; terminar el vuelo pronto", porque: "Un alternador descontrolado puede dañar la batería y el resto del sistema eléctrico." },
      { id: "c152e-e25", texto: "Luz de baja tensión encendida — radios OFF, Master OFF y luego ON, radios ON otra vez", porque: "Este reinicio recupera el sistema si la caída de tensión fue momentánea, sin necesidad de aterrizar de inmediato." },
      { id: "c152e-e26", texto: "Si la luz vuelve a encender — alternador OFF, equipo no esencial OFF, terminar el vuelo pronto", porque: "Confirma una falla real del alternador, no un aviso pasajero." },
    ],
  },
  {
    id: "hielo",
    titulo: "Encuentro inadvertido con hielo",
    items: [
      { id: "c152e-e27", texto: "Calefacción de pitot — ON; cambiar rumbo o altitud buscando una temperatura menos propicia al hielo", porque: "Salir de la zona de formación de hielo es más efectivo que solo tratar sus síntomas." },
      { id: "c152e-e28", texto: "Gases — más abiertos para minimizar hielo en la hélice; calentador de carburador — aplicado según se requiera", porque: "Una caída inesperada de RPM en hielo puede deberse a hielo en el carburador o en el filtro de aire." },
      { id: "c152e-e29", texto: "Flaps — sin extender; aproximación a 65–75 KIAS según la acumulación", porque: "Con hielo en la cola, extender flaps puede hacer perder efectividad al elevador." },
    ],
  },
  {
    id: "perdida-barrena",
    titulo: "Recuperación de pérdida / barrena incipiente",
    items: [
      { id: "c152e-e30", texto: "Alerones — neutros", porque: "Usarlos durante una barrena puede empeorar la rotación en vez de detenerla." },
      { id: "c152e-e31", texto: "Gases — reducidos a ralentí", porque: "La potencia alimenta la rotación de la barrena; quitarla es el primer paso para detenerla." },
      { id: "c152e-e32", texto: "Timón — aplicado a fondo y sostenido, opuesto a la dirección de rotación", porque: "Es lo que realmente detiene la rotación, no el alerón." },
      { id: "c152e-e33", texto: "Justo después de que el timón llegue al tope — control de mando adelante con firmeza, hasta romper la pérdida", porque: "Reduce el ángulo de ataque para que el ala vuelva a sustentar." },
      { id: "c152e-e34", texto: "Sostener estos controles hasta que la rotación se detenga; al detenerse, neutralizar el timón y recuperar suavemente del picado", porque: "Soltar los controles antes de tiempo puede alargar la recuperación." },
    ],
  },
];

/** Límites de operación del Cessna 152 (POH), categoría utilitaria. */
export const LIMITES_C152: TablaReferencia = {
  titulo: "Límites de operación",
  nota: "Del POH del Cessna 152 (Lycoming O-235-L2C, 110 hp). El límite oficial siempre es el de tu manual y tu simulador.",
  columnas: ["Límite", "Valor"],
  filas: [
    ["Peso máximo de rampa", "1,675 lb"],
    ["Peso máximo de despegue/aterrizaje", "1,670 lb"],
    ["Carga máxima de equipaje", "120 lb"],
    ["Factor de carga, flaps arriba", "+4.4 g / -1.76 g"],
    ["Factor de carga, flaps abajo", "+3.5 g"],
    ["RPM máxima continua", "2,550 RPM"],
    ["Temperatura de aceite máxima", "245 °F (118 °C)"],
    ["Presión de aceite (mín–máx)", "25–100 PSI"],
    ["Aceite del motor", "4–6 cuartos (5 máx. en vuelos de menos de 3 h)"],
    ["Combustible total", "26 gal (13 gal por ala)"],
    ["Viento cruzado máximo demostrado", "12 nudos"],
  ],
};

export const SISTEMAS_C152: Sistema[] = [
  {
    titulo: "Combustible",
    texto: "Dos tanques en las alas alimentan el motor por gravedad hacia una sola válvula ON/OFF — no hay selector de tanques como en el 172, porque ambos drenan juntos por la misma línea. Tampoco hay bomba de combustible auxiliar: si la gravedad y el carburador fallan, no hay respaldo eléctrico.",
  },
  {
    titulo: "Eléctrico",
    texto: "Un alternador impulsado por el motor carga la batería y alimenta radios, luces e instrumentos, con un interruptor de Aviónica Master independiente para proteger las radios durante el arranque. Sin un panel de anunciadores como el G1000, la única alerta de falla es la luz de baja tensión y el amperímetro — hay que revisarlos activamente, no esperar una alarma.",
  },
  {
    titulo: "Carburador y anti-hielo",
    texto: "El motor mezcla aire y combustible en un carburador, sensible a formar hielo incluso con temperaturas templadas y humedad. El calentador de carburador desvía aire caliente y sin filtrar del escape hacia la admisión — por eso se prueba en el run-up y se usa solo cuando hace falta, nunca en tierra ni al despegar.",
  },
  {
    titulo: "Tren de aterrizaje",
    texto: "Tren fijo tipo triciclo, con las patas principales absorbiendo el impacto por flexión del propio resorte de acero. Al ser fijo no hay nada que extender, pero eso no exime de revisar presión y desgaste antes de cada vuelo.",
  },
];
