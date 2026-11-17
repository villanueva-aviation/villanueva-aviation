"""Compila el lector del ATIS (tools/atis-lector/out). El zip se arma mas adelante.

Uso: python -I tools/atis-lector/build.py

Compila contra Microsoft.FlightSimulator.SimConnect.dll del SDK de MSFS o, si no esta, la de SimHub.
El futuro zip NO llevara las DLL de SimConnect: el lector las busca en la PC del cadete (ver LectorAtis.cs).
"""
import os
import subprocess
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parents[1]
OUT = AQUI / "out"
EXE = OUT / "VillanuevaAtisLector.exe"
CSC = Path(r"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe")
CARPETA = "Villanueva ATIS"  # para el zip del plan 4

sdk = Path(os.environ.get("MSFS_SDK", r"C:\MSFS SDK"))
candidatas = [
    sdk / "SimConnect SDK" / "lib" / "managed" / "Microsoft.FlightSimulator.SimConnect.dll",
    Path(r"C:\Program Files (x86)\SimHub\_Addons\GamePlugins\FlightSimulator\Microsoft.FlightSimulator.SimConnect.dll"),
]
referencia = next((c for c in candidatas if c.exists()), None)
if referencia is None:
    raise SystemExit("No encontre Microsoft.FlightSimulator.SimConnect.dll para compilar (SDK de MSFS o SimHub).")

OUT.mkdir(exist_ok=True)
subprocess.run(
    [str(CSC), "/nologo", "/optimize+", "/target:exe", "/platform:x64", f"/out:{EXE}",
     f"/reference:{referencia}", str(AQUI / "LectorAtis.cs")],
    check=True,
)
print(f"{EXE.name} compilado contra {referencia}")
