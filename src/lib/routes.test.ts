import { test } from "node:test";
import assert from "node:assert/strict";
import { esNuevo, NAV_LINKS } from "./routes.ts";

test("la pestaña Instructor va después de Aprende en la barra", () => {
  const barra = NAV_LINKS.filter((l) => !("soloMenus" in l)).map((l) => l.label);
  assert.equal(barra[barra.indexOf("Aprende") + 1], "Instructor");
});

test("«Nuevo» sale el 31 de diciembre y se quita sola el 1 de enero", () => {
  const instructor = NAV_LINKS.find((l) => l.label === "Instructor")!;
  assert.equal(esNuevo(instructor, Date.parse("2026-12-31T23:00:00-06:00")), true);
  assert.equal(esNuevo(instructor, Date.parse("2027-01-01T12:00:00-06:00")), false);
  assert.equal(esNuevo(NAV_LINKS[0]), false);
});
