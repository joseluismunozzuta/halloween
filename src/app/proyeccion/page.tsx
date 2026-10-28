"use client";

import { useEffect, useState } from "react";
import { TriviaBoard } from "@/components/trivia/TriviaBoard";
import { MentirasBoard } from "@/components/proyeccion/MentirasBoard";
import { Acecha } from "@/components/proyeccion/Acecha";
import { Bulbs } from "@/components/tape/Bulbs";
import {
  IDLE_GAME,
  subscribeGame,
  subscribeScores,
  type GameState,
  type TriviaScore,
} from "@/lib/trivia";
import { EVENT_NAME } from "@/lib/event-config";
import { NOCHE_INICIAL, suscribirNoche, type EstadoNoche } from "@/lib/party";
import { suscribirFichas, type Ficha } from "@/lib/mentiras";
import { suscribirSala, type Inscrito } from "@/lib/trivia-sala";
import type { PersonaId } from "@/lib/identidad";

/**
 * La pantalla de la TV. Es la única vista del sitio diseñada para horizontal y
 * grande; todo lo demás es de celular.
 *
 * No es «la landing en grande»: la landing es la cinta encontrada, y esto es
 * lo que el proyector tira contra la pared de la carpa. De ahí el telón a los
 * lados, el haz de luz por arriba, la viñeta que apaga las esquinas y los
 * personajes acechando el borde.
 *
 * Qué se muestra lo decide `party/live`: si hay una dinámica abierta manda esa,
 * y si no, el tablero de la trivia.
 */
export default function ProyeccionPage() {
  const [game, setGame] = useState<GameState>(IDLE_GAME);
  const [scores, setScores] = useState<TriviaScore[]>([]);
  const [noche, setNoche] = useState<EstadoNoche>(NOCHE_INICIAL);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [sala, setSala] = useState<Inscrito[]>([]);

  useEffect(() => subscribeGame(setGame), []);
  useEffect(() => subscribeScores(setScores), []);
  useEffect(() => suscribirSala(setSala, () => {}), []);
  useEffect(() => suscribirNoche(setNoche, () => {}), []);
  useEffect(() => suscribirFichas(setFichas, () => {}), []);

  const enMentiras = noche.actividadAbierta === "mentiras" && noche.rondaMentiras;
  const ficha = enMentiras
    ? fichas.find((f) => f.autor === noche.rondaMentiras)
    : undefined;
  const resultado =
    noche.resultadoMentiras?.ronda === noche.rondaMentiras
      ? noche.resultadoMentiras
      : null;

  // Pennywise sale a hacer tiempo en la sala de espera, que es la pantalla que
  // más rato va a estar puesta y la única sin nada que leer. Durante las
  // preguntas no acecha nadie: ahí la pantalla es para la pregunta. En las
  // mentiras tampoco, porque Ghostface ya vive dentro de ese tablero.
  const acechante = !enMentiras && game.status === "idle";

  return (
    <main className="scanlines vineta telon relative flex h-screen flex-col overflow-hidden bg-tape">
      {/* Franjas de carpa, apenas insinuadas al fondo de todo. */}
      <div aria-hidden className="carpa-fondo pointer-events-none absolute inset-0" />

      <header className="marquesina haz relative z-20 shrink-0 px-12 py-5">
        <Bulbs cols={16} rows={2} />
        <div className="relative z-10 flex items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <span aria-hidden className="block h-14 w-1.5 shrink-0 bg-rec" />
            <div>
              <p className="flex items-center gap-2 text-xs tracking-[0.3em] text-rec">
                <span
                  aria-hidden
                  className="rec-dot block h-[7px] w-[7px] rounded-full bg-rec"
                />
                FUNCIÓN ÚNICA · 31 OCT
              </p>
              <h1 className="chroma mt-1.5 font-cartel text-4xl uppercase text-bone">
                {EVENT_NAME}
              </h1>
            </div>
          </div>
          <p className="pb-1 text-right text-xs leading-relaxed tracking-[0.25em] text-muted">
            {enMentiras ? "DOS VERDADES Y UNA MENTIRA" : "TRIVIA DE TERROR"}
          </p>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-12">
        {acechante && (
          <Acecha src="/personajes/it-payaso.webp" lado="izquierda" ancho={300} alto={520} />
        )}

        {enMentiras ? (
          ficha ? (
            <MentirasBoard
              autor={ficha.autor}
              frases={ficha.frases}
              fase={resultado ? "resultado" : "frases"}
              indiceMentira={resultado?.indiceMentira}
              votos={resultado?.votos}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-2xl text-muted">
                Esperando las frases de{" "}
                <span className="text-bone">{noche.rondaMentiras as PersonaId}</span>…
              </p>
            </div>
          )
        ) : (
          <TriviaBoard game={game} scores={scores} sala={sala} />
        )}
      </div>

      <footer className="relative z-20 shrink-0 border-t border-blood-line px-12 py-3 text-center text-xs tracking-[0.3em] text-muted">
        {enMentiras ? "ELIGE EL NÚMERO DESDE TU CELULAR" : "RESPONDE DESDE TU CELULAR EN /TRIVIA"}
      </footer>
    </main>
  );
}
