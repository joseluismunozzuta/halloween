"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Avatar } from "@/components/Avatar";
import { optionStyle } from "@/components/trivia/options";
import { useQuestionTimer } from "@/components/trivia/useQuestionTimer";
import { getQuestion, type GameState, type TriviaQuestion, type TriviaScore } from "@/lib/trivia";
import type { Inscrito } from "@/lib/trivia-sala";

// Carousel de evidencia fotográfica de la pregunta (daisyUI): avanza solo
// cada 1.5 s y al llegar a la última vuelve a la primera (loop infinito).
// Con una sola imagen no hay nada que rotar; sin imágenes no se renderiza
// (el padre lo omite).
function QuestionCarousel({ urls }: { urls: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    trackRef.current?.scrollTo({ left: 0, behavior: "auto" });
    if (urls.length <= 1) return;

    const id = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      indexRef.current = (indexRef.current + 1) % urls.length;
      track.scrollTo({
        left: indexRef.current * track.clientWidth,
        // El salto de vuelta al inicio va sin animación: un smooth-scroll
        // rebobinando todas las diapositivas se ve mareado en la TV.
        behavior: indexRef.current === 0 ? "auto" : "smooth",
      });
    }, 1500);

    return () => clearInterval(id);
  }, [urls]);

  return (
    <div
      ref={trackRef}
      className="carousel tape-frame mx-auto h-108 w-full max-w-2xl"
    >
      {urls.map((src, i) => (
        <div key={i} className="carousel-item w-full justify-center bg-tape-deep">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-108 w-full object-contain" />
        </div>
      ))}
    </div>
  );
}

/**
 * Etiqueta de estado: el cartel clavado sobre la atracción.
 *
 * Rojo por defecto, que es el color de la carpa. El ámbar queda para lo que
 * está corriendo ahora mismo —el cronómetro—, así que no se gasta en rótulos.
 */
function Rotulo({ children, tone = "rec" }: { children: React.ReactNode; tone?: "bulb" | "rec" }) {
  return (
    <span
      className={`border px-5 py-2 text-sm tracking-[0.25em] ${
        tone === "rec"
          ? "border-rec bg-rec/10 text-rec shadow-[0_0_28px_-10px_var(--rec-red)]"
          : "border-bulb bg-bulb/10 text-bulb"
      }`}
    >
      {children}
    </span>
  );
}

