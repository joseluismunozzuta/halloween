"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bulbs } from "@/components/tape/Bulbs";
import { Osd } from "@/components/tape/Osd";
import { Countdown } from "@/components/Countdown";
import { SesionStrip } from "@/components/SesionStrip";
import { EVENT_PLACE, GUESTS } from "@/lib/event-config";

const ART = "/personajes/art.webp";

/**
 * La cinta llega mal sintonizada y el cartel es ilegible. Arrastrar el control
 * de tracking baja el ruido y lo enfoca.
 *
 * Es un arrastre y no un clic a propósito: nace del propio tema en vez de
 * estar pegado encima, y en celular el arrastre es táctil de nacimiento.
 */
export function Portada() {
  const [tune, setTune] = useState(0.16);
  // `tocado` se pinta (el aviso desaparece), así que es estado. El ref es su
  // espejo para que el bucle de rAF lea el valor al vuelo sin re-renderizar.
  const [tocado, setTocado] = useState(false);
  const tocadoRef = useRef(false);
  const railRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const marcarTocado = useCallback(() => {
    tocadoRef.current = true;
    setTocado(true);
  }, []);

  const setFromPointer = useCallback((clientX: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const rect = rail.getBoundingClientRect();
    const next = (clientX - rect.left) / rect.width;
    setTune(Math.min(1, Math.max(0, next)));
  }, []);

  // Si nadie la toca, la cinta termina por encontrar la señal sola. Sin esto,
  // quien no entienda el gesto se queda con el nombre del sitio ilegible.
  useEffect(() => {
    let raf = 0;
    const start = setTimeout(() => {
      if (tocadoRef.current) return;
      const t0 = performance.now();
      const from = 0.16;
      const step = (now: number) => {
        if (tocadoRef.current) return;
        const p = Math.min(1, (now - t0) / 1600);
        setTune(from + (1 - from) * p);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, 5000);

    return () => {
      clearTimeout(start);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Sin movimiento: la cinta ya viene enfocada.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        marcarTocado();
        setTune(1);
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [marcarTocado]);

  const noise = (1 - tune) * 0.92 + 0.06;
  const offset = (1 - tune) * 7;
  const focused = tune > 0.93;

  function onKeyDown(event: React.KeyboardEvent) {
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowUp"
        ? 0.1
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? -0.1
          : event.key === "Home"
            ? -1
            : event.key === "End"
              ? 1
              : 0;
    if (delta === 0) return;
    event.preventDefault();
    marcarTocado();
    setTune((t) => Math.min(1, Math.max(0, t + delta)));
  }

  return (
    <section
      id="portada"
      className="scanlines relative flex min-h-[100svh] flex-col px-5 py-6"
    >
      <Osd right={<SesionStrip />} />

      {/* El escenario: Art el payaso, que además de ser el mejor archivo que
          tenemos es, literalmente, un payaso de circo. */}
      <div
        className="tape-frame sweep grain relative mt-3 min-h-0 flex-1"
        style={{
          filter: `contrast(${(0.62 + tune * 0.58).toFixed(2)}) saturate(${(0.3 + tune * 0.88).toFixed(2)})`,
        }}
      >
        <Image
          src={ART}
          alt=""
          fill
          priority
          sizes="(max-width: 520px) 100vw, 520px"
          className="object-cover object-top"
        />

        {/* Bandas que saltan. Es la única sección con esta técnica, que duplica
            la imagen: en el resto del sitio se usa solo el barrido. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
          <div className="tape-slice tape-slice-a absolute inset-0">
            <Image src={ART} alt="" fill sizes="(max-width: 520px) 100vw, 520px" className="object-cover object-top" />
          </div>
          <div className="tape-slice tape-slice-b absolute inset-0">
            <Image src={ART} alt="" fill sizes="(max-width: 520px) 100vw, 520px" className="object-cover object-top" />
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 bg-tape-deep"
          style={{ opacity: noise }}
        />

        <Bulbs cols={9} rows={5} />
      </div>

      {/* Control de tracking */}
      <div className="mt-3 shrink-0">
        <div className="flex items-center justify-between text-[9px] tracking-[0.18em] text-muted">
          <span>TRACKING</span>
          <span aria-hidden>{focused ? "ENFOCADO" : `${Math.round(tune * 100)}%`}</span>
        </div>
        <div
          ref={railRef}
          role="slider"
          tabIndex={0}
          aria-label="Sintonizar la cinta"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(tune * 100)}
          aria-valuetext={focused ? "Enfocado" : `${Math.round(tune * 100)} por ciento`}
          onKeyDown={onKeyDown}
          onPointerDown={(e) => {
            dragging.current = true;
            marcarTocado();
            e.currentTarget.setPointerCapture(e.pointerId);
            setFromPointer(e.clientX);
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            e.preventDefault();
            setFromPointer(e.clientX);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          className="relative mt-1.5 h-8 cursor-ew-resize touch-none border border-tape-line"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(232,228,217,.16) 0 1px, transparent 1px 9px)",
          }}
        >
          <span
            aria-hidden
            className="absolute -top-1 h-10 w-[18px] rounded-[2px] bg-bone shadow-[0_0_12px_rgba(46,230,200,.75)]"
            style={{ left: `${tune * 100}%`, marginLeft: `${-tune * 18}px` }}
          >
            <span className="absolute left-1/2 top-3 h-4 w-px -translate-x-1/2 bg-tape" />
          </span>
        </div>
        {!tocado && (
          <p className="mt-1.5 text-center text-[9px] tracking-[0.18em] text-muted">
            ARRASTRA PARA SINTONIZAR
          </p>
        )}
      </div>

      {/* El cartel */}
      <h1
        className="mt-4 shrink-0 font-cartel text-[clamp(2.1rem,11vw,3.4rem)] leading-[0.92] uppercase"
        style={{
          textShadow: `-${offset.toFixed(1)}px 0 0 rgba(255,0,168,.9), ${offset.toFixed(1)}px 0 0 rgba(46,230,200,.9)`,
          filter: `blur(${((1 - tune) * 2.6).toFixed(2)}px)`,
          opacity: 0.45 + tune * 0.55,
        }}
      >
        Circo del
        <br />
        Terror
      </h1>

      <div className="mt-3 shrink-0 text-[11px] leading-[1.7] text-chroma-cyan">
        <p>19:00:00</p>
        <p className="text-bone uppercase">{EVENT_PLACE}</p>
        <p>{GUESTS.length} SUJETOS · FUNCIÓN ÚNICA</p>
      </div>

      <div className="mt-4 shrink-0">
        <Countdown />
      </div>
    </section>
  );
}
