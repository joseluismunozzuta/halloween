"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Attraction } from "@/components/tape/Attraction";
import { seededRandom } from "@/lib/seeded-random";
import { DISFRACES } from "@/lib/datos-provisionales";
import { PAREJAS } from "@/lib/identidad";

/**
 * Tres categorías, no cuatro: los concursantes son tres parejas y nadie vota a
 * la suya, así que cada quien elige entre dos. Con cuatro categorías y solo dos
 * opciones la votación se vuelve un trámite.
 */
const CATEGORIAS = ["Más terrorífico", "Más original", "Más improvisado"] as const;

export function Disfraces() {
  return (
    <Attraction id="disfraces" number={3} title="Concurso de disfraces">
      {(open) => <Escenario open={open} />}
    </Attraction>
  );
}

function Escenario({ open }: { open: boolean }) {
  const [tocado, setTocado] = useState(false);
  const reventado = open || tocado;

  // Con semilla fija: servidor y cliente calculan la misma salpicadura.
  const { gotas, chorros } = useMemo(() => {
    const rnd = seededRandom(31102026);
    const gotas = Array.from({ length: 28 }, () => {
      const angulo = rnd() * Math.PI * 2;
      const dist = 50 + rnd() * 120;
      return {
        size: 3 + rnd() * 9,
        dx: Math.cos(angulo) * dist,
        dy: Math.sin(angulo) * dist * 0.75 + 40 + rnd() * 60,
        delay: 0.2 + rnd() * 0.12,
      };
    });
    const chorros = [11, 19, 27, 38, 44, 53, 63, 71, 80, 91].map((x, i) => ({
      x: x + (rnd() * 5 - 2.5),
      w: 2 + rnd() * 6.5,
      h: 9 + rnd() * 48,
      dur: 0.8 + rnd() * 1.3,
      delay: 0.26 + i * 0.045,
    }));
    return { gotas, chorros };
  }, []);

  return (
    <>
      <div
        data-popped={reventado}
        className="tape-frame sweep relative mt-4 min-h-0 flex-1"
      >
        {/* Halo de la carpa */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, rgba(200,30,26,.22), transparent 62%)",
          }}
        />

        {/* Fase 1 — el globo. Ocupa el 86% del ancho: a esa escala no es un
            adorno, es un obstáculo, y reventar un obstáculo sí se siente.
            Va en vector porque el recorte real mide 93 px y se pixelaría. */}
        {!reventado && (
          <button
            type="button"
            onClick={() => setTocado(true)}
            aria-label="Reventar el globo"
            className="absolute inset-0 z-10 cursor-pointer"
          >
            <svg
              className="globo absolute left-1/2 top-[42%] w-[86%] drop-shadow-[0_12px_30px_rgba(0,0,0,.65)]"
              viewBox="0 0 200 250"
              aria-hidden
            >
              <defs>
                <radialGradient id="globoFill" cx="36%" cy="27%" r="78%">
                  <stop offset="0%" stopColor="#c86164" />
                  <stop offset="46%" stopColor="#ad4345" />
                  <stop offset="100%" stopColor="#663338" />
                </radialGradient>
              </defs>
              <path d="M100 206c-3 0-6-2-7-5l-4-13h22l-4 13c-1 3-4 5-7 5z" fill="#8e3438" />
              <path
                d="M100 196c-6 10-12 22-6 34 5 10 18 12 22 2"
                stroke="#d8cfc0"
                strokeWidth="2.4"
                fill="none"
                opacity=".75"
                strokeLinecap="round"
              />
              <ellipse cx="100" cy="97" rx="84" ry="93" fill="url(#globoFill)" />
              <ellipse
                cx="68"
                cy="52"
                rx="23"
                ry="31"
                fill="#e6a0a0"
                opacity=".42"
                transform="rotate(-24 68 52)"
              />
            </svg>
            <span className="absolute inset-x-0 bottom-3 text-center text-[9px] tracking-[0.2em] text-muted">
              TOCA EL GLOBO
            </span>
          </button>
        )}

        {/* Fase 2 — la sangre. Los chorretones se quedan. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
          <svg
            className="salpicadura absolute left-1/2 top-[40%] w-[62%]"
            viewBox="0 0 200 170"
          >
            <path
              fill="#9e100c"
              d="M100 14c13-9 24 4 21 17 9-7 22-2 21 10 10 1 15 12 9 20 11 5 11 19 0 24 7 10-1 23-13 21 2 12-10 21-20 15-2 13-17 17-25 7-7 11-23 9-27-3-11 5-23-4-20-16-12 2-21-9-16-20-11-4-13-18-3-24-6-9 0-21 11-21-3-12 8-22 20-17 3-12 19-15 25-4 5-6 14-7 17-9z"
            />
            <circle cx="30" cy="40" r="7" fill="#9e100c" />
            <circle cx="176" cy="60" r="9" fill="#9e100c" />
            <circle cx="46" cy="140" r="6" fill="#9e100c" />
          </svg>

          {gotas.map((g, i) => (
            <span
              key={i}
              className="gota absolute left-1/2 top-[40%] rounded-full"
              style={
                {
                  width: `${g.size}px`,
                  height: `${g.size}px`,
                  "--dx": `${g.dx.toFixed(0)}px`,
                  "--dy": `${g.dy.toFixed(0)}px`,
                  "--delay": `${g.delay.toFixed(2)}s`,
                } as React.CSSProperties
              }
            />
          ))}

          {chorros.map((c, i) => (
            <span
              key={i}
              className="chorro absolute top-[38%]"
              style={
                {
                  left: `${c.x.toFixed(1)}%`,
                  width: `${c.w.toFixed(1)}px`,
                  "--w": `${c.w.toFixed(1)}px`,
                  "--h": `${c.h.toFixed(0)}%`,
                  "--dur": `${c.dur.toFixed(2)}s`,
                  "--delay": `${c.delay.toFixed(2)}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* Fase 3 — el payaso queda en loop con su globito. */}
        <div className="payaso-loop absolute bottom-[31%] left-1/2 z-30 h-1/2 drop-shadow-[0_0_18px_rgba(200,30,26,.45)]">
          <div className="payaso-mece relative h-full aspect-[219/378]">
            <Image
              src="/personajes/it-payaso.webp"
              alt="Pennywise"
              fill
              sizes="200px"
              className="object-contain"
            />
            {/* El globito va en su propio archivo para poder mecerlo aparte.
                Como el recorte perdió la cuerda, se dibuja acá. */}
            <div className="globito-mece absolute left-[53%] top-0 h-[42%] w-[42.5%]">
              <Image
                src="/personajes/it-globo.webp"
                alt=""
                width={93}
                height={84}
                className="h-auto w-full"
              />
              <span
                aria-hidden
                className="absolute left-1/2 top-[62%] block w-px bg-bone/45"
                style={{ height: "78%" }}
              />
            </div>
          </div>
        </div>

        {/* Los casilleros de las fotos */}
        {/* Una foto por pareja, no por persona: son tres disfraces, no seis. */}
        <div
          data-reveal
          style={{ "--reveal-delay": "1s" } as React.CSSProperties}
          className="absolute inset-x-[6%] bottom-[5%] z-40 grid grid-cols-3 gap-1.5"
        >
          {DISFRACES.map((disfraz) => {
            const pareja = PAREJAS.find((p) => p.id === disfraz.parejaId)!;
            return (
              <div
                key={disfraz.parejaId}
                className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-[3px] border border-tape-line bg-tape-deep/90 px-1 text-center"
              >
                <span className="text-base leading-none text-muted" aria-hidden>
                  {disfraz.foto ? "📷" : "+"}
                </span>
                <span className="text-[9px] leading-[1.25] text-muted">{pareja.nombre}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div data-reveal className="mt-4 shrink-0">
        <p className="text-[11px] leading-[1.7] text-muted">
          Una foto por pareja, al llegar. Voto secreto, y nadie vota a su propia
          pareja.
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-chroma-cyan">
          {CATEGORIAS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
