import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type Pelicula = {
  id: string;
  titulo: string;
  anio: number;
};

/**
 * Las candidatas viven en el código, no en Firestore: son cuatro, no cambian,
 * y así no hace falta un paso de siembra ni un panel para editarlas. En
 * Firestore solo van los votos.
 */
export const PELICULAS: Pelicula[] = [
  { id: "terrifier", titulo: "Terrifier", anio: 2016 },
  { id: "hereditary", titulo: "Hereditary", anio: 2018 },
  { id: "texas", titulo: "La Masacre de Texas", anio: 1974 },
  { id: "scream", titulo: "Scream", anio: 1996 },
];

export type VotoPelicula = { uid: string; peliculaId: string };

export function suscribirVotosPelicula(
  callback: (votos: VotoPelicula[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "peliculaVotos"),
    (snap) =>
      callback(snap.docs.map((d) => ({ uid: d.id, peliculaId: d.data().peliculaId as string }))),
    (err) => onError?.(err)
  );
}

/** Un voto por persona: el id del documento es el uid, así que reemplaza. */
export async function votarPelicula(peliculaId: string | null) {
  const user = auth.currentUser;
  if (!user) throw new Error("sin-sesion");
  const ref = doc(db, "peliculaVotos", user.uid);
  if (peliculaId === null) await deleteDoc(ref);
  else await setDoc(ref, { peliculaId });
}
