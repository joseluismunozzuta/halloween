import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { NOMBRES, TODAS_LAS_PERSONAS, type PersonaId } from "./identidad";

/**
 * Banco de misiones secretas.
 *
 * Cosas que se cumplen sin que nadie note que las estabas intentando. Ninguna
 * requiere salir de la casa ni incomodar a nadie: la gracia está en que
 * parezca casualidad.
 *
 * Dos detalles del formato:
 *
 * - `{X}` se rellena al abrir el sobre con alguien del grupo que no seas tú.
 *   Así la misma misión le toca distinta a cada uno y nadie puede deducir la
 *   tuya por el texto.
 * - `excluye` es para las que nombran a una persona: a esa no se le asigna,
 *   porque pedirle a Victor una foto de Victor no tiene gracia.
 *
 * Hay más misiones que personas a propósito: las que sobran son el repuesto
 * de quien cambie la suya.
 */
export type MisionBanco = {
  id: string;
  /** El nombre que va en el sobre. */
  nombre: string;
  texto: string;
  excluye?: PersonaId;
};

export const BANCO_MISIONES: MisionBanco[] = [
  {
    id: "m01",
    nombre: "El fin del mundo",
    texto: "Consigue que el grupo discuta en serio qué haría en un apocalipsis.",
  },
  {
    id: "m02",
    nombre: "La foto maldita",
    texto: "Logra una foto del grupo donde nadie esté mirando a la cámara.",
  },
  {
    id: "m03",
    nombre: "La carcajada cómplice",
    texto:
      "Haz reír a alguien a carcajadas y, sin que se le pase la risa, chócala con la mano. Tiene que devolvértela.",
  },
  {
    id: "m04",
    nombre: "El celular fantasma",
    texto:
      "Esconde el celular de {X} y aguanta un minuto entero sin que se dé cuenta. Después devuélveselo.",
  },
  {
    id: "m05",
    nombre: "El retrato de Victor",
    texto: "Toma una foto de Victor poniendo una mueca rara.",
    excluye: "victor",
  },
  {
    id: "m06",
    nombre: "El susto perfecto",
    texto:
      "Consigue que alguien dé un pequeño salto del susto, usando solamente una aparición o un sonido inofensivo.",
  },
  {
    id: "m07",
    nombre: "El detective",
    texto:
      "Consigue que alguien revise debajo de un mueble buscando algo que le hiciste creer que podría estar ahí.",
  },
  {
    id: "m08",
    nombre: "El objeto misterioso",
    texto:
      "Consigue que Alexandra busque un objeto cotidiano de la casa que en realidad no necesitabas.",
    excluye: "alexandra",
  },
  {
    id: "m09",
    nombre: "El pacto",
    texto:
      "Chócala con cada una de las otras cinco personas y que todas te la devuelvan. No vale pedirlo dos veces seguidas.",
  },
];

export type MisionAsignada = {
  persona: PersonaId;
  misionId: string;
  nombre: string;
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
          nombre: (d.data().nombre as string) ?? "Tu misión",
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
  return tomarUnaLibre(persona, null);
}

/**
 * Cambia la misión por otra que nadie haya abierto todavía.
 *
 * Suelta la vieja al banco antes de quedarse con la nueva, en la misma
 * transacción: si se cayera en medio, lo peor que pasa es que una misión
 * quede marcada como tomada sin dueño, nunca que dos personas tengan la
 * misma. Por eso el banco tiene más misiones que personas.
 */
export async function cambiarMision(persona: PersonaId): Promise<MisionAsignada> {
  if (!auth.currentUser) throw new Error("sin-sesion");
  const mia = await getDoc(doc(db, "misiones", persona));
  const anterior = mia.exists() ? (mia.data().misionId as string) : null;
  return tomarUnaLibre(persona, anterior);
}

/**
 * El reparto en sí. `soltar` es la misión que hay que devolver al banco, si
 * se está cambiando una por otra.
 */
async function tomarUnaLibre(
  persona: PersonaId,
  soltar: string | null
): Promise<MisionAsignada> {
  const mia = doc(db, "misiones", persona);

  // El banco se lee fuera de la transacción: dentro no se puede consultar una
  // colección. La carrera real la resuelve el documento de la misión elegida.
  const banco = await getDocs(collection(db, "bancoMisiones"));
  const libres = banco.docs.filter((d) => {
    if (d.id === soltar) return false;
    if (d.data().tomada === true) return false;
    // Las que nombran a alguien no se le dan a esa persona.
    return (d.data().excluye as PersonaId | undefined) !== persona;
  });
  if (libres.length === 0) throw new Error("banco-agotado");

  for (const candidata of barajar(libres.map((d) => d.id))) {
    try {
      return await runTransaction(db, async (tx) => {
        const yaTengo = await tx.get(mia);
        if (yaTengo.exists() && soltar === null) {
          const data = yaTengo.data();
          return {
            persona,
            misionId: data.misionId as string,
            nombre: (data.nombre as string) ?? "Tu misión",
            texto: data.texto as string,
            cumplida: false,
          };
        }

        const ref = doc(db, "bancoMisiones", candidata);
        const snap = await tx.get(ref);
        if (!snap.exists() || snap.data().tomada === true) throw new Error("tomada");

        const nombre = (snap.data().nombre as string) ?? "Tu misión";
        const texto = conDestinatario(snap.data().texto as string, persona);

        if (soltar) tx.update(doc(db, "bancoMisiones", soltar), { tomada: false });
        tx.update(ref, { tomada: true });
        tx.set(mia, { misionId: candidata, nombre, texto, abiertaEn: serverTimestamp() });
        return { persona, misionId: candidata, nombre, texto, cumplida: false };
      });
    } catch (err) {
      if (err instanceof Error && err.message === "tomada") continue;
      throw err;
    }
  }
  throw new Error("banco-agotado");
}

/**
 * Rellena el {X} con alguien del grupo que no seas tú.
 *
 * Se guarda ya resuelto en el documento de la misión: si el destinatario se
 * calculara al mostrarlo, cambiaría en cada recarga y la misión dejaría de
 * ser la misma de toda la noche.
 */
function conDestinatario(texto: string, persona: PersonaId): string {
  if (!texto.includes("{X}")) return texto;
  const otros = TODAS_LAS_PERSONAS.filter((p) => p !== persona);
  const elegido = otros[Math.floor(Math.random() * otros.length)];
  return texto.replaceAll("{X}", NOMBRES[elegido]);
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
      nombre: mision.nombre,
      texto: mision.texto,
      tomada: false,
      ...(mision.excluye ? { excluye: mision.excluye } : {}),
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
