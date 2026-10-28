"use client";

import { FichaAtraccion } from "@/components/tape/Ficha";
import type { Ficha } from "@/lib/atracciones";

/**
 * El precinto: lo que tapa una atracción que todavía no toca.
 *
 * La sección no se borra, se sella. Detrás sigue viéndose borrosa —el
 * monstruo, el color, la forma— porque la mitad de la gracia de compartir el
 * enlace antes es que se vea lo que viene. Lo que no se puede es usarla, y el
 * contenido va marcado como inerte: ni se toca, ni recibe foco con el teclado,
 * ni lo lee un lector de pantalla.
 *
 * Y la ficha sí se puede abrir con el precinto puesto. Es justo cuando más
 * sirve: todavía no puedes hacer nada, pero ya puedes enterarte de qué va.
 */
export function Precinto({ ficha }: { ficha: Ficha }) {
  return (
    // overflow-hidden para que las cintas se corten en el borde de la sección
    // y no ensanchen la página: van más anchas que ella a propósito.
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden px-5">
      {/* Las dos cintas cruzadas. Decorativas: lo que informa es la placa. */}
      <span aria-hidden className="cinta cinta-a">
        NO PASAR · NO PASAR · NO PASAR · NO PASAR · NO PASAR
      </span>
      <span aria-hidden className="cinta cinta-b">
        NO PASAR · NO PASAR · NO PASAR · NO PASAR · NO PASAR
      </span>

      <div className="pointer-events-auto relative w-full max-w-[300px] border border-blood-line bg-tape/92 px-5 py-6 text-center backdrop-blur-sm">
        <p className="flex items-center justify-center gap-2 text-[9px] tracking-[0.25em] text-rec">
          <span aria-hidden>🔒</span>
          TODAVÍA NO
        </p>
        <p className="mt-3 font-cartel text-base uppercase leading-tight text-bone">
          {ficha.cuandoTexto}
        </p>
        <p className="mt-3 text-[11px] leading-[1.6] text-muted">
          Se abre sola cuando llegue el momento. No tienes que hacer nada.
        </p>
        <div className="mt-4 flex justify-center">
          <FichaAtraccion ficha={ficha} />
        </div>
      </div>
    </div>
  );
}
