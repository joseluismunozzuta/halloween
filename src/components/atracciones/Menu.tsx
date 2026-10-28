"use client";

import Image from "next/image";
import { useState } from "react";
import { Attraction } from "@/components/tape/Attraction";
import { PLATOS } from "@/lib/datos-provisionales";

/**
 * Leatherface preside la cocina: en su película es el carnicero de la familia,
 * así que la motosierra encima del menú es el chiste correcto.
 *
 * Frontend con datos de muestra. El voto y la propuesta todavía no escriben
 * nada: eso entra con Firestore.
 */
export function Menu() {
  const [votados, setVotados] = useState<Set<string>>(new Set());
  const [propuesta, setPropuesta] = useState("");

  function alternarVoto(id: string) {
    setVotados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const ordenados = [...PLATOS].sort(
    (a, b) => b.votos + (votados.has(b.id) ? 1 : 0) - (a.votos + (votados.has(a.id) ? 1 : 0))
  );

  return (
    <Attraction id="menu" number={2} title="Qué cocinamos">
      {() => (
        <>
          <div className="relative mt-4 flex shrink-0 items-end gap-3">
            <div className="relative h-32 w-24 shrink-0">
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 50% 45%, rgba(255,31,61,.3), transparent 65%)",
                }}
              />
              <Image
                src="/personajes/leatherface.webp"
                alt="Leatherface"
                fill
                sizes="96px"
                className="object-contain drop-shadow-[0_0_14px_rgba(255,31,61,.4)]"
              />
            </div>
            <p className="pb-1 text-[11px] leading-[1.7] text-muted">
              Propone, vota, y sales con
              <br />
              <span className="text-bone">algo que cocinar o que traer.</span>
            </p>
          </div>

          <ul data-reveal className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto">
            {ordenados.map((plato) => {
              const votado = votados.has(plato.id);
              const total = plato.votos + (votado ? 1 : 0);
              return (
                <li key={plato.id} className="border border-tape-line">
                  <button
                    type="button"
                    onClick={() => alternarVoto(plato.id)}
                    aria-pressed={votado}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      votado ? "bg-blood-dark/25" : "hover:bg-bone/5"
                    }`}
                  >
                    <span
                      className={`shrink-0 font-cartel text-lg leading-none tabular-nums ${
                        votado ? "text-rec" : "text-bulb"
                      }`}
                    >
                      {total}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] leading-tight text-bone">
                        {plato.titulo}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-muted">
                        {plato.tipo === "cocinar" ? "COCINAR" : "TRAER"}
                        {plato.asignadoA ? ` · ${plato.asignadoA}` : " · sin asignar"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <form
            data-reveal
            className="mt-3 shrink-0"
            onSubmit={(e) => {
              e.preventDefault();
              setPropuesta("");
            }}
          >
            <label htmlFor="plato-nuevo" className="sr-only">
              Proponer un plato
            </label>
            <div className="flex gap-2">
              <input
                id="plato-nuevo"
                value={propuesta}
                onChange={(e) => setPropuesta(e.target.value)}
                placeholder="Propón un plato…"
                className="min-w-0 flex-1 border border-tape-line bg-tape-deep px-3 py-2.5 text-[12px] text-bone placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={propuesta.trim().length === 0}
                className="shrink-0 border border-bulb px-4 text-[11px] tracking-[0.15em] text-bulb transition-colors hover:bg-bulb hover:text-tape disabled:opacity-35"
              >
                AÑADIR
              </button>
            </div>
          </form>
        </>
      )}
    </Attraction>
  );
}
