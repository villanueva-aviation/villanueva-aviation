import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { armarDatis, datisPara, datisVigente, emitidoMs, huella, leerDatis, nombreFrecuencia, metarDeTexto, urlVoz, vigenteDatis, vivosDe, type EntradaDatis } from "./datis.ts";
import type { AeropuertoAtis } from "./datos.ts";

const muestra: EntradaDatis[] = JSON.parse(
  readFileSync(new URL("./datis.muestra.json", import.meta.url), "utf8"),
);
const deLaMuestra = (airport: string, type: string) => {
  const e = muestra.find((x) => x.airport === airport && x.type === type);
  assert.ok(e, `${airport} ${type} no está en la muestra`);
  return e;
};

const KJFK: EntradaDatis = { airport: "KJFK", type: "combined", code: "H", time: "0451", updatedAt: "2026-11-24T05:26:29Z",
  datis: "JFK ATIS INFO H 0451Z. 35011G22KT 10SM BKN095 BKN120 11/M01 A3008 (THREE ZERO ZERO EIGHT). APPROACH IN USE ILS RY 31R, VISUAL APCH RY 31L. DEPG RY 31L. NOTAMS, . RWY 4R, 22L CLSD. RY 31L PAPI OTS. NUM CRANES OPERATING AT JFK. BIRD ACTIVITY VICINITY ARPT. READBACK ALL RWY ASSIGNMENTS AND HOLD SHORT INSTRUCTIONS. ...ADVS YOU HAVE INFO H." };

test("leerDatis: encabezado, METAR y resto de KJFK", () => {
  const l = leerDatis(KJFK);
  assert.equal(l.letra, "H"); assert.equal(l.hora, "0451"); assert.equal(l.especial, false);
  assert.equal(l.metar, "35011G22KT 10SM BKN095 BKN120 11/M01 A3008");
  assert.equal(l.rmk, null);
  assert.deepEqual(l.resto, ["APPROACH IN USE ILS RY 31R, VISUAL APCH RY 31L.", "DEPG RY 31L.", "NOTAMS.", "RWY 4R, 22L CLSD.",
    "RY 31L PAPI OTS.", "NUM CRANES OPERATING AT JFK.", "BIRD ACTIVITY VICINITY ARPT.", "READBACK ALL RWY ASSIGNMENTS AND HOLD SHORT INSTRUCTIONS."]);
});

test("leerDatis: RMK aparte y encabezado SPECIAL", () => {
  const lax = leerDatis(deLaMuestra("KLAX", "combined"));
  assert.equal(lax.metar, "32003KT 10SM SCT250 17/11 A3016");
  assert.equal(lax.rmk, "AO2 SLP213 T01720106");
  assert.equal(lax.especial, false);
  const dtw = leerDatis(deLaMuestra("KDTW", "dep"));
  assert.equal(dtw.especial, true);
  assert.equal(dtw.letra, "R");
  assert.equal(dtw.metar, "32007KT 10SM SCT022 00/M04 A3037");
  assert.equal(dtw.rmk, "AO2 T00001039");
  assert.equal(dtw.resto[0], "DEPG RWY 3R ;.");
});

test("leerDatis: las 89 entradas de la muestra tienen letra igual a code, hora igual a time y METAR con altímetro", () => {
  assert.equal(muestra.length, 89);
  for (const e of muestra) { const l = leerDatis(e); assert.equal(l.letra, e.code); assert.equal(l.hora, e.time); assert.match(l.metar ?? "", /\bA\d{4}$/); }
});

test("leerDatis: sin encabezado ni altímetro usa code/time y todo va a resto", () => {
  const l = leerDatis({ ...KJFK, datis: "TEXTO LIBRE. OTRA COSA. ...ADVS YOU HAVE INFO H." });
  assert.equal(l.letra, "H"); assert.equal(l.hora, "0451"); assert.equal(l.metar, null);
  assert.deepEqual(l.resto, ["TEXTO LIBRE.", "OTRA COSA."]);
});

