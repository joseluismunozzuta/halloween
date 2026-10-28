import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import type { PersonaId } from "./identidad";

export type Plato = {
  id: string;
  titulo: string;
  tipo: "cocinar" | "traer";
  propuestoPor: PersonaId;
  asignadoA: PersonaId | null;
};

export type VotoPlato = {
  id: string;
  platoId: string;
  uid: string;
  persona: PersonaId;
};

function aPlato(id: string, data: Record<string, unknown>): Plato {
  return {
    id,
    titulo: (data.titulo as string) ?? "",
    tipo: (data.tipo as Plato["tipo"]) ?? "cocinar",
    propuestoPor: data.propuestoPor as PersonaId,
    asignadoA: (data.asignadoA as PersonaId | null) ?? null,
  };
}

export function suscribirPlatos(
  callback: (platos: Plato[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "platos"),
    (snap) => callback(snap.docs.map((d) => aPlato(d.id, d.data()))),
    (err) => onError?.(err)
  );
}

/**
 * Los votos del menú son públicos a propósito: no hay nada que ocultar al
 * decidir qué se cocina, y contarlos en el cliente le ahorra al anfitrión el
 * paso de cerrar la votación.
 */
export function suscribirVotosMenu(
  callback: (votos: VotoPlato[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "platoVotos"),
    (snap) =>
      callback(
        snap.docs.map((d) => ({
          id: d.id,
          platoId: d.data().platoId as string,
          uid: d.data().uid as string,
          persona: d.data().persona as PersonaId,
        }))
      ),
    (err) => onError?.(err)
  );
}

export async function proponerPlato(
  titulo: string,
  tipo: Plato["tipo"],
  persona: PersonaId
) {
  await addDoc(collection(db, "platos"), {
    titulo: titulo.trim(),
    tipo,
    propuestoPor: persona,
    asignadoA: null,
    creadoEn: serverTimestamp(),
  });
}

/** Alterna tu voto. El id fijo garantiza uno por plato y por persona. */
export async function alternarVotoPlato(
  platoId: string,
  persona: PersonaId,
  yaVotado: boolean
) {
  const user = auth.currentUser;
  if (!user) throw new Error("sin-sesion");

  const ref = doc(db, "platoVotos", `${platoId}_${user.uid}`);
  if (yaVotado) {
    await deleteDoc(ref);
  } else {
    await setDoc(ref, { platoId, uid: user.uid, persona });
  }
}

/** Solo el anfitrión: reparte quién cocina o trae qué. */
export async function asignarPlato(platoId: string, persona: PersonaId | null) {
  await setDoc(doc(db, "platos", platoId), { asignadoA: persona }, { merge: true });
}

export async function borrarPlato(platoId: string) {
  await deleteDoc(doc(db, "platos", platoId));
}
