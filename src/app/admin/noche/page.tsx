"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Bulbs } from "@/components/tape/Bulbs";
import { Osd } from "@/components/tape/Osd";
import { useSesion } from "@/lib/sesion";
import { signInWithGoogle } from "@/lib/firebase";
import { NOMBRES, PAREJAS, TODAS_LAS_PERSONAS, type PersonaId } from "@/lib/identidad";
import { liberarIdentidad } from "@/lib/identidad-db";
import {
  actualizarNoche,
  NOCHE_INICIAL,
  suscribirNoche,
  type Actividad,
  type EstadoNoche,
} from "@/lib/party";
import { cerrarRondaMentiras, suscribirFichasListas } from "@/lib/mentiras";
import { cerrarVotacionDisfraces } from "@/lib/disfraces";
import {
  marcarCumplida,
  sembrarMisiones,
  suscribirMisiones,
  type MisionAsignada,
} from "@/lib/misiones";
import {
  PUNTOS,
  PUNTOS_POR_PUESTO,
  reiniciarAlmas,
  suscribirAlmas,
  volcarFuente,
  type Alma,
} from "@/lib/almas";
import { subscribeScores, type TriviaScore } from "@/lib/trivia";

const ACTIVIDADES: { id: Actividad; nombre: string }[] = [
  { id: null, nombre: "Ninguna" },
  { id: "disfraces", nombre: "Disfraces" },
  { id: "mentiras", nombre: "Mentiras" },
  { id: "supervivencia", nombre: "Supervivencia" },
  { id: "misiones", nombre: "Revelar misiones" },
];

/**
 * La cabina: lo que JL toca durante la noche.
 *
 * Todo el cálculo de puntos corre aquí, en su navegador, por el mismo motivo
 * que la trivia: las claves y los votos secretos solo los puede leer él. Cada
 * volcado es idempotente, así que repetir un botón no duplica nada.
 */
export default function CabinaPage() {
  const { user, esAdmin, identidades, cargando } = useSesion();

  if (cargando) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center text-[11px] tracking-[0.25em] text-muted">
        VERIFICANDO CREDENCIALES
      </main>
    );
  }

  if (!esAdmin) {
    return (
      <main className="scanlines relative flex min-h-[100svh] flex-col items-center justify-center gap-6 px-6 text-center">
        <div aria-hidden className="carpa-fondo pointer-events-none absolute inset-0" />
        <p className="relative text-[10px] tracking-[0.3em] text-rec">ACCESO RESTRINGIDO</p>
        <h1 className="chroma-soft relative font-cartel text-2xl uppercase text-bone">
          Cabina de la noche
        </h1>
        {!user && (
          <button type="button" onClick={() => signInWithGoogle()} className="btn-sangre relative">
            Entrar con Google
          </button>
        )}
        <Link
          href="/"
          className="relative text-[10px] tracking-[0.2em] text-muted transition-colors hover:text-bulb"
        >
          ← VOLVER
        </Link>
      </main>
    );
  }

  return <Controles identidades={identidades} />;
}

