import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import type { PersonaId } from "./identidad";

/**
 * Banco de misiones secretas.
 *
 * Cosas que se cumplen sin que nadie note que las estabas intentando. Ni una
 * sola requiere salir de la casa ni incomodar a nadie: la gracia está en que
 * parezca casualidad.
 */
export const BANCO_MISIONES: { id: string; texto: string }[] = [
  { id: "m01", texto: "Logra que dos personas se cambien de asiento sin pedírselo." },
  { id: "m02", texto: "Haz que alguien diga «no puede ser» en voz alta." },
  { id: "m03", texto: "Consigue que alguien repita una frase tuya como si fuera suya." },
  { id: "m04", texto: "Que alguien te pregunte la hora." },
  { id: "m05", texto: "Haz que el grupo hable de un animal durante un minuto seguido." },
  { id: "m06", texto: "Consigue que alguien pruebe algo que dijo que no iba a probar." },
  { id: "m07", texto: "Que alguien se ría tanto que tenga que dejar el vaso." },
  { id: "m08", texto: "Haz que alguien busque algo en internet para darte la razón." },
  { id: "m09", texto: "Toma una foto del grupo sin que nadie pose." },
  { id: "m10", texto: "Consigue que alguien cambie la canción que está sonando." },
  { id: "m11", texto: "Que alguien cuente una historia que ya habías escuchado antes." },
  { id: "m12", texto: "Haz que dos personas se pongan de acuerdo en algo absurdo." },
];

export type Mision = { misionId: string; texto: string };

export type MisionAsignada = {
  persona: PersonaId;
  misionId: string;
  texto: string;
  cumplida: boolean;
};

export function suscribirMisiones(
  callback: (lista: MisionAsignada[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "misiones"),
    (snap) =>
      callback(
        snap.docs.map((d) => ({
          persona: d.id as PersonaId,
          misionId: (d.data().misionId as string) ?? "",
          texto: (d.data().texto as string) ?? "",
          cumplida: (d.data().cumplida as boolean) ?? false,
        }))
      ),
    (err) => onError?.(err)
  );
}

/**
 * Abre el sobre: toma una misión libre y la deja atada a ti.
 *
 * Va en transacción y marca la misión como tomada en el mismo paso, que es el
 * patrón que usaba el proyecto anterior para repartir preguntas sin repetir.
 * Si dos personas abren el sobre a la vez, una de las dos reintenta sola.
 */
export async function abrirMision(persona: PersonaId): Promise<MisionAsignada> {
  if (!auth.currentUser) throw new Error("sin-sesion");

  const mia = doc(db, "misiones", persona);

  // El banco se lee fuera de la transacción: dentro no se puede consultar una
  // colección. La carrera real la resuelve el documento de la misión elegida.
  const banco = await getDocs(collection(db, "bancoMisiones"));
  const libres = banco.docs.filter((d) => d.data().tomada !== true);
  if (libres.length === 0) throw new Error("banco-agotado");

  for (const candidata of barajar(libres.map((d) => d.id))) {
    try {
      return await runTransaction(db, async (tx) => {
        const yaTengo = await tx.get(mia);
        if (yaTengo.exists()) {
          const data = yaTengo.data();
          return {
            persona,
            misionId: data.misionId as string,
            texto: data.texto as string,
            cumplida: false,
          };
        }

        const ref = doc(db, "bancoMisiones", candidata);
        const snap = await tx.get(ref);
        if (!snap.exists() || snap.data().tomada === true) throw new Error("tomada");

        const texto = snap.data().texto as string;
        tx.update(ref, { tomada: true });
        tx.set(mia, { misionId: candidata, texto, abiertaEn: serverTimestamp() });
        return { persona, misionId: candidata, texto, cumplida: false };
      });
    } catch (err) {
      if (err instanceof Error && err.message === "tomada") continue;
      throw err;
    }
  }
  throw new Error("banco-agotado");
}

function barajar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Solo el anfitrión: siembra el banco. Idempotente. */
export async function sembrarMisiones(): Promise<number> {
  const previas = await getDocs(collection(db, "bancoMisiones"));
  if (!previas.empty) return 0;

  const batch = writeBatch(db);
  for (const mision of BANCO_MISIONES) {
    batch.set(doc(db, "bancoMisiones", mision.id), {
      texto: mision.texto,
      tomada: false,
    });
  }
  await batch.commit();
  return BANCO_MISIONES.length;
}

/** Solo el anfitrión: marca si el grupo dio por cumplida la misión. */
export async function marcarCumplida(persona: PersonaId, cumplida: boolean) {
  const batch = writeBatch(db);
  batch.set(doc(db, "misiones", persona), { cumplida }, { merge: true });
  await batch.commit();
}
