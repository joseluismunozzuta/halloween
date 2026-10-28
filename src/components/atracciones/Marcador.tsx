"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Attraction } from "@/components/tape/Attraction";
import { suscribirAlmas, type Alma } from "@/lib/almas";
import { NOMBRES, TODAS_LAS_PERSONAS } from "@/lib/identidad";

const FUENTES = "disfraces, trivia, supervivencia, mentiras y misiones";

/**
 * El Marcador de Almas: un cementerio.
 *
 * Solo los tres primeros tienen lápida — se ganaron su sitio. Los otros tres
 * quedan penando como fantasmas encima, que además del chiste evita el
 * problema de leer seis nombres diminutos en un celular.
 */
export function Marcador() {
  return (
    <Attraction id="marcador" number={8} title="Marcador de Almas">
      {() => <Cementerio />}
    </Attraction>
  );
}

function Cementerio() {
  const [almas, setAlmas] = useState<Alma[]>([]);

  useEffect(() => suscribirAlmas(setAlmas, () => {}), []);

  // Todos aparecen aunque todavía no tengan puntos: un cementerio con dos
  // lápidas se ve roto, y antes del evento el marcador está en cero.
  const ordenadas = useMemo(() => {
    const porPersona = new Map(almas.map((a) => [a.persona, a.total]));
    return TODAS_LAS_PERSONAS.map((persona) => ({
      persona,
      puntos: porPersona.get(persona) ?? 0,
    })).sort((a, b) => b.puntos - a.puntos);
  }, [almas]);

  const podio = ordenadas.slice(0, 3);
  const penando = ordenadas.slice(3);
  const tope = Math.max(podio[0]?.puntos ?? 0, 1);
  const enCero = ordenadas.every((a) => a.puntos === 0);

  return (
    <>
      <p data-reveal className="mt-3 shrink-0 text-[11px] leading-[1.7] text-muted">
        Todo suma al mismo puntaje: {FUENTES}.
        <br />
        <span className="text-bone">Un solo ganador, a la 1:30.</span>
      </p>

      <div className="relative mt-5 h-[52svh] min-h-[320px] shrink-0 overflow-hidden">
        <ul className="absolute inset-x-0 top-0 z-10 flex justify-around px-2">
          {penando.map((alma, i) => (
            <li
              key={alma.persona}
              className="lapida flex w-[28%] flex-col items-center"
              style={{ "--delay": `${0.5 + i * 0.12}s` } as React.CSSProperties}
            >
              <div
                className="fantasma relative w-[62%] opacity-70"
                style={{ animationDelay: `${i * 0.9}s` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/personajes/ghost.svg" alt="" className="w-full" />
              </div>
              <span className="mt-1 text-[10px] text-bone">{NOMBRES[alma.persona]}</span>
              <span className="text-[10px] tabular-nums text-muted">
                {alma.puntos.toLocaleString("es-PE")}
              </span>
            </li>
          ))}
        </ul>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/4"
          style={{ background: "linear-gradient(to top, rgba(232,228,217,.12), transparent)" }}
        />

        <ol className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-2">
          {podio.map((alma, i) => {
            // 66 % de alto mínimo: por debajo, la lápida del tercero deja de
            // leerse como lápida. Con el marcador en cero van todas iguales.
            const alto = enCero ? 100 : 66 + (alma.puntos / tope) * 34;
            return (
              <li
                key={alma.persona}
                className="lapida relative w-[31%]"
                style={{ "--delay": `${i * 0.13}s` } as React.CSSProperties}
              >
                <span className="mb-1 block text-center text-[11px] tabular-nums text-bulb">
                  {alma.puntos.toLocaleString("es-PE")}
                </span>
                <div className="relative" style={{ height: `${alto}px`, minHeight: "132px" }}>
                  <Image
                    src="/personajes/lapida.webp"
                    alt=""
                    fill
                    sizes="120px"
                    className="object-contain object-bottom"
                  />
                  <div className="absolute inset-x-0 top-[34%] flex flex-col items-center">
                    <span className="font-cartel text-lg leading-none text-[#2b2b30]">
                      {i + 1}
                    </span>
                    <span className="mt-1 max-w-[86%] truncate text-[10px] text-[#2b2b30]">
                      {NOMBRES[alma.persona]}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <p
        data-reveal
        className="mt-4 shrink-0 text-center text-[10px] tracking-[0.2em] text-muted"
      >
        {enCero ? "TODAVÍA NADIE HA MUERTO" : "SEIS ENTRAN · UNO GANA"}
      </p>
    </>
  );
}