test("vigenteDatis: 89 min sí, 91 no; 2350 emitido visto a las 0010 del día siguiente vale", () => {
  const e = { ...KJFK, time: "0451" };
  const base = Date.UTC(2026, 10, 24, 4, 51);
  assert.equal(vigenteDatis(e, base + 89 * 60_000), true);
  assert.equal(vigenteDatis(e, base + 91 * 60_000), false);
  assert.equal(vigenteDatis(e, base + 90 * 60_000), false);
  assert.equal(vigenteDatis(e, base + 90 * 60_000 - 1000), true);
  assert.equal(vigenteDatis(e, base - 2 * 60_000), true); // emitido 2 min "en el futuro"
  const noche = { ...KJFK, time: "2350" };
  const visto = Date.UTC(2026, 10, 25, 0, 10);
  assert.equal(emitidoMs("2350", visto), Date.UTC(2026, 10, 24, 23, 50));
  assert.equal(vigenteDatis(noche, visto), true);
});

test("datisPara: combined gana; DEP en el nombre da dep; otro nombre o null da arr", () => {
  const arr = { ...KJFK, type: "arr" as const }, dep = { ...KJFK, type: "dep" as const }, comb = KJFK;
  assert.equal(datisPara([arr, dep, comb], "X DEP"), comb);
  assert.equal(datisPara([arr, dep], "DTW_DEP_ATIS"), dep);
  assert.equal(datisPara([arr, dep], "DTW_ATIS"), arr);
  assert.equal(datisPara([arr, dep], null), arr);
  assert.equal(datisPara([], null), null);
});

test("datisVigente: esperando sin respuesta; falla sin respuesta previa o viejo da null; vigente da la entrada de esa frecuencia", () => {
  const ahora = Date.UTC(2026, 10, 24, 5, 0);
  const arr = { ...KJFK, type: "arr" as const }, dep = { ...KJFK, type: "dep" as const };
  assert.equal(datisVigente({ entradas: null, fallo: false }, null, ahora), "esperando");
  assert.equal(datisVigente({ entradas: null, fallo: true }, null, ahora), null);
  assert.equal(datisVigente({ entradas: [KJFK], fallo: true }, null, ahora), KJFK); // falla con respuesta previa: sigue la previa
  assert.equal(datisVigente({ entradas: [KJFK], fallo: true }, null, ahora + 90 * 60_000), null); // hasta que vence
  assert.equal(datisVigente({ entradas: [], fallo: false }, null, ahora), null);
  assert.equal(datisVigente({ entradas: [arr, dep], fallo: false }, "ATIS DEP", ahora), dep);
  assert.equal(datisVigente({ entradas: [KJFK], fallo: false }, null, ahora + 90 * 60_000), null);
});

test("huella: estable y distinta con un carácter de diferencia", () => {
  assert.equal(huella("ABC"), huella("ABC")); assert.notEqual(huella("ABC"), huella("ABD")); assert.match(huella("x"), /^[0-9a-f]{8}$/);
});

const AP_KJFK: AeropuertoAtis = { icao: "KJFK", nombreEs: null, nombreEn: "John F. Kennedy International Airport", nombreSim: "John F Kennedy Intl",
  lat: 40.64, lon: -73.78, elevFt: 13, atisMhz: [115.4], pistas: [{ ident: "31L", rumboV: 314, largoFt: 14511 }, { ident: "31R", rumboV: 314, largoFt: 8400 }] };
const AHORA = Date.parse("2026-11-24T05:30:00Z");

test("metarDeTexto: viento, visibilidad, temperatura y altímetro", () => {
  const m = metarDeTexto("KJFK", Date.parse("2026-11-24T04:51:00Z"), "35011G22KT 1 1/2SM -SN BKN095 11/M01 A3008");
  assert.equal(m.rawOb, "KJFK 240451Z 35011G22KT 1 1/2SM -SN BKN095 11/M01 A3008");
  assert.equal(m.wdir, 350); assert.equal(m.wspd, 11); assert.equal(m.wgst, 22);
  assert.equal(m.visib, "1 1/2"); assert.equal(m.wxString, "-SN");
  assert.deepEqual(m.clouds, [{ cover: "BKN", base: 9500, type: null }]);
  assert.equal(m.temp, 11); assert.equal(m.dewp, -1);
  assert.ok(Math.abs(m.altim! - 1018.6) < 0.1);
  assert.equal(metarDeTexto("KJFK", 0, "VRB03KT 10SM CLR 11/05 A3008").wdir, "VRB");
});

