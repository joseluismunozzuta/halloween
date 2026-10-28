"use client";

import Image from "next/image";
import { useState } from "react";
import { Attraction } from "@/components/tape/Attraction";
import { FICHAS_MENTIRA, PERSONAS_PENDIENTES } from "@/lib/datos-provisionales";
import { NOMBRES, TODAS_LAS_PERSONAS } from "@/lib/identidad";

/**
 * Ghostface: la voz al teléfono que miente.
 *
 * Funciona como la trivia, en dos tiempos:
 *  1. **Antes del 31**, cada uno deja sus tres frases —dos verdades y una
 *     mentira— una sola vez, con opción a corregir.
 *  2. **El 31**, cuando ya están las seis, las frases salen EN LA PANTALLA y
 *     el celular solo muestra los números. Por eso acá no se repite el texto:
 *     leerlo en dos sitios parte la atención del grupo.
 */
export function Mentiras() {
  return (
    <Attraction id="mentiras" number={7} title="Dos verdades y una mentira">
      {() => <Ficha />}
    </Attraction>
  );
}

const VACIAS: [string, string, string] = ["", "", ""];

function Ficha() {
  const [frases, setFrases] = useState<[string, string, string]>(VACIAS);
  const [cualMiente, setCualMiente] = useState<number | null>(null);
  const [enviada, setEnviada] = useState(false);
  const [voto, setVoto] = useState<number | null>(null);

  const listas = FICHAS_MENTIRA.length + (enviada ? 1 : 0);
  const total = TODAS_LAS_PERSONAS.length;
  const faltan = PERSONAS_PENDIENTES.filter((p) => !(enviada && p === "jose"));
  const rondaAbierta = listas === total;

  const completa = frases.every((f) => f.trim().length > 2) && cualMiente !== null;

  return (
    <>
      <div className="mt-4 flex shrink-0 items-end gap-4">
        <div className="timbra relative h-40 w-28 shrink-0">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(46,230,200,.26), transparent 64%)",
            }}
          />
          <Image
            src="/personajes/ghostface.webp"
            alt="Ghostface"
            fill
            sizes="120px"
            className="object-contain drop-shadow-[0_0_18px_rgba(46,230,200,.45)]"
          />
        </div>
        <p className="pb-2 text-[11.5px] leading-[1.7] text-muted">
          Tres cosas raras que te pasaron.
          <br />
          <span className="text-bone">Una es mentira.</span>
        </p>
      </div>

      {/* 1 · Tu ficha */}
      <section data-reveal className="mt-6 shrink-0">
        <h3 className="text-[10px] tracking-[0.2em] text-bulb">TUS TRES FRASES</h3>

        {enviada ? (
          <div className="mt-3 border border-tape-line px-3 py-3">
            <p className="text-[11.5px] leading-[1.6] text-bone">
              Listas. Nadie las ve hasta que estemos los seis.
            </p>
            <button
              type="button"
              onClick={() => setEnviada(false)}
              className="mt-3 text-[10px] tracking-[0.15em] text-muted underline-offset-4 hover:text-bulb hover:underline"
            >
              CORREGIRLAS
            </button>
          </div>
        ) : (
          <form
            className="mt-3 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              setEnviada(true);
            }}
          >
            {frases.map((frase, i) => (
              <div key={i} className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => setCualMiente(cualMiente === i ? null : i)}
                  aria-pressed={cualMiente === i}
                  aria-label={`Marcar la frase ${i + 1} como la mentira`}
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border font-cartel text-sm transition-colors ${
                    cualMiente === i
                      ? "border-rec bg-rec text-tape"
                      : "border-tape-line text-muted hover:border-rec hover:text-rec"
                  }`}
                >
                  {i + 1}
                </button>
                <textarea
                  rows={2}
                  value={frase}
                  onChange={(e) => {
                    const copia = [...frases] as [string, string, string];
                    copia[i] = e.target.value;
                    setFrases(copia);
                  }}
                  placeholder={`Frase ${i + 1}`}
                  className="min-w-0 flex-1 resize-none border border-tape-line bg-tape-deep px-2.5 py-2 text-[11.5px] leading-[1.5] text-bone placeholder:text-muted"
                />
              </div>
            ))}

            <p className="pt-1 text-[10px] leading-[1.5] text-muted">
              Toca el número de la que sea <span className="text-rec">mentira</span>. Solo tú
              lo sabes.
            </p>

            <button
              type="submit"
              disabled={!completa}
              className="w-full border border-bulb bg-bulb py-3 text-[12px] tracking-[0.2em] text-tape transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
            >
              GUARDAR MIS FRASES
            </button>
          </form>
        )}

        <p className="mt-3 text-[10px] leading-[1.6] text-muted">
          {listas} de {total} ya las dejaron
          {faltan.length > 0 && (
            <> · faltan {faltan.map((p) => NOMBRES[p]).join(", ")}</>
          )}
        </p>
      </section>

      {/* 2 · La votación */}
      <section data-reveal className="mt-7 shrink-0">
        <h3 className="text-[10px] tracking-[0.2em] text-bulb">PARA VOTAR</h3>
        <p className="mt-2 text-[11px] leading-[1.6] text-muted">
          {rondaAbierta ? (
            <>
              Las frases están <span className="text-bone">en la pantalla</span>. Acá solo
              eliges el número.
            </>
          ) : (
            <>
              Cuando estemos los seis, las frases salen en la pantalla y acá aparecen los
              números. El texto no se repite en el celular.
            </>
          )}
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => {
            const esMio = voto === i;
            return (
              <button
                key={i}
                type="button"
                disabled={!rondaAbierta || voto !== null}
                onClick={() => setVoto(i)}
                aria-label={`Votar que la frase ${i + 1} es la mentira`}
                className={`flex aspect-square items-center justify-center border font-cartel text-4xl transition-all ${
                  esMio
                    ? "border-chroma-cyan bg-chroma-cyan text-tape"
                    : "border-tape-line text-bone"
                } ${voto !== null && !esMio ? "opacity-25" : ""} disabled:cursor-not-allowed disabled:opacity-30`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
