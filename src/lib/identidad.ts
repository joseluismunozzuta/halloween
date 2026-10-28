/**
 * Quién es quién.
 *
 * El problema: todos entran con Google, pero Google solo da un correo y un
 * nombre de cuenta — no sabe que Mar y Jose son pareja, ni que "Caro" en el
 * grupo es la "Caroline Pérez" de su Gmail.
 *
 * La solución elegida: **te eliges a ti mismo la primera vez que entras**.
 * Ves las tres parejas con sus seis nombres y tocas el tuyo. Eso ata tu cuenta
 * de Google a esa persona para siempre, y como las parejas están acá en el
 * código, en cuanto eliges "Mar" la app ya sabe que tu pareja es Jose.
 *
 * Por qué no las otras dos opciones:
 * - *Escribir los seis correos acá*: cero fricción, pero hay que tenerlos
 *   todos, y si alguien entra con su cuenta del trabajo en vez de la personal
 *   se rompe en silencio. Queda como ATAJO opcional más abajo: si tu correo
 *   está en la lista, te saltas la pantalla.
 * - *Que el anfitrión asigne desde el panel*: obliga a que todos entren
 *   primero y a que JL haga trabajo manual el día del evento.
 *
 * Reglas de seguridad al conectar Firestore: la elección va en una transacción
 * y un nombre ya tomado desaparece de la lista, así dos personas no pueden
 * quedarse con la misma identidad. El anfitrión puede liberar un nombre desde
 * el panel si alguien se equivoca.
 */

export type PersonaId = "jose" | "mar" | "caroline" | "marcelo" | "alexandra" | "victor";
export type ParejaId = "p1" | "p2" | "p3";

export type Pareja = {
  id: ParejaId;
  /** Como se les nombra en el grupo. */
  nombre: string;
  integrantes: readonly [PersonaId, PersonaId];
};

export const PAREJAS: readonly Pareja[] = [
  { id: "p1", nombre: "Jose y Mar", integrantes: ["jose", "mar"] },
  { id: "p2", nombre: "Caroline y Marcelo", integrantes: ["caroline", "marcelo"] },
  { id: "p3", nombre: "Alexandra y Victor", integrantes: ["alexandra", "victor"] },
] as const;

export const NOMBRES: Record<PersonaId, string> = {
  jose: "Jose",
  mar: "Mar",
  caroline: "Caroline",
  marcelo: "Marcelo",
  alexandra: "Alexandra",
  victor: "Victor",
};

/** Atajo opcional: un correo acá se salta la pantalla de "¿quién eres?". */
export const CORREOS_CONOCIDOS: Partial<Record<string, PersonaId>> = {
  "joseluismunozzuta@gmail.com": "jose",
};

export function parejaDe(persona: PersonaId): Pareja {
  const encontrada = PAREJAS.find((p) => p.integrantes.includes(persona));
  if (!encontrada) throw new Error(`persona sin pareja: ${persona}`);
  return encontrada;
}

export function parejaDe_otro(persona: PersonaId): PersonaId {
  const [a, b] = parejaDe(persona).integrantes;
  return a === persona ? b : a;
}

export const TODAS_LAS_PERSONAS: readonly PersonaId[] = PAREJAS.flatMap(
  (p) => p.integrantes
);
