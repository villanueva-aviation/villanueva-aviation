// Un vuelo de rampa a rampa en el C172 desde la 11R de AEROPUERTO_PRUEBA, a 10 Hz, con los campos del lector v1.4.
// Cinemática simple (virajes instantáneos, sin viento): basta para probar las fases, no la técnica.
import type { Muestra } from "./evaluador.ts";
import { AEROPUERTO_PRUEBA as A } from "./aeropuertoSim.ts";
import { aNm, rumbo as rumboHacia, type PuntoNm } from "../home/navGeo.ts";

export type OpcionesVuelo = { rebote?: boolean; cruzarPista?: boolean; hueco?: { en: number; seg: number }; sobreOtro?: boolean; tocarYDespegar?: boolean };

const HZ = 10;
const DT = 1 / HZ;
const RAD = Math.PI / 180;
const ELEV = A.elevacionFt;
const VAR_MAG = 5; // declinación aproximada en Guadalajara (este)
const PIE_NM = 318; // ~3° de senda

const local = (lat: number, lon: number) => aNm(lat, lon, A.lat, A.lon);
const desde = (p: PuntoNm, rumbo: number, nm: number): PuntoNm => ({ x: p.x + nm * Math.sin(rumbo * RAD), y: p.y + nm * Math.cos(rumbo * RAD) });
const norm = (r: number) => ((r % 360) + 360) % 360;

