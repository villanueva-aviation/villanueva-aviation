import type { ChecklistFase } from "./checklistC172";
import type { Flujo, VSpeed } from "./checklistPremium";

/** Tabla de consulta que solo tienen los aviones cuyos datos salen de un manual (potencia de crucero, rendimiento, límites…). */
export interface TablaReferencia {
  titulo: string;
  nota: string;
  columnas: string[];
  filas: string[][];
}

/** Descripción corta de un sistema del avión (combustible, eléctrico…), no un procedimiento. */
export interface Sistema {
  titulo: string;
  texto: string;
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
  limites?: TablaReferencia;
  sistemas?: Sistema[];
}

/** Un ítem es solo el texto, o [texto, porque] cuando vale la pena explicar la razón del paso. */
type Item = string | [texto: string, porque: string];
type Fase = [id: string, titulo: string, items: Item[]];

const fases = (pre: string, lista: Fase[]): ChecklistFase[] =>
  lista.map(([id, titulo, items]) => ({
    id,
    titulo,
    items: items.map((item, i) => {
      const [texto, porque] = typeof item === "string" ? [item, undefined] : item;
      return { id: `${pre}-${id}-${i + 1}`, texto, porque };
    }),
  }));

const flujos = (pre: string, lista: [string, string, string[]][]): Flujo[] =>
  lista.map(([id, titulo, pasos]) => ({ id: `${pre}-${id}`, titulo, pasos }));

const AVISO = "Referencia para simulación y formación, basada en procedimientos típicos. El checklist oficial es el del manual (AFM/POH) del avión y el del propio simulador; sus valores mandan sobre estos.";

/** Nota de origen para los avisos que sí salen de un manual (POH/AFM) del fabricante. */
const avisoPoh = (fuente: string) =>
  `Los procedimientos y las velocidades están tomados del manual del fabricante (${fuente}). El checklist oficial es el de tu manual (AFM/POH) y el del propio simulador: si difieren, mandan los suyos.`;

