import { test } from "node:test";
import assert from "node:assert/strict";
import { alrededor, anillos, limitesMosaico, metrosTerrarium, mosaicoDe, urlMosaico } from "./mosaicos.ts";

test("mosaicoDe con Web Mercator: GDL a zoom 10", () => {
  assert.deepEqual(mosaicoDe(20.52, -103.31, 10), { z: 10, x: 218, y: 452 });
});

test("limitesMosaico es el inverso de mosaicoDe", () => {
  const l = limitesMosaico({ z: 10, x: 218, y: 452 });
  assert.ok(l.oeste <= -103.31 && -103.31 < l.este);
  assert.ok(l.sur <= 20.52 && 20.52 < l.norte);
});

test("metrosTerrarium decodifica rojo, verde y azul", () => {
  assert.equal(metrosTerrarium(128, 0, 0), 0);
  assert.equal(metrosTerrarium(129, 100, 128), 356.5);
});

test("alrededor envuelve la longitud en el antimeridiano", () => {
  const ms = alrededor(0, 179.99, 4, 1);
  assert.equal(ms.length, 9);
  assert.ok(ms.some((m) => m.x === 0));
  assert.ok(ms.every((m) => m.x >= 0 && m.x < 16));
});

test("urlMosaico apunta a los mosaicos Terrarium de AWS", () => {
  assert.equal(urlMosaico({ z: 10, x: 224, y: 453 }), "https://elevation-tiles-prod.s3.amazonaws.com/terrarium/10/224/453.png");
});

test("anillos por calidad", () => {
  assert.deepEqual(anillos("baja"), [{ z: 11, radio: 1, segmentos: 32 }, { z: 8, radio: 1, segmentos: 16 }]);
  assert.equal(anillos("alta")[0].segmentos, 64);
});
