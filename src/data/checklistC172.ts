import type { Sistema, TablaReferencia } from "./checklistAviones";

export interface ChecklistItem {
  id: string;
  texto: string;
  /** Por qué se hace este paso, no solo qué hacer. Aparece como línea secundaria bajo el ítem. */
  porque?: string;
}

export interface ChecklistFase {
  id: string;
  titulo: string;
  items: ChecklistItem[];
}

/**
 * Checklist del Cessna 172S con panel G1000 (Garmin Nav III) y motor a
 * inyección Lycoming IO-360-L2A: sin carburador, sin calentador de
 * carburador ni cebado manual — en su lugar hay bomba de combustible
 * auxiliar, interruptor de aviónica separado del master, y panel de
 * anunciadores. Procedimientos y valores tomados del POH del 172S.
 */
export const CHECKLIST_NORMAL: ChecklistFase[] = [
  {
    id: "prevuelo",
    titulo: "Inspección prevuelo",
    items: [
      { id: "n1", texto: "Cubierta del tubo pitot — retirada; tubo revisado sin obstrucciones", porque: "Un pitot tapado o sucio da lecturas de velocidad falsas o nulas en pleno vuelo." },
      { id: "n2", texto: "POH y bitácora de peso y balance — a bordo", porque: "Es obligatorio, y confirma que la carga de hoy está dentro de los límites certificados." },
      { id: "n3", texto: "Freno de estacionamiento — puesto; seguro de control — retirado", porque: "Evita que el avión ruede mientras revisas los interruptores dentro de la cabina." },
      { id: "n4", texto: "Master ON un momento — combustible verificado, anunciadores de bajo combustible apagados, luego Master OFF", porque: "Es la única forma de leer el combustible real sin encender toda la aviónica todavía." },
      { id: "n5", texto: "Master y Aviónica Master ON — ventilador de enfriamiento de aviónica audible, luego ambos OFF", porque: "Sin ese ventilador la aviónica se puede sobrecalentar en vuelo." },
      { id: "n6", texto: "Fuente de presión estática alterna — OFF", porque: "Dejarla activada por error da lecturas de altímetro y velocidad incorrectas." },
      { id: "n7", texto: "Panel de anunciadores — probado (TST): todas las luces encienden y las que no aplican se apagan al soltar", porque: "Es la prueba de que el sistema de alertas del G1000 realmente te avisará si algo falla." },
      { id: "n8", texto: "Selector de combustible — AMBOS; válvula de corte — ON (empujada a fondo)", porque: "Confirma que el combustible puede fluir libremente de los dos tanques antes de arrancar." },
      { id: "n9", texto: "Flaps — extendidos para la inspección", porque: "Con los flaps abajo se revisan mejor por daños, no la primera vez ya en el aire." },
      { id: "n10", texto: "Calefacción de pitot — ON, tibia al tacto en 30 segundos, luego OFF", porque: "Confirma que el anti-hielo del pitot realmente calienta, para cuando lo necesites en vuelo con humedad." },
      { id: "n11", texto: "Trim de elevador — ajustado para despegue", porque: "Un trim mal puesto hace más difícil controlar la actitud justo al despegar." },
      { id: "n12", texto: "Puerta de equipaje — asegurada con llave", porque: "Una puerta mal cerrada puede abrirse en vuelo por la presión del aire." },
      { id: "n13", texto: "Superficies de control (timón, elevador, alerones) — libres, sin daño; amarres retirados", porque: "Una bisagra suelta o un daño aquí hace que el avión no responda como esperas en el aire." },
      { id: "n14", texto: "Drenado de combustible — sumideros de ambos tanques y de la línea del fuselaje, sin agua ni sedimento", porque: "El agua es más pesada que la gasolina y se asienta en el fondo; si llega al motor lo apaga sin aviso. El 172S tiene tres puntos de drenado, no solo los tanques." },
      { id: "n15", texto: "Aceite del motor — nivel entre 5 y 8 cuartos, tapa asegurada", porque: "El manual no permite volar con menos de 5 cuartos; menos aceite reduce la lubricación y puede provocar una falla de motor." },
      { id: "n16", texto: "Hélice y spinner — sin daños ni grietas", porque: "Una grieta pequeña puede crecer con la vibración del motor y romper la hélice en pleno vuelo." },
      { id: "n17", texto: "Llantas y frenos — presión y desgaste correctos", porque: "Una llanta baja o gastada puede reventar en el rodaje o en el aterrizaje." },
      { id: "n18", texto: "Aviso de pérdida (stall warning) — probado con succión, debe sonar", porque: "Es tu única alerta antes de una pérdida; si no suena en tierra, tampoco lo hará en el aire." },
      { id: "n19", texto: "Antenas y luces — aseguradas y en buen estado", porque: "Sin luces no puedes volar de noche legalmente, y una antena floja puede dejarte sin radio o transponder." },
      { id: "n20", texto: "Calzos y amarres — retirados antes de abordar", porque: "Olvidarlos puede dañar el tren o impedir que el avión se mueva al rodar." },
    ],
  },
  {
    id: "antes-arrancar",
    titulo: "Antes de arrancar",
    items: [
      { id: "n21", texto: "Asientos, cinturones y arneses — ajustados y asegurados, carrete de inercia bloqueado", porque: "Un asiento que se desliza en el despegue puede alejarte de los controles justo cuando más los necesitas." },
      { id: "n22", texto: "Frenos — probados y puestos", porque: "Evita que el avión se mueva solo al arrancar el motor." },
      { id: "n23", texto: "Breakers — todos revisados adentro", porque: "Un breaker ya disparado antes de arrancar señala un problema que conviene resolver en tierra." },
      { id: "n24", texto: "Equipo eléctrico OFF; Aviónica Master — OFF", porque: "Arrancar con la aviónica maestra energizada puede dañarla por el pico de voltaje del arranque." },
      { id: "n25", texto: "Selector de combustible — AMBOS; válvula de corte — ON", porque: "Alimenta el motor de los dos tanques por igual, evitando desbalance de peso y quedarte sin combustible de un lado." },
    ],
  },
  {
    id: "arranque",
    titulo: "Arranque del motor",
    items: [
      { id: "n26", texto: "Palanca de gases — abierta 1/4 de pulgada; mezcla — CORTE (idle cutoff)", porque: "Es la posición de arranque en frío del motor a inyección; no hay carburador que cebar con mezcla rica desde el inicio." },
      { id: "n27", texto: "Área de la hélice — despejada; Master ON; luz anticolisión — ON", porque: "Avisa a cualquiera cerca de la hélice antes de que empiece a girar." },
      { id: "n28", texto: "Bomba de combustible auxiliar — ON; mezcla — RICA hasta ver flujo estable (3–5 seg), luego CORTE otra vez", porque: "Esto ceba el sistema de inyección sin carburador ni primer manual — es el 'cebado' del 172S." },
      { id: "n29", texto: "Bomba auxiliar — OFF; llave de encendido — START, soltar al arrancar", porque: "Sostener la llave más tiempo del necesario en START daña el motor de arranque." },
      { id: "n30", texto: "Mezcla — avanzar suavemente a RICA en cuanto arranca; presión de aceite — verificada", porque: "Si la presión no sube en los primeros segundos, el motor se está quedando sin lubricación y hay que apagarlo." },
      { id: "n31", texto: "Luces de navegación según se requiera; Aviónica Master — ON; radios — ON; flaps — retraídos", porque: "Recién ahora es seguro energizar la aviónica, ya con el motor arrancado y estable." },
    ],
  },
  {
    id: "rodaje",
    titulo: "Rodaje",
    items: [
      { id: "n32", texto: "Frenos — probados al iniciar el movimiento", porque: "Confirma que responden antes de necesitarlos para detener el avión." },
      { id: "n33", texto: "Instrumentos de vuelo — verificados durante virajes", porque: "Si no se mueven bien, es un problema que debes conocer antes de despegar, no en el aire." },
      { id: "n34", texto: "Velocidad de rodaje — controlada, apropiada para la superficie", porque: "Rodar rápido en superficie irregular puede dañar el tren de aterrizaje." },
    ],
  },
  {
    id: "antes-despegue",
    titulo: "Antes de despegue (run-up)",
    items: [
      { id: "n35", texto: "Freno de estacionamiento — puesto; asientos, cinturones y puertas — asegurados", porque: "Confirma lo básico antes de comprometer potencia y atención al motor." },
      { id: "n36", texto: "Controles de vuelo — libres y correctos; instrumentos de vuelo — verificados y ajustados", porque: "Un control restringido o un instrumento mal ajustado solo se detecta con seguridad en tierra." },
      { id: "n37", texto: "Combustible — cantidad verificada, selector en AMBOS, mezcla RICA", porque: "Asegura la alimentación del motor para el despegue, el momento de mayor demanda de potencia." },
      { id: "n38", texto: "A 1,800 RPM — magnetos probados (caída máx. 150 RPM cada uno, diferencial máx. 50 RPM), vacuómetro y ammeter revisados", porque: "Una caída mayor a la normal señala una bujía o magneto fallando, que puede dejarte con menos potencia o sin motor en vuelo." },
      { id: "n39", texto: "Panel de anunciadores — sin ninguna luz encendida", porque: "Detecta un problema de sistema mientras aún estás en tierra y puedes abortar con seguridad." },
      { id: "n40", texto: "Ralentí — verificado (1,000 RPM o menos), fricción de gases ajustada", porque: "Un ralentí muy bajo puede apagar el motor solo; uno muy alto complica el rodaje." },
      { id: "n41", texto: "Radios, aviónica y trim eléctrico — configurados; piloto automático — OFF", porque: "Despegar con el piloto automático encendido por error puede pelear contra tus controles." },
      { id: "n42", texto: "Trim de elevador — ajustado para despegue; flaps — 0°–10° según distancia disponible", porque: "La posición correcta de flaps acorta la carrera de despegue en pistas cortas." },
      { id: "n43", texto: "Briefing de despegue — repasado (qué hacer si falla el motor)", porque: "Decidirlo antes te da segundos valiosos si realmente pasa." },
    ],
  },
  {
    id: "despegue",
    titulo: "Despegue y ascenso",
    items: [
      { id: "n44", texto: "Gases — máxima potencia aplicada suavemente", porque: "Aplicarla de golpe puede hacer que el avión se vaya de nariz o de cola antes de tener velocidad para controlarlo." },
      { id: "n45", texto: "Mezcla — RICA (empobrecer sobre 3,000 ft para RPM máxima)", porque: "Sobre esa altitud el aire es menos denso; sin empobrecer, el motor pierde potencia por exceso de combustible." },
      { id: "n46", texto: "Rotación — nariz arriba a 55 KIAS", porque: "Rotar antes de esta velocidad puede hacer que el avión despegue sin suficiente sustentación y vuelva a tocar pista." },
      { id: "n47", texto: "Ascenso — 70–80 KIAS; flaps retraídos a la altura/velocidad segura", porque: "Retirar los flaps muy pronto reduce sustentación de golpe; hacerlo a la velocidad segura evita perder altura." },
    ],
  },
  {
    id: "crucero",
    titulo: "Crucero",
    items: [
      { id: "n48", texto: "Potencia — 2,100–2,700 RPM, no más del 75% recomendado", porque: "Reduce el desgaste del motor y el consumo de combustible frente a volar a máxima potencia." },
      { id: "n49", texto: "Trim — ajustado; mezcla — empobrecida (leaned) según altitud", porque: "El aire se enrarece con la altitud; sin ajustar la mezcla el motor recibe demasiado combustible y pierde eficiencia." },
      { id: "n50", texto: "Escaneo visual de tráfico — constante", porque: "La mayoría de las colisiones en vuelo ocurren en espacio aéreo no controlado, en vuelo recto y nivelado." },
    ],
  },
  {
    id: "descenso",
    titulo: "Descenso y aproximación",
    items: [
      { id: "n51", texto: "Mezcla — ajustada para operación suave (rica al llegar a potencia de ralentí)", porque: "El motor necesita más combustible al bajar a menor altitud y mayor densidad de aire." },
      { id: "n52", texto: "Altímetro — reajustado con el reporte meteorológico de destino", porque: "Sin el dato de presión del destino, tu altímetro puede marcar una altura distinta a la real." },
      { id: "n53", texto: "Combustible — selector en AMBOS", porque: "Asegura tener los dos tanques disponibles para la aproximación y un posible motor y al aire." },
      { id: "n54", texto: "Flaps — según se desee (0°–10° bajo 110 KIAS; 10°–30° bajo 85 KIAS)", porque: "Cada tramo de flaps tiene una velocidad máxima segura; extenderlos antes daña la estructura." },
    ],
  },
  {
    id: "antes-aterrizar",
    titulo: "Antes de aterrizar",
    items: [
      { id: "n55", texto: "Asientos y cinturones — asegurados; combustible — AMBOS; mezcla — RICA", porque: "Deja el avión listo para un motor y al aire en cualquier momento de la aproximación." },
      { id: "n56", texto: "Luces de aterrizaje/rodaje — ON; piloto automático — OFF", porque: "Te hace más visible a otro tráfico y evita que el autopiloto pelee tu aproximación manual." },
      { id: "n57", texto: "Velocidad — 65–75 KIAS con flaps arriba, 60–70 KIAS con flaps abajo", porque: "Aterrizar rápido alarga la carrera de aterrizaje y complica el control cerca del suelo." },
      { id: "n58", texto: "Aproximación estabilizada — velocidad, tasa de descenso y alineación correctas", porque: "Una aproximación inestable es la causa más común de aterrizajes duros o salidas de pista." },
    ],
  },
  {
    id: "despues-aterrizar",
    titulo: "Después de aterrizar",
    items: [
      { id: "n59", texto: "Flaps — arriba", porque: "Evita daño si hay que abortar el rodaje o si el viento los golpea, y mejora la efectividad de los frenos." },
    ],
  },
  {
    id: "apagado",
    titulo: "Apagado (asegurar el avión)",
    items: [
      { id: "n60", texto: "Freno de estacionamiento — puesto", porque: "Evita que el avión ruede solo mientras está desatendido." },
      { id: "n61", texto: "Equipo eléctrico y piloto automático — OFF; Aviónica Master — OFF", porque: "Evita descargar la batería entre vuelos y protege la aviónica del apagado del motor." },
      { id: "n62", texto: "Mezcla — CORTE (a fondo)", porque: "Es la forma correcta de apagar un motor de inyección: corta el combustible en vez de solo la ignición." },
      { id: "n63", texto: "Llave de encendido — OFF; Master — OFF; seguro de control — instalado", porque: "Un magneto vivo puede hacer que la hélice arranque sola si alguien la mueve." },
      { id: "n64", texto: "Selector de combustible — IZQUIERDA o DERECHA (no AMBOS)", porque: "Evita el contraflujo entre tanques mientras el avión queda estacionado, que puede desbalancear el combustible para el siguiente vuelo." },
      { id: "n65", texto: "Bitácora — anotaciones de tiempo de vuelo y anomalías", porque: "Es el registro legal del avión y la forma de detectar un problema que se repite vuelo tras vuelo." },
      { id: "n66", texto: "Avión asegurado — calzos y amarres si aplica", porque: "El viento puede mover o dañar un avión sin calzos ni amarres." },
    ],
  },
];

