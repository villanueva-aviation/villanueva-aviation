import { test } from "node:test";
import assert from "node:assert/strict";
import type { Metar } from "../../lib/clima.ts";
import type { AeropuertoAtis } from "./datos.ts";
import { todasLasPiezas } from "./frases.ts";
import { armarAtisMx, letraDe, pistaEnUso, type Atis, type Parte } from "./generado.ts";

const metar: Metar = {
  icaoId: "MMGL",
  rawOb: "METAR MMGL 162240Z 12004KT 7SM FEW120 BKN300 25/09 A3014 RMK 8/078 ISOL SC",
  obsTime: Date.UTC(2026, 10, 16, 22, 40) / 1000,
  wdir: 120, wspd: 4, wgst: null, visib: 7,
  clouds: [{ cover: "FEW", base: 12000 }, { cover: "BKN", base: 30000 }],
  wxString: null, temp: 25, dewp: 9, altim: 1020.6, elev: 1529,
};

// Una sola pista 11/29, para el texto exacto.
const ap: AeropuertoAtis = {
  icao: "MMGL", nombreEs: "Aeropuerto Internacional de Guadalajara", nombreEn: "Guadalajara International Airport",
  lat: 20.52, lon: -103.31, elevFt: 5016, atisMhz: [127.9],
  pistas: [{ ident: "11", rumboV: 113, largoFt: 13123 }, { ident: "29", rumboV: 293, largoFt: 13123 }],
};

// Paralelas reales de MMGL (public/data/atis/MX.json).
const mmgl: AeropuertoAtis = {
  ...ap,
  pistas: [
    { ident: "11L", rumboV: 114, largoFt: 11608 }, { ident: "29R", rumboV: 294, largoFt: 11608 },
    { ident: "11R", rumboV: 113, largoFt: 13123 }, { ident: "29L", rumboV: 293, largoFt: 13123 },
  ],
};

// letraDe = ALFABETO[floor(obsTime / 3600) % 26]; la hora 26·n + 3 da "D".
const obsD = (26 * 19000 + 3) * 3600;

const texto = (a: Atis, idioma: "es" | "en") =>
  a.partes.filter((p) => p.idioma === idioma && !p.soloTexto).map((p) => p.texto).join(" ");
const parte = (a: Atis, tipo: Parte["tipo"], idioma: "es" | "en" = "es") =>
  a.partes.find((p) => p.tipo === tipo && p.idioma === idioma);
const claves = (p: Parte | undefined) => p?.piezas.map((x) => x.clave);

test("texto exacto ES y EN (Anexo)", () => {
  const a = armarAtisMx({ ...metar, obsTime: obsD }, ap);
  assert.equal(a.letra, "D");
  assert.equal(a.icao, "MMGL");
  assert.equal(a.inicioMs, obsD * 1000);
  assert.equal(texto(a, "es"),
    "Aeropuerto Internacional de Guadalajara. Información Delta. Observación de las dos dos cuatro cero zulú. Pista en uso, uno uno. Viento, uno dos cero grados, cuatro nudos. Visibilidad, siete millas. Nubes escasas a uno dos mil pies. Fragmentadas a tres cero mil pies. Temperatura, dos cinco. Punto de rocío, cero nueve. Altímetro, tres cero uno cuatro. Estratocúmulos aislados. Al primer contacto, notifique que tiene la información Delta.");
  assert.equal(texto(a, "en"),
    "Guadalajara International Airport. Information Delta. Two two four zero zulu weather. Runway in use, one one. Wind, one two zero degrees, four knots. Visibility, seven miles. Few clouds at one two thousand. Broken, three zero thousand. Temperature, two five. Dewpoint, zero niner. Altimeter, three zero one four. Isolated stratocumulus. Advise on initial contact you have information Delta.");
  // Partes en español primero, luego en inglés.
  const idiomas = a.partes.map((p) => p.idioma);
  assert.equal(idiomas.lastIndexOf("es") < idiomas.indexOf("en"), true);
});

test("RMK no hablable queda como una parte soloTexto en su lugar", () => {
  const a = armarAtisMx(metar, ap);
  const obs = a.partes.filter((p) => p.idioma === "es" && p.tipo === "observaciones");
  assert.deepEqual(obs.map((p) => [p.texto, p.soloTexto ?? false, p.piezas.length]),
    [["8/078", true, 0], ["Estratocúmulos aislados.", false, 1]]);
  const tipos = a.partes.filter((p) => p.idioma === "es").map((p) => p.tipo);
  assert.equal(tipos.indexOf("altimetro") < tipos.indexOf("observaciones"), true);
  assert.equal(tipos.at(-1), "cierre");
});

test("piezas de la parte del viento", () => {
  const a = armarAtisMx(metar, ap);
  assert.deepEqual(claves(parte(a, "viento")),
    ["f-viento", "d-1-sigue", "d-2-sigue", "d-0-cierra", "f-grados", "d-4-cierra", "f-nudos"]);
  assert.deepEqual(claves(parte(a, "hora", "en")),
    ["d-2-sigue", "d-2-sigue", "d-4-sigue", "d-0-cierra", "f-zulu"]);
});

