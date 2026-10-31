import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { PUNTOS, volcarFuente } from "./almas";
import { TODAS_LAS_PERSONAS, type PersonaId } from "./identidad";
import { CASOS, PLIEGOS, type PliegoJurado } from "./supervivencia-casos";

/**
 * Plan de supervivencia.
 *
 * Funciona como las misiones en el reparto y como las mentiras en la mesa:
 * cada uno abre su caso desde antes y tiene horas para pensarlo; en la noche
 * se pasa por turnos, el caso sale en la televisión y los otros cinco hacen de
 * jurado.
 *
 * Lo que separa a esta de las demás es que hay un texto que el dueño del caso
 * NO puede leer —el pliego del jurado, con las salidas que funcionan y el giro
 * que le van a soltar a mitad de turno—. Eso no se resuelve escondiéndolo en
 * la interfaz: se resuelve en las reglas de Firestore, que no le dejan leer el
 * pliego de su propio caso.
 */

export type CasoAsignado = { persona: PersonaId; casoId: string };

/** Quién tiene qué caso. Público: la televisión lo necesita y no revela nada. */
export function suscribirCasos(
  callback: (lista: CasoAsignado[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "supervivencia"),
    (snap) =>
      callback(
        snap.docs.map((d) => ({
          persona: d.id as PersonaId,
          casoId: (d.data().casoId as string) ?? "",
        }))
      ),
    (err) => onError?.(err)
  );
}

export async function abrirCaso(persona: PersonaId): Promise<string> {
  if (!auth.currentUser) throw new Error("sin-sesion");
  return tomarCasoLibre(persona, null);
}

/** Cambiar de caso: suelta el tuyo y toma otro sin abrir. */
export async function cambiarCaso(persona: PersonaId): Promise<string> {
  if (!auth.currentUser) throw new Error("sin-sesion");
  const mio = await getDoc(doc(db, "supervivencia", persona));
  const anterior = mio.exists() ? (mio.data().casoId as string) : null;
  return tomarCasoLibre(persona, anterior);
}

async function tomarCasoLibre(persona: PersonaId, soltar: string | null): Promise<string> {
  const mio = doc(db, "supervivencia", persona);

  const banco = await getDocs(collection(db, "bancoCasos"));
  const libres = banco.docs.filter((d) => {
    if (d.id === soltar) return false;
    if (d.data().tomado === true) return false;
    return (d.data().excluye as PersonaId | undefined) !== persona;
  });
  if (libres.length === 0) throw new Error("banco-agotado");

  for (const candidato of barajar(libres.map((d) => d.id))) {
    try {
      return await runTransaction(db, async (tx) => {
        const yaTengo = await tx.get(mio);
        if (yaTengo.exists() && soltar === null) return yaTengo.data().casoId as string;

        const ref = doc(db, "bancoCasos", candidato);
        const snap = await tx.get(ref);
        if (!snap.exists() || snap.data().tomado === true) throw new Error("tomado");

        if (soltar) tx.update(doc(db, "bancoCasos", soltar), { tomado: false });
        tx.update(ref, { tomado: true });
        tx.set(mio, { casoId: candidato, abiertoEn: serverTimestamp() });
        return candidato;
      });
    } catch (err) {
      if (err instanceof Error && err.message === "tomado") continue;
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

/**
 * El pliego del jurado de un caso.
 *
 * Devuelve null si las reglas no te dejan leerlo, que es exactamente lo que
 * pasa cuando el caso es el tuyo. No es un error: es la función del sistema.
 */
export async function pliegoDelCaso(casoId: string): Promise<PliegoJurado | null> {
  try {
    const snap = await getDoc(doc(db, "casoClaves", casoId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: casoId,
      criterio: data.criterio as string,
      soluciones: (data.soluciones as string[]) ?? [],
      error: data.error as string,
      giro: data.giro as string,
    };
  } catch {
    return null;
  }
}

/** Nota del 1 al 10 a un plan. Uno por jurado y por presentador. */
export async function puntuarPlan(persona: PersonaId, nota: number) {
  const user = auth.currentUser;
  if (!user) throw new Error("sin-sesion");
  await setDoc(doc(db, "planNotas", `${user.uid}_${persona}`), { persona, nota });
}

/** Mi nota a un plan, para que recargar no la borre. */
export async function miNotaDePlan(persona: PersonaId): Promise<number | null> {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, "planNotas", `${user.uid}_${persona}`));
  return snap.exists() ? (snap.data().nota as number) : null;
}

/**
 * Cierra la votación y reparte.
 *
 * Mismo reparto que los disfraces: el promedio se convierte en puntos, así que
 * los dos minutos del que quedó segundo tampoco fueron gratis.
 */
export async function cerrarPlanes(): Promise<{
  tabla: { persona: PersonaId; promedio: number; jurados: number }[];
  puntos: Partial<Record<PersonaId, number>>;
}> {
  const notas = await getDocs(collection(db, "planNotas"));

  const porPersona = new Map<PersonaId, number[]>();
  for (const d of notas.docs) {
    const persona = d.data().persona as PersonaId;
    const nota = d.data().nota as number;
    if (!TODAS_LAS_PERSONAS.includes(persona) || typeof nota !== "number") continue;
    porPersona.set(persona, [...(porPersona.get(persona) ?? []), nota]);
  }

  const tabla: { persona: PersonaId; promedio: number; jurados: number }[] = [];
  const puntos: Partial<Record<PersonaId, number>> = {};

  for (const persona of TODAS_LAS_PERSONAS) {
    const suyas = porPersona.get(persona) ?? [];
    if (suyas.length === 0) continue;
    const promedio = suyas.reduce((a, b) => a + b, 0) / suyas.length;
    tabla.push({
      persona,
      promedio: Math.round(promedio * 10) / 10,
      jurados: suyas.length,
    });
    puntos[persona] = Math.round(promedio * PUNTOS.planPorPunto);
  }

  tabla.sort((a, b) => b.promedio - a.promedio);
  await volcarFuente("supervivencia", puntos);
  return { tabla, puntos };
}

/** Solo el anfitrión: siembra los casos y sus pliegos. Idempotente. */
export async function sembrarCasos(): Promise<number> {
  const previos = await getDocs(collection(db, "bancoCasos"));
  if (!previos.empty) return 0;

  const batch = writeBatch(db);
  for (const caso of CASOS) {
    batch.set(doc(db, "bancoCasos", caso.id), {
      nombre: caso.nombre,
      personaje: caso.personaje,
      contexto: caso.contexto,
      objetivo: caso.objetivo,
      tienes: caso.tienes,
      noPuedes: caso.noPuedes,
      tomado: false,
      ...(caso.excluye ? { excluye: caso.excluye } : {}),
    });
  }
  for (const pliego of PLIEGOS) {
    batch.set(doc(db, "casoClaves", pliego.id), {
      criterio: pliego.criterio,
      soluciones: pliego.soluciones,
      error: pliego.error,
      giro: pliego.giro,
    });
  }
  await batch.commit();
  return CASOS.length;
}
