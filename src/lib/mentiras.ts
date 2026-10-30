import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { PUNTOS, volcarFuente } from "./almas";
import { TODAS_LAS_PERSONAS, type PersonaId } from "./identidad";

export type Ficha = {
  autor: PersonaId;
  frases: [string, string, string];
};

function aFicha(id: string, data: Record<string, unknown>): Ficha {
  const frases = (data.frases as string[]) ?? [];
  return {
    autor: id as PersonaId,
    frases: [frases[0] ?? "", frases[1] ?? "", frases[2] ?? ""],
  };
}

/**
 * Las fichas solo son legibles por su dueño hasta que el anfitrión abre la
 * dinámica; ahí pasan a ser públicas porque van en la pantalla. La suscripción
 * devolverá únicamente lo que las reglas permitan ver en cada momento, así que
 * antes del evento cada quien ve solo la suya.
 */
export function suscribirFichas(
  callback: (fichas: Ficha[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "fichas"),
    (snap) => callback(snap.docs.map((d) => aFicha(d.id, d.data()))),
    (err) => onError?.(err)
  );
}

/**
 * Guarda las tres frases y, aparte, cuál es la mentira.
 *
 * La clave va en `fichaClaves`, una colección que su dueño puede escribir pero
 * solo el anfitrión puede leer — el mismo aislamiento que usa la trivia para
 * las respuestas correctas. Si viviera dentro de la ficha, cualquiera que
 * pudiera leer las frases durante la ronda vería también la respuesta.
 */
export async function guardarFicha(
  persona: PersonaId,
  frases: [string, string, string],
  indiceMentira: number
) {
  if (!auth.currentUser) throw new Error("sin-sesion");
  await Promise.all([
    setDoc(doc(db, "fichas", persona), {
      frases: frases.map((f) => f.trim()),
      actualizadoEn: serverTimestamp(),
    }),
    setDoc(doc(db, "fichaClaves", persona), { indiceMentira }),
    // Marcador vacío y público: solo dice que ya la dejaste.
    setDoc(doc(db, "fichasListas", persona), {}),
  ]);
}

/** Quiénes ya dejaron sus frases. No revela ninguna. */
export function suscribirFichasListas(
  callback: (personas: PersonaId[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "fichasListas"),
    (snap) => callback(snap.docs.map((d) => d.id as PersonaId)),
    (err) => onError?.(err)
  );
}

/** Un voto por ronda y por votante; no se puede votar la propia ficha. */
export async function votarMentira(ronda: PersonaId, indice: number) {
  const user = auth.currentUser;
  if (!user) throw new Error("sin-sesion");
  await setDoc(doc(db, "mentiraVotos", `${ronda}_${user.uid}`), { ronda, indice });
}

/**
 * Qué voté en esta ronda, si es que ya voté.
 *
 * Existe para que recargar el celular a mitad de una ronda no borre tu voto de
 * la pantalla: las reglas solo dejan crear el documento una vez, así que sin
 * esto la interfaz te ofrecería votar otra vez y el intento fallaría sin que se
 * entienda por qué. Cada quien lee únicamente el suyo.
 */
export async function miVotoDeLaRonda(ronda: PersonaId): Promise<number | null> {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, "mentiraVotos", `${ronda}_${user.uid}`));
  return snap.exists() ? (snap.data().indice as number) : null;
}

/**
 * Cierra una ronda: lee la clave y los votos —cosas que solo el anfitrión
 * puede leer— y publica el resultado en party/live, que sí es público.
 *
 * Devuelve además los puntos que esa ronda reparte, para que la cabina los
 * acumule y los vuelque al Marcador de Almas de una sola vez.
 */
export async function cerrarRondaMentiras(ronda: PersonaId): Promise<{
  indiceMentira: number;
  votos: [number, number, number];
  acertaron: PersonaId[];
}> {
  const clave = await getDoc(doc(db, "fichaClaves", ronda));
  if (!clave.exists()) throw new Error("sin-clave");
  const indiceMentira = clave.data().indiceMentira as number;

  const votosSnap = await getDocs(
    query(collection(db, "mentiraVotos"), where("ronda", "==", ronda))
  );
  const identidades = await getDocs(collection(db, "identidades"));
  const personaPorUid = new Map(
    identidades.docs.map((d) => [d.id, d.data().persona as PersonaId])
  );

  const votos: [number, number, number] = [0, 0, 0];
  const acertaron: PersonaId[] = [];
  for (const d of votosSnap.docs) {
    const indice = d.data().indice as number;
    if (indice >= 0 && indice < 3) votos[indice] += 1;
    // El id es `${ronda}_${uid}`; la ronda puede llevar guion bajo, el uid no.
    const uid = d.id.slice(ronda.length + 1);
    const quien = personaPorUid.get(uid);
    if (quien && indice === indiceMentira) acertaron.push(quien);
  }

  // Los puntos de la ronda se guardan en el momento de revelarla, no se
  // acumulan en la memoria de la cabina: son seis rondas repartidas en una
  // noche larga, y si al anfitrión se le cierra la pestaña a la cuarta, lo que
  // llevaba acumulado se iría con ella.
  const fallaron = votosSnap.size - acertaron.length;
  const puntos: PuntosRonda = {};
  for (const quien of acertaron) {
    puntos[quien] = (puntos[quien] ?? 0) + PUNTOS.mentiraAcertada;
  }
  // El autor cobra por cada voto que no la descubrió. Se cuentan votos y no
  // personas: quien no votó no le regala puntos a nadie.
  if (fallaron > 0) {
    puntos[ronda] = (puntos[ronda] ?? 0) + fallaron * PUNTOS.mentiraNoDescubierta;
  }

  await setDoc(doc(db, "mentirasPuntos", ronda), { puntos });

  await setDoc(
    doc(db, "party", "live"),
    { resultadoMentiras: { ronda, indiceMentira, votos } },
    { merge: true }
  );

  return { indiceMentira, votos, acertaron };
}

/** Lo que repartió una ronda ya revelada. */
export type PuntosRonda = Partial<Record<PersonaId, number>>;

/** Qué rondas ya se revelaron. Solo el anfitrión. */
export function suscribirRondasCerradas(
  callback: (rondas: PersonaId[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, "mentirasPuntos"),
    (snap) => callback(snap.docs.map((d) => d.id as PersonaId)),
    (err) => onError?.(err)
  );
}

/**
 * Suma las seis rondas y las manda al Marcador de Almas.
 *
 * Se vuelca una sola vez al final y no ronda por ronda porque `volcarFuente`
 * reemplaza el aporte de la fuente entera: volcarla a la tercera ronda y otra
 * vez a la sexta funciona igual, pero mientras tanto el marcador mostraría a
 * alguien con menos puntos de los que lleva.
 */
export async function volcarMentiras(): Promise<{ rondas: number }> {
  const snap = await getDocs(collection(db, "mentirasPuntos"));

  const total: PuntosRonda = {};
  for (const d of snap.docs) {
    const puntos = (d.data().puntos as PuntosRonda) ?? {};
    for (const persona of TODAS_LAS_PERSONAS) {
      const suma = puntos[persona];
      if (suma) total[persona] = (total[persona] ?? 0) + suma;
    }
  }

  await volcarFuente("mentiras", total);
  return { rondas: snap.size };
}
