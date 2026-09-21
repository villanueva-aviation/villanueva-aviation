# Prueba de la lógica pura del generador (sin red):  python automation/rutas/test_generar.py
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from generar import distancia_nm, nivel_vfr, rumbo  # noqa: E402

# Guadalajara -> Puerto Vallarta: unas 110 NM, rumbo verdadero hacia el oeste (~275 grados)
gdl, pvr = (20.5197, -103.3059), (20.6800, -105.2540)
assert abs(distancia_nm(gdl, pvr) - 110) < 2, distancia_nm(gdl, pvr)
assert 270 <= rumbo(gdl, pvr) <= 280

# Niveles VFR de México (CO AV-1.02/25, apéndice C): 000-179 -> 3,500, 5,500...; 180-359 -> 4,500, 6,500...
assert nivel_vfr(10442, 270) == 10500      # oeste: 4,500 + 2,000 k
assert nivel_vfr(9523, 69) == 11500        # este: 9,500 no alcanza, sube a 11,500
assert nivel_vfr(1000, 90) == 3500 and nivel_vfr(1000, 200) == 4500  # mínimos
assert nivel_vfr(3500, 90) == 3500         # justo en el nivel: se queda
print("OK: generador")