function Controles({
  identidades,
}: {
  identidades: { uid: string; persona: PersonaId; nombre: string }[];
}) {
  const [noche, setNoche] = useState<EstadoNoche>(NOCHE_INICIAL);
  const [listas, setListas] = useState<PersonaId[]>([]);
  const [misiones, setMisiones] = useState<MisionAsignada[]>([]);
  const [almas, setAlmas] = useState<Alma[]>([]);
  const [triviaScores, setTriviaScores] = useState<TriviaScore[]>([]);
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [ganadorPlan, setGanadorPlan] = useState<PersonaId | "">("");

  useEffect(() => suscribirNoche(setNoche, () => {}), []);
  useEffect(() => suscribirFichasListas(setListas, () => {}), []);
  useEffect(() => suscribirMisiones(setMisiones, () => {}), []);
  useEffect(() => suscribirAlmas(setAlmas, () => {}), []);
  useEffect(() => subscribeScores(setTriviaScores), []);

  async function correr(etiqueta: string, fn: () => Promise<string>) {
    setOcupado(true);
    setAviso("");
    try {
      setAviso(await fn());
    } catch (err) {
      console.error(etiqueta, err);
      setAviso(`Falló: ${etiqueta}`);
    } finally {
      setOcupado(false);
    }
  }

  const personaPorUid = new Map(identidades.map((i) => [i.uid, i.persona]));

  return (
    <main className="scanlines relative min-h-[100svh] px-5 py-7">
      <div aria-hidden className="carpa-fondo pointer-events-none fixed inset-0" />

      <div className="relative mx-auto max-w-xl space-y-5">
        <Osd right={noche.actividadAbierta?.toUpperCase() ?? "SIN DINÁMICA ABIERTA"} />

        <header className="marquesina relative px-5 py-5">
          <Bulbs cols={11} rows={2} />
          <div className="relative z-10">
            <p className="text-[10px] tracking-[0.3em] text-rec">DETRÁS DE LA CARPA</p>
            <h1 className="chroma-soft mt-1.5 font-cartel text-[clamp(1.15rem,5.6vw,1.6rem)] uppercase leading-none text-bone">
              Cabina de la noche
            </h1>
            <p className="mt-2 text-[11px] text-muted">
              Dinámica abierta:{" "}
              <span className="text-bone">{noche.actividadAbierta ?? "ninguna"}</span>
            </p>
          </div>
          <div className="relative z-10 mt-4 flex gap-2">
            <Link
              href="/proyeccion"
              target="_blank"
              className="btn-hueso px-3 py-2 text-[10px]"
            >
              PROYECCIÓN ↗
            </Link>
            <Link
              href="/admin/trivia"
              className="btn-riesgo px-3 py-2 text-[10px]"
            >
              TRIVIA
            </Link>
          </div>
        </header>

        {aviso && (
          <p className="border border-bulb bg-bulb/10 px-4 py-3 text-[11px] text-bulb">{aviso}</p>
        )}

        {/* Qué está abierto */}
        <Bloque titulo="Dinámica abierta">
          <p className="text-[10px] leading-[1.5] text-muted">
            Esto es lo que decide qué sale en la TV y qué pueden escribir los celulares.
            Las fichas de mentiras dejan de ser privadas al abrir esa dinámica.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ACTIVIDADES.map((a) => (
              <button
                key={a.nombre}
                type="button"
                disabled={ocupado}
                onClick={() =>
                  correr("abrir dinámica", async () => {
                    await actualizarNoche({ actividadAbierta: a.id });
                    return `Abierta: ${a.nombre}.`;
                  })
                }
                className={`border px-3 py-2 text-[10px] tracking-[0.1em] ${
                  noche.actividadAbierta === a.id
                    ? "border-bulb bg-bulb text-tape"
                    : "border-tape-line text-muted hover:border-bulb hover:text-bulb"
                }`}
              >
                {a.nombre.toUpperCase()}
              </button>
            ))}
          </div>
        </Bloque>

        {/* Mentiras */}
        <Bloque titulo="Dos verdades y una mentira" personaje="/personajes/ghostface.webp">
          <p className="text-[10px] text-muted">
            {listas.length} de {TODAS_LAS_PERSONAS.length} dejaron sus frases.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {TODAS_LAS_PERSONAS.map((persona) => (
              <button
                key={persona}
                type="button"
                disabled={ocupado || !listas.includes(persona)}
                onClick={() =>
                  correr("poner ronda", async () => {
                    await actualizarNoche({
                      actividadAbierta: "mentiras",
                      rondaMentiras: persona,
                      resultadoMentiras: null,
                    });
                    return `En pantalla: ${NOMBRES[persona]}.`;
                  })
                }
                className={`border px-2 py-2 text-[11px] ${
                  noche.rondaMentiras === persona
                    ? "border-bulb bg-bulb text-tape"
                    : "border-tape-line text-bone disabled:opacity-30"
                }`}
              >
                {NOMBRES[persona]}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={ocupado || !noche.rondaMentiras}
            onClick={() =>
              correr("cerrar ronda", async () => {
                const ronda = noche.rondaMentiras as PersonaId;
                const { acertaron } = await cerrarRondaMentiras(ronda);
                return `Revelada la de ${NOMBRES[ronda]}: ${acertaron.length} acertaron.`;
              })
            }
            className="btn-sangre mt-3 w-full"
          >
            REVELAR LA MENTIRA
          </button>
          <p className="mt-2 text-[10px] leading-[1.5] text-muted">
            Los puntos de esta dinámica se vuelcan todos juntos abajo, cuando hayan pasado
            las seis rondas.
          </p>
        </Bloque>

        {/* Disfraces */}
        <Bloque titulo="Concurso de disfraces" personaje="/personajes/it-payaso.webp">
          <button
            type="button"
            disabled={ocupado}
            onClick={() =>
              correr("cerrar disfraces", async () => {
                const { ganadoras, puntos } = await cerrarVotacionDisfraces();
                await volcarFuente("disfraces", puntos);
                const texto = ganadoras
                  .map((g) => {
                    const pareja = PAREJAS.find((p) => p.id === g.parejaId);
                    return `${g.categoria}: ${pareja?.nombre ?? "—"}`;
                  })
                  .join(" · ");
                return texto || "No hubo votos todavía.";
              })
            }
            className="btn-sangre w-full"
          >
            CERRAR VOTACIÓN Y REPARTIR PUNTOS
          </button>
          <p className="mt-2 text-[10px] leading-[1.5] text-muted">
            {PUNTOS.categoriaDisfraz} puntos por categoría, para los dos de la pareja.
          </p>
        </Bloque>

        {/* Supervivencia */}
        <Bloque titulo="Plan de supervivencia">
          <p className="text-[10px] text-muted">
            Esta se vota a mano alzada. Marca quién ganó.
          </p>
          <select
            value={ganadorPlan}
            onChange={(e) => setGanadorPlan(e.target.value as PersonaId | "")}
            className="mt-2 w-full border border-blood-line bg-tape-deep px-3 py-2.5 text-[12px] text-bone"
          >
            <option value="">Elige al ganador…</option>
            {TODAS_LAS_PERSONAS.map((p) => (
              <option key={p} value={p}>
                {NOMBRES[p]}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={ocupado || ganadorPlan === ""}
            onClick={() =>
              correr("puntos de supervivencia", async () => {
                await volcarFuente("supervivencia", {
                  [ganadorPlan as PersonaId]: PUNTOS.mejorPlan,
                });
                return `${NOMBRES[ganadorPlan as PersonaId]} se lleva la supervivencia.`;
              })
            }
            className="btn-hueso mt-2 w-full"
          >
            DAR {PUNTOS.mejorPlan} PUNTOS
          </button>
        </Bloque>

        {/* Misiones */}
        <Bloque titulo="Misiones secretas" personaje="/personajes/jigsaw.webp">
          <button
            type="button"
            disabled={ocupado}
            onClick={() =>
              correr("sembrar misiones", async () => {
                const n = await sembrarMisiones();
                return n > 0 ? `Sembradas ${n} misiones.` : "El banco ya estaba sembrado.";
              })
            }
            className="btn-riesgo w-full"
          >
            SEMBRAR EL BANCO
          </button>

          {misiones.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {misiones.map((m) => (
                <li key={m.persona} className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() =>
                      correr("marcar misión", async () => {
                        await marcarCumplida(m.persona, !m.cumplida);
                        return `${NOMBRES[m.persona]}: ${!m.cumplida ? "cumplida" : "sin cumplir"}.`;
                      })
                    }
                    className={`h-6 w-6 shrink-0 border text-[11px] ${
                      m.cumplida
                        ? "border-bulb bg-bulb text-tape"
                        : "border-tape-line text-muted"
                    }`}
                  >
                    {m.cumplida ? "✓" : ""}
                  </button>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-bone">
                    <span className="text-bulb">{NOMBRES[m.persona]}</span> — {m.texto}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            disabled={ocupado || misiones.length === 0}
            onClick={() =>
              correr("puntos de misiones", async () => {
                const puntos: Partial<Record<PersonaId, number>> = {};
                for (const m of misiones) {
                  if (m.cumplida) puntos[m.persona] = PUNTOS.misionCumplida;
                }
                await volcarFuente("misiones", puntos);
                return `Volcadas ${Object.keys(puntos).length} misiones cumplidas.`;
              })
            }
            className="btn-hueso mt-3 w-full"
          >
            VOLCAR PUNTOS DE MISIONES
          </button>
        </Bloque>

        {/* Trivia → almas */}
        <Bloque titulo="Trivia → Marcador de Almas">
          <p className="text-[10px] leading-[1.5] text-muted">
            La trivia no vuelca sus puntos crudos: se convierte el puesto final a{" "}
            {PUNTOS_POR_PUESTO.join(" / ")}. Si no, decidiría sola la noche.
          </p>
          <button
            type="button"
            disabled={ocupado || triviaScores.length === 0}
            onClick={() =>
              correr("volcar trivia", async () => {
                const puntos: Partial<Record<PersonaId, number>> = {};
                triviaScores.forEach((score, i) => {
                  const persona = personaPorUid.get(score.id);
                  if (persona) puntos[persona] = PUNTOS_POR_PUESTO[i] ?? 100;
                });
                await volcarFuente("trivia", puntos);
                return `Volcados ${Object.keys(puntos).length} puestos de la trivia.`;
              })
            }
            className="btn-sangre mt-3 w-full"
          >
            VOLCAR LA TRIVIA
          </button>
        </Bloque>

        {/* Marcador */}
        <Bloque titulo="Marcador de Almas" personaje="/personajes/lapida.webp">
          {almas.length === 0 ? (
            <p className="text-[11px] text-muted">Todavía sin puntos.</p>
          ) : (
            <ul className="space-y-1.5">
              {[...almas]
                .sort((a, b) => b.total - a.total)
                .map((alma, i) => (
                  <li key={alma.persona} className="flex items-center gap-3 text-[11px]">
                    <span className="w-4 text-bulb">{i + 1}</span>
                    <span className="flex-1 text-bone">{NOMBRES[alma.persona]}</span>
                    <span className="tabular-nums text-bulb">{alma.total}</span>
                  </li>
                ))}
            </ul>
          )}
        </Bloque>

        {/* Zona de riesgo */}
        <Bloque titulo="Zona de riesgo">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] leading-[1.5] text-muted">
                Libera el nombre de alguien que se equivocó al elegir quién es.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {identidades.map((ident) => (
                  <button
                    key={ident.uid}
                    type="button"
                    disabled={ocupado}
                    onClick={() =>
                      correr("liberar identidad", async () => {
                        await liberarIdentidad(ident.uid, ident.persona);
                        return `Liberado: ${NOMBRES[ident.persona]}.`;
                      })
                    }
                    className="border border-tape-line px-3 py-1.5 text-[10px] text-muted hover:border-rec hover:text-rec"
                  >
                    {NOMBRES[ident.persona]} ✕
                  </button>
                ))}
                {identidades.length === 0 && (
                  <p className="text-[10px] text-muted">Nadie se ha identificado todavía.</p>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={ocupado}
              onClick={() =>
                correr("reiniciar marcador", async () => {
                  await reiniciarAlmas();
                  return "Marcador en cero.";
                })
              }
              className="btn-riesgo w-full"
            >
              REINICIAR EL MARCADOR
            </button>
          </div>
        </Bloque>
      </div>
    </main>
  );
}

/**
 * Un panel de la cabina: chapa roja con el rótulo clavado en el borde de
 * arriba y, cuando la dinámica tiene dueño en la landing, su monstruo asomado
 * por la derecha. El mismo reparto de siempre, para que la cabina se sienta el
 * revés de la misma función y no una herramienta aparte.
 */
function Bloque({
  titulo,
  personaje,
  children,
}: {
  titulo: string;
  personaje?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel relative overflow-hidden px-4 pb-4">
      {personaje && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-4 bottom-0 h-[82%] w-24 opacity-[0.16]"
          style={{ maskImage: "linear-gradient(90deg, transparent, #000 60%)" }}
        >
          <Image
            src={personaje}
            alt=""
            fill
            sizes="96px"
            className="object-contain object-bottom"
          />
        </div>
      )}
      <span className="rotulo">{titulo}</span>
      <div className="relative mt-3">{children}</div>
    </section>
  );
}
