"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Attraction } from "@/components/tape/Attraction";
import { PedirIdentidad } from "@/components/PedirIdentidad";
import { useSesion } from "@/lib/sesion";
import { NOMBRES, type PersonaId } from "@/lib/identidad";
import { NOCHE_INICIAL, suscribirNoche, type EstadoNoche } from "@/lib/party";
import {
  abrirCaso,
  cambiarCaso,
  miNotaDePlan,
  pliegoDelCaso,
  puntuarPlan,
  suscribirCasos,
  type CasoAsignado,
} from "@/lib/supervivencia";
import { casoDe, type PliegoJurado } from "@/lib/supervivencia-casos";
import { NOTAS } from "@/lib/disfraces";

/**
 * Michael Myers abre la sección de un tajo: el cuchillo cruza, deja la línea
 * del corte, y las dos mitades se van para los lados dejando ver las reglas.
 */
export function Supervivencia() {
  return (
    <Attraction id="supervivencia" number={5} title="Plan de supervivencia">
      {() => (
        <>
          <div className="relative mt-4 h-[26svh] min-h-[150px] shrink-0 overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src="/personajes/michael.webp"
                alt="Michael Myers"
                fill
                sizes="(max-width: 520px) 100vw, 520px"
                className="object-cover object-[center_18%]"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-tape to-transparent"
              />
            </div>

            <div aria-hidden className="pointer-events-none absolute inset-0 z-10 flex">
              <div className="mitad mitad-izq flex-1 border border-tape-line bg-gradient-to-br from-[#1a1410] to-[#0a0806]" />
              <div className="mitad mitad-der flex-1 border border-tape-line bg-gradient-to-bl from-[#1a1410] to-[#0a0806]" />
            </div>

            <span
              aria-hidden
              className="tajo absolute left-[-10%] top-1/2 z-20 h-0.5 w-[120%] bg-bone shadow-[0_0_16px_3px_rgba(255,255,255,.75)]"
            />

            <svg
              aria-hidden
              className="cuchillo absolute -top-16 right-[-14%] z-30 w-[72%]"
              viewBox="0 0 160 40"
            >
              <path d="M10 22h28l96-12c6-1 10 2 11 5 1 4-3 7-9 8l-98 11H10z" fill="#d6dae0" />
              <path d="M38 22l96-12c6-1 10 2 11 5l-107 7z" fill="#f2f5f8" />
              <rect x="0" y="16" width="22" height="13" rx="3" fill="#15100c" />
            </svg>
          </div>

          <div data-reveal className="mt-4 shrink-0">
            <ElCaso />
          </div>
        </>
      )}
    </Attraction>
  );
}

