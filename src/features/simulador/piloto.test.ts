import { test } from "node:test";
import assert from "node:assert/strict";
import { H135 } from "./ficha.ts";
import { paso, potenciaRequerida, sigma, type Estado, type Objetivos, type Viento } from "./modelo.ts";
import { AP_APAGADO, pilotar, pulsar, type EstadoAp, type Selecciones } from "./piloto.ts";
import { guiaVor, recibirNav, type Guia } from "./radios.ts";
import type { Vor } from "./datos.ts";

const DT = 0.02;
const SIN_TOCAR = { lat: false, lon: false, col: false };
const crucero = (ias: number, alt: number, rumboV = 0): { e: Estado; manual: Objetivos } => {
  const tas = ias / Math.sqrt(sigma(alt));
  const cabeceo = 5 - tas / 8;
  const colectivo = potenciaRequerida(H135, ias) / sigma(alt) ** 1.2;
  return {
    e: { lat: 20, lon: -103, altFt: alt, ias, gs: tas, vs: 0, cabeceo, inclinacion: 0, rumboV, track: rumboV, vLat: 0, colectivo, enTierra: false, bola: 0 },
    manual: { cabeceo, inclinacion: 0, colectivo, pedales: 0 },
  };
};
const sel0: Selecciones = { hdg: 0, altSel: 5000, vsSel: 0, iasSel: 120 };

function volar(
  e: Estado, ap: EstadoAp, sel: Selecciones, manual: Objetivos, s: number,
  opts: { viento?: Viento; guia?: (e: Estado) => Guia | null; cada?: (e: Estado, ap: EstadoAp) => void } = {},
) {
  for (let i = 0; i < s / DT; i++) {
    const r = pilotar(ap, e, sel, opts.guia?.(e) ?? null, manual, SIN_TOCAR, H135, 0, DT);
    ap = r.ap;
    e = paso(e, r.objetivos, H135, opts.viento ?? { dir: 0, kt: 0 }, -1000, DT);
    opts.cada?.(e, ap);
  }
  return { e, ap };
}
const encender = (e: Estado, sel: Selecciones, ...botones: Parameters<typeof pulsar>[1][]) =>
  botones.reduce((ap, b) => pulsar(ap, b, e, sel), pulsar(AP_APAGADO, "AP", e, sel));

test("con el AP apagado pilotar devuelve los mandos del piloto", () => {
  const { e, manual } = crucero(120, 5000);
  assert.deepEqual(pilotar(AP_APAGADO, e, sel0, null, manual, SIN_TOCAR, H135, 0, DT).objetivos, manual);
});

test("HDG de 360 a 090 en menos de 40 s sin pasar de 20° de inclinación", () => {
  const { e, manual } = crucero(120, 5000);
  const sel = { ...sel0, hdg: 90 };
  let maxInc = 0;
  let llego = Infinity;
  let t = 0;
  volar(e, encender(e, sel, "HDG"), sel, manual, 60, {
    cada: (x) => {
      t += DT;
      maxInc = Math.max(maxInc, Math.abs(x.inclinacion));
      if (Math.abs(x.rumboV - 90) <= 2 && llego === Infinity) llego = t;
      if (llego < Infinity) assert.ok(Math.abs(x.rumboV - 90) <= 2, `se salió: ${x.rumboV}`);
    },
  });
  assert.ok(llego < 40, `llegó a los ${llego} s`);
  assert.ok(maxInc <= 20, `inclinación ${maxInc}`);
});

test("NAV captura el radial 090 desde 3 NM al sur con rumbo 060 y no se pasa más de un punto", () => {
  const vor: Vor = { ident: "TST", nombre: "Prueba", lat: 20, lon: -103, mhz: 117.5, dme: true, decl: 0, elevFt: 0 };
  const { e: e0, manual } = crucero(120, 5000, 60);
  const e = { ...e0, lat: 20 - 3 / 60, lon: -103 + 10 / (60 * Math.cos((20 * Math.PI) / 180)) };
  const sel = { ...sel0, hdg: 60 };
  const ap = encender(e, sel, "HDG", "NAV");
  assert.equal(ap.armado, "NAV");
  let peor = -Infinity;
  const guia = (x: Estado) => {
    const l = recibirNav(117.5, 90, x, [vor]);
    return l && guiaVor(l, 90);
  };
  const r = volar(e, ap, sel, manual, 300, {
    guia,
    cada: (x) => {
      peor = Math.max(peor, recibirNav(117.5, 90, x, [vor])!.desvGrados);
    },
  });
  assert.equal(r.ap.lat, "NAV");
  assert.ok(Math.abs(guia(r.e)!.xtkNm) < 0.2, `xtk ${guia(r.e)!.xtkNm}`);
  assert.ok(peor <= 2, `se pasó ${peor}° (más de un punto)`);
});