test("paralelas reales de MMGL: la más larga gana el empate", () => {
  assert.equal(pistaEnUso(mmgl.pistas, 120, 4)?.ident, "11R");
  assert.equal(pistaEnUso(mmgl.pistas, 120, 10)?.ident, "11R");
  assert.equal(pistaEnUso(mmgl.pistas, 300, 10)?.ident, "29L");
  const a = armarAtisMx(metar, mmgl);
  assert.equal(parte(a, "pista")?.texto, "Pista en uso, uno uno derecha.");
  assert.equal(parte(a, "pista", "en")?.texto, "Runway in use, one one right.");
  assert.deepEqual(claves(parte(a, "pista")), ["f-pista", "d-1-sigue", "d-1-cierra", "f-derecha"]);
});

test("viento flojo, VRB o calma: pista más larga, extremo le", () => {
  const pistas = [
    { ident: "04", rumboV: 40, largoFt: 6000 }, { ident: "22", rumboV: 220, largoFt: 6000 },
    { ident: "18", rumboV: 180, largoFt: 9000 }, { ident: "36", rumboV: 360, largoFt: 9000 },
  ];
  assert.equal(pistaEnUso(pistas, 0, 0)?.ident, "18");
  assert.equal(pistaEnUso(pistas, 360, 4)?.ident, "18");
  assert.equal(pistaEnUso(pistas, "VRB", 3)?.ident, "18");
  assert.equal(pistaEnUso(pistas, 40, 10)?.ident, "04");
  assert.equal(pistaEnUso([], 40, 10), null);
  const a = armarAtisMx({ ...metar, rawOb: metar.rawOb.replace("12004KT", "00000KT"), wdir: 0, wspd: 0 }, ap);
  assert.equal(parte(a, "viento")?.texto, "Viento en calma.");
  assert.equal(parte(a, "viento", "en")?.texto, "Wind calm.");
  const v = armarAtisMx({ ...metar, wdir: "VRB", wspd: 3 }, ap);
  assert.equal(parte(v, "viento")?.texto, "Viento, variable, tres nudos.");
});

test("ráfagas y dirección variable", () => {
  const a = armarAtisMx({ ...metar, rawOb: metar.rawOb.replace("12004KT", "27015G25KT 240V300"), wdir: 270, wspd: 15, wgst: 25 }, ap);
  assert.equal(parte(a, "viento")?.texto,
    "Viento, dos siete cero grados, uno cinco nudos, ráfagas de dos cinco nudos. Variando entre dos cuatro cero y tres cero cero.");
  assert.deepEqual(claves(parte(a, "viento")), [
    "f-viento", "d-2-sigue", "d-7-sigue", "d-0-cierra", "f-grados", "d-1-sigue", "d-5-cierra", "f-nudos",
    "f-rafagas", "d-2-sigue", "d-5-cierra", "f-nudos",
    "f-variando", "d-2-sigue", "d-4-sigue", "d-0-cierra", "f-y", "d-3-sigue", "d-0-sigue", "d-0-cierra",
  ]);
  assert.equal(parte(a, "viento", "en")?.texto,
    "Wind, two seven zero degrees, one five knots, gusts two five knots. Variable between two four zero and three zero zero.");
});

test("tiempo conocido y desconocido", () => {
  const a = armarAtisMx({ ...metar, wxString: "-RA +TSRA FZFG" }, ap);
  const t = a.partes.filter((p) => p.idioma === "es" && p.tipo === "tiempo");
  assert.deepEqual(t.map((p) => [p.texto, p.soloTexto ?? false, p.piezas.length]),
    [["Lluvia ligera.", false, 1], ["+TSRA", true, 0], ["FZFG", true, 0]]);
  for (const tipo of ["aeropuerto", "letra", "hora", "pista", "viento", "visibilidad", "nubes", "temperatura", "altimetro", "cierre"] as const) {
    assert.ok(parte(a, tipo), tipo);
  }
});

test("RMK fuera de la lista: una sola parte soloTexto", () => {
  const a = armarAtisMx({ ...metar, rawOb: metar.rawOb.replace("8/078 ISOL SC", "8/078 CB SE") }, ap);
  const obs = a.partes.filter((p) => p.idioma === "es" && p.tipo === "observaciones");
  assert.deepEqual(obs.map((p) => [p.texto, p.soloTexto, p.piezas.length]), [["8/078 CB SE", true, 0]]);
});

