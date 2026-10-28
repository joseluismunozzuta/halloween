"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, signInWithGoogle } from "@/lib/firebase";
import { EVENT_NAME } from "@/lib/event-config";
import {
  getMyResponse,
  IDLE_GAME,
  submitAnswer,
  subscribeGame,
  subscribeScores,
  type GameState,
  type TriviaScore,
} from "@/lib/trivia";
import { optionStyle } from "@/components/trivia/options";
import { useQuestionTimer } from "@/components/trivia/useQuestionTimer";
import { Avatar } from "@/components/Avatar";

/**
 * El mando del jugador. Nunca muestra el enunciado: eso se lee en la tele.
 * Acá solo están los cuatro botones de color, que es lo que hace que funcione
 * a oscuras y con un trago encima.
 */
export default function TriviaPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [game, setGame] = useState<GameState>(IDLE_GAME);
  const [scores, setScores] = useState<TriviaScore[]>([]);
  // Se guarda junto al id de la pregunta: así una respuesta vieja nunca se
  // interpreta como respuesta de la pregunta nueva al cambiar de ronda.
  const [answer, setAnswer] = useState<{ questionId: string; index: number } | null>(null);
  const [sending, setSending] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => subscribeGame(setGame), []);
  useEffect(() => subscribeScores(setScores), []);

  const jugador = user && !user.isAnonymous ? user : user === undefined ? undefined : null;
  const remaining = useQuestionTimer(game.questionStartedAt, game.deadlineSeconds);

  // Solo cuenta si corresponde a la pregunta que está en pantalla.
  const myAnswer =
    answer && answer.questionId === game.currentQuestionId ? answer.index : null;
  const answerForResult =
    answer && game.lastResult && answer.questionId === game.lastResult.questionId
      ? answer.index
      : null;

  // Recupera la respuesta ya enviada (por si recargó el celular a mitad de la
  // pregunta). Todo diferido para no llamar setState dentro del efecto.
  useEffect(() => {
    const questionId = game.currentQuestionId;
    let cancelled = false;
    const run = async () => {
      if (!questionId || !jugador) return;
      const existing = await getMyResponse(questionId);
      if (!cancelled && existing) {
        setAnswer({ questionId, index: existing.optionIndex });
      }
    };
    const timeoutId = setTimeout(run, 0);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [game.currentQuestionId, jugador]);

  async function handleAnswer(index: number) {
    const questionId = game.currentQuestionId;
    if (!questionId || myAnswer !== null) return;
    setSending(true);
    setError("");
    // Optimista: el botón se marca al instante porque el juego es a contrarreloj.
    setAnswer({ questionId, index });
    try {
      await submitAnswer(questionId, index);
    } catch {
      setAnswer(null);
      setError("No se registró tu respuesta. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  async function handleSignIn() {
    setError("");
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      setError("No se pudo entrar. Intenta de nuevo.");
    } finally {
      setSigningIn(false);
    }
  }

  const myScore = jugador ? scores.find((s) => s.id === jugador.uid) : undefined;
  const myPosition = myScore ? scores.findIndex((s) => s.id === jugador?.uid) + 1 : null;
  const wasCorrect =
    game.lastResult && answerForResult !== null
      ? answerForResult === game.lastResult.correctIndex
      : null;

  let body: React.ReactNode;

  if (jugador === undefined) {
    body = <p className="text-center text-[11px] tracking-[0.25em] text-muted">IDENTIFICANDO</p>;
  } else if (jugador === null) {
    body = (
      <div className="tape-frame px-6 py-10 text-center">
        <p className="text-[10px] tracking-[0.25em] text-rec">HACE FALTA IDENTIFICARTE</p>
        <p className="mt-6 text-[12px] leading-[1.7] text-muted">
          Entra con tu cuenta para responder y aparecer en el Marcador de Almas.
        </p>
        <button
          type="button"
          onClick={handleSignIn}
          disabled={signingIn}
          className="mt-6 w-full border border-bulb bg-bulb py-3.5 text-[12px] tracking-[0.2em] text-tape transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {signingIn ? "CONECTANDO…" : "ENTRAR A LA FUNCIÓN"}
        </button>
        {error && <p className="mt-4 text-[11px] text-rec">{error}</p>}
      </div>
    );
  } else if (game.status === "question" && game.currentQuestionId) {
    const closed = remaining !== null && remaining <= 0;
    body = (
      <div>
        <div className="tape-frame flex items-center justify-between px-5 py-3.5">
          <span className="text-[10px] tracking-[0.2em] text-muted">
            PREGUNTA {game.currentIndex + 1} DE {game.totalQuestions}
          </span>
          <span
            className={`font-cartel text-3xl leading-none tabular-nums ${
              remaining !== null && remaining <= 5 ? "text-rec" : "text-bulb"
            }`}
          >
            {remaining ?? "--"}
          </span>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted">
          {myAnswer !== null
            ? "Respuesta registrada. Mira la pantalla."
            : closed
              ? "Se acabó el tiempo."
              : "Lee la pregunta en la tele y elige aquí 👇"}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {Array.from({ length: game.optionCount }, (_, i) => {
            const style = optionStyle(i);
            const isMine = myAnswer === i;
            const dim = myAnswer !== null && !isMine;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswer(i)}
                disabled={myAnswer !== null || sending || closed}
                aria-label={`Alternativa ${i + 1}`}
                className={`${style.bg} flex aspect-square items-center justify-center text-5xl text-tape transition-all ${
                  dim ? "opacity-25" : "opacity-100"
                } ${isMine ? "ring-4 ring-bone" : ""} disabled:cursor-not-allowed`}
              >
                {style.shape}
              </button>
            );
          })}
        </div>

        {error && <p className="mt-4 text-center text-[11px] text-rec">{error}</p>}
      </div>
    );
  } else if (game.status === "results" && game.lastResult) {
    const style = optionStyle(game.lastResult.correctIndex);
    body = (
      <div className="tape-frame px-6 py-8 text-center">
        {answerForResult === null ? (
          <p className="text-[12px] text-muted">No respondiste esta vez.</p>
        ) : wasCorrect ? (
          <>
            <p className="text-[11px] tracking-[0.25em] text-bulb">CORRECTO</p>
            <p className="mt-5 text-[12px] text-muted">Buen ojo.</p>
          </>
        ) : (
          <>
            <p className="text-[11px] tracking-[0.25em] text-rec">INCORRECTO</p>
            <p className="mt-5 text-[12px] text-muted">La racha se corta aquí.</p>
          </>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-muted">
          <span>Era la</span>
          <span className={`text-2xl ${style.text}`}>{style.shape}</span>
        </div>

        {myScore && (
          <div className="mt-7 border-t border-tape-line pt-6">
            <p className="font-cartel text-4xl leading-none tabular-nums text-bulb">
              {myScore.totalPoints}
            </p>
            <p className="mt-1 text-[10px] tracking-[0.2em] text-muted">
              PUNTOS · PUESTO {myPosition} DE {scores.length}
            </p>
            {myScore.streak > 1 && (
              <p className="mt-2 text-[12px] text-rec">🔥 Racha de {myScore.streak}</p>
            )}
          </div>
        )}
      </div>
    );
  } else if (game.status === "finished") {
    body = (
      <div className="tape-frame px-6 py-8 text-center">
        <p className="text-[11px] tracking-[0.25em] text-bulb">FIN DE LA FUNCIÓN</p>
        <ul className="mt-6 divide-y divide-tape-line text-left">
          {scores.slice(0, 5).map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 py-3">
              <span className="w-6 font-cartel text-xl text-bulb">{i + 1}</span>
              <Avatar photoURL={s.photoURL} name={s.name} size={32} />
              <span className="min-w-0 flex-1 truncate text-[12px] text-bone">{s.name}</span>
              <span className="text-[12px] tabular-nums text-bulb">{s.totalPoints}</span>
            </li>
          ))}
        </ul>
        {myScore && (
          <p className="mt-6 text-[11px] text-muted">
            Terminaste en el puesto {myPosition} con {myScore.totalPoints} puntos.
          </p>
        )}
      </div>
    );
  } else {
    body = (
      <div className="tape-frame px-6 py-12 text-center">
        <p className="text-[11px] tracking-[0.25em] text-bulb">SALA DE ESPERA</p>
        <p className="mt-6 text-[12px] leading-[1.7] text-muted">
          La trivia todavía no empieza. Deja esta pantalla abierta: arranca sola.
        </p>
        {myScore && (
          <p className="mt-6 text-[10px] tracking-[0.2em] text-muted">
            TUS PUNTOS: <span className="text-bulb">{myScore.totalPoints}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <main className="scanlines relative flex min-h-[100svh] flex-col px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <p className="text-[10px] tracking-[0.3em] text-muted">FUNCIÓN ÚNICA · 31 OCT</p>
          <h1 className="chroma-soft mt-2 font-cartel text-2xl uppercase">{EVENT_NAME}</h1>
        </div>

        <div className="mt-8">{body}</div>

        <Link
          href="/"
          className="mt-8 block text-center text-[10px] tracking-[0.2em] text-muted transition-colors hover:text-bulb"
        >
          ← VOLVER AL PROGRAMA
        </Link>
      </div>
    </main>
  );
}