function ElCaso() {
  const { persona } = useSesion();
  const [casos, setCasos] = useState<CasoAsignado[]>([]);
  const [noche, setNoche] = useState<EstadoNoche>(NOCHE_INICIAL);
  const [ocupado, setOcupado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => suscribirCasos(setCasos, () => {}), []);
  useEffect(() => suscribirNoche(setNoche, () => {}), []);

  const mio = persona ? casos.find((c) => c.persona === persona) : undefined;
  const caso = mio ? casoDe(mio.casoId) : undefined;
  const enTurnos = noche.actividadAbierta === "supervivencia";
  const turno = (noche.rondaPlan as PersonaId | null) ?? null;
  const esMiTurno = Boolean(turno && turno === persona);

  async function correr(fn: () => Promise<unknown>) {
    setOcupado(true);
    setError("");
    try {
      await fn();
      setConfirmando(false);
    } catch (err) {
      setError(
        err instanceof Error && err.message === "banco-agotado"
          ? "No quedan casos libres."
          : "No se pudo. Intenta de nuevo."
      );
    } finally {
      setOcupado(false);
    }
  }

  if (!persona) return <PedirIdentidad accion="recibir tu caso" />;

  // Durante los turnos manda lo que pasa en la mesa, no tu propio caso.
  if (enTurnos && turno) {
    return esMiTurno ? (
      <div className="tape-frame px-4 py-5 text-center">
        <p className="text-[9px] tracking-[0.2em] text-rec">TE TOCA</p>
        <p className="mt-3 text-[12px] leading-[1.6] text-bone">
          Tu caso está en la pantalla grande. Dos minutos para defender tu plan.
        </p>
        <p className="mt-3 text-[10px] leading-[1.5] text-muted">
          En algún momento te van a soltar un giro que no viste venir. No lo puedes leer
          desde acá.
        </p>
      </div>
    ) : (
      <Jurado presentador={turno} />
    );
  }

  if (!caso) {
    return (
      <div>
        <p className="text-[11px] leading-[1.7] text-muted">
          Te toca un caso de supervivencia: un asesino, un sitio, cuatro objetos y dos
          minutos para explicar cómo sales vivo. Ábrelo ahora y tienes toda la tarde para
          pensarlo.
        </p>
        <button
          type="button"
          disabled={ocupado}
          onClick={() => correr(() => abrirCaso(persona))}
          className="mt-4 w-full border border-bulb bg-bulb py-3 text-[12px] tracking-[0.2em] text-tape transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {ocupado ? "ABRIENDO…" : "ABRIR MI CASO"}
        </button>
        {error && <p className="mt-2 text-[11px] text-rec">{error}</p>}
      </div>
    );
  }

  return (
    <div className="tape-frame px-4 py-4">
      <p className="text-[9px] tracking-[0.2em] text-rec">TU CASO</p>
      <p className="mt-1.5 font-cartel text-lg uppercase leading-tight text-bulb">
        {caso.nombre}
      </p>

      <p className="mt-3 text-[12px] leading-[1.65] text-bone">{caso.contexto}</p>

      <div className="mt-4 border-t border-tape-line pt-3">
        <p className="text-[9px] tracking-[0.2em] text-chroma-cyan">TU OBJETIVO</p>
        <p className="mt-1.5 text-[12px] leading-[1.5] text-bone">{caso.objetivo}</p>
      </div>

      <div className="mt-3.5">
        <p className="text-[9px] tracking-[0.2em] text-muted">TIENES</p>
        <ul className="mt-1.5 space-y-1">
          {caso.tienes.map((cosa) => (
            <li key={cosa} className="flex gap-2 text-[11.5px] leading-[1.5] text-bone">
              <span aria-hidden className="text-bulb">
                ·
              </span>
              {cosa}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3.5">
        <p className="text-[9px] tracking-[0.2em] text-rec">NO PUEDES</p>
        <ul className="mt-1.5 space-y-1">
          {caso.noPuedes.map((regla) => (
            <li key={regla} className="flex gap-2 text-[11.5px] leading-[1.5] text-muted">
              <span aria-hidden className="text-rec">
                ·
              </span>
              {regla}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 border-t border-tape-line pt-3 text-[10px] leading-[1.5] text-muted">
        Hay salidas que funcionan y los otros cinco las van a tener delante cuando te
        escuchen. Lo que ellos saben y tú no, además, es el giro que te van a soltar a
        mitad de turno.
      </p>

      {!enTurnos &&
        (confirmando ? (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={ocupado}
              onClick={() => correr(() => cambiarCaso(persona))}
              className="flex-1 border border-rec py-2 text-[10px] tracking-[0.15em] text-rec transition-colors hover:bg-rec hover:text-tape disabled:opacity-40"
            >
              {ocupado ? "CAMBIANDO…" : "SÍ, OTRO"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="flex-1 border border-tape-line py-2 text-[10px] tracking-[0.15em] text-muted hover:text-bone"
            >
              ME LO QUEDO
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="mt-3 text-[10px] tracking-[0.15em] text-muted underline-offset-4 hover:text-rec hover:underline"
          >
            NO ME GUSTA, DAME OTRO
          </button>
        ))}

      {error && <p className="mt-2 text-[11px] text-rec">{error}</p>}
    </div>
  );
}

/**
 * El pliego del jurado y la nota.
 *
 * Esto no se le puede mostrar al dueño del caso, y no basta con esconderlo en
 * la pantalla: el pliego vive en una colección que las reglas no le dejan leer
 * a quien tiene ese caso. Si el que presenta abriera esta sección, Firestore
 * le devolvería la nada.
 */
function Jurado({ presentador }: { presentador: PersonaId }) {
  const [pliego, setPliego] = useState<PliegoJurado | null>(null);
  const [nota, setNota] = useState<number | null>(null);
  const [giroALaVista, setGiroALaVista] = useState(false);
  const [casos, setCasos] = useState<CasoAsignado[]>([]);

  useEffect(() => suscribirCasos(setCasos, () => {}), []);

  const casoId = casos.find((c) => c.persona === presentador)?.casoId;
  const caso = casoId ? casoDe(casoId) : undefined;

  useEffect(() => {
    if (!casoId) return;
    let cancelado = false;
    const timeoutId = setTimeout(async () => {
      // Diferido junto con la lectura: tapar el giro de nuevo es parte de
      // cargar el pliego del turno siguiente, no un efecto aparte.
      setGiroALaVista(false);
      const leido = await pliegoDelCaso(casoId);
      if (!cancelado) setPliego(leido);
    }, 0);
    return () => {
      cancelado = true;
      clearTimeout(timeoutId);
    };
  }, [casoId]);

  useEffect(() => {
    let cancelado = false;
    const timeoutId = setTimeout(async () => {
      const previa = await miNotaDePlan(presentador).catch(() => null);
      if (!cancelado) setNota(previa);
    }, 0);
    return () => {
      cancelado = true;
      clearTimeout(timeoutId);
    };
  }, [presentador]);

  return (
    <div className="tape-frame px-4 py-4">
      <p className="text-[9px] tracking-[0.2em] text-chroma-cyan">ERES JURADO</p>
      <p className="mt-1.5 font-cartel text-lg uppercase leading-tight text-bone">
        {NOMBRES[presentador]}
      </p>
      {caso && <p className="mt-1 text-[11px] text-muted">{caso.nombre}</p>}

      {pliego ? (
        <>
          <div className="mt-4 border-t border-tape-line pt-3">
            <p className="text-[9px] tracking-[0.2em] text-bulb">QUÉ TIENE QUE RESOLVER</p>
            <p className="mt-1.5 text-[12px] leading-[1.6] text-bone">{pliego.criterio}</p>
          </div>

          <div className="mt-3.5">
            <p className="text-[9px] tracking-[0.2em] text-muted">SALIDAS QUE FUNCIONAN</p>
            <ul className="mt-1.5 space-y-1">
              {pliego.soluciones.map((s) => (
                <li key={s} className="flex gap-2 text-[11px] leading-[1.5] text-muted">
                  <span aria-hidden className="text-chroma-cyan">
                    ·
                  </span>
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] leading-[1.5] text-rec">{pliego.error}</p>
          </div>

          {/* El giro lo suelta cualquiera del jurado, cuando ya lleva un rato
              defendiendo el plan. Va tapado para que no se lea de reojo antes
              de tiempo. */}
          <div className="mt-4 border border-rec/40 bg-rec/5 px-3 py-3">
            <p className="text-[9px] tracking-[0.2em] text-rec">EL GIRO · LO SUELTAS TÚ</p>
            {giroALaVista ? (
              <p className="mt-2 text-[12px] leading-[1.6] text-bone">{pliego.giro}</p>
            ) : (
              <>
                <p className="mt-1.5 text-[10px] leading-[1.5] text-muted">
                  Espera a que lleve un minuto y suéltaselo en voz alta. Cualquiera de los
                  cinco puede hacerlo: el primero que lo lea, lo dice.
                </p>
                <button
                  type="button"
                  onClick={() => setGiroALaVista(true)}
                  className="mt-2.5 w-full border border-rec py-2 text-[10px] tracking-[0.15em] text-rec transition-colors hover:bg-rec hover:text-tape"
                >
                  VER EL GIRO
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <p className="mt-4 text-[11px] leading-[1.6] text-muted">
          Cargando el pliego…
        </p>
      )}

      <div className="mt-4 border-t border-tape-line pt-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[9px] tracking-[0.2em] text-bulb">TU NOTA AL PLAN</p>
          <span className="font-cartel text-lg leading-none text-bone">{nota ?? "–"}</span>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {NOTAS.map((n) => {
            const elegida = nota === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => {
                  const previa = nota;
                  setNota(n);
                  puntuarPlan(presentador, n).catch(() => setNota(previa));
                }}
                aria-pressed={elegida}
                aria-label={`Ponerle ${n} al plan de ${NOMBRES[presentador]}`}
                className={`flex aspect-square items-center justify-center border text-[12px] transition-colors ${
                  elegida
                    ? "border-bulb bg-bulb text-tape"
                    : "border-tape-line text-bone hover:border-bulb"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] leading-[1.5] text-muted">
          Puedes cambiarla hasta que JL cierre. Nadie ve las notas de nadie.
        </p>
      </div>
    </div>
  );
}
