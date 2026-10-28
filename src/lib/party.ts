import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

/** Las dinámicas que el anfitrión puede abrir desde la cabina. */
export type Actividad = "mentiras" | "misiones" | "disfraces" | "supervivencia" | null;

export type EstadoNoche = {
  /** Qué dinámica está abierta. Las reglas de Firestore la consultan. */
  actividadAbierta: Actividad;
  /** Bloque de agenda forzado por el anfitrión, si la noche se corrió. */
  bloqueForzado: string | null;
  /** De quién son las frases que están en la pantalla ahora. */
  rondaMentiras: string | null;
};

export const NOCHE_INICIAL: EstadoNoche = {
  actividadAbierta: null,
  bloqueForzado: null,
  rondaMentiras: null,
};

const REF = () => doc(db, "party", "live");

export function suscribirNoche(
  callback: (estado: EstadoNoche) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    REF(),
    (snap) => {
      const data = snap.data();
      callback({
        actividadAbierta: (data?.actividadAbierta as Actividad) ?? null,
        bloqueForzado: (data?.bloqueForzado as string | null) ?? null,
        rondaMentiras: (data?.rondaMentiras as string | null) ?? null,
      });
    },
    (err) => onError?.(err)
  );
}

/** Solo el anfitrión. merge para no pisar lo que no se está tocando. */
export async function actualizarNoche(cambios: Partial<EstadoNoche>) {
  await setDoc(REF(), cambios, { merge: true });
}
