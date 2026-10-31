"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Attraction } from "@/components/tape/Attraction";
import { PedirIdentidad } from "@/components/PedirIdentidad";
import { useSesion } from "@/lib/sesion";
import { NOMBRES, TODAS_LAS_PERSONAS, type PersonaId } from "@/lib/identidad";
import { miVotoPlan, votarPlan } from "@/lib/supervivencia";

const PASOS = [
  "Elige tus tres villanos.",
  "Dos minutos para explicar cómo los vencerías.",
  "El grupo vota el plan más convincente.",
  "Los puntos van al Marcador de Almas.",
];

/**
 * Michael Myers abre la sección de un tajo: el cuchillo cruza, deja la línea
 * del corte, y las dos mitades se van para los lados dejando ver las reglas.
 */
export function Supervivencia() {
  return (
    <Attraction id="supervivencia" number={6} title="Plan de supervivencia">
      {() => (
        <>
          <div className="relative mt-4 min-h-0 flex-1 overflow-hidden">
            {/* Debajo de las mitades: lo que el tajo deja ver.
                Apilado, no en dos columnas: a 320 px una columna de lista de
                54 % deja renglones de tres palabras. */}
            <div className="absolute inset-0 flex flex-col">
              <div className="relative min-h-0 flex-1">
                <Image
                  src="/personajes/michael.webp"
                  alt="Michael Myers"
                  fill
                  sizes="(max-width: 520px) 100vw, 520px"
                  className="object-cover object-[center_22%]"
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-tape to-transparent"
                />
              </div>
              <ol className="shrink-0 space-y-2 px-1 pb-1 pt-2">
                {PASOS.map((paso, i) => (
                  <li key={paso} className="flex gap-2.5 text-[11.5px] leading-[1.5]">
                    <span className="shrink-0 text-rec">{i + 1}</span>
                    <span className="text-bone">{paso}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Las dos mitades que tapan, hasta que el cuchillo pasa */}
            <div aria-hidden className="pointer-events-none absolute inset-0 z-10 flex">
              <div className="mitad mitad-izq flex-1 border border-tape-line bg-gradient-to-br from-[#1a1410] to-[#0a0806]" />
              <div className="mitad mitad-der flex-1 border border-tape-line bg-gradient-to-bl from-[#1a1410] to-[#0a0806]" />
            </div>

            {/* La línea del corte */}
            <span
              aria-hidden
              className="tajo absolute left-[-10%] top-1/2 z-20 h-0.5 w-[120%] bg-bone shadow-[0_0_16px_3px_rgba(255,255,255,.75)]"
            />

            {/* El cuchillo */}
            <svg
              aria-hidden
              className="cuchillo absolute -top-16 right-[-14%] z-30 w-[72%]"
              viewBox="0 0 160 40"
            >
              <path d="M10 22h28l96-12c6-1 10 2 11 5 1 4-3 7-9 8l-98 11H10z" fill="#d6dae0" />
              <path d="M38 22l96-12c6-1 10 2 11 5l-107 7z" fill="#f2f5f8" />
              <rect x="0" y="16" width="22" height="13" rx="3" fill="#15100c" />
            </svg>
          </div>

          <div data-reveal className="mt-5 shrink-0">
            <p className="text-[11px] leading-[1.7] text-muted">
              La gracia no es tener razón. Es defender un plan absurdo con cara seria
              durante dos minutos.
            </p>
            <Votacion />
          </div>
        </>
      )}
    </Attraction>
  );
}

/**
 * El voto al mejor plan, cuando ya pasaron los seis turnos.
 *
 * Vive en el celular y no en la tele por lo mismo que el resto de las
 * votaciones de la noche: un voto que se canta en voz alta arrastra al que
 * vota después.
 */
function Votacion() {
  const { persona } = useSesion();
  const [voto, setVoto] = useState<PersonaId | null>(null);

  // Mi voto ya puesto, por si recargó el celular.
  useEffect(() => {
    if (!persona) return;
    let cancelado = false;
    const timeoutId = setTimeout(async () => {
      const previo = await miVotoPlan().catch(() => null);
      if (!cancelado && previo) setVoto(previo);
    }, 0);
    return () => {
      cancelado = true;
      clearTimeout(timeoutId);
    };
  }, [persona]);

  if (!persona) {
    return (
      <div className="mt-4">
        <PedirIdentidad accion="votar el mejor plan" />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-[10px] tracking-[0.2em] text-bulb">EL PLAN MÁS CONVINCENTE</p>
      <p className="mt-2 text-[11px] leading-[1.6] text-muted">
        Cuando hayan pasado los seis, vota. No puedes votarte a ti mismo y puedes
        cambiarlo hasta que se cierre.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {TODAS_LAS_PERSONAS.filter((p) => p !== persona).map((quien) => {
          const elegido = voto === quien;
          return (
            <button
              key={quien}
              type="button"
              onClick={() => {
                const previo = voto;
                setVoto(quien);
                votarPlan(quien).catch(() => setVoto(previo));
              }}
              aria-pressed={elegido}
              className={`border px-2 py-2.5 text-[11px] transition-colors ${
                elegido
                  ? "border-bulb bg-bulb text-tape"
                  : "border-tape-line text-bone hover:border-bulb"
              }`}
            >
              {NOMBRES[quien]}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[10px] leading-[1.5] text-muted">
        El cronómetro corre en la tele. Nadie ve los votos hasta que JL cierre.
      </p>
    </div>
  );
}
