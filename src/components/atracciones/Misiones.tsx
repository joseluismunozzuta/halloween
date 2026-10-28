"use client";

import Image from "next/image";
import { useState } from "react";
import { Attraction } from "@/components/tape/Attraction";
import { MISION_DE_MUESTRA } from "@/lib/datos-provisionales";

/**
 * Jigsaw entrega la misión. «Quiero jugar un juego» es, literalmente,
 * encargarte una prueba en secreto, así que desplazó a la ouija.
 *
 * La misión llega sellada: hay que abrirla. Nadie más la ve, y todas se
 * revelan a la 1:30.
 */
export function Misiones() {
  return (
    <Attraction id="misiones" number={5} title="Tu misión secreta">
      {() => <Sobre />}
    </Attraction>
  );
}

function Sobre() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <div className="relative mt-4 min-h-0 flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 26% 60%, rgba(255,31,61,.2), transparent 60%)",
          }}
        />

        {/* Billy llega pedaleando desde la izquierda. Va al fondo y abajo, con
            el sobre encima a todo el ancho: a 320 px dos columnas no entran. */}
        <div className="triciclo absolute bottom-0 left-0 h-[58%] w-[42%]">
          <Image
            src="/personajes/jigsaw.webp"
            alt="Billy, de Saw"
            fill
            sizes="160px"
            className="object-contain object-bottom drop-shadow-[0_0_16px_rgba(255,31,61,.35)]"
          />
        </div>

        {/* El sobre sellado */}
        <div className="absolute inset-x-0 top-0 flex items-start">
          <button
            type="button"
            onClick={() => setAbierto(true)}
            disabled={abierto}
            className={`tape-frame w-full bg-tape/90 px-4 py-5 text-left backdrop-blur-[2px] transition-colors ${
              abierto ? "cursor-default" : "hover:border-rec"
            }`}
          >
            {abierto ? (
              <>
                <p className="text-[9px] tracking-[0.2em] text-rec">TU MISIÓN</p>
                <p className="mt-3 text-[12px] leading-[1.6] text-bone">
                  {MISION_DE_MUESTRA}
                </p>
                <p className="mt-3 text-[10px] leading-[1.5] text-muted">
                  Cúmplela sin que te descubran.
                </p>
              </>
            ) : (
              <>
                <p className="text-[9px] tracking-[0.2em] text-muted">SELLADO</p>
                <p className="mt-3 font-cartel text-[17px] leading-tight uppercase text-bone">
                  Quiero jugar un juego
                </p>
                <p className="mt-3 text-[10px] tracking-[0.15em] text-rec">TOCAR PARA ABRIR ▸</p>
              </>
            )}
          </button>
        </div>
      </div>

      <div data-reveal className="mt-5 shrink-0">
        <p className="text-[11px] leading-[1.7] text-muted">
          Cada uno recibe una misión distinta al llegar, y <span className="text-bone">nadie
          más la ve</span>. Corre toda la noche en paralelo a lo demás.
        </p>
        <p className="mt-3 text-[11px] leading-[1.7] text-muted">
          A la 1:30 se revelan todas y el grupo vota quién de verdad cumplió la suya.
        </p>
      </div>
    </>
  );
}
