import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { PUNTOS } from "./almas";
import { PAREJAS, type ParejaId, type PersonaId } from "./identidad";

/**
 * El concurso se puntúa del 1 al 10: cada quien le pone una nota a las dos
 * parejas de las que no forma parte. No hay categorías.
 *
 * Con tres parejas, categorías servían para repartir premios; una nota sola es
 * más corta de explicar en voz alta y deja un orden claro al final.
 */
export const NOTA_MINIMA = 1;
export const NOTA_MAXIMA = 10;
export const NOTAS = Array.from(
  { length: NOTA_MAXIMA - NOTA_MINIMA + 1 },
  (_, i) => NOTA_MINIMA + i
);

export type Disfraz = {
  parejaId: ParejaId;
  foto: string;
  subidaPor: PersonaId | null;
};

export type NotaDisfraz = { parejaId: ParejaId; nota: number };

export function suscribirDisfraces(
  callback: (lista: Disfraz[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "disfraces"),
    (snap) =>
      callback(
        snap.docs.map((d) => ({
          parejaId: d.id as ParejaId,
          foto: (d.data().foto as string) ?? "",
          subidaPor: (d.data().subidaPor as PersonaId | null) ?? null,
        }))
      ),
    (err) => onError?.(err)
  );
}

const LADO_MAXIMO = 640;
const CALIDAD = 0.72;
/** Firestore corta en 1 MiB por documento; se deja margen. */
const PESO_MAXIMO = 900_000;

/**
 * Reduce la foto en el navegador antes de subirla.
 *
 * Va como data URL dentro del documento, no en Firebase Storage: son tres
 * fotos en total, y evitarse Storage y sus reglas ahorra una pieza entera a
 * cambio de un límite de tamaño que a 640 px no se alcanza.
 */
export async function prepararFoto(archivo: File): Promise<string> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new Error("sin-canvas");
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  const dataUrl = lienzo.toDataURL("image/jpeg", CALIDAD);
  if (dataUrl.length > PESO_MAXIMO) throw new Error("foto-muy-pesada");
  return dataUrl;
}

/** Cualquiera de los dos de la pareja sube o reemplaza la foto. */
export async function subirDisfraz(
  parejaId: ParejaId,
  persona: PersonaId,
  archivo: File
) {
  if (!auth.currentUser) throw new Error("sin-sesion");
  const foto = await prepararFoto(archivo);
  await setDoc(doc(db, "disfraces", parejaId), {
    foto,
    subidaPor: persona,
    subidaEn: serverTimestamp(),
  });
}

/**
 * Voto secreto: solo el anfitrión puede leer esta colección, así que acá no
 * hay forma de saber cómo va la votación. Es a propósito.
 */
export async function puntuarDisfraz(parejaId: ParejaId, nota: number) {
  const user = auth.currentUser;
  if (!user) throw new Error("sin-sesion");
  await setDoc(doc(db, "disfrazVotos", `${user.uid}_${parejaId}`), { parejaId, nota });
}

/**
 * Mis notas, para que recargar el celular no las borre de la pantalla.
 *
 * Cada quien lee solo las suyas: el id del documento lleva su uid dentro. Las
 * de los demás siguen siendo del anfitrión, que es lo que hace que puntuar sea
 * secreto hasta el cierre.
 */
export async function misNotas(): Promise<NotaDisfraz[]> {
  const user = auth.currentUser;
  if (!user) return [];
  const mias = await Promise.all(
    PAREJAS.map(async (pareja) => {
      const snap = await getDoc(doc(db, "disfrazVotos", `${user.uid}_${pareja.id}`));
      return snap.exists()
        ? { parejaId: pareja.id, nota: snap.data().nota as number }
        : null;
    })
  );
  return mias.filter((n): n is NotaDisfraz => n !== null);
}

/**
 * Cierra el concurso: promedia las notas —que solo el anfitrión puede leer— y
 * reparte puntos.
 *
 * No es «gana uno y los otros nada»: cada pareja se lleva su promedio
 * convertido a puntos, así que un 8 vale más que un 6 y la noche no se juega a
 * una sola carta. Los puntos van a los DOS integrantes, porque el disfraz es
 * de los dos.
 */
export async function cerrarVotacionDisfraces(): Promise<{
  tabla: { parejaId: ParejaId; nombre: string; promedio: number; votos: number }[];
  puntos: Partial<Record<PersonaId, number>>;
}> {
  const notas = await getDocs(collection(db, "disfrazVotos"));

  const porPareja = new Map<string, number[]>();
  for (const d of notas.docs) {
    const parejaId = d.data().parejaId as string;
    const nota = d.data().nota as number;
    if (typeof nota !== "number") continue;
    porPareja.set(parejaId, [...(porPareja.get(parejaId) ?? []), nota]);
  }

  const tabla: { parejaId: ParejaId; nombre: string; promedio: number; votos: number }[] = [];
  const puntos: Partial<Record<PersonaId, number>> = {};

  for (const pareja of PAREJAS) {
    const suyas = porPareja.get(pareja.id) ?? [];
    if (suyas.length === 0) continue;

    const promedio = suyas.reduce((a, b) => a + b, 0) / suyas.length;
    tabla.push({
      parejaId: pareja.id,
      nombre: pareja.nombre,
      promedio: Math.round(promedio * 10) / 10,
      votos: suyas.length,
    });

    const suma = Math.round(promedio * PUNTOS.disfrazPorPunto);
    for (const persona of pareja.integrantes) puntos[persona] = suma;
  }

  tabla.sort((a, b) => b.promedio - a.promedio);
  return { tabla, puntos };
}
