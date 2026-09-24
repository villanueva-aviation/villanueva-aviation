"""Dibuja el panel de los seis instrumentos básicos, con las escalas correctas.

Se corre con `python scripts/six_pack.py` y reescribe public/images/temas/six-pack.svg.

La imagen anterior era arte generado: el velocímetro repetía el 60, el
altímetro tenía texto ilegible y sin ventana de Kollsman, el coordinador decía
"TURN COOKING TO" y el variómetro tenía la escala asimétrica. Como ahora es un
diagrama donde el cadete hace clic reloj por reloj, aquí se dibuja de cero.

El lienzo conserva la proporción y los centros de la imagen anterior, para que
los puntos calientes ya medidos sigan cayendo donde deben.
"""
import base64
import math
import pathlib

W, H = 1600, 980
# Relojes más grandes que en la imagen anterior: el texto de las caras no cabía.
# Los porcentajes de aquí son los que van en HOTSPOT_SETS["six-pack"].
COLUMNAS = (20.0, 50.0, 80.0)
FILAS = (40.8, 77.6)
LOGO_ANCHO, LOGO_ALTO = 370, 110
R_BISEL = 132          # borde exterior
R_CARA = 112           # cara del reloj

NAVY = "#0B1D34"
NAVY_OSCURO = "#050f1d"
CARA = "#12151a"
CREMA = "#F6F4EF"
ORO = "#D4AF37"
ORO_TENUE = "#8a7328"
# comillas simples adentro: el atributo XML va entre comillas dobles
TIPO = "'Segoe UI', Arial, Helvetica, sans-serif"

partes = []


def xy(cx, cy, r, grados):
    """Coordenadas a 'grados' medidos en sentido horario desde las 12."""
    a = math.radians(grados)
    return cx + r * math.sin(a), cy - r * math.cos(a)


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def linea(x1, y1, x2, y2, color, ancho, extra=""):
    return (f'<line x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}" '
            f'stroke="{color}" stroke-width="{ancho}" stroke-linecap="round" {extra}/>')


def texto(x, y, s, tam, color=CREMA, peso=400, anclaje="middle", espaciado=0, extra=""):
    return (f'<text x="{f(x)}" y="{f(y)}" font-family="{TIPO}" font-size="{tam}" '
            f'font-weight="{peso}" fill="{color}" text-anchor="{anclaje}" '
            f'letter-spacing="{espaciado}" {extra}>{s}</text>')


def arco(cx, cy, r, g1, g2, color, ancho):
    x1, y1 = xy(cx, cy, r, g1)
    x2, y2 = xy(cx, cy, r, g2)
    largo = 1 if (g2 - g1) % 360 > 180 else 0
    return (f'<path d="M {f(x1)} {f(y1)} A {r} {r} 0 {largo} 1 {f(x2)} {f(y2)}" '
            f'fill="none" stroke="{color}" stroke-width="{ancho}"/>')


def caja(cx, cy):
    """Bisel y cara: el marco común a los seis."""
    return f'''
  <g>
    <rect x="{cx - R_BISEL - 12}" y="{cy - R_BISEL - 12}" width="{(R_BISEL + 12) * 2}" height="{(R_BISEL + 12) * 2}"
          rx="34" fill="#1b2027" stroke="#2c333d" stroke-width="2"/>
    <circle cx="{cx}" cy="{cy}" r="{R_BISEL}" fill="none" stroke="url(#bisel)" stroke-width="11"/>
    <circle cx="{cx}" cy="{cy}" r="{R_CARA + 6}" fill="#0c0f13"/>
    <circle cx="{cx}" cy="{cy}" r="{R_CARA}" fill="url(#cara)"/>
    {"".join(f'<circle cx="{cx + dx}" cy="{cy + dy}" r="7" fill="#232931" stroke="#39414c" stroke-width="1.5"/>'
             for dx in (-R_BISEL - 1, R_BISEL + 1) for dy in (-R_BISEL - 1, R_BISEL + 1))}
  </g>'''


def aguja(cx, cy, grados, largo, ancho, color=CREMA, cola=18):
    """Aguja con contrapeso, apuntando a 'grados'."""
    px, py = xy(cx, cy, largo, grados)
    qx, qy = xy(cx, cy, -cola, grados)
    return (linea(qx, qy, px, py, color, ancho)
            + f'<circle cx="{cx}" cy="{cy}" r="{ancho * 1.6}" fill="{color}"/>')


