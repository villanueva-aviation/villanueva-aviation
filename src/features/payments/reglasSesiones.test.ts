import { test } from "node:test";
import assert from "node:assert/strict";
import { esSesionCobrable, sesionIncluidaId, sesionesIncluidasPorCadete } from "./reglasSesiones.ts";

const cita = (over: Partial<ReturnType<typeof base>> = {}) => ({ ...base(), ...over });
function base() {
  return {
    id: "r1",
    user_id: "u1",
    tipo: "revision",
    tema: "Meteorología",
    estado: "confirmada",
    created_at: "2026-09-01T10:00:00Z",
  };
}

test("una cita pendiente todavía no se cobra", () => {
  assert.equal(esSesionCobrable(cita({ estado: "pendiente" })), false);
});

test("una cita confirmada o completada se cobra", () => {
  assert.equal(esSesionCobrable(cita()), true);
  assert.equal(esSesionCobrable(cita({ estado: "completada" })), true);
});

test("un proyecto final de Academia nunca se cobra", () => {
  assert.equal(esSesionCobrable(cita({ tema: "Proyecto final — Navegación" })), false);
});

test("la sesión incluida es la primera cobrable del cadete, no la más reciente", () => {
  const reservas = [
    cita({ id: "nueva", created_at: "2026-09-10T10:00:00Z" }),
    cita({ id: "primera", created_at: "2026-09-02T10:00:00Z" }),
    cita({ id: "proyecto", tema: "Proyecto final — VFR", created_at: "2026-08-01T10:00:00Z" }),
    cita({ id: "pendiente", estado: "pendiente", created_at: "2026-08-15T10:00:00Z" }),
  ];
  assert.equal(sesionIncluidaId(reservas), "primera");
});

test("sin citas cobrables no hay sesión incluida", () => {
  assert.equal(sesionIncluidaId([cita({ estado: "pendiente" })]), null);
});

test("cada cadete tiene su propia sesión incluida", () => {
  const reservas = [
    cita({ id: "a1", user_id: "a", created_at: "2026-09-01T10:00:00Z" }),
    cita({ id: "a2", user_id: "a", created_at: "2026-09-05T10:00:00Z" }),
    cita({ id: "b1", user_id: "b", created_at: "2026-09-03T10:00:00Z" }),
  ];
  assert.deepEqual([...sesionesIncluidasPorCadete(reservas)].sort(), ["a1", "b1"]);
});
