"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Attraction } from "@/components/tape/Attraction";
import { AGENDA, currentBlock, type AgendaBlock } from "@/lib/agenda";

/**
 * Chucky hace de maestro de ceremonias: presenta el programa de la noche y
 * los reflectores se encienden uno por uno sobre cada hora.
 */
export function Agenda() {
  const [actual, setActual] = useState<AgendaBlock | null>(null);

  useEffect(() => {
    // La hora se lee solo en cliente: en el servidor sería la del servidor, no
    // la de Lima, y además rompería la hidratación.
    const tick = () => setActual(currentBlock(new Date()));
    const timeoutId = setTimeout(tick, 0);
    const intervalId = setInterval(tick, 30_000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <Attraction id="agenda" number={1} title="El programa">
      {() => (
        <>
          <div className="relative mt-4 flex shrink-0 items-end gap-3">
            <div className="relative h-32 w-24 shrink-0">
              <Image
                src="/personajes/chucky.webp"
                alt="Chucky, maestro de ceremonias"
                fill
                sizes="96px"
                className="object-contain"
              />
            </div>
            <p className="pb-1 text-[11px] leading-[1.7] text-muted">
              Siete horas de función.
              <br />
              <span className="text-bone">Seis entran. Uno gana.</span>
            </p>
          </div>

          <ol className="mt-5 min-h-0 flex-1 space-y-0">
            {AGENDA.map((bloque, i) => {
              const esAhora = actual?.id === bloque.id;
              return (
                <li
                  key={bloque.id}
                  className="reflector border-b border-tape-line py-3 last:border-b-0"
                  style={{ "--delay": `${i * 0.11}s` } as React.CSSProperties}
                >
                  <div className="flex items-baseline gap-3">
                    <span
                      className={`w-[68px] shrink-0 text-[11px] tabular-nums ${
                        esAhora ? "text-rec" : "text-bulb"
                      }`}
                    >
                      {bloque.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm text-bone">
                        {bloque.href ? (
                          <a href={bloque.href} className="hover:text-bulb">
                            {bloque.title}
                          </a>
                        ) : (
                          bloque.title
                        )}
                        {esAhora && (
                          <span className="shrink-0 text-[9px] tracking-[0.2em] text-rec">
                            ◀ AHORA
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-[11px] leading-[1.6] text-muted">
                        {bloque.detail}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </Attraction>
  );
}