test("armarDatis KJFK: letra y hora de la fuente, clima con piezas, avisos en vivo antes del cierre", () => {
  const a = armarDatis(KJFK, AP_KJFK, AHORA);
  assert.equal(a.letra, "H"); assert.equal(a.real, true); assert.equal(a.huella, huella(KJFK.datis));
  assert.equal("deRed" in a, false);
  assert.ok(a.partes.find((p) => p.tipo === "letra")!.piezas.some((x) => x.clave === "letra-H"));
  assert.ok(a.partes.some((p) => p.tipo === "aeropuerto" && p.piezas[0].clave === "ap-KJFK"));
  assert.ok(a.partes.some((p) => p.tipo === "viento" && !p.vivo && p.piezas.length > 0));
  const vivos = vivosDe(a);
  assert.equal(vivos[0].texto, "Approach in use I L S runway three one right, visual approach runway three one left.");
  assert.equal(a.partes.at(-1)!.tipo, "cierre");
  assert.ok(!a.partes.some((p) => p.tipo === "pista" && !p.vivo)); // la pista no se dice dos veces
  for (const p of a.partes.filter((x) => x.vivo)) assert.equal(p.piezas[0].url, urlVoz("KJFK", "combined", vivos.find((v) => v.texto === p.vivo)!.n, huella(p.vivo!)));
  assert.deepEqual(vivos.map((v) => v.n), vivos.map((_, i) => i));
});

test("armarDatis: con ap null da los mismos vivos que con ap", () => {
  assert.deepEqual(vivosDe(armarDatis(KJFK, null, AHORA)), vivosDe(armarDatis(KJFK, AP_KJFK, AHORA)));
});

test("armarDatis: el RMK queda solo en texto y nada más", () => {
  const a = armarDatis(deLaMuestra("KLAX", "combined"), null, AHORA);
  const solo = a.partes.filter((p) => p.soloTexto);
  assert.equal(solo.length, 1);
  assert.equal(solo[0].tipo, "observaciones"); assert.equal(solo[0].texto, "AO2 SLP213 T01720106");
  const i = a.partes.indexOf(solo[0]);
  assert.equal(a.partes[i + 1].tipo, "cierre");
  assert.ok(a.partes.slice(0, i).some((p) => p.tipo === "avisos" && p.vivo));
});

test("armarDatis: las 89 entradas arman sin lanzar y ninguna parte con contenido queda soloTexto salvo el RMK", () => {
  assert.equal(muestra.length, 89);
  for (const e of muestra) {
    const a = armarDatis(e, null, AHORA);
    const rmk = leerDatis(e).rmk;
    for (const p of a.partes) if (p.soloTexto) assert.ok(p.tipo === "observaciones" && p.texto === rmk, `${e.airport} ${e.type}: ${p.tipo} ${p.texto}`);
    assert.equal(a.partes.at(-1)!.tipo, "cierre");
    assert.ok(a.partes.every((p) => p.vivo || p.piezas.length > 0 || p.soloTexto), `${e.airport} ${e.type}: parte vacía`);
  }
});

test("armarDatis: un código de tiempo sin pieza (-SN) va a voz en vivo", () => {
  const e = { ...KJFK, datis: KJFK.datis.replace("10SM BKN095", "10SM -SN BKN095") };
  const a = armarDatis(e, null, AHORA);
  const t = a.partes.find((p) => p.tipo === "tiempo")!;
  assert.ok(t.vivo && !t.soloTexto); assert.equal(t.texto, "-SN");
});

