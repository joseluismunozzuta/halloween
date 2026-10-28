"use client";

import Image from "next/image";
import Link from "next/link";
import { Attraction } from "@/components/tape/Attraction";

/**
 * Samara sale del televisor — que es, literalmente, donde va a correr la
 * trivia. Al abrirse la sección la imagen crece y se desborda de su marco:
 * el televisor ya no la contiene.
 */
export function Trivia() {
  return (
    <Attraction id="trivia" number={4} title="Trivia de terror">
      {() => (
        <>
          {/* Alto propio, no flex-1: el bloque de texto de abajo es alto y con
              `flex-1 min-h-0` el televisor se encogía hasta 0 en pantallas
              chicas, dejando a Samara sin dónde renderizarse. */}
          <div className="relative mt-4 h-[42svh] min-h-[240px] shrink-0">
            {/* El televisor. `overflow-visible` es el truco: Samara se sale. */}
            <div className="tape-frame sweep absolute inset-x-6 inset-y-0 overflow-visible">
              <div className="absolute inset-0 overflow-hidden bg-tape-deep">
                <div className="sale-del-tv relative h-full w-full">
                  <Image
                    src="/personajes/samara.webp"
                    alt="Samara saliendo del televisor"
                    fill
                    sizes="(max-width: 520px) 100vw, 520px"
                    className="object-cover object-top"
                  />
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 35%, transparent 30%, rgba(7,7,10,.85) 78%)",
                  }}
                />
              </div>
              {/* Marco del aparato */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-2 border-[6px] border-tape-deep"
              />
            </div>
          </div>

          <div data-reveal className="mt-5 shrink-0">
            <p className="text-[11px] leading-[1.7] text-muted">
              La pregunta y las alternativas van en la tele.
              <br />
              <span className="text-bone">
                En tu celular solo salen cuatro botones de color.
              </span>
            </p>

            <ul className="mt-3 flex gap-2 text-2xl">
              <li className="text-opt-a">▲</li>
              <li className="text-opt-b">◆</li>
              <li className="text-opt-c">●</li>
              <li className="text-opt-d">■</li>
            </ul>

            <p className="mt-3 text-[11px] leading-[1.6] text-muted">
              Responder rápido suma más. Encadenar aciertos suma más todavía. Y si
              eres el único que acierta, los puntos se multiplican por dos.
            </p>

            <Link
              href="/trivia"
              className="mt-5 block border border-bulb bg-bulb py-3.5 text-center text-[12px] tracking-[0.2em] text-tape transition-opacity hover:opacity-90"
            >
              ENTRAR A LA TRIVIA
            </Link>
          </div>
        </>
      )}
    </Attraction>
  );
}