// Las V-speeds del DA40 NG, el C208B, el Dakota y el C185 vienen de sus manuales (POH/AFM). Confirmar siempre contra el manual del avión.
export const AVIONES_CHECKLIST: Record<string, AvionChecklist> = {
  da40: {
    id: "da40",
    nombre: "Diamond DA40 NG",
    nota: `Motor diésel con FADEC (una sola palanca de potencia, sin mezcla ni calefacción de carburador) y panel Garmin G1000. ${AVISO}`,
    normal: fases("da40n", [
      ["prevuelo", "Inspección prevuelo", [
        ["Documentos de la aeronave — a bordo y vigentes", "Volar sin ellos es ilegal, y sin bitácora no puedes confirmar que el avión está en condición de aeronavegabilidad."],
        ["Cubierta del pitot — retirada; sonda limpia y con los orificios libres", "Un pitot tapado o sucio da lecturas de velocidad falsas o nulas en pleno vuelo."],
        ["Superficies de control (cola en T incluida) — libres, sin daño; seguro de mando retirado", "Un seguro olvidado o un daño en la cola restringe el control justo cuando más lo necesitas en el aire."],
        ["Alas y tanques — combustible verificado por medio alterno (no por la tapa), venteos y drenados de agua sin agua ni sedimento", "El agua se asienta en el fondo del tanque; si llega al motor, lo apaga sin aviso."],
        ["Aviso de pérdida — probado por succión", "Es tu única alerta antes de una pérdida; si no suena en tierra, tampoco lo hará en el aire."],
        ["Motor — nivel de aceite y de refrigerante por la mirilla, sin fugas, capó cerrado", "Poco aceite o refrigerante reduce la lubricación y el enfriamiento del motor, y puede provocar una falla por sobrecalentamiento."],
        ["Hélice y spinner — sin muescas ni daños; nunca girarla a mano", "Una muesca pequeña puede crecer con la vibración del motor y romper la hélice en pleno vuelo; el FADEC puede energizarla si el master está puesto."],
        ["Tomas estáticas (ambos lados) — libres de obstrucciones", "Una toma estática bloqueada da lecturas erróneas de altímetro y velocidad, no solo el pitot."],
        ["Tren y llantas — presión y desgaste correctos; calzas retiradas", "Una llanta baja o gastada puede reventar en el rodaje o el aterrizaje."],
        ["Colador de combustible (gascolator) — drenado hasta que salga limpio", "Es el punto de drenado bajo el fuselaje; complementa los drenados de cada tanque."],
        ["Cabina — pasajeros informados, respaldos ajustables fijos en posición vertical, equipaje asegurado, canopy y puerta trasera revisados", "Un respaldo suelto o una puerta mal cerrada pueden moverse en vuelo o abrirse por la presión del aire."],
      ]],
      ["antes-arrancar", "Antes de arrancar", [
        ["Pedales de timón — ajustados y trabados; pasajeros instruidos; arneses de seguridad abrochados", "Un pedal sin trabar puede moverse solo y complicar el control direccional en el rodaje."],
        ["Puerta trasera cerrada con seguro; canopy en posición 1 o 2 ('cooling gap')", "El motor y la aviónica necesitan ese hueco de ventilación mientras están en tierra; cerrarlo del todo antes de arrancar los sobrecalienta."],
        ["Freno de estacionamiento — puesto; controles de vuelo — movimiento libre; trim — T/O", "Un trim mal puesto complica el control justo al despegar, cuando menos tiempo tienes para corregir."],
        ["Palanca de potencia — IDLE; fricción ajustada; aire alterno y estática alterna — CERRADOS", "Dejar alguna fuente alterna abierta por error da lecturas de instrumentos incorrectas sin que lo notes."],
        ["Interruptor VOTER — AUTO; bombas de combustible — OFF", "AUTO es la única posición que da la redundancia real de los dos canales del FADEC; ECU A o B fijo es solo para pruebas o emergencias."],
        ["Aviónica — OFF; Eléctrico — ON; esperar que el G1000 complete el encendido", "Arrancar con la aviónica energizada puede dañarla con el pico de voltaje del motor de arranque."],
        ["Anunciador de nivel de refrigerante — apagado; temperatura de combustible — revisada", "Un nivel bajo de refrigerante detectado aquí es mucho más barato de resolver que en vuelo."],
      ]],
      ["arranque", "Arranque del motor", [
        ["Luces estroboscópicas — ON; Motor (ENGINE MASTER) — ON", "Hace visible al avión antes de que la hélice empiece a girar."],
        ["Precalentamiento (GLOW) — esperar a que se apague antes de arrancar", "Solo se indica con el motor frío; arrancar antes de tiempo dificulta el encendido del diésel."],
        ["Área de la hélice despejada; llave de arranque — START, soltar al encender (máximo 10 segundos de motor de arranque)", "Más de 10 segundos seguidos puede sobrecalentar el motor de arranque."],
        ["Presión de aceite — debe salir del rango rojo en los primeros 3 segundos, si no, motor OFF e investigar", "Sin presión de aceite a tiempo, el motor se está quedando sin lubricación."],
        ["Anunciador STARTER/START — apagado tras soltar la llave; breakers — todos adentro", "Si sigue encendido, el motor de arranque no se desenganchó y hay que apagar el motor de inmediato."],
        ["RPM de ralentí — verificada (710 ± 30 RPM; puede ser mayor sobre 7,000 ft)", "Un ralentí fuera de rango señala un problema del sistema antes de rodar siquiera."],
      ]],
      ["rodaje", "Antes de rodar y rodaje", [
        ["Aviónica — ON; potencia limitada a 50 % si el motor sigue frío", "Exigirle potencia al motor diésel antes de que caliente acelera su desgaste."],
        ["Calefacción de pitot — probada ON (debe subir la carga del alternador) y luego OFF", "Confirma que el anti-hielo del pitot realmente calienta, para cuando lo necesites en vuelo."],
        ["Luces según se requiera; piloto automático — sin conectar todavía", "Deja la cabina lista sin distraer con sistemas que no hacen falta en tierra."],
        ["Freno de estacionamiento — liberado; frenos — probados al iniciar el movimiento", "Confirma que responden antes de necesitarlos para detener el avión."],
        ["Bombas de combustible — OFF durante el rodaje", "Solo se necesitan para el arranque, el despegue y el aterrizaje; dejarlas encendidas de más no aporta nada."],
        ["Velocidad de rodaje — la mínima posible en superficie en mal estado", "Evita que piedras u objetos sueltos dañen la hélice."],
      ]],
      ["antes-despegue", "Antes de despegue (prueba de ECU y potencia)", [
        ["Avión orientado contra el viento; freno de estacionamiento — puesto; respaldos, arneses y puertas asegurados", "La prueba de ECU genera empuje real; el freno evita que el avión se mueva durante ella."],
        ["Anunciaciones e instrumentos del motor — en rango normal; breakers adentro; trim — T/O; válvula de combustible — NORMAL; flaps — T/O", "Detecta un problema mientras aún estás en tierra y puedes abortar con seguridad."],
        ["Prueba de ECU: potencia IDLE, hélice bajo 1,000 RPM, bombas OFF, VOTER AUTO, temperaturas en verde — botón ECU TEST presionado y sostenido hasta completar la secuencia", "Verifica que los dos canales redundantes del FADEC (A y B) realmente funcionan, antes de confiar en ellos en vuelo."],
        ["Luces ECU A/B FAIL — verificar que ambas queden apagadas al terminar la prueba; si alguna queda encendida, no volar", "Una falla real de un canal ECU aquí significa que ya perdiste la redundancia antes de despegar."],
        ["Chequeo de potencia disponible: palanca a MAX 10 segundos, RPM estabiliza en 2,200–2,300, LOAD en 88–100 %", "Confirma que el motor realmente entrega la potencia que vas a necesitar para despegar, no solo que enciende."],
        ["Bombas de combustible — ON; freno de estacionamiento — liberado", "Deja el sistema en la configuración normal de vuelo antes de iniciar la carrera de despegue."],
      ]],
      ["despegue", "Despegue", [
        ["Potencia — MAX; comprobar el buen funcionamiento del motor apenas se aplica", "Detectarlo temprano en la carrera todavía permite abortar el despegue con seguridad."],
        ["Elevador — neutral; timón — mantener dirección (evitar apoyarse en los frenos)", "Usar los frenos para corregir dirección alarga la carrera de despegue innecesariamente."],
        ["Rotación — a Vr según el peso (ver tabla de V-speeds); ascenso inicial a la velocidad de la tabla según el peso", "El FADEC hace el resto, pero rotar antes de tiempo puede despegar el avión sin suficiente sustentación."],
        ["Sobre altura segura: luz de aterrizaje OFF, bombas de combustible OFF, potencia reducida a 92 % de carga", "Evita el desgaste de volar a máxima potencia más tiempo del necesario."],
      ]],
      ["ascenso", "Ascenso", [
        ["Ascenso inicial: flaps T/O, Vy de la tabla, potencia 92 % o máximo 2,100 RPM", "Es la mejor tasa de ascenso con flaps de despegue: la mayor altura ganada por minuto."],
        ["Ascenso de crucero: flaps arriba, 88 KIAS, potencia 92 % o máximo 2,100 RPM", "Balancea velocidad horizontal y tasa de ascenso para el tramo largo del vuelo."],
        ["Si temperatura de aceite o refrigerante llega al rango amarillo: velocidad +5 kt y potencia -10 %", "Le da al motor más aire de refrigeración a costa de un ascenso más lento."],
      ]],
      ["crucero", "Crucero", [
        ["Flaps arriba; potencia hasta 92 % o máximo 2,100 RPM (75 % recomendado para crucero)", "Reduce el desgaste del motor y el consumo de combustible frente a volar a máxima potencia continua."],
        ["Transferencia de combustible — interruptor ON, monitoreando que el tanque principal suba y el auxiliar baje (~1 gal/min); OFF cuando corresponda", "El motor solo toma combustible del tanque principal; sin transferir desde el auxiliar, ese combustible nunca llega al motor."],
        ["Escaneo de tráfico — constante", "La mayoría de las colisiones en vuelo ocurren en espacio aéreo no controlado, en vuelo recto y nivelado."],
      ]],
      ["descenso", "Descenso", [
        ["Potencia y velocidad — según se requiera; trim ajustado", "Un descenso sin cambios bruscos de potencia es más suave para el motor y los pasajeros."],
        ["Anunciaciones e instrumentos del motor — monitoreados", "Detecta cualquier anomalía mientras aún tienes altura y opciones para actuar."],
      ]],
      ["antes-aterrizar", "Aproximación y antes de aterrizar", [
        ["Respaldos ajustables — verticales; arneses — abrochados y ajustados; controles sin interferencia de objetos sueltos", "Un objeto suelto puede trabar los controles justo en la fase más delicada del vuelo."],
        ["Bombas de combustible — ON; freno de estacionamiento — liberado; trim ajustado", "Respaldan la presión de combustible en la fase donde un motor y al aire es más probable."],
        ["Velocidad antes de aterrizar y de aproximación final — según la tabla de peso y la posición de flaps", "Volar más rápido de lo necesario alarga significativamente la distancia de aterrizaje en el flare."],
        ["Flaps — según se requiera; potencia — según se requiera", "Cada combinación de peso y flaps tiene su propia velocidad segura en la tabla del manual."],
      ]],
      ["apagado", "Después de aterrizar y apagado", [
        ["Potencia — IDLE; frenos según se requiera; transpondedor — OFF/STBY; calefacción de pitot — OFF", "Ahorra batería y dispositivos que ya no hacen falta en tierra."],
        ["Flaps — arriba; bombas de combustible — OFF", "Deja los flaps protegidos del viento y el sistema en su configuración de reposo."],
        ["Freno de estacionamiento — puesto; potencia hasta 10 % de carga por 1 minuto antes de apagar", "Ese minuto a baja carga evita daño por calor al turbocompresor, que sigue muy caliente tras el vuelo."],
        ["ELT — verificar que no esté transmitiendo en 121.5", "Un ELT activado por error agota su batería y puede generar una falsa alarma de búsqueda y rescate."],
        ["Aviónica (AVIONIC MASTER) — OFF; consumidores eléctricos — OFF; Motor (ENGINE MASTER) — OFF; estroboscópicas — OFF", "Nunca se apaga el motor cerrando la válvula de combustible: puede dañar la bomba de alta presión."],
        ["Esperar a que las indicaciones del motor desaparezcan del G1000 antes de apagar el Eléctrico (ELECTRIC MASTER)", "Así el sistema alcanza a guardar los datos de vuelo y del motor en memoria antes de perder energía."],
        ["Bitácora — anotaciones de tiempo de vuelo y anomalías", "Es el registro legal del avión y la forma de detectar un problema que se repite vuelo tras vuelo."],
      ]],
    ]),
    emergencia: fases("da40e", [
      ["problema-tierra", "Problema de motor en tierra", [
        ["Palanca de potencia — IDLE; frenos — según se requiera", "Detener el avión es la prioridad antes de diagnosticar nada."],
        ["Si la presión de aceite está en rango rojo: apagar el motor de inmediato", "Seguir operando con presión de aceite en rojo puede destruir el motor en minutos."],
        ["Si el problema no se resuelve: no volar el avión", "Un problema de motor que persiste en tierra no va a mejorar en el aire."],
      ]],
      ["falla-despegue-abortable", "Problema de motor en el despegue (aún se puede abortar)", [
        ["Palanca de potencia — IDLE; frenos según se necesite; aterrizar recto al frente", "Detener el avión en la pista restante es más seguro que intentar volar con el motor ya fallando."],
        ["Si hay tiempo: válvula de combustible OFF, Motor (ENGINE MASTER) OFF, Eléctrico (ELECTRIC MASTER) OFF", "Reduce el riesgo de incendio en una posible colisión mientras el avión aún se desliza."],
      ]],
      ["falla-despegue-no-abortable", "Problema de motor en el despegue (ya no se puede abortar)", [
        ["Actitud — picar de inmediato para no perder velocidad", "Perder velocidad buscando restablecer el motor es más peligroso que planear con la nariz baja."],
        ["Si hay tiempo: palanca de potencia — verificar MAX; bombas de combustible — verificar ON; VOTER — verificar AUTO", "Descarta que el problema sea simplemente una palanca o un interruptor mal puestos."],
        ["Sin altura segura: aterrizaje de emergencia recto al frente; nunca intentar regresar a la pista", "Un viraje de regreso a baja altura y sin potencia completa puede terminar en una pérdida antes de llegar."],
      ]],
      ["problema-vuelo", "Aspereza o pérdida de potencia en vuelo (diagnóstico)", [
        ["Velocidad — 88 KIAS; palanca de potencia — MAX", "Primero se controla el vuelo, después se diagnostica el problema."],
        ["Si ECU A y ECU B avisan a la vez con motor áspero: potencia IDLE 1 segundo, luego subir despacio sin pasar de 1,975 RPM", "Es la única combinación que permite seguir usando el motor sin repetir la pérdida de potencia."],
        ["Si no se resuelve: breakers revisados y reiniciados si hace falta; VOTER alternado entre ECU A y B; de vuelta a AUTO si se resuelve", "Aísla si la falla es de un solo canal del FADEC, en cuyo caso el otro puede sostener el vuelo."],
        ["Si persiste: válvula de combustible — EMERGENCY, y si se resuelve, mantenerse dentro del desbalance lateral permitido", "Da una ruta alterna de combustible cuando la normal está fallando."],
        ["Si aun así no se resuelve: válvula — NORMAL, aire alterno — OPEN, potencia según se requiera", "El aire alterno evita que una toma de aire obstruida siga limitando al motor."],
        ["Si nada funciona: prepararse para falla de motor en vuelo", "Agotadas las opciones de reparar el problema en el aire, toca prepararse para volar sin motor."],
      ]],
      ["falla-motor", "Falla de motor en vuelo (reencendido)", [
        ["Velocidad — 88 KIAS; flaps — arriba", "Es la velocidad de mejor planeo: 9.7 de relación planeo, la mayor distancia posible sin motor."],
        ["Si hay altura suficiente (16,400 ft para reencendido inmediato, 10,000 ft si ya pasaron hasta 2 minutos): intentar reencender", "Pasados 2 minutos el motor se enfría demasiado y el reencendido deja de ser confiable."],
        ["Reencendido: potencia IDLE, VOTER AUTO, válvula NORMAL, aire alterno según se requiera, combustible verificado, Eléctrico y Motor — ON", "Repite en el aire la misma secuencia de arranque normal del motor."],
        ["Si no enciende: válvula de combustible — EMERGENCY", "Da una ruta alterna de combustible antes de rendirse con el reencendido."],
        ["Si sigue sin encender: configuración de planeo (flaps arriba, 88 KIAS) y aterrizaje de emergencia sin motor", "Con la hélice moliendo en el aire, el avión sigue siendo controlable y planea de forma predecible."],
      ]],
      ["helice-sobrevelocidad", "Sobrevelocidad de la hélice", [
        ["Palanca de potencia — reducir para no pasar de 2,300 RPM; velocidad — 88 KIAS; flaps — verificar arriba", "Limita el esfuerzo sobre una hélice que ya gira más rápido de lo seguro."],
        ["Si no se resuelve: VOTER alternado entre ECU A y B, luego AUTO si no ayuda", "Aísla si el problema viene de un solo canal del gobernador electrónico."],
        ["Si persiste: aterrizar en el aeropuerto adecuado más cercano", "Sin gobernador funcionando bien, el rendimiento en ascenso y motor y al aire ya no es confiable."],
      ]],
      ["helice-subvelocidad", "Subvelocidad de la hélice", [
        ["Palanca de potencia — ajustar según se requiera", "Primero se intenta recuperar RPM normal con el control directo de potencia."],
        ["Si no se resuelve: VOTER alternado entre ECU A y B, luego AUTO", "Aísla si el problema viene de un solo canal del gobernador electrónico."],
        ["Aterrizar en el aeropuerto más cercano: puede no haber potencia de ascenso ni de motor y al aire disponible", "Sin RPM suficiente, el margen de rendimiento del avión queda muy reducido."],
      ]],
      ["falla-bomba-transferencia", "Falla de la bomba de transferencia de combustible", [
        ["Cantidad de combustible — verificada", "Confirma si el tanque principal realmente se está quedando bajo."],
        ["Si el tanque principal está bajo: válvula — EMERGENCY, bombas de combustible — OFF, monitorear ambos tanques", "Da una ruta alterna para seguir alimentando el motor mientras el auxiliar todavía tenga combustible."],
        ["Regresar la válvula a NORMAL antes de que el auxiliar llegue a cero", "Dejarla en EMERGENCY con el auxiliar vacío detiene el motor en pleno vuelo."],
      ]],
      ["falla-electrica", "Falla eléctrica total", [
        ["Breakers — revisados adentro; bus esencial — ON", "El bus esencial mantiene lo mínimo indispensable con la menor carga posible."],
        ["Si sigue sin energía: interruptor EMERGENCY — ON; luz de emergencia según se requiera", "La batería de emergencia sostiene el horizonte de respaldo y la luz, no todo el sistema."],
        ["Potencia — ajustada por posición de la palanca y sonido del motor; aterrizar en el aeropuerto adecuado más cercano", "El FADEC necesita electricidad para funcionar; sin ella, una falla de motor es posible en cualquier momento."],
      ]],
      ["corriente-alta", "Corriente alta (más de 70 A)", [
        ["Bus esencial — ON; breakers — revisados adentro; amperímetro y voltímetro — monitoreados", "Aísla si hay un consumidor con falla antes de que agote la batería o dañe el sistema."],
        ["Aterrizar en el aeropuerto adecuado más cercano", "Una corriente alta sostenida puede indicar una falla que empeore en vuelo."],
      ]],
      ["falla-arrancador", "Falla del motor de arranque", [
        ["En tierra: palanca de potencia — IDLE; Motor y Eléctrico — OFF; terminar la preparación del vuelo", "Un motor de arranque que no se desengancha puede dañarse o dañar al motor si se sigue operando."],
        ["En vuelo: aterrizar lo antes posible", "El motor de arranque enganchado de más puede fallar en cualquier momento."],
      ]],
      ["fuego-arranque", "Fuego de motor al arrancar (en tierra)", [
        ["Válvula de combustible — OFF; bomba de transferencia — OFF; Motor — OFF; bombas de combustible — OFF; Eléctrico — OFF", "Corta toda fuente de combustible y de chispa que pueda seguir alimentando el fuego."],
        ["Con el avión detenido: canopy abierto; evacuar de inmediato", "Un fuego de combustible en tierra puede propagarse en segundos; no vale la pena quedarse a apagarlo desde dentro."],
      ]],
      ["fuego-motor-vuelo", "Fuego de motor en vuelo", [
        ["Calefacción de cabina — OFF; área de aterrizaje de emergencia — seleccionada", "El sistema de calefacción toma aire del compartimento del motor; dejarlo abierto mete humo a la cabina."],
        ["Cuando parezca seguro llegar al área: válvula de combustible — OFF, palanca de potencia — MAX, ventanas de emergencia si hace falta", "Corta el combustible que alimenta el fuego mientras aprovechas la inercia para llegar al sitio elegido."],
        ["Aterrizar de inmediato como aterrizaje de emergencia sin motor", "Con fuego a bordo, el objetivo cambia: aterrizar ya, no llegar al aeropuerto más cómodo."],
      ]],
      ["fuego-electrico-vuelo", "Fuego eléctrico con humo en vuelo", [
        ["Interruptor EMERGENCY — ON; Aviónica y Eléctrico — OFF; calefacción de cabina — OFF", "Corta la corriente que alimenta el fuego; la batería de emergencia sostiene el horizonte de respaldo y la luz."],
        ["Ventanas de emergencia — abrir si hace falta; aterrizar de inmediato", "Saca el humo de la cabina mientras llegas al sitio de aterrizaje."],
      ]],
    ]),
    flujos: flujos("da40", [
      ["falla-motor", "Falla de motor en vuelo (reencendido)", ["Velocidad: 88 KIAS, flaps arriba", "Potencia IDLE, VOTER AUTO", "Válvula NORMAL, Eléctrico y Motor ON", "Si no enciende: válvula EMERGENCY", "Si no responde: config. de planeo y aterrizaje sin motor"]],
      ["fuego-motor-vuelo", "Fuego de motor en vuelo", ["Calefacción de cabina OFF", "Área de aterrizaje seleccionada", "Válvula de combustible OFF", "Potencia MAX", "Aterrizaje de emergencia sin motor"]],
      ["falla-electrica", "Falla eléctrica total", ["Breakers revisados, bus esencial ON", "Si no hay energía: EMERGENCY switch ON", "Potencia por posición de palanca y sonido", "Aeropuerto más cercano"]],
    ]),
    vspeeds: [
      { clave: "Vr", nombre: "Rotación (flaps T/O)", valor: "56–67 kt según el peso (67 kt a 1,280 kg)" },
      { clave: "Vy", nombre: "Mejor tasa de ascenso (flaps T/O)", valor: "72 kt" },
      { clave: "Vcl", nombre: "Ascenso de crucero (flaps arriba)", valor: "88 kt" },
      { clave: "Vglide", nombre: "Mejor planeo (flaps arriba)", valor: "88 kt" },
      { clave: "Va", nombre: "Velocidad de maniobra", valor: "101 kt hasta 1,080 kg · 108 kt hasta 1,180 kg · 113 kt más de 1,180 kg" },
      { clave: "Vfe", nombre: "Máxima con flaps extendidos", valor: "110 kt (T/O) / 98 kt (LDG)" },
      { clave: "Vno", nombre: "Máxima estructural normal", valor: "130 kt" },
      { clave: "Vne", nombre: "Nunca exceder", valor: "172 kt" },
      { clave: "Vs", nombre: "Pérdida, flaps arriba", valor: "58 kt a 1,000 kg · 64 kt a 1,200 kg" },
      { clave: "Vs0", nombre: "Pérdida, flaps LDG", valor: "55 kt a 1,000 kg · 59 kt a 1,200 kg" },
    ],
    notaVspeeds: "Valores del manual de vuelo del DA40 NG (AFM 6.01.15-E, rev. 3), en KIAS; varias dependen del peso. Confirma los de tu avión y los de tu versión del simulador.",
    limites: {
      titulo: "Límites de operación",
      nota: "Del AFM del DA40 NG (motor diésel Austro E4-A). El límite oficial siempre es el de tu manual y tu simulador.",
      columnas: ["Límite", "Valor"],
      filas: [
        ["Masa máxima de despegue", "1,280 kg (2,822 lb); 1,310 kg si aplica la modificación MÄM 40-662"],
        ["Masa mínima de vuelo", "940 kg (2,072 lb)"],
        ["Carga máxima de equipaje", "30 kg (66 lb), estándar"],
        ["Factor de carga positivo (a Vo)", "+3.8 g"],
        ["Factor de carga negativo (a Vo)", "-1.52 g (maniobras negativas intencionales prohibidas)"],
        ["RPM máxima de despegue", "2,300 RPM, máx. 5 minutos"],
        ["RPM máxima continua", "2,100 RPM"],
        ["Sobrevelocidad máxima", "2,500 RPM, máx. 20 segundos"],
        ["Temperatura de aceite", "50–135 °C normal; 140 °C máximo"],
        ["Presión de aceite", "2.5–6.0 bar normal; 6.5 bar máximo; 0.9 bar mínimo en ralentí"],
        ["Temperatura de refrigerante", "60–95 °C normal; 105 °C máximo"],
        ["Altitud máxima de operación", "16,400 ft de altitud de presión"],
        ["Vuelo en hielo conocido", "Prohibido"],
      ],
    },
    sistemas: [
      {
        titulo: "FADEC y doble canal (ECU A/B)",
        texto: "Una sola palanca de potencia controla el motor: no hay mezcla ni hélice que ajustar por separado. Dos computadoras redundantes (ECU A y B) lo gestionan; el interruptor VOTER en AUTO deja que el sistema elija el canal sano, y solo se fija en A o B manualmente para la prueba en tierra o en una emergencia real.",
      },
      {
        titulo: "Combustible con transferencia",
        texto: "El motor solo toma combustible del tanque principal. El combustible del tanque auxiliar hay que transferirlo activamente con la bomba de transferencia, monitoreando que el principal suba y el auxiliar baje — olvidarlo dejaría combustible en el auxiliar sin poder usarlo.",
      },
      {
        titulo: "Eléctrico en tres interruptores",
        texto: "A diferencia de un solo master, aquí hay Eléctrico (ELECTRIC MASTER), Motor (ENGINE MASTER) y Aviónica (AVIONIC MASTER) por separado. El motor depende del sistema eléctrico para funcionar — sin corriente, el FADEC no puede controlarlo — por eso una falla eléctrica total es también una emergencia de motor.",
      },
      {
        titulo: "Turbocompresor y enfriamiento",
        texto: "El motor diésel usa un turbocompresor que queda muy caliente tras el vuelo. Por eso se le da un minuto a baja potencia antes de apagarlo, y nunca se apaga cerrando la válvula de combustible: eso puede dañar la bomba de combustible de alta presión.",
      },
    ],
  },

  arrow: {
    id: "arrow",
    nombre: "Piper PA-28R-201 Arrow",
    nota: `Cuatro plazas con tren retráctil (hidráulico, con bomba eléctrica), hélice de velocidad constante y motor Lycoming IO-360-C1C6 de 200 hp a inyección (sin carburador). Selector de combustible por tanque, sin posición AMBOS. ${avisoPoh("Piper PA-28R-201 Arrow, POH VB-1612")} Las velocidades están en KIAS.`,
    normal: fases("arn", [
      ["prevuelo-cabina", "Prevuelo: cabina", [
        ["Volante — liberar los seguros; palanca del tren — DOWN; freno de estacionamiento — puesto", "Con la palanca del tren en UP y el master encendido, el tren podría intentar subir en tierra. Es lo primero que se revisa al subir a un avión de tren retráctil."],
        ["Aviónica y todos los interruptores — OFF; mezcla — CORTE (idle cut-off); magnetos — OFF", "Evita que el motor arranque solo y protege la aviónica del pico de voltaje del arranque."],
        ["Master de batería — ON: cantidad de combustible y panel de anunciadores verificados; luego master — OFF", "Confirma el combustible real y que el sistema de alertas funcione, sin gastar batería innecesariamente."],
        ["Controles primarios y flaps — operación correcta; trim — neutral", "Un control restringido o un trim mal puesto solo se detecta con seguridad en tierra."],
        ["Pitot y estática — drenar; ventanas limpias; documentos y POH a bordo; equipaje y barra de remolque asegurados; puerta de equipaje cerrada", "Agua en las líneas da lecturas falsas de velocidad y altímetro, y una barra suelta puede golpear los controles en turbulencia."],
      ]],
      ["prevuelo-exterior", "Prevuelo: exterior", [
        ["Ala derecha — sin hielo, escarcha ni nieve; flap, alerón, bisagras, descargadores estáticos, punta y luces revisados", "Hielo o escarcha en el ala cambia su forma y reduce la sustentación de forma impredecible."],
        ["Tanque derecho — combustible a la vista y tapa segura; venteo despejado; sumidero drenado sin agua ni sedimento y del grado correcto", "El agua se asienta en el fondo del tanque; si llega al motor, lo apaga sin aviso."],
        ["Tren principal — amortiguador con 2.0 ± 0.25 in expuestas, llanta, disco y pastilla de freno; calza y amarre fuera", "Un amortiguador mal inflado transmite el impacto del aterrizaje a la estructura, y en un tren retráctil también afecta cómo sube y baja."],
        ["Nariz — cofia asegurada, aceite con la varilla bien asentada y tapa segura, deflectores, hélice y spinner sin muescas, entradas de aire libres, banda del alternador con tensión", "Una muesca en la hélice puede crecer con la vibración, y una banda floja del alternador puede dejarte sin carga eléctrica en vuelo."],
        ["Tren de nariz — amortiguador con 2.75 ± 0.25 in expuestas y llanta; filtro de combustible (lado izquierdo del firewall) — drenado", "El filtro es el punto más bajo del sistema; drenarlo complementa los drenados de los tanques."],
        ["Ala izquierda — mismo recorrido; paleta del aviso de pérdida libre; pitot bajo el ala sin cubierta y con el orificio libre", "Un pitot tapado da lecturas de velocidad falsas o nulas en pleno vuelo."],
        ["Fuselaje y cola — antenas, tomas estáticas de ambos lados libres, estabilizador y su tab sin daño (el tab se mueve en el mismo sentido que el estabilizador); amarre fuera", "Una toma estática bloqueada afecta al altímetro y al velocímetro, no solo al pitot."],
        ["Master ON: luces, aviso de pérdida (levantando la paleta) y calefacción del pitot — verificados; luego todo OFF", "Es tu única alerta antes de una pérdida; confirmarlo en tierra es gratis."],
        ["Pasajeros a bordo; puerta cerrada y asegurada; cinturones y arneses ajustados (probar el carrete de inercia)", "Una puerta mal cerrada puede abrirse en vuelo por la presión del aire."],
      ]],
      ["antes-arrancar", "Antes de arrancar", [
        ["Frenos — puestos; breakers — adentro; aire alterno — OFF (cerrado)", "El aire alterno entra sin filtrar; se usa solo si la toma normal se obstruye, nunca para despegar."],
        ["Hélice — FULL INCREASE (RPM altas); aviónica — OFF", "Da el paso más fino a la hélice para el arranque y protege la aviónica del pico de voltaje."],
        ["Selector de combustible — tanque deseado", "El Arrow no tiene posición AMBOS: siempre alimentas de un solo tanque, y hay que elegirlo a propósito."],
      ]],
      ["arranque", "Arranque del motor", [
        ["En frío: acelerador 1/2 pulgada abierto; alternador y master de batería ON; bomba eléctrica ON", "Deja el motor listo para cebar con presión de combustible."],
        ["Mezcla — RICH hasta ver indicación en el flujómetro, luego CORTE", "Así se ceba un motor de inyección: no tiene bomba de cebado como el Dakota."],
        ["Hélice despejada; starter — accionar; al encender, mezcla FULL RICH y acelerador ajustado", "Si no enciende en 5 a 10 segundos, suelta el starter y vuelve a cebar."],
        ["Presión de aceite — debe aparecer en menos de 30 segundos, si no, apagar e investigar", "Sin presión de aceite, el motor se está quedando sin lubricación."],
        ["En caliente: misma secuencia pero con la mezcla en CORTE (sin cebar) y avanzándola al encender", "Un motor caliente ya tiene combustible vaporizado; cebarlo de más lo ahoga."],
        ["Ahogado: acelerador a fondo, bomba eléctrica OFF, mezcla en CORTE; al encender, avanzar la mezcla y reducir el acelerador", "Girar con el acelerador abierto y sin mezcla despeja el exceso de combustible de los cilindros."],
        ["Starter — máximo 10 segundos seguidos, con 20 de descanso; tras 6 intentos, esperar 30 minutos", "Más tiempo seguido sobrecalienta el motor de arranque."],
      ]],
      ["rodaje", "Calentamiento y rodaje", [
        ["Calentamiento — 1,400 a 1,500 RPM", "Evita el ralentí bajo prolongado, que ensucia las bujías."],
        ["Área despejada; freno de estacionamiento — liberado; hélice — RPM altas; acelerador — aplicar despacio", "Se rueda con la hélice en paso fino y sin prisa para no levantar piedras hacia las palas."],
        ["Frenos y dirección — probados al iniciar el movimiento", "Confirma que responden antes de necesitarlos para detener el avión."],
      ]],
      ["prueba-motor", "Prueba de motor (run-up)", [
        ["Freno de estacionamiento — puesto; hélice — FULL INCREASE; acelerador — 2,000 RPM", "Es el régimen al que el manual valida la caída de RPM de los magnetos."],
        ["Magnetos — caída máxima de 175 RPM y diferencia máxima de 50 RPM; no más de 10 segundos en un solo magneto", "Una caída mayor señala una bujía o magneto fallando, que puede dejarte con menos potencia en vuelo."],
        ["Succión — 4.8 a 5.1 in Hg; temperatura y presión de aceite, amperímetro — verificados", "El vacío alimenta los giróscopos; sin el valor correcto, el horizonte y el direccional pueden fallar."],
        ["Anunciadores — press-to-test; aire alterno — probado", "Confirma que el sistema de alertas funciona antes de necesitarlo."],
        ["Hélice — ejercitarla (sin dejar caer más de 500 RPM) y regresar a FULL INCREASE; en frío, tres ciclos", "Mueve aceite caliente por el gobernador de la hélice para que responda rápido en el despegue."],
        ["Bomba eléctrica — OFF y presión/flujo de combustible verificados; acelerador — atrás", "Confirma que la bomba mecánica del motor sostiene la presión sin ayuda de la eléctrica."],
      ]],
      ["antes-despegue", "Antes de despegue", [
        ["Master de batería y alternador — ON; instrumentos de vuelo — verificados", "Sin alternador el tren y las radios dependen solo de la batería."],
        ["Selector de combustible — tanque más lleno; bomba eléctrica — ON; instrumentos del motor — verificados", "La bomba eléctrica respalda la presión de combustible si falla la mecánica en el despegue."],
        ["Aire alterno — cerrado; mezcla y hélice — ajustadas", "La toma normal de aire filtrado siempre se usa para despegar."],
        ["Respaldos erguidos; cinturones y arneses, también en asientos vacíos; puertas aseguradas", "Un arnés suelto en un asiento vacío puede golpear los controles en turbulencia."],
        ["Flaps y trim — ajustados; controles — libres; aire acondicionado — OFF (si tiene)", "El aire acondicionado roba potencia del despegue."],
      ]],
      ["despegue", "Despegue", [
        ["Normal: flaps arriba, trim un poco atrás de neutral; acelerar a 65–75 KIAS según el peso y rotar suave", "Rotar antes de esta velocidad puede hacer que el avión despegue sin suficiente sustentación."],
        ["Tren — UP cuando ya no quede pista para aterrizar recto y con ascenso positivo (máximo 107 KIAS para subirlo)", "Subirlo antes te quita la opción de volver a posarte en la pista si falla el motor; subirlo por encima de 107 KIAS excede su límite."],
        ["Pista corta con obstáculo: flaps 25°, rotar a 50–60 KIAS; ya en el aire 55–65 KIAS, tren UP, 78 KIAS (Vx) hasta librar el obstáculo, luego 90 KIAS (Vy) retrayendo los flaps despacio", "Vx da la mayor altura por distancia recorrida, justo lo que necesitas para librar un obstáculo cercano."],
        ["Pista blanda: flaps 25°, rotar a 50–60 KIAS; en efecto suelo 55–65 KIAS, tren UP, acelerar a 90 KIAS y retraer los flaps despacio", "Quitar peso de la rueda de nariz lo antes posible evita que se entierre en terreno blando."],
      ]],
      ["ascenso", "Ascenso", [
        ["Mejor tasa: 90 KIAS (tren arriba) o 78 KIAS (tren abajo); mejor ángulo: 78 KIAS (tren arriba) o 72 KIAS (tren abajo)", "Con el tren abajo hay más resistencia, por eso bajan las dos velocidades."],
        ["En ruta: 104 KIAS o más", "Enfría mejor el motor, lo desgasta menos y deja ver mejor hacia adelante."],
        ["Bomba eléctrica — OFF al llegar a la altitud deseada", "Así, si falla la bomba mecánica del motor, lo notas de inmediato."],
      ]],
      ["crucero", "Crucero", [
        ["Potencia — según la tabla de potencia del manual; máximo normal 75 %", "Reduce el desgaste del motor y el consumo frente a volar a máxima potencia."],
        ["Mezcla — empobrecida con 75 % o menos: hasta que el motor se ponga áspero y luego enriquecer hasta que quede suave", "El aire se enrarece con la altitud; sin empobrecer, el motor recibe combustible de más."],
        ["Alternar tanques cada hora, con la bomba eléctrica ON al cambiar y un rato después", "Mantiene el avión balanceado lateralmente, y la bomba evita un corte de flujo al cambiar."],
      ]],
      ["aterrizaje", "Aproximación y aterrizaje", [
        ["Selector — tanque más lleno; respaldos erguidos; cinturones y arneses; bomba eléctrica — ON", "Deja todo listo para un motor y al aire en cualquier momento."],
        ["Mezcla — RICH; hélice — FULL INCREASE", "Necesitas potencia completa inmediata si hace falta un motor y al aire."],
        ["Tren — DOWN bajo 129 KIAS: tres luces verdes y luz roja apagada", "Tres verdes es la única confirmación de que cada pata está abajo y trabada."],
        ["Flaps — según se requiera, bajo 103 KIAS; aire acondicionado — OFF", "Extenderlos por encima de esa velocidad excede su límite estructural."],
        ["Trim para 75 KIAS en final con flaps 40°; toque a la menor velocidad segura, con la nariz arriba lo más posible", "Frenar funciona mejor con los flaps arriba y el peso sobre las ruedas principales."],
      ]],
      ["apagado", "Apagado y estacionamiento", [
        ["Flaps — arriba; bomba eléctrica, aire acondicionado, aviónica y eléctricos — OFF", "El flap derecho es el escalón: solo aguanta peso cuando está completamente arriba."],
        ["Hélice — FULL INCREASE; acelerador — atrás; mezcla — CORTE; magnetos, alternador y master — OFF", "Así se apaga un motor de inyección: cortando el combustible con la mezcla."],
        ["Freno de estacionamiento — puesto; volante asegurado con el cinturón; calzas y amarres puestos", "El viento puede mover o dañar un avión sin calzas ni amarres."],
      ]],
    ]),
    emergencia: fases("are", [
      ["fuego-arranque", "Fuego en el motor durante el arranque", [
        ["Starter — seguir girando; mezcla — CORTE; acelerador — abierto", "Suele venir de cebar de más; girar el motor aspira el combustible sobrante y el fuego hacia la admisión."],
        ["Bomba eléctrica — OFF; selector de combustible — OFF; abandonar el avión si el fuego continúa", "Un fuego de combustible en tierra puede propagarse en segundos."],
      ]],
      ["falla-despegue", "Pérdida de potencia en el despegue", [
        ["Pista suficiente: dejar el tren abajo y aterrizar recto al frente", "Detener el avión en la pista restante es más seguro que intentar volar con el motor fallando."],
        ["Terreno irregular adelante u obstáculos que librar: palanca del tren — UP", "Aterrizar con el tren arriba en terreno malo evita que una pata se clave y voltee el avión."],
        ["Con altura para reencender: velocidad segura, selector al tanque con combustible, bomba eléctrica ON, mezcla RICH, aire alterno abierto", "Si fue por un tanque vacío, el motor puede tardar hasta 10 segundos en volver mientras se llenan las líneas."],
        ["Si no regresa la potencia: aterrizaje sin motor", "Con poca altura, seguir intentando en vez de prepararse para aterrizar reduce tus opciones."],
      ]],
      ["falla-motor", "Pérdida de potencia en vuelo", [
        ["A baja altura: mantener 79 KIAS como mínimo y prepararse para aterrizar sin motor", "Es la velocidad de mejor planeo: la mayor distancia posible sin motor."],
        ["Con altura: selector al otro tanque con combustible, bomba eléctrica ON, mezcla RICH, aire alterno abierto", "Casi siempre la causa es una interrupción del flujo de combustible, y la potencia vuelve al restablecerlo."],
        ["Instrumentos del motor — buscar la causa; sin flujo de combustible, revisar que el selector esté en un tanque con combustible", "Es la causa más simple y más común."],
        ["Si hay tiempo: magnetos en L, R y BOTH; probar otras posiciones de acelerador y mezcla", "Puede recuperar la potencia si la mezcla estaba muy rica o muy pobre, o si hay una restricción parcial."],
        ["Con la potencia recuperada: aire alterno cerrado y bomba eléctrica OFF", "Regresa el motor a su configuración normal."],
        ["Si no se recupera: trim para 79 KIAS y aterrizaje sin motor", "Mantener la velocidad de mejor planeo te da más terreno donde elegir."],
      ]],
      ["aterrizaje-sin-motor", "Aterrizaje sin motor", [
        ["Trim para 79 KIAS; elegir el campo y establecer una espiral; 1,000 ft sobre el campo en la pierna con el viento", "La espiral sobre el campo te deja evaluarlo y llegar con la altura justa."],
        ["Con el campo al alcance: 72 KIAS para el aterrizaje más corto; tocar a la menor velocidad posible con flaps completos", "Menos velocidad al tocar significa menos distancia y menos energía en el impacto."],
        ["Tren abajo (campo firme): palanca del tren DOWN, flaps según se desee, acelerador cerrado, mezcla CORTE, magnetos OFF, master y alternador OFF, selector OFF, cinturones ajustados", "Con el master en OFF el tren ya no se puede subir: decide antes si aterrizas con el tren abajo o arriba."],
        ["Tren arriba (agua o terreno blando o irregular): misma secuencia sin bajar el tren; tocar a la menor velocidad posible", "Evita que una pata se clave en el terreno y voltee el avión."],
      ]],
      ["fuego-vuelo", "Fuego en vuelo", [
        ["Origen del fuego — verificar", "Un fuego eléctrico y uno de motor se combaten distinto."],
        ["Eléctrico (humo en cabina): master de batería y alternador OFF, ventilas abiertas, calefacción OFF; aterrizar lo antes posible", "Corta la corriente que alimenta el fuego y saca el humo de la cabina."],
        ["De motor: selector OFF, acelerador cerrado, mezcla CORTE, bomba eléctrica OFF, calefacción y desempañador OFF; aterrizaje sin motor", "Elimina el combustible que alimenta el fuego."],
      ]],
      ["indicaciones-motor", "Aceite y combustible", [
        ["Pérdida de presión de aceite: aterrizar lo antes posible y prepararse para aterrizar sin motor", "Sin presión de aceite, una falla total del motor puede ser cuestión de minutos."],
        ["Temperatura de aceite alta: aterrizar en el aeropuerto más cercano y prepararse para aterrizar sin motor", "El aceite sobrecalentado lubrica menos."],
        ["Pérdida de flujo o presión de combustible: bomba eléctrica ON y revisar que el selector esté en un tanque con combustible", "La bomba eléctrica puede sostener la presión si falla la mecánica."],
      ]],
      ["falla-electrica", "Falla eléctrica (anunciador ALT)", [
        ["Amperímetro — confirmar que el alternador no carga", "Descarta una lectura pasajera."],
        ["Si marca cero: alternador OFF, carga eléctrica al mínimo, breaker ALTNTR FIELD revisado y reiniciado, alternador ON", "Este reinicio recupera el sistema si la falla fue momentánea."],
        ["Si no regresa: alternador OFF, carga reducida y aterrizar en cuanto sea práctico: solo queda la batería", "Si la batería se agota, el tren ya no baja con la bomba y hay que bajarlo con la extensión de emergencia."],
      ]],
      ["sobrecarga-electrica", "Sobrecarga eléctrica (alternador 20 A arriba de lo normal)", [
        ["Master de batería — OFF", "Descarta si la batería es la que está absorbiendo la corriente de más."],
        ["Si el amperímetro no baja: alternador OFF y aterrizar lo antes posible, bajando el tren con la extensión de emergencia", "Sin corriente, la bomba del tren y las luces de posición del tren no funcionan."],
        ["Si baja: master de batería ON y vigilar el amperímetro; si no empieza a bajar en 5 minutos, master OFF y aterrizar lo antes posible", "Una batería que no se recupera puede calentarse y dañarse."],
      ]],
      ["sobrevelocidad-helice", "Sobrevelocidad de la hélice", [
        ["Acelerador — retardar; presión de aceite — revisar", "Reduce de inmediato el esfuerzo sobre una hélice que gira de más."],
        ["Hélice — FULL DECREASE y luego ajustar si responde; velocidad — reducir", "Intenta que el gobernador recupere el control del paso."],
        ["Acelerador — el necesario para no pasar de 2,700 RPM", "Una sobrevelocidad sostenida daña el motor y la hélice."],
      ]],
      ["extension-emergencia", "Extensión de emergencia del tren", [
        ["Antes: master de batería y alternador ON, breakers revisados, luces de navegación OFF de día y focos de las luces del tren revisados", "Muchas veces el tren sí bajó y lo que falla es el foco, o las luces se ven tenues porque están encendidas las de navegación."],
        ["Si no marca abajo y trabado: velocidad bajo 87 KIAS y palanca del tren en DOWN", "A menos velocidad, el viento empuja menos contra el tren y le cuesta menos trabarse."],
        ["Si sigue sin trabar: palanca de emergencia — mantenerla abajo (EMERGENCY DOWN)", "Libera la presión hidráulica para que el tren caiga por su propio peso; la nariz tiene un resorte que la ayuda."],
        ["Si aún no traba: guiñar el avión de un lado a otro con el timón", "El movimiento lateral ayuda a que la pata que falta termine de trabarse."],
        ["Si la nariz no traba: velocidad mínima segura con la menor potencia; tren DOWN, y si no, ciclar UP y otra vez DOWN", "A la menor velocidad posible el viento empuja lo menos contra la nariz."],
      ]],
      ["barrena", "Recuperación de barrena", [
        ["Timón — a fondo contra la rotación", "El timón es lo que detiene la rotación."],
        ["Volante — a fondo adelante con los alerones neutros; acelerador — cerrado", "Rompe la pérdida del ala; los alerones o la potencia durante la barrena pueden empeorarla."],
        ["Timón — neutral al detenerse la rotación; volante — recuperar el vuelo nivelado con suavidad", "Recuperar bruscamente puede meter al avión en una pérdida secundaria."],
      ]],
      ["puerta-abierta", "Puerta abierta en vuelo", [
        ["Reducir a 87 KIAS; ventilas cerradas; ventanilla de tormenta abierta", "Reduce la fuerza del aire sobre la puerta y facilita cerrarla."],
        ["Cerrar el seguro que esté abierto; si están los dos, primero el lateral (jalando el descansabrazos) y luego el superior", "El orden correcto evita que la puerta se vuelva a abrir mientras aseguras el otro."],
      ]],
      ["aspereza-motor", "Motor áspero", [
        ["Mezcla — ajustar a la máxima suavidad; aire alterno — abierto; bomba eléctrica — ON; cambiar de tanque; revisar instrumentos", "Descarta primero las causas de combustible y de admisión."],
        ["Magnetos en L, R y BOTH; si funciona bien con uno, seguir con ese a potencia reducida y mezcla RICH hasta el primer aeropuerto", "Aísla una bujía o magneto fallando y te deja volar con el que sí funciona."],
        ["Si la aspereza sigue: prepararse para un aterrizaje de precaución", "Un motor que sigue áspero puede fallar del todo."],
      ]],
    ]),
    flujos: flujos("ar", [
      ["falla-motor", "Pérdida de potencia en vuelo", ["Mejor planeo: 79 KIAS", "Otro tanque y bomba eléctrica ON", "Mezcla RICH y aire alterno abierto", "Magnetos L, R y BOTH", "Si no regresa: aterrizaje sin motor"]],
      ["extension-emergencia", "Extensión de emergencia del tren", ["Master, breakers y focos revisados", "Menos de 87 KIAS, tren DOWN", "Palanca de emergencia abajo", "Guiñar con el timón", "Tres verdes"]],
      ["fuego-motor", "Fuego de motor en vuelo", ["Selector OFF", "Acelerador cerrado, mezcla CORTE", "Bomba eléctrica OFF", "Calefacción y desempañador OFF", "Aterrizaje sin motor"]],
    ]),
    vspeeds: [
      { clave: "Vr", nombre: "Rotación (despegue normal)", valor: "65–75 kt según el peso" },
      { clave: "Vx", nombre: "Mejor ángulo de ascenso", valor: "78 kt tren arriba · 72 kt tren abajo" },
      { clave: "Vy", nombre: "Mejor tasa de ascenso", valor: "90 kt tren arriba · 78 kt tren abajo" },
      { clave: "Va", nombre: "Velocidad de maniobra", valor: "118 kt a 2,750 lb (96 kt a 1,865 lb)" },
      { clave: "Vglide", nombre: "Mejor planeo (2,750 lb, tren y flaps arriba)", valor: "79 kt" },
      { clave: "Vfe", nombre: "Máxima con flaps extendidos", valor: "103 kt" },
      { clave: "Vlo", nombre: "Máxima para operar el tren", valor: "129 kt para bajarlo · 107 kt para subirlo" },
      { clave: "Vle", nombre: "Máxima con el tren abajo", valor: "129 kt" },
      { clave: "Vno", nombre: "Máxima estructural normal", valor: "146 kt" },
      { clave: "Vne", nombre: "Nunca exceder", valor: "183 kt" },
      { clave: "Vs", nombre: "Pérdida, tren arriba y flaps 0° (2,750 lb)", valor: "60 kt" },
      { clave: "Vs0", nombre: "Pérdida, tren abajo y flaps 40° (2,750 lb)", valor: "55 kt" },
      { clave: "Vapp", nombre: "Aproximación final (flaps 40°)", valor: "75 kt" },
      { clave: "Vxw", nombre: "Viento cruzado demostrado", valor: "17 kt" },
    ],
    notaVspeeds: "Valores del manual del fabricante (POH VB-1612), en KIAS. Confirma los de tu avión y los de tu versión del simulador.",
    limites: {
      titulo: "Límites de operación",
      nota: "Del POH del Arrow PA-28R-201 (VB-1612), motor Lycoming IO-360-C1C6 de 200 hp. El límite oficial siempre es el de tu manual y tu simulador.",
      columnas: ["Límite", "Valor"],
      filas: [
        ["Peso máximo", "2,750 lb"],
        ["Carga máxima de equipaje", "200 lb"],
        ["Factor de carga positivo máximo", "+3.8 g (sin maniobras invertidas; categoría normal)"],
        ["Maniobras", "Sin acrobacia ni barrenas; máximo 60° de alabeo y 30° de cabeceo"],
        ["RPM máxima", "2,700 RPM"],
        ["Temperatura de aceite máxima", "245 °F"],
        ["Presión de aceite", "25 PSI mínima · 60–90 PSI normal · 100 PSI máxima"],
        ["Flujo de combustible máximo", "21.4 GPH (12 PSI)"],
        ["Combustible total / utilizable", "77 gal / 72 gal (36 gal por tanque)"],
        ["Vuelo en hielo conocido", "Prohibido"],
      ],
    },
    sistemas: [
      {
        titulo: "Tren retráctil",
        texto: "Tren triciclo que sube y baja con una bomba hidráulica eléctrica, en unos siete segundos. Tres luces verdes indican cada pata abajo y trabada; la luz roja WARNING GEAR UNSAFE se enciende mientras el tren está en tránsito, y todas apagadas significa tren arriba. No tiene seguros mecánicos arriba: si falla la hidráulica, el tren cae solo. La palanca de emergencia, entre los asientos, libera la presión para que baje por gravedad.",
      },
      {
        titulo: "Aviso de tren arriba",
        texto: "La bocina (un pitido intermitente, distinto al sonido continuo del aviso de pérdida) y la luz roja se activan si el tren no está abajo y: la presión de admisión baja de unas 14 in Hg; la palanca está en UP en tierra con el acelerador atrás; o los flaps pasan de 10°. Es la última defensa contra aterrizar con el tren arriba, no un sustituto del checklist.",
      },
      {
        titulo: "Hélice de velocidad constante",
        texto: "Una palanca aparte controla las RPM y el gobernador ajusta el paso de la hélice para mantenerlas. Se despega y se aterriza con RPM altas (FULL INCREASE) para tener respuesta inmediata. El acelerador controla la presión de admisión; para potencia de crucero se ajustan las dos según la tabla del manual.",
      },
      {
        titulo: "Combustible e inyección",
        texto: "Dos tanques de 38.5 gal en las alas (36 utilizables cada uno) y un selector IZQUIERDO / DERECHO / OFF, sin AMBOS: hay que alternar tanques cada hora. El motor es de inyección, sin carburador ni calentador de carburador; si la toma de aire se obstruye, una compuerta de aire alterno se abre sola o con la palanca. La bomba eléctrica respalda a la mecánica en el arranque, el despegue, el aterrizaje y al cambiar de tanque.",
      },
    ],
  },

  v35: {
    id: "v35",
    nombre: "Beechcraft V35B Bonanza",
    nota: `Cola en V, tren retráctil eléctrico con manivela de emergencia, flaps eléctricos, cowl flaps y motor Continental IO-520-B de 285 hp a inyección con hélice de velocidad constante. Selector de combustible por tanque, sin posición AMBOS. ${avisoPoh("Beechcraft Bonanza V35, V35A y V35B, POH P/N 35-590118-31B")} Las velocidades están en KIAS y son las del V35B (D-8872 en adelante).`,
    normal: fases("v35n", [
      ["prevuelo", "Inspección prevuelo", [
        ["Cabina: freno de estacionamiento — puesto; seguro de control — retirado; todos los interruptores — OFF; ELT — armado", "Un seguro de control olvidado deja el avión sin mando justo al despegar."],
        ["Fuselaje derecho: puerta de equipaje asegurada; toma estática libre", "Una toma estática tapada da lecturas falsas de altímetro, velocímetro y variómetro."],
        ["Cola en V: superficies de control, amarre, luz de posición y toma de aire de cabina revisados", "Las dos superficies de la V hacen de elevador y de timón a la vez; un daño en una afecta a los dos controles."],
        ["Fuselaje izquierdo: toma estática libre y antenas", "Revisa las dos tomas: el sistema estático las usa ambas."],
        ["Ala izquierda: flap, alerón, punta y luz; aviso de pérdida; pitot sin cubierta; combustible a la vista y tapa segura; amarre y calzas fuera", "El nivel en el tanque confirma lo que marcan los indicadores."],
        ["Tren izquierdo: compuerta, llanta y amortiguador; venteo de combustible; sumidero del tanque y sumidero del selector — drenados", "El Bonanza tiene tres drenados: uno por tanque y el del selector, junto a la raíz del ala izquierda."],
        ["Nariz: cowl flaps, aceite (12 cuartos de capacidad) con varilla y tapa seguras, cofia asegurada, hélice sin muescas, tren de nariz, toma de aire libre, luces de aterrizaje", "Poco aceite reduce la lubricación y puede provocar una falla de motor."],
        ["Tren derecho, ala derecha: mismo recorrido; nunca rodar con un amortiguador desinflado", "Un amortiguador bajo puede dañar el mecanismo del tren retráctil."],
      ]],
      ["antes-arrancar", "Antes de arrancar", [
        ["Asientos ajustados y trabados, respaldos verticales; cinturones y arneses abrochados", "Los respaldos deben ir verticales en el despegue y el aterrizaje."],
        ["Freno de estacionamiento — puesto; aviónica — OFF; breakers — adentro", "Protege la aviónica del pico de voltaje del arranque."],
        ["Palanca del tren — DOWN", "El interruptor de seguridad del amortiguador no sustituye a la palanca: nunca confíes en él para mantener el tren abajo en tierra."],
        ["Flaps — UP; cowl flaps — OPEN; trim eléctrico — OFF (si tiene)", "Los cowl flaps van abiertos en tierra y en el despegue para enfriar el motor."],
        ["Selector de combustible — probar y dejar en el tanque más lleno, sintiendo el retén", "Entre retenes no pasa combustible al motor: la palanca siempre debe quedar trabada en una posición."],
        ["Batería y alternador — ON; cantidad de combustible — verificada", "No despegues con los indicadores en la banda amarilla o con menos de 13 galones en cada tanque."],
      ]],
      ["arranque", "Arranque del motor", [
        ["Mezcla — FULL RICH; hélice — HIGH RPM; acelerador — a fondo", "Así se ceba el motor de inyección con la bomba auxiliar."],
        ["Bomba auxiliar — ON hasta que el flujo de combustible llegue al máximo, luego OFF", "Ese es el cebado del IO-520; más tiempo lo ahoga."],
        ["Acelerador — abierto 1/4 de pulgada; llave — START y soltar a BOTH cuando encienda", "Si el motor está caliente y hace más de 90 °F, primero mezcla en CORTE y bomba auxiliar ON de 30 a 60 segundos para quitar vapor."],
        ["Motor de arranque — no más de 30 segundos en cualquier periodo de 4 minutos", "Más tiempo sobrecalienta el motor de arranque."],
        ["Si se ahogó: mezcla CORTE, acelerador abierto, START; al encender, acelerador a ralentí y mezcla FULL RICH", "Girar con el acelerador abierto y sin mezcla despeja el combustible sobrante."],
        ["Acelerador — 1,000 a 1,200 RPM; presión de aceite — verificada", "Sin presión de aceite en los primeros segundos, apaga el motor."],
        ["Alternador — ON; en 2 minutos el amperímetro debe bajar a menos de 25 % de carga; si no, apagar y no despegar", "Un alternador que no carga deja al tren y los flaps eléctricos dependiendo solo de la batería."],
      ]],
      ["rodaje", "Después del arranque y rodaje", [
        ["Frenos — liberar y probar; aviónica y luces — según se requiera", "Confirma que los frenos responden antes de necesitarlos."],
        ["No pasar de 1,200 RPM hasta que el aceite llegue a 75 °F", "Exigirle al motor con el aceite frío acelera su desgaste."],
      ]],
      ["antes-despegue", "Antes de despegue", [
        ["Freno de estacionamiento — puesto; cinturones y arneses — revisados; aviónica, instrumentos del motor y de vuelo — revisados", "Detecta un problema mientras aún estás en tierra."],
        ["Amperímetro — estable entre 0 y 25 % de carga a 1,000–1,200 RPM; bomba auxiliar — OFF", "En el Bonanza la bomba auxiliar va apagada para despegar y aterrizar."],
        ["Acelerador — 1,700 RPM; hélice — ejercitarla (caída de 300 a 400 RPM) y regresar a HIGH RPM", "Mueve aceite caliente por el gobernador para que la hélice responda rápido."],
        ["Magnetos a 1,700 RPM — caída máxima de 150 RPM y diferencia máxima de 50 RPM", "Una caída mayor señala una bujía o magneto fallando."],
        ["Trim — alerón neutral; elevador 0° (3° nariz arriba si solo van ocupados los asientos delanteros)", "Con poco peso atrás, el centro de gravedad queda adelante y hace falta más trim nariz arriba."],
        ["Flaps — probar y dejar UP; puerta y ventanas — aseguradas; controles — libres y en el sentido correcto", "Un control restringido solo se detecta con seguridad en tierra."],
        ["Mezcla — FULL RICH (o la que pida la elevación del campo); frenos — liberados", "En campos altos, una mezcla demasiado rica le quita potencia al despegue."],
      ]],
      ["despegue", "Despegue", [
        ["Potencia — acelerador a fondo y 2,700 RPM; revisar presión de admisión, flujo y RPM al iniciar la carrera", "Es la última oportunidad de detectar que el motor no da toda su potencia."],
        ["Despegue a 71 KIAS; 77 KIAS a 50 ft", "Son las velocidades del manual para el peso máximo."],
        ["Tren — UP con ascenso positivo y cuando ya no quede pista para aterrizar (máximo 154 KIAS)", "Subirlo antes te quita la opción de volver a posarte en la pista si falla el motor."],
        ["Ya libre de obstáculos — velocidad de ascenso deseada", "Vx (77 KIAS) solo para librar obstáculos; después, Vy o ascenso de crucero."],
      ]],
      ["ascenso", "Ascenso", [
        ["Mejor tasa (Vy): 96 KIAS; mejor ángulo (Vx): 77 KIAS; ascenso de crucero: 107 KIAS", "El ascenso de crucero enfría mejor el motor y deja ver hacia adelante."],
        ["Potencia máxima continua: a fondo y 2,700 RPM; ascenso de crucero: 25 in Hg (o a fondo) y 2,500 RPM", "Menos RPM en el ascenso largo reduce el ruido y el desgaste."],
        ["Temperaturas del motor — vigiladas; mezcla — ajustada al flujo de combustible", "El IO-520 se calienta en ascensos largos; los cowl flaps ayudan."],
      ]],
      ["crucero", "Crucero", [
        ["Cowl flaps — cerrados; potencia — según las tablas de crucero; mezcla — ajustada", "Abiertos en crucero solo agregan resistencia."],
        ["Con 75 % o menos, empobrecer con el EGT: 25 °F del lado rico del pico para crucero económico, 100 °F del lado rico para mejor potencia", "Nunca se opera del lado pobre del pico; al cambiar de altitud o potencia hay que volver a buscarlo."],
      ]],
      ["descenso", "Descenso", [
        ["Altímetro — ajustado; cowl flaps — cerrados", "Sin el dato de presión del destino, el altímetro marca una altura distinta a la real."],
        ["Potencia — la necesaria, evitando ralentí prolongado; mezcla — enriquecer", "Un motor frío de golpe sufre (enfriamiento brusco de cilindros)."],
      ]],
      ["antes-aterrizar", "Antes de aterrizar", [
        ["Cinturones y arneses; respaldos verticales; selector — tanque más lleno", "Deja todo listo para un aterrizaje o un motor y al aire."],
        ["Cowl flaps — según se requiera; mezcla — FULL RICH (o según la elevación)", "Necesitas potencia completa inmediata si hace falta un motor y al aire."],
        ["Tren — DOWN bajo 154 KIAS: tres luces verdes, luz roja apagada", "La bocina suena si reduces bajo unas 12 in Hg con el tren arriba: es la última defensa, no el checklist."],
        ["Flaps — DOWN bajo 123 KIAS; aproximación a 70 KIAS; hélice — HIGH RPM; trim eléctrico — OFF", "Extender flaps por encima de esa velocidad excede su límite estructural."],
      ]],
      ["motor-y-al-aire", "Aterrizaje abortado (motor y al aire)", [
        ["Potencia — acelerador a fondo y 2,700 RPM; 70 KIAS hasta librar obstáculos, luego ascenso normal", "Primero se detiene el descenso, luego se limpia el avión."],
        ["Flaps — UP; tren — UP; cowl flaps — OPEN", "En este orden: los flaps son la mayor resistencia; el tren se sube ya con ascenso positivo."],
      ]],
      ["apagado", "Después de aterrizar y apagado", [
        ["Luces — según se requiera; flaps — UP; trim — 0°; cowl flaps — OPEN", "Cuidado de no tocar el interruptor del tren en lugar del de flaps."],
        ["Frenos — puestos; eléctricos y radios — OFF; hélice — HIGH RPM; acelerador — cerrado; mezcla — CORTE", "Así se apaga el motor de inyección: cortando el combustible."],
        ["Magnetos — OFF cuando se detenga; batería y alternador — OFF; seguro de control; calzas puestas y freno liberado si queda solo", "Con cambios de temperatura, el freno de estacionamiento puede soltarse o apretar de más."],
      ]],
    ]),
    emergencia: fases("v35e", [
      ["falla-carrera", "Falla de motor en la carrera de despegue", [
        ["Acelerador — cerrado; frenos — al máximo", "Detener el avión en la pista restante es lo más seguro."],
        ["Selector de combustible — OFF; batería y alternador — OFF", "Corta combustible y electricidad para reducir el riesgo de incendio."],
      ]],
      ["falla-despegue-vuelo", "Falla de motor después del despegue o en vuelo", [
        ["Normalmente conviene aterrizar recto al frente", "A baja altura, un viraje sin motor puede terminar en una pérdida."],
        ["Con altura para maniobrar: selector al otro tanque (sintiendo el retén); bomba auxiliar ON; mezcla FULL RICH y luego empobrecer según se requiera", "Las causas más probables son falta de flujo de combustible, encendido o toma de aire bloqueada."],
        ["Magnetos en LEFT y RIGHT, luego BOTH; aire alterno — jalar y soltar la manija T", "Descarta un magneto fallando o una toma de aire obstruida."],
        ["Si no reenciende: elegir el mejor campo y aterrizar sin motor; bajar el tren o no según el terreno", "En terreno blando o irregular, aterrizar con el tren arriba evita que una pata se clave."],
      ]],
      ["motor-aspero", "Motor áspero o pérdida de potencia", [
        ["Motor áspero: mezcla FULL RICH y luego empobrecer; magnetos L, R y BOTH; aire alterno — jalar y soltar", "Aísla si el problema es la mezcla, un magneto o la admisión."],
        ["Pérdida de potencia: revisar el flujo de combustible; si está bajo, mezcla FULL RICH y bomba auxiliar ON (apagarla si no mejora en unos momentos)", "La bomba auxiliar da casi toda la potencia si falla la bomba del motor."],
        ["Revisar que el tanque en uso tenga combustible; si está vacío, selector al otro tanque (sintiendo el retén y viéndolo)", "Es la causa más simple de una pérdida de potencia."],
      ]],
      ["reencendido", "Reencendido en vuelo", [
        ["Selector — tanque más lleno (sintiendo el retén); acelerador — atrás; mezcla — FULL RICH", "Prepara el motor como en un arranque, con combustible del tanque que más tiene."],
        ["Bomba auxiliar — ON hasta recuperar la potencia, luego OFF (dejarla si falló la bomba del motor)", "Restablece la presión de combustible mientras la hélice sigue girando por el viento."],
        ["Acelerador — avanzar a la potencia deseada; mezcla — empobrecer según se requiera", "Regresa el motor a su operación normal."],
      ]],
      ["fuego", "Fuego de motor", [
        ["En vuelo: control FIREWALL AIR — jalar para cerrar; mezcla — CORTE; selector — OFF", "Cierra las salidas de calefacción para que no entre humo a la cabina y corta el combustible."],
        ["Batería, alternador y magnetos — OFF; el tren se puede bajar con la manivela; no intentar reencender", "Sin electricidad el tren no baja eléctricamente, pero la manivela sí funciona."],
        ["En tierra: mezcla CORTE, selector OFF, batería, alternador y magnetos OFF; apagar con el extintor", "Corta toda fuente de combustible y chispa."],
      ]],
      ["planeo", "Configuración de máximo planeo", [
        ["Tren — UP; flaps — UP; cowl flaps — cerrados; hélice — LOW RPM (jalar)", "Cada uno quita resistencia; la hélice en paso grueso resiste menos al viento."],
        ["Velocidad — 105 KIAS", "Da unas 1.7 millas náuticas por cada 1,000 ft sobre el terreno."],
      ]],
      ["descenso-emergencia", "Descenso de emergencia", [
        ["Potencia — ralentí; hélice — HIGH RPM; tren — DOWN; velocidad — 154 KIAS", "El tren abajo agrega resistencia y te deja bajar rápido sin exceder las velocidades."],
      ]],
      ["aterrizaje-sin-motor", "Aterrizaje sin motor", [
        ["En final, ya seguro de llegar: 83 KIAS", "Es más rápido que lo normal para tener control en el flare sin motor."],
        ["Selector — OFF; mezcla — CORTE; magnetos — OFF; flaps — según se requiera", "Reduce el riesgo de incendio en el impacto."],
        ["Tren — DOWN o UP según el terreno; batería y alternador — OFF", "Decide el tren antes de apagar la batería: sin electricidad ya no se mueve."],
      ]],
      ["aterrizaje-tren-arriba", "Aterrizaje con el tren arriba (con motor)", [
        ["De ser posible, pasto firme o pista con espuma; aproximación normal con flaps", "Una superficie blanda reduce el daño."],
        ["Ya seguro de llegar: acelerador cerrado, mezcla CORTE, batería, alternador y magnetos OFF, selector OFF", "Corta combustible y electricidad antes del contacto."],
        ["Alas niveladas al tocar; salir del avión en cuanto se detenga", "Un ala baja puede hacer girar al avión al rozar el suelo."],
      ]],
      ["sobrevelocidad-helice", "Sobrevelocidad de la hélice", [
        ["Acelerador — retardar hasta la línea roja; velocidad — reducir; presión de aceite — revisar", "Si la causa fue perder la presión de aceite, el motor se trabará poco después."],
        ["Aterrizar en el sitio adecuado más cercano", "Sin gobernador confiable, el motor puede fallar."],
      ]],
      ["electrica", "Falla y sobrevoltaje del alternador", [
        ["Luz ALT-OUT: todo lo eléctrico que no sea esencial — OFF", "Todo el sistema queda en la batería; ahorrarla te deja el tren, los flaps y las radios."],
        ["Sobrevoltaje: batería y alternador OFF un momento y luego ON (reinicia el relevador)", "Si no se repite, se sigue usando el alternador."],
        ["Si persiste: alternador OFF y equipo no esencial OFF", "Protege la batería y el resto del sistema."],
      ]],
      ["trim-electrico", "Trim eléctrico descontrolado", [
        ["Actitud — mantener con el control; interruptor del trim en el volante — en sentido contrario (abre el breaker)", "Primero se controla el avión, luego se corta el trim."],
        ["Trim eléctrico ON-OFF — OFF; trim manual — ajustar", "No vuelvas a usarlo hasta encontrar la causa."],
      ]],
      ["tren-manual", "Extensión manual del tren", [
        ["Reducir la velocidad; breaker LDG GEAR — jalarlo (OFF); palanca del tren — DOWN", "Con el motor del tren desconectado, la manivela puede moverlo sin pelear contra él."],
        ["Manivela (detrás de los asientos delanteros) — enganchar y girar en sentido antihorario hasta el tope (unas 50 vueltas)", "La manivela solo baja el tren: nunca intentes subirlo a mano."],
        ["Si hay electricidad: revisar luces del tren y bocina; desenganchar la manivela y guardarla", "Nunca operes el tren eléctricamente con la manivela enganchada: se daña el mecanismo."],
        ["Después: no mover controles del tren ni reiniciar breakers hasta que el avión esté en gatos", "La falla pudo estar en el circuito de subida, y el tren podría subir en tierra."],
      ]],
      ["estatica", "Fuente estática de emergencia", [
        ["Fuente estática del piloto — ON EMERGENCY; corregir velocidad y altitud con las tablas del manual", "Úsala si el variómetro responde lento o raro: señal de tomas estáticas tapadas."],
        ["Regresarla a NORMAL cuando ya no se necesite", "Leer siempre de la fuente de emergencia introduce errores de calibración."],
      ]],
      ["puerta-barrena", "Puerta abierta y barrena", [
        ["Puerta sin seguro en vuelo: se queda unas 3 pulgadas abierta y solo reduce el ascenso; regresar al campo normal", "El avión vuela bien así; lo peligroso es distraerse intentando cerrarla."],
        ["Barrena (prohibida): control a fondo adelante y timón a fondo contra el giro, alerones neutros y acelerador en ralentí; al detenerse, neutralizar y recuperar suave", "Mantener la posición hasta que la rotación se detenga."],
        ["Reducción de velocidad de emergencia: bajar el tren, por ejemplo con desorientación en nubes o turbulencia fuerte", "Si se usa por encima de 154 KIAS, las compuertas del tren requieren inspección."],
      ]],
    ]),
    flujos: flujos("v35", [
      ["falla-motor", "Falla de motor en vuelo", ["Otro tanque (sentir el retén)", "Bomba auxiliar ON", "Mezcla FULL RICH", "Magnetos L, R y BOTH", "Aire alterno: jalar y soltar"]],
      ["tren-manual", "Extensión manual del tren", ["Breaker LDG GEAR: OFF", "Palanca del tren: DOWN", "Manivela: antihorario, ~50 vueltas", "Revisar luces y bocina", "Guardar la manivela"]],
      ["fuego-motor", "Fuego de motor en vuelo", ["FIREWALL AIR: cerrar", "Mezcla CORTE", "Selector OFF", "Batería, alternador y magnetos OFF", "No reencender; aterrizar"]],
    ]),
    vspeeds: [
      { clave: "Vlof", nombre: "Despegue (lift-off)", valor: "71 kt (77 kt a 50 ft)" },
      { clave: "Vx", nombre: "Mejor ángulo de ascenso", valor: "77 kt" },
      { clave: "Vy", nombre: "Mejor tasa de ascenso", valor: "96 kt" },
      { clave: "Vcc", nombre: "Ascenso de crucero", valor: "107 kt" },
      { clave: "Va", nombre: "Velocidad de maniobra (y aire turbulento)", valor: "134 kt" },
      { clave: "Vfe", nombre: "Máxima con flaps extendidos", valor: "123 kt" },
      { clave: "Vle", nombre: "Máxima con el tren abajo o para operarlo", valor: "154 kt" },
      { clave: "Vno", nombre: "Máxima estructural normal", valor: "167 kt" },
      { clave: "Vne", nombre: "Nunca exceder", valor: "196 kt" },
      { clave: "Vglide", nombre: "Mejor planeo", valor: "105 kt" },
      { clave: "Vapp", nombre: "Aproximación normal / aterrizaje abortado", valor: "70 kt" },
      { clave: "Vemer", nombre: "Aproximación sin motor", valor: "83 kt" },
      { clave: "Vs0", nombre: "Pérdida, flaps abajo (inicio del arco blanco)", valor: "52 kt" },
      { clave: "Vs1", nombre: "Pérdida, flaps arriba (inicio del arco verde)", valor: "64 kt" },
      { clave: "Vxw", nombre: "Viento cruzado demostrado", valor: "17 kt" },
    ],
    notaVspeeds: "Valores del manual del fabricante, en KIAS, para el V35B (D-8872 en adelante; los anteriores tienen Vfe de 117 kt y Vle de 145 kt). Confirma los de tu avión y los de tu versión del simulador.",
    limites: {
      titulo: "Límites de operación",
      nota: "Del POH del Bonanza V35/V35A/V35B, motor Continental IO-520-B de 285 hp. El límite oficial siempre es el de tu manual y tu simulador.",
      columnas: ["Límite", "Valor"],
      filas: [
        ["Peso máximo de despegue y aterrizaje", "3,400 lb (3,412 lb de rampa)"],
        ["Compartimento de equipaje", "270 lb de capacidad estructural (según peso y balance)"],
        ["Categoría y factor de carga", "Utilitaria: +4.4 g con flaps arriba, +2.0 g con flaps abajo"],
        ["Maniobras", "Barrenas prohibidas; chandelle, viraje escarpado y ocho perezoso entrando a 134 kt"],
        ["RPM máxima", "2,700 RPM"],
        ["Presión de admisión máxima", "29.6 in Hg"],
        ["Temperatura de cabezas de cilindro", "460 °F máxima"],
        ["Aceite", "240 °F máxima · 30–100 PSI (30–60 normal) · 12 cuartos de capacidad"],
        ["Combustible utilizable", "44 gal (estándar) o 74 gal (opcional)"],
        ["Mínimo para despegar", "Fuera de la banda amarilla y al menos 13 gal en cada tanque"],
        ["Deslizamiento máximo", "30 s con tanques con deflectores (20 s sin ellos)"],
        ["Vuelo en hielo", "Prohibido"],
      ],
    },
    sistemas: [
      {
        titulo: "Cola en V",
        texto: "Dos superficies en forma de V hacen el trabajo del elevador y del timón: se mueven juntas para cabeceo y en sentido opuesto para guiñada. Para el piloto los controles funcionan como en cualquier avión, pero en el prevuelo un daño en una de las dos afecta a los dos ejes.",
      },
      {
        titulo: "Tren retráctil eléctrico",
        texto: "Un motor eléctrico mueve el tren por varillas. Tres luces verdes indican tren abajo y trabado, la roja indica tránsito, y todas apagadas, tren arriba. Un interruptor en el amortiguador evita que suba en tierra, pero no se debe confiar en él. La bocina suena con el tren arriba bajo unas 12 in Hg. Si falla el sistema, una manivela detrás de los asientos lo baja en unas 50 vueltas; solo sirve para bajarlo.",
      },
      {
        titulo: "Combustible e inyección",
        texto: "Dos tanques de hule en las alas y un selector IZQUIERDO / DERECHO / OFF, sin AMBOS; entre retenes no pasa combustible. El motor de inyección devuelve unos 10 gal/h al tanque en uso. La bomba auxiliar sirve para arrancar y como respaldo: se despega y se aterriza con ella apagada, salvo pérdida de presión de combustible.",
      },
      {
        titulo: "Flaps, cowl flaps y eléctrico",
        texto: "Los flaps son eléctricos, con un interruptor UP / OFF / DOWN que se jala del retén; se dejan en posiciones intermedias poniéndolo en OFF. Los cowl flaps se abren en tierra, en el despegue y en el ascenso, y se cierran en crucero y en el descenso. Un alternador de 70 A y una batería de 12 V alimentan todo; la luz ALT-OUT avisa si el alternador deja de cargar.",
      },
    ],
  },

  a36: {
    id: "a36",
    nombre: "Beechcraft A36TC Bonanza",
    nota: `Seis plazas con tren retráctil eléctrico, flaps de tres posiciones (0°, 15° y 30°) y motor Continental TSIO-520-UB de 300 hp con turbocargador, a inyección. El turbo mantiene la presión de admisión con la altitud y se vigila con la temperatura de entrada a la turbina (TIT). Selector de combustible por tanque, sin posición AMBOS. ${avisoPoh("Beechcraft Bonanza A36TC, POH P/N 36-590003-3, con el kit 36-9008-1 del boletín SB 2033")} Las velocidades están en KIAS.`,
    normal: fases("a36n", [
      ["prevuelo", "Inspección prevuelo", [
        ["Cabina: freno de estacionamiento — puesto; seguro de control — retirado; todos los interruptores — OFF; oxígeno y mascarillas — revisados", "El A36TC sube a 25,000 ft: sin oxígeno suficiente, el techo real es mucho más bajo."],
        ["Fuselaje derecho: puerta de carga asegurada; toma estática libre; ELT armado", "Una puerta de carga mal cerrada puede abrirse en vuelo."],
        ["Cola: superficies de control, amarre, luz y toma de aire de cabina", "Un daño en el timón o el elevador solo se ve en tierra."],
        ["Fuselaje izquierdo: toma estática libre, antenas, salida de aire de cabina", "El sistema estático usa las dos tomas."],
        ["Ala izquierda: flap, alerón, tabs ajustables, punta y luz; aviso de pérdida; pitot sin cubierta; combustible a la vista y tapa segura", "El nivel en el tanque confirma lo que marcan los indicadores."],
        ["Tren izquierdo: compuerta, llanta y amortiguador; venteo; sumidero del tanque y sumidero del selector (bajo la tapa del fuselaje) — drenados", "Son tres drenados: uno por tanque y el del selector."],
        ["Nariz: rejillas de enfriamiento libres, aceite (10 cuartos mínimo para volar) y tapa segura, cofia, hélice, tren de nariz, luces, toma de aire libre", "Con el turbo, el aceite también mueve la compuerta (wastegate): es aún más crítico."],
        ["Tren derecho y ala derecha: mismo recorrido; nunca rodar con un amortiguador desinflado", "Un amortiguador bajo puede dañar el mecanismo del tren retráctil."],
      ]],
      ["antes-arrancar", "Antes de arrancar", [
        ["Asientos trabados, respaldos verticales; pedales ajustados; cinturones y arneses; freno de estacionamiento — puesto", "Todos los asientos ocupados deben ir verticales en despegue y aterrizaje."],
        ["Manivela de emergencia del tren — guardada; aviónica — OFF; breakers — adentro; palanca del tren — DOWN", "Operar el tren eléctricamente con la manivela enganchada daña el mecanismo."],
        ["Hélice — HIGH RPM; bomba auxiliar — OFF; acelerador — cerrado; mezcla — FULL RICH; flaps — UP", "Deja el motor listo para el cebado."],
        ["Trim eléctrico y piloto automático — OFF; fuente estática — NORMAL", "Evita movimientos inesperados de los controles al energizar."],
        ["Batería y alternador — ON; combustible — revisado; selector — probar y dejar en el tanque más lleno", "No despegues en la banda amarilla ni con menos de 13 gal por tanque; entre retenes del selector no pasa combustible."],
      ]],
      ["arranque", "Arranque del motor", [
        ["Mezcla — FULL RICH; hélice — HIGH RPM; acelerador — a fondo", "Prepara el cebado con la bomba auxiliar."],
        ["Bomba auxiliar — LOW (escuchar que funcione), OFF; luego HI hasta que el flujo llegue al máximo, OFF", "Ese es el cebado; un motor caliente puede no necesitarlo o solo necesitar LOW."],
        ["Acelerador — cerrado y avanzarlo despacio mientras gira; llave — START, soltar a BOTH al encender", "Abrir de más al encender puede hacer que el motor se acelere de golpe."],
        ["Motor de arranque — máximo 30 segundos en cualquier periodo de 4 minutos", "Más tiempo sobrecalienta el motor de arranque."],
        ["Si se ahogó: mezcla CORTE, acelerador abierto, START; al encender, acelerador a ralentí y mezcla FULL RICH", "Despeja el combustible sobrante de los cilindros."],
        ["1,000–1,200 RPM; presión de aceite sobre la raya roja (10 PSI) en menos de 30 segundos", "Sin presión de aceite, el motor se está quedando sin lubricación."],
        ["Alternador — ON y cargando; luz de motor de arranque energizado apagada tras el arranque", "Si esa luz sigue encendida en tierra: batería y alternador OFF, y no despegar."],
        ["Aceite a 24 °C o más y presión en verde antes de pasar de 1,200 RPM", "Exigirle al motor con aceite frío acelera su desgaste."],
      ]],
      ["antes-despegue", "Antes de despegue", [
        ["Freno de estacionamiento — puesto; cinturones; radios, instrumentos de vuelo y del motor — revisados", "Detecta un problema mientras aún estás en tierra."],
        ["Luces de aviso — probadas (alternador, motor de arranque, puerta de carga, tren)", "Confirma que el sistema de alertas funciona."],
        ["Acelerador a 1,700 RPM; hélice — ejercitarla (caída de 300 a 400 RPM) y regresar a HIGH RPM", "Mueve aceite caliente por el gobernador."],
        ["Magnetos a 1,700 RPM — caída máxima 150 RPM, diferencia máxima 50 RPM; bomba auxiliar — OFF", "Una caída mayor señala una bujía o magneto fallando."],
        ["Trim — alerón neutral; elevador 3° nariz arriba (6° si solo van ocupados los asientos delanteros); flaps — 0° o 15°", "Con poco peso atrás hace falta más trim nariz arriba."],
        ["Puertas y ventanas — aseguradas; controles — libres; mezcla — FULL RICH; frenos — liberados", "Última revisión antes de la carrera."],
      ]],
      ["despegue", "Despegue", [
        ["Potencia de despegue antes de soltar los frenos: 36.0 in Hg y 2,700 RPM", "Con aceite entre 24 y 38 °C la admisión puede pasar 1 a 2 in Hg por unos minutos; lo recomendado es despegar con 38 °C."],
        ["Flujo de combustible — FULL RICH, 32.5 a 34.2 gph; nunca despegar con la bomba auxiliar en HI", "Demasiado flujo puede apagar el motor en la carrera; si pasa de la raya roja (34.2 gph), empobrecer hasta ella."],
        ["Rotación: 74 KIAS con flaps 0° o 67 KIAS con flaps 15°", "Son las velocidades del manual con el peso máximo."],
        ["Tren — UP con ascenso positivo; 110 KIAS ya libre de obstáculos", "Subirlo antes te quita la opción de volver a la pista."],
      ]],
      ["ascenso", "Ascenso", [
        ["Máxima continua: 36.0 in Hg y 2,700 RPM, FULL RICH con 32.5 a 34.2 gph, a 110 KIAS", "El turbo sostiene esa admisión hasta la altitud crítica, unos 19,000 ft."],
        ["Ascenso de crucero: 34.0 in Hg y 2,600 RPM, 28 a 31 gph, a 120 KIAS", "Enfría mejor el motor y deja ver hacia adelante."],
        ["Bomba auxiliar — OFF; si el flujo fluctúa o baja del programa, LOW y empobrecer", "Con combustible sobre 110 °F puede haber vapor; si no mejora, nivelar y reducir potencia."],
        ["Oxígeno — ON según se requiera; revisar el flujo de las mascarillas", "En un avión con turbo es fácil subir más alto de lo que el cuerpo aguanta sin oxígeno."],
      ]],
      ["crucero", "Crucero", [
        ["Potencia: máximo 31 in Hg y 2,400 RPM; recomendadas 29/2,400, 28/2,300 o 24/2,300; económica 23/2,200", "Se elige según velocidad, consumo y temperatura del motor."],
        ["Bomba auxiliar — OFF (LOW si el flujo fluctúa); mezcla — empobrecer al pico de TIT sin pasar de 1,650 °F", "No se empobrece más allá del pico; el indicador tarda, así que vuelve a revisar después del ajuste."],
        ["Antes de subir la potencia o apagar la bomba auxiliar ya empobrecido: mezcla — FULL RICH", "Subir potencia con la mezcla pobre sobrecalienta el motor."],
        ["Mezcla — reajustar tras cualquier cambio de altitud", "Aunque no cambies la potencia, la altitud cambia la mezcla correcta."],
      ]],
      ["descenso", "Descenso", [
        ["Altímetro — ajustado; desempañador — ON antes de bajar a aire cálido y húmedo", "Evita que el parabrisas se empañe justo en la aproximación."],
        ["Potencia mínima recomendada: 2,200 RPM y 18 in Hg; 150 KIAS dan unos 1,000 ft/min", "Evita el ralentí prolongado y el enfriamiento brusco de los cilindros."],
        ["Mezcla — al pico de TIT (máximo 1,650 °F); enriquecer si sube la admisión", "Mantiene la mezcla correcta mientras bajas."],
        ["Sobre 18,000 ft, llevar el acelerador a ralentí puede apagar el motor", "Bajo esa altitud basta avanzar el acelerador; arriba hay que seguir el procedimiento de emergencia."],
      ]],
      ["antes-aterrizar", "Antes de aterrizar", [
        ["Cinturones y arneses; respaldos verticales; selector — tanque más lleno; mezcla — FULL RICH; bomba auxiliar — OFF", "Deja todo listo para un aterrizaje o un motor y al aire."],
        ["Flaps — APPROACH (15°) bajo 152 KIAS; tren — DOWN bajo 152 KIAS: tres verdes y roja apagada", "La bocina suena con el tren arriba al reducir bajo unas 17 in Hg."],
        ["Flaps — DOWN (30°) bajo 123 KIAS; aproximación a 77 KIAS (86 KIAS con flaps arriba); hélice — HIGH RPM", "Los flaps solo tienen tres posiciones: 0°, 15° y 30°."],
      ]],
      ["motor-y-al-aire", "Aterrizaje abortado (motor y al aire)", [
        ["Hélice — HIGH RPM; acelerador — 36.0 in Hg; 77 KIAS", "Primero se detiene el descenso."],
        ["Flaps — UP; tren — UP", "Los flaps son la mayor resistencia; el tren se sube ya con ascenso positivo."],
      ]],
      ["apagado", "Después de aterrizar y apagado", [
        ["Luces — según se requiera; flaps — UP; trim — 3° nariz arriba", "Deja el trim listo para el siguiente despegue."],
        ["Motor en ralentí 4 minutos antes de apagarlo (el rodaje cuenta)", "Deja que se estabilice la temperatura del turbo; apagarlo caliente cocina el aceite en sus cojinetes."],
        ["Frenos — puestos; eléctricos y radios — OFF; acelerador — cerrado; mezcla — CORTE; magnetos — OFF al detenerse", "Así se apaga el motor de inyección: cortando el combustible."],
        ["Batería y alternador — OFF; seguro de control; calzas puestas y freno liberado si queda solo", "Con cambios de temperatura el freno puede soltarse o apretar de más."],
      ]],
    ]),
    emergencia: fases("a36e", [
      ["falla-carrera", "Falla de motor en la carrera de despegue", [
        ["Acelerador — cerrado; frenos — al máximo (sin trabar las ruedas); selector — OFF; batería y alternador — OFF", "El frenado es más efectivo si las ruedas no se traban."],
      ]],
      ["falla-despegue", "Falla o pérdida de potencia justo después de despegar", [
        ["Normalmente conviene aterrizar recto al frente; evitar virajes bruscos", "Un viraje escarpado sin motor puede terminar en una pérdida."],
        ["Si parece falta de combustible (tanque vacío o flujo en cero): selector al otro tanque (sintiendo el retén) y bomba auxiliar LOW", "Es la causa más probable."],
        ["Si parece falla de la bomba del motor (flujo en cero): bomba auxiliar HI; mezcla pobre hasta que encienda y luego FULL RICH", "HI solo se usa para cebar o si falló la bomba del motor: con la bomba del motor sana ahoga el motor."],
        ["Con la bomba del motor fallada: retardar el acelerador para mantener la TIT en 1,650 °F o menos, empobreciendo a mano; no llevarlo a ralentí hasta tener asegurado el aterrizaje", "Con la mezcla muy rica, el motor puede apagarse en el flare y ya no habría motor y al aire."],
        ["Encendido: magnetos en BOTH; filtro bloqueado: aire alterno — jalar y soltar", "Descarta encendido y admisión."],
        ["Si reenciende: aterrizar en cuanto sea práctico; si no: aterrizar sin motor, con el tren según el terreno", "La causa sigue ahí aunque el motor haya vuelto."],
      ]],
      ["motor-aspero", "Motor áspero justo después de despegar", [
        ["Bomba auxiliar — asegurarse de que no esté en HI", "HI con la bomba del motor sana enriquece de más."],
        ["Mezcla: flujo bajo → FULL RICH (32.5 a 34.2 gph); flujo alto → empobrecer a 32.5 a 34.2 gph", "Ese es el rango de flujo del manual a potencia de despegue."],
        ["Magnetos — BOTH; aterrizar en cuanto sea práctico", "No vale la pena seguir el vuelo con un motor que falla."],
      ]],
      ["falla-vuelo", "Falla de motor en vuelo", [
        ["Determinar la causa antes de reencender; no usar el motor de arranque sobre 20,000 ft", "Las cuatro causas más probables: sin combustible, bomba del motor fallada, acelerador a ralentí sobre 18,000 ft y toma de aire bloqueada."],
        ["Sin combustible: selector al otro tanque (retén y vista) y bomba auxiliar LOW", "Restablece el flujo desde un tanque con combustible."],
        ["Bomba del motor fallada: bomba auxiliar HI, mezcla pobre hasta que encienda y luego FULL RICH, acelerador para TIT ≤ 1,650 °F; aterrizar pronto", "La bomba auxiliar no da flujo suficiente para potencias altas."],
        ["Acelerador a ralentí sobre 18,000 ft sin reencendido: bomba auxiliar OFF, acelerador a la mitad, hélice HIGH RPM, mezcla pobre hasta que encienda y luego FULL RICH", "Bajo 18,000 ft basta con avanzar el acelerador."],
        ["Toma de aire bloqueada: aire alterno — jalar y soltar", "Con el filtro tapado, el aire alterno da la potencia continua hasta unos 13,000 ft; arriba baja cerca de 1 in Hg cada 1,000 ft."],
      ]],
      ["turbo", "Falla del sistema de turbo", [
        ["Tratarla siempre como grave: puede terminar en falla de motor o fuego", "Incluye turbina, compresor, compuerta (wastegate), controlador, válvula de sobrepresión, líneas de aceite y ductos."],
        ["Síntomas: pérdida parcial o total de potencia, admisión que no corresponde al acelerador, humo o vapores, fuego, presión de aceite baja", "Cualquiera de ellos basta para sospechar."],
        ["En tierra: no despegar. En vuelo: aterrizar en el aeropuerto adecuado más cercano; con humo, vapores o fuego, lo antes posible con la mínima potencia", "Un turbo con fuga puede incendiar el compartimento del motor."],
        ["Pérdida total por mezcla incorrecta: bomba auxiliar OFF, mezcla CORTE, hélice HIGH RPM, acelerador a la mitad, avanzar la mezcla hasta que encienda", "Puede recuperar la potencia si el problema era la relación aire/combustible."],
        ["Admisión anormalmente alta: retardar el acelerador para mantenerla dentro de los límites y aterrizar en el más cercano", "Pasar de 36.0 in Hg puede dañar el motor."],
      ]],
      ["fuego", "Fuego de motor", [
        ["En vuelo: FIREWALL AIR — jalar para cerrar; selector — OFF; mezcla — CORTE; batería, alternador y magnetos — OFF", "Cierra la entrada de humo a la cabina y corta combustible y chispa."],
        ["El tren se puede bajar con la manivela; no intentar reencender; seguir descenso de emergencia, planeo y aterrizaje sin motor", "Sin electricidad, la manivela es la única forma de bajar el tren."],
        ["En tierra: selector OFF, mezcla CORTE, batería, alternador y magnetos OFF; usar el extintor", "Corta toda fuente de combustible y chispa."],
      ]],
      ["descenso-emergencia", "Descenso de emergencia", [
        ["Potencia — ralentí; hélice — HIGH RPM; tren — DOWN; flaps — 15°", "El tren y los flaps de aproximación agregan resistencia."],
        ["Velocidad — 152 KIAS (137 KIAS sobre 20,000 ft)", "Sobre 20,000 ft los límites del tren y los flaps bajan a 137 KIAS."],
      ]],
      ["planeo", "Configuración de máximo planeo", [
        ["Tren — UP; flaps — UP; hélice — LOW RPM (jalar); velocidad — 110 KIAS", "Da unas 1.7 millas náuticas por cada 1,000 ft sobre el terreno."],
        ["Equipo eléctrico no esencial — OFF", "Ahorra batería para el tren, los flaps y las radios."],
      ]],
      ["aterrizaje-sin-motor", "Aterrizaje sin motor", [
        ["Ya seguro de llegar: selector OFF, mezcla CORTE, magnetos OFF", "Reduce el riesgo de incendio en el impacto."],
        ["Flaps — DOWN (30°); tren — DOWN o UP según el terreno; 80 KIAS", "Decide el tren antes de apagar la batería."],
        ["Batería y alternador — OFF", "Sin electricidad, el tren y los flaps ya no se mueven."],
      ]],
      ["tren-arriba", "Aterrizaje con el tren arriba (con motor)", [
        ["De ser posible, pasto firme o pista con espuma; aproximación normal con flaps", "Una superficie blanda reduce el daño."],
        ["Ya seguro de llegar: acelerador cerrado, mezcla CORTE, batería, alternador y magnetos OFF, selector OFF", "Corta combustible y electricidad antes del contacto."],
        ["Alas niveladas al tocar; salir del avión en cuanto se detenga", "Un ala baja puede hacer girar al avión al rozar el suelo."],
      ]],
      ["oxigeno", "Pérdida de oxígeno", [
        ["Descender a una altitud donde no se necesite oxígeno", "Conciencia útil: 3 a 5 minutos a 25,000 ft, 5 a 10 a 22,000 ft y 30 o más entre 12,000 y 18,000 ft."],
      ]],
      ["bomba-auxiliar", "Falla de la bomba auxiliar", [
        ["Mezcla — FULL RICH; potencia — reducir para mantener la TIT dentro de límites", "El flujo puede bajar y fluctuar, sobre todo alto, con potencia alta y combustible caliente."],
        ["Si el flujo sigue fluctuando: descender; reajustar la mezcla; aterrizar en cuanto sea práctico", "A menor altitud se reduce el vapor en el combustible."],
      ]],
      ["electrica", "Sistema eléctrico", [
        ["Luz de alternador: confirmar descarga en el amperímetro; alternador OFF un momento y luego ON (reinicia el relevador)", "Sin descarga en el amperímetro, lo que falla es la luz: deja el alternador encendido."],
        ["Si la luz vuelve: alternador OFF y equipo no esencial OFF", "Todo, menos el encendido del motor, queda en la batería."],
        ["Motor de arranque energizado en vuelo tras un reencendido: batería y alternador OFF y aterrizar en cuanto sea práctico", "Seguir alimentándolo agota el sistema eléctrico."],
        ["Humo o fuego eléctrico: batería y alternador OFF, oxígeno según se requiera, todo OFF, luego batería y alternador ON y encender lo esencial uno por uno", "Así se aísla el equipo con falla; ventila solo cuando el fuego esté apagado."],
      ]],
      ["sobrevelocidad-helice", "Sobrevelocidad de la hélice", [
        ["Acelerador — retardar; velocidad — reducir hasta 2,700 RPM o menos; presión de aceite — revisar", "Si se perdió la presión de aceite, el motor se trabará poco después."],
        ["Aterrizar en cuanto sea práctico", "Sin aceite, la hélice se va a RPM altas y el motor falla."],
      ]],
      ["tren-manual", "Extensión manual del tren", [
        ["Velocidad — 152 KIAS o menos (lo más baja práctica); breaker LDG GR MOTOR — OFF; palanca del tren — DOWN", "Con el motor del tren desconectado, la manivela puede moverlo."],
        ["Manivela (detrás de los asientos delanteros) — enganchar y girar en sentido antihorario hasta el tope (unas 50 vueltas)", "Solo baja el tren: nunca intentes subirlo a mano."],
        ["Sin sistema eléctrico: breaker LDG GR RELAY adentro, revisar luces DWN y que la bocina no suene con el acelerador a ralentí; desenganchar y guardar la manivela", "Confirma que el tren quedó abajo y trabado."],
        ["Después: no mover controles del tren ni reiniciar breakers hasta que el avión esté en gatos", "La falla pudo estar en el circuito de subida."],
      ]],
      ["otros", "Estática, puerta, barrena y reducción de velocidad", [
        ["Tomas estáticas tapadas (variómetro lento): fuente estática del piloto — ON EMERGENCY y corregir con las tablas; regresarla a NORMAL después", "En emergencia promedia la presión estática con la de la cabina."],
        ["Puerta sin seguro en vuelo: queda unas 3 pulgadas abierta y solo reduce el ascenso; regresar al campo normal", "Lo peligroso es distraerse intentando cerrarla."],
        ["Barrena (prohibida): control a fondo adelante y timón a fondo contra el giro, alerones neutros, acelerador en ralentí; al detenerse, neutralizar y recuperar suave", "Mantener la posición hasta que la rotación se detenga."],
        ["Reducción de velocidad de emergencia: bajar el tren (desorientación en nubes, turbulencia fuerte)", "Si se usa sobre la velocidad máxima del tren, las compuertas requieren inspección."],
      ]],
    ]),
    flujos: flujos("a36", [
      ["falla-motor", "Falla de motor en vuelo", ["Otro tanque y bomba auxiliar LOW", "Flujo en cero: bomba auxiliar HI", "Mezcla pobre hasta encender, luego RICH", "Magnetos BOTH", "Aire alterno: jalar y soltar"]],
      ["tren-manual", "Extensión manual del tren", ["152 KIAS o menos", "Breaker LDG GR MOTOR: OFF", "Palanca del tren: DOWN", "Manivela: antihorario, ~50 vueltas", "Revisar luces DWN y guardar la manivela"]],
      ["fuego-motor", "Fuego de motor en vuelo", ["FIREWALL AIR: cerrar", "Selector OFF", "Mezcla CORTE", "Batería, alternador y magnetos OFF", "No reencender; aterrizar"]],
    ]),
    vspeeds: [
      { clave: "Vr", nombre: "Rotación", valor: "74 kt con flaps 0° · 67 kt con flaps 15°" },
      { clave: "V50", nombre: "Velocidad a 50 ft", valor: "81 kt con flaps 0° · 74 kt con flaps 15°" },
      { clave: "Vx", nombre: "Mejor ángulo de ascenso", valor: "80 kt" },
      { clave: "Vy", nombre: "Mejor tasa de ascenso", valor: "110 kt" },
      { clave: "Vcc", nombre: "Ascenso de crucero", valor: "120 kt" },
      { clave: "Va", nombre: "Velocidad de maniobra (y aire turbulento)", valor: "139 kt" },
      { clave: "Vfe", nombre: "Máxima con flaps", valor: "152 kt con 15° (137 kt sobre 20,000 ft) · 123 kt con 30°" },
      { clave: "Vle", nombre: "Máxima con el tren abajo o para operarlo", valor: "152 kt (137 kt sobre 20,000 ft)" },
      { clave: "Vno", nombre: "Máxima estructural normal", valor: "165 kt (−3 kt cada 1,000 ft sobre 16,000 ft)" },
      { clave: "Vne", nombre: "Nunca exceder", valor: "203 kt (−4 kt cada 1,000 ft sobre 16,000 ft)" },
      { clave: "Vglide", nombre: "Máximo planeo", valor: "110 kt" },
      { clave: "Vapp", nombre: "Aproximación normal", valor: "77 kt con flaps · 86 kt sin flaps" },
      { clave: "Vemer", nombre: "Aproximación sin motor", valor: "80 kt" },
      { clave: "Vs0", nombre: "Pérdida, flaps abajo (inicio del arco blanco)", valor: "57 kt" },
      { clave: "Vs1", nombre: "Pérdida, flaps arriba (inicio del arco verde)", valor: "67 kt" },
      { clave: "Vxw", nombre: "Viento cruzado demostrado", valor: "17 kt" },
    ],
    notaVspeeds: "Valores del manual del fabricante, en KIAS, con 3,650 lb. Varias bajan con la altitud. Confirma los de tu avión y los de tu versión del simulador.",
    limites: {
      titulo: "Límites de operación",
      nota: "Del POH del Bonanza A36TC (36-590003-3), motor Continental TSIO-520-UB de 300 hp con turbo. El límite oficial siempre es el de tu manual y tu simulador.",
      columnas: ["Límite", "Valor"],
      filas: [
        ["Peso máximo de despegue y aterrizaje", "3,650 lb (3,666 lb de rampa)"],
        ["Carga", "400 lb en la cabina trasera · 70 lb en el compartimento de popa"],
        ["Categoría y factor de carga", "Utilitaria: +4.4 g con flaps arriba, +3.0 g con flaps abajo; barrenas prohibidas"],
        ["Potencia de despegue y máxima continua", "36.0 in Hg a 2,700 RPM"],
        ["Temperatura de entrada a la turbina (TIT)", "1,650 °F máxima"],
        ["Cabezas de cilindro", "238 °C máxima"],
        ["Aceite", "116 °C máxima · 24 °C mínima para despegar · 10 PSI mínima en ralentí, 30–60 normal, 100 máxima"],
        ["Flujo de combustible máximo", "34.2 gph (2,700 RPM y 36.0 in Hg)"],
        ["Bomba auxiliar en HI", "Solo para cebar o si falla la bomba del motor"],
        ["Motor de arranque en vuelo", "No usarlo sobre 20,000 ft"],
        ["Altitud máxima", "25,000 ft"],
        ["Combustible utilizable", "44 o 74 gal; mínimo 13 gal por tanque para despegar"],
        ["Deslizamiento máximo", "30 segundos"],
        ["Vuelo en hielo", "Prohibido"],
      ],
    },
    sistemas: [
      {
        titulo: "Turbocargador",
        texto: "Los gases de escape mueven una turbina que, por un eje común, mueve un compresor que mete más aire al motor. Una compuerta (wastegate) desvía parte del escape: un resorte la mantiene abierta y la presión de aceite la cierra. El controlador de presión absoluta la ajusta solo, así que una vez fijada la admisión con el acelerador casi no hay que tocarlo al subir. La temperatura que se vigila es la TIT, a la entrada de la turbina: nunca más de 1,650 °F.",
      },
      {
        titulo: "Tren retráctil eléctrico",
        texto: "Un motor eléctrico mueve el tren por varillas. Tres luces verdes indican tren abajo y trabado, la roja indica tránsito, y todas apagadas, tren arriba. La bocina suena con el tren arriba al reducir bajo unas 17 in Hg; el interruptor lo mueve el acelerador, así que suena siempre en la misma posición de la palanca. La manivela de emergencia lo baja en unas 50 vueltas; solo sirve para bajarlo.",
      },
      {
        titulo: "Combustible y bomba auxiliar",
        texto: "Dos tanques en las alas y un selector IZQUIERDO / DERECHO / OFF, sin AMBOS; entre retenes no pasa combustible. La bomba auxiliar tiene tres posiciones: OFF, LOW (apoyo cuando el flujo fluctúa, por ejemplo con combustible caliente) y HI (solo para cebar o si falla la bomba del motor). Despegar con HI puede apagar el motor por exceso de combustible.",
      },
      {
        titulo: "Flaps, hélice y eléctrico",
        texto: "Los flaps solo tienen tres posiciones: UP (0°), APPROACH (15°) y DOWN (30°), sin intermedias. Si se pierde la presión de aceite, la hélice se va sola a RPM altas. El sistema eléctrico es de 24 V, con una batería de 15.5 Ah y un alternador de 50, 60 o 100 A.",
      },
    ],
  },

  seneca: {
    id: "seneca",
    nombre: "Piper PA-34-220T Seneca V",
    nota: "Bimotor de pistón con dos motores turbo a inyección, hélices de velocidad constante que se embanderan, tren retráctil y alimentación cruzada de combustible (crossfeed). Lo esencial de un bimotor: la VMC (raya roja, 66 KIAS) y la velocidad de mejor ascenso con un motor (línea azul, 88 KIAS). Los procedimientos y las velocidades salen de la documentación del Seneca V de Carenado para el simulador, basada en el manual de Piper; el checklist oficial es el de tu manual y el del propio simulador. Las velocidades están en KIAS.",
    normal: fases("snn", [
      ["prevuelo", "Inspección prevuelo", [
        ["Cabina: volante liberado; estática — drenar; freno de estacionamiento — puesto; magnetos y bombas de respaldo — OFF; tren — DOWN", "La palanca del tren abajo es lo primero en cualquier avión de tren retráctil."],
        ["Aceleradores — IDLE; mezclas — CORTE; estática alterna — NORMAL; cowl flaps — OPEN; trims — neutrales; selectores de combustible — ON", "Deja la cabina en una posición conocida antes de energizar nada."],
        ["Master ON: anunciadores (PRESS TO TEST), combustible, 3 luces verdes, flaps abajo; master OFF", "Confirma alertas, combustible y tren sin gastar batería."],
        ["Documentos y POH a bordo; equipaje asegurado; drenados del crossfeed — drenados", "El crossfeed tiene sus propios drenados, además de los de las alas."],
        ["Ala derecha: drenados del crossfeed cerrados; superficie sin hielo; flap, alerón, punta y luces; tapa y venteo; dos drenados del tanque y filtro de combustible", "Cada ala tiene dos drenados de tanque más el del filtro."],
        ["Motor derecho: aceite y tapa, hélice y spinner, tomas de aire, área del cowl flap; tren principal (3.2 ± 0.5 in expuestas), llanta y freno", "Revisa cada motor como si fuera un avión aparte."],
        ["Nariz: estado general, parabrisas, luces, barra de remolque guardada, tren de nariz (1.2 ± 0.25 in), puerta de equipaje delantera asegurada con llave", "Una puerta de nariz abierta en vuelo puede afectar el control."],
        ["Ala y motor izquierdos: mismo recorrido, más las paletas del aviso de pérdida y el pitot", "El pitot y el aviso de pérdida están de este lado."],
        ["Cola y fuselaje: estabilizador, timón, trims, antenas, tomas estáticas de ambos lados, puertas traseras aseguradas", "El estabilizador del Seneca es de una pieza (estabilator)."],
        ["Master ON: calefacción del pitot y detector de sustentación tibios (máximo 3 minutos en tierra), luces; luego todo OFF", "El pitot se calienta mucho; más tiempo en tierra daña los elementos."],
      ]],
      ["antes-arrancar", "Antes de arrancar", [
        ["Puertas cerradas; asientos trabados; cinturones y arneses (probar el carrete); cinturones de asientos vacíos abrochados", "Un cinturón suelto puede golpear los controles en turbulencia."],
        ["Alternadores — ON; freno de estacionamiento — puesto; tren — DOWN", "Jalar la perilla del freno antes de pisar los frenos no frena nada."],
        ["Aceleradores — IDLE; hélices — FULL FORWARD; mezclas — CORTE; aire alterno — OFF; cowl flaps — OPEN", "Los cowl flaps van abiertos en tierra para enfriar los motores."],
        ["Trims — ajustados; selectores — ON; calefacción, radio master y eléctricos — OFF; breakers — adentro", "Protege la aviónica del pico del arranque."],
      ]],
      ["arranque", "Arranque de motores", [
        ["En frío: acelerador 1 pulgada abierto; hélice FULL FORWARD; master ON; 3 verdes; bomba de respaldo ON; magnetos ON", "Deja el motor listo para cebar."],
        ["Mezcla — RICH y luego CORTE (la cantidad de cebado depende de la temperatura); hélice despejada; starter — ENGAGE", "Así se ceba el motor de inyección."],
        ["Al encender: mezcla — avanzar; acelerador — ajustar; presión de aceite — revisar", "Sin presión de aceite en los primeros segundos, apaga el motor."],
        ["Repetir con el segundo motor; voltímetro 28 ± 1 V, carga de los alternadores y vacío en rango", "Revisa que los dos alternadores estén cargando."],
        ["En caliente: acelerador 1/2 pulgada, mezcla en CORTE y bomba de respaldo OFF (sin cebar); avanzar la mezcla al encender", "Un motor caliente ya tiene combustible vaporizado."],
        ["Ahogado: acelerador a fondo, mezcla CORTE, bomba de respaldo OFF; al encender, avanzar la mezcla despacio y reducir a 1,000 RPM", "Despeja el combustible sobrante de los cilindros."],
        ["Starter — máximo 30 segundos; si no arranca, esperar varios minutos para enfriarlo", "No lo vuelvas a accionar justo después de soltarlo."],
      ]],
      ["rodaje", "Antes del rodaje y rodaje", [
        ["Calentamiento — 1,000 a 1,200 RPM; giróscopos, altímetro y radios — ajustados", "Deja que el aceite circule antes de exigir potencia."],
        ["Selectores — ON y revisar el crossfeed; piloto automático — probar y OFF; trim eléctrico — revisar", "Confirma que el crossfeed funciona antes de necesitarlo."],
        ["Área despejada; aceleradores — aplicar despacio; frenos, dirección e instrumentos de vuelo — revisados", "En un bimotor se puede ayudar el viraje con potencia asimétrica."],
        ["Con calor y ralentí largo, bomba de respaldo ON si el flujo se interrumpe (vapor en la línea)", "La bomba da presión positiva a la entrada de la bomba del motor."],
      ]],
      ["prueba-motor", "Prueba de motores (run-up)", [
        ["Freno puesto; mezclas FULL RICH; hélices FULL FORWARD; 1,000 RPM e instrumentos", "Empieza desde una configuración conocida."],
        ["1,500 RPM: probar el embanderamiento de cada hélice (caída máxima de 300 RPM)", "Confirma que cada hélice se embandera: es lo que salva el vuelo si falla un motor."],
        ["2,300 RPM: ejercitar las hélices (caída máxima de 300 RPM); aire alterno ON (unas 25 RPM de caída) y OFF", "El aire alterno entra sin filtrar; úsalo solo cuando haga falta."],
        ["2,000 RPM: magnetos — caída máxima 150 RPM, diferencia máxima 50 RPM", "Una caída mayor señala una bujía o magneto fallando."],
        ["Voltímetro 28 ± 1 V; carga de ambos alternadores; anunciadores apagados; vacío en rango", "Cada motor mueve su alternador y su bomba de vacío."],
        ["Equipo antihielo según se requiera; ralentí — revisar; 800 a 1,000 RPM; fricción — ajustada", "Con humedad visible bajo +5 °C hay que encender el antihielo, incluido el pitot."],
      ]],
      ["antes-despegue", "Antes de despegue", [
        ["Puertas aseguradas; respaldos verticales; asientos trabados; cinturones y arneses; descansabrazos guardados", "Todo listo para una aceleración fuerte o una emergencia."],
        ["Master y alternadores — ON; bombas de respaldo — ON; instrumentos de vuelo y de motores — revisados", "Las bombas de respaldo protegen contra una falla de la bomba del motor en el despegue."],
        ["Calefacción de hélices, parabrisas y pitot — según se requiera; hélices y mezclas — FULL FORWARD; aire alterno — OFF", "Mezclas y hélices adelante para tener toda la potencia."],
        ["Flaps y trims — ajustados; aire acondicionado — OFF; selectores — ON; controles — libres; freno — liberado", "Evita virajes rápidos justo antes de despegar: pueden descubrir las tomas de combustible."],
        ["Briefing: si falla un motor bajo 85 KIAS o con el tren abajo, se aborta; arriba de 85 KIAS se decide si queda pista", "Decidirlo antes te ahorra segundos que en un bimotor valen mucho."],
      ]],
      ["despegue", "Despegue", [
        ["Normal (flaps 0°): frenos puestos, mezclas FULL RICH, 2,600 RPM y 38 in Hg; soltar frenos", "Nunca más de 38 in Hg de admisión, aunque el acelerador dé más."],
        ["Rotación a 79 KIAS (peso máximo), franqueo de obstáculos a 79 KIAS; tren — UP; 88 KIAS ya libre de obstáculos", "Rotar bajo la VMC (66 KIAS) sería perder el control si fallara un motor."],
        ["Pista corta (flaps 25°): rotación a 71 KIAS, franqueo a 73 KIAS; tren UP; flaps retraídos despacio acelerando; 88 KIAS", "Los flaps se retraen poco a poco para no perder sustentación de golpe."],
      ]],
      ["ascenso", "Ascenso", [
        ["Máximo rendimiento: mejor tasa 88 KIAS, mejor ángulo 83 KIAS, cowl flaps abiertos, potencia máxima continua", "Así se sube lo más rápido o lo más empinado posible."],
        ["Ascenso de crucero: mezclas FULL RICH, 2,500 RPM y 32 in Hg, 110 KIAS, cowl flaps cerrados o a la mitad", "Enfría mejor los motores y deja ver hacia adelante."],
        ["Bombas de respaldo — OFF a una altitud segura (ON sobre 10,000 ft)", "Sobre 10,000 ft ayudan a evitar vapor en las líneas de combustible."],
      ]],
      ["crucero", "Crucero", [
        ["Potencia — según la tabla (crucero normal: 2,500 RPM y 28 in Hg sobre 20,000 ft, o 2,300 a 2,400 RPM con 29 a 30 in Hg abajo; unos 24 gph)", "Cada combinación de RPM y admisión da una potencia distinta."],
        ["Mezclas — al pico de TIT, sin pasar de 1,650 °F (se permite 1,700 °F hasta 60 segundos para encontrar el pico)", "La TIT es la temperatura a la entrada de la turbina del turbo."],
        ["Bombas de respaldo — confirmar OFF; cowl flaps — según se requiera", "Así, si falla una bomba del motor, lo notas de inmediato."],
      ]],
      ["descenso", "Descenso", [
        ["Aceleradores — según se requiera; mezclas — ajustar; cowl flaps — cerrados", "Evita enfriar los motores de golpe."],
        ["Altímetro — ajustado; desempañador — según se desee", "Sin el dato de presión del destino, el altímetro marca una altura distinta a la real."],
      ]],
      ["aterrizaje", "Aproximación y aterrizaje", [
        ["Fuente de navegación del HSI — verificada; respaldos verticales; cinturones; descansabrazos guardados", "Confirma que vas a volar la aproximación correcta."],
        ["Bombas de respaldo — ON; selectores — ON; cowl flaps — según se requiera; mezclas FULL RICH; hélices FULL FORWARD", "Deja los dos motores listos para potencia completa."],
        ["Tren — DOWN bajo 128 KIAS; 3 luces verdes; espejo de la góndola: tren de nariz abajo", "El espejo en la góndola del motor deja ver la rueda de nariz."],
        ["Aire acondicionado y piloto automático — OFF; frenos — probar", "Evita que el autopiloto pelee la aproximación."],
        ["Flaps — FULL DOWN bajo 113 KIAS; 90 KIAS en final (82 KIAS pista corta con peso máximo); tocar con las principales", "Después del toque en pista corta: flaps arriba, volante atrás y frenar al máximo sin derrapar."],
      ]],
      ["motor-y-al-aire", "Motor y al aire", [
        ["Mezclas FULL RICH; hélices FULL FORWARD; aceleradores a potencia completa", "Primero la potencia, después la configuración."],
        ["Actitud de ascenso positivo a 85 KIAS; flaps — retraer despacio; tren — UP; cowl flaps y trim — según se requiera", "Retraer los flaps de golpe haría perder altura."],
      ]],
      ["apagado", "Después de aterrizar y apagado", [
        ["Libre de la pista: flaps arriba, cowl flaps abiertos, estrobos OFF, luces según se requiera", "Los estrobos deslumbran a otros pilotos en tierra."],
        ["Calefacción (si estaba ON) — ventilador 2 minutos y luego OFF; radio master y eléctricos — OFF", "El ventilador enfría el calentador antes de apagarlo."],
        ["Aceleradores — IDLE; mezclas — CORTE; magnetos, alternadores y master — OFF", "Así se apagan los motores de inyección: cortando el combustible."],
        ["Freno de estacionamiento, volante asegurado, calzas y amarres", "El viento puede mover o dañar un avión sin amarres."],
      ]],
    ]),
    emergencia: fases("sne", [
      ["identificar", "Identificar el motor que falló", [
        ["Pérdida de empuje y la nariz se va hacia el lado del motor que falló", "El motor bueno empuja de un solo lado y hace guiñar el avión."],
        ["Hay que pisar timón del lado contrario al motor que falló para volar recto (pie muerto, motor muerto)", "El pie que no está trabajando señala el motor que falló."],
        ["Confirmar cerrando el acelerador del motor que crees que falló: si no cambia nada, es ese", "Embanderar el motor bueno por error deja al avión sin ningún motor."],
      ]],
      ["asegurar", "Asegurar el motor (embanderar)", [
        ["Acelerador — cerrado; hélice — FEATHER (antes de que baje de 800 RPM); mezcla — CORTE", "Bajo 800 RPM un seguro evita que la hélice se embandere."],
        ["Cowl flap — cerrado; selector de combustible — OFF; aire acondicionado, alternador y bomba de respaldo — OFF", "Aísla por completo el motor que falló."],
        ["Magnetos — OFF; sincronizador de hélices — OFF; carga eléctrica — reducir; crossfeed — según se requiera", "Con un solo alternador hay que aligerar la carga."],
      ]],
      ["falla-despegue-baja", "Falla de motor en el despegue (bajo 85 KIAS o con el tren abajo)", [
        ["Aceleradores — cerrar de inmediato; frenos (o aterrizar y frenar); detenerse recto al frente", "Bajo 85 KIAS no hay suficiente margen para seguir volando con un motor."],
        ["Si no queda pista: aceleradores cerrados, mezclas CORTE, selectores OFF, magnetos OFF, bombas de respaldo OFF, master OFF, frenado máximo", "Mantén el control direccional y esquiva obstáculos."],
      ]],
      ["falla-despegue-alta", "Falla de motor en el despegue (arriba de 85 KIAS)", [
        ["Si queda pista: control direccional, aceleradores cerrados; si ya despegaste, aterrizar recto y frenar", "Abortar con pista suficiente casi siempre es más seguro que seguir."],
        ["Si no queda pista y se decide seguir: mezclas y hélices adelante, 38 in Hg, control direccional, flaps arriba, tren arriba (en vuelo nivelado o ascenso)", "Puede haber ascenso negativo hasta embanderar, subir el tren y el cowl flap, y llegar a 88 KIAS."],
        ["Identificar cerrando el acelerador; hélice del motor inoperativo — FEATHER", "Una hélice sin embanderar genera muchísima resistencia."],
        ["Alabeo de 2° a 3° hacia el motor bueno; 88 KIAS (línea azul); trim con media bola hacia el motor bueno; cowl flap del motor inoperativo cerrado", "Alabear hacia el motor bueno reduce la resistencia y ayuda a controlar."],
        ["Con ascenso positivo: asegurar el motor y aterrizar en cuanto sea práctico en el aeropuerto adecuado más cercano", "Con un solo motor el margen es mínimo."],
      ]],
      ["falla-ascenso", "Falla de motor en el ascenso", [
        ["Mantener 88 KIAS y el control direccional; potencia máxima continua en el motor bueno", "La línea azul es la que da el mejor ascenso con un motor."],
        ["Identificar y verificar el motor; asegurarlo; alabeo de 2° a 3° y media bola hacia el motor bueno", "Mismo principio: menos resistencia, más control."],
        ["Cowl flap del motor bueno — a la mitad; aterrizar en cuanto sea práctico", "Con más trabajo, el motor bueno necesita más enfriamiento."],
      ]],
      ["bajo-vmc", "Falla de motor bajo la VMC", [
        ["Timón contra la guiñada; aceleradores de ambos motores — reducir hasta detener el giro", "Bajo la VMC el timón ya no alcanza: hay que quitar potencia al motor bueno."],
        ["Bajar la nariz para acelerar arriba de 66 KIAS; subir la potencia del motor bueno conforme la velocidad pase de 66 KIAS", "Solo arriba de la VMC se recupera el control."],
        ["Si la altura lo permite, intentar reencender; si no: embanderar, alabeo y trim hacia el motor bueno, asegurar el motor y cowl flap del bueno a la mitad", "Aterrizar en cuanto sea práctico."],
      ]],
      ["aterrizaje-un-motor", "Aterrizaje con un motor", [
        ["Motor inoperativo asegurado; cinturones; selector y bomba de respaldo del motor bueno ON; mezcla FULL RICH y hélice FULL FORWARD del motor bueno; cowl flap del bueno a la mitad", "Todo el trabajo depende de un solo motor."],
        ["Aproximación normal; ya asegurado el aterrizaje: tren DOWN, flaps según se requiera, 90 KIAS en final", "No bajes el tren ni los flaps antes de estar seguro de llegar."],
        ["Reducir la potencia despacio en el flare y ajustar el trim: el avión guiña hacia el motor bueno al quitar potencia", "Al reducir, la asimetría cambia de lado."],
      ]],
      ["motor-y-al-aire-un-motor", "Motor y al aire con un motor", [
        ["Evitarlo siempre que sea posible: con muchas cargas y altitudes de densidad puede ser imposible", "Desde la configuración de aproximación solo es posible si hay altura para subir flaps y tren descendiendo."],
        ["Mezcla y hélice adelante; potencia máxima en el motor bueno; flaps — retraer despacio; tren — UP", "Primero la potencia, luego quitar resistencia."],
        ["88 KIAS; alabeo de 2° a 3° y media bola hacia el motor bueno; cowl flap del bueno a la mitad", "La línea azul da el mejor ascenso posible con un motor."],
      ]],
      ["reencendido", "Reencendido en vuelo", [
        ["Con arrancador: selector del motor ON, bomba de respaldo ON, acelerador 1/2 pulgada, mezcla FULL RICH, magnetos ON, hélice a medio rango, starter hasta que la hélice gire con el viento", "Reduce la potencia hasta que el motor se caliente; luego bomba de respaldo OFF."],
        ["Con acumulador: acelerador 1/4 de pulgada, hélice FULL FORWARD; la hélice suele girar sola; si no gira en 5 a 7 segundos, usar el arrancador", "Al desembanderar puede hacer falta retrasar un poco la hélice para que no se sobrerrevolucione."],
        ["Después: alternador ON, instrumentos revisados, sincronizar hélices y potencia a lo deseado", "Recupera la configuración normal de los dos motores."],
      ]],
      ["fuego", "Fuego de motor", [
        ["En el arranque, sin encender: selector OFF, mezcla CORTE, acelerador a fondo, seguir girando con el starter", "Aspira el combustible sobrante y el fuego hacia el motor."],
        ["Si el fuego continúa: selector y bomba OFF, mezcla CORTE, acelerador a fondo, extintor y evacuar (si sigue, apagar los dos motores)", "Si el fuego se extiende al suelo, a veces se puede rodar para alejarse."],
        ["En vuelo: selector, acelerador, hélice (FEATHER) y mezcla del motor afectado; calefacción y desempañador OFF; cowl flap abierto; asegurar el motor", "Si persiste, subir la velocidad para intentar apagarlo y aterrizar lo antes posible."],
      ]],
      ["turbo", "Falla del turbo", [
        ["Si viene de componentes del escape sueltos o quemados, hay riesgo serio de fuego: apagar el motor y aterrizar lo antes posible (en tierra, no volar)", "El escape caliente puede incendiar el compartimento del motor."],
        ["Pérdida total de potencia: mezcla CORTE, acelerador en crucero, hélice FULL FORWARD, avanzar la mezcla despacio hasta que encienda; reducir potencia y aterrizar", "Sobre 10,000 ft una falla del turbo puede enriquecer demasiado la mezcla."],
        ["Pérdida parcial (compuerta abierta): acelerador, hélice y mezcla según se requiera; aterrizar lo antes posible", "El motor da menos potencia de la normal."],
        ["Sobrepresión (compuerta cerrada): reducir el acelerador para mantener la admisión dentro de límites; mezcla FULL RICH; aterrizar lo antes posible", "La admisión responderá de forma muy sensible al acelerador."],
      ]],
      ["combustible", "Combustible con un motor y falla de bomba", [
        ["En crucero: selector del motor bueno en CROSSFEED y el del inoperativo en OFF (solo en vuelo nivelado)", "Así el motor bueno toma combustible del tanque del otro lado."],
        ["Antes de aterrizar: bomba de respaldo del bueno ON, selector del bueno ON, selector y bomba del inoperativo OFF", "Se aterriza alimentando cada motor de su propio tanque."],
        ["Falla de la bomba del motor: acelerador atrás, bomba de respaldo del motor afectado ON, acelerador y mezcla reajustados", "Si el flujo no vuelve, apaga la bomba: puede ser fuga o falta de combustible; con fuga, selector OFF y asegurar el motor."],
      ]],
      ["tren", "Tren de aterrizaje", [
        ["Luz roja del tren: tren en tránsito; ciclarlo si sigue. Luz roja y bocina al reducir potencia si el tren no está abajo", "La bocina avisa antes de aterrizar con el tren arriba."],
        ["Extensión de emergencia: revisar dimmer en DAY, breakers, master ON y alternadores; bajar a 85 KIAS o menos; palanca en DOWN; jalar la perilla de emergencia; 3 verdes", "Con falla eléctrica, las luces del tren no se encienden."],
        ["Dejar la perilla afuera hasta que el avión esté en gatos", "Así se revisa la falla del sistema hidráulico y eléctrico en tierra."],
        ["Aterrizaje con el tren arriba: avisar, quemar combustible si hay tiempo, briefing; ya asegurado: mezclas CORTE, hélices FEATHER, selectores OFF; tocar a la mínima velocidad nivelado; evacuar", "Embanderar las hélices reduce el daño a los motores al tocar."],
      ]],
      ["electrica", "Falla eléctrica", [
        ["Un alternador: confirmar en el amperímetro; carga bajo 85 A; switch OFF, breaker revisado y reiniciado, switch ON tras 1 segundo; si no vuelve, OFF y carga bajo 85 A", "Un alternador alcanza para lo esencial, pero no para todo el antihielo."],
        ["Los dos: carga al mínimo; switches OFF; breakers revisados; encender uno a la vez; si ninguno vuelve, los dos OFF y seguir con la batería", "El anunciador LO BUS enciende bajo unos 25 V."],
        ["Aterrizar en cuanto sea práctico y esperar falla eléctrica total; la brújula puede errar más de 10°", "Sin batería el tren se baja con la emergencia, sin luces, y los flaps no funcionan."],
      ]],
      ["otros", "Vacío, barrena, descenso, calefacción y sobrevelocidad", [
        ["Una bomba de vacío: la otra alcanza, pero evita el hielo. Las dos: solo quedan el coordinador de viraje y el direccional del piloto; considerar un aterrizaje de precaución", "Sin vacío tampoco funcionan las botas antihielo."],
        ["Barrena (prohibida): aceleradores a ralentí, timón a fondo contra el giro, volante adelante si la nariz no baja, alerones neutros; al parar, timón neutral y recuperar suave", "No se han hecho pruebas de barrena en este avión."],
        ["Descenso de emergencia: aceleradores cerrados, hélices adelante, mezcla según se requiera, tren abajo y 128 KIAS máximo", "El tren abajo agrega resistencia."],
        ["Calentador sobrecalentado: se apaga solo; no intentar reencenderlo", "Evita un fuego en la cabina."],
        ["Sobrevelocidad de hélice: acelerador atrás, revisar aceite, hélice FULL DECREASE (sin embanderar), reducir velocidad y mantenerse bajo 2,600 RPM", "Sin presión de aceite, la hélice no se controla."],
      ]],
    ]),
    flujos: flujos("sn", [
      ["falla-despegue", "Falla de motor tras despegar", ["Mezclas, hélices y aceleradores adelante", "Flaps y tren arriba", "Identificar: pie muerto, motor muerto", "Verificar cerrando el acelerador", "Embanderar; 88 KIAS y 2-3° hacia el motor bueno"]],
      ["asegurar", "Asegurar el motor", ["Acelerador cerrado", "Hélice FEATHER", "Mezcla CORTE", "Cowl flap cerrado", "Selector, alternador, bomba y magnetos OFF"]],
      ["tren-emergencia", "Extensión de emergencia del tren", ["Dimmer DAY, breakers, master y alternadores", "85 KIAS o menos", "Palanca del tren DOWN", "Jalar la perilla de emergencia", "3 verdes"]],
    ]),
    vspeeds: [
      { clave: "Vmca", nombre: "Mínima de control con un motor (raya roja)", valor: "66 kt" },
      { clave: "Vyse", nombre: "Mejor tasa con un motor (línea azul)", valor: "88 kt" },
      { clave: "Vxse", nombre: "Mejor ángulo con un motor", valor: "83 kt" },
      { clave: "Vr", nombre: "Rotación", valor: "79 kt con flaps 0° · 71 kt con flaps 25°" },
      { clave: "V50", nombre: "Franqueo de obstáculos", valor: "79 kt con flaps 0° · 73 kt con flaps 25°" },
      { clave: "Vy / Vx", nombre: "Mejor tasa / mejor ángulo (flaps arriba)", valor: "88 kt / 83 kt" },
      { clave: "Vcc", nombre: "Ascenso de crucero", valor: "110 kt" },
      { clave: "Va", nombre: "Velocidad de maniobra", valor: "135 kt a 4,407 lb (113 kt a 3,205 lb)" },
      { clave: "Vfe", nombre: "Máxima con flaps", valor: "113 kt" },
      { clave: "Vlo", nombre: "Máxima para operar el tren", valor: "128 kt para bajarlo · 107 kt para subirlo" },
      { clave: "Vle", nombre: "Máxima con el tren abajo", valor: "128 kt" },
      { clave: "Vno", nombre: "Máxima estructural normal", valor: "164 kt" },
      { clave: "Vne", nombre: "Nunca exceder", valor: "204 kt" },
      { clave: "Vapp", nombre: "Aproximación final", valor: "90 kt (82 kt en pista corta)" },
      { clave: "Vs0", nombre: "Pérdida, flaps abajo (inicio del arco blanco)", valor: "61 kt" },
      { clave: "Vs1", nombre: "Pérdida, flaps arriba (inicio del arco verde)", valor: "67 kt" },
    ],
    notaVspeeds: "Valores de la documentación del Seneca V de Carenado, en KIAS. Confirma los de tu versión del simulador.",
    limites: {
      titulo: "Límites de operación",
      nota: "De la documentación del Seneca V de Carenado (PA-34-220T). El límite oficial siempre es el de tu manual y tu simulador.",
      columnas: ["Límite", "Valor"],
      filas: [
        ["Potencia de despegue", "2,600 RPM y 38 in Hg máximo de admisión"],
        ["Temperatura de entrada a la turbina (TIT)", "1,650 °F máxima (1,700 °F hasta 60 s para buscar el pico)"],
        ["Embanderamiento", "Hay que embanderar antes de que la hélice baje de 800 RPM"],
        ["Sobrevelocidad de hélice", "Mantenerse bajo 2,600 RPM"],
        ["Caída en la prueba de hélices", "300 RPM máxima (embanderamiento y ejercicio)"],
        ["Magnetos (2,000 RPM)", "150 RPM de caída máxima, 50 RPM de diferencia"],
        ["Sistema eléctrico", "28 ± 1 V; con un solo alternador, carga bajo 85 A; LO BUS bajo unos 25 V"],
        ["Motor de arranque", "30 segundos máximo por intento"],
        ["Calefacción del pitot en tierra", "3 minutos máximo"],
        ["Crossfeed", "Solo en vuelo nivelado de crucero"],
        ["Barrenas", "Prohibidas"],
      ],
    },
    sistemas: [
      {
        titulo: "VMC y línea azul",
        texto: "La VMC (66 KIAS, raya roja) es la velocidad más baja a la que el avión se controla con un motor a potencia de despegue y el otro fallado. Por debajo, el timón ya no alcanza para contrarrestar la guiñada. La línea azul (88 KIAS) es la velocidad de mejor ascenso con un motor. Con un motor se vuela a la línea azul, con 2° a 3° de alabeo y media bola hacia el motor bueno.",
      },
      {
        titulo: "Hélices que se embanderan",
        texto: "Cada hélice puede ponerse en bandera (palas de canto al viento) para que el motor que falló deje de frenar el avión. Hay que hacerlo antes de que baje de 800 RPM, porque abajo un seguro lo impide. Para desembanderar en vuelo hay un acumulador que la hace girar sola, o el motor de arranque.",
      },
      {
        titulo: "Combustible y crossfeed",
        texto: "Cada motor se alimenta normalmente de su propio tanque, con su selector ON / OFF / CROSSFEED. Con un motor fallado, el crossfeed deja que el motor bueno tome combustible del tanque del otro lado, solo en vuelo nivelado. Cada motor tiene su bomba mecánica y una bomba eléctrica de respaldo, que se enciende para despegar, aterrizar y sobre 10,000 ft.",
      },
      {
        titulo: "Turbos, tren y eléctrico",
        texto: "Cada motor tiene su turbo y se vigila la TIT. El tren es retráctil, con luces verdes, luz roja de tránsito, bocina y una perilla de extensión de emergencia que lo deja caer; un espejo en la góndola muestra la rueda de nariz. El sistema eléctrico es de 28 V, con un alternador en cada motor.",
      },
    ],
  },

  c208: {
    id: "c208",
    nombre: "Cessna 208B Caravan",
    nota: `Turbohélice monoturbina (palancas de potencia, hélice y condición; monitoreo de ITT, Ng y torque). ${AVISO}`,
    normal: fases("c208n", [
      ["prevuelo", "Inspección prevuelo", [
        ["Documentos de la aeronave y peso y balance — a bordo y verificados", "Volar sin ellos es ilegal, y sin bitácora no puedes confirmar que el avión está en condición de aeronavegabilidad."],
        ["Cubiertas de pitot y estática — retiradas; orificios libres", "Un pitot o una toma estática tapados dan lecturas de velocidad y altímetro falsas en pleno vuelo."],
        ["Combustible — cantidad a la vista; drenado de tanques, filtro y colador sin agua ni sedimento", "El agua es más pesada que el combustible y se asienta en el fondo; si llega al motor, lo apaga sin aviso."],
        ["Motor y entradas de aire — sin obstrucciones ni fugas de aceite; nivel de aceite correcto, tapa asegurada", "Poco aceite reduce la lubricación y puede provocar una falla de motor por sobrecalentamiento."],
        ["Hélice — sin muescas ni daños; escape libre de obstrucciones", "Una muesca pequeña puede crecer con la vibración del motor y romper la hélice en pleno vuelo."],
        ["Superficies de control y flaps — libres y sin daño", "Una bisagra suelta o un daño aquí hace que el avión no responda como esperas en el aire."],
        ["Tren, llantas y frenos — presión y desgaste correctos", "Una llanta baja o gastada puede reventar en el rodaje o el aterrizaje."],
        ["Carga (o pod de carga) — asegurada y dentro del peso y balance", "Carga suelta se mueve en vuelo y puede desplazar el centro de gravedad fuera de límites."],
      ]],
      ["antes-arrancar", "Antes de arrancar", [
        ["Puertas — cerradas y aseguradas; asientos, cinturones y arneses ajustados", "Una puerta mal cerrada puede abrirse en vuelo por la presión del aire."],
        ["Freno de estacionamiento — puesto; seguro de control — retirado", "Evita que el avión se mueva solo mientras enciendes los sistemas."],
        ["Palanca de EMERGENCY POWER — NORMAL", "Dejarla fuera de NORMAL durante el arranque provoca una condición de sobretemperatura del motor."],
        ["Palanca de potencia — IDLE; hélice — MAX (a fondo adelante); palanca de condición — CORTE (CUTOFF)", "Es la posición de arranque en frío del motor de turbina; arrancar con la condición fuera de corte inunda el motor."],
        ["Válvula de corte de combustible — ON (adentro); selectores de tanque — AMBOS ON", "Confirma que el combustible pueda llegar al motor desde los dos tanques antes de arrancar."],
        ["Batería — ON; aviónica — apagada todavía", "Arrancar con la aviónica energizada puede dañarla con el pico de corriente del motor de arranque."],
      ]],
      ["arranque", "Arranque del motor", [
        ["Luz anticolisión — ON; área de la hélice — despejada", "Hace visible al avión y avisa a cualquiera cerca de la hélice antes de que empiece a girar."],
        ["Bomba de refuerzo de combustible — ON, verificar flujo en cero", "Confirma que el sistema de combustible responde antes de introducir combustible al motor."],
        ["Arrancador — START; Ng estable sobre 12 % mínimo, presión de aceite verificada", "Sin ese mínimo de Ng, el motor no tiene suficiente aire comprimido para encender bien."],
        ["Palanca de condición — LOW IDLE, vigilando flujo de combustible (90–140 pph) e ITT (máximo 1090 °C, solo 2 segundos)", "Es el momento de mayor riesgo de un arranque caliente; una ITT descontrolada puede dañar la turbina en segundos."],
        ["Si la ITT sube rápido hacia el límite: lista para regresar la condición a CORTE", "Es la única forma de abortar el arranque antes de dañar el motor."],
        ["Arrancador — OFF una vez estable; generador — verificado cargando", "Confirma que el generador ya está sosteniendo el sistema eléctrico en vez de la batería."],
        ["Bomba de refuerzo — NORM; aviónica — ON", "Regresa el sistema de combustible a su configuración normal antes de energizar la aviónica."],
      ]],
      ["rodaje", "Rodaje", [
        ["Frenos — probados; instrumentos de vuelo — verificados", "Confirma que responden antes de necesitarlos en el rodaje."],
        ["Beta (reversa de hélice) — usada con moderación para controlar la velocidad", "El beta reduce el desgaste de los frenos, pero su uso excesivo erosiona las palas antes de tiempo."],
        ["Velocidad de rodaje — controlada, sin exceso de potencia", "Un turbohélice tiene mucho par disponible incluso a baja potencia; rodar rápido complica el control direccional."],
      ]],
      ["antes-despegue", "Antes de despegue", [
        ["Freno de estacionamiento — puesto; controles de vuelo — libres y correctos; trim — ajustado para despegue", "Un control restringido o un trim mal puesto solo se detecta con seguridad en tierra."],
        ["Potencia a 400 ft-lb: separador inercial probado en BYPASS y vuelto a NORMAL, verificando la caída y recuperación de torque", "Confirma que el separador realmente protege al motor de hielo o de objetos extraños antes de necesitarlo."],
        ["Gobernador de sobrevelocidad — probado (primer vuelo del día): RPM estabiliza en 1,750 ± 60 con el botón de prueba presionado", "Verifica que el sistema que protege contra una sobrevelocidad de hélice realmente funciona."],
        ["Alimentación de respaldo (STBY ALT PWR) — probada (primer vuelo del día y antes de vuelo en hielo)", "Confirma que, si el generador principal falla, el sistema de respaldo puede sostener el vuelo."],
        ["Flaps — 20° para despegue; combustible verificado, selectores AMBOS ON", "Asegura la configuración correcta y la alimentación de combustible para el momento de mayor demanda de potencia."],
        ["Palanca de condición — HIGH IDLE; briefing de despegue — qué hacer si falla el motor", "HIGH IDLE deja el motor listo para responder de inmediato al avanzar la palanca de potencia."],
      ]],
      ["despegue", "Despegue y ascenso", [
        ["Flaps — 20°; potencia ajustada para despegue sin exceder ITT ni Ng (según la tabla de torque máximo)", "Excederlos aunque sea brevemente puede dañar la turbina o acortar su vida útil."],
        ["Rotación — 70–75 KIAS; ascenso inicial 85–95 KIAS", "Rotar antes de esta velocidad puede hacer que el avión despegue sin suficiente sustentación."],
        ["Flaps — retraídos a 10° al pasar 85 KIAS, y a 0° al pasar 95 KIAS", "Retirarlos antes de esa velocidad reduce sustentación de golpe en un momento crítico del despegue."],
        ["Potencia de ascenso — ajustada sin exceder ITT (740 °C recomendado) ni Ng de la tabla de climb", "Superar 740 °C de forma sostenida reduce la vida útil del motor aunque no exceda el límite absoluto."],
      ]],
      ["crucero", "Crucero", [
        ["Hélice — 1,600 a 1,900 RPM; potencia ajustada al torque de crucero de la tabla, sin exceder ITT ni Ng", "Reduce el desgaste del motor y el consumo de combustible frente a volar a máxima potencia."],
        ["Balance de combustible — verificado (máximo 200 lb de diferencia entre tanques)", "Un desbalance mayor afecta el manejo lateral del avión."],
        ["Separador inercial y protección antihielo — según temperatura exterior (por debajo de 5 °C)", "El separador desvía el aire de la entrada del motor para evitar que el hielo lo dañe."],
      ]],
      ["descenso", "Descenso y aproximación", [
        ["Altímetros — ajustados con el reporte de destino", "Sin el dato de presión del destino, tu altímetro puede marcar una altura distinta a la real."],
        ["Hélice — 1,900 RPM antes de iniciar cualquier procedimiento por instrumentos", "Es el régimen que da la mejor respuesta de potencia durante una aproximación."],
        ["Potencia — reducida progresivamente, evitando enfriamiento brusco del motor", "Un descenso con la potencia muy reducida por mucho tiempo enfría la turbina más rápido de lo recomendable."],
      ]],
      ["antes-aterrizar", "Antes de aterrizar", [
        ["Combustible — selectores AMBOS ON; palanca de condición — HIGH IDLE; hélice — MAX", "Deja el motor listo para máxima potencia inmediata si hace falta un motor y al aire."],
        ["Piloto automático — desconectado antes de los 200–800 ft AGL según corresponda", "Aterrizar con el piloto automático conectado por error puede pelear contra tus controles."],
        ["Flaps — ajustados según se requiera", "Cada fase de la aproximación tiene su configuración recomendada de flaps."],
      ]],
      ["apagado", "Después de aterrizar y apagado", [
        ["Flaps — arriba; luces de hielo y estroboscópicas — OFF", "Evita daño y ahorra batería una vez que ya no se necesitan en tierra."],
        ["Palanca de condición — LOW IDLE al salir de la pista", "Moverla más allá de LOW IDLE con el Ng ya bajo puede causar una sobretemperatura de ITT al querer regresarla."],
        ["Potencia — IDLE; ITT estabilizada al mínimo por 1 minuto antes de apagar", "Ese minuto de enfriamiento evita daño térmico a los componentes calientes de la turbina."],
        ["Hélice — FEATHER; palanca de condición — CORTE (CUTOFF)", "Detiene el motor cortando el combustible, la forma correcta de apagar una turbina."],
        ["Aviónica y baterías — OFF; selector de un tanque — OFF si el avión queda en pendiente", "Evita el contraflujo de combustible entre tanques mientras el avión está estacionado."],
        ["Bitácora — anotaciones de tiempo de vuelo y anomalías", "Es el registro legal del avión y la forma de detectar un problema que se repite vuelo tras vuelo."],
      ]],
    ]),
    emergencia: fases("c208e", [
      ["falla-despegue-tierra", "Falla de motor durante la carrera de despegue", [
        ["Flaps — retraídos; si no se puede detener en la pista restante: palanca de condición CORTE, combustible cerrado (válvula y selectores), batería OFF", "Corta combustible y electricidad para reducir el riesgo de incendio mientras el avión aún se desliza."],
      ]],
      ["falla-despegue-aire", "Falla de motor inmediatamente después del despegue", [
        ["Hélice — EMBANDERAR; flaps — según se requiera (20° recomendado)", "Embanderar reduce drásticamente la resistencia de una hélice que ya no genera empuje."],
        ["Palanca de condición — CORTE; combustible cerrado (válvula y selectores); batería — OFF", "Reduce el riesgo de incendio antes del aterrizaje forzado."],
      ]],
      ["falla-vuelo", "Falla de motor en vuelo (reencendido)", [
        ["Flaps — arriba; bomba de refuerzo — OFF; combustible cerrado; ignición — NORM", "Prepara el avión para planear mientras se decide el reencendido."],
        ["Con arrancador disponible: reducir carga eléctrica, colocar palanca de EMERGENCY POWER en NORMAL, potencia IDLE, hélice MIN RPM, condición CORTE, combustible ON, selectores AMBOS ON, bomba ON", "Repite en el aire la configuración de un arranque normal, con la carga eléctrica reducida para no competir por energía."],
        ["Arrancador — START; una vez estable, condición — LOW IDLE vigilando flujo e ITT (1090 °C máximo)", "El arrancador ayuda a que el motor alcance el Ng mínimo necesario antes de introducir combustible."],
        ["Sin arrancador disponible: mantener 100 KIAS mínimo (140 KIAS con hélice embanderada), bajo 20,000 ft (15,000 ft embanderada), Ng estable antes de mover la condición", "Sin motor de arranque, el molinete de la hélice por el viento relativo es lo único que hace girar el generador de gas."],
        ["Si el reencendido no prende con Ng sobre 50 %: potencia IDLE, ignición ON; si Ng cae bajo 50 %: condición CORTE", "Diferencia si el motor solo necesita más chispa o si hay que abortar el intento por completo."],
      ]],
      ["aterrizaje-forzado", "Aterrizaje forzado sin motor", [
        ["Cinturones y arneses asegurados; velocidad — 100 KIAS (flaps arriba) o 80 KIAS (flaps completos)", "Cualquier desviación de la velocidad de mejor planeo reduce el área alcanzable para aterrizar."],
        ["Potencia — IDLE; hélice — EMBANDERAR; condición — CORTE; bomba de refuerzo — OFF; ignición — NORM", "Embanderar reduce la resistencia; cortar combustible reduce el riesgo de incendio en el impacto."],
        ["Equipo no esencial — OFF; combustible cerrado (válvula y selectores); flaps — según se requiera (completos recomendado)", "Reduce el riesgo eléctrico y de incendio mientras te concentras en el aterrizaje."],
        ["Puertas — sin seguro antes del toque; generador — TRIP; batería — OFF cuando el aterrizaje esté asegurado; toque de cola ligeramente baja; frenos con fuerza", "Una puerta cerrada puede quedar atascada si la estructura se deforma en el impacto."],
      ]],
      ["aterrizaje-precaucion", "Aterrizaje de precaución con motor", [
        ["Flaps 10°, 90 KIAS, sobrevolar el campo elegido para inspeccionar terreno y obstáculos", "Con motor disponible, vale la pena inspeccionar el sitio antes de comprometerte a aterrizar ahí."],
        ["Equipo no esencial OFF (salvo batería, generador y respaldo); flaps completos en final, 80 KIAS", "Reduce el riesgo eléctrico si el aterrizaje termina siendo más duro de lo planeado."],
        ["Puertas sin seguro; respaldo y generador OFF, batería OFF; toque de cola baja; potencia a BETA; condición CORTE; frenos con fuerza", "Mismo motivo que en el aterrizaje forzado: reduce riesgo eléctrico y de que la puerta se atasque."],
      ]],
      ["fuego-motor", "Fuego de motor en vuelo", [
        ["Potencia — IDLE; hélice — EMBANDERAR; condición — CORTE; válvula de combustible — cerrada; calefacción de cabina — cerrada en el firewall", "Corta el combustible y el aire del compartimento del motor que podrían seguir alimentando el fuego."],
        ["Ventilas delanteras cerradas, ventilas superiores abiertas, ventiladores ON; flaps 20°–completos; velocidad 80–85 KIAS", "Saca el humo de la cabina mientras preparas el aterrizaje forzado."],
        ["Ejecutar aterrizaje de emergencia sin motor", "Con fuego a bordo, el objetivo cambia: aterrizar ya, no llegar al aeropuerto más cómodo."],
      ]],
      ["fuego-electrico", "Fuego eléctrico en vuelo", [
        ["Interruptores de aviónica y todos los demás eléctricos — OFF", "Corta la corriente que alimenta el fuego; quedan disponibles los instrumentos de respaldo, que no son eléctricos."],
        ["Respaldo, generador y batería — OFF; ventilas cerradas; extintor — usar", "Aísla por completo el sistema eléctrico mientras se combate el fuego directamente."],
        ["Si el fuego se apaga y hace falta electricidad: batería ON, generador RESET, breakers revisados sin reiniciar el que falló, encender equipos uno por uno con pausa entre cada uno", "Reiniciar el breaker que falló puede volver a energizar el mismo cortocircuito que causó el fuego."],
      ]],
      ["fuego-arranque", "Fuego de motor al arrancar (en tierra)", [
        ["Arrancador — OFF; válvula de combustible — cerrada; batería — OFF", "Corta el combustible y la electricidad que alimentan el fuego."],
        ["Evacuar la aeronave; extinguir el fuego", "Un fuego de combustible en tierra puede propagarse en segundos; no vale la pena quedarse a apagarlo desde dentro."],
      ]],
      ["falla-generador", "Falla del generador", [
        ["Voltaje del bus — verificado; respaldo (STBY ALT PWR) — confirmado ON", "El respaldo alterno puede sostener el sistema mientras se diagnostica el generador principal."],
        ["Si amperaje del generador es cero: breakers de campo revisados adentro, generador RESET", "Muchas fallas de generador se recuperan solo con un reinicio del breaker correspondiente."],
        ["Si no se recupera: generador TRIP, carga eléctrica reducida (luces, ventiladores, aire acondicionado y varios breakers no esenciales)", "El respaldo alterno tiene menos capacidad que el generador principal; hay que aligerar la carga para que alcance."],
        ["El vuelo puede continuar al destino con el respaldo alterno sosteniendo el sistema", "A diferencia de una falla eléctrica total, aquí sí queda una fuente de energía suficiente para terminar el vuelo con normalidad."],
      ]],
      ["falla-electrica", "Voltaje alto o bajo / falla eléctrica", [
        ["Voltaje del bus — monitoreado; si sube de 32.5 V, generador TRIP", "Un voltaje descontrolado puede dañar la batería y el resto del sistema eléctrico."],
        ["Si el voltaje baja de 24.5 V: breakers de campo revisados, generador RESET, respaldo alterno reiniciado (OFF y luego ON)", "Este reinicio recupera el sistema si la caída de tensión fue momentánea."],
        ["Si no se recupera: generador TRIP, respaldo OFF, carga eléctrica reducida al mínimo, terminar el vuelo como aterrizaje forzado", "Sin generador ni respaldo, solo queda la batería, que dura un tiempo limitado."],
      ]],
      ["perdida-aceite", "Pérdida de presión de aceite", [
        ["Indicación de presión de aceite — monitoreada para confirmar el aviso", "Confirma si es una falla real de lubricación o una lectura errónea del sensor."],
        ["Según criterio del piloto: seguir el checklist de falla de motor, o continuar con precaución preparando un aterrizaje de emergencia", "Sin presión de aceite confirmada, una falla de motor completa puede ser cuestión de minutos."],
      ]],
    ]),
    flujos: flujos("c208", [
      ["falla-vuelo", "Falla de motor en vuelo", ["Flaps arriba, bomba OFF, combustible cerrado", "Condición CORTE, ignición NORM", "Reencender solo si hay altura", "Velocidad de planeo: 100 KIAS (flaps arriba)"]],
      ["fuego-motor", "Fuego de motor en vuelo", ["Potencia IDLE, hélice EMBANDERAR", "Condición CORTE, combustible cerrado", "Calefacción cabina cerrada", "Aterrizaje de emergencia sin motor"]],
      ["falla-generador", "Falla del generador", ["Bus volts y respaldo verificados", "Breakers de campo revisados, generador RESET", "Si no se recupera: generador TRIP, reducir carga", "Continuar con el respaldo alterno"]],
    ]),
    vspeeds: [
      { clave: "Vr", nombre: "Rotación", valor: "70–75 kt" },
      { clave: "V50", nombre: "Ascenso inicial (flaps 20°)", valor: "85–95 kt" },
      { clave: "Vx", nombre: "Mejor ángulo de ascenso", valor: "72 kt" },
      { clave: "Vy", nombre: "Mejor tasa de ascenso", valor: "104 kt (nivel del mar a 10,000 ft) · 87 kt a 20,000 ft" },
      { clave: "Va", nombre: "Velocidad de maniobra", valor: "148 kt a 8,750 lb (137 kt a 7,500 lb)" },
      { clave: "Vglide", nombre: "Mejor planeo (sin pod de carga)", valor: "97 kt a 8,750 lb · 90 kt a 7,500 lb" },
      { clave: "Vfe", nombre: "Máxima con flaps extendidos", valor: "175 kt (hasta 10°) / 150 kt (10° a 20°) / 125 kt (más de 20°)" },
      { clave: "Vmo", nombre: "Máxima de operación", valor: "175 kt" },
      { clave: "Vxw", nombre: "Viento cruzado demostrado", valor: "20 kt" },
    ],
    notaVspeeds: "Valores del POH del Cessna 208B con G1000, en KIAS; varias dependen del peso. Confirma los de tu avión y los de tu versión del simulador.",
    limites: {
      titulo: "Límites de operación",
      nota: "Del POH del 208B G1000, motor turbohélice Pratt & Whitney PT6A-114A. El límite oficial siempre es el de tu manual y tu simulador.",
      columnas: ["Límite", "Despegue", "Máx. continuo (crucero)", "Ralentí"],
      filas: [
        ["ITT máxima", "805 °C", "740 °C", "685 °C"],
        ["Ng máximo", "101.6 %", "101.6 %", "52 % mínimo"],
        ["RPM de hélice", "1,900", "1,600–1,900", "—"],
        ["Torque máximo", "según tabla de peso/altitud", "1,865 ft-lb", "—"],
      ],
    },
    sistemas: [
      {
        titulo: "Peso y factor de carga",
        texto: "Peso máximo de rampa 8,785 lb, de despegue 8,750 lb, de aterrizaje 8,500 lb. Factor de carga +3.8g/-1.52g con flaps arriba, +2.4g con flaps abajo — sin maniobras acrobáticas ni barrenas aprobadas.",
      },
      {
        titulo: "Motor de turbina (sin mezcla ni carburador)",
        texto: "Tres palancas: potencia, hélice (RPM) y condición (combustible: CUTOFF / LOW IDLE / HIGH IDLE, en vez de la llave de un motor a pistón). El motor de arranque exige ciclos de descanso (30 s ON / 60 s OFF con batería) para no sobrecalentarse, y nunca se retarda la palanca de potencia por debajo de IDLE en vuelo — puede llevar a una sobrevelocidad del motor.",
      },
      {
        titulo: "Hélice reversible",
        texto: "Además de avanzar y embanderarse, la hélice puede ir a rango beta (paso negativo) para frenar en el rodaje y el aterrizaje, reduciendo hasta un 10% la distancia de aterrizaje. Usarla en exceso en el rodaje desgasta las palas antes de tiempo.",
      },
      {
        titulo: "Eléctrico con respaldo",
        texto: "Un generador principal alimenta el sistema; un alternador de respaldo (standby) puede sostenerlo con menos capacidad si el generador falla, permitiendo terminar el vuelo con carga reducida en vez de forzar un aterrizaje inmediato como en un avión sin ese respaldo.",
      },
    ],
  },

  dakota: {
    id: "dakota",
    nombre: "Piper PA-28-236 Dakota",
    nota: `Cuatro plazas de tren fijo con motor Lycoming O-540-J3A5D de 235 hp a carburador, hélice de velocidad constante, selector de combustible por tanque (sin posición AMBOS) y estabilizador con trim. ${avisoPoh("Piper PA-28-236 Dakota, POH VB-910")} Las velocidades están en KIAS.`,
    normal: fases("dkn", [
      ["prevuelo-cabina", "Prevuelo: cabina", [
        ["Volante — liberar los seguros; freno de estacionamiento — aplicado", "Un seguro olvidado restringe el control justo al rodar, y el freno evita que el avión se mueva mientras revisas la cabina."],
        ["Todos los interruptores y la aviónica — OFF; mezcla — CORTE (idle cut-off)", "Evita que el motor arranque solo y protege la aviónica del pico de voltaje del arranque."],
        ["Master — ON: cantidad de combustible y panel de anunciadores verificados; luego master — OFF", "Confirma el combustible real y que el sistema de alertas funcione, sin gastar batería innecesariamente."],
        ["Controles primarios y flaps — operación correcta; trim — neutral", "Un control restringido o un trim mal puesto solo se detecta con seguridad en tierra."],
        ["Pitot y estática — drenar; ventanas y parabrisas — limpios", "Agua acumulada en las líneas da lecturas de velocidad y altímetro erróneas."],
        ["Documentos requeridos — a bordo; equipaje y herramienta de remolque — bien estibados", "Volar sin documentos es ilegal, y una herramienta suelta puede golpear los controles en turbulencia."],
      ]],
      ["prevuelo-exterior", "Prevuelo: exterior", [
        ["Ala derecha — superficie libre de hielo, escarcha y nieve; flap, alerón, bisagras y luz de la punta", "Hielo o escarcha en el ala cambia su forma y reduce la sustentación de forma impredecible."],
        ["Tanque de combustible — cantidad a la vista y tapa segura; venteo despejado; drenar el sumidero y revisar agua, sedimento y grado", "El agua se asienta en el fondo del tanque; si llega al motor, lo apaga sin aviso."],
        ["Tren principal — amortiguador con la inflación correcta (4.5 in), llanta y freno; calzas y amarres fuera", "Un amortiguador mal inflado transmite todo el impacto del aterrizaje a la estructura."],
        ["Nariz — cofia asegurada, hélice y spinner sin daños, entradas de aire libres y tensión de la banda del alternador", "Una banda floja del alternador puede patinar y dejarte sin carga eléctrica en vuelo."],
        ["Tren de nariz — amortiguador (3.25 in) y llanta; aceite — cantidad correcta y varilla bien asentada; filtro de combustible — drenar", "Poco aceite reduce la lubricación y puede provocar una falla de motor por sobrecalentamiento."],
        ["Ala izquierda — mismo recorrido (superficie, tanque, sumidero, tren, amarres); tubo pitot — cubierta fuera y orificios libres", "Un pitot tapado da lecturas de velocidad falsas o nulas en pleno vuelo."],
        ["Fuselaje y cola — antenas, tomas estáticas libres, estabilizador y trim tab, sin hielo; amarre de cola fuera", "Una toma estática bloqueada afecta al altímetro y al velocímetro, no solo al pitot."],
        ["Master ON: luces de navegación y estrobo, aviso de pérdida y calefacción del pitot — verificados; luego todo OFF", "Es tu única alerta antes de una pérdida y tu única forma de ser visto de noche; confirmarlo en tierra es gratis."],
        ["Pasajeros a bordo, puerta cerrada y asegurada; cinturones y arneses ajustados", "Una puerta mal cerrada puede abrirse en vuelo por la presión del aire."],
      ]],
      ["antes-arrancar", "Antes de arrancar", [
        ["Freno de estacionamiento — aplicado", "Evita que el avión se mueva solo al arrancar el motor."],
        ["Hélice — RPM altas (full INCREASE)", "Da el mayor par de arranque disponible, más fácil para el motor de arranque."],
        ["Selector de combustible — tanque deseado", "El Dakota no tiene posición AMBOS: siempre estás alimentando de un solo tanque, y hay que elegirlo a propósito."],
        ["Calefacción de carburador — OFF; radios — OFF", "El calentador solo se usa en vuelo, y las radios se apagan para no dañarlas con el pico de voltaje del arranque."],
      ]],
      ["arranque", "Arranque del motor", [
        ["En frío: master ON, bomba eléctrica de combustible ON, mezcla RICH a fondo y acelerador 1/4 abierto", "Ceba el sistema de combustible antes de que el motor de arranque siquiera gire."],
        ["Starter — accionar y ajustar el acelerador; presión de aceite — verificar", "Si la presión no sube en los primeros segundos, el motor se está quedando sin lubricación y hay que apagarlo."],
        ["Si no enciende: 1 a 3 golpes de la bomba de cebado y repetir; con el motor en marcha, cebador asegurado", "Un cebador sin asegurar puede vibrar y abrirse solo, enriqueciendo la mezcla sin que lo notes."],
        ["En caliente: acelerador 1/2 pulgada abierto y la misma secuencia, sin cebar", "Un motor caliente ya tiene combustible vaporizado en el sistema; cebarlo de más lo ahoga."],
        ["Ahogado: acelerador a fondo, bomba eléctrica OFF, mezcla en corte; arrancar, avanzar la mezcla y reducir el acelerador", "Girar el motor con el acelerador abierto y sin mezcla despeja el exceso de combustible de los cilindros."],
      ]],
      ["rodaje", "Calentamiento y rodaje", [
        ["Calentamiento — acelerador a 1,000–1,200 RPM", "Deja que el aceite circule y caliente el motor antes de exigirle potencia."],
        ["Calzas fuera y área de rodaje despejada; freno de estacionamiento — liberado", "Rodar con calzas puestas puede dañar el tren o las propias calzas."],
        ["Acelerador — aplicar despacio; hélice — RPM altas", "Una aplicación brusca de potencia puede hacer que el avión se mueva antes de que estés listo para controlarlo."],
        ["Frenos y dirección — probados al iniciar el movimiento", "Confirma que responden antes de necesitarlos para detener el avión."],
      ]],
      ["prueba-motor", "Prueba de motor (run-up)", [
        ["Freno de estacionamiento — aplicado; hélice — full INCREASE; acelerador — 2,000 RPM", "Es el régimen al que el manual valida la caída de RPM de los magnetos."],
        ["Magnetos — caída máxima de 175 RPM y diferencia máxima entre ambos de 50 RPM", "Una caída mayor señala una bujía o magneto fallando, que puede dejarte con menos potencia o sin motor en vuelo."],
        ["Succión (vacío) — 5.0 in Hg; temperatura y presión de aceite — verificadas", "El vacío alimenta los giróscopos; sin el valor correcto, el horizonte y el direccional pueden fallar en vuelo."],
        ["Anunciadores — press-to-test; calefacción de carburador — probada", "Confirma que el sistema de alertas y el anti-hielo del carburador realmente funcionan antes de necesitarlos."],
        ["Hélice — ejercitarla (ciclo) y regresar a full INCREASE", "Mueve el aceite espeso por el gobernador de la hélice antes del despegue, cuando más se necesita respuesta rápida."],
        ["Bomba eléctrica — OFF; presión de combustible — verificada; acelerador — atrás", "Confirma que la bomba mecánica del motor sostiene la presión sin ayuda de la eléctrica."],
      ]],
      ["antes-despegue", "Antes de despegue", [
        ["Instrumentos de vuelo y del motor — verificados; selector de combustible — tanque adecuado", "Detecta un problema mientras aún estás en tierra y puedes abortar con seguridad."],
        ["Bomba eléctrica — ON; calefacción de carburador — OFF", "La bomba eléctrica respalda la presión de combustible justo en el momento de mayor demanda de potencia."],
        ["Respaldos erguidos; cebador asegurado; mezcla y hélice — ajustadas", "Deja la cabina y el motor listos para máxima potencia sin sorpresas."],
        ["Cinturones y arneses ajustados, también en los asientos vacíos; puertas aseguradas", "Un arnés suelto en un asiento vacío puede golpear los controles o a un pasajero en turbulencia."],
        ["Flaps y trim — para el despegue; controles — libres", "La posición correcta de flaps y trim facilita el control justo al despegar, cuando menos tiempo tienes para corregir."],
        ["Aire acondicionado — OFF (si está instalado); freno de estacionamiento — liberado", "El aire acondicionado consume potencia del motor que conviene reservar para el despegue."],
      ]],
      ["despegue", "Despegue", [
        ["Normal: flaps y trim ajustados; acelerar a 60–65 KIAS y rotar con presión hacia atrás", "Rotar antes de esta velocidad puede hacer que el avión despegue sin suficiente sustentación."],
        ["Pista corta con obstáculo: flaps 25° (segundo punto); rotar a 50–60 KIAS según el peso; ya en el aire, 73 KIAS (Vx) para pasar el obstáculo; luego 85 KIAS (Vy) y retraer flaps despacio", "Vx da la mayor altura por distancia recorrida, justo lo que necesitas para librar un obstáculo cercano."],
        ["Pista corta sin obstáculo: flaps 25° y el mismo procedimiento, acelerando directamente a 85 KIAS (Vy)", "Sin obstáculo que librar, conviene la mejor tasa de ascenso (Vy) en vez de la mejor ángulo (Vx)."],
        ["Pista blanda: flaps 25°; levantar la nariz lo antes posible y despegar a la menor velocidad posible; en efecto suelo, 73 KIAS (con obstáculo) u 85 KIAS; retraer flaps despacio", "Quitar peso de la rueda de nariz lo antes posible evita que se entierre en terreno blando."],
      ]],
      ["ascenso", "Ascenso", [
        ["Mejor tasa (flaps arriba): 85 KIAS; mejor ángulo: 73 KIAS; en ruta: 100 KIAS", "Cada velocidad sirve a un objetivo distinto: ganar altura rápido, librar un obstáculo, o balancear velocidad y enfriamiento del motor en ruta."],
        ["Bomba eléctrica de combustible — OFF al alcanzar la altitud deseada", "Ya no hace falta el respaldo de presión una vez estabilizado en la altitud de crucero."],
      ]],
      ["crucero", "Crucero", [
        ["Potencia — según la tabla de potencia; máximo normal 75 %", "Reduce el desgaste del motor y el consumo de combustible frente a volar a máxima potencia."],
        ["Mezcla — ajustada", "El aire se enrarece con la altitud; sin ajustar la mezcla el motor recibe demasiado combustible y pierde eficiencia."],
      ]],
      ["descenso", "Descenso", [
        ["Normal: acelerador para unos 1,000 ft/min; hélice 2,400 RPM; velocidad no mayor de 137 KIAS (Vno); mezcla rica", "Pasar de Vno fuera de aire calmo puede exceder los límites estructurales del avión."],
        ["Calefacción de carburador — ON si hay riesgo de hielo", "El riesgo de hielo en el carburador aumenta justo al reducir potencia para descender."],
        ["Sin potencia: calefacción de carburador ON si hace falta y acelerador cerrado; verificar la potencia con el acelerador cada 30 segundos", "Un motor en ralentí prolongado puede enfriarse demasiado o acumular hielo sin que lo notes hasta que lo necesitas."],
      ]],
      ["aterrizaje", "Aproximación y aterrizaje", [
        ["Selector de combustible — tanque adecuado; bomba eléctrica — ON", "La bomba eléctrica respalda la presión de combustible en la fase donde un motor y al aire es más probable."],
        ["Respaldos erguidos; cinturones y arneses ajustados; aire acondicionado — OFF", "Deja el avión y a los ocupantes listos para un aterrizaje o un motor y al aire en cualquier momento."],
        ["Mezcla y hélice — ajustadas", "Necesitas la mezcla rica y la hélice en RPM altas disponibles para una potencia de motor y al aire inmediata."],
        ["Flaps — abajo, sin exceder 102 KIAS", "Extenderlos por encima de esa velocidad excede el límite estructural del flap."],
        ["Trim — para 72 KIAS (aproximación final con flaps 40°)", "Un trim ajustado a la velocidad de aproximación reduce la carga de control justo antes de aterrizar."],
      ]],
      ["apagado", "Apagado y estacionamiento", [
        ["Flaps — retraídos; bomba eléctrica, aire acondicionado y radios — OFF", "Evita descargar la batería entre vuelos y deja los flaps protegidos del viento."],
        ["Hélice — full INCREASE; acelerador — atrás; mezcla — CORTE; magnetos — OFF; master — OFF", "Es la forma correcta de apagar un motor a carburador: corta el combustible en vez de solo la ignición."],
        ["Freno de estacionamiento — aplicado; volante asegurado con los cinturones; flaps arriba", "Evita que el avión ruede solo y protege el volante de golpes con el viento."],
        ["Calzas y amarres — puestos", "El viento puede mover o dañar un avión sin calzos ni amarres."],
      ]],
    ]),
    emergencia: fases("dke", [
      ["falla-despegue-tierra", "Falla de motor en el despegue (aún en tierra)", [
        ["Pista suficiente: acelerador cerrado de inmediato, frenos según se necesite y detenerse recto", "Detener el avión en la pista restante es más seguro que intentar volar con el motor ya fallando."],
        ["Pista insuficiente: acelerador cerrado, frenos, mezcla en corte, selector de combustible OFF, master OFF, magnetos OFF", "Corta combustible y chispa para reducir el riesgo de incendio mientras el avión aún se desliza."],
        ["Mantener el control direccional y esquivar obstáculos", "Perder el control lateral en el rodaje puede causar más daño que la propia falla de motor."],
      ]],
      ["falla-despegue-aire", "Falla de motor en el despegue (ya en el aire)", [
        ["Velocidad — sobre la de pérdida; control direccional — mantenido", "Perder el control buscando restablecer el motor es más peligroso que aterrizar derecho sin él."],
        ["Pista suficiente delante: aterrizar recto", "Es más seguro que virar a baja altura sin motor."],
        ["Pista insuficiente: acelerador cerrado, mezcla en corte, combustible OFF, master OFF, magnetos OFF, flaps según se necesite; solo virajes suaves", "A baja altura y sin motor, un viraje cerrado puede llevar al avión a una pérdida antes de llegar a un sitio seguro."],
        ["Si hay altura para intentar reencender: selector al otro tanque, bomba eléctrica ON, mezcla RICH y calefacción de carburador ON", "Cambiar de tanque descarta que la falla sea simplemente uno vacío mal seleccionado."],
        ["Si no regresa la potencia: aterrizaje sin motor", "Con altura limitada, seguir intentando reencender en vez de prepararse para aterrizar reduce tus opciones."],
      ]],
      ["falla-motor", "Falla de motor en vuelo", [
        ["Selector — al otro tanque con combustible; bomba eléctrica — ON; mezcla — RICH; calefacción de carburador — ON", "Muchas fallas de motor 'sin explicación' son simplemente un tanque vacío mal seleccionado, o hielo en el carburador."],
        ["Instrumentos del motor — buscar la causa; cebador — asegurado", "Identificar la causa a tiempo puede permitir corregirla en vez de solo planear hacia un aterrizaje forzado."],
        ["Sin presión de combustible: comprobar que el selector esté en un tanque con combustible", "Es la causa más simple y común de perder presión de combustible."],
        ["Sin potencia todavía: magnetos en L, luego R y otra vez BOTH; probar otros ajustes de acelerador y mezcla", "Aísla si la falla es de un solo magneto o bujía, en cuyo caso el motor puede seguir funcionando con el otro."],
        ["Con potencia recuperada: calefacción de carburador OFF y bomba eléctrica OFF", "Regresa el motor a su configuración normal una vez que ya no hace falta el respaldo."],
        ["Si no se recupera: mejor planeo a 85 KIAS con trim y prepararse para un aterrizaje sin motor", "Es la velocidad a la que el avión recorre la mayor distancia posible sin motor; cualquier otra reduce tus opciones de dónde aterrizar."],
      ]],
      ["aterrizaje-sin-motor", "Aterrizaje sin motor", [
        ["Trim para el mejor planeo (85 KIAS); elegir el mejor terreno y establecer una espiral", "Una espiral sobre el campo elegido te permite evaluarlo y llegar a él con la altura justa."],
        ["1,000 ft sobre el campo en la pierna con el viento para una aproximación normal", "Da margen para ajustar la aproximación si algo no sale según lo planeado."],
        ["Con el campo al alcance: 72 KIAS para el aterrizaje más corto, con toque de pérdida completa y flaps completos", "Minimiza la velocidad y la distancia de aterrizaje cuando el campo elegido es limitado."],
        ["Al comprometerse: ignición OFF, master OFF, selector de combustible OFF, mezcla en corte, cinturones y arneses ajustados", "Reduce el riesgo de incendio y de lesiones en el impacto."],
      ]],
      ["fuego-arranque", "Fuego en el motor durante el arranque", [
        ["Seguir girando el motor con el starter; mezcla en corte; acelerador abierto", "Puede apagar el fuego al aspirarlo hacia el motor, en vez de dejarlo alimentándose de aire quieto."],
        ["Bomba eléctrica OFF; selector de combustible OFF", "Corta el combustible que alimenta el fuego."],
        ["Abandonar el avión si el fuego continúa", "Un fuego de combustible en tierra puede propagarse en segundos; no vale la pena quedarse a apagarlo desde dentro."],
      ]],
      ["fuego-vuelo", "Fuego en vuelo", [
        ["Origen del fuego — verificar", "Un fuego de motor y uno eléctrico se combaten de forma distinta; confundirlos empeora la respuesta."],
        ["Fuego de motor: selector OFF, acelerador cerrado, mezcla en corte, bomba eléctrica OFF, calefacción y defroster OFF; prepararse para aterrizaje sin motor", "Elimina la fuente de combustible; reencender el motor solo alimentaría más el fuego."],
        ["Fuego eléctrico (humo en cabina): master OFF, calefacción y defroster OFF, ventilas abiertas para despejar la cabina; aterrizar en cuanto sea práctico", "Corta la corriente que alimenta el fuego y saca el humo de la cabina."],
      ]],
      ["indicaciones-motor", "Presiones y temperaturas", [
        ["Pérdida de presión de aceite: aterrizar lo antes posible y prepararse para aterrizaje sin motor", "Sin presión de aceite, una falla de motor completa puede ser cuestión de minutos."],
        ["Temperatura de aceite alta: aterrizar en el aeropuerto más cercano y prepararse para aterrizaje sin motor", "Un aceite sobrecalentado pierde capacidad de lubricar, adelantando el desgaste o la falla del motor."],
        ["Pérdida de presión de combustible: bomba eléctrica ON y comprobar que el selector esté en un tanque lleno", "La bomba eléctrica puede sostener la presión si la mecánica del motor está fallando."],
      ]],
      ["falla-electrica", "Falla eléctrica (anunciador ALT)", [
        ["Amperímetro — verificar que el alternador esté inoperante", "Confirma si es una falla real o solo una lectura pasajera."],
        ["Si marca cero: switch ALT OFF, reducir la carga eléctrica al mínimo, revisar y reiniciar el breaker ALT y volver a poner ALT ON", "Este reinicio recupera el sistema si la caída fue momentánea, sin necesidad de aterrizar de inmediato."],
        ["Si no regresa: ALT OFF y aterrizar en cuanto sea práctico; solo queda la batería", "Sin alternador, la batería sostiene el sistema por un tiempo limitado."],
      ]],
      ["hielo-carburador", "Hielo en el carburador y aspereza de motor", [
        ["Calefacción de carburador — ON; mezcla ajustada para la máxima suavidad", "El hielo en el carburador puede formarse incluso con temperaturas templadas y es una causa común de aspereza del motor."],
        ["Si continúa tras un minuto: calefacción OFF, bomba eléctrica ON, cambiar de tanque y revisar instrumentos", "Descarta otras causas si el hielo no era el problema real."],
        ["Magnetos en L, R y BOTH; si funciona bien con uno, seguir con ese a potencia reducida y mezcla RICH hasta el primer aeropuerto", "Aísla una bujía o magneto fallando y te permite seguir volando con el que sí funciona."],
      ]],
      ["sobrevelocidad-helice", "Sobrevelocidad de la hélice", [
        ["Acelerador — retardar; presión de aceite — revisar", "Reduce de inmediato el esfuerzo sobre una hélice que gira más rápido de lo seguro."],
        ["Control de la hélice — full DECREASE y luego ajustar; velocidad — reducir", "Intenta que el gobernador recupere el control del paso de la hélice."],
        ["Acelerador — el necesario para mantenerse por debajo de 2,400 RPM", "Una sobrevelocidad sostenida puede dañar el motor y la propia hélice."],
      ]],
      ["puerta-abierta", "Puerta abierta en vuelo", [
        ["Reducir la velocidad a 83 KIAS; ventilas cerradas; ventana de tormenta abierta", "Reduce la fuerza del aire sobre la puerta, facilitando cerrarla en vuelo."],
        ["Cerrar el seguro superior y el lateral; si están abiertos los dos, primero el lateral y luego el superior", "El orden correcto evita que la puerta se vuelva a abrir mientras aseguras el otro seguro."],
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
    limites: {
      titulo: "Límites de operación",
      nota: "Del POH del Dakota (VB-910), motor Lycoming O-540-J3A5D de 235 hp. El límite oficial siempre es el de tu manual y tu simulador.",
      columnas: ["Límite", "Valor"],
      filas: [
        ["Peso máximo de rampa", "3,011 lb"],
        ["Peso máximo de despegue/aterrizaje", "3,000 lb"],
        ["Carga máxima de equipaje", "200 lb"],
        ["Factor de carga positivo máximo", "3.8 G (sin acrobacia ni barrenas aprobadas)"],
        ["RPM máxima continua", "2,400 RPM"],
        ["Temperatura de aceite máxima", "245 °F"],
        ["Presión de aceite (mín–máx)", "25–100 PSI"],
        ["Presión de combustible (mín–máx)", "0.5–8 PSI"],
        ["Aceite del motor", "12 cuartos de capacidad total"],
        ["Combustible total / utilizable", "77 gal / 72 gal"],
      ],
    },
    sistemas: [
      {
        titulo: "Combustible",
        texto: "Dos tanques en las alas, cada uno con su propia salida directa al motor — a diferencia del 172 o el C185, el Dakota no tiene posición AMBOS: vuelas siempre de un solo tanque a la vez y hay que alternar tú mismo para mantener el peso balanceado. Una bomba eléctrica auxiliar respalda a la bomba mecánica del motor en el arranque, el despegue y el aterrizaje.",
      },
      {
        titulo: "Hélice de velocidad constante",
        texto: "A diferencia del C172/C152 de paso fijo, aquí una palanca separada controla las RPM del motor (el gobernador ajusta el paso de la hélice para mantenerlas). Más RPM da más potencia disponible pero también más ruido y desgaste; se reduce después del despegue y antes de aterrizar se regresa a RPM altas para tener respuesta inmediata si hace falta un motor y al aire.",
      },
      {
        titulo: "Eléctrico",
        texto: "Un alternador carga la batería y alimenta radios e instrumentos; el anunciador ALT avisa si deja de cargar. Sin panel de anunciadores tipo G1000, hay que vigilar activamente el amperímetro — el sistema no te va a interrumpir para avisarte.",
      },
      {
        titulo: "Carburador y anti-hielo",
        texto: "El motor mezcla aire y combustible en un carburador, sensible a formar hielo incluso con temperaturas templadas y humedad. El calentador de carburador desvía aire caliente y sin filtrar hacia la admisión — se prueba en el run-up y se usa solo cuando hace falta, nunca en tierra ni al despegar.",
      },
    ],
  },

  c185: {
    id: "c185",
    nombre: "Cessna 185 Skywagon",
    nota: `Avión de tren convencional (rueda de cola) y seis plazas, con motor Continental IO-520-D de 300 hp con inyección, hélice de velocidad constante, cowl flaps y seguro de la rueda de cola. ${avisoPoh("Cessna A185F Skywagon, manual del propietario de 1975")} Ese manual usa millas por hora: aquí van en nudos con las mph entre paréntesis.`,
    normal: fases("c185n", [
      ["prevuelo-cabina", "Prevuelo: cabina", [
        ["Seguro del volante — retirado; ignición — OFF", "Un seguro olvidado restringe el control justo al rodar."],
        ["Master — ON: cantidad de combustible verificada; luego master — OFF", "Confirma el combustible real sin gastar batería innecesariamente antes de arrancar."],
        ["Válvula de corte de combustible — ON (perilla adentro); selector de tanque, si está instalado — BOTH ON", "Sin esto no llega combustible al motor por gravedad ni por la bomba, sin importar cuánto haya en los tanques."],
        ["Puerta de equipaje — cerrada y asegurada", "Una puerta mal cerrada puede abrirse en vuelo por la presión del aire, o desbalancear el peso y balance."],
      ]],
      ["prevuelo-exterior", "Prevuelo: exterior", [
        ["Cola — retirar el seguro del timón y el amarre de cola; llanta de la rueda de cola inflada; superficies libres y seguras", "Un seguro de timón olvidado restringe el control direccional en tierra, donde más se usa en un tren convencional."],
        ["Alas — alerones libres y correctos; retirar los amarres; venteos de los tanques libres; llantas principales infladas", "Un venteo tapado impide que el combustible fluya parejo desde el tanque, sin importar cuánto tenga."],
        ["Combustible — cantidad a la vista y tapas seguras; drenar el sumidero de cada tanque y la válvula de la línea (bajo el fuselaje) para revisar agua, sedimento y grado", "El agua se asienta en el fondo del tanque; si llega al motor, lo apaga sin aviso."],
        ["Pitot — retirar la cubierta y comprobar que la entrada esté libre; venteo del aviso de pérdida libre", "Un pitot tapado da lecturas de velocidad falsas o nulas en pleno vuelo, y el aviso de pérdida es tu única alerta antes de una."],
        ["Nariz — tomas estáticas libres (ambos lados); hélice y spinner sin muescas ni fugas de aceite; filtro de aire de inducción sin restricciones", "Una muesca pequeña en la hélice puede crecer con la vibración del motor y romperla en pleno vuelo."],
        ["Aceite — nivel verificado (no operar con menos de 9 cuartos); coladera de combustible — jalar el drenaje unos 4 segundos y comprobar que cierre", "Menos de 9 cuartos no cumple el mínimo del manual y puede dejar al motor sin lubricación suficiente."],
        ["En clima frío, retirar hasta la menor acumulación de escarcha, hielo o nieve de alas, cola y superficies", "Hielo o escarcha cambia la forma del ala y reduce la sustentación de forma impredecible."],
      ]],
      ["antes-arrancar", "Antes de arrancar", [
        ["Inspección exterior — completa; asientos, cinturones y arneses — ajustados y asegurados", "Un asiento que se desliza en el despegue puede alejarte de los controles justo cuando más los necesitas."],
        ["Válvula de corte de combustible — ON; selector, si está instalado — BOTH ON", "Confirma de nuevo la única fuente de combustible del motor antes de girar la llave."],
        ["Frenos — probados y aplicados; radios, autopiloto y equipo eléctrico — OFF", "Evita que el avión se mueva al arrancar y protege la aviónica del pico de voltaje del arranque."],
        ["Flaps — revisar todas las posiciones; cowl flaps — ABIERTOS", "Los cowl flaps abiertos dan el máximo enfriamiento justo antes del esfuerzo del arranque y el rodaje."],
        ["Seguro de la rueda de cola — DESBLOQUEADO", "Bloqueado, la rueda de cola no gira libremente y complica el rodaje en curvas."],
      ]],
      ["arranque", "Arranque del motor", [
        ["Master — ON; mezcla — RICH; hélice — RPM altas; acelerador — cerrado", "Da el mayor par de arranque disponible y prepara el motor de inyección para cebarse."],
        ["Bomba auxiliar — ON; acelerador — avanzar para 8–10 GPH y volver a ralentí; bomba — OFF", "Es el cebado del sistema de inyección continua: sin esto, el motor no tiene combustible listo para prender."],
        ["Área de la hélice — despejada; ignición — START", "Avisa a cualquiera cerca de la hélice antes de que empiece a girar."],
        ["Acelerador — avanzar despacio; soltar la llave al encender; ralentí", "Sostener la llave más tiempo del necesario en START daña el motor de arranque."],
        ["Presión de aceite — verificar (30 s con clima normal, 60 s en frío); si no hay, apagar e investigar", "Si la presión no sube a tiempo, el motor se está quedando sin lubricación."],
        ["Si no enciende: mezcla en corte, acelerador abierto y girar el motor unos 15 s; luego repetir el arranque normal tras dejar enfriar el motor de arranque", "Despeja el exceso de combustible de los cilindros sin ahogar más el motor."],
      ]],
      ["antes-despegue", "Antes de despegue", [
        ["Freno de estacionamiento — aplicado; controles — libres y correctos", "Un control restringido solo se detecta con seguridad en tierra."],
        ["Compensadores de estabilizador y timón — ajustados; cowl flaps — abiertos", "Un trim mal puesto complica el control justo al despegar, cuando menos tiempo tienes para corregir."],
        ["Acelerador a 1,700 RPM: magnetos (caída máxima de 150 RPM y diferencia máxima entre ambos de 50 RPM); hélice — ciclo de RPM altas a bajas y regresar a altas; instrumentos del motor; succión (4.6 a 5.4 in Hg); amperímetro", "Una caída mayor de RPM señala una bujía o magneto fallando, que puede dejarte con menos potencia o sin motor en vuelo."],
        ["Instrumentos de vuelo y radios — verificados y ajustados; puertas — cerradas y aseguradas", "Detecta un problema mientras aún estás en tierra y puedes abortar con seguridad."],
        ["Seguro de la rueda de cola — según se desee; freno de estacionamiento — liberado", "Bloquearla ayuda en pistas con viento cruzado fuerte, a costa de un radio de giro mayor."],
        ["Fricción del acelerador — ajustada; flaps — 0° a 20°", "Sin fricción, el acelerador puede irse retrasando solo por vibración durante el despegue."],
      ]],
      ["despegue", "Despegue", [
        ["Normal: flaps 0° a 20°; acelerador a fondo y 2,850 RPM; elevador moderadamente con la cola baja", "Con tren convencional, una cola demasiado baja o alta cambia el ángulo de ataque del ala en la carrera de despegue."],
        ["Ascenso inicial a 87 kt (100 mph); flaps arriba una vez pasados los obstáculos", "Retirar los flaps antes de tiempo reduce sustentación de golpe."],
        ["Máximo rendimiento: flaps 20°; frenos aplicados; acelerador a fondo y 2,850 RPM; mezcla pobre para la elevación del campo; soltar los frenos", "Aplicar potencia máxima con frenos puestos permite que el motor llegue a su régimen completo antes de empezar a rodar."],
        ["Mantener la cola baja; ascender a 56 kt (64 mph) hasta librar los obstáculos; flaps arriba después", "Es la velocidad de mejor ángulo de ascenso: la mayor altura ganada por distancia recorrida, justo lo que necesitas para librar un obstáculo cercano."],
      ]],
      ["ascenso", "Ascenso", [
        ["Normal: 96 a 104 kt (110 a 120 mph); 25 in Hg y 2,550 RPM; mezcla pobre según la altitud; cowl flaps según se requiera", "Reduce el ruido y el desgaste del motor frente al ascenso de máximo rendimiento, a costa de tardar un poco más en subir."],
        ["Máximo rendimiento: 88 kt (101 mph) a nivel del mar, hasta 82 kt (94 mph) a 10,000 ft; acelerador a fondo y 2,700 RPM; mezcla pobre según la altitud; cowl flaps abiertos", "Es la mejor tasa de ascenso: la mayor altura ganada por minuto, útil para cruzar terreno alto rápido."],
      ]],
      ["crucero", "Crucero", [
        ["Potencia — de 15 a 25 in Hg y de 2,200 a 2,550 RPM (no más de 75 %)", "Reduce el desgaste del motor y el consumo de combustible frente a volar a máxima potencia continua."],
        ["Mezcla — pobre para crucero según la computadora de potencia o el indicador EGT; cowl flaps según se requiera; compensadores ajustados", "El aire se enrarece con la altitud; sin ajustar la mezcla el motor recibe demasiado combustible y pierde eficiencia."],
      ]],
      ["descenso", "Descenso", [
        ["Mezcla — enriquecer según se requiera; potencia — la deseada; cowl flaps — cerrados", "El motor necesita más combustible al bajar a menor altitud y mayor densidad de aire."],
      ]],
      ["antes-aterrizar", "Antes de aterrizar", [
        ["Mezcla — RICH; selector de combustible, si está instalado — BOTH ON; cowl flaps — cerrados; hélice — RPM altas", "Deja el motor listo para máxima potencia inmediata si hace falta un motor y al aire."],
        ["Velocidad — 74 a 83 kt (85 a 95 mph) con flaps arriba", "Aterrizar rápido alarga la carrera de aterrizaje y complica el control cerca del suelo."],
        ["Flaps — de 0° a 40° (por debajo de 96 kt, 110 mph); velocidad — 65 a 74 kt (75 a 85 mph) con flaps abajo", "Extenderlos por encima de esa velocidad excede el límite estructural del flap."],
        ["Compensadores — ajustados para el aterrizaje: aterrizar de tres puntos depende de tener el estabilizador compensado en el planeo", "Sin el trim correcto, la actitud de tres puntos es difícil de sostener justo antes de tocar."],
        ["Seguro de la rueda de cola — según se desee", "Bloquearla ayuda a mantener la dirección en el aterrizaje con viento cruzado."],
      ]],
      ["aterrizaje", "Aterrizaje (tren convencional)", [
        ["Técnica convencional para todos los ajustes de flaps; toque de tres puntos", "En tren convencional, un toque de tres puntos reparte el peso entre las tres ruedas y evita que la cola se azote."],
        ["Aterrizaje frustrado: acelerador a fondo y 2,850 RPM; flaps a 20°; 70 kt (80 mph); retraer flaps despacio; cowl flaps abiertos", "Retraer los flaps de golpe en un motor y al aire reduce sustentación justo cuando más se necesita."],
        ["Buena práctica de tren convencional (no viene en ese manual): mantener el timón activo hasta detenerse y frenar solo con la cola abajo", "Un tren convencional es inestable direccionalmente en tierra; dejar de corregir con el timón puede terminar en un giro brusco (ground loop)."],
      ]],
      ["despues-aterrizar", "Después de aterrizar", [
        ["Flaps — arriba; seguro de la rueda de cola — desbloqueado", "Con flaps arriba mejoran los frenos, y la rueda de cola libre facilita rodar en curvas."],
        ["Cowl flaps — abiertos; compensadores de estabilizador y timón — para el despegue", "Deja el avión listo para el enfriamiento en tierra y para el próximo despegue."],
      ]],
      ["apagado", "Apagado", [
        ["Freno de estacionamiento — aplicado; radios y equipo eléctrico — OFF", "Evita que el avión ruede solo y descargar la batería entre vuelos."],
        ["Mezcla — CORTE; ignición — OFF; master — OFF; seguro del volante — instalado", "Es la forma correcta de apagar un motor de inyección: corta el combustible en vez de solo la ignición."],
      ]],
    ]),
    emergencia: fases("c185e", [
      ["falla-despegue", "Falla de motor después del despegue", [
        ["Bajar el morro de inmediato para mantener velocidad y planear; aterrizar al frente con cambios pequeños de rumbo (rara vez hay altura para regresar a la pista)", "Perder velocidad buscando restablecer el motor es más peligroso que aterrizar derecho sin él."],
        ["Velocidad — 74 kt (85 mph); mezcla — corte; válvula de combustible — OFF", "Es la velocidad de mejor planeo justo después de despegar; cualquier otra reduce tus opciones de dónde aterrizar."],
        ["Ignición — OFF; master — OFF; flaps — según se requiera (40° recomendado)", "Reduce el riesgo de incendio antes del aterrizaje forzado."],
      ]],
      ["falla-vuelo", "Falla de motor en vuelo", [
        ["Mientras planeas, buscar la causa; si es posible reencender, velocidad de 78 kt (90 mph)", "Identificar la causa a tiempo puede permitir corregirla en vez de solo planear hacia un aterrizaje forzado."],
        ["Válvula de combustible — ON; selector, si está instalado — BOTH ON; mezcla — RICH", "Muchas fallas de motor 'sin explicación' son simplemente un tanque vacío mal seleccionado o la válvula cerrada."],
        ["Acelerador — abierto 1 pulgada; cebador — adentro y asegurado", "Deja el motor en posición de recibir combustible sin ahogarlo al reencender."],
        ["Bomba auxiliar — ON para obtener 4 a 6 GPH y luego OFF", "Ceba el sistema de inyección para el reencendido, igual que en el arranque normal."],
        ["Ignición — BOTH (o START si la hélice no gira sola)", "Si la hélice sigue girando por el viento, el motor reenciende solo al restablecer combustible y chispa."],
      ]],
      ["aterrizaje-forzado", "Aterrizaje forzado sin motor", [
        ["Velocidad — 78 kt (90 mph) con flaps arriba; 70 kt (80 mph) con flaps abajo", "Cualquier desviación de la velocidad de mejor planeo reduce el área alcanzable para aterrizar."],
        ["Mezcla — corte; válvula de combustible — OFF; ignición — OFF; master — OFF", "Reduce el riesgo de incendio en el impacto."],
        ["Flaps — según se requiera (40° recomendado); puertas — sin seguro antes de la aproximación", "Una puerta cerrada puede quedar atascada si la estructura se deforma en el impacto."],
        ["Toque en actitud de tres puntos; frenos — aplicar con fuerza", "Reparte el impacto entre las tres ruedas en vez de concentrarlo en el tren principal."],
      ]],
      ["aterrizaje-precaucion", "Aterrizaje de precaución con motor", [
        ["Sobrevolar el campo bajo con flaps 20° y 78 kt (90 mph) para inspeccionar el terreno; flaps arriba al ganar altura y velocidad", "Con motor disponible, vale la pena inspeccionar el sitio antes de comprometerte a aterrizar ahí."],
        ["Radio y switches eléctricos — OFF; flaps 40°; velocidad — 70 kt (80 mph)", "Reduce el riesgo eléctrico si el aterrizaje termina siendo más duro de lo planeado."],
        ["Master — OFF; puertas sin seguro; toque de tres puntos; ignición — OFF; frenos — aplicar con fuerza", "Mismo motivo que en el aterrizaje forzado: reduce riesgo eléctrico y de que la puerta se atasque."],
      ]],
      ["fuego-motor", "Fuego en el motor en vuelo", [
        ["Válvula de combustible — OFF; mezcla — corte; master — OFF", "Elimina la fuente de combustible y la corriente eléctrica que podrían seguir alimentando el fuego."],
        ["Calefacción y aire de cabina — OFF (excepto las ventilas superiores)", "El sistema de calefacción toma aire del compartimento del motor; dejarlo abierto mete humo a la cabina."],
        ["Velocidad — 104 kt (120 mph); si el fuego no se apaga, aumentar la velocidad de planeo para hallar una mezcla incombustible", "Más velocidad de aire a través del compartimento del motor puede sofocar el fuego."],
        ["Elegir un campo y hacer el aterrizaje forzado; no intentar reencender", "Reencender el motor solo alimentaría más el fuego."],
      ]],
      ["fuego-electrico", "Fuego eléctrico en vuelo", [
        ["Master — OFF; todos los switches de radio y eléctricos — OFF; ventilas, aire y calefacción — cerrados", "Corta la corriente que alimenta el fuego y evita que el humo se disperse por la cabina."],
        ["Extintor — activar (si hay uno)", "Ataca directamente el fuego en vez de solo cortar su fuente de energía."],
        ["Si el fuego se apagó y necesitas electricidad: master ON, revisar breakers (no reiniciar el que falló) y encender los equipos de uno en uno con una pausa hasta ubicar el cortocircuito", "Reiniciar el breaker que falló puede volver a energizar el mismo cortocircuito que causó el fuego."],
        ["Abrir las ventilas cuando el fuego esté completamente apagado", "Abrirlas antes puede reavivar el fuego con más oxígeno."],
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
    limites: {
      titulo: "Límites de operación",
      nota: "Del manual del propietario del A185F (1975), motor Continental IO-520-D de 300 hp. El límite oficial siempre es el de tu manual y tu simulador.",
      columnas: ["Límite", "Valor"],
      filas: [
        ["Peso máximo (categoría normal)", "3,350 lb"],
        ["Factor de carga, flaps arriba", "+3.8 g / -1.52 g"],
        ["Factor de carga, flaps abajo", "+2.0 g"],
        ["Potencia de despegue (5 min)", "300 hp a 2,850 RPM"],
        ["Potencia máxima continua", "285 hp a 2,700 RPM"],
        ["Temperatura de aceite máxima", "240 °F"],
        ["Presión de aceite (mín–máx)", "10–100 PSI (30–60 PSI en operación normal)"],
        ["Temperatura de culata máxima", "460 °F"],
        ["Aceite del motor", "12 cuartos de capacidad; no operar con menos de 9"],
        ["Combustible utilizable", "59–62 gal (tanques estándar) o 74–78 gal (alcance extendido), según el sistema instalado"],
      ],
    },
    sistemas: [
      {
        titulo: "Combustible",
        texto: "Dos tanques en las alas alimentan el motor por gravedad; según el equipo instalado, el avión tiene una sola válvula ON/OFF (alimentando de ambos a la vez) o un selector con posición BOTH. Una bomba eléctrica auxiliar respalda al sistema de inyección continua en el arranque, el despegue y el aterrizaje, y puede sostener el vuelo si falla la bomba mecánica del motor.",
      },
      {
        titulo: "Tren convencional (rueda de cola)",
        texto: "A diferencia del 172, 152 o Dakota, el C185 tiene la rueda pequeña atrás, no adelante. Es direccionalmente inestable en tierra: sin corrección activa de timón, puede girarse solo (ground loop), sobre todo al frenar o con viento cruzado. La rueda de cola tiene un seguro que ayuda a mantener el rumbo en el rodaje.",
      },
      {
        titulo: "Cowl flaps",
        texto: "Aletas en la parte baja del cofre del motor que se abren o cierran para regular cuánto aire de enfriamiento pasa por el motor. Abiertos en tierra y en ascenso, donde el motor trabaja más y hay poco viento relativo; cerrados en descenso, para no enfriarlo de golpe con la potencia ya reducida.",
      },
      {
        titulo: "Hélice de velocidad constante",
        texto: "Una palanca separada controla las RPM del motor; el gobernador ajusta el paso de la hélice para mantenerlas. Se usa en RPM altas para el despegue y el aterrizaje (máxima potencia disponible de inmediato) y se reduce en crucero para ahorrar combustible y ruido.",
      },
    ],
  },
};
