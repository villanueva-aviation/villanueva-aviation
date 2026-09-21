# -*- coding: utf-8 -*-
"""Genera los paquetes de rutas de México a partir de datos públicos.

Escribe:
  src/data/rutas.json           datos de cada ruta (distancia, rumbos, terreno, aeropuertos)
  public/downloads/rutas/*.pln  plan de vuelo para MSFS (directo, salida y destino)

Fuentes (todas gratuitas y sin cuenta):
  - aviationweather.gov: coordenadas, elevación, pistas y frecuencias de cada aeropuerto
  - NOAA NCEI (modelo magnético WMM-2025): variación magnética en el punto medio de la ruta
  - Open-Meteo (modelo de elevación): terreno bajo la ruta, en un corredor de ±5 NM

Uso:  python automation/rutas/generar.py
Los rumbos magnéticos y el terreno son para SIMULACIÓN Y FORMACIÓN: no sustituyen las cartas oficiales.
"""
import json
import math
import os
import time
import urllib.request

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SALIDA_JSON = os.path.join(RAIZ, "src", "data", "rutas.json")
CARPETA_PLN = os.path.join(RAIZ, "public", "downloads", "rutas")
CLAVE_WMM = os.environ.get("NOAA_WMM_KEY", "zNEw7")  # clave de demostración publicada en la documentación de NOAA

NM_M = 1852.0
R_NM = 6371008.8 / NM_M
PASO_NM = 3.0
CORREDOR_NM = 5.0
MARGEN_TERRENO_FT = 2000  # margen sobre el punto más alto del corredor

NOMBRES = {
    "MMGL": "Guadalajara", "MMPR": "Puerto Vallarta", "MMZO": "Manzanillo", "MMAS": "Aguascalientes",
    "MMLO": "Del Bajío (Guanajuato)", "MMMX": "Ciudad de México", "MMQT": "Querétaro", "MMAA": "Acapulco",
    "MMUN": "Cancún", "MMCZ": "Cozumel", "MMSD": "Los Cabos", "MMLP": "La Paz",
    "MMTJ": "Tijuana", "MMML": "Mexicali", "MMLT": "Loreto", "MMHO": "Hermosillo", "MMGM": "Guaymas",
    "MMMZ": "Mazatlán", "MMDO": "Durango", "MMMY": "Monterrey", "MMRX": "Reynosa", "MMOX": "Oaxaca",
    "MMPS": "Puerto Escondido", "MMMD": "Mérida", "MMCE": "Ciudad del Carmen",
}

RUTAS = [
    ("mmgl-mmpr", "Occidente", "MMGL", "MMPR"),
    ("mmgl-mmzo", "Occidente", "MMGL", "MMZO"),
    ("mmgl-mmas", "Occidente", "MMGL", "MMAS"),
    ("mmgl-mmlo", "Occidente", "MMGL", "MMLO"),
    ("mmmx-mmqt", "Centro", "MMMX", "MMQT"),
    ("mmmx-mmaa", "Centro", "MMMX", "MMAA"),
    ("mmun-mmcz", "Caribe", "MMUN", "MMCZ"),
    ("mmsd-mmlp", "Baja California Sur", "MMSD", "MMLP"),
    # Paquete 2
    ("mmtj-mmml", "Baja California", "MMTJ", "MMML"),
    ("mmlp-mmlt", "Baja California Sur", "MMLP", "MMLT"),
    ("mmho-mmgm", "Noroeste", "MMHO", "MMGM"),
    ("mmmz-mmdo", "Noroeste", "MMMZ", "MMDO"),
    ("mmmy-mmrx", "Noreste", "MMMY", "MMRX"),
    ("mmox-mmps", "Sur", "MMOX", "MMPS"),
    ("mmmd-mmun", "Yucatán", "MMMD", "MMUN"),
    ("mmmd-mmce", "Yucatán", "MMMD", "MMCE"),
]


def http_json(url, intentos=3):
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers={"user-agent": "VillanuevaAviation-rutas/1.0"})
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception:
            if i == intentos - 1:
                raise
            time.sleep(2)