test("altímetro Q, rocío negativo, nubes bajas y visibilidad 10+", () => {
  const a = armarAtisMx({
    ...metar,
    rawOb: metar.rawOb.replace("A3014", "Q1013").replace("25/09", "25/M05"),
    clouds: [{ cover: "FEW", base: 800 }, { cover: "SCT", base: 2500 }],
    visib: "10+",
  }, ap);
  assert.equal(parte(a, "altimetro")?.texto, "QNH, uno cero uno tres.");
  assert.equal(parte(a, "temperatura")?.texto, "Temperatura, dos cinco. Punto de rocío, menos cero cinco.");
  const nubes = a.partes.filter((p) => p.tipo === "nubes");
  assert.deepEqual(nubes.map((p) => p.texto), [
    "Nubes escasas a ochocientos pies.", "Dispersas a dos mil quinientos pies.",
    "Few clouds at eight hundred.", "Scattered, two thousand five hundred.",
  ]);
  assert.equal(parte(a, "visibilidad")?.texto, "Visibilidad, uno cero millas o más.");
  assert.deepEqual(claves(parte(a, "visibilidad")), ["f-visibilidad", "d-1-sigue", "d-0-cierra", "f-o-mas"]);
});

test("cielo despejado y visibilidad en fracción", () => {
  const a = armarAtisMx({ ...metar, clouds: [], visib: 0.5 }, ap);
  assert.equal(parte(a, "nubes")?.texto, "Cielo despejado.");
  assert.equal(parte(a, "visibilidad", "en")?.texto, "Visibility, one half mile.");
});

test("visibilidad en texto con fracción: igual que el número", () => {
  const vis = (visib: Metar["visib"]) => parte(armarAtisMx({ ...metar, visib }, ap), "visibilidad");
  assert.deepEqual(vis("1/2"), vis(0.5));
  assert.equal(vis("1/2")?.texto, "Visibilidad, media milla.");
  assert.equal(vis("3/4")?.texto, "Visibilidad, tres cuartos de milla.");
  assert.deepEqual([vis("1 1/2")?.texto, vis("1 1/2")?.soloTexto], ["1 1/2 SM", true]);
});

test("una milla, en singular", () => {
  const a = armarAtisMx({ ...metar, visib: 1 }, ap);
  assert.equal(parte(a, "visibilidad")?.texto, "Visibilidad, una milla.");
  assert.equal(parte(a, "visibilidad", "en")?.texto, "Visibility, one mile.");
  assert.deepEqual(claves(parte(a, "visibilidad")), ["f-visibilidad", "f-milla"]);
  assert.deepEqual(parte(armarAtisMx({ ...metar, visib: "1" }, ap), "visibilidad"), parte(a, "visibilidad"));
  assert.ok(todasLasPiezas([ap]).some((p) => p.idioma === "en" && p.clave === "f-milla"));
});

test("letraDe: misma hora, misma letra; Z vuelve a A", () => {
  assert.equal(letraDe(obsD), "D");
  assert.equal(letraDe(obsD + 59 * 60), "D");
  assert.equal(letraDe(obsD + 3600), "E");
  const z = obsD + 22 * 3600;
  assert.equal(letraDe(z), "Z");
  assert.equal(letraDe(z + 3600), "A");
});

test("todas las piezas usadas están en el banco, sin duplicados", () => {
  const banco = todasLasPiezas([ap]);
  const llaves = banco.map((p) => `${p.idioma}/${p.clave}`);
  assert.equal(new Set(llaves).size, llaves.length);
  const casos: Metar[] = [
    metar,
    { ...metar, rawOb: metar.rawOb.replace("12004KT", "27015G25KT 240V300").replace("A3014", "Q1013").replace("25/09", "M02/M05"), wdir: 270, wspd: 15, wgst: 25 },
    { ...metar, wdir: 0, wspd: 0, wxString: "-RA BR VCTS", visib: 0.75, clouds: [{ cover: "VV", base: 300 }] },
    { ...metar, wdir: "VRB", wspd: 3, clouds: [{ cover: "OVC", base: 1500, type: "CB" }, { cover: "OVC", base: 4000 }] },
  ];
  for (const m of casos) {
    for (const p of armarAtisMx(m, mmgl).partes.flatMap((x) => x.piezas)) {
      assert.ok(llaves.includes(`${p.idioma}/${p.clave}`), `${p.idioma}/${p.clave}`);
    }
  }
});

test("OVC se dice «Cielo cubierto a», sin «Nubes» delante", () => {
  const a = armarAtisMx({ ...metar, clouds: [{ cover: "OVC", base: 2000 }] }, ap);
  const nubes = a.partes.filter((p) => p.tipo === "nubes").map((p) => p.texto);
  assert.deepEqual(nubes, ["Cielo cubierto a dos mil pies.", "Overcast at two thousand."]);
});

test("con controlador: sin letra ni pista, y cierra pidiendo confirmar con el controlador", () => {
  const a = armarAtisMx(metar, ap, { conControlador: true });
  assert.equal(a.conControlador, true);
  assert.ok(!a.partes.some((p) => p.tipo === "letra" || p.tipo === "pista"));
  const cierre = a.partes.filter((p) => p.tipo === "cierre").map((p) => p.texto);
  assert.deepEqual(cierre, ["Confirme pista y QNH con el controlador.", "Confirm runway and QNH with the controller."]);
});

test("sin opciones: conControlador es false", () => {
  assert.equal(armarAtisMx(metar, ap).conControlador, false);
});
