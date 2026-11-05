"""Compila el lector del instructor y arma public/downloads/villanueva-instructor-lector.zip.

Uso: python -I tools/instructor-lector/build.py

Compila contra Microsoft.FlightSimulator.SimConnect.dll del SDK de MSFS o, si no esta, la de SimHub.
El zip NO lleva las DLL de SimConnect: el lector las busca en la PC del cadete (ver LectorInstructor.cs).
"""
import os
import subprocess
import zipfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parents[1]
OUT = AQUI / "out"
EXE = OUT / "VillanuevaInstructorLector.exe"
ZIP = RAIZ / "public" / "downloads" / "villanueva-instructor-lector.zip"
CSC = Path(r"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe")
CARPETA = "Villanueva Instructor Lector"

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
     f"/reference:{referencia}", str(AQUI / "LectorInstructor.cs")],
    check=True,
)
print(f"{EXE.name} compilado contra {referencia}")

ZIP.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED) as z:
    z.write(EXE, f"{CARPETA}/{EXE.name}")
    for nombre in ("LEEME.txt", "Iniciar con Windows.bat"):
        # Bloc de notas y cmd quieren CRLF.
        texto = (AQUI / nombre).read_text(encoding="utf-8").replace("\r\n", "\n").replace("\n", "\r\n")
        z.writestr(f"{CARPETA}/{nombre}", texto.encode("utf-8"))
print(f"{ZIP.relative_to(RAIZ)}: {ZIP.stat().st_size // 1024} KB")
