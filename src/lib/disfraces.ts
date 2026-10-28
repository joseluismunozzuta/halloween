import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { PAREJAS, type ParejaId, type PersonaId } from "./identidad";

/** Lo que vale ganar una categoría, para los dos de la pareja. */
const PUNTOS_CATEGORIA = 400;

export type Disfraz = {
  parejaId: ParejaId;
  foto: string;
  subidaPor: PersonaId | null;
};

export const CATEGORIAS = [
  { id: "terrorifico", nombre: "Más terrorífico" },
  { id: "original", nombre: "Más original" },
  { id: "improvisado", nombre: "Más improvisado" },
] as const;

export type CategoriaId = (typeof CATEGORIAS)[number]["id"];

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
export async function votarDisfraz(categoria: CategoriaId, parejaId: ParejaId) {
  const user = auth.currentUser;
  if (!user) throw new Error("sin-sesion");
  await setDoc(doc(db, "disfrazVotos", `${user.uid}_${categoria}`), {
    categoria,
    parejaId,
  });
}

/**
 * Cierra la votación: cuenta los votos —que solo el anfitrión puede leer— y
 * devuelve quién ganó cada categoría y los puntos que le tocan a cada persona.
 *
 * Los puntos van a los DOS integrantes de la pareja ganadora: el disfraz es de
 * los dos, así que el premio también.
 */
export async function cerrarVotacionDisfraces(): Promise<{
  ganadoras: { categoria: string; parejaId: ParejaId }[];
  puntos: Partial<Record<PersonaId, number>>;
}> {
  const votos = await getDocs(collection(db, "disfrazVotos"));

  const conteo = new Map<string, Map<string, number>>();
  for (const d of votos.docs) {
    const categoria = d.data().categoria as string;
    const parejaId = d.data().parejaId as string;
    if (!conteo.has(categoria)) conteo.set(categoria, new Map());
    const porPareja = conteo.get(categoria)!;
    porPareja.set(parejaId, (porPareja.get(parejaId) ?? 0) + 1);
  }

  const ganadoras: { categoria: string; parejaId: ParejaId }[] = [];
  const puntos: Partial<Record<PersonaId, number>> = {};

  for (const categoria of CATEGORIAS) {
    const porPareja = conteo.get(categoria.id);
    if (!porPareja || porPareja.size === 0) continue;

    // Empate: gana la primera en orden de PAREJAS. Con tres parejas y votos
    // de cuatro personas pasa poco, y desempatar a mano a la 1 am es peor.
    let mejor: ParejaId | null = null;
    let mejorVotos = -1;
    for (const pareja of PAREJAS) {
      const suyos = porPareja.get(pareja.id) ?? 0;
      if (suyos > mejorVotos) {
        mejorVotos = suyos;
        mejor = pareja.id;
      }
    }
    if (!mejor || mejorVotos <= 0) continue;

    ganadoras.push({ categoria: categoria.nombre, parejaId: mejor });
    for (const persona of PAREJAS.find((p) => p.id === mejor)!.integrantes) {
      puntos[persona] = (puntos[persona] ?? 0) + PUNTOS_CATEGORIA;
    }
  }

  return { ganadoras, puntos };
}
