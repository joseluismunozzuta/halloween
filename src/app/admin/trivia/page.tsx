"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, signInWithGoogle } from "@/lib/firebase";
import { ADMIN_EMAIL } from "@/lib/event-config";
import {
  deleteTriviaBank,
  getAllQuestions,
  IDLE_GAME,
  openQuestion,
  resetGame,
  seedTrivia,
  setGameStatus,
  subscribeGame,
  subscribeResponsesFor,
  subscribeScores,
  type GameState,
  type TriviaQuestion,
  type TriviaScore,
} from "@/lib/trivia";
import { gradeQuestion } from "@/lib/trivia-scoring";
import { debeCerrarPregunta } from "@/lib/trivia-cierre";
import { optionStyle } from "@/components/trivia/options";
import { useQuestionTimer } from "@/components/trivia/useQuestionTimer";
import { Avatar } from "@/components/Avatar";

export default function AdminTriviaPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [game, setGame] = useState<GameState>(IDLE_GAME);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [scores, setScores] = useState<TriviaScore[]>([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  // El anfitrión también juega, así que la pregunta en espera va tapada: si la
  // leyera acá la tendría resuelta antes de que aparezca en la televisión.
  const [destapada, setDestapada] = useState(false);
  // Cuántos jugadores hay que esperar antes de cerrar la pregunta sola. null =
  // el número detectado; un número = el anfitrión lo corrigió a mano.
  const [esperadosManual, setEsperadosManual] = useState<number | null>(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const remaining = useQuestionTimer(game.questionStartedAt, game.deadlineSeconds);

  // Quiénes están jugando. No hay lista de inscritos: un documento de puntaje
  // nace al calificar la primera pregunta que alguien responde, así que esto
  // es «los que ya jugaron al menos una pregunta de esta ronda». Vale cero en
  // la primera pregunta, y por eso ahí no hay cierre automático.
  const jugadores = esperadosManual ?? scores.length;

  useEffect(() => {
    if (!isAdmin) return;
    return subscribeGame(setGame);
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    return subscribeScores(setScores);
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    const run = async () => {
      const list = await getAllQuestions();
      if (!cancelled) setQuestions(list);
    };
    const timeoutId = setTimeout(run, 0);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isAdmin, game.status]);

  // Conteo en vivo de cuántos respondieron la pregunta abierta.
  useEffect(() => {
    if (!isAdmin || !game.currentQuestionId) return;
    return subscribeResponsesFor(game.currentQuestionId, (list) =>
      setAnsweredCount(list.length)
    );
  }, [isAdmin, game.currentQuestionId]);

  // useCallback porque el cierre automático depende de esto desde un efecto:
  // si la función se recreara en cada render, el temporizador de gracia se
  // reiniciaría sin parar y la pregunta no se cerraría nunca.
  const run = useCallback(async (label: string, fn: () => Promise<void>) => {
    setBusy(true);
    setStatus("");
    try {
      await fn();
    } catch (err) {
      console.error(label, err);
      setStatus(`Falló: ${label}`);
    } finally {
      setBusy(false);
    }
  }, []);

  async function handleSeed() {
    await run("sembrar el banco", async () => {
      const res = await seedTrivia();
      setStatus(
        res.seeded > 0
          ? `Se sembraron ${res.seeded} preguntas.`
          : `Ya había ${res.alreadyExisted} preguntas — no se duplicó nada.`
      );
      setQuestions(await getAllQuestions());
    });
  }

  async function handleOpen(index: number) {
    const question = questions[index];
    if (!question) return;
    // Cada pregunta nueva vuelve a estar tapada: destapar una no destapa el
    // resto del banco.
    setDestapada(false);
    await run("abrir la pregunta", () =>
      openQuestion(question, index, questions.length)
    );
  }

  const handleGrade = useCallback(async () => {
    const { currentQuestionId, questionStartedAt, deadlineSeconds, optionCount } = game;
    if (!currentQuestionId || !questionStartedAt) return;
    await run("calificar", async () => {
      const summary = await gradeQuestion(
        currentQuestionId,
        deadlineSeconds,
        optionCount,
        questionStartedAt
      );
      setStatus(
        `Calificado: ${summary.correct}/${summary.answered} acertaron` +
          (summary.soloBonusFor ? ` · ¡${summary.soloBonusFor} fue el único, x2!` : "")
      );
    });
  }, [game, run]);

  // Cierre automático: si ya respondieron todos los que están jugando, esperar
  // al cronómetro es tiempo muerto mirando una pregunta resuelta.
  //
  // El candado es por pregunta y se marca ANTES de calificar, no después: sin
  // eso, una respuesta que llegue tarde volvería a disparar el cierre y
  // gradeQuestion correría dos veces. (No duplicaría puntos —lleva registro de
  // lo calificado— pero reescribiría el resultado sin razón.)
  const autoCerrada = useRef<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const questionId = game.currentQuestionId;
    const cerrar = debeCerrarPregunta({
      status: game.status,
      questionId,
      respondieron: answeredCount,
      esperados: jugadores,
      yaCerrada: autoCerrada.current,
      ocupado: busy,
    });
    if (!cerrar || !questionId) return;

    // Medio segundo de gracia para que el último en responder vea su propia
    // elección marcada antes de que la pantalla cambie a resultados.
    const id = setTimeout(() => {
      if (autoCerrada.current === questionId) return;
      autoCerrada.current = questionId;
      void handleGrade();
    }, 500);
    return () => clearTimeout(id);
  }, [
    isAdmin,
    busy,
    game.status,
    game.currentQuestionId,
    jugadores,
    answeredCount,
    handleGrade,
  ]);

  if (user === undefined) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24 text-sm text-muted">
        Verificando credenciales...
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <span className="text-[10px] tracking-[0.25em] text-rec">Acceso restringido</span>
        <h1 className="font-cartel text-2xl text-bone">Control de la trivia</h1>
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="border border-bulb px-6 py-3 text-sm uppercase tracking-widest text-bulb transition-colors hover:bg-bulb hover:text-tape"
        >
          Iniciar sesión con Google
        </button>
        <Link
          href="/admin"
          className="text-xs uppercase tracking-widest text-muted hover:text-bulb"
        >
          ← Cabina
        </Link>
      </main>
    );
  }

  const current = questions[game.currentIndex];
  const isOpen = game.status === "question";
  const timeUp = remaining !== null && remaining <= 0;
  // Una vez que la pregunta está en la televisión ya no hay nada que tapar.
  const visible = isOpen || game.status === "results" || destapada;

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-cartel text-2xl text-bulb">
              Control de la trivia
            </h1>
            <p className="text-sm text-muted">
              Estado: <span className="text-bone">{game.status}</span> ·{" "}
              {questions.length} preguntas en el banco
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/proyeccion"
              target="_blank"
              className="border border-bulb px-4 py-2 text-xs uppercase tracking-widest text-bulb transition-colors hover:bg-bulb hover:text-tape"
            >
              Abrir proyección ↗
            </Link>
            <Link
              href="/admin"
              className="border border-tape-line px-4 py-2 text-xs uppercase tracking-widest text-muted transition-colors hover:border-bulb hover:text-bulb"
            >
              ← Panel
            </Link>
          </div>
        </div>

        {status && <p className="tape-frame px-4 py-3 text-sm text-bulb">{status}</p>}

        <p className="border border-tape-line bg-tape-deep/60 px-4 py-3 text-xs text-muted">
          Los puntajes se calculan en <strong className="text-bone">este</strong>{" "}
          dispositivo. Mantén esta pestaña abierta durante el juego; si se corta la señal al
          calificar, vuelve a tocar &ldquo;Cerrar y calificar&rdquo; — no se duplican puntos.
        </p>

        {questions.length === 0 && (
          <div className="tape-frame px-5 py-6 text-center">
            <p className="text-sm text-muted">
              El banco está vacío. Siembra las preguntas para empezar.
            </p>
            <button
              type="button"
              onClick={handleSeed}
              disabled={busy}
              className="mt-4 border border-bulb px-5 py-2.5 text-xs uppercase tracking-widest text-bulb transition-colors hover:bg-bulb hover:text-tape disabled:opacity-40"
            >
              Sembrar banco
            </button>
          </div>
        )}

        {/* Pregunta en curso */}
        {questions.length > 0 && (
          <div className="tape-frame px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-widest text-muted">
                Pregunta {game.currentIndex + 1} de {questions.length}
              </p>
              {isOpen && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-bone">
                    {jugadores > 0
                      ? `${answeredCount} de ${jugadores} respondieron`
                      : `${answeredCount} respondieron`}
                  </span>
                  <span
                    className={`font-cartel text-3xl leading-none ${
                      timeUp ? "text-rec" : "text-bulb"
                    }`}
                  >
                    {remaining ?? "--"}
                  </span>
                </div>
              )}
            </div>

            {current && !visible && (
              <div className="mt-4 border border-dashed border-tape-line px-4 py-5 text-center">
                <p className="text-sm text-muted">
                  Pregunta tapada para que puedas jugar. Ábrela y léela en la
                  televisión, al mismo tiempo que los demás.
                </p>
                <button
                  type="button"
                  onClick={() => setDestapada(true)}
                  className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted underline hover:text-rec"
                >
                  Destapar (me la spoilea)
                </button>
              </div>
            )}

            {current && visible && (
              <>
                <p className="mt-4 text-lg text-bone">{current.text}</p>
                <ul className="mt-3 space-y-1.5">
                  {current.options.map((opt, i) => {
                    const style = optionStyle(i);
                    const isCorrect =
                      game.status === "results" && game.lastResult?.correctIndex === i;
                    return (
                      <li
                        key={i}
                        className={`flex items-center gap-3 border px-3 py-2 text-sm ${
                          isCorrect
                            ? "border-bulb bg-bulb/10 text-bone"
                            : "border-tape-line text-muted"
                        }`}
                      >
                        <span className={`text-lg ${style.text}`}>{style.shape}</span>
                        <span className="flex-1">{opt}</span>
                        {game.status === "results" && (
                          <span className="text-xs">
                            {game.lastResult?.counts[i] ?? 0}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {!isOpen && (
                <button
                  type="button"
                  onClick={() => handleOpen(game.currentIndex)}
                  disabled={busy || !current}
                  className="border border-bulb bg-bulb px-5 py-2.5 text-xs uppercase tracking-widest text-tape transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Abrir pregunta {game.currentIndex + 1}
                </button>
              )}

              {isOpen && (
                <button
                  type="button"
                  onClick={handleGrade}
                  disabled={busy}
                  className="border border-bulb bg-bulb px-5 py-2.5 text-xs uppercase tracking-widest text-tape transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Cerrar y calificar
                </button>
              )}

              {game.status === "results" && game.currentIndex + 1 < questions.length && (
                <button
                  type="button"
                  onClick={() => handleOpen(game.currentIndex + 1)}
                  disabled={busy}
                  className="border border-bulb px-5 py-2.5 text-xs uppercase tracking-widest text-bulb transition-colors hover:bg-bulb hover:text-tape disabled:opacity-40"
                >
                  Siguiente pregunta →
                </button>
              )}

              {game.status === "results" && (
                <button
                  type="button"
                  onClick={() => run("cerrar el caso", () => setGameStatus("finished"))}
                  disabled={busy}
                  className="border border-tape-line px-5 py-2.5 text-xs uppercase tracking-widest text-muted transition-colors hover:border-bulb hover:text-bulb disabled:opacity-40"
                >
                  Terminar juego
                </button>
              )}
            </div>

            {/* Cuántos hay que esperar para que la pregunta se cierre sola. */}
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-tape-line pt-3 text-[11px] text-muted">
              <span>Se cierra sola cuando respondan</span>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEsperadosManual(Math.max(0, jugadores - 1))}
                  className="border border-tape-line px-2 leading-5 text-muted transition-colors hover:border-bulb hover:text-bulb"
                  aria-label="Esperar a una persona menos"
                >
                  −
                </button>
                <span className="min-w-6 text-center text-sm text-bone">{jugadores}</span>
                <button
                  type="button"
                  onClick={() => setEsperadosManual(jugadores + 1)}
                  className="border border-tape-line px-2 leading-5 text-muted transition-colors hover:border-bulb hover:text-bulb"
                  aria-label="Esperar a una persona más"
                >
                  +
                </button>
              </span>
              <span>
                {jugadores === 0
                  ? "· en cero no se cierra sola; ciérrala tú"
                  : esperadosManual === null
                    ? "· detectados automáticamente"
                    : `· a mano (detectados: ${scores.length})`}
              </span>
              {esperadosManual !== null && (
                <button
                  type="button"
                  onClick={() => setEsperadosManual(null)}
                  className="underline transition-colors hover:text-bulb"
                >
                  volver a automático
                </button>
              )}
            </div>
          </div>
        )}

        {/* Marcador */}
        {scores.length > 0 && (
          <div className="tape-frame divide-y divide-tape-line">
            {scores.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-6 font-cartel text-lg text-bulb">{i + 1}</span>
                <Avatar photoURL={s.photoURL} name={s.name} size={28} />
                <span className="min-w-0 flex-1 truncate text-sm text-bone">{s.name}</span>
                {s.streak > 1 && (
                  <span className="text-xs text-bulb">🔥{s.streak}</span>
                )}
                <span className="text-sm text-bulb">{s.totalPoints}</span>
              </div>
            ))}
          </div>
        )}

        {/* Zona de riesgo */}
        <div className="tape-frame space-y-4 px-5 py-4">
          <div>
            <p className="text-xs text-muted">
              Reiniciar borra respuestas y puntajes, pero conserva el banco. Úsalo entre la
              partida de prueba y la real.
            </p>
            <button
              type="button"
              onClick={() =>
                run("reiniciar", async () => {
                  await resetGame();
                  setStatus("Juego reiniciado: respuestas y puntajes borrados.");
                })
              }
              disabled={busy}
              className="mt-3 border border-tape-line px-4 py-2 text-xs uppercase tracking-widest text-muted transition-colors hover:border-rec hover:text-rec disabled:opacity-40"
            >
              Reiniciar juego
            </button>
          </div>

          <div className="border-t border-tape-line pt-4">
            <p className="text-xs text-muted">
              Recargar el banco borra las preguntas actuales y vuelve a sembrarlas desde el
              código. Úsalo si editaste las preguntas en{" "}
              <span className="text-bone">trivia-bank.ts</span>.
            </p>
            <button
              type="button"
              onClick={() =>
                run("recargar el banco", async () => {
                  await deleteTriviaBank();
                  const res = await seedTrivia();
                  // Deja todo en cero: respuestas viejas de una prueba anterior
                  // apuntarían a preguntas que ya no son las mismas.
                  await resetGame();
                  setQuestions(await getAllQuestions());
                  setStatus(`Banco recargado: ${res.seeded} preguntas, marcador en cero.`);
                })
              }
              disabled={busy}
              className="mt-3 border border-tape-line px-4 py-2 text-xs uppercase tracking-widest text-muted transition-colors hover:border-rec hover:text-rec disabled:opacity-40"
            >
              Recargar banco desde el código
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
