"use client";

import Image from "next/image";
import { NOMBRES, type PersonaId } from "@/lib/identidad";

export type FaseMentiras = "frases" | "resultado";

/**
 * Las dos verdades y una mentira, en la TV.
 *
 * Esta vista es la única del sitio pensada para pantalla grande y horizontal:
 * el texto vive acá y los celulares solo mandan el número, así que las frases
 * tienen que leerse desde el sofá. De ahí los tamaños.
 */
export function MentirasBoard({
  autor,
  frases,
  fase = "frases",
  indiceMentira,
  votos,
}: {
  autor: PersonaId;
  frases: readonly [string, string, string];
  fase?: FaseMentiras;
  /** Solo en "resultado". */
  indiceMentira?: number;
  /** Cuántos votaron cada frase. Solo en "resultado". */
  votos?: readonly [number, number, number];
}) {
  return (
    <div className="flex flex-1 items-stretch gap-10 py-6">
      {/* Ghostface, a tamaño de pantalla grande */}
      <div className="relative hidden w-[22%] shrink-0 lg:block">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(46,230,200,.22), transparent 62%)",
          }}
        />
        <Image
          src="/personajes/ghostface.webp"
          alt=""
          fill
          sizes="25vw"
          className="object-contain drop-shadow-[0_0_30px_rgba(46,230,200,.4)]"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-base tracking-[0.3em] text-muted">TURNO DE</p>
        <h2 className="chroma-soft mt-2 font-cartel text-[clamp(2.6rem,6vw,5rem)] leading-none uppercase">
          {NOMBRES[autor]}
        </h2>

        <ol className="mt-8 flex flex-1 flex-col justify-center gap-6">
          {frases.map((frase, i) => {
            const esMentira = fase === "resultado" && indiceMentira === i;
            return (
              <li key={i} className="flex items-start gap-6">
                <span
                  className={`flex h-16 w-16 shrink-0 items-center justify-center border-2 font-cartel text-3xl ${
                    esMentira
                      ? "border-rec bg-rec text-tape"
                      : "border-tape-line text-bulb"
                  }`}
                >
                  {i + 1}
                </span>
                <p
                  className={`min-w-0 flex-1 text-[clamp(1.25rem,2.4vw,2.1rem)] leading-snug ${
                    fase === "resultado" && !esMentira ? "text-muted" : "text-bone"
                  }`}
                >
                  {frase}
                </p>
                {fase === "resultado" && votos && (
                  <span className="shrink-0 self-center font-cartel text-3xl tabular-nums text-bulb">
                    {votos[i]}
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <p className="mt-8 text-lg tracking-[0.25em] text-muted">
          {fase === "frases"
            ? "ELIGE EL NÚMERO DESDE TU CELULAR"
            : `LA MENTIRA ERA LA ${(indiceMentira ?? 0) + 1}`}
        </p>
      </div>
    </div>
  );
}
