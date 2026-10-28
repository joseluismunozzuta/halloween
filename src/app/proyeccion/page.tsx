"use client";

import { useEffect, useState } from "react";
import { TriviaBoard } from "@/components/trivia/TriviaBoard";
import { MentirasBoard, type FaseMentiras } from "@/components/proyeccion/MentirasBoard";
import {
  IDLE_GAME,
  subscribeGame,
  subscribeScores,
  type GameState,
  type TriviaScore,
} from "@/lib/trivia";
import { EVENT_NAME } from "@/lib/event-config";
import { FICHAS_MENTIRA } from "@/lib/datos-provisionales";

type Modo = "trivia" | "mentiras";

/**
 * La pantalla de la TV. Es la única vista del sitio diseñada para horizontal y
 * grande; todo lo demás es de celular.
 *
 * De momento el modo se fuerza con ?modo=mentiras para poder verlo. Cuando
 * entre Firestore lo decidirá `party/live.openActivity`.
 */
export default function ProyeccionPage() {
  const [game, setGame] = useState<GameState>(IDLE_GAME);
  const [scores, setScores] = useState<TriviaScore[]>([]);
  const [modo, setModo] = useState<Modo>("trivia");
  const [fase, setFase] = useState<FaseMentiras>("frases");

  useEffect(() => subscribeGame(setGame), []);
  useEffect(() => subscribeScores(setScores), []);

  // Se lee de location en vez de useSearchParams: esa API obliga a envolver la
  // página en un Suspense cuando se prerenderiza estática.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("modo") === "mentiras") setModo("mentiras");
      if (params.get("fase") === "resultado") setFase("resultado");
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const ficha = FICHAS_MENTIRA[0];

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

      {modo === "mentiras" ? (
        <MentirasBoard
          autor={ficha.autor}
          frases={ficha.frases}
          fase={fase}
          indiceMentira={1}
          votos={[1, 3, 2]}
        />
      ) : (
        <TriviaBoard game={game} scores={scores} />
      )}

      <footer className="shrink-0 pt-4 text-center text-xs tracking-[0.2em] text-muted">
        {modo === "mentiras"
          ? "VOTA DESDE TU CELULAR EN /"
          : "RESPONDE DESDE TU CELULAR EN /TRIVIA"}
      </footer>
    </main>
  );
}
