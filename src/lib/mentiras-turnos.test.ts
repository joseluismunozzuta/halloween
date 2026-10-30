import assert from "node:assert/strict";
import test from "node:test";
import { siguienteTurno } from "./mentiras-turnos";
import type { PersonaId } from "./identidad";

/**
 * Pruebas del orden de turnos de las mentiras. Corren con `npm test`.
 */

const ORDEN = ["jose", "mar", "caroline", "marcelo", "alexandra", "victor"] as PersonaId[];
const TODOS = ORDEN;

const base = {
  orden: ORDEN,
  conFrases: TODOS,
  cerradas: [] as PersonaId[],
  actual: null as PersonaId | null,
};

test("sin empezar, le toca al primero de la mesa", () => {
  assert.equal(siguienteTurno(base), "jose");
});

test("avanza al siguiente de la mesa", () => {
  assert.equal(siguienteTurno({ ...base, actual: "jose" }), "mar");
});

test("salta a quien no dejo sus frases", () => {
  const conFrases = TODOS.filter((p) => p !== "mar");
  assert.equal(siguienteTurno({ ...base, conFrases, actual: "jose" }), "caroline");
});

test("salta a quien ya paso", () => {
  assert.equal(
    siguienteTurno({ ...base, cerradas: ["mar", "caroline"], actual: "jose" }),
    "marcelo"
  );
});

test("da la vuelta para recoger a quien se salto el anfitrion", () => {
  // Empezo por el tercero y se revelaron los tres ultimos: faltan los dos
  // primeros, que estan ANTES en el orden.
  assert.equal(
    siguienteTurno({
      ...base,
      cerradas: ["caroline", "marcelo", "alexandra"],
      actual: "victor",
    }),
    "jose"
  );
});

test("no repite al que esta en pantalla aunque no se haya revelado", () => {
  assert.equal(
    siguienteTurno({
      ...base,
      conFrases: ["jose", "mar"] as PersonaId[],
      cerradas: ["mar"],
      actual: "jose",
    }),
    null
  );
});

test("cuando ya pasaron todos, no hay siguiente", () => {
  assert.equal(siguienteTurno({ ...base, cerradas: TODOS, actual: "victor" }), null);
});

test("si nadie dejo frases, no hay a quien poner", () => {
  assert.equal(siguienteTurno({ ...base, conFrases: [] }), null);
});
