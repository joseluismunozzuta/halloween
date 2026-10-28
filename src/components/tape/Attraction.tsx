"use client";

import { useReveal } from "@/components/tape/useReveal";

/**
 * Una carpa del circo. La regla del sistema: el monstruo no acompaña a la
 * sección, la sección entra POR CULPA del monstruo. Por eso `open` llega como
 * render-prop: cada atracción decide qué hace su personaje al abrirse, y el
 * contenido marcado con `data-reveal` aparece solo cuando toca.
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

  return (
    <section
      id={id}
      ref={ref}
      data-attraction
      data-open={open}
      className={`relative flex min-h-[100svh] scroll-mt-0 flex-col px-5 py-8 ${className}`}
    >
      {(number !== undefined || title) && (
        <header className="relative z-10 shrink-0">
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
        </header>
      )}

      {children(open)}
    </section>
  );
}
