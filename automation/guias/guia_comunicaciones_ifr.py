# -*- coding: utf-8 -*-
"""Guía PDF bilingüe (español | English): comunicaciones IFR, de la autorización al estacionamiento.

Uso:  python automation/guias/guia_comunicaciones_ifr.py   (escribe public/downloads/guia-comunicaciones-ifr.pdf)
Base: fraseología estándar de la OACI (Doc 4444 y Doc 9432). Ejemplos con XB-VLA y Guadalajara.
Solo Helvetica: no usar flechas ni símbolos fuera de WinAnsi (se ven como cuadros negros).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from pdf_base import *  # noqa: F401,F403

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(RAIZ, "public", "downloads", "guia-comunicaciones-ifr.pdf")


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
    c.drawString(2.2 * cm, H - 9.5 * cm, "IFR")
    c.setFont("Helvetica", 17)
    c.setFillColor(colors.HexColor("#CBD5E1"))
    c.drawString(2.2 * cm, H - 10.8 * cm, "IFR Communications  -  Español | English")
    c.setFont("Helvetica", 12.5)
    for i, t in enumerate([
        "De la autorización hasta que estacionas:",
        "CRAFT  •  salida  •  ruta  •  llegada  •  aproximación",
        "espera  •  aproximación frustrada  •  cancelar IFR",
        "emergencias, falla de comunicaciones y ejercicios.",
    ]):
        c.drawString(2.2 * cm, H - 12.6 * cm - i * 0.7 * cm, t)
    c.setFont("Courier-Bold", 9.5)
    c.setFillColor(GOLD)
    c.drawString(2.2 * cm, 4.0 * cm, "Guadalajara Autorización, XB-VLA, IFR a Ciudad de México.")
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
    c.drawRightString(W - 1.8 * cm, H - 1.05 * cm, "Comunicaciones IFR  |  IFR Communications")
    c.drawString(1.8 * cm, 1.0 * cm, "Material educativo para simulación y formación. No sustituye instrucción oficial ni los procedimientos locales vigentes.")
    c.drawRightString(W - 1.8 * cm, 1.0 * cm, f"Página {doc.page}")
    c.restoreState()


story = [NextPageTemplate("normal"), PageBreak()]

# --- 0 ---
story += section("0", "Cómo usar esta guía  |  How to use this guide", "Un vuelo IFR completo, de la autorización a la plataforma")
story.append(P(
    "En IFR las comunicaciones llevan <b>más información</b> y dejan <b>menos margen de error</b>: no ves el terreno ni el tráfico, y "
    "dependes de lo que oyes y de lo que lees de vuelta. La guía sigue tu vuelo en orden y pone cada frase en <b>español</b> y en "
    "<b>inglés</b> lado a lado. Los recuadros azules son lo que dice el <b>control</b>; los blancos, lo que dices tú."))
story.append(P(
    "<b>Base:</b> fraseología estándar de la OACI. Los nombres de salidas (SID), llegadas (STAR), aproximaciones, fijos, frecuencias y "
    "dependencias son <b>ejemplos</b>: en la vida real salen de las cartas y publicaciones vigentes. Las frases en inglés se escriben con la "
    "pronunciación OACI de los números (<i>wun, too, tree, fower, fife, niner</i>). Esta guía complementa la de Comunicaciones VFR, que "
    "explica el alfabeto, los números y las palabras clave."))
story.append(Spacer(1, 4))
story.append(box("Solo para simulación y formación  |  Simulation and training only", [
    "Es material de referencia para practicar. No sustituye la instrucción de un instructor ni las publicaciones oficiales, y no debe "
    "usarse para operar IFR real.",
    "<i>Reference material for practice; it does not replace instruction or official publications.</i>",
], color=RED, fondo=colors.HexColor("#FEF2F2")))

story.append(Paragraph("La regla CRAFT  |  The CRAFT rule", h2))
story.append(P("Al copiar una autorización IFR, revisa que tengas los cinco elementos, en este orden. <i>When copying an IFR clearance, check you have all five items.</i>"))
story.append(bi([
    ("<b>C</b> Límite de autorización (Clearance limit): a dónde estás autorizado.", "<b>C</b> Clearance limit: where you are cleared to."),
    ("<b>R</b> Ruta (Route): salida instrumental, aerovías, fijos o \"según plan de vuelo\".", "<b>R</b> Route: departure procedure, airways, fixes or \"flight planned route\"."),
    ("<b>A</b> Altitud (Altitude): altitud inicial y, si aplica, nivel esperado.", "<b>A</b> Altitude: initial altitude and, if applicable, expected level."),
    ("<b>F</b> Frecuencia (Frequency): con quién hablas después de despegar.", "<b>F</b> Frequency: who you talk to after take-off."),
    ("<b>T</b> Transponder: el código que te asignan.", "<b>T</b> Transponder: the code you are assigned."),
]))
story.append(Spacer(1, 4))
story.append(box("Readback IFR  |  IFR readback", [
    "Lee de vuelta <b>todo</b>: autorización, ruta, altitudes, rumbos, frecuencias, ajuste del altímetro, código del transponder, pista y "
    "las instrucciones de espera o de aproximación. Si te corrigen, repite la versión correcta antes de moverte.",
    "<i>Read back everything: clearance, route, altitudes, headings, frequencies, altimeter, squawk, runway and hold or approach instructions.</i>",
], color=GOLD))
story.append(PageBreak())

# --- 1 ---
story += section("1", "Plan de vuelo y autorización  |  Flight plan and clearance", "Pide tu autorización con el plan ya presentado")
story.append(P(
    "Antes de llamar: plan de vuelo IFR presentado, ATIS anotado, y papel y lápiz listos. <i>Before calling: IFR flight plan filed, ATIS copied, pen and paper ready.</i>"))
story.append(dialogo([
    ("P", "Guadalajara Autorización, XB-VLA, Cessna 172, en plataforma de aviación general, IFR a Ciudad de México, solicito autorización, con información Delta.",
     "Guadalajara Clearance, XB-VLA, Cessna 172, at the general aviation apron, IFR to Mexico City, request clearance, with information Delta."),
    ("C", "XB-VLA, Guadalajara Autorización, listo para copiar.", "XB-VLA, Guadalajara Clearance, ready to copy."),
    ("C", "XB-VLA, autorizado a Ciudad de México por la salida instrumental [nombre de la SID], ruta según plan de vuelo, ascienda y mantenga nueve mil pies, frecuencia de salida uno dos cero decimal cinco, transponder cuatro dos uno cinco.",
     "XB-VLA, cleared to Mexico City via [SID name] departure, flight planned route, climb and maintain niner thousand feet, departure frequency wun too zero decimal fife, squawk fower too wun fife."),
    ("P", "Autorizado a Ciudad de México por la salida [SID], ruta según plan de vuelo, ascienda y mantengo nueve mil pies, salida uno dos cero decimal cinco, transponder cuatro dos uno cinco, XB-VLA.",
     "Cleared to Mexico City via [SID] departure, flight planned route, climb and maintain niner thousand feet, departure wun too zero decimal fife, squawk fower too wun fife, XB-VLA."),
    ("C", "XB-VLA, readback correcto.", "XB-VLA, readback correct."),
]))
story.append(Spacer(1, 4))
story.append(bi([
    ("<b>Espera sin autorización:</b> \"Espere autorización\" / \"Estamos esperando\".", "<b>No clearance yet:</b> \"Stand by for clearance\"."),
    ("<b>Repetir:</b> \"XB-VLA, repita la autorización\" / \"Repita el transponder\".", "<b>Repeat:</b> \"Say again clearance\" / \"Say again squawk\"."),
    ("<b>Cambio de autorización:</b> \"Autorización actualizada, avise cuando esté listo para copiar\".", "<b>Amended clearance:</b> \"Amended clearance, advise ready to copy\"."),
    ("<b>Sin dependencia de autorización</b> (aeródromo pequeño): la pides a Tierra o Torre.", "<b>No clearance delivery</b> (small aerodrome): ask Ground or Tower."),
]))
story.append(Spacer(1, 4))
story.append(box("Niveles IFR  |  IFR levels", [
    "Como referencia general, en IFR se usan miles <b>impares</b> para rumbos magnéticos de 000 a 179 y miles <b>pares</b> de 180 a 359 "
    "(sin el \"+500\" del VFR). Confirma la regla y la altitud de transición vigentes en la publicación oficial.",
    "<i>IFR levels: odd thousands for tracks 000-179, even thousands for 180-359 (no +500 as in VFR).</i>",
], color=BLUE, fondo=colors.HexColor("#EFF6FF")))
story.append(PageBreak())

# --- 2 ---
story += section("2", "Arranque y rodaje IFR  |  IFR start-up and taxi", "Igual que en VFR, pero ya con tu autorización")
story.append(dialogo([
    ("P", "Guadalajara Tierra, XB-VLA, plataforma de aviación general, solicito arranque, IFR a Ciudad de México, autorización recibida.",
     "Guadalajara Ground, XB-VLA, general aviation apron, request start-up, IFR to Mexico City, clearance received."),
    ("C", "XB-VLA, arranque aprobado, ruede a punto de espera pista dos cero por calle Alfa.",
     "XB-VLA, start-up approved, taxi to holding point runway two zero via Alpha."),
    ("P", "Arranque aprobado, rodaje a punto de espera pista dos cero por calle Alfa, XB-VLA.",
     "Start-up approved, taxi to holding point runway two zero via Alpha, XB-VLA."),
]))
story.append(P(
    "Todo lo de <b>rodaje, punto de espera, alineación y despegue</b> es igual que en la guía VFR: \"mantenga corto\", \"cruce pista\", "
    "\"alinee y espere\", \"autorizado a despegar\", con readback. <i>Taxi, holding, line-up and take-off are the same as in the VFR guide.</i>"))
story.append(Spacer(1, 4))
story.append(box("Antes de rodar en IFR  |  Before taxiing IFR", [
    "Verifica que tus instrumentos y radioayudas estén listos: altímetro con el QNH del ATIS, ayudas configuradas, procedimiento de "
    "salida a la mano y rumbo de la primera etapa. Un <b>briefing de salida</b> corto ahorra llamadas en el aire.",
    "<i>Set the altimeter, tune your navaids, have the departure procedure ready, and brief the first leg.</i>",
], color=GREEN, fondo=colors.HexColor("#F0FDF4")))
story.append(PageBreak())

# --- 3 ---
story += section("3", "Salida IFR  |  IFR departure", "Salidas, contacto radar y ascenso")
story.append(dialogo([
    ("C", "XB-VLA, viento dos uno cero grados ocho nudos, pista dos cero, autorizado a despegar.",
     "XB-VLA, wind two one zero degrees eight knots, runway two zero, cleared for take-off."),
    ("P", "Autorizado a despegar pista dos cero, XB-VLA.", "Cleared for take-off runway two zero, XB-VLA."),
    ("C", "XB-VLA, contacte Salidas uno dos cero decimal cinco.", "XB-VLA, contact Departure wun too zero decimal fife."),
    ("P", "Contacto Salidas uno dos cero decimal cinco, XB-VLA.", "Contact Departure wun too zero decimal fife, XB-VLA."),
    ("P", "Guadalajara Salidas, XB-VLA, pasando seis mil ascendiendo nueve mil.",
     "Guadalajara Departure, XB-VLA, passing six thousand climbing to niner thousand."),
    ("C", "XB-VLA, contacto radar, continúe la salida.", "XB-VLA, radar contact, continue departure."),
]))
story.append(Spacer(1, 4))
story.append(Paragraph("Instrucciones frecuentes en salida  |  Common departure instructions", h2))
story.append(bi([
    ("\"Vire a la derecha rumbo uno ocho cero.\"", "\"Turn right heading wun eight zero.\""),
    ("\"Proceda directo a [fijo].\"", "\"Proceed direct to [fix].\""),
    ("\"Ascienda y mantenga nueve mil pies.\"", "\"Climb and maintain niner thousand feet.\""),
    ("\"Reanude su propia navegación.\"", "\"Resume own navigation.\""),
    ("\"Notifique alcanzando nueve mil.\"", "\"Report reaching niner thousand.\""),
    ("\"Velocidad, mantenga ciento veinte nudos.\"", "\"Maintain wun too zero knots.\""),
]))
story.append(Spacer(1, 4))
story.append(box("Cumplir y leer de vuelta  |  Comply and read back", [
    "Si no puedes cumplir un ascenso, un rumbo o una velocidad, di <b>\"Imposible\"</b> y explica por qué. Es mejor avisar antes que cumplir mal.",
    "<i>If you cannot comply, say \"Unable\" and give the reason.</i>",
], color=ORANGE, fondo=colors.HexColor("#FFF7ED")))
story.append(PageBreak())

# --- 4 ---
story += section("4", "En ruta  |  En route", "Cambios de nivel, desvíos, reportes y transferencias")
story.append(dialogo([
    ("C", "XB-VLA, contacte Control México uno dos cinco decimal uno.", "XB-VLA, contact Mexico Control wun too fife decimal wun."),
    ("P", "Contacto Control México uno dos cinco decimal uno, XB-VLA.", "Contact Mexico Control wun too fife decimal wun, XB-VLA."),
    ("P", "Control México, XB-VLA, nueve mil pies.", "Mexico Control, XB-VLA, niner thousand feet."),
    ("C", "XB-VLA, Control México, contacto radar, ascienda y mantenga once mil pies.",
     "XB-VLA, Mexico Control, radar contact, climb and maintain wun wun thousand feet."),
    ("P", "Ascendiendo y mantengo once mil pies, XB-VLA.", "Climbing and maintaining wun wun thousand feet, XB-VLA."),
    ("C", "XB-VLA, descienda y mantenga nueve mil pies.", "XB-VLA, descend and maintain niner thousand feet."),
]))
story.append(Spacer(1, 4))
story.append(Paragraph("Desvíos, solicitudes y reportes  |  Deviations, requests and reports", h2))
story.append(bi([
    ("\"Solicito desviación por tormenta, hasta diez millas a la derecha de la ruta.\"", "\"Request weather deviation up to ten miles right of track.\""),
    ("\"Autorizado a desviarse hasta diez millas a la derecha, notifique de regreso en la ruta.\"", "\"Cleared to deviate up to ten miles right of track, report back on track.\""),
    ("\"Solicito nivel diez mil pies por turbulencia.\"", "\"Request wun zero thousand feet due to turbulence.\""),
    ("\"Reporto hielo moderado entre ocho y nueve mil pies.\"  (reporte de piloto)", "\"Report moderate icing between eight and niner thousand feet.\"  (pilot report)"),
    ("\"XB-VLA, contacto radar perdido, notifique posición.\"", "\"XB-VLA, radar contact lost, report position.\""),
    ("\"Notifico sobre [fijo], hora dos cinco, nueve mil pies.\"  (reporte de posición sin radar)", "\"Report over [fix], time two fife, niner thousand feet.\"  (position report without radar)"),
]))
story.append(Spacer(1, 4))
story.append(box("Con radar y sin radar  |  Radar and procedural", [
    "Con vigilancia radar, el control te identifica y te da rumbos y niveles; sin ella, tú <b>reportas posición</b> sobre los puntos de "
    "notificación. Si dudas de cuál caso estás, pregunta: <b>\"confirme contacto radar\"</b>.",
    "<i>With radar, ATC identifies you and gives headings; without it, you make position reports. If unsure, ask: \"confirm radar contact\".</i>",
], color=BLUE, fondo=colors.HexColor("#EFF6FF")))
story.append(PageBreak())

# --- 5 ---
story += section("5", "Llegada  |  Arrival", "ATIS, llegada estándar y descenso")
story.append(dialogo([
    ("P", "Ciudad de México Aproximación, XB-VLA, Cessna 172, treinta millas al noroeste, nueve mil pies, IFR, solicito aproximación ILS pista dos tres izquierda, con información Eco.",
     "Mexico City Approach, XB-VLA, Cessna 172, tree zero miles northwest, niner thousand feet, IFR, request ILS approach runway two tree left, with information Echo."),
    ("C", "XB-VLA, Ciudad de México Aproximación, autorizado por la llegada [nombre de la STAR], espere aproximación ILS pista dos tres izquierda.",
     "XB-VLA, Mexico City Approach, cleared [STAR name] arrival, expect ILS approach runway two tree left."),
    ("P", "Autorizado por la llegada [STAR], espero ILS pista dos tres izquierda, XB-VLA.", "Cleared [STAR] arrival, expect ILS runway two tree left, XB-VLA."),
    ("C", "XB-VLA, descienda y mantenga ocho mil pies, altímetro tres cero cero cuatro.", "XB-VLA, descend and maintain eight thousand feet, altimeter tree zero zero fower."),
    ("P", "Descendiendo y mantengo ocho mil pies, altímetro tres cero cero cuatro, XB-VLA.", "Descending and maintaining eight thousand feet, altimeter tree zero zero fower, XB-VLA."),
]))
story.append(Spacer(1, 4))
story.append(bi([
    ("\"Espere aproximación de [tipo] pista [número].\"  (avisa qué esperar)", "\"Expect [type] approach runway [number].\"  (tells you what to expect)"),
    ("\"Reduzca velocidad a ciento sesenta nudos.\"", "\"Reduce speed to wun six zero knots.\""),
    ("\"Descienda a su discreción hasta ocho mil pies.\"", "\"Descend at pilot's discretion to eight thousand feet.\""),
    ("\"Espere autorización de aproximación a las uno cinco tres cero.\"", "\"Expect approach clearance at wun fife tree zero.\""),
]))
story.append(P(
    "<i>Nota:</i> \"Espere aproximación\" es información, no una autorización. Hasta que te digan <b>\"autorizado aproximación\"</b>, "
    "no la inicies. <i>\"Expect\" is information, not a clearance.</i>"))
story.append(PageBreak())

# --- 6 ---
story += section("6", "Aproximación por instrumentos  |  Instrument approach", "Vectores, establecido, autorizado y paso a Torre")
story.append(dialogo([
    ("C", "XB-VLA, vire a la izquierda rumbo uno cinco cero, para interceptar el localizador pista dos tres izquierda.",
     "XB-VLA, turn left heading wun fife zero, to intercept the localizer runway two tree left."),
    ("P", "Vire a la izquierda rumbo uno cinco cero, para interceptar, XB-VLA.", "Left heading wun fife zero, to intercept, XB-VLA."),
    ("C", "XB-VLA, notifique establecido en el localizador.", "XB-VLA, report established on the localizer."),
    ("P", "Establecido en el localizador pista dos tres izquierda, XB-VLA.", "Established on the localizer runway two tree left, XB-VLA."),
    ("C", "XB-VLA, autorizado aproximación ILS pista dos tres izquierda.", "XB-VLA, cleared ILS approach runway two tree left."),
    ("P", "Autorizado aproximación ILS pista dos tres izquierda, XB-VLA.", "Cleared ILS approach runway two tree left, XB-VLA."),
    ("C", "XB-VLA, contacte Torre uno dos cero decimal uno.", "XB-VLA, contact Tower wun too zero decimal wun."),
    ("C", "XB-VLA, pista dos tres izquierda, viento uno ocho cero grados seis nudos, autorizado a aterrizar.",
     "XB-VLA, runway two tree left, wind wun eight zero degrees six knots, cleared to land."),
]))
story.append(Spacer(1, 4))
story.append(Paragraph("Otras aproximaciones  |  Other approaches", h2))
story.append(bi([
    ("\"Autorizado aproximación RNAV (GNSS) pista dos tres izquierda.\"", "\"Cleared RNAV (GNSS) approach runway two tree left.\""),
    ("\"Autorizado aproximación visual pista dos tres izquierda.\"  (con el terreno a la vista)", "\"Cleared visual approach runway two tree left.\"  (with the field in sight)"),
    ("\"Autorizado aproximación ILS pista dos tres izquierda, notifique en el punto de aproximación final.\"", "\"Cleared ILS approach runway two tree left, report at the final approach fix.\""),
    ("\"Cancelo IFR.\"  (cuando ya estás en condiciones VFR y quieres cancelarlo)", "\"Cancelling IFR.\"  (when you are in VMC and want to cancel)"),
]))
story.append(Spacer(1, 4))
story.append(box("Antes de cancelar IFR  |  Before cancelling IFR", [
    "Cancelar el IFR te quita la protección de separación del control. Hazlo solo con condiciones VFR claras y si te conviene: no es obligatorio. "
    "Recuerda que, sin cancelar, la autorización IFR sigue activa hasta que aterrices.",
    "<i>Cancelling IFR removes ATC separation. Do it only in clear VMC and when it helps you.</i>",
], color=RED, fondo=colors.HexColor("#FEF2F2")))
story.append(PageBreak())

# --- 7 ---
story += section("7", "Aproximación frustrada y esperas  |  Missed approach and holding", "Qué decir cuando no puedes aterrizar")
story.append(dialogo([
    ("P", "Aproximación frustrada, XB-VLA, sin contacto visual con la pista.", "Missed approach, XB-VLA, runway not in sight."),
    ("C", "XB-VLA, ascienda a ocho mil pies, vire a la derecha rumbo tres cero cero, contacte Aproximación.",
     "XB-VLA, climb to eight thousand feet, turn right heading tree zero zero, contact Approach."),
    ("P", "Ascendiendo a ocho mil, rumbo tres cero cero, XB-VLA.", "Climbing to eight thousand, heading tree zero zero, XB-VLA."),
    ("P", "Solicito otra aproximación ILS pista dos tres izquierda.", "Request another ILS approach runway two tree left."),
]))
story.append(Paragraph("Esperas  |  Holding", h2))
story.append(dialogo([
    ("C", "XB-VLA, espere en [fijo], nueve mil pies, según lo publicado, espere autorización posterior a las uno cinco tres cero.",
     "XB-VLA, hold at [fix], niner thousand feet, as published, expect further clearance at wun fife tree zero."),
    ("P", "Espero en [fijo], nueve mil pies, según lo publicado, espero autorización a las uno cinco tres cero, XB-VLA.",
     "Holding at [fix], niner thousand feet, as published, expect further clearance at wun fife tree zero, XB-VLA."),
    ("C", "XB-VLA, espere en [fijo], rumbo de acercamiento dos siete cero, giros a la derecha, tramos de un minuto.",
     "XB-VLA, hold at [fix], inbound track two seven zero, right turns, one minute legs."),
]))
story.append(Spacer(1, 4))
story.append(bi([
    ("<b>Espera \"según lo publicado\":</b> usas el patrón de la carta.", "<b>\"As published\":</b> you fly the pattern on the chart."),
    ("<b>Sin dirección de giro:</b> se asume <b>derecha</b>.", "<b>No turn direction:</b> right turns are assumed."),
    ("<b>Hora de autorización posterior</b> (EFC): cuándo esperas nuevas instrucciones, y te sirve si pierdes las comunicaciones.",
     "<b>Expect further clearance time</b> (EFC): when you expect new instructions, and it helps if you lose communications."),
    ("<b>Salir de la espera:</b> \"Autorizado aproximación ILS\" o \"Proceda directo a [fijo]\".", "<b>Leaving the hold:</b> \"Cleared ILS approach\" or \"Proceed direct to [fix]\"."),
]))
story.append(PageBreak())

# --- 8 ---
story += section("8", "Después de aterrizar y cierre  |  After landing and shutdown", "Igual que en VFR, con un cierre extra")
story.append(dialogo([
    ("P", "Ciudad de México Torre, XB-VLA, pista libre por calle Delta.", "Mexico City Tower, XB-VLA, runway vacated via Delta."),
    ("C", "XB-VLA, contacte Tierra uno dos uno decimal siete.", "XB-VLA, contact Ground wun too wun decimal seven."),
    ("P", "Contacto Tierra uno dos uno decimal siete, XB-VLA.", "Contact Ground wun too wun decimal seven, XB-VLA."),
    ("C", "XB-VLA, ruede a la plataforma de aviación general por calle Delta.", "XB-VLA, taxi to the general aviation apron via Delta."),
    ("P", "Rodaje a plataforma por Delta, XB-VLA.", "Taxi to the apron via Delta, XB-VLA."),
]))
story.append(Spacer(1, 4))
story.append(box("Antes de irte  |  Before you leave", [
    "Al aterrizar en un aeródromo con torre, el control cierra tu plan IFR. Si aterrizas en uno sin control, <b>tú debes avisar</b> (por radio o teléfono) "
    "que aterrizaste. Anota tus tiempos en la bitácora y las horas de instrumentos.",
    "<i>At a controlled aerodrome, ATC closes your IFR plan; at an uncontrolled one, you must report your arrival. Log your instrument time.</i>",
], color=GREEN, fondo=colors.HexColor("#F0FDF4")))
story.append(PageBreak())

# --- 9 ---
story += section("9", "Emergencias y falla de comunicaciones  |  Emergencies and communications failure", "MAYDAY, combustible y pérdida de comunicaciones en IFR")
story.append(bi([
    ("<b>PAN-PAN</b> (tres veces): urgencia sin peligro inmediato.", "<b>PAN-PAN</b> (three times): urgency, no immediate danger."),
    ("<b>MAYDAY</b> (tres veces): peligro grave e inminente.", "<b>MAYDAY</b> (three times): grave and imminent danger."),
    ("<b>Combustible mínimo</b>: \"Combustible mínimo, XB-VLA\" (aviso de que no puedes aceptar demoras; no es una emergencia).", "<b>Minimum fuel</b>: \"Minimum fuel, XB-VLA\" (you cannot accept delays; not an emergency)."),
    ("<b>Emergencia de combustible</b>: \"MAYDAY, MAYDAY, MAYDAY, combustible\".", "<b>Fuel emergency</b>: \"MAYDAY, MAYDAY, MAYDAY, FUEL\"."),
]))
story.append(Spacer(1, 4))
story.append(dialogo([
    ("P", "<b>MAYDAY, MAYDAY, MAYDAY</b>, Ciudad de México Aproximación, XB-VLA, falla de motor, quince millas al noroeste, ocho mil pies, IFR, dos almas a bordo, solicito vectores al aeropuerto más cercano.",
     "<b>MAYDAY, MAYDAY, MAYDAY</b>, Mexico City Approach, XB-VLA, engine failure, wun fife miles northwest, eight thousand feet, IFR, two souls on board, request vectors to the nearest aerodrome."),
    ("C", "XB-VLA, recibido MAYDAY, transponder siete siete cero cero, vire a la derecha rumbo uno ocho cero.",
     "XB-VLA, Roger MAYDAY, squawk seven seven zero zero, turn right heading wun eight zero."),
]))
story.append(Paragraph("Falla de comunicaciones en IFR (resumen general)  |  IFR communications failure (general summary)", h2))
story.append(bi([
    ("1. Revisa volumen, frecuencia, audífonos y micrófono; prueba otra frecuencia o el segundo radio.", "1. Check volume, frequency, headset and microphone; try another frequency or the second radio."),
    ("2. Transponder <b>7600</b> y transmite a ciegas: \"Transmitiendo a ciegas por falla del receptor\".", "2. Squawk <b>7600</b> and transmit blind: \"Transmitting blind due to receiver failure\"."),
    ("3. En <b>condiciones VFR</b>: continúa en VFR, aterriza en el aeródromo adecuado más cercano e informa tu llegada.", "3. In <b>VMC</b>: continue VMC, land at the nearest suitable aerodrome and report arrival."),
    ("4. En <b>IMC</b>: mantén el último nivel y velocidad asignados (o la altitud mínima de vuelo, si es mayor) durante el tiempo que marque la regla vigente.", "4. In <b>IMC</b>: maintain the last assigned level and speed (or the minimum flight altitude if higher) for the time set by the current rule."),
    ("5. Después, sigue el plan de vuelo presentado hasta la ayuda del destino, espera y comienza el descenso a la hora prevista, haz la aproximación por instrumentos y aterriza.", "5. Then follow the filed flight plan to the destination navaid, hold, start descent at the expected time, fly the instrument approach and land."),
]))
story.append(Spacer(1, 4))
story.append(box("Confirma el procedimiento vigente  |  Confirm the current procedure", [
    "Los <b>tiempos y detalles</b> de la falla de comunicaciones en IFR varían por país y por tipo de espacio aéreo (con o sin radar). "
    "Esto es solo un resumen general de la OACI para estudiar: consulta la publicación oficial vigente y a tu instructor.",
    "<i>Times and details vary by State; this is a general ICAO summary. Check the current official publication.</i>",
], color=RED, fondo=colors.HexColor("#FEF2F2")))
story.append(PageBreak())

# --- 10 ---
story += section("10", "Errores comunes  |  Common mistakes", "Lo que más se ve en IFR")
story.append(bi([
    ("<b>Leer de vuelta solo parte de la autorización</b>: el transponder y las altitudes son los que más se olvidan.", "<b>Reading back only part of the clearance</b>: squawk and altitudes are the most often missed."),
    ("<b>Aceptar lo que no entendiste</b>: pide \"repita\" antes de moverte.", "<b>Accepting what you did not understand</b>: say \"say again\" before moving."),
    ("<b>Confundir \"espere aproximación\" con \"autorizado aproximación\"</b>.", "<b>Mistaking \"expect approach\" for \"cleared approach\"</b>."),
    ("<b>No avisar \"establecido\"</b> cuando el control lo pidió.", "<b>Not reporting \"established\"</b> when ATC asked for it."),
    ("<b>Cambiar de frecuencia sin instrucción</b> o sin leerla de vuelta.", "<b>Changing frequency without an instruction</b> or without a readback."),
    ("<b>No decir \"imposible\"</b> cuando no puedes cumplir: avisa temprano.", "<b>Not saying \"unable\"</b> when you cannot comply: tell them early."),
    ("<b>Olvidar el ajuste del altímetro</b> en cada cambio (QNH del ATIS o del control).", "<b>Forgetting the altimeter setting</b> on each change (QNH from ATIS or ATC)."),
    ("<b>Callar cuando algo va mal</b>: declara PAN-PAN o MAYDAY a tiempo.", "<b>Staying quiet when things go wrong</b>: declare PAN-PAN or MAYDAY in time."),
]))
story.append(PageBreak())

# --- 11 ---
story += section("11", "Ejercicios  |  Exercises", "Intenta primero; las respuestas están en la página siguiente")
story.append(bi([
    ("Traduce al inglés: <i>\"XB-VLA, autorizado aproximación ILS pista dos tres izquierda, notifique establecido.\"</i>",
     "Translate to Spanish: <i>\"XB-VLA, descend and maintain eight thousand feet, altimeter tree zero zero fower.\"</i>"),
    ("Escribe el readback: <i>\"XB-VLA, autorizado a Ciudad de México, ruta según plan de vuelo, ascienda y mantenga siete mil pies, transponder cuatro cuatro dos uno.\"</i>",
     "Write the readback: <i>\"XB-VLA, cleared to Mexico City, flight planned route, climb and maintain seven thousand feet, squawk fower fower too wun.\"</i>"),
    ("En la autorización del ejercicio 2, identifica cada letra de CRAFT.", "In the clearance of exercise 2, identify each letter of CRAFT."),
    ("¿Qué código pones si pierdes las comunicaciones? ¿Y en una emergencia?", "Which code do you set for communications failure? And for an emergency?"),
    ("Te dicen \"espere aproximación ILS pista dos tres izquierda\". ¿Puedes iniciar la aproximación?", "ATC says \"expect ILS approach runway two tree left\". May you start the approach?"),
    ("Estás en IMC y pierdes el radio: ¿qué haces primero?", "You are in IMC and lose the radio: what do you do first?"),
]))
story.append(PageBreak())

story.append(Paragraph("Respuestas  |  Answers", h2))
story.append(bi([
    ("<b>1.</b> <i>\"XB-VLA, cleared ILS approach runway two tree left, report established.\"</i>",
     "<b>1.</b> <i>\"XB-VLA, descienda y mantenga ocho mil pies, altímetro tres cero cero cuatro.\"</i>"),
    ("<b>2.</b> <i>\"Autorizado a Ciudad de México, ruta según plan de vuelo, ascienda y mantengo siete mil pies, transponder cuatro cuatro dos uno, XB-VLA.\"</i>",
     "<b>2.</b> <i>\"Cleared to Mexico City, flight planned route, climb and maintain seven thousand feet, squawk fower fower too wun, XB-VLA.\"</i>"),
    ("<b>3.</b> <b>C</b> Ciudad de México. <b>R</b> según plan de vuelo. <b>A</b> siete mil pies. <b>F</b> (falta: la frecuencia de salida). <b>T</b> 4421.",
     "<b>3.</b> <b>C</b> Mexico City. <b>R</b> flight planned route. <b>A</b> seven thousand feet. <b>F</b> (missing: the departure frequency). <b>T</b> 4421."),
    ("<b>4.</b> Falla de comunicaciones 7600; emergencia 7700.", "<b>4.</b> Communications failure 7600; emergency 7700."),
    ("<b>5.</b> No: \"espere aproximación\" es información. Necesitas \"autorizado aproximación\".", "<b>5.</b> No: \"expect approach\" is information. You need \"cleared approach\"."),
    ("<b>6.</b> Revisa el equipo (volumen, frecuencia, audífonos), transponder 7600, transmite a ciegas y sigue el procedimiento vigente de falla de comunicaciones en IMC.",
     "<b>6.</b> Check the equipment (volume, frequency, headset), squawk 7600, transmit blind, and follow the current IMC communications-failure procedure."),
], cab=("Respuestas a los ejercicios de la columna en español", "Answers to the exercises in the English column")))
story.append(Spacer(1, 10))
story.append(box("Sigue practicando  |  Keep practising", [
    "Practica en voz alta con el <b>audio de fraseología</b> del contenido de cadetes y con el módulo de Comunicaciones de la Academia: "
    "<b>villanueva-aviation.pages.dev</b>",
    "<i>Practise out loud with the phraseology audio and the Communications module of the Academy.</i>",
    "Esta guía es de referencia para simulación y formación. Los procedimientos, frecuencias, cartas y nombres de dependencias deben "
    "confirmarse con las publicaciones oficiales vigentes. No sustituye la instrucción de vuelo por instrumentos.",
], color=GOLD))


def construir():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    doc = BaseDocTemplate(
        OUT, pagesize=letter, title="Comunicaciones IFR - Español | English", author="Villanueva Aviation",
        subject="Fraseología IFR bilingüe, de la autorización al estacionamiento",
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
