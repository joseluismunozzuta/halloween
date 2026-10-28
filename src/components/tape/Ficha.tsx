"use client";

import { useEffect, useRef, useState } from "react";
import type { Ficha } from "@/lib/atracciones";

/**
 * La ficha de la atracción: el cartel que explica de qué va, qué se espera de
 * ti y para qué se hizo.
 *
 * Es una hoja que sube desde abajo, no un cuadro al medio. En un celular la
 * mano llega al borde inferior y no al centro de la pantalla, y así el botón
 * de cerrar queda donde está el pulgar.
 *
 * Va sobre `<dialog>` nativo en vez de un div con z-index: trae gratis el
 * cierre con Esc, el foco atrapado dentro y el resto de la página marcado como
 * inerte para quien usa lector de pantalla. Nada de eso habría que reescribirlo
 * a mano para que una ficha de fiesta sea accesible.
 */
export function FichaAtraccion({ ficha }: { ficha: Ficha }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [abierta, setAbierta] = useState(false);

  // `showModal()` es imperativo: no hay forma declarativa de abrir un <dialog>
  // modal, así que el estado de React y el del elemento se sincronizan acá.
  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (abierta && !el.open) el.showModal();
    if (!abierta && el.open) el.close();
  }, [abierta]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className="flex items-center gap-1.5 border border-blood-line px-2.5 py-1 text-[9px] tracking-[0.18em] text-muted transition-colors hover:border-rec hover:text-rec"
      >
        <span
          aria-hidden
          className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[8px] leading-none"
        >
          ?
        </span>
        DE QUÉ VA
      </button>

      <dialog
        ref={dialogo}
        onClose={() => setAbierta(false)}
        // Cerrar al tocar fuera: el click llega al <dialog> mismo solo cuando
        // cae en el fondo, porque el contenido vive en un hijo.
        onClick={(e) => {
          if (e.target === dialogo.current) setAbierta(false);
        }}
        className="ficha"
        aria-labelledby={`ficha-${ficha.id}`}
      >
        <div className="ficha-hoja">
          <div className="flex items-start justify-between gap-4 border-b border-blood-line px-5 py-4">
            <div>
              <p className="text-[9px] tracking-[0.25em] text-rec">{ficha.cuandoTexto}</p>
              <h2
                id={`ficha-${ficha.id}`}
                className="mt-1.5 font-cartel text-lg uppercase leading-tight text-bone"
              >
                {ficha.titulo}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setAbierta(false)}
              aria-label="Cerrar la ficha"
              className="shrink-0 border border-blood-line px-2.5 py-1 text-[14px] leading-none text-muted transition-colors hover:border-rec hover:text-rec"
            >
              ✕
            </button>
          </div>

          <div className="space-y-5 px-5 py-5">
            <p className="text-[12.5px] leading-[1.65] text-bone">{ficha.queEs}</p>

            <div>
              <p className="text-[9px] tracking-[0.22em] text-rec">QUÉ TIENES QUE HACER</p>
              <ul className="mt-2.5 space-y-2.5">
                {ficha.queHaces.map((paso, i) => (
                  <li key={i} className="flex gap-3 text-[12px] leading-[1.6] text-muted">
                    <span aria-hidden className="shrink-0 font-cartel text-bulb">
                      {i + 1}
                    </span>
                    <span>{paso}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-blood-line pt-4">
              <p className="text-[9px] tracking-[0.22em] text-rec">POR QUÉ ESTÁ EN LA NOCHE</p>
              <p className="mt-2 text-[12px] leading-[1.65] text-muted">{ficha.paraQue}</p>
            </div>
          </div>

          <div className="px-5 pb-6">
            <button
              type="button"
              onClick={() => setAbierta(false)}
              className="btn-sangre w-full"
            >
              Entendido
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
