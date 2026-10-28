import { collection, doc, getDocs, onSnapshot, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { TODAS_LAS_PERSONAS, type PersonaId } from "./identidad";

/** De dónde salen los puntos. Una clave por dinámica. */
export type Fuente = "trivia" | "disfraces" | "supervivencia" | "mentiras" | "misiones";

export const FUENTES: readonly Fuente[] = [
  "trivia",
  "disfraces",
  "supervivencia",
  "mentiras",
  "misiones",
];

export type Alma = {
  persona: PersonaId;
  total: number;
  desglose: Partial<Record<Fuente, number>>;
};

/**
 * Cuánto puede aportar cada dinámica, como máximo.
 *
 * El diseño pedía una sola cosa: que la trivia no decida sola el resultado.
 * Por eso la trivia NO vuelca sus puntos crudos —que llegan a decenas de
 * miles— sino la posición final convertida a esta escala. Así ganar la trivia
 * pesa igual que ganar el concurso de disfraces, y la noche se decide por el
 * conjunto.
 */
export const TOPES: Record<Fuente, number> = {
  trivia: 1000,
  disfraces: 1200, // tres categorías de 400
  supervivencia: 600,
  mentiras: 900,
  misiones: 500,
};

/** Puntos de la trivia según el puesto final, no según los puntos crudos. */
export const PUNTOS_POR_PUESTO = [1000, 800, 600, 400, 300, 200];

export const PUNTOS = {
  /** Por cada categoría de disfraces ganada (la gana la pareja entera). */
  categoriaDisfraz: 400,
  /** Ganador del plan de supervivencia. */
  mejorPlan: 600,
  /** Por cada voto recibido en supervivencia, si no ganaste. */
  votoPlan: 100,
  /** Por adivinar la mentira de otro. */
  mentiraAcertada: 200,
  /** Por cada persona que NO adivinó la tuya. */
  mentiraNoDescubierta: 150,
  /** Si el grupo confirma que cumpliste tu misión. */
  misionCumplida: 500,
} as const;

function aAlma(id: string, data: Record<string, unknown>): Alma {
  const desglose = (data.desglose as Partial<Record<Fuente, number>>) ?? {};
  return {
    persona: id as PersonaId,
    total: (data.total as number) ?? 0,
    desglose,
  };
}

export function suscribirAlmas(
  callback: (almas: Alma[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "almas"),
    (snap) => callback(snap.docs.map((d) => aAlma(d.id, d.data()))),
    (err) => onError?.(err)
  );
}

/**
 * Escribe los puntos de UNA dinámica para varias personas de una vez.
 *
 * Es idempotente por construcción: cada dinámica ocupa su propia clave dentro
 * de `desglose`, así que volver a calificar la misma dinámica sobrescribe el
 * mismo valor en vez de sumarlo otra vez. No hace falta llevar una lista de
 * "ya calificadas" como en la trivia — si se corta la señal a mitad, se vuelve
 * a pulsar y queda igual.
 */
export async function volcarFuente(
  fuente: Fuente,
  puntosPorPersona: Partial<Record<PersonaId, number>>
) {
  const previas = await getDocs(collection(db, "almas"));
  const mapa = new Map(previas.docs.map((d) => [d.id, aAlma(d.id, d.data())]));

  const batch = writeBatch(db);
  for (const persona of TODAS_LAS_PERSONAS) {
    const previa = mapa.get(persona);
    const desglose = { ...(previa?.desglose ?? {}), [fuente]: puntosPorPersona[persona] ?? 0 };
    const total = FUENTES.reduce((suma, f) => suma + (desglose[f] ?? 0), 0);
    batch.set(doc(db, "almas", persona), { desglose, total });
  }
  await batch.commit();
}

/** Borra el marcador entero. Para dejar limpio tras una partida de prueba. */
export async function reiniciarAlmas() {
  const previas = await getDocs(collection(db, "almas"));
  const batch = writeBatch(db);
  previas.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