# ---------- 1. Indicador de velocidad ----------
def velocimetro(cx, cy):
    # 40 kt abajo a la izquierda, creciendo en sentido horario hasta 200
    def ang(v):
        return 240 + (v - 40) / 160 * 255

    g = [caja(cx, cy)]
    # arcos operativos de un monomotor ligero: blanco (flaps), verde (normal),
    # amarillo (precaución) y la línea roja de Vne
    g.append(arco(cx, cy, R_CARA - 26, ang(40), ang(85), CREMA, 7))
    g.append(arco(cx, cy, R_CARA - 13, ang(48), ang(129), "#2f9e5c", 8))
    g.append(arco(cx, cy, R_CARA - 13, ang(129), ang(163), "#d8b23a", 8))
    x1, y1 = xy(cx, cy, R_CARA - 21, ang(163))
    x2, y2 = xy(cx, cy, R_CARA - 5, ang(163))
    g.append(linea(x1, y1, x2, y2, "#d9412f", 5))

    for v in range(40, 201, 10):
        a = ang(v)
        largo = 13 if v % 20 == 0 else 7
        x1, y1 = xy(cx, cy, R_CARA - 5, a)
        x2, y2 = xy(cx, cy, R_CARA - 5 - largo, a)
        g.append(linea(x1, y1, x2, y2, CREMA, 2.6 if v % 20 == 0 else 1.6))
        if v % 20 == 0:
            tx, ty = xy(cx, cy, R_CARA - 34, a)
            g.append(texto(tx, ty + 6, str(v), 16, CREMA, 500))

    g.append(texto(cx, cy - 26, "AIRSPEED", 14, CREMA, 500, espaciado=2.4))
    g.append(texto(cx, cy + 44, "KNOTS", 13, "#9aa4b2", 400, espaciado=2.2))
    g.append(aguja(cx, cy, ang(110), R_CARA - 22, 5))
    return "\n".join(g)


# ---------- 2. Horizonte artificial ----------
def horizonte(cx, cy):
    g = [caja(cx, cy)]
    g.append(f'<clipPath id="caraAI"><circle cx="{cx}" cy="{cy}" r="{R_CARA}"/></clipPath>')
    g.append(f'<g clip-path="url(#caraAI)">')
    g.append(f'<rect x="{cx - R_CARA}" y="{cy - R_CARA}" width="{R_CARA * 2}" height="{R_CARA + 8}" fill="#2b6ea8"/>')
    g.append(f'<rect x="{cx - R_CARA}" y="{cy + 8}" width="{R_CARA * 2}" height="{R_CARA}" fill="#6b4a2c"/>')
    g.append(linea(cx - R_CARA, cy + 8, cx + R_CARA, cy + 8, CREMA, 3))
    # escalerilla de cabeceo
    for i, dy in enumerate((-40, -24, 24, 40)):
        ancho = 30 if i in (0, 3) else 18
        g.append(linea(cx - ancho, cy + 8 + dy, cx + ancho, cy + 8 + dy, CREMA, 2))
    g.append("</g>")

    # escala de alabeo
    for grados in (-60, -30, -20, -10, 10, 20, 30, 60):
        largo = 14 if abs(grados) in (30, 60) else 9
        x1, y1 = xy(cx, cy, R_CARA - 2, grados)
        x2, y2 = xy(cx, cy, R_CARA - 2 - largo, grados)
        g.append(linea(x1, y1, x2, y2, CREMA, 2.4))
    px, py = xy(cx, cy, R_CARA - 4, 0)
    g.append(f'<path d="M {f(px)} {f(py)} l -9 -14 l 18 0 Z" fill="{ORO}"/>')

    # avión fijo
    g.append(linea(cx - 54, cy + 8, cx - 20, cy + 8, ORO, 5))
    g.append(linea(cx + 20, cy + 8, cx + 54, cy + 8, ORO, 5))
    g.append(f'<circle cx="{cx}" cy="{cy + 8}" r="4.5" fill="{ORO}"/>')
    g.append(linea(cx - 20, cy + 8, cx - 20, cy + 18, ORO, 5))
    g.append(linea(cx + 20, cy + 8, cx + 20, cy + 18, ORO, 5))
    return "\n".join(g)


