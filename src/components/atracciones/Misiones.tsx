"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Attraction } from "@/components/tape/Attraction";
import { PedirIdentidad } from "@/components/PedirIdentidad";
import { Casete } from "@/components/tape/Casete";
import { useSesion } from "@/lib/sesion";
import { NOMBRES } from "@/lib/identidad";
import { NOCHE_INICIAL, suscribirNoche, type EstadoNoche } from "@/lib/party";
import {
  abrirMision,
  suscribirMiMision,
  suscribirMisiones,
  type MisionAsignada,
} from "@/lib/misiones";

/**
 * Jigsaw entrega la misión. «Quiero jugar un juego» es, literalmente,
 * encargarte una prueba en secreto, así que desplazó a la ouija.
 *
 * La misión llega sellada y se abre una sola vez. Nadie más la ve hasta que el
 * anfitrión abre la revelación, a la 1:30.
 */
export function Misiones() {
  return (
    <Attraction id="misiones" number={2} title="Tu misión secreta">
      {() => <Sobre />}
    </Attraction>
  );
}

function Sobre() {
  const { persona } = useSesion();
  const [mia, setMia] = useState<MisionAsignada | null>(null);
  const [misiones, setMisiones] = useState<MisionAsignada[]>([]);
  const [noche, setNoche] = useState<EstadoNoche>(NOCHE_INICIAL);
  const [abriendo, setAbriendo] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => suscribirNoche(setNoche, () => {}), []);

  const revelacion = noche.actividadAbierta === "misiones";

  // La mía, leída por su id. Escuchar la colección entera acá era el fallo que
  // dejaba el casete en «sin abrir» con la misión ya repartida: las reglas no
  // permiten listar `misiones` hasta la revelación, así que la suscripción
  // moría en silencio y la misión nunca llegaba a la pantalla.
  useEffect(() => {
    if (!persona) return;
    return suscribirMiMision(persona, setMia, () =>
      setError("No se pudo leer tu misión. Recarga la página.")
    );
  }, [persona]);

  // Las seis juntas, solo cuando el anfitrión abre la revelación: antes de eso
  // la consulta se rechaza, y es lo que queremos.
  useEffect(() => {
    if (!revelacion) return;
    return suscribirMisiones(setMisiones, () => {});
  }, [revelacion]);

  async function abrir() {
    if (!persona) return;
    setAbriendo(true);
    setError("");
    try {
      setMia(await abrirMision(persona));
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
            <Casete estado="listo" nombre={mia.nombre} texto={mia.texto} />
          ) : (
            <Casete estado={abriendo ? "girando" : "sellado"} onPlay={abrir} />
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
                  <p className="flex items-baseline justify-between gap-2 text-[10px] text-bulb">
                    {NOMBRES[m.persona]}
                    <span className="font-cartel text-[11px] uppercase text-rec">
                      {m.nombre}
                    </span>
                  </p>
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
