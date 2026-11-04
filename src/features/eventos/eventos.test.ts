import assert from "node:assert/strict";
import { test } from "node:test";
import { desdeIvao, desdeVatsim, esHispano, filtrar } from "./eventos.ts";

test("IVAO: aeropuertos pegados o como texto de lista se separan", () => {
  const [a, b] = desdeIvao([
    { id: 1, title: " Swiss ", startDate: "2026-11-04T18:00:00Z", endDate: "2026-11-04T20:00:00Z", airports: "['LSGGLSGS']", infoUrl: "" },
    { id: 2, title: "Guayaquil", startDate: "2026-11-20T20:00:00Z", endDate: "2026-11-20T23:00:00Z", airports: ["SEGU", "MSLP", ""], imageUrl: "http://x" },
  ]);
  assert.deepEqual(a.aeropuertos, ["LSGG", "LSGS"]);
  assert.equal(a.titulo, "Swiss");
  assert.equal(a.enlace, "https://www.ivao.aero/events");
  assert.deepEqual(b.aeropuertos, ["SEGU", "MSLP"]);
  assert.equal(b.imagen, null);
});

test("VATSIM: sin exámenes de controlador", () => {
  const ev = desdeVatsim({
    data: [
      { id: 1, type: "Controller Examination", name: "Exam", start_time: "", end_time: "", airports: [{ icao: "MMMX" }] },
      { id: 2, type: "Event", name: "Visit Mexico", start_time: "2026-11-06T01:30:00Z", end_time: "2026-11-06T04:30:00Z", airports: [{ icao: "MMMX" }], link: "https://my.vatsim.net/events/x" },
    ],
  });
  assert.equal(ev.length, 1);
  assert.equal(ev[0].red, "VATSIM");
  assert.deepEqual(ev[0].aeropuertos, ["MMMX"]);
});

test("hispanos: México, Sudamérica y España sí; Brasil y Suiza no", () => {
  for (const s of ["MMGL", "SKBO", "SAEZ", "LEMD", "GCLP", "TJSJ", "MSLP"]) assert.ok(esHispano(s), s);
  for (const n of ["SBGR", "LSGG", "KSAT", "ORSJ"]) assert.ok(!esHispano(n), n);
});

test("filtrar: quita los terminados y los no hispanos, y ordena por fecha", () => {
  const base = { red: "IVAO" as const, enlace: "", imagen: null };
  const ahora = Date.parse("2026-11-10T00:00:00Z");
  const r = filtrar(
    [
      { ...base, id: "a", titulo: "Tarde", inicio: "2026-11-20T20:00:00Z", fin: "2026-11-20T23:00:00Z", aeropuertos: ["SEGU"] },
      { ...base, id: "b", titulo: "Ya pasó", inicio: "2026-11-01T20:00:00Z", fin: "2026-11-01T23:00:00Z", aeropuertos: ["MMMX"] },
      { ...base, id: "c", titulo: "Suiza", inicio: "2026-11-12T20:00:00Z", fin: "2026-11-12T23:00:00Z", aeropuertos: ["LSGG"] },
      { ...base, id: "d", titulo: "Pronto", inicio: "2026-11-12T20:00:00Z", fin: "2026-11-12T23:00:00Z", aeropuertos: ["KSAT", "MMMY"] },
    ],
    ahora,
  );
  assert.deepEqual(r.map((e) => e.id), ["d", "a"]);
});
