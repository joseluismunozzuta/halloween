"use client";

import { useState } from "react";
import { NOMBRES, PAREJAS, type PersonaId } from "@/lib/identidad";

/**
 * Lo primero que ve alguien la primera vez que entra. Elige quién es, y eso
 * queda atado a su cuenta de Google para siempre.
 *
 * Se muestran las tres parejas, no los seis nombres sueltos: deja claro de un
 * vistazo que la app te está preguntando por tu lugar en una pareja, que es lo
 * que necesita para el concurso de disfraces.
 */
export function ElegirIdentidad({
  tomadas = [],
  onElegir,
}: {
  /** Nombres que otra cuenta ya reclamó. Llegan de Firestore. */
  tomadas?: readonly PersonaId[];
  onElegir?: (persona: PersonaId) => void;
}) {
  const [elegida, setElegida] = useState<PersonaId | null>(null);

  return (
    <main className="scanlines grain relative flex min-h-[100svh] flex-col justify-center px-5 py-10">
      <div className="mx-auto w-full max-w-[420px]">
        <p className="text-[10px] tracking-[0.3em] text-bulb">REGISTRO DE ENTRADA</p>
        <h1 className="chroma-soft mt-2 font-cartel text-[clamp(1.8rem,9vw,2.6rem)] leading-[0.95] uppercase">
          ¿Quién eres?
        </h1>
        <p className="mt-3 text-[11.5px] leading-[1.7] text-muted">
          Se elige una sola vez y queda guardado. La app necesita saberlo para
          armar las parejas del concurso de disfraces y para llevar tu puntaje.
        </p>

        <div className="mt-7 space-y-5">
          {PAREJAS.map((pareja) => (
            <fieldset key={pareja.id}>
              <legend className="mb-2 text-[10px] tracking-[0.2em] text-muted">
                {pareja.nombre.toUpperCase()}
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {pareja.integrantes.map((persona) => {
                  const ocupada = tomadas.includes(persona);
                  const esta = elegida === persona;
                  return (
                    <button
                      key={persona}
                      type="button"
                      disabled={ocupada}
                      onClick={() => setElegida(persona)}
                      className={`border px-3 py-3.5 text-[13px] transition-colors ${
                        esta
                          ? "border-bulb bg-bulb text-tape"
                          : ocupada
                            ? "cursor-not-allowed border-tape-line text-muted line-through opacity-50"
                            : "border-tape-line text-bone hover:border-bulb hover:text-bulb"
                      }`}
                    >
                      {NOMBRES[persona]}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <button
          type="button"
          disabled={elegida === null}
          onClick={() => elegida && onElegir?.(elegida)}
          className="mt-7 w-full border border-bulb bg-bulb py-3.5 text-[12px] tracking-[0.2em] text-tape transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
        >
          {elegida ? `SOY ${NOMBRES[elegida].toUpperCase()}` : "ELIGE TU NOMBRE"}
        </button>

        <p className="mt-4 text-center text-[10px] leading-[1.6] text-muted">
          ¿Te equivocaste? JL puede liberar tu nombre desde la cabina.
        </p>
      </div>
    </main>
  );
}
