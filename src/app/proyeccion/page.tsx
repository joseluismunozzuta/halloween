"use client";

import { useEffect, useState } from "react";
import { TriviaBoard } from "@/components/trivia/TriviaBoard";
import { MentirasBoard } from "@/components/proyeccion/MentirasBoard";
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

  return (
    <main className="scanlines relative flex h-screen flex-col overflow-hidden px-8 py-6">
      <header className="flex shrink-0 items-end justify-between gap-6 border-b border-tape-line pb-5">
        <div className="flex items-center gap-4">
          <span aria-hidden className="block h-14 w-1.5 shrink-0 bg-bulb" />
          <div>
            <p className="text-xs tracking-[0.3em] text-muted">FUNCIÓN ÚNICA · 31 OCT</p>
            <h1 className="chroma-soft mt-1 font-cartel text-4xl uppercase">{EVENT_NAME}</h1>
          </div>
        </div>
      </header>

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

      <footer className="shrink-0 pt-4 text-center text-xs tracking-[0.2em] text-muted">
        {enMentiras ? "ELIGE EL NÚMERO DESDE TU CELULAR" : "RESPONDE DESDE TU CELULAR EN /TRIVIA"}
      </footer>
    </main>
  );
}
