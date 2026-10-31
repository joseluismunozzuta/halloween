"use client";

import Image from "next/image";
import { NOMBRES, type PersonaId } from "@/lib/identidad";
import type { CasoPublico } from "@/lib/supervivencia-casos";

/**
 * El caso de supervivencia en la televisión.
 *
 * Es la única pantalla de la noche que la gente va a leer entera mientras
 * alguien habla, así que está partida en dos: a la izquierda el villano y el
 * contexto —lo que hay que entender una vez— y a la derecha el objetivo, los
 * objetos y las prohibiciones, que son a lo que el jurado vuelve con la mirada
 * mientras escucha el plan.
 *
 * Lo que NO sale acá es el pliego del jurado. Eso vive en los cinco celulares
 * y nunca en la pared, por razones obvias: el que presenta también mira.
 */
export function CasoBoard({
  persona,
  caso,
}: {
  persona: PersonaId;
  caso: CasoPublico;
}) {
  return (
    <div className="flex flex-1 items-stretch gap-10 py-6">
      <div className="relative hidden w-[26%] shrink-0 lg:block">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(255,31,61,.2), transparent 62%)",
          }}
        />
        <Image
          src={caso.personaje}
          alt=""
          fill
          sizes="26vw"
          className="object-contain object-bottom drop-shadow-[0_0_30px_rgba(255,31,61,.35)]"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-base tracking-[0.3em] text-rec">
          DEFIENDE SU PLAN · {NOMBRES[persona].toUpperCase()}
        </p>
        <h2 className="chroma-soft mt-2 font-cartel text-[clamp(2rem,4.4vw,3.4rem)] leading-none uppercase">
          {caso.nombre}
        </h2>

        <p className="mt-5 max-w-4xl text-[clamp(1.05rem,1.9vw,1.6rem)] leading-snug text-bone">
          {caso.contexto}
        </p>

        <div className="mt-6 border-l-4 border-bulb pl-5">
          <p className="text-sm tracking-[0.25em] text-bulb">TU OBJETIVO</p>
          <p className="mt-1.5 text-[clamp(1.1rem,2vw,1.7rem)] leading-tight text-bone">
            {caso.objetivo}
          </p>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-8 pt-6">
          <div>
            <p className="text-sm tracking-[0.25em] text-chroma-cyan">TIENES</p>
            <ul className="mt-2 space-y-1">
              {caso.tienes.map((cosa) => (
                <li key={cosa} className="text-[clamp(.95rem,1.5vw,1.25rem)] text-bone">
                  {cosa}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm tracking-[0.25em] text-rec">NO PUEDES</p>
            <ul className="mt-2 space-y-1">
              {caso.noPuedes.map((regla) => (
                <li key={regla} className="text-[clamp(.95rem,1.5vw,1.25rem)] text-muted">
                  {regla}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
