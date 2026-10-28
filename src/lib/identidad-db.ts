import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { CORREOS_CONOCIDOS, parejaDe, type ParejaId, type PersonaId } from "./identidad";

export type Identidad = {
  uid: string;
  persona: PersonaId;
  /** Copia derivada: las reglas de Firestore no pueden leer el código. */
  parejaId: ParejaId;
  nombre: string;
  photoURL: string | null;
};

function aIdentidad(uid: string, data: Record<string, unknown>): Identidad {
  return {
    uid,
    persona: data.persona as PersonaId,
    parejaId: data.parejaId as ParejaId,
    nombre: (data.nombre as string) ?? "",
    photoURL: (data.photoURL as string | null) ?? null,
  };
}

/**
 * Lectura pública: el sitio necesita mostrar nombres reales en el marcador y
 * saber qué nombres quedan libres en /soy.
 */
export function suscribirIdentidades(
  callback: (lista: Identidad[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "identidades"),
    (snap) => callback(snap.docs.map((d) => aIdentidad(d.id, d.data()))),
    (err) => onError?.(err)
  );
}

/**
 * Reclama una identidad para la cuenta actual.
 *
 * Va en transacción porque dos personas pueden tocar el mismo nombre al mismo
 * tiempo: la transacción lee todas las identidades y aborta si alguien ya se
 * quedó con esa. El documento se indexa por uid —no por persona— para que las
 * reglas puedan comprobar que escribes el tuyo.
 */
export async function reclamarIdentidad(persona: PersonaId): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("sin-sesion");

  await runTransaction(db, async (tx) => {
    const mio = doc(db, "identidades", user.uid);
    const previo = await tx.get(mio);
    if (previo.exists()) throw new Error("ya-elegiste");

    // No se puede consultar una colección dentro de una transacción, así que
    // el candado real es el documento espejo: su id ES el nombre.
    const candado = doc(db, "identidadesTomadas", persona);
    if ((await tx.get(candado)).exists()) throw new Error("nombre-tomado");

    tx.set(candado, { uid: user.uid });
    tx.set(mio, {
      persona,
      // Las reglas de Firestore no pueden importar PAREJAS del código, así que
      // la pareja se guarda junto a la persona para poder comprobarla allí.
      parejaId: parejaDe(persona).id,
      nombre: user.displayName || user.email || "",
      photoURL: user.photoURL ?? null,
      creadoEn: serverTimestamp(),
    });
  });
}

/** Solo el anfitrión, cuando alguien se equivocó al elegir. */
export async function liberarIdentidad(uid: string, persona: PersonaId) {
  await Promise.all([
    deleteDoc(doc(db, "identidades", uid)),
    deleteDoc(doc(db, "identidadesTomadas", persona)),
  ]);
}

/** Atajo: si el correo está en la lista, no hace falta preguntar nada. */
export function personaPorCorreo(email: string | null | undefined): PersonaId | null {
  if (!email) return null;
  return CORREOS_CONOCIDOS[email.toLowerCase()] ?? null;
}