export const CHECKLIST_EMERGENCIA: ChecklistFase[] = [
  {
    id: "falla-despegue",
    titulo: "Falla de motor durante la carrera de despegue",
    items: [
      { id: "e1", texto: "Gases — IDLE; frenos — aplicados; flaps — retraídos", porque: "Detener el avión en la pista restante es más seguro que intentar volar con el motor ya fallando." },
      { id: "e2", texto: "Mezcla — CORTE; llave de encendido — OFF; Master — OFF", porque: "Corta combustible y chispa para reducir el riesgo de incendio mientras el avión aún se desliza." },
    ],
  },
  {
    id: "falla-inmediata-despegue",
    titulo: "Falla de motor inmediatamente después del despegue",
    items: [
      { id: "e3", texto: "Velocidad — 70 KIAS (flaps arriba) o 65 KIAS (flaps abajo)", porque: "Es la velocidad de mejor planeo justo después de despegar; cualquier otra reduce tus opciones de dónde aterrizar." },
      { id: "e4", texto: "Mezcla — CORTE; válvula de corte de combustible — OFF (tirada a fondo); llave de encendido — OFF", porque: "Reduce el riesgo de incendio antes del aterrizaje forzado." },
      { id: "e5", texto: "Flaps — según se requiera; Master — OFF; puerta de cabina — sin asegurar", porque: "Una puerta sin asegurar no se atasca si la estructura se deforma en el impacto." },
      { id: "e6", texto: "Aterrizar recto al frente", porque: "Rara vez hay altura y velocidad suficientes para un viraje de 180° de regreso a la pista sin motor." },
    ],
  },
  {
    id: "falla-vuelo",
    titulo: "Falla de motor en vuelo (intento de reencendido)",
    items: [
      { id: "e7", texto: "Velocidad — 68 KIAS (mejor planeo)", porque: "Es la velocidad a la que el avión recorre la mayor distancia posible sin motor." },
      { id: "e8", texto: "Válvula de corte de combustible — ON; selector — AMBOS", porque: "Confirma que el combustible pueda llegar al motor desde cualquiera de los dos tanques." },
      { id: "e9", texto: "Bomba de combustible auxiliar — ON; mezcla — RICA si no ha reencendido", porque: "Sostiene la presión de combustible si la bomba mecánica del motor fue la que falló." },
      { id: "e10", texto: "Llave de encendido — AMBOS (o START si la hélice está detenida)", porque: "Si la hélice sigue girando por el viento, el motor reenciende solo al restablecer combustible y chispa." },
      { id: "e11", texto: "Bomba auxiliar — OFF una vez estable", porque: "Deja la alimentación de combustible en manos del sistema normal ya que el motor respondió." },
      { id: "e12", texto: "Si no responde — área de aterrizaje forzado seleccionada y declarar MAYDAY con posición, altitud y almas a bordo", porque: "Da a control de tránsito tu posición para dirigir ayuda incluso si pierdes las comunicaciones después." },
    ],
  },
  {
    id: "aterrizaje-forzado",
    titulo: "Aterrizaje forzado sin motor",
    items: [
      { id: "e13", texto: "Respaldos de asiento — verticales; cinturones — asegurados", porque: "Reduce el movimiento del cuerpo en el impacto." },
      { id: "e14", texto: "Velocidad — 70 KIAS (flaps arriba) o 65 KIAS (flaps abajo)", porque: "Cualquier desviación de la velocidad de mejor planeo reduce el área alcanzable para aterrizar." },
      { id: "e15", texto: "Mezcla — CORTE; válvula de corte de combustible — OFF; llave de encendido — OFF", porque: "Reduce el riesgo de incendio en el impacto." },
      { id: "e16", texto: "Flaps — según se requiera (30° recomendado); Master — OFF cuando el aterrizaje esté asegurado", porque: "Más flaps reduce la velocidad de toque, a costa de una senda de descenso más empinada." },
      { id: "e17", texto: "Puertas — sin asegurar antes del toque; toque — ligeramente de cola baja; frenos — aplicados con fuerza", porque: "Una puerta cerrada puede quedar atascada si la estructura se deforma en el impacto." },
    ],
  },
  {
    id: "aterrizaje-precautorio",
    titulo: "Aterrizaje precautorio con motor",
    items: [
      { id: "e18", texto: "Velocidad — 65 KIAS; flaps — 20°; sobrevolar el campo elegido revisando terreno y obstáculos", porque: "Con motor disponible, vale la pena inspeccionar el sitio antes de comprometerte a aterrizar ahí." },
      { id: "e19", texto: "Aviónica Master y equipo eléctrico — OFF; flaps — 30° en final; velocidad — 65 KIAS", porque: "Reduce el riesgo eléctrico si el aterrizaje termina siendo más duro de lo planeado." },
      { id: "e20", texto: "Puertas — sin asegurar antes del toque; toque — ligeramente de cola baja; llave de encendido — OFF; frenos — con fuerza", porque: "Mismo motivo que en el aterrizaje forzado: una puerta cerrada puede atascarse tras el impacto." },
    ],
  },
  {
    id: "fuego-arranque",
    titulo: "Fuego durante el arranque (en tierra)",
    items: [
      { id: "e21", texto: "Continuar girando el motor de arranque para intentar que el motor aspire las llamas", porque: "Puede apagar el fuego al aspirarlo hacia el motor, en vez de dejarlo alimentándose de aire quieto." },
      { id: "e22", texto: "Si no arranca — gases a fondo, mezcla CORTE, seguir girando; válvula de combustible y bomba auxiliar — OFF", porque: "Corta el combustible que alimenta el fuego mientras se sigue intentando aspirarlo." },
      { id: "e23", texto: "Extintor — activado; Master y encendido — OFF; freno de estacionamiento — liberado; evacuar", porque: "Un fuego de combustible en tierra puede propagarse en segundos; no vale la pena quedarse a apagarlo desde dentro." },
    ],
  },
  {
    id: "fuego-vuelo",
    titulo: "Fuego de motor en vuelo",
    items: [
      { id: "e24", texto: "Mezcla — CORTE; válvula de corte de combustible — OFF; bomba auxiliar — OFF; Master — OFF", porque: "Elimina la fuente de combustible y la corriente eléctrica que podrían seguir alimentando el fuego." },
      { id: "e25", texto: "Calefacción y aire de cabina — cerrados (excepto ventilas superiores)", porque: "El sistema de calefacción toma aire del compartimento del motor; dejarlo abierto mete humo a la cabina." },
      { id: "e26", texto: "Velocidad — 100 KIAS si el fuego no se apaga, buscando una mezcla incombustible; ejecutar aterrizaje forzado", porque: "Más velocidad de aire a través del compartimento del motor puede sofocar el fuego." },
    ],
  },
  {
    id: "fuego-electrico",
    titulo: "Fuego eléctrico en vuelo",
    items: [
      { id: "e27", texto: "Master — OFF; ventilas, aire y calefacción de cabina — cerrados", porque: "Corta la corriente que alimenta el fuego y evita que el humo se disperse por la cabina." },
      { id: "e28", texto: "Extintor — activado; Aviónica Master y todos los interruptores excepto el de encendido — OFF", porque: "Aísla el circuito con falla sin apagar el motor." },
      { id: "e29", texto: "Ventilar la cabina solo cuando el fuego esté completamente apagado", porque: "Abrir ventilas antes puede reavivar el fuego con más oxígeno." },
    ],
  },
  {
    id: "falla-electrica",
    titulo: "Falla eléctrica (carga excesiva o baja tensión)",
    items: [
      { id: "e30", texto: "Amperímetro a fondo de escala (sobrecarga) — Alternador OFF; equipo eléctrico no esencial — OFF; terminar el vuelo pronto", porque: "Un alternador descontrolado puede dañar la batería y el resto del sistema eléctrico." },
      { id: "e31", texto: "Anunciador de baja tensión (VOLTS) iluminado — Aviónica Master OFF, breaker del alternador revisado, Master OFF y luego ON, aviónica ON otra vez", porque: "Este reinicio recupera el sistema si la caída de tensión fue momentánea, sin necesidad de aterrizar de inmediato." },
      { id: "e32", texto: "Si el anunciador vuelve a encender — Alternador OFF, equipo no esencial OFF, terminar el vuelo pronto", porque: "Confirma una falla real del alternador, no un aviso pasajero." },
    ],
  },
  {
    id: "hielo",
    titulo: "Encuentro inadvertido con hielo",
    items: [
      { id: "e33", texto: "Calefacción de pitot — ON; cambiar rumbo o altitud buscando una temperatura menos propicia al hielo", porque: "Salir de la zona de formación de hielo es más efectivo que solo tratar sus síntomas." },
      { id: "e34", texto: "Calefacción de cabina y desempañador — al máximo", porque: "Mantiene visibilidad en el parabrisas mientras dura el encuentro." },
      { id: "e35", texto: "Flaps — sin extender; aproximación a 65–75 KIAS según la acumulación", porque: "Con hielo en la cola, extender flaps puede hacer perder efectividad al elevador." },
    ],
  },
  {
    id: "fuente-estatica",
    titulo: "Bloqueo de la fuente estática",
    items: [
      { id: "e36", texto: "Válvula de fuente estática alterna — activada (PULL ON)", porque: "Da al altímetro y al velocímetro una fuente de presión alterna cuando la normal está bloqueada." },
      { id: "e37", texto: "Velocidad indicada — corregida con la tabla de calibración del manual", porque: "La fuente alterna lee ligeramente distinto a la normal; el manual trae la corrección exacta." },
    ],
  },
  {
    id: "perdida-barrena",
    titulo: "Recuperación de pérdida / barrena incipiente",
    items: [
      { id: "e38", texto: "Potencia — reducida a ralentí", porque: "La potencia alimenta la rotación de la barrena; quitarla es el primer paso para detenerla." },
      { id: "e39", texto: "Alerones — neutros", porque: "Usarlos durante una barrena puede empeorar la rotación en vez de detenerla." },
      { id: "e40", texto: "Timón — aplicado en dirección opuesta a la rotación", porque: "Es lo que realmente detiene la rotación, no el alerón." },
      { id: "e41", texto: "Elevador — presión hacia adelante para romper la pérdida", porque: "Reduce el ángulo de ataque para que el ala vuelva a sustentar." },
      { id: "e42", texto: "Una vez recuperado el vuelo recto — nivelar alas y aplicar potencia suavemente", porque: "Aplicar potencia antes de nivelar puede volver a meter al avión en pérdida." },
    ],
  },
];

