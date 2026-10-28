"use client";

import { useReveal } from "@/components/tape/useReveal";
import { FichaAtraccion } from "@/components/tape/Ficha";
import { Precinto } from "@/components/tape/Precinto";
import { buscarFicha } from "@/lib/atracciones";
import { useApertura } from "@/lib/apertura";

/**
 * Una carpa del circo. La regla del sistema: el monstruo no acompaña a la
 * sección, la sección entra POR CULPA del monstruo. Por eso `open` llega como
 * render-prop: cada atracción decide qué hace su personaje al abrirse, y el
 * contenido marcado con `data-reveal` aparece solo cuando toca.
 *
 * Acá viven también las dos cosas que toda sección comparte: el botón que abre
 * su ficha —de qué va, qué se espera de ti, para qué— y el precinto que la
 * sella mientras no sea su momento. Ambas salen del catálogo en
 * `lib/atracciones.ts` buscando por `id`, así que una atracción no tiene que
 * saber nada de esto: le basta con llamarse igual que su ficha.
 */
export function Attraction({
  id,
  number,
  title,
  children,
  className = "",
}: {
  id: string;
  /** Número de atracción en el cartel. Omitir en portada y cierre. */
  number?: number;
  title?: string;
  children: (open: boolean) => React.ReactNode;
  className?: string;
}) {
  const { ref, open } = useReveal<HTMLElement>();
  const ficha = buscarFicha(id);
  const abierta = useApertura(ficha);
  const sellada = Boolean(ficha) && !abierta;

  return (
    <section
      id={id}
      ref={ref}
      data-attraction
      data-open={open}
      className={`relative flex min-h-[100svh] scroll-mt-0 flex-col px-5 py-8 ${className}`}
    >
      {(number !== undefined || title) && (
        <header className="relative z-10 flex shrink-0 items-start justify-between gap-3">
          <div>
            {number !== undefined && (
              <p className="text-[10px] tracking-[0.25em] text-bulb">
                ATRACCIÓN {String(number).padStart(2, "0")}
              </p>
            )}
            {title && (
              <h2 className="mt-2 font-cartel text-[clamp(1.6rem,7vw,2.4rem)] leading-[1.02] uppercase">
                {title}
              </h2>
            )}
          </div>
          {/* La ficha está siempre a mano, sellada o no. Con el precinto puesto
              se repite dentro de la placa, que es donde la va a buscar quien
              acaba de toparse con el candado. */}
          {ficha && (
            <div className="mt-1 shrink-0">
              <FichaAtraccion ficha={ficha} />
            </div>
          )}
        </header>
      )}

      {sellada ? (
        <>
          {/* inert saca todo lo de adentro del alcance del dedo, del teclado y
              del lector de pantalla. No basta con que se vea borroso. */}
          <div inert className="sellado flex min-h-0 flex-1 flex-col">
            {children(open)}
          </div>
          <Precinto ficha={ficha!} />
        </>
      ) : (
        children(open)
      )}
    </section>
  );
}
