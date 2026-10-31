import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { PUNTOS } from "./almas";
import { TODAS_LAS_PERSONAS, type PersonaId } from "./identidad";

/**
 * Votación del plan de supervivencia.
 *
 * Cada uno explica en dos minutos cómo vencería a sus tres villanos y al final
 * el grupo vota el plan más convincente. Un voto por persona y nunca el propio
 * —lo exige la regla de Firestore, no solo la pantalla—, en secreto hasta que
 * el anfitrión cierra, igual que los disfraces.
 */
export async function votarPlan(persona: PersonaId) {
  const user = auth.currentUser;
  if (!user) throw new Error("sin-sesion");
  await setDoc(doc(db, "planVotos", user.uid), { persona });
}

/** A quién voté, para que recargar el celular no lo borre de la pantalla. */
export async function miVotoPlan(): Promise<PersonaId | null> {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, "planVotos", user.uid));
  return snap.exists() ? (snap.data().persona as PersonaId) : null;
}

/**
 * Cierra la votación y reparte.
 *
 * El mejor plan se lleva lo suyo entero; el resto cobra por cada voto que sí
 * convenció a alguien. Así los dos minutos de quien quedó segundo tampoco
 * fueron gratis.
 */
export async function cerrarVotacionPlanes(): Promise<{
  ganador: PersonaId | null;
  conteo: { persona: PersonaId; votos: number }[];
  puntos: Partial<Record<PersonaId, number>>;
}> {
  const votos = await getDocs(collection(db, "planVotos"));

  const cuenta = new Map<PersonaId, number>();
  for (const d of votos.docs) {
    const persona = d.data().persona as PersonaId;
    if (!TODAS_LAS_PERSONAS.includes(persona)) continue;
    cuenta.set(persona, (cuenta.get(persona) ?? 0) + 1);
  }

  // Empate: gana el primero en el orden de la mesa. Desempatar a mano a las
  // once de la noche es peor que una regla aburrida pero clara.
  let ganador: PersonaId | null = null;
  let mejor = 0;
  for (const persona of TODAS_LAS_PERSONAS) {
    const suyos = cuenta.get(persona) ?? 0;
    if (suyos > mejor) {
      mejor = suyos;
      ganador = persona;
    }
  }

  const puntos: Partial<Record<PersonaId, number>> = {};
  for (const persona of TODAS_LAS_PERSONAS) {
    const suyos = cuenta.get(persona) ?? 0;
    if (persona === ganador) puntos[persona] = PUNTOS.mejorPlan;
    else if (suyos > 0) puntos[persona] = suyos * PUNTOS.votoPlan;
  }

  const conteo = TODAS_LAS_PERSONAS.map((persona) => ({
    persona,
    votos: cuenta.get(persona) ?? 0,
  })).sort((a, b) => b.votos - a.votos);

  return { ganador, conteo, puntos };
}