export function simularVuelo(op: OpcionesVuelo = {}): Muestra[] {
  const [u11] = A.pistas[0].extremos;
  const [e02, e20] = A.pistas[1].extremos;
  const umbral = local(u11.lat, u11.lon);
  const centro02 = local((e02.lat + e20.lat) / 2, (e02.lon + e20.lon) / 2);
  const rumbo11 = u11.rumboV;
  const lado = norm(rumbo11 - 90); // hacia el norte de la pista
  const espera = desde(umbral, lado, 0.05);
  const rampa = desde(umbral, lado, 0.15);
  const final = desde(umbral, rumbo11 + 180, 3);
  const toque = desde(umbral, rumbo11, 0.16);
  const sur: PuntoNm = { x: 0.5, y: -5.6 };

  const out: Muestra[] = [];
  const s = {
    t: 0, pos: op.cruzarPista ? desde(centro02, norm(e02.rumboV + 90), 0.11) : rampa, hdg: 290, gs: 0, alt: ELEV, vs: 0,
    tierra: true, motor: false, freno: true, aterrizaje: false, taxi: false, xpdrModo: 1,
  };
  const emitir = () => {
    const lat = A.lat + s.pos.y / 60;
    const lon = A.lon + s.pos.x / (60 * Math.cos(A.lat * RAD));
    const aire = !s.tierra;
    out.push({
      t: Math.round(s.t * 10) / 10, inclinacion: 0, altitud: s.alt, velocidad: s.gs, rumbo: norm(s.hdg - VAR_MAG), bola: 0,
      agl: s.alt - ELEV, peso: 2400, enTierra: s.tierra, slew: false, tasa: 1, pausa: false, titulo: "Cessna Skyhawk 172SP",
      cabeceo: aire ? (s.vs > 0 ? 6 : -2) : 0, vs: s.vs, perdida: false, flaps: 0, rpm: s.motor ? (aire ? 2400 : 1000) : 0,
      lat, lon, gs: s.gs, rumboV: s.hdg, motor: s.motor, mezcla: 100, acelerador: s.motor ? (aire ? 100 : 20) : 0,
      magIzq: s.motor, magDer: s.motor, master: true, luzBeacon: true, luzNav: true, luzAterrizaje: s.aterrizaje,
      luzStrobe: s.aterrizaje, luzTaxi: s.taxi, freno: s.freno, xpdr: "1200", xpdrModo: s.xpdrModo, altimetro: 30.01, qnh: 30.01,
      com1: 118.1, tren: true, vientoDir: 0, vientoKt: 0,
    });
    s.t += DT;
  };
  const quieto = (seg: number) => { s.gs = 0; for (let i = 0; i < seg * HZ; i++) emitir(); };
  const avanzar = () => { s.pos = desde(s.pos, s.hdg, (s.gs * DT) / 3600); };
  // En el aire sube o baja hacia `objetivo` a lo más `fpm`.
  const altura = (objetivo: number, fpm: number) => {
    const paso = Math.max(-fpm * DT / 60, Math.min(fpm * DT / 60, objetivo - s.alt));
    s.alt += paso;
    s.vs = paso / DT * 60;
  };
  const ir = (destino: PuntoNm, kt: number, alt?: { objetivo: number; fpm: number }) => {
    s.gs = kt;
    while (true) {
      const d = Math.hypot(destino.x - s.pos.x, destino.y - s.pos.y);
      if (d < 1e-6) return;
      s.hdg = rumboHacia(s.pos, destino);
      if (alt) altura(alt.objetivo, alt.fpm);
      if (d <= (kt * DT) / 3600) s.pos = destino;
      else avanzar();
      emitir();
    }
  };
  const acelerar = (hasta: number, ktSeg: number) => {
    while (s.gs !== hasta) {
      s.gs = s.gs < hasta ? Math.min(hasta, s.gs + ktSeg * DT) : Math.max(hasta, s.gs - ktSeg * DT);
      avanzar();
      emitir();
    }
  };
  const despegar = () => {
    s.aterrizaje = true;
    s.taxi = false;
    s.xpdrModo = 4;
    s.hdg = rumbo11;
    acelerar(60, 3);
    s.tierra = false;
  };
  // Desde `final`, por la senda hasta el toque en la 11R.
  const aproximar = () => {
    s.gs = 70;
    while (true) {
      const d = Math.hypot(toque.x - s.pos.x, toque.y - s.pos.y);
      s.hdg = rumboHacia(s.pos, toque);
      const alt = ELEV + PIE_NM * Math.max(0, d - (70 * DT) / 3600);
      s.vs = (alt - s.alt) / DT * 60;
      s.alt = alt;
      if (d <= (70 * DT) / 3600) { s.pos = toque; break; }
      avanzar();
      emitir();
    }
    s.tierra = true;
    s.alt = ELEV;
    s.vs = 0;
    s.hdg = rumbo11;
  };
  const enTierra = (seg: number) => { for (let i = 0; i < seg * HZ; i++) { avanzar(); emitir(); } };

  // Rampa: 20 s con el motor apagado, arranque y 10 s quieto.
  quieto(20);
  s.motor = true;
  quieto(10);
  s.freno = false;
  s.taxi = true;
  if (op.cruzarPista) {
    ir(desde(centro02, norm(e02.rumboV - 90), 0.11), 10); // atraviesa la 02/20
    ir(rampa, 10);
  }
  ir(espera, 10);
  ir(umbral, 10);
  despegar();
  ir(sur, 100, { objetivo: ELEV + 2484, fpm: 700 }); // 7,500 ft
  ir(final, 110, { objetivo: ELEV + 1000, fpm: 700 });
  aproximar();
  if (op.tocarYDespegar) {
    s.gs = 60;
    enTierra(5);
    s.tierra = false;
    ir(desde(desde(umbral, rumbo11, 3), lado, 1), 90, { objetivo: ELEV + 1000, fpm: 700 });
    ir(desde(final, lado, 1), 90, { objetivo: ELEV + 1000, fpm: 700 });
    ir(final, 90, { objetivo: ELEV + 1000, fpm: 700 });
    aproximar();
  }
  if (op.rebote) {
    enTierra(1);
    s.tierra = false;
    s.alt = ELEV + 2;
    enTierra(0.5);
    s.tierra = true;
    s.alt = ELEV;
  }
  // Frenado, salida al norte de la pista, freno puesto y motor apagado.
  acelerar(10, 3);
  s.aterrizaje = false;
  s.taxi = true;
  s.xpdrModo = 1;
  ir(desde(s.pos, lado, 0.11), 10);
  quieto(1);
  s.freno = true;
  s.motor = false;
  s.taxi = false;
  quieto(5);

  const h = op.hueco;
  return h ? out.filter((m) => m.t < h.en || m.t >= h.en + h.seg) : out;
}
