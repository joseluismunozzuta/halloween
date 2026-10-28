"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Attraction } from "@/components/tape/Attraction";
import { PedirIdentidad } from "@/components/PedirIdentidad";
import { useSesion } from "@/lib/sesion";
import { NOMBRES } from "@/lib/identidad";
import {
  alternarVotoPlato,
  proponerPlato,
  suscribirPlatos,
  suscribirVotosMenu,
  type Plato,
  type VotoPlato,
} from "@/lib/menu";

/**
 * Leatherface preside la cocina: en su película es el carnicero de la familia,
 * así que la motosierra encima del menú es el chiste correcto.
 *
 * Los votos son públicos y se cuentan acá: decidir qué se cocina no necesita
 * urna secreta, y así nadie tiene que "cerrar" la votación.
 */
export function Menu() {
  return (
    <Attraction id="menu" number={2} title="Qué cocinamos">
      {() => <Carta />}
    </Attraction>
  );
}

function Carta() {
  const { persona, cargando } = useSesion();
  const [platos, setPlatos] = useState<Plato[] | null>(null);
  const [votos, setVotos] = useState<VotoPlato[]>([]);
  const [error, setError] = useState(false);
  const [propuesta, setPropuesta] = useState("");
  const [tipo, setTipo] = useState<Plato["tipo"]>("cocinar");
  const [enviando, setEnviando] = useState(false);

  useEffect(
    () =>
      suscribirPlatos(
        (lista) => {
          setPlatos(lista);
          setError(false);
        },
        () => {
          setPlatos([]);
          setError(true);
        }
      ),
    []
  );

  useEffect(() => suscribirVotosMenu(setVotos, () => {}), []);

  const ordenados = useMemo(() => {
    const cuenta = new Map<string, number>();
    const mios = new Set<string>();
    for (const voto of votos) {
      cuenta.set(voto.platoId, (cuenta.get(voto.platoId) ?? 0) + 1);
      if (persona && voto.persona === persona) mios.add(voto.platoId);
    }
    return (platos ?? [])
      .map((plato) => ({
        ...plato,
        votos: cuenta.get(plato.id) ?? 0,
        votadoPorMi: mios.has(plato.id),
      }))
      .sort((a, b) => b.votos - a.votos || a.titulo.localeCompare(b.titulo));
  }, [platos, votos, persona]);

  const miTarea = ordenados.find((p) => p.asignadoA === persona);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!persona || propuesta.trim().length === 0) return;
    setEnviando(true);
    try {
      await proponerPlato(propuesta, tipo, persona);
      setPropuesta("");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="relative mt-4 flex shrink-0 items-end gap-3">
        <div className="relative h-32 w-24 shrink-0">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(255,31,61,.3), transparent 65%)",
            }}
          />
          <Image
            src="/personajes/leatherface.webp"
            alt="Leatherface"
            fill
            sizes="96px"
            className="object-contain drop-shadow-[0_0_14px_rgba(255,31,61,.4)]"
          />
        </div>
        <p className="pb-1 text-[11px] leading-[1.7] text-muted">
          Propone, vota, y sales con
          <br />
          <span className="text-bone">algo que cocinar o que traer.</span>
        </p>
      </div>

      {miTarea && (
        <p
          data-reveal
          className="mt-4 shrink-0 border border-bulb bg-bulb/10 px-3 py-2.5 text-[11.5px] leading-[1.5]"
        >
          <span className="text-bulb">Te toca:</span>{" "}
          <span className="text-bone">{miTarea.titulo}</span>
        </p>
      )}

      <ul data-reveal className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
        {platos === null && (
          <li className="py-6 text-center text-[11px] tracking-[0.2em] text-muted">
            CARGANDO LA CARTA
          </li>
        )}

        {platos !== null && ordenados.length === 0 && (
          <li className="border border-tape-line px-3 py-6 text-center text-[11px] leading-[1.6] text-muted">
            {error
              ? "No se pudo leer la carta todavía."
              : "La carta está vacía. Propón el primero."}
          </li>
        )}

        {ordenados.map((plato) => (
          <li key={plato.id} className="border border-tape-line">
            <button
              type="button"
              disabled={!persona}
              onClick={() => alternarVotoPlato(plato.id, persona!, plato.votadoPorMi)}
              aria-pressed={plato.votadoPorMi}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                plato.votadoPorMi ? "bg-blood-dark/25" : "enabled:hover:bg-bone/5"
              } disabled:cursor-default`}
            >
              <span
                className={`shrink-0 font-cartel text-lg leading-none tabular-nums ${
                  plato.votadoPorMi ? "text-rec" : "text-bulb"
                }`}
              >
                {plato.votos}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] leading-tight text-bone">
                  {plato.titulo}
                </span>
                <span className="mt-0.5 block text-[10px] text-muted">
                  {plato.tipo === "cocinar" ? "COCINAR" : "TRAER"}
                  {plato.asignadoA
                    ? ` · ${NOMBRES[plato.asignadoA]}`
                    : " · sin asignar"}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div data-reveal className="mt-3 shrink-0">
        {cargando ? null : persona ? (
          <form onSubmit={enviar}>
            <label htmlFor="plato-nuevo" className="sr-only">
              Proponer un plato
            </label>
            <div className="flex gap-2">
              <input
                id="plato-nuevo"
                value={propuesta}
                onChange={(e) => setPropuesta(e.target.value)}
                maxLength={150}
                placeholder="Propón un plato…"
                className="min-w-0 flex-1 border border-tape-line bg-tape-deep px-3 py-2.5 text-[12px] text-bone placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={propuesta.trim().length === 0 || enviando}
                className="shrink-0 border border-bulb px-4 text-[11px] tracking-[0.15em] text-bulb transition-colors hover:bg-bulb hover:text-tape disabled:opacity-35"
              >
                AÑADIR
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              {(["cocinar", "traer"] as const).map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  onClick={() => setTipo(opcion)}
                  aria-pressed={tipo === opcion}
                  className={`flex-1 border px-3 py-1.5 text-[10px] tracking-[0.15em] transition-colors ${
                    tipo === opcion
                      ? "border-bulb text-bulb"
                      : "border-tape-line text-muted hover:text-bone"
                  }`}
                >
                  {opcion.toUpperCase()}
                </button>
              ))}
            </div>
          </form>
        ) : (
          <PedirIdentidad accion="proponer y votar platos" />
        )}
      </div>
    </>
  );
}
