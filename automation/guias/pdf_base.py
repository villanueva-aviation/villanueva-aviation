# -*- coding: utf-8 -*-
"""Base común de las guías PDF de Villanueva Aviation: colores, estilos y bloques (tabla, recuadro, sección)."""
import math
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, Flowable, NextPageTemplate,
)

NAVY = colors.HexColor("#0B1220")
NAVY2 = colors.HexColor("#141E33")
GOLD = colors.HexColor("#C9A24B")
GRAY = colors.HexColor("#5A6472")
LIGHT = colors.HexColor("#F4F5F7")
INK = colors.HexColor("#1F2937")
GREEN = colors.HexColor("#16A34A")
RED = colors.HexColor("#DC2626")
BLUE = colors.HexColor("#2563EB")
ORANGE = colors.HexColor("#EA580C")

W, H = letter

# ---------- estilos ----------
body = ParagraphStyle("body", fontName="Helvetica", fontSize=9.8, leading=13.6, textColor=INK, spaceAfter=5)
small = ParagraphStyle("small", parent=body, fontSize=8.6, leading=11.5, textColor=GRAY, spaceAfter=3)
h1 = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=19, leading=23, textColor=NAVY, spaceBefore=2, spaceAfter=4)
h2 = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=NAVY, spaceBefore=9, spaceAfter=3)
kicker = ParagraphStyle("kicker", fontName="Helvetica-Bold", fontSize=9, textColor=GOLD, spaceAfter=1)
bullet = ParagraphStyle("bullet", parent=body, leftIndent=12, bulletIndent=2, spaceAfter=2.5)
cell = ParagraphStyle("cell", parent=body, fontSize=8.8, leading=11.6, spaceAfter=0)
cellb = ParagraphStyle("cellb", parent=cell, fontName="Helvetica-Bold", textColor=NAVY)
cellh = ParagraphStyle("cellh", parent=cell, fontName="Helvetica-Bold", textColor=colors.white)
center = ParagraphStyle("center", parent=body, alignment=TA_CENTER)


def P(t, s=body):
    return Paragraph(t, s)


def bullets(items):
    return [Paragraph(t, bullet, bulletText="•") for t in items]


def section(num, titulo, sub=None):
    out = [Paragraph(f"SECCIÓN {num}", kicker), Paragraph(titulo, h1)]
    if sub:
        out.append(Paragraph(sub, small))
    out.append(Rule())
    return out


class Rule(Flowable):
    def __init__(self, w=None):
        super().__init__()
        self.w = w

    def wrap(self, aw, ah):
        self.width = self.w or aw
        return self.width, 8

    def draw(self):
        self.canv.setStrokeColor(GOLD)
        self.canv.setLineWidth(1.2)
        self.canv.line(0, 3, self.width, 3)


def box(titulo, lineas, color=GOLD, fondo=LIGHT, ancho=None):
    """Recuadro con borde izquierdo de color."""
    contenido = [Paragraph(f"<b>{titulo}</b>", ParagraphStyle("bt", parent=cell, textColor=NAVY, fontSize=9.4))]
    contenido += [Paragraph(l, cell) for l in lineas]
    t = Table([[contenido]], colWidths=[ancho or (W - 3.6 * cm)])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), fondo),
        ("LINEBEFORE", (0, 0), (0, -1), 3, color),
        ("LEFTPADDING", (0, 0), (-1, -1), 9), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def tabla(cabecera, filas, anchos, zebra=True):
    datos = [[Paragraph(c, cellh) for c in cabecera]]
    for f in filas:
        datos.append([Paragraph(str(x), cellb if i == 0 else cell) for i, x in enumerate(f)])
    t = Table(datos, colWidths=anchos, repeatRows=1)
    est = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#D5D9E0")),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    if zebra:
        for r in range(2, len(datos), 2):
            est.append(("BACKGROUND", (0, r), (-1, r), LIGHT))
    t.setStyle(TableStyle(est))
    return t


# ---------- utilidades de dibujo ----------
def polar(cx, cy, r, ang_deg):
    """Punto a rumbo ang_deg (horario desde arriba) y radio r."""
    a = math.radians(ang_deg)
    return cx + r * math.sin(a), cy + r * math.cos(a)


def flecha(c, x1, y1, x2, y2, col, ancho=1.6, cab=6):
    c.setStrokeColor(col)
    c.setFillColor(col)
    c.setLineWidth(ancho)
    c.line(x1, y1, x2, y2)
    ang = math.atan2(y2 - y1, x2 - x1)
    p = c.beginPath()
    p.moveTo(x2, y2)
    p.lineTo(x2 - cab * math.cos(ang - 0.4), y2 - cab * math.sin(ang - 0.4))
    p.lineTo(x2 - cab * math.cos(ang + 0.4), y2 - cab * math.sin(ang + 0.4))
    p.close()
    c.drawPath(p, fill=1, stroke=0)


def punta(c, x, y, ang_deg, col, cab=6):
    """Punta de flecha en (x,y) mirando al rumbo ang_deg."""
    a = math.radians(90 - ang_deg)
    c.setFillColor(col)
    p = c.beginPath()
    p.moveTo(x, y)
    p.lineTo(x - cab * math.cos(a - 0.4), y - cab * math.sin(a - 0.4))
    p.lineTo(x - cab * math.cos(a + 0.4), y - cab * math.sin(a + 0.4))
    p.close()
    c.drawPath(p, fill=1, stroke=0)


def insignia(c, x, y, n, r=0.27 * cm):
    c.setFillColor(GOLD)
    c.setStrokeColor(NAVY)
    c.setLineWidth(0.8)
    c.circle(x, y, r, fill=1, stroke=1)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawCentredString(x, y - 3, str(n))


