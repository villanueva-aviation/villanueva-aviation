"""Puente entre Microsoft Flight Simulator y el overlay en vivo de Villanueva Aviation.

Lee del simulador la tasa de descenso al tocar pista y la ofrece en
http://127.0.0.1:8765/aterrizaje, para que el overlay (villanueva-aviation.pages.dev/overlay/en-vivo)
muestre solo la tarjeta del aterrizaje.

Una sola vez:   python -m pip install SimConnect
Cada en vivo:   python puente-aterrizaje.py   (con el simulador abierto o por abrir; deja la ventana abierta)
En la PC de Erik arranca solo con Windows, sin ventana: acceso directo "Puente aterrizaje Villanueva Aviation"
en la carpeta Inicio, que abre con pythonw la copia de %LOCALAPPDATA%\\VillanuevaAviation\\puente.
"""
import json
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from SimConnect import AircraftRequests, Request, SimConnect

PUERTO = 8765
ultimo = {"vez": 0, "fpm": None, "conectado": False}


def es_aterrizaje(en_tierra_antes, en_tierra, nudos, desde_ultimo):
    """Paso del aire a tierra con velocidad de aterrizaje; ignora rebotes de los 10 s siguientes."""
    return en_tierra_antes is False and en_tierra and nudos > 30 and desde_ultimo > 10


def leer_simulador():
    while True:
        try:
            sm = SimConnect()
        except Exception:
            print("Esperando a Microsoft Flight Simulator…")
            time.sleep(5)
            continue
        print("Conectado al simulador. Esperando el aterrizaje…")
        aq = AircraftRequests(sm, _time=0)
        # Velocidad vertical guardada por el simulador en el instante del toque (pies por segundo).
        toque = Request((b"PLANE TOUCHDOWN NORMAL VELOCITY", b"Feet per second"), sm, _time=0)
        en_tierra_antes, vs_aire, ultimo_toque, sin_datos = None, 0.0, 0.0, 0
        ultimo["conectado"] = True
        try:
            while True:
                suelo = aq.get("SIM_ON_GROUND")
                if suelo is None:
                    # Un instante sin respuesta (menús, cargas) no es desconexión; 5 s seguidos sí.
                    sin_datos += 1
                    if sin_datos > 100:
                        raise ConnectionError("sin datos")
                    time.sleep(0.05)
                    continue
                sin_datos = 0
                en_tierra = bool(suelo)
                vs = aq.get("VERTICAL_SPEED")  # pies por minuto
                if not en_tierra and vs is not None:
                    vs_aire = vs
                nudos = aq.get("GROUND_VELOCITY") or 0
                if es_aterrizaje(en_tierra_antes, en_tierra, nudos, time.time() - ultimo_toque):
                    ultimo_toque = time.time()
                    time.sleep(0.2)  # deja que el simulador guarde el dato del toque
                    v = toque.value
                    # ponytail: si el simulador no da el dato del toque, se usa la última lectura en el aire (20 por segundo).
                    fpm = abs(v) * 60 if v else abs(vs_aire)
                    ultimo.update(vez=int(time.time() * 1000), fpm=round(fpm))
                    print(f"Aterrizaje: -{round(fpm)} fpm")
                en_tierra_antes = en_tierra
                time.sleep(0.05)
        except Exception:
            ultimo["conectado"] = False
            print("Se perdió la conexión con el simulador. Reintentando…")
            try:
                sm.exit()
            except Exception:
                pass
            time.sleep(5)


class Servidor(BaseHTTPRequestHandler):
    def _cabeceras(self, codigo=200):
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET")
        self.send_header("Access-Control-Allow-Private-Network", "true")  # el overlay está en internet y pide a esta PC
        self.end_headers()

    def do_OPTIONS(self):
        self._cabeceras(204)

    def do_GET(self):
        if self.path.split("?")[0] != "/aterrizaje":
            self._cabeceras(404)
            return
        self._cabeceras()
        self.wfile.write(json.dumps(ultimo).encode())

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    assert es_aterrizaje(False, True, 60, 30)
    assert not es_aterrizaje(None, True, 60, 30)  # recién conectado ya en tierra
    assert not es_aterrizaje(False, True, 10, 30)  # rodando despacio, no es aterrizaje
    assert not es_aterrizaje(False, True, 60, 3)  # rebote
    threading.Thread(target=leer_simulador, daemon=True).start()
    print(f"Puente listo en http://127.0.0.1:{PUERTO}/aterrizaje — deja esta ventana abierta durante el en vivo.")
    ThreadingHTTPServer(("127.0.0.1", PUERTO), Servidor).serve_forever()
