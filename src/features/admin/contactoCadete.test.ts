import { test } from "node:test";
import assert from "node:assert/strict";
import { diasDesde, enlaceGmail, etapaDeCadete, mensajeContacto, primerNombre } from "./contactoCadete.ts";

test("etapaDeCadete: cero actividades es sin empezar; el total es completo", () => {
  assert.equal(etapaDeCadete(0, 240), "sin-empezar");
  assert.equal(etapaDeCadete(1, 240), "en-progreso");
  assert.equal(etapaDeCadete(239, 240), "en-progreso");
  assert.equal(etapaDeCadete(240, 240), "completo");
});

// Con 240 actividades, 1 lección es 0.4%: por porcentaje redondearía a 0 y el
// cadete que ya arrancó saldría como "sin empezar".
test("etapaDeCadete: una sola lección ya cuenta como haber empezado", () => {
  assert.equal(Math.round((1 / 240) * 100), 0);
  assert.equal(etapaDeCadete(1, 240), "en-progreso");
});

test("diasDesde cuenta días completos y nunca sale negativo", () => {
  const ahora = new Date("2026-09-24T12:00:00Z");
  assert.equal(diasDesde("2026-09-24T08:00:00Z", ahora), 0);
  assert.equal(diasDesde("2026-09-21T12:00:00Z", ahora), 3);
  assert.equal(diasDesde("2026-09-30T12:00:00Z", ahora), 0);
});

test("primerNombre toma solo la primera palabra y tolera vacíos", () => {
  assert.equal(primerNombre("Erik Villanueva López"), "Erik");
  assert.equal(primerNombre("  Ana  "), "Ana");
  assert.equal(primerNombre(""), null);
  assert.equal(primerNombre(null), null);
});

test("mensajeContacto saluda por nombre y cae a un saludo neutro sin él", () => {
  assert.ok(mensajeContacto("Luis Pérez", "https://x.test/mi-formacion").cuerpo.startsWith("Hola Luis,"));
  assert.ok(mensajeContacto(null, "https://x.test/mi-formacion").cuerpo.startsWith("Hola,\n"));
});

test("mensajeContacto lleva el enlace a la formación", () => {
  const { cuerpo } = mensajeContacto("Luis", "https://x.test/mi-formacion");
  assert.ok(cuerpo.includes("https://x.test/mi-formacion"));
});

// El sitio dice que la primera sesión va incluida en Contenido Exclusivo; un
// borrador que la ofreciera gratis contradiría lo que el cadete ve publicado.
test("mensajeContacto no promete precios ni sesiones gratis", () => {
  const { asunto, cuerpo } = mensajeContacto("Luis", "https://x.test/mi-formacion");
  assert.doesNotMatch(`${asunto}\n${cuerpo}`, /gratis|sin costo|gratuit|\$|USD/i);
});

test("enlaceGmail codifica acentos, saltos de línea y símbolos sin perderlos", () => {
  const cuerpo = "Hola,\n¿Qué tal? Precio & más: ñ";
  const url = new URL(enlaceGmail("cadete@correo.com", "¿Te ayudo?", cuerpo));
  assert.equal(url.hostname, "mail.google.com");
  assert.equal(url.searchParams.get("to"), "cadete@correo.com");
  assert.equal(url.searchParams.get("su"), "¿Te ayudo?");
  assert.equal(url.searchParams.get("body"), cuerpo);
});
