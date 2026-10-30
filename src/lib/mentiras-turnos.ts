import type { PersonaId } from "./identidad";

/**
 * A quién le toca ahora en las mentiras.
 *
 * Vive aparte y sin dependencias por el mismo motivo que la regla de cierre de
 * la trivia: es la clase de lógica que solo se rompe en vivo, a las doce de la
 * noche, con seis personas mirando. Ver mentiras-turnos.test.ts.
 *
 * Salta a quien no dejó sus frases —no hay nada que leer en la pantalla— y a
 * quien ya pasó. Sigue el orden de `orden`, dando la vuelta si hace falta,
 * porque el anfitrión puede saltar a alguien a mano y volver después.
 */
export function siguienteTurno(estado: {
  /** El orden de la mesa. */
  orden: readonly PersonaId[];
  /** Quiénes dejaron sus tres frases. */
  conFrases: readonly PersonaId[];
  /** Rondas ya reveladas. */
  cerradas: readonly PersonaId[];
  /** Quién está en pantalla ahora, o null si no ha empezado. */
  actual: PersonaId | null;
}): PersonaId | null {
  const { orden, conFrases, cerradas, actual } = estado;

  const disponible = (p: PersonaId) =>
    conFrases.includes(p) && !cerradas.includes(p) && p !== actual;

  const desde = actual ? orden.indexOf(actual) + 1 : 0;

  // Una vuelta completa desde el siguiente al actual. El módulo es lo que deja
  // volver sobre alguien que se saltó al principio de la noche.
  for (let i = 0; i < orden.length; i++) {
    const persona = orden[(desde + i) % orden.length];
    if (disponible(persona)) return persona;
  }

  return null;
}