# ---------- geodesia (esfera) ----------
def distancia_nm(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * R_NM * math.asin(math.sqrt(h))


def rumbo(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    y = math.sin(lo2 - lo1) * math.cos(la2)
    x = math.cos(la1) * math.sin(la2) - math.sin(la1) * math.cos(la2) * math.cos(lo2 - lo1)
    return (math.degrees(math.atan2(y, x)) + 360) % 360


def destino(p, brg, d_nm):
    la1, lo1, br, d = math.radians(p[0]), math.radians(p[1]), math.radians(brg), d_nm / R_NM
    la2 = math.asin(math.sin(la1) * math.cos(d) + math.cos(la1) * math.sin(d) * math.cos(br))
    lo2 = lo1 + math.atan2(math.sin(br) * math.sin(d) * math.cos(la1), math.cos(d) - math.sin(la1) * math.sin(la2))
    return (math.degrees(la2), (math.degrees(lo2) + 540) % 360 - 180)


def punto_en_ruta(a, b, frac):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    d = distancia_nm(a, b) / R_NM
    if d == 0:
        return a
    A, B = math.sin((1 - frac) * d) / math.sin(d), math.sin(frac * d) / math.sin(d)
    x = A * math.cos(la1) * math.cos(lo1) + B * math.cos(la2) * math.cos(lo2)
    y = A * math.cos(la1) * math.sin(lo1) + B * math.cos(la2) * math.sin(lo2)
    z = A * math.sin(la1) + B * math.sin(la2)
    return (math.degrees(math.atan2(z, math.hypot(x, y))), math.degrees(math.atan2(y, x)))


# ---------- datos externos ----------
def aeropuerto(icao):
    datos = http_json(f"https://aviationweather.gov/api/data/airport?ids={icao}&format=json")
    if not datos:
        raise SystemExit(f"Sin datos para {icao}: revisa el código OACI")
    d = datos[0]
    pistas = []
    for r in d.get("runways") or []:
        largo, ancho = (int(x) for x in r["dimension"].split("x"))
        pistas.append({"id": r["id"], "largoFt": largo, "anchoFt": ancho, "superficie": r.get("surface")})
    freqs = []
    for par in (d.get("freqs") or "").split(";"):
        if "," in par:
            tipo, mhz = par.split(",", 1)
            freqs.append({"tipo": tipo, "mhz": mhz})
    return {
        "icao": icao, "iata": d.get("iataId"), "nombre": NOMBRES.get(icao, d["name"].title()),
        "lat": d["lat"], "lon": d["lon"], "elevFt": round(d["elev"] * 3.28084),
        "torre": d.get("tower") == "T", "pistas": pistas, "frecuencias": freqs,
    }


def declinacion(lat, lon):
    url = ("https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination"
           f"?lat1={lat:.4f}&lon1={lon:.4f}&key={CLAVE_WMM}&resultFormat=json")
    return http_json(url)["result"][0]["declination"]  # grados, positivo = este


def elevaciones(puntos):
    """Metros sobre el nivel del mar, en lotes de 100 puntos."""
    salida = []
    for i in range(0, len(puntos), 100):
        lote = puntos[i:i + 100]
        lats = ",".join(f"{p[0]:.4f}" for p in lote)
        lons = ",".join(f"{p[1]:.4f}" for p in lote)
        salida += http_json(f"https://api.open-meteo.com/v1/elevation?latitude={lats}&longitude={lons}")["elevation"]
        time.sleep(0.4)
    return salida


# ---------- niveles VFR (CO AV-1.02/25, apéndice C; aplican sobre 2,000 ft AGL) ----------
def nivel_vfr(min_ft, rumbo_mag):
    base = 3500 if rumbo_mag < 180 else 4500  # 000-179: 3,500, 5,500...   180-359: 4,500, 6,500...
    n = base
    while n < min_ft:
        n += 2000
    return n


def dms(v, pos, neg):
    h = pos if v >= 0 else neg
    v = abs(v)
    g = int(v)
    m = int((v - g) * 60)
    s = (v - g - m / 60) * 3600
    return f"{h}{g}° {m}' {s:.2f}\""


def lla(ap):
    return f"{dms(ap['lat'], 'N', 'S')},{dms(ap['lon'], 'E', 'W')},+{ap['elevFt']:06d}.00"


def plan_pln(rid, o, d, nivel):
    def wp(ap):
        return (f'        <ATCWaypoint id="{ap["icao"]}">\n            <ATCWaypointType>Airport</ATCWaypointType>\n'
                f'            <WorldPosition>{lla(ap)}</WorldPosition>\n            <ICAO>\n'
                f'                <ICAOIdent>{ap["icao"]}</ICAOIdent>\n            </ICAO>\n        </ATCWaypoint>\n')
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n<SimBase.Document Type="AceXML" version="1,0">\n'
        '    <Descr>AceXML Document</Descr>\n    <FlightPlan.FlightPlan>\n'
        f'        <Title>{o["icao"]} to {d["icao"]}</Title>\n        <FPType>VFR</FPType>\n        <RouteType>Direct</RouteType>\n'
        f'        <CruisingAlt>{nivel:.3f}</CruisingAlt>\n'
        f'        <DepartureID>{o["icao"]}</DepartureID>\n        <DepartureLLA>{lla(o)}</DepartureLLA>\n'
        f'        <DestinationID>{d["icao"]}</DestinationID>\n        <DestinationLLA>{lla(d)}</DestinationLLA>\n'
        f'        <Descr>{o["icao"]}, {d["icao"]}</Descr>\n'
        f'        <DepartureName>{o["nombre"]}</DepartureName>\n        <DestinationName>{d["nombre"]}</DestinationName>\n'
        '        <AppVersion>\n            <AppVersionMajor>11</AppVersionMajor>\n            <AppVersionBuild>282174</AppVersionBuild>\n        </AppVersion>\n'
        + wp(o) + wp(d) + '    </FlightPlan.FlightPlan>\n</SimBase.Document>\n'
    )


def construir_ruta(rid, region, oi, di, cache):
    o = cache.setdefault(oi, aeropuerto(oi))
    d = cache.setdefault(di, aeropuerto(di))
    a, b = (o["lat"], o["lon"]), (d["lat"], d["lon"])
    dist = distancia_nm(a, b)
    tc_ini, tc_fin = rumbo(a, b), (rumbo(b, a) + 180) % 360
    medio = punto_en_ruta(a, b, 0.5)
    dec = declinacion(*medio)
    mc_ini = (tc_ini - dec) % 360

    n = max(2, math.ceil(dist / PASO_NM))
    puntos, distancias, tipos = [], [], []
    for i in range(n + 1):
        f = i / n
        p = punto_en_ruta(a, b, f)
        sig = punto_en_ruta(a, b, min(1, f + 0.01))
        brg = rumbo(p, sig) if f < 1 else tc_fin
        for lado, off in (("centro", 0), ("izq", -1), ("der", 1)):
            q = p if off == 0 else destino(p, (brg + 90 * off) % 360, CORREDOR_NM)
            puntos.append(q)
            distancias.append(round(dist * f, 1))
            tipos.append(lado)
    elev_ft = [round(e * 3.28084) for e in elevaciones(puntos)]

    perfil = []
    for i in range(0, len(puntos), 3):
        perfil.append([distancias[i], max(elev_ft[i:i + 3])])  # máximo del corredor en cada paso
    max_ft = max(p[1] for p in perfil)
    donde = next(p[0] for p in perfil if p[1] == max_ft)
    sobre_agua = sum(1 for e in elev_ft[0::3] if e <= 16) / len(elev_ft[0::3])
    minimo = max_ft + MARGEN_TERRENO_FT
    nivel = nivel_vfr(minimo, mc_ini)

    os.makedirs(CARPETA_PLN, exist_ok=True)
    with open(os.path.join(CARPETA_PLN, f"{rid}.pln"), "w", encoding="utf-8", newline="\n") as f:
        f.write(plan_pln(rid, o, d, nivel))

    advertencias = []
    if nivel > 10000:
        advertencias.append("Nivel sobre 10,000 ft: piensa en el oxígeno y en el rendimiento de tu avión (techo de servicio).")
    if nivel > 18000:
        advertencias.append("Nivel sobre 18,000 ft: no es una ruta VFR directa; rodea el terreno o vuela IFR.")
    if max_ft - max(o["elevFt"], d["elevFt"]) > 5000:
        advertencias.append("Cruza terreno mucho más alto que los dos aeropuertos: estudia el perfil y las cartas antes de volarla.")
    return {
        "id": rid, "region": region, "origen": oi, "destino": di,
        "distanciaNm": round(dist), "rumboVerdaderoIni": round(tc_ini), "rumboVerdaderoFin": round(tc_fin),
        "variacionMagnetica": round(dec, 1), "rumboMagneticoIni": round(mc_ini),
        "tiempoMin100kt": round(dist / 100 * 60), "tiempoMin140kt": round(dist / 140 * 60),
        "terrenoMaxFt": max_ft, "terrenoMaxKmDesdeSalidaNm": round(donde),
        "sobreAguaPct": round(sobre_agua * 100), "nivelMinimoFt": math.ceil(minimo / 100) * 100,
        "nivelSugeridoFt": nivel, "advertencias": advertencias, "perfil": perfil,
        "plan": f"/downloads/rutas/{rid}.pln",
    }


def main():
    cache = {}
    rutas = []
    for rid, region, oi, di in RUTAS:
        r = construir_ruta(rid, region, oi, di, cache)
        rutas.append(r)
        print(f'{rid}: {r["distanciaNm"]} NM, TC {r["rumboVerdaderoIni"]}, MC {r["rumboMagneticoIni"]}, '
              f'terreno max {r["terrenoMaxFt"]} ft, nivel {r["nivelSugeridoFt"]}, agua {r["sobreAguaPct"]}%')
    salida = {
        "generado": time.strftime("%Y-%m-%d"),
        "modeloMagnetico": "WMM-2025",
        "aeropuertos": cache,
        "rutas": rutas,
    }
    os.makedirs(os.path.dirname(SALIDA_JSON), exist_ok=True)
    with open(SALIDA_JSON, "w", encoding="utf-8", newline="\n") as f:
        json.dump(salida, f, ensure_ascii=False, indent=1)
    print("Escrito", SALIDA_JSON)


if __name__ == "__main__":
    main()