test("NAV sin señal avisa y pasa a HDG", () => {
  const { e, manual } = crucero(120, 5000);
  const ap = { ...encender(e, sel0, "NAV"), lat: "NAV" as const, armado: null };
  const r = pilotar(ap, e, sel0, null, manual, SIN_TOCAR, H135, 0, DT);
  assert.equal(r.ap.lat, "HDG");
  assert.equal(r.ap.aviso, "Sin señal");
});

test("ALT sostiene ±20 ft durante 60 s con viento 270/20", () => {
  const { e, manual } = crucero(120, 5000);
  let peor = 0;
  volar(e, encender(e, sel0, "ALT"), sel0, manual, 60, {
    viento: { dir: 270, kt: 20 },
    cada: (x) => (peor = Math.max(peor, Math.abs(x.altFt - 5000))),
  });
  assert.ok(peor <= 20, `se fue ${peor} ft`);
});

test("ALTA a 7,000 con VS 1,000 llega ±50 ft y termina en ALT", () => {
  const { e, manual } = crucero(120, 5000);
  const sel = { ...sel0, altSel: 7000, vsSel: 1000 };
  const r = volar(e, encender(e, sel, "ALTA"), sel, manual, 240);
  assert.equal(r.ap.vert, "ALT");
  assert.ok(Math.abs(r.e.altFt - 7000) <= 50, `alt ${r.e.altFt}`);
});

test("VS sube al régimen seleccionado", () => {
  const { e, manual } = crucero(120, 5000);
  const sel = { ...sel0, vsSel: 700 };
  const r = volar(e, encender(e, sel, "VS"), sel, manual, 20);
  assert.ok(Math.abs(r.e.vs - 700) <= 30, `vs ${r.e.vs}`);
});

test("IAS 90 desde 120: queda en 90 ±3 kt a los 60 s", () => {
  const { e, manual } = crucero(120, 5000);
  const sel = { ...sel0, iasSel: 90 };
  const r = volar(e, encender(e, sel, "ALT", "IAS"), sel, manual, 60);
  assert.ok(Math.abs(r.e.ias - 90) <= 3, `ias ${r.e.ias}`);
});

test("tocar un eje desconecta solo ese eje con aviso", () => {
  const { e, manual } = crucero(120, 5000);
  const ap = encender(e, sel0, "HDG", "ALT", "IAS");
  const lat = pilotar(ap, e, sel0, null, manual, { ...SIN_TOCAR, lat: true }, H135, 0, DT).ap;
  assert.equal(lat.lat, "ATT");
  assert.equal(lat.vert, "ALT");
  assert.match(lat.aviso!, /HDG desconectado/);
  const col = pilotar(ap, e, sel0, null, manual, { ...SIN_TOCAR, col: true }, H135, 0, DT).ap;
  assert.equal(col.vert, "ATT");
  assert.equal(col.lat, "HDG");
  assert.ok(col.aviso);
  const lon = pilotar(ap, e, sel0, null, manual, { ...SIN_TOCAR, lon: true }, H135, 0, DT).ap;
  assert.equal(lon.ias, false);
  assert.ok(lon.aviso);
});

test("los pedales siempre son los del piloto", () => {
  const { e, manual } = crucero(120, 5000);
  const r = pilotar(encender(e, sel0, "HDG", "ALT"), e, sel0, null, { ...manual, pedales: 0.4 }, SIN_TOCAR, H135, 0, DT);
  assert.equal(r.objetivos.pedales, 0.4);
});
