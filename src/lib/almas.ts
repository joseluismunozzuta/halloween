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
  disfraces: 1200, // un 10 de promedio, a 120 el punto
  supervivencia: 600,
  // El máximo teórico, no lo esperable: cazar las cinco ajenas (5 × 200) y que
  // ninguno de los cinco descubra la tuya (5 × 150). Que las dos cosas pasen
  // juntas no va a ocurrir, pero el número es ese y conviene que no mienta.
  mentiras: 1750,
  misiones: 500,
};

/** Puntos de la trivia según el puesto final, no según los puntos crudos. */
export const PUNTOS_POR_PUESTO = [1000, 800, 600, 400, 300, 200];

export const PUNTOS = {
  /**
   * Cuánto vale cada punto del promedio del disfraz, para los dos de la
   * pareja. Con notas del 1 al 10, un 10 perfecto da 1200 y un 5 raso, 600:
   * la escala entera del concurso cabe dentro del tope de la fuente.
   */
  disfrazPorPunto: 120,
  /**
   * Cuánto vale cada punto del promedio del plan de supervivencia. Los otros
   * cinco hacen de jurado y ponen del 1 al 10; un 10 redondo da los 600 del
   * tope de la fuente.
   */
  planPorPunto: 60,
  /** Por dar con la frase verdadera de otro. */
  verdadAcertada: 200,
  /** Por cada voto que NO dio con la tuya. */
  verdadNoDescubierta: 150,
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
