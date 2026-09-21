# -*- coding: utf-8 -*-
"""Guía PDF bilingüe (español | English): comunicaciones VFR, desde el inicio de operaciones hasta el estacionamiento.

Uso:  python automation/guias/guia_comunicaciones_vfr.py   (escribe public/downloads/guia-comunicaciones-vfr.pdf)
Base: fraseología estándar de la OACI (Doc 4444 y Doc 9432). Los ejemplos usan XB-VLA y Guadalajara.
Solo Helvetica: no usar flechas ni símbolos fuera de WinAnsi (se ven como cuadros negros).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from pdf_base import *  # noqa: F401,F403

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(RAIZ, "public", "downloads", "guia-comunicaciones-vfr.pdf")

def portada(c, doc):
    c.saveState()
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    x0, y0 = W - 3.4 * cm, 6.6 * cm
    c.setStrokeColor(colors.HexColor("#1E2A44"))
    c.setLineWidth(1)
    for k in range(6):
        c.circle(x0, y0, 3.0 * cm + k * 0.9 * cm, fill=0, stroke=1)
    c.setStrokeColor(GOLD)
    c.setLineWidth(2.2)
    c.circle(x0, y0, 3.0 * cm, fill=0, stroke=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(x0, y0 + 0.2 * cm, "ES")
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(x0, y0 - 0.55 * cm, "|")
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(x0, y0 - 1.6 * cm, "EN")
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(2.2 * cm, H - 3.0 * cm, "VILLANUEVA AVIATION")
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.4)
    c.line(2.2 * cm, H - 3.3 * cm, 6.2 * cm, H - 3.3 * cm)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 38)
    c.drawString(2.2 * cm, H - 8.0 * cm, "Comunicaciones")
    c.drawString(2.2 * cm, H - 9.5 * cm, "VFR")
    c.setFont("Helvetica", 17)
    c.setFillColor(colors.HexColor("#CBD5E1"))
    c.drawString(2.2 * cm, H - 10.8 * cm, "VFR Communications  -  Español | English")
    c.setFont("Helvetica", 12.5)
    for i, t in enumerate([
        "Desde que enciendes el motor hasta que estacionas:",
        "arranque  •  rodaje  •  salida  •  ruta  •  espacio aéreo",
        "circuito  •  aterrizaje  •  estacionamiento",
        "emergencias, falla de radio y ejercicios con respuestas.",
    ]):
        c.drawString(2.2 * cm, H - 12.6 * cm - i * 0.7 * cm, t)
    c.setFont("Courier-Bold", 10)
    c.setFillColor(GOLD)
    c.drawString(2.2 * cm, 4.0 * cm, "Guadalajara Torre, XB-VLA, listo para salida, pista dos cero.")
    c.setFont("Helvetica-Bold", 10)
    c.drawString(2.2 * cm, 2.6 * cm, "Aprende. Practica. Comunica. Vuela.")
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica", 8.5)
    c.drawString(2.2 * cm, 2.05 * cm, "villanueva-aviation.pages.dev  •  Material de estudio para formación y simulación")
    c.restoreState()


def pagina(c, doc):
    c.saveState()
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(1.8 * cm, H - 1.25 * cm, W - 1.8 * cm, H - 1.25 * cm)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(GOLD)
    c.drawString(1.8 * cm, H - 1.05 * cm, "VILLANUEVA AVIATION")
    c.setFillColor(GRAY)
    c.setFont("Helvetica", 8)
    c.drawRightString(W - 1.8 * cm, H - 1.05 * cm, "Comunicaciones VFR  |  VFR Communications")
    c.drawString(1.8 * cm, 1.0 * cm, "Material educativo para simulación y formación. No sustituye instrucción oficial ni los procedimientos locales vigentes.")
    c.drawRightString(W - 1.8 * cm, 1.0 * cm, f"Página {doc.page}")
    c.restoreState()


story = [NextPageTemplate("normal"), PageBreak()]

# --- 0 ---
story += section("0", "Cómo usar esta guía  |  How to use this guide", "Un vuelo VFR completo, de la plataforma a la plataforma")
story.append(P(
    "La guía sigue tu vuelo en orden: <b>inicio de operaciones, rodaje, salida, ruta, espacio aéreo controlado, "
    "circuito, aterrizaje y estacionamiento</b>. En cada fase verás la frase en <b>español</b> y en <b>inglés</b> lado a lado, "
    "porque en simulación en línea (IVAO, VATSIM) suele usarse inglés, y con ATC en español, el español. "
    "Los recuadros azules son lo que dice el <b>control</b>; los blancos, lo que dices tú."))
story.append(P(
    "<b>Base:</b> fraseología estándar de la OACI. Las frecuencias, los nombres de dependencias y los procedimientos "
    "particulares de cada aeródromo cambian: confírmalos con las publicaciones oficiales. Los ejemplos usan la matrícula "
    "<b>XB-VLA</b>, un Cessna 172 y el aeropuerto de Guadalajara, y las frecuencias son solo de ejemplo. Las frases en inglés se escriben con la pronunciación OACI de los números (<i>wun, too, tree, fower, fife, niner</i>) para que las practiques en voz alta."))
story.append(Spacer(1, 4))
story.append(box("Regla de oro  |  Golden rule", [
    "<b>Escucha, piensa, habla.</b> Antes de pulsar el botón de transmitir, sabe qué vas a decir. Una llamada corta y "
    "completa vale más que tres llamadas improvisadas.",
    "<i>Listen, think, talk. Know what you will say before you press the button.</i>",
], color=GOLD))

story.append(Paragraph("Alfabeto y números  |  Alphabet and numbers", h2))
letras = ["Alfa", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India", "Juliett", "Kilo", "Lima", "Mike",
          "November", "Oscar", "Papa", "Quebec", "Romeo", "Sierra", "Tango", "Uniform", "Victor", "Whiskey", "X-ray", "Yankee", "Zulu"]
filas = []
for r in range(7):
    fila = []
    for k in range(4):
        i = r + 7 * k
        fila.append(f"<b>{'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]}</b>  {letras[i]}" if i < 26 else "")
    filas.append(fila)
t = Table([[Paragraph(x, cell) for x in f] for f in filas], colWidths=[ANCHO / 4] * 4)
t.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), LIGHT), ("LINEBELOW", (0, 0), (-1, -2), 0.3, colors.HexColor("#D5D9E0")),
    ("TOPPADDING", (0, 0), (-1, -1), 2.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
]))
story.append(t)
story.append(Spacer(1, 5))
story.append(bi([
    ("<b>Números dígito por dígito:</b> 0 cero, 1 uno, 2 dos, 3 tres, 4 cuatro, 5 cinco, 6 seis, 7 siete, 8 ocho, 9 nueve. "
     "Pista 20: <i>pista dos cero</i>.",
     "<b>Digit by digit:</b> 0 zero, 1 wun, 2 too, 3 tree, 4 fower, 5 fife, 6 six, 7 seven, 8 eight, 9 niner. "
     "Runway 20: <i>runway too zero</i>."),
    ("<b>Frecuencias:</b> 121.9 se dice <i>uno dos uno decimal nueve</i>.",
     "<b>Frequencies:</b> 121.9 is <i>wun too wun decimal niner</i>."),
    ("<b>Altitudes:</b> 4,500 ft = <i>cuatro mil quinientos pies</i>. Rumbo 180 = <i>rumbo uno ocho cero</i>.",
     "<b>Altitudes:</b> 4,500 ft = <i>fower thousand fife hundred feet</i>. Heading 180 = <i>heading wun eight zero</i>."),
    ("<b>Altímetro</b> (en México se reporta en pulgadas de mercurio): A3005 = <i>altímetro tres cero cero cinco</i>.",
     "<b>Altimeter</b> (reported in inches of mercury): A3005 = <i>altimeter tree zero zero fife</i>."),
    ("<b>Tu matrícula</b> se dice letra por letra: XB-VLA = <i>X-ray Bravo Victor Lima Alfa</i>; después del primer contacto, el control "
     "puede abreviarla (<i>Victor Lima Alfa</i>).",
     "<b>Your callsign</b> is spoken letter by letter: XB-VLA = <i>X-ray Bravo Victor Lima Alfa</i>; after first contact, ATC may "
     "shorten it (<i>Victor Lima Alfa</i>)."),
]))
story.append(PageBreak())

# --- 1 ---
story += section("1", "Palabras clave y estructura  |  Key words and structure", "Lo que significa cada palabra, y cómo armar un mensaje")
story.append(bi([
    ("<b>Afirmativo</b> = sí. <b>Negativo</b> = no.", "<b>Affirm</b> = yes. <b>Negative</b> = no."),
    ("<b>Recibido</b> (Roger) = recibí tu mensaje. No significa que lo vayas a cumplir.",
     "<b>Roger</b> = I received your message. It does not mean you will comply."),
    ("<b>Cumpliré</b> (Wilco) = recibí y voy a cumplir.", "<b>Wilco</b> = received and will comply."),
    ("<b>Repita</b> = repite tu último mensaje. <b>Confirme</b> = ¿es correcto lo que entendí?",
     "<b>Say again</b> = repeat your last message. <b>Confirm</b> = is what I understood correct?"),
    ("<b>Espere</b> = espera, te llamo. <b>Corrección</b> = me equivoqué, va de nuevo.",
     "<b>Stand by</b> = wait, I will call you. <b>Correction</b> = I made an error, here is the right one."),
    ("<b>Imposible</b> = no puedo cumplir. <b>Ignore</b> = ignora lo último que dije.",
     "<b>Unable</b> = I cannot comply. <b>Disregard</b> = ignore my last message."),
    ("<b>Solicito</b> = pido algo. <b>Notifique</b> = avísame cuando. <b>Mantenga</b> = continúa con.",
     "<b>Request</b> = I ask for something. <b>Report</b> = let me know when. <b>Maintain</b> = continue at."),
    ("<b>Hable más despacio</b> = habla más lento.", "<b>Speak slower</b>."),
]))
story.append(Paragraph("La llamada básica: a quién, quién, dónde, qué  |  The basic call: who, who, where, what", h2))
story.append(dialogo([
    ("P", "<b>Guadalajara Torre</b>, <b>XB-VLA</b>, <b>Cessna 172</b>, <b>en punto de espera pista dos cero</b>, <b>listo para salida</b>.",
     "<b>Guadalajara Tower</b>, <b>XB-VLA</b>, <b>Cessna 172</b>, <b>holding point runway two zero</b>, <b>ready for departure</b>."),
]))
story.append(P("Primero el lugar y la dependencia (<i>Guadalajara Torre</i>), después tu matrícula, tu posición y lo que necesitas."))
story.append(Spacer(1, 3))
story.append(box("Readback: lo que siempre se lee de vuelta  |  What you must always read back", [
    "Pista en uso, <b>punto de espera</b> (mantenga corto), <b>alinee y espere</b>, <b>cruce pista</b>, <b>autorizado a despegar</b>, "
    "<b>autorizado a aterrizar</b>; además rumbos, altitudes, frecuencias, ajuste del altímetro y código del transponder.",
    "<i>Runway in use, hold short, line up and wait, cross runway, cleared for take-off, cleared to land; also headings, levels, "
    "frequencies, altimeter settings and transponder codes.</i>",
    "Termina el readback con tu matrícula. Si dudas de algo, pide que lo repitan antes de moverte.",
], color=RED, fondo=colors.HexColor("#FEF2F2")))
story.append(PageBreak())

# --- 2 ---
story += section("2", "Inicio de operaciones  |  Start of operations", "ATIS, autorización y arranque de motores")
story.append(P(
    "Antes de llamar, ya tienes: la <b>información ATIS</b>, tu <b>plan de vuelo</b> presentado (si aplica), tus datos a la mano "
    "(matrícula, tipo, ruta, altitud) y tu checklist previo. <i>Before calling, you should have the ATIS, your flight plan, "
    "your data at hand and your checklist done.</i>"))
story.append(Paragraph("ATIS (ejemplo)", h2))
story.append(bi([
    ("<i>Guadalajara, información <b>Bravo</b>, hora uno ocho cero cero Zulú, viento dos uno cero grados ocho nudos, visibilidad seis "
     "millas, nubes dispersas mil ochocientos pies, temperatura dos uno, punto de rocío uno nueve, altímetro tres cero cero cinco, "
     "pista en uso dos cero.</i>",
     "<i>Guadalajara information <b>Bravo</b>, time wun eight zero zero Zulu, wind too wun zero degrees eight knots, visibility six miles, "
     "scattered clouds wun thousand eight hundred feet, temperature too wun, dew point wun niner, altimeter tree zero zero fife, "
     "runway in use too zero.</i>"),
]))
story.append(P("Anota la <b>letra</b> de la información: es lo primero que dirás al control. <i>Write down the information letter.</i>"))
story.append(Paragraph("Autorización y arranque  |  Clearance and start-up", h2))
story.append(dialogo([
    ("P", "Guadalajara Autorización, XB-VLA, Cessna 172, en plataforma de aviación general, VFR a Puerto Vallarta, solicito autorización, con información Bravo.",
     "Guadalajara Clearance, XB-VLA, Cessna 172, at the general aviation apron, VFR to Puerto Vallarta, request clearance, with information Bravo."),
    ("C", "XB-VLA, autorizado a Puerto Vallarta, salida por el poniente, mantenga diez mil quinientos pies, transponder cuatro dos uno cinco.",
     "XB-VLA, cleared to Puerto Vallarta, departure to the west, maintain wun zero thousand fife hundred feet, squawk fower too wun fife."),
    ("P", "Autorizado a Puerto Vallarta, salida poniente, diez mil quinientos, transponder cuatro dos uno cinco, XB-VLA.",
     "Cleared to Puerto Vallarta, departure west, wun zero thousand fife hundred, squawk fower too wun fife, XB-VLA."),
    ("P", "Guadalajara Tierra, XB-VLA, solicito arranque de motor.",
     "Guadalajara Ground, XB-VLA, request start-up."),
    ("C", "XB-VLA, arranque aprobado.", "XB-VLA, start-up approved."),
]))
story.append(P(
    "<i>Nota:</i> en muchos aeródromos no existe la dependencia de autorización (la pides a Tierra o a Torre) y el arranque "
    "no se solicita. Pregunta siempre: <b>\"solicito autorización\"</b> te lleva a la frecuencia correcta. "
    "<i>Many aerodromes have no clearance delivery; ask Ground or Tower.</i>"))
story.append(box("Nivel de crucero VFR  |  VFR cruising levels", [
    "Sobre 600 m (2,000 ft) AGL, en México los niveles VFR se ajustan al rumbo magnético: <b>de 000 a 179 grados, miles impares más "
    "500 ft</b> (por ejemplo 7,500); <b>de 180 a 359, miles pares más 500 ft</b> (por ejemplo 10,500). Confirma la regla vigente "
    "en la publicación oficial.",
    "<i>Above 2,000 ft AGL, VFR levels follow the magnetic track: 000-179 odd thousands plus 500; 180-359 even thousands plus 500.</i>",
], color=BLUE, fondo=colors.HexColor("#EFF6FF")))
story.append(PageBreak())

# --- 3 ---
story += section("3", "Rodaje  |  Taxi", "Ruta, punto de espera y cruce de pistas")
story.append(dialogo([
    ("P", "Guadalajara Tierra, XB-VLA, plataforma de aviación general, solicito rodaje, con información Bravo.",
     "Guadalajara Ground, XB-VLA, general aviation apron, request taxi, with information Bravo."),
    ("C", "XB-VLA, ruede a punto de espera pista dos cero por calle Alfa, mantenga corto de pista cero dos.",
     "XB-VLA, taxi to holding point runway two zero via Alpha, hold short of runway zero two."),
    ("P", "Rodaje a punto de espera pista dos cero por calle Alfa, mantengo corto de pista cero dos, XB-VLA.",
     "Taxi to holding point runway two zero via Alpha, holding short of runway zero two, XB-VLA."),
    ("C", "XB-VLA, cruce pista cero dos.", "XB-VLA, cross runway zero two."),
    ("P", "Cruzo pista cero dos, XB-VLA.", "Crossing runway zero two, XB-VLA."),
]))
story.append(Spacer(1, 4))
story.append(Paragraph("Instrucciones de rodaje frecuentes  |  Common taxi instructions", h2))
story.append(bi([
    ("Ruede con precaución.", "Taxi with caution."),
    ("Siga al Cessna (tipo) que rueda por su izquierda.", "Follow the Cessna (type) taxiing on your left."),
    ("Ceda el paso al tráfico (tipo).", "Give way to traffic (type)."),
    ("Detenga su avance. / Espere.", "Hold position. / Stand by."),
    ("Ruede por la calle Bravo hasta la plataforma.", "Taxi via Bravo to the apron."),
    ("Repita la ruta de rodaje, por favor.", "Say again taxi route, please."),
]))
story.append(Spacer(1, 4))
story.append(box("Incursión de pista  |  Runway incursion", [
    "<b>No cruces ni entres a una pista sin autorización clara y sin haberla leído de vuelta.</b> Si no estás seguro de la ruta o de "
    "dónde estás, detente y pregunta: <b>\"solicito instrucciones de rodaje\"</b> es una frase válida.",
    "<i>Never enter or cross a runway without a clear clearance and a readback. If unsure, stop and ask: \"request taxi instructions\".</i>",
], color=RED, fondo=colors.HexColor("#FEF2F2")))
story.append(PageBreak())

# --- 4 ---
story += section("4", "Prueba de motor y despegue  |  Run-up and take-off", "Listo, alinee y espere, autorizado")
story.append(P("Haz tu prueba de motor y tu checklist antes del punto de espera, sin bloquear la calle. <i>Do your run-up clear of the taxiway.</i>"))
story.append(dialogo([
    ("P", "Guadalajara Torre, XB-VLA, punto de espera pista dos cero, listo para salida.",
     "Guadalajara Tower, XB-VLA, holding point runway two zero, ready for departure."),
    ("C", "XB-VLA, alinee y espere pista dos cero.", "XB-VLA, line up and wait runway two zero."),
    ("P", "Alineo y espero pista dos cero, XB-VLA.", "Line up and wait runway two zero, XB-VLA."),
    ("C", "XB-VLA, viento dos uno cero grados ocho nudos, pista dos cero, autorizado a despegar.",
     "XB-VLA, wind two one zero degrees eight knots, runway two zero, cleared for take-off."),
    ("P", "Autorizado a despegar pista dos cero, XB-VLA.", "Cleared for take-off runway two zero, XB-VLA."),
]))
story.append(Spacer(1, 4))
story.append(bi([
    ("<b>Despegue inmediato:</b> \"Autorizado a despegar inmediato\".", "<b>Immediate take-off:</b> \"Cleared for immediate take-off\"."),
    ("<b>Cancelar:</b> \"Cancele el despegue, repito, cancele el despegue\". Aborta y contesta.", "<b>Cancel:</b> \"Cancel take-off, I say again, cancel take-off\". Abort and reply."),
    ("<b>Detener:</b> \"Deténgase inmediatamente\".", "<b>Stop:</b> \"Stop immediately\"."),
    ("<b>Espera con motor encendido:</b> \"Espere fuera de la pista\".", "<b>Hold clear:</b> \"Hold clear of the runway\"."),
]))
story.append(Spacer(1, 4))
story.append(box("Listo para salida, no listo para despegar  |  \"Ready for departure\"", [
    "La OACI recomienda usar la palabra <b>\"despegue\"</b> (take-off) solo en la autorización o en su cancelación, para evitar "
    "confusiones. Por eso se dice <b>\"listo para salida\"</b> (ready for departure). Algunos pilotos dicen \"listo para despegue\".",
    "<i>ICAO reserves the word \"take-off\" for the clearance and its cancellation; pilots report \"ready for departure\".</i>",
], color=GOLD))
story.append(PageBreak())

# --- 5 ---
story += section("5", "Salida y en ruta  |  Departure and en route", "Cambio de frecuencia, reportes, tráfico y altitud")
story.append(dialogo([
    ("C", "XB-VLA, contacte Aproximación uno dos cero decimal cinco.", "XB-VLA, contact Approach wun too zero decimal fife."),
    ("P", "Contacto Aproximación uno dos cero decimal cinco, XB-VLA.", "Contact Approach wun too zero decimal fife, XB-VLA."),
    ("P", "Guadalajara Aproximación, XB-VLA, Cessna 172, saliendo del circuito de Guadalajara por el poniente, seis mil quinientos ascendiendo a diez mil quinientos, VFR.",
     "Guadalajara Approach, XB-VLA, Cessna 172, leaving the Guadalajara circuit to the west, six thousand five hundred climbing to wun zero thousand fife hundred, VFR."),
    ("C", "XB-VLA, Guadalajara Aproximación, buenos días, continúe la salida, notifique fuera de la zona de control.",
     "XB-VLA, Guadalajara Approach, good morning, continue departure, report clear of the control zone."),
]))
story.append(Spacer(1, 4))
story.append(Paragraph("Reporte de posición  |  Position report", h2))
story.append(bi([
    ("<b>Orden:</b> a quién llamas, matrícula, posición, altitud, hora, siguiente punto.",
     "<b>Order:</b> station, callsign, position, level, time, next point."),
    ("<i>\"Guadalajara Aproximación, XB-VLA, sobre Ameca, siete mil quinientos, hora tres cinco, próximo punto Mascota.\"</i>",
     "<i>\"Guadalajara Approach, XB-VLA, over Ameca, seven thousand five hundred, time tree fife, next Mascota.\"</i>"),
]))
story.append(Paragraph("Tráfico y solicitudes  |  Traffic and requests", h2))
story.append(dialogo([
    ("C", "XB-VLA, tráfico a las dos, tres millas, mismo sentido, Cessna, siete mil quinientos.",
     "XB-VLA, traffic two o'clock, tree miles, same direction, Cessna, seven thousand five hundred."),
    ("P", "Tráfico a la vista, XB-VLA.", "Traffic in sight, XB-VLA."),
    ("P", "Buscando, XB-VLA.  (si aún no lo ves)", "Looking out, XB-VLA.  (if you do not see it yet)"),
    ("P", "Solicito descender a ocho mil quinientos, XB-VLA.", "Request descent to eight thousand five hundred, XB-VLA."),
    ("P", "Solicito desviación diez millas al norte por tormenta.", "Request deviation ten miles north due to weather."),
    ("C", "XB-VLA, frecuencia libre, buen vuelo.", "XB-VLA, frequency change approved, good day."),
]))
story.append(PageBreak())

# --- 6 ---
story += section("6", "Espacio aéreo controlado  |  Controlled airspace", "Entrar, cruzar y salir de una zona de control")
story.append(P(
    "En VFR necesitas <b>autorización expresa</b> para entrar a una zona de control o a un espacio aéreo controlado. "
    "Llama con tiempo, con tu posición y tus intenciones. <i>You need an express clearance to enter controlled airspace; call early "
    "with position and intentions.</i>"))
story.append(dialogo([
    ("P", "Guadalajara Aproximación, XB-VLA, Cessna 172, quince millas al poniente, siete mil quinientos, VFR, solicito autorización para entrar a la zona de control para aterrizaje, con información Charlie.",
     "Guadalajara Approach, XB-VLA, Cessna 172, wun fife miles west, seven thousand five hundred, VFR, request clearance to enter the control zone for landing, with information Charlie."),
    ("C", "XB-VLA, autorizado a entrar en la zona de control por el punto Ameca, mantenga VFR, mantenga siete mil quinientos, altímetro tres cero cero cinco.",
     "XB-VLA, cleared to enter the control zone via Ameca, remain VFR, maintain seven thousand five hundred, altimeter tree zero zero fife."),
    ("P", "Autorizado a entrar por Ameca, mantengo VFR, siete mil quinientos, altímetro tres cero cero cinco, XB-VLA.",
     "Cleared to enter via Ameca, remaining VFR, seven thousand five hundred, altimeter tree zero zero fife, XB-VLA."),
]))
story.append(Spacer(1, 4))
story.append(Paragraph("Cruzar o pedir seguimiento  |  Transit and flight following", h2))
story.append(bi([
    ("<i>\"Solicito cruzar la zona de control de este a oeste, siete mil quinientos.\"</i>", "<i>\"Request transit of the control zone east to west, seven thousand five hundred.\"</i>"),
    ("<i>\"Notifique sobre el punto Ameca.\"</i> / <i>\"Notifico sobre Ameca.\"</i>", "<i>\"Report over Ameca.\"</i> / <i>\"Will report over Ameca.\"</i>"),
    ("<i>\"Salga de la zona de control por el norte, mantenga VFR.\"</i>", "<i>\"Leave the control zone to the north, remain VFR.\"</i>"),
    ("<i>\"Imposible cumplir, entraría a nubes.\"</i>  (te niegas con seguridad)", "<i>\"Unable, would enter cloud.\"</i>  (you refuse for safety)"),
]))
story.append(Spacer(1, 4))
story.append(box("Si tu VFR se complica  |  If VFR becomes difficult", [
    "Si vas a perder las condiciones VFR, <b>avisa antes</b> y pide ayuda: <b>\"solicito regresar\"</b>, <b>\"solicito desviación\"</b> o declara "
    "<b>PAN-PAN</b>. Es preferible pedirla temprano que tarde.",
    "<i>If you are about to lose VMC, say so early and ask for help: request return, request deviation, or declare PAN-PAN.</i>",
], color=ORANGE, fondo=colors.HexColor("#FFF7ED")))
story.append(PageBreak())

# --- 7 ---
story += section("7", "Circuito y aterrizaje  |  Traffic pattern and landing", "En un aeródromo controlado y en uno sin torre")
story.append(Paragraph("Con torre  |  With a tower", h2))
story.append(dialogo([
    ("P", "Guadalajara Torre, XB-VLA, viento en cola izquierda pista dos cero.",
     "Guadalajara Tower, XB-VLA, left downwind runway two zero."),
    ("C", "XB-VLA, número dos, siga al Cessna en base.", "XB-VLA, number two, follow the Cessna on base."),
    ("P", "Número dos, tráfico a la vista, sigo al Cessna, XB-VLA.", "Number two, traffic in sight, following the Cessna, XB-VLA."),
    ("C", "XB-VLA, pista dos cero, viento dos uno cero grados ocho nudos, autorizado a aterrizar.",
     "XB-VLA, runway two zero, wind two one zero degrees eight knots, cleared to land."),
    ("P", "Autorizado a aterrizar pista dos cero, XB-VLA.", "Cleared to land runway two zero, XB-VLA."),
]))
story.append(Spacer(1, 4))
story.append(bi([
    ("<b>Toque y despegue:</b> \"Autorizado a toque y despegue pista dos cero\".", "<b>Touch-and-go:</b> \"Cleared touch-and-go runway two zero\"."),
    ("<b>Extienda:</b> \"Extienda viento en cola\", \"Extienda la final\".", "<b>Extend:</b> \"Extend downwind\", \"Extend final\"."),
    ("<b>Continúe:</b> \"Continúe la aproximación, espere tráfico en pista\".", "<b>Continue:</b> \"Continue approach, expect traffic on the runway\"."),
    ("<b>Al aire:</b> \"Motor y al aire, XB-VLA\" (lo dices tú).", "<b>Go around:</b> \"Going around, XB-VLA\" (you say it)."),
]))
story.append(Paragraph("Sin torre (frecuencia común)  |  Non-towered aerodrome", h2))
story.append(P(
    "Nadie autoriza nada: tú <b>informas</b> y cada quien se auto-separa. Anuncia tu posición en cada tramo, y mira siempre. "
    "<i>No one clears you; you broadcast and everyone separates themselves.</i>"))
story.append(dialogo([
    ("P", "Tráfico [aeródromo], XB-VLA, Cessna 172, diez millas al este, dos mil pies, VFR, para aterrizar pista dos cero.",
     "[Aerodrome] traffic, XB-VLA, Cessna 172, wun zero miles east, too thousand feet, VFR, for landing runway two zero."),
    ("P", "Tráfico [aeródromo], XB-VLA, entrando viento en cola izquierda pista dos cero.",
     "[Aerodrome] traffic, XB-VLA, joining left downwind runway two zero."),
    ("P", "Tráfico [aeródromo], XB-VLA, final pista dos cero, aterrizaje completo.",
     "[Aerodrome] traffic, XB-VLA, final runway two zero, full stop."),
    ("P", "Tráfico [aeródromo], XB-VLA, pista libre.", "[Aerodrome] traffic, XB-VLA, runway vacated."),
]))
story.append(PageBreak())

# --- 8 ---
story += section("8", "Después de aterrizar y estacionamiento  |  After landing and parking", "Pista libre, rodaje a plataforma y cierre")
story.append(dialogo([
    ("P", "Guadalajara Torre, XB-VLA, pista libre por calle Bravo.", "Guadalajara Tower, XB-VLA, runway vacated via Bravo."),
    ("C", "XB-VLA, contacte Tierra uno dos uno decimal nueve.", "XB-VLA, contact Ground wun too wun decimal niner."),
    ("P", "Contacto Tierra uno dos uno decimal nueve, XB-VLA.", "Contact Ground wun too wun decimal niner, XB-VLA."),
    ("P", "Guadalajara Tierra, XB-VLA, libre de pista por Bravo, solicito rodaje a la plataforma de aviación general.",
     "Guadalajara Ground, XB-VLA, clear of the runway via Bravo, request taxi to the general aviation apron."),
    ("C", "XB-VLA, ruede a la plataforma de aviación general por calle Bravo.", "XB-VLA, taxi to the general aviation apron via Bravo."),
    ("P", "Rodaje a plataforma por Bravo, XB-VLA.", "Taxi to the apron via Bravo, XB-VLA."),
    ("C", "XB-VLA, en plataforma puede apagar, buenas tardes.", "XB-VLA, on the apron you may shut down, good afternoon."),
    ("P", "Gracias, buenas tardes, XB-VLA.", "Thank you, good afternoon, XB-VLA."),
]))
story.append(Spacer(1, 4))
story.append(box("Antes de irte  |  Before you leave", [
    "<b>No cruces la pista para llegar a la plataforma</b> sin autorización. Cuando estacionas: freno de estacionamiento, motor apagado y calzos, "
    "y <b>cierra tu plan de vuelo</b> si abriste uno. Anota tus tiempos en la bitácora.",
    "<i>Do not cross a runway to reach the apron without clearance. Park, shut down, chock, close your flight plan if you filed one, and log your times.</i>",
], color=GREEN, fondo=colors.HexColor("#F0FDF4")))
story.append(PageBreak())

# --- 9 ---
story += section("9", "Emergencias y fallas de radio  |  Emergencies and radio failure", "PAN-PAN, MAYDAY, falla de comunicaciones y señales luminosas")
story.append(bi([
    ("<b>PAN-PAN</b> (tres veces): urgencia sin peligro inmediato, por ejemplo un pasajero enfermo.",
     "<b>PAN-PAN</b> (three times): urgency, no immediate danger, for example a sick passenger."),
    ("<b>MAYDAY</b> (tres veces): peligro grave e inminente, como una falla de motor o un incendio.",
     "<b>MAYDAY</b> (three times): grave and imminent danger, such as engine failure or fire."),
]))
story.append(Spacer(1, 4))
story.append(dialogo([
    ("P", "<b>MAYDAY, MAYDAY, MAYDAY</b>, Guadalajara Torre, XB-VLA, falla de motor, cinco millas al norte de Manzanillo, tres mil pies, dos almas a bordo, combustible una hora, intento aterrizaje forzado en la carretera.",
     "<b>MAYDAY, MAYDAY, MAYDAY</b>, Guadalajara Tower, XB-VLA, engine failure, five miles north of Manzanillo, tree thousand feet, two souls on board, endurance wun hour, attempting forced landing on the highway."),
    ("C", "XB-VLA, recibido MAYDAY, transponder siete siete cero cero, reporte sus intenciones.",
     "XB-VLA, Roger MAYDAY, squawk seven seven zero zero, report intentions."),
    ("C", "Todas las estaciones, emergencia terminada.", "All stations, distress traffic ended."),
]))
story.append(P(
    "<b>Orden recomendado</b> (di lo esencial primero si tienes poco tiempo): MAYDAY o PAN-PAN, quién eres, qué pasa, dónde estás, "
    "altitud, personas a bordo, combustible e intenciones. <i>Recommended order: distress call, who, what, where, altitude, people, fuel, intentions.</i>"))
story.append(Paragraph("Códigos del transponder  |  Transponder codes", h2))
story.append(bi([
    ("<b>7700</b> emergencia", "<b>7700</b> emergency"),
    ("<b>7600</b> falla de radio", "<b>7600</b> radio failure"),
    ("<b>7500</b> interferencia ilícita (secuestro)", "<b>7500</b> unlawful interference (hijack)"),
]))
story.append(Paragraph("Falla de radio en VFR  |  Radio failure in VFR", h2))
story.append(bi([
    ("1. Revisa volumen, frecuencia, audífonos y micrófono.", "1. Check volume, frequency, headset and microphone."),
    ("2. Transponder <b>7600</b> y transmite a ciegas: \"Transmitiendo a ciegas por falla del receptor\".", "2. Squawk <b>7600</b> and transmit blind: \"Transmitting blind due to receiver failure\"."),
    ("3. Si estás en condiciones VFR, continúa en VFR, aterriza en el aeródromo adecuado más cercano e informa tu llegada.",
     "3. If in VMC, continue VMC, land at the nearest suitable aerodrome and report your arrival."),
    ("4. Vigila las <b>señales luminosas</b> de la torre.", "4. Watch for the tower's <b>light signals</b>."),
]))
story.append(PageBreak())

story.append(Paragraph("Señales luminosas de la torre  |  Tower light signals", h2))
story.append(P("<i>Si tu radio falla y hay torre, estas señales son tu única autorización.</i>"))
story.append(bi([
    ("<b>En vuelo</b>: verde fijo, autorizado a aterrizar.", "<b>In flight</b>: steady green, cleared to land."),
    ("Rojo fijo: ceda el paso y siga en circuito.", "Steady red: give way and continue circling."),
    ("Destellos verdes: regrese para aterrizar (espere verde fijo).", "Flashing green: return for landing (await steady green)."),
    ("Destellos rojos: aeródromo inseguro, no aterrice.", "Flashing red: aerodrome unsafe, do not land."),
    ("Destellos blancos: aterrice y vaya a la plataforma.", "Flashing white: land and proceed to the apron."),
    ("<b>En tierra</b>: verde fijo, autorizado a despegar.", "<b>On the ground</b>: steady green, cleared for take-off."),
    ("Rojo fijo: deténgase.", "Steady red: stop."),
    ("Destellos verdes: autorizado a rodar.", "Flashing green: cleared to taxi."),
    ("Destellos rojos: salga de la pista en uso.", "Flashing red: taxi clear of the runway in use."),
    ("Destellos blancos: regrese al punto de partida.", "Flashing white: return to the starting point."),
]))
story.append(Spacer(1, 6))

# --- 10 ---
story += section("10", "Errores comunes  |  Common mistakes", "Lo que más se ve, y cómo corregirlo")
story.append(bi([
    ("<b>No decir quién llamas ni quién eres</b> (\"listo para despegar\"): siempre estación, matrícula, posición y petición.",
     "<b>Not saying who you call or who you are</b>: always station, callsign, position and request."),
    ("<b>No leer de vuelta</b> pistas, puntos de espera, altitudes o frecuencias.", "<b>Not reading back</b> runways, hold points, levels or frequencies."),
    ("<b>Decir \"Roger\" a una pregunta de sí o no</b>: responde <i>Afirmativo</i> o <i>Negativo</i>.", "<b>Saying \"Roger\" to a yes/no question</b>: answer <i>Affirm</i> or <i>Negative</i>."),
    ("<b>Frases de la calle</b> (\"cambio\", \"ok\", \"copiado\"): usa las palabras estándar.", "<b>Slang</b> (\"over\", \"okay\", \"copy\"): use standard words."),
    ("<b>Hablar rápido y todo junto</b>: haz pausas, dígitos separados, sin muletillas.", "<b>Speaking fast and run-on</b>: pause, separate digits, no fillers."),
    ("<b>Cortar la transmisión</b> o soltar el botón antes de terminar: piensa la frase antes.", "<b>Clipping transmissions</b>: press, count one, then speak."),
    ("<b>Cruzar una pista de oídas</b>: sin autorización clara, no cruces.", "<b>Crossing a runway on assumption</b>: no clear clearance, no crossing."),
    ("<b>Callar cuando algo va mal</b>: pide ayuda temprano.", "<b>Staying quiet when things go wrong</b>: ask for help early."),
]))
story.append(PageBreak())

# --- 11 ---
story += section("11", "Ejercicios  |  Exercises", "Intenta primero; las respuestas están en la página siguiente")
ej = [
    ("Traduce al inglés: <i>\"XB-VLA, viento dos uno cero grados ocho nudos, pista dos cero, autorizado a aterrizar.\"</i>",
     "Translate to Spanish: <i>\"XB-VLA, cleared to land runway two zero, wind two one zero degrees eight knots.\"</i>"),
    ("Escribe el readback: <i>\"XB-VLA, ruede a punto de espera pista tres cero por calle Charlie, mantenga corto de pista uno cinco.\"</i>",
     "Write the readback: <i>\"XB-VLA, taxi to holding point runway three zero via Charlie, hold short of runway one five.\"</i>"),
    ("¿Qué está mal aquí? <i>\"Torre, Cessna listo para despegar, cambio.\"</i>",
     "What is wrong here? <i>\"Tower, Cessna ready to take off, over.\"</i>"),
    ("Ordena la llamada: <i>listo para salida - XB-VLA - Guadalajara Torre - punto de espera pista dos cero.</i>",
     "Order the call: <i>ready for departure - XB-VLA - Guadalajara Tower - holding point runway two zero.</i>"),
    ("¿Cómo se dice la frecuencia 118.3?", "How do you say the frequency 118.3?"),
    ("Falla de radio, emergencia y secuestro: ¿qué código pones en cada caso?", "Radio failure, emergency and hijack: which code for each?"),
]
story.append(bi(ej, cab=("Español", "English")))
story.append(PageBreak())

story.append(Paragraph("Respuestas  |  Answers", h2))
story.append(bi([
    ("<b>1.</b> <i>\"XB-VLA, wind two one zero degrees eight knots, runway two zero, cleared to land.\"</i>",
     "<b>1.</b> <i>\"XB-VLA, autorizado a aterrizar pista dos cero, viento dos uno cero grados ocho nudos.\"</i>"),
    ("<b>2.</b> <i>\"Rodaje a punto de espera pista tres cero por calle Charlie, mantengo corto de pista uno cinco, XB-VLA.\"</i>",
     "<b>2.</b> <i>\"Taxi to holding point runway three zero via Charlie, holding short of runway one five, XB-VLA.\"</i>"),
    ("<b>3.</b> No dice qué torre ni su matrícula, no da la posición ni la pista, usa \"despegar\" y \"cambio\" (no es estándar). Correcto: \"Guadalajara Torre, XB-VLA, punto de espera pista dos cero, listo para salida\".",
     "<b>3.</b> It does not say which tower or the callsign, no position or runway, it uses \"take off\" and \"over\" (not standard). Correct: \"Guadalajara Tower, XB-VLA, holding point runway two zero, ready for departure\"."),
    ("<b>4.</b> \"Guadalajara Torre, XB-VLA, punto de espera pista dos cero, listo para salida.\"",
     "<b>4.</b> \"Guadalajara Tower, XB-VLA, holding point runway two zero, ready for departure.\""),
    ("<b>5.</b> \"Uno uno ocho decimal tres.\"", "<b>5.</b> \"Wun wun eight decimal tree.\""),
    ("<b>6.</b> Falla de radio 7600, emergencia 7700, secuestro 7500.", "<b>6.</b> Radio failure 7600, emergency 7700, hijack 7500."),
], cab=("Respuestas a los ejercicios de la columna en español", "Answers to the exercises in the English column")))
story.append(Spacer(1, 10))
story.append(box("Sigue practicando  |  Keep practising", [
    "Practica en voz alta con el <b>audio de fraseología</b> del contenido de cadetes y con el módulo de Comunicaciones de la Academia: "
    "<b>villanueva-aviation.pages.dev</b>",
    "<i>Practise out loud with the phraseology audio and the Communications module of the Academy.</i>",
    "Esta guía es de referencia para simulación y formación. Los procedimientos, frecuencias y nombres de dependencias de cada aeródromo "
    "deben confirmarse con las publicaciones oficiales vigentes.",
], color=GOLD))


def construir():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    doc = BaseDocTemplate(
        OUT, pagesize=letter, title="Comunicaciones VFR - Español | English", author="Villanueva Aviation",
        subject="Fraseología VFR bilingüe, del arranque al estacionamiento",
        leftMargin=1.8 * cm, rightMargin=1.8 * cm, topMargin=1.9 * cm, bottomMargin=1.6 * cm,
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f")
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[frame], onPage=portada, autoNextPageTemplate="normal"),
        PageTemplate(id="normal", frames=[frame], onPage=pagina),
    ])
    doc.build(story)


if __name__ == "__main__":
    construir()
    print("OK", OUT)
