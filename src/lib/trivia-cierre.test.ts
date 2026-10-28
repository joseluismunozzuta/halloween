import assert from "node:assert/strict";
import test from "node:test";
import { debeCerrarPregunta } from "./trivia-cierre";

/**
 * Pruebas de la regla de cierre automático de la pregunta.
 *
 * No hay runner ni dependencias de prueba en el proyecto; esto corre con el
 * runner que ya trae Node:
 *
 *   npm test
 */

const abierta = {
  status: "question" as const,
  questionId: "t01",
  respondieron: 6,
  esperados: 6,
  yaCerrada: null,
  ocupado: false,
};

test("cierra cuando respondieron todos los esperados", () => {
  assert.equal(debeCerrarPregunta(abierta), true);
});

test("no cierra si falta alguien", () => {
  assert.equal(debeCerrarPregunta({ ...abierta, respondieron: 5 }), false);
});

test("cierra si llegan mas respuestas que esperados (alguien entro a mitad)", () => {
  assert.equal(debeCerrarPregunta({ ...abierta, respondieron: 7 }), true);
});

test("NO cierra en la primera pregunta, cuando no se sabe cuantos juegan", () => {
  // El caso que importa: con esperados en cero, `respondieron >= esperados`
  // seria cierto con cero respuestas y la pregunta se cerraria al abrirla.
  assert.equal(
    debeCerrarPregunta({ ...abierta, respondieron: 0, esperados: 0 }),
    false
  );
});

test("no cierra una pregunta que ya se cerro sola", () => {
  assert.equal(debeCerrarPregunta({ ...abierta, yaCerrada: "t01" }), false);
});

test("si la que ya se cerro es otra, esta si cierra", () => {
  assert.equal(debeCerrarPregunta({ ...abierta, yaCerrada: "t00" }), true);
});

test("no cierra mientras hay otra operacion en curso", () => {
  assert.equal(debeCerrarPregunta({ ...abierta, ocupado: true }), false);
});

test("no cierra si la pregunta no esta abierta", () => {
  for (const status of ["idle", "results", "finished"] as const) {
    assert.equal(debeCerrarPregunta({ ...abierta, status }), false, status);
  }
});

test("no cierra si no hay pregunta activa", () => {
  assert.equal(debeCerrarPregunta({ ...abierta, questionId: null }), false);
});