test("nombreFrecuencia: el nombre que MSFS le da a la frecuencia, con tolerancia de 5 kHz", () => {
  const ap: AeropuertoAtis = { icao: "KXYZ", nombreEs: null, nombreEn: null, nombreSim: "X", lat: 0, lon: 0, elevFt: 0, atisMhz: [127.9, 128.075], atisNombres: ["ATIS ARR", "ATIS DEP"], pistas: [] };
  assert.equal(nombreFrecuencia(ap, 128.075), "ATIS DEP");
  assert.equal(nombreFrecuencia(ap, 127.9), "ATIS ARR");
  assert.equal(nombreFrecuencia(ap, 128.08), "ATIS DEP");
  assert.equal(nombreFrecuencia(ap, 121.5), null);
  assert.equal(nombreFrecuencia({ ...ap, atisNombres: undefined }, 128.075), null);
});

const conClima = (clima: string) => ({ ...KJFK, datis: KJFK.datis.replace("35011G22KT 10SM BKN095 BKN120 11/M01 A3008", clima) });
const vivosTexto = (e: EntradaDatis) => vivosDe(armarDatis(e, null, AHORA)).map((v) => v.texto).join(" ");

test("armarDatis: visibilidad con fracción y RVR se dicen como en un ATIS real", () => {
  const a = armarDatis(conClima("35011KT 1 1/2SM R04R/2000V3000FT BR OVC004 11/10 A3008"), null, AHORA);
  const vis = a.partes.find((p) => p.tipo === "visibilidad")!;
  assert.equal(vis.vivo, "Visibility one and one half."); assert.equal(vis.soloTexto, undefined);
  assert.ok(a.partes.some((p) => p.vivo === "Runway four right R V R two thousand variable three thousand."));
  const m = armarDatis(conClima("35011KT M1/4SM FG VV002 11/10 A3008"), null, AHORA);
  assert.equal(m.partes.find((p) => p.tipo === "visibilidad")!.vivo, "Visibility less than one quarter.");
});

test("armarDatis: un grupo del METAR sin regla queda solo en texto, nunca en vivo", () => {
  const e = conClima("35011KT 1 1/2SM R04R/2000V3000FT XX9 BR OVC004 11/10 A3008");
  const a = armarDatis(e, null, AHORA);
  assert.ok(a.partes.some((p) => p.soloTexto && p.texto === "XX9"));
  assert.ok(!/xx9/i.test(vivosTexto(e)));
});

test("armarDatis: sin altímetro no inventa «Sky clear» y el clima crudo no va en vivo", () => {
  const e = { ...KJFK, datis: "JFK ATIS INFO H 0451Z. 27010KT 10SM BKN010 OVC020 12/10 ALTIMETER MISSING. RWY 27 IN USE. ...ADVS YOU HAVE INFO H." };
  const a = armarDatis(e, null, AHORA);
  assert.ok(!a.partes.some((p) => p.tipo === "nubes" || p.piezas.some((x) => x.clave === "f-despejado")));
  assert.ok(a.partes.some((p) => p.soloTexto && p.texto.includes("BKN010")));
  assert.ok(!/kt|bkn|ovc/i.test(vivosTexto(e)), vivosTexto(e));
  assert.ok(vivosTexto(e).includes("Runway two seven in use."));
});

test("armarDatis: una capa sin altura (SCT///) no se vuelve «Sky clear»", () => {
  const a = armarDatis(conClima("35011KT 10SM SCT/// 11/M01 A3008"), null, AHORA);
  assert.ok(!a.partes.some((p) => p.piezas.some((x) => x.clave === "f-despejado")));
  assert.ok(a.partes.some((p) => p.tipo === "nubes" && p.soloTexto));
});

test("armarDatis: las 89 entradas dan los mismos vivos en la página (ap con pistas) y en la Function (ap null)", () => {
  assert.equal(muestra.length, 89);
  for (const e of muestra) {
    const ap = { ...AP_KJFK, icao: e.airport };
    assert.deepEqual(vivosDe(armarDatis(e, null, AHORA + 50_000)), vivosDe(armarDatis(e, ap, AHORA)), `${e.airport} ${e.type}`);
  }
});
