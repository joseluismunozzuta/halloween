import { collection, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { PersonaId } from "./identidad";

export type Ficha = {
  autor: PersonaId;
  frases: [string, string, string];
};

function aFicha(id: string, data: Record<string, unknown>): Ficha {
  const frases = (data.frases as string[]) ?? [];
  return {
    autor: id as PersonaId,
    frases: [frases[0] ?? "", frases[1] ?? "", frases[2] ?? ""],
  };
}

/**
 * Las fichas solo son legibles por su dueño hasta que el anfitrión abre la
 * dinámica; ahí pasan a ser públicas porque van en la pantalla. La suscripción
 * devolverá únicamente lo que las reglas permitan ver en cada momento, así que
 * antes del evento cada quien ve solo la suya.
 */
export function suscribirFichas(
  callback: (fichas: Ficha[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "fichas"),
    (snap) => callback(snap.docs.map((d) => aFicha(d.id, d.data()))),
    (err) => onError?.(err)
  );
}

/**
 * Guarda las tres frases y, aparte, cuál es la mentira.
 *
 * La clave va en `fichaClaves`, una colección que su dueño puede escribir pero
 * solo el anfitrión puede leer — el mismo aislamiento que usa la trivia para
 * las respuestas correctas. Si viviera dentro de la ficha, cualquiera que
 * pudiera leer las frases durante la ronda vería también la respuesta.
 */
export async function guardarFicha(
  persona: PersonaId,
  frases: [string, string, string],
  indiceMentira: number
) {
  if (!auth.currentUser) throw new Error("sin-sesion");
  await Promise.all([
    setDoc(doc(db, "fichas", persona), {
      frases: frases.map((f) => f.trim()),
      actualizadoEn: serverTimestamp(),
    }),
    setDoc(doc(db, "fichaClaves", persona), { indiceMentira }),
    // Marcador vacío y público: solo dice que ya la dejaste.
    setDoc(doc(db, "fichasListas", persona), {}),
  ]);
}

/** Quiénes ya dejaron sus frases. No revela ninguna. */
export function suscribirFichasListas(
  callback: (personas: PersonaId[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "fichasListas"),
    (snap) => callback(snap.docs.map((d) => d.id as PersonaId)),
    (err) => onError?.(err)
  );
}

/** Un voto por ronda y por votante; no se puede votar la propia ficha. */
export async function votarMentira(ronda: PersonaId, indice: number) {
  const user = auth.currentUser;
  if (!user) throw new Error("sin-sesion");
  await setDoc(doc(db, "mentiraVotos", `${ronda}_${user.uid}`), { ronda, indice });
}
