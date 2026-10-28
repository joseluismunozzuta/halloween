"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Attraction } from "@/components/tape/Attraction";
import { PedirIdentidad } from "@/components/PedirIdentidad";
import { useSesion } from "@/lib/sesion";
import { NOMBRES } from "@/lib/identidad";
import { NOCHE_INICIAL, suscribirNoche, type EstadoNoche } from "@/lib/party";
import { abrirMision, suscribirMisiones, type MisionAsignada } from "@/lib/misiones";

/**
 * Jigsaw entrega la misión. «Quiero jugar un juego» es, literalmente,
 * encargarte una prueba en secreto, así que desplazó a la ouija.
 *
 * La misión llega sellada y se abre una sola vez. Nadie más la ve hasta que el
 * anfitrión abre la revelación, a la 1:30.
 */
export function Misiones() {
  return (
    <Attraction id="misiones" number={5} title="Tu misión secreta">
      {() => <Sobre />}
    </Attraction>
  );
}

function Sobre() {
  const { persona } = useSesion();
  const [misiones, setMisiones] = useState<MisionAsignada[]>([]);
  const [noche, setNoche] = useState<EstadoNoche>(NOCHE_INICIAL);
  const [abriendo, setAbriendo] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => suscribirMisiones(setMisiones, () => {}), []);
  useEffect(() => suscribirNoche(setNoche, () => {}), []);

  const mia = persona ? misiones.find((m) => m.persona === persona) : undefined;
  const revelacion = noche.actividadAbierta === "misiones";

  async function abrir() {
    if (!persona) return;
    setAbriendo(true);
    setError("");
    try {
      await abrirMision(persona);
    } catch (err) {
      setError(
        err instanceof Error && err.message === "banco-agotado"
          ? "No quedan misiones en el banco."
          : "No se pudo abrir el sobre."
      );
    } finally {
      setAbriendo(false);
    }
  }

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

        {/* Billy llega pedaleando desde la izquierda */}
        <div className="triciclo absolute bottom-0 left-0 h-[58%] w-[42%]">
          <Image
            src="/personajes/jigsaw.webp"
            alt="Billy, de Saw"
            fill
            sizes="160px"
            className="object-contain object-bottom drop-shadow-[0_0_16px_rgba(255,31,61,.35)]"
          />
        </div>

        {/* El sobre, a todo el ancho y por encima */}
        <div className="absolute inset-x-0 top-0">
          {!persona ? (
            <div className="tape-frame bg-tape/90 px-4 py-5">
              <PedirIdentidad accion="recibir tu misión" />
            </div>
          ) : mia ? (
            <div className="tape-frame bg-tape/90 px-4 py-5">
              <p className="text-[9px] tracking-[0.2em] text-rec">TU MISIÓN</p>
              <p className="mt-3 text-[12px] leading-[1.6] text-bone">{mia.texto}</p>
              <p className="mt-3 text-[10px] leading-[1.5] text-muted">
                Cúmplela sin que te descubran.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={abrir}
              disabled={abriendo}
              className="tape-frame w-full bg-tape/90 px-4 py-5 text-left transition-colors hover:border-rec disabled:opacity-50"
            >
              <p className="text-[9px] tracking-[0.2em] text-muted">SELLADO</p>
              <p className="mt-3 font-cartel text-[17px] leading-tight uppercase text-bone">
                Quiero jugar un juego
              </p>
              <p className="mt-3 text-[10px] tracking-[0.15em] text-rec">
                {abriendo ? "ABRIENDO…" : "TOCAR PARA ABRIR ▸"}
              </p>
            </button>
          )}
          {error && <p className="mt-2 text-[11px] text-rec">{error}</p>}
        </div>
      </div>

      <div data-reveal className="mt-5 shrink-0">
        {revelacion ? (
          <>
            <p className="text-[10px] tracking-[0.2em] text-bulb">LAS SEIS MISIONES</p>
            <ul className="mt-3 space-y-2">
              {misiones.map((m) => (
                <li key={m.persona} className="border border-tape-line px-3 py-2">
                  <p className="text-[10px] text-bulb">{NOMBRES[m.persona]}</p>
                  <p className="mt-1 text-[11px] leading-[1.5] text-bone">{m.texto}</p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="text-[11px] leading-[1.7] text-muted">
              Cada uno recibe una misión distinta al llegar, y{" "}
              <span className="text-bone">nadie más la ve</span>. Corre toda la noche en
              paralelo a lo demás.
            </p>
            <p className="mt-3 text-[11px] leading-[1.7] text-muted">
              A la 1:30 se revelan todas y el grupo vota quién de verdad cumplió la suya.
            </p>
          </>
        )}
      </div>
    </>
  );
}
