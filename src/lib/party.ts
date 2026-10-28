import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Las dinámicas que el anfitrión puede abrir desde la cabina.
 *
 * Abrir una hace dos cosas: decide qué sale en la televisión y levanta el
 * precinto de esa sección en los celulares, para que nadie use una dinámica
 * antes de que toque. Es una sola a la vez, igual que en la noche real.
 */
export type Actividad =
  | "mentiras"
  | "misiones"
  | "disfraces"
  | "supervivencia"
  | "trivia"
  | null;

/**
 * Resultado publicado de una ronda de mentiras.
 *
 * Vive en party/live —de lectura pública— porque la clave y los votos solo los
 * puede leer el anfitrión. Es el mismo truco que usa la trivia con lastResult:
 * el que sabe la respuesta la publica, y la pantalla la muestra sin tener que
 * poder leer la fuente.
 */
export type ResultadoMentiras = {
  ronda: string;
  indiceMentira: number;
  votos: [number, number, number];
};

export type EstadoNoche = {
  /** Qué dinámica está abierta. Las reglas de Firestore la consultan. */
  actividadAbierta: Actividad;
  /** Bloque de agenda forzado por el anfitrión, si la noche se corrió. */
  bloqueForzado: string | null;
  /** De quién son las frases que están en la pantalla ahora. */
  rondaMentiras: string | null;
  resultadoMentiras: ResultadoMentiras | null;
};

export const NOCHE_INICIAL: EstadoNoche = {
  actividadAbierta: null,
  bloqueForzado: null,
  rondaMentiras: null,
  resultadoMentiras: null,
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
        resultadoMentiras: (data?.resultadoMentiras as ResultadoMentiras | null) ?? null,
      });
    },
    (err) => onError?.(err)
  );
}

/** Solo el anfitrión. merge para no pisar lo que no se está tocando. */
export async function actualizarNoche(cambios: Partial<EstadoNoche>) {
  await setDoc(REF(), cambios, { merge: true });
}