/** Límites de operación del Cessna 172S (POH), motor IO-360-L2A a inyección con panel G1000. */
export const LIMITES_C172: TablaReferencia = {
  titulo: "Límites de operación",
  nota: "Del POH del Cessna 172S (IO-360-L2A, panel G1000). El límite oficial siempre es el de tu manual y tu simulador.",
  columnas: ["Límite", "Valor"],
  filas: [
    ["Peso máximo de despegue/aterrizaje", "2,550 lb (categoría normal)"],
    ["Carga en compartimento de equipaje", "120 lb combinado"],
    ["Factor de carga, flaps arriba", "+3.8 g / -1.52 g"],
    ["Factor de carga, flaps abajo", "+3.0 g"],
    ["RPM máxima continua", "2,700 RPM"],
    ["Temperatura de aceite máxima", "245 °F (118 °C)"],
    ["Presión de aceite (mín–máx)", "20–115 PSI"],
    ["Aceite mínimo para volar", "5 cuartos (8 para vuelos largos)"],
    ["Combustible utilizable", "53 gal (2 tanques de 28 gal; 3 gal no utilizables)"],
    ["Deslizamiento máx. con un tanque seco", "30 segundos"],
    ["Vuelo en hielo conocido", "Prohibido"],
  ],
};

export const SISTEMAS_C172: Sistema[] = [
  {
    titulo: "Combustible",
    texto: "Dos tanques en las alas alimentan por gravedad un selector de tres posiciones (IZQUIERDA / DERECHA / AMBOS) hacia una bomba de combustible del motor y, al arrancar o si esa bomba falla, una bomba auxiliar eléctrica. El motor es a inyección, no a carburador: no hay calentador de carburador ni cebado manual — la mezcla y la bomba auxiliar hacen ese trabajo.",
  },
  {
    titulo: "Eléctrico",
    texto: "El interruptor Master enciende batería y alternador; el interruptor de Aviónica Master, separado, energiza solo las radios y el G1000 — por eso se apaga durante el arranque, para no dañarlos con el pico de voltaje. Un panel de anunciadores avisa fallas (baja tensión, vacío, combustible bajo) antes de que se vuelvan un problema en vuelo.",
  },
  {
    titulo: "Tren de aterrizaje",
    texto: "Tren fijo tipo triciclo, con las patas principales absorbiendo el impacto por flexión del propio resorte de acero (no hay amortiguador hidráulico). Al ser fijo no hay nada que extender, pero eso no exime de revisar presión y desgaste antes de cada vuelo.",
  },
  {
    titulo: "Flaps",
    texto: "Eléctricos, de 0° a 30° en incrementos, operados por un interruptor en el panel. Más flaps da más sustentación y más resistencia: bajan la velocidad de pérdida pero también empinan la senda de descenso.",
  },
];