// Tablero de la trivia para la TV: la pregunta y las alternativas se leen acá,
// mientras los celulares solo muestran los botones de color.
export function TriviaBoard({
  game,
  scores,
  sala,
}: {
  game: GameState;
  scores: TriviaScore[];
  sala: Inscrito[];
}) {
  const [question, setQuestion] = useState<TriviaQuestion | null>(null);
  const remaining = useQuestionTimer(game.questionStartedAt, game.deadlineSeconds);

  useEffect(() => {
    const questionId = game.currentQuestionId;
    let cancelled = false;
    const run = async () => {
      if (!questionId) return;
      const q = await getQuestion(questionId);
      if (!cancelled) setQuestion(q);
    };
    const timeoutId = setTimeout(run, 0);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [game.currentQuestionId]);

  // El podio es el mismo cementerio que cierra la landing: una lápida por
  // persona, más alta cuantos más puntos. Repetir el idioma en vez de inventar
  // otro es lo que hace que la televisión y el celular se sientan la misma
  // noche y no dos productos.
  if (game.status === "finished") {
    const [first, second, third] = scores;
    const podio = [
      { s: second, puesto: 2, alto: 300 },
      { s: first, puesto: 1, alto: 400 },
      { s: third, puesto: 3, alto: 240 },
    ];

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8">
        <Rotulo>FIN DE LA FUNCIÓN</Rotulo>

        <ol className="flex w-full max-w-4xl items-end justify-center gap-10">
          {podio.map(({ s, puesto, alto }) =>
            s ? (
              <li key={s.id} className="flex w-[26%] flex-col items-center">
                <Avatar photoURL={s.photoURL} name={s.name} size={puesto === 1 ? 72 : 56} />
                <span className="mt-3 font-cartel text-2xl tabular-nums text-bulb">
                  {s.totalPoints}
                </span>
                <div className="relative mt-2 w-full" style={{ height: alto }}>
                  <Image
                    src="/personajes/lapida.webp"
                    alt=""
                    fill
                    sizes="260px"
                    className="object-contain object-bottom"
                  />
                  {/* Grabado en la piedra: texto oscuro sobre la lápida, no
                      encima de ella. */}
                  <div className="absolute inset-x-0 top-[30%] flex flex-col items-center px-4">
                    <span className="font-cartel text-4xl leading-none text-[#2b2b30]">
                      {puesto}
                    </span>
                    <span className="mt-2 max-w-full truncate text-base text-[#2b2b30]">
                      {s.name.split(" ")[0]}
                    </span>
                  </div>
                </div>
              </li>
            ) : null
          )}
        </ol>

        <p className="text-sm tracking-[0.3em] text-muted">SEIS ENTRAN · UNO GANA</p>
      </div>
    );
  }

  if (game.status === "results" && game.lastResult) {
    const correct = optionStyle(game.lastResult.correctIndex);
    const totalAnswers = game.lastResult.counts.reduce((a, b) => a + b, 0);
    return (
      <div className="flex flex-1 flex-col gap-8 py-6">
        <div className="text-center">
          <p className="text-sm tracking-[0.3em] text-rec">RESPUESTA CORRECTA</p>
          <p className={`mt-4 text-7xl ${correct.text}`}>{correct.shape}</p>
          {question && (
            <p className="mt-4 text-3xl text-bone">
              {question.options[game.lastResult.correctIndex]}
            </p>
          )}
        </div>

        <div className="mx-auto flex w-full max-w-4xl items-end justify-center gap-6">
          {game.lastResult.counts.map((count, i) => {
            const style = optionStyle(i);
            const pct = totalAnswers > 0 ? (count / totalAnswers) * 100 : 0;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-lg tabular-nums text-bone">{count}</span>
                <div
                  className={`${style.bg} w-full transition-all`}
                  style={{ height: `${Math.max(pct * 1.6, 8)}px` }}
                />
                <span className={`text-2xl ${style.text}`}>{style.shape}</span>
              </div>
            );
          })}
        </div>

        <div className="panel mx-auto w-full max-w-2xl px-6 pb-4">
          <span className="rotulo">Marcador de almas</span>
          <ul className="mt-2 divide-y divide-blood-line">
            {scores.slice(0, 5).map((s, i) => (
              <li key={s.id} className="flex items-center gap-4 py-3">
                <span className="w-8 font-cartel text-2xl text-bulb">{i + 1}</span>
                <Avatar photoURL={s.photoURL} name={s.name} size={40} />
                <span className="min-w-0 flex-1 truncate text-xl text-bone">{s.name}</span>
                {s.streak > 1 && <span className="text-lg text-rec">🔥{s.streak}</span>}
                <span className="text-xl tabular-nums text-bulb">{s.totalPoints}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (game.status === "question" && question) {
    const timeUp = remaining !== null && remaining <= 0;
    return (
      <div className="flex flex-1 flex-col gap-5 py-6">
        <div className="flex items-center justify-between gap-6 border-b border-blood-line pb-3">
          <p className="text-sm tracking-[0.3em] text-rec">
            PREGUNTA {game.currentIndex + 1} / {game.totalQuestions}
          </p>
          {/* El cronómetro es lo único ámbar de la pantalla: es lo que está
              corriendo. En los últimos cinco segundos se pone rojo y late. */}
          <span
            className={`font-cartel text-7xl leading-none tabular-nums ${
              timeUp || (remaining !== null && remaining <= 5)
                ? "rec-dot text-rec"
                : "text-bulb"
            }`}
          >
            {remaining ?? "--"}
          </span>
        </div>

        <h2 className="text-center text-4xl leading-tight text-bone lg:text-5xl">
          {question.text}
        </h2>

        {question.imageUrls.length > 0 && <QuestionCarousel urls={question.imageUrls} />}

        <div className="mt-auto grid grid-cols-2 gap-4">
          {question.options.map((opt, i) => {
            const style = optionStyle(i);
            return (
              <div
                key={i}
                className={`${style.bg} flex items-center gap-4 px-6 py-6 text-tape`}
              >
                <span className="text-4xl">{style.shape}</span>
                <span className="text-3xl leading-tight font-bold">{opt}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Antes de empezar, la TV es la lista de inscritos: entrar a /trivia en el
  // celular te pone acá, y es la única señal que tiene el grupo de que su
  // teléfono quedó conectado de verdad.
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <Rotulo>LA FUNCIÓN ESTÁ POR EMPEZAR</Rotulo>

      {sala.length === 0 ? (
        <p className="text-lg text-muted">
          Entra desde tu celular en <span className="text-bone">/trivia</span> y
          aparecerás acá.
        </p>
      ) : (
        <>
          <ul className="flex max-w-5xl flex-wrap justify-center gap-10">
            {sala.map((i) => (
              <li key={i.uid} className="flex w-32 flex-col items-center gap-3">
                <Avatar photoURL={i.photoURL} name={i.name} size={88} />
                <span className="w-full truncate text-center text-xl text-bone">
                  {i.name.split(" ")[0]}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-lg text-muted">
            {sala.length === 1
              ? "1 en la sala · faltan los demás"
              : `${sala.length} en la sala`}
          </p>
        </>
      )}
    </div>
  );
}