# ---------- 3. Altímetro ----------
def altimetro(cx, cy):
    g = [caja(cx, cy)]
    for n in range(50):
        a = n * 7.2
        es_numero = n % 5 == 0
        largo = 13 if es_numero else 6
        x1, y1 = xy(cx, cy, R_CARA - 5, a)
        x2, y2 = xy(cx, cy, R_CARA - 5 - largo, a)
        g.append(linea(x1, y1, x2, y2, CREMA, 2.6 if es_numero else 1.4))
        if es_numero and n // 5 != 3:
            tx, ty = xy(cx, cy, R_CARA - 34, a)
            g.append(texto(tx, ty + 7, str(n // 5), 20, CREMA, 500))

    # ventana de Kollsman: el ajuste barométrico, que es lo que faltaba
    g.append(f'<rect x="{cx + 34}" y="{cy - 6}" width="{58}" height="30" rx="4" fill="#05070a" stroke="{ORO_TENUE}" stroke-width="1.6"/>')
    g.append(texto(cx + 63, cy + 16, "29.92", 17, CREMA, 500))

    g.append(texto(cx, cy - 48, "ALT", 14, CREMA, 500, espaciado=3))
    g.append(texto(cx, cy + 62, "100 FEET", 12, "#9aa4b2", 400, espaciado=1.6))

    # 1,500 pies: la aguja de miles queda arriba a la derecha, lejos de la
    # ventana, y la de centenas abajo en el 5
    ALTITUD = 1500
    g.append(aguja(cx, cy, (ALTITUD % 1000) / 100 * 36, R_CARA - 20, 4.5))
    g.append(aguja(cx, cy, (ALTITUD % 10000) / 1000 * 36, R_CARA - 48, 7.5))
    a_dm = ALTITUD / 10000 * 36
    tx, ty = xy(cx, cy, R_CARA - 22, a_dm)
    g.append(f'<path d="M {f(tx)} {f(ty)} l -7 13 l 14 0 Z" fill="{CREMA}" '
             f'transform="rotate({f(a_dm)} {f(tx)} {f(ty)})"/>')
    return "\n".join(g)


# ---------- 4. Coordinador de giro ----------
def coordinador(cx, cy):
    g = [caja(cx, cy)]
    g.append(texto(cx, cy - 56, "D.C. ELEC.", 11, "#9aa4b2", 400, espaciado=1.8))
    g.append(texto(cx, cy - 32, "TURN COORDINATOR", 12, CREMA, 500, espaciado=1.4))

    # índices de viraje estándar, a izquierda y derecha
    for signo in (-1, 1):
        x1, y1 = xy(cx, cy, R_CARA - 8, 90 * signo)
        x2, y2 = xy(cx, cy, R_CARA - 26, 90 * signo)
        g.append(linea(x1, y1, x2, y2, CREMA, 6))
        g.append(texto(cx + signo * (R_CARA - 46), cy + 6, "L" if signo < 0 else "R", 15, "#9aa4b2", 500))

    # avión simbólico, nivelado
    g.append(linea(cx - 62, cy + 4, cx + 62, cy + 4, ORO, 5))
    g.append(linea(cx, cy - 14, cx, cy + 4, ORO, 5))
    g.append(f'<circle cx="{cx}" cy="{cy + 4}" r="6" fill="{ORO}"/>')
    g.append(linea(cx - 16, cy + 22, cx + 16, cy + 22, ORO, 4))

    # inclinómetro: el tubo curvo con la bola
    g.append(f'<path d="M {cx - 46} {cy + 52} q 46 22 92 0" fill="none" stroke="#2a3038" stroke-width="20" stroke-linecap="round"/>')
    g.append(f'<path d="M {cx - 46} {cy + 52} q 46 22 92 0" fill="none" stroke="#e8e4d8" stroke-width="14" stroke-linecap="round" opacity="0.28"/>')
    g.append(f'<circle cx="{cx}" cy="{cy + 63}" r="7.5" fill="#0a0c10" stroke="#3a4250" stroke-width="1.4"/>')
    for signo in (-1, 1):
        g.append(linea(cx + signo * 15, cy + 50, cx + signo * 16, cy + 68, "#9aa4b2", 2))
    g.append(texto(cx, cy + 84, "2 MIN", 12, "#9aa4b2", 500, espaciado=1.6))
    return "\n".join(g)


# ---------- 5. Indicador de rumbo ----------
def rumbo(cx, cy):
    HDG = 30
    g = [caja(cx, cy)]
    etiquetas = {0: "N", 9: "E", 18: "S", 27: "W"}
    for v in range(36):
        a = (v * 10 - HDG) % 360
        principal = v % 3 == 0
        largo = 13 if principal else 7
        x1, y1 = xy(cx, cy, R_CARA - 5, a)
        x2, y2 = xy(cx, cy, R_CARA - 5 - largo, a)
        g.append(linea(x1, y1, x2, y2, CREMA, 2.4 if principal else 1.4))
        if principal:
            tx, ty = xy(cx, cy, R_CARA - 36, a)
            etiqueta = etiquetas.get(v, str(v))
            tam = 20 if v in etiquetas else 17
            color = ORO if v in etiquetas else CREMA
            g.append(f'<g transform="rotate({f(a)} {f(tx)} {f(ty)})">'
                     + texto(tx, ty + tam * 0.36, etiqueta, tam, color, 600) + "</g>")

    # línea de fe
    px, py = xy(cx, cy, R_CARA - 2, 0)
    g.append(f'<path d="M {f(px)} {f(py)} l -8 -13 l 16 0 Z" fill="{ORO}"/>')

    # avión fijo, visto desde arriba
    g.append(linea(cx, cy - 26, cx, cy + 26, CREMA, 4))
    g.append(linea(cx - 30, cy + 2, cx + 30, cy + 2, CREMA, 4))
    g.append(linea(cx - 12, cy + 22, cx + 12, cy + 22, CREMA, 3.4))
    g.append(texto(cx, cy + 66, "HDG", 11, "#9aa4b2", 400, espaciado=2))
    return "\n".join(g)


# ---------- 6. Variómetro ----------
def variometro(cx, cy):
    # 0 a las nueve en punto; la escala sube y baja simétrica hasta 20
    # 150° por lado deja un hueco claro entre las dos puntas de la escala
    SWEEP = 150

    def ang(v, arriba):
        return (270 + (SWEEP * v / 20) * (1 if arriba else -1)) % 360

    g = [caja(cx, cy)]
    for arriba in (True, False):
        for v in range(0, 21, 1):
            if v == 0 and not arriba:
                continue
            a = ang(v, arriba)
            principal = v % 5 == 0
            largo = 13 if principal else 6
            x1, y1 = xy(cx, cy, R_CARA - 5, a)
            x2, y2 = xy(cx, cy, R_CARA - 5 - largo, a)
            g.append(linea(x1, y1, x2, y2, CREMA, 2.6 if principal else 1.3))
            if principal:
                tx, ty = xy(cx, cy, R_CARA - 32, a)
                g.append(texto(tx, ty + 6, str(v), 16, CREMA, 500))

    g.append(texto(cx, cy - 54, "UP", 13, "#9aa4b2", 500, espaciado=1.6))
    g.append(texto(cx, cy + 66, "DOWN", 13, "#9aa4b2", 500, espaciado=1.6))
    g.append(texto(cx, cy - 26, "VERTICAL SPEED", 13, CREMA, 500, espaciado=1.2))
    g.append(texto(cx, cy + 40, "100 FT PER MIN", 11, "#9aa4b2", 400, espaciado=1))
    g.append(aguja(cx, cy, 270, R_CARA - 22, 4.5))
    return "\n".join(g)


# ---------- Montaje ----------
RELOJES = [
    ("INDICADOR DE VELOCIDAD", velocimetro, 0, 0),
    ("HORIZONTE ARTIFICIAL", horizonte, 1, 0),
    ("ALTÍMETRO", altimetro, 2, 0),
    ("COORDINADOR DE GIRO", coordinador, 0, 1),
    ("INDICADOR DE RUMBO", rumbo, 1, 1),
    ("INDICADOR DE VELOCIDAD VERTICAL", variometro, 2, 1),
]

for etiqueta, dibujar, col, fila in RELOJES:
    cx = W * COLUMNAS[col] / 100
    cy = H * FILAS[fila] / 100
    partes.append(dibujar(cx, cy))
    partes.append(texto(cx, cy + R_BISEL + 48, etiqueta, 16, CREMA, 600, espaciado=1.6))

logo_b64 = base64.b64encode((pathlib.Path(__file__).resolve().parent / "logo-panel.png").read_bytes()).decode()

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"
     role="img" aria-label="Panel con los seis instrumentos básicos de vuelo">
  <defs>
    <linearGradient id="fondo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{NAVY_OSCURO}"/>
      <stop offset="0.55" stop-color="{NAVY}"/>
      <stop offset="1" stop-color="#081526"/>
    </linearGradient>
    <linearGradient id="bisel" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#f0dfa4"/>
      <stop offset="0.45" stop-color="{ORO}"/>
      <stop offset="1" stop-color="#6d5a1f"/>
    </linearGradient>
    <radialGradient id="cara" cx="0.4" cy="0.32" r="0.85">
      <stop offset="0" stop-color="#1b2028"/>
      <stop offset="1" stop-color="{CARA}"/>
    </radialGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#fondo)"/>
  <image x="{(W - LOGO_ANCHO) / 2}" y="36" width="{LOGO_ANCHO}" height="{LOGO_ALTO}"
         href="data:image/png;base64,{logo_b64}"/>
  {texto(W / 2, 196, "PANEL DE INSTRUMENTOS DE VUELO", 24, CREMA, 600, espaciado=5.5)}
{"".join(partes)}
</svg>
'''

destino = pathlib.Path(__file__).resolve().parent.parent / "public/images/temas/six-pack.svg"
destino.write_text(svg, encoding="utf-8")
print("escrito:", destino, "|", len(svg) // 1024, "KB")
