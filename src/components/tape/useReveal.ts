"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dispara la atracción de una sección cuando entra en la mitad central de la
 * pantalla. Una sola vez por carga: volver a pasar no la repite.
 *
 * Se usa rootMargin en vez de un threshold alto a propósito. Una sección más
 * alta que la ventana NUNCA llega a un ratio de 0.55 —su máximo posible es
 * ventana/sección—, así que un threshold alto no dispararía nunca en las
 * secciones con formularios o listas largas.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Diferido: no se llama setState de forma síncrona dentro del efecto.
    const timeoutId = setTimeout(() => {
      if (reduced) {
        setOpen(true);
        return;
      }
      observer.observe(el);
    }, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setOpen(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-25% 0px -25% 0px", threshold: 0 }
    );

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return { ref, open };
}
