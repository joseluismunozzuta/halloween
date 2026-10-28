import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * La sala de espera de la trivia: quiénes están dentro antes de que empiece.
 *
 * Existe porque sin ella el juego no sabe que alguien existe hasta que ya
 * respondió una pregunta —el documento de puntaje nace al calificar—, y de ahí
 * salían dos problemas: la televisión no podía mostrar quién estaba listo, y el
 * cierre automático de la pregunta no tenía contra qué comparar en la primera
 * ronda.
 *
 * Es el mismo patrón que `fichasListas` en las mentiras: un documento por
 * persona cuyo valor casi no importa, porque lo que informa es que exista.
 * Acá sí lleva nombre y foto, para que la TV pueda dibujar la lista sin tener
 * que cruzarla con otra colección.
 */
export type Inscrito = {
  uid: string;
  name: string;
  photoURL: string | null;
  entroEn: Timestamp | null;
};

function aInscrito(uid: string, data: Record<string, unknown>): Inscrito {
  return {
    uid,
    name: (data.name as string) ?? "Testigo",
    photoURL: (data.photoURL as string | null) ?? null,
    entroEn: (data.entroEn as Timestamp | null) ?? null,
  };
}

/**
 * Lectura pública: la televisión muestra la sala y no tiene sesión de nadie.
 * Es la misma decisión que ya tomaron los puntajes, y no revela nada que la TV
 * no vaya a enseñar de todas formas.
 */
export function suscribirSala(
  callback: (sala: Inscrito[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "triviaSala"),
    (snap) =>
      callback(
        snap.docs
          .map((d) => aInscrito(d.id, d.data()))
          // Por orden de llegada: los que no tienen marca de tiempo todavía
          // —el servidor aún no la resolvió— van al final.
          .sort((a, b) => (a.entroEn?.toMillis() ?? Infinity) - (b.entroEn?.toMillis() ?? Infinity))
      ),
    (err) => onError?.(err)
  );
}

/** El id del documento es el uid, así que entrar dos veces no duplica a nadie. */
export async function entrarALaSala() {
  const user = auth.currentUser;
  if (!user) throw new Error("not-authenticated");
  await setDoc(doc(db, "triviaSala", user.uid), {
    name: user.displayName || user.email || "Testigo",
    photoURL: user.photoURL ?? null,
    entroEn: serverTimestamp(),
  });
}

/**
 * Saca a alguien de la sala. Lo usa el anfitrión cuando a una persona se le
 * muere el celular a mitad de ronda y el cierre automático se queda esperando
 * una respuesta que no va a llegar.
 *
 * Si ese celular sigue vivo, la propia sala de espera lo vuelve a meter: el
 * jugador se marca de nuevo en cuanto nota que no está en la lista. Para el
 * caso en que el anfitrión quiera imponer un número a pesar de eso está el
 * ajuste manual de la cabina, que le gana a todo.
 */
export async function sacarDeLaSala(uid: string) {
  await deleteDoc(doc(db, "triviaSala", uid));
}

/** Vaciar la sala entera. Para dejar limpio entre la prueba y la función. */
export async function vaciarSala() {
  const snap = await getDocs(collection(db, "triviaSala"));
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
