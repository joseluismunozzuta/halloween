"use client";

import { useState } from "react";
import { Attraction } from "@/components/tape/Attraction";
import { PELICULAS } from "@/lib/datos-provisionales";

/**
 * El cierre de la noche. Sin personaje: el proyector arranca y tira la
 * votación contra la pared.
 *
 * Frontend con datos de muestra; el voto todavía no se guarda.
 */
export function Pelicula() {
  const [elegida, setElegida] = useState<string | null>(null);

  return (
    <Attraction id="pelicula" number={9} title="La de las 2 am">
      {() => (
        <>
          {/* El haz del proyector: un cono que se abre hacia abajo desde la
              lámpara. Con clip-path en vez de conic-gradient, que no da un
              borde limpio. */}
          <div className="relative mt-5 h-24 shrink-0 overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-x-0 top-2 h-full"
              style={{
                clipPath: "polygon(50% 0%, 96% 100%, 4% 100%)",
                background:
                  "linear-gradient(to bottom, rgba(232,228,217,.26), rgba(232,228,217,.03) 72%, transparent)",
              }}
            />
            <div
              aria-hidden
              className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-bone shadow-[0_0_18px_6px_rgba(232,228,217,.45)]"
            />
          </div>

          <p data-reveal className="shrink-0 text-[11px] leading-[1.7] text-muted">
            Vota ahora. La más votada se pone cuando ya nadie quiera jugar nada.
          </p>

          <ul data-reveal className="mt-4 min-h-0 flex-1 space-y-2">
            {PELICULAS.map((peli) => {
              const esta = elegida === peli.id;
              const total = peli.votos + (esta ? 1 : 0);
              return (
                <li key={peli.id}>
                  <button
                    type="button"
                    onClick={() => setElegida(esta ? null : peli.id)}
                    aria-pressed={esta}
                    className={`flex w-full items-center gap-3 border px-3 py-3 text-left transition-colors ${
                      esta
                        ? "border-bulb bg-bulb/10"
                        : "border-tape-line hover:bg-bone/5"
                    }`}
                  >
                    <span
                      className={`shrink-0 font-cartel text-lg leading-none tabular-nums ${
                        esta ? "text-bulb" : "text-muted"
                      }`}
                    >
                      {total}
                    </span>
                    <span className="min-w-0 flex-1 text-[12px] text-bone">
                      {peli.titulo}{" "}
                      <span className="text-muted">({peli.anio})</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p data-reveal className="mt-4 shrink-0 text-center text-[10px] tracking-[0.2em] text-muted">
            FIN DE LA FUNCIÓN
          </p>
        </>
      )}
    </Attraction>
  );
}
