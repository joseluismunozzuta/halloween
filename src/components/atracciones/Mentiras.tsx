"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Attraction } from "@/components/tape/Attraction";
import { PedirIdentidad } from "@/components/PedirIdentidad";
import { useSesion } from "@/lib/sesion";
import { NOMBRES, TODAS_LAS_PERSONAS, type PersonaId } from "@/lib/identidad";
import { NOCHE_INICIAL, suscribirNoche, type EstadoNoche } from "@/lib/party";
import {
  guardarFicha,
  miVotoDeLaRonda,
  suscribirFichas,
  suscribirFichasListas,
  votarMentira,
  type Ficha,
} from "@/lib/mentiras";

/**
 * Ghostface: la voz al teléfono que miente.
 *
 * Funciona como la trivia, en dos tiempos:
 *  1. **Antes del 31**, cada uno deja sus tres frases —dos verdades y una
 *     mentira— con opción a corregir mientras la ronda no se abra.
 *  2. **El 31**, las frases salen EN LA PANTALLA y el celular solo manda el
 *     número. Por eso acá no se repite el texto: leerlo en dos sitios parte la
 *     atención del grupo.
 */
export function Mentiras() {
  return (
    <Attraction id="mentiras" number={7} title="Dos verdades y una mentira">
      {() => <Ficha_ />}
    </Attraction>
  );
}

const VACIAS: [string, string, string] = ["", "", ""];

function Ficha_() {
  const { persona } = useSesion();
  const [frases, setFrases] = useState<[string, string, string]>(VACIAS);
  const [cualMiente, setCualMiente] = useState<number | null>(null);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  // Atado a la ronda, no un numero suelto: con seis rondas seguidas, un voto
  // sin dueno se queda pegado de la ronda anterior y bloquea la siguiente.
  const [voto, setVoto] = useState<{ ronda: PersonaId; indice: number } | null>(null);

  const [listas, setListas] = useState<PersonaId[]>([]);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [noche, setNoche] = useState<EstadoNoche>(NOCHE_INICIAL);

  useEffect(() => suscribirFichasListas(setListas, () => {}), []);
  useEffect(() => suscribirFichas(setFichas, () => {}), []);
  useEffect(() => suscribirNoche(setNoche, () => {}), []);

  // Mi ficha, si ya la dejé: las reglas solo me dejan leer la mía antes de que
  // la ronda abra, así que esto no filtra nada de nadie.
  const miFicha = persona ? fichas.find((f) => f.autor === persona) : undefined;
  const yaDeje = persona ? listas.includes(persona) : false;
  const faltan = TODAS_LAS_PERSONAS.filter((p) => !listas.includes(p));
  const rondaAbierta = noche.actividadAbierta === "mentiras";
  const ronda = (noche.rondaMentiras as PersonaId | null) ?? null;
  const esMiTurno = Boolean(ronda && ronda === persona);
  const puedoOpinar = Boolean(persona && ronda && !esMiTurno);
  // Solo cuenta el voto si es de la ronda que esta en pantalla.
  const miVoto = voto && ronda && voto.ronda === ronda ? voto.indice : null;
  const resultado =
    noche.resultadoMentiras && noche.resultadoMentiras.ronda === ronda
      ? noche.resultadoMentiras
      : null;
  const acerte = resultado && miVoto !== null ? miVoto === resultado.indiceMentira : null;

  // Al cambiar de turno, recupero de Firestore si ya voté esta ronda. Hace
  // falta porque el voto vive solo en este celular: si alguien recarga a mitad
  // de la ronda, sin esto la pantalla le ofrecería votar de nuevo y el intento
  // chocaría contra la regla de un voto por ronda, sin explicación visible.
  useEffect(() => {
    if (!ronda || !puedoOpinar) return;
    let cancelado = false;
    const timeoutId = setTimeout(async () => {
      const indice = await miVotoDeLaRonda(ronda).catch(() => null);
      if (!cancelado && indice !== null) setVoto({ ronda, indice });
    }, 0);
    return () => {
      cancelado = true;
      clearTimeout(timeoutId);
    };
  }, [ronda, puedoOpinar]);

  // Al pasar a modo edición, precargo lo que ya estaba escrito.
  useEffect(() => {
    if (!editando || !miFicha) return;
    const timeoutId = setTimeout(() => setFrases(miFicha.frases), 0);
    return () => clearTimeout(timeoutId);
  }, [editando, miFicha]);

  const completa = frases.every((f) => f.trim().length > 2) && cualMiente !== null;
  const mostrandoFormulario = !yaDeje || editando;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!persona || !completa) return;
    setGuardando(true);
    setError("");
    try {
      await guardarFicha(persona, frases, cualMiente!);
      setEditando(false);
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div className="mt-4 flex shrink-0 items-end gap-4">
        <div className="timbra relative h-40 w-28 shrink-0">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(46,230,200,.26), transparent 64%)",
            }}
          />
          <Image
            src="/personajes/ghostface.webp"
            alt="Ghostface"
            fill
            sizes="120px"
            className="object-contain drop-shadow-[0_0_18px_rgba(46,230,200,.45)]"
          />
        </div>
        <p className="pb-2 text-[11.5px] leading-[1.7] text-muted">
          Tres cosas raras que te pasaron.
          <br />
          <span className="text-bone">Una es mentira.</span>
        </p>
      </div>

      {/* 1 · Tu ficha */}
      <section data-reveal className="mt-6 shrink-0">
        <h3 className="text-[10px] tracking-[0.2em] text-bulb">TUS TRES FRASES</h3>

        {!persona ? (
          <div className="mt-3">
            <PedirIdentidad accion="dejar tus frases" />
          </div>
        ) : rondaAbierta && !mostrandoFormulario ? (
          <p className="mt-3 border border-tape-line px-3 py-3 text-[11.5px] leading-[1.6] text-muted">
            La ronda ya empezó: las frases están en la pantalla y ya no se pueden
            corregir.
          </p>
        ) : mostrandoFormulario ? (
          <form className="mt-3 space-y-2" onSubmit={enviar}>
            {frases.map((frase, i) => (
              <div key={i} className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => setCualMiente(cualMiente === i ? null : i)}
                  aria-pressed={cualMiente === i}
                  aria-label={`Marcar la frase ${i + 1} como la mentira`}
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border font-cartel text-sm transition-colors ${
                    cualMiente === i
                      ? "border-rec bg-rec text-tape"
                      : "border-tape-line text-muted hover:border-rec hover:text-rec"
                  }`}
                >
                  {i + 1}
                </button>
                <textarea
                  rows={2}
                  value={frase}
                  maxLength={220}
                  onChange={(e) => {
                    const copia = [...frases] as [string, string, string];
                    copia[i] = e.target.value;
                    setFrases(copia);
                  }}
                  placeholder={`Frase ${i + 1}`}
                  className="min-w-0 flex-1 resize-none border border-tape-line bg-tape-deep px-2.5 py-2 text-[11.5px] leading-[1.5] text-bone placeholder:text-muted"
                />
              </div>
            ))}

            <p className="pt-1 text-[10px] leading-[1.5] text-muted">
              Toca el número de la que sea <span className="text-rec">mentira</span>. Solo
              tú lo sabes: se guarda aparte y ni siquiera se puede leer desde acá.
            </p>

            <button
              type="submit"
              disabled={!completa || guardando}
              className="w-full border border-bulb bg-bulb py-3 text-[12px] tracking-[0.2em] text-tape transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {guardando ? "GUARDANDO…" : "GUARDAR MIS FRASES"}
            </button>
            {error && <p className="text-[11px] text-rec">{error}</p>}
          </form>
        ) : (
          <div className="mt-3 border border-tape-line px-3 py-3">
            <p className="text-[11.5px] leading-[1.6] text-bone">
              Listas. Nadie las ve hasta que estemos los seis.
            </p>
            <button
              type="button"
              onClick={() => {
                setCualMiente(null);
                setEditando(true);
              }}
              className="mt-3 text-[10px] tracking-[0.15em] text-muted underline-offset-4 hover:text-bulb hover:underline"
            >
              CORREGIRLAS
            </button>
          </div>
        )}

        <p className="mt-3 text-[10px] leading-[1.6] text-muted">
          {listas.length} de {TODAS_LAS_PERSONAS.length} ya las dejaron
          {faltan.length > 0 && <> · faltan {faltan.map((p) => NOMBRES[p]).join(", ")}</>}
        </p>
      </section>

      {/* 2 · La votación */}
      <section data-reveal className="mt-7 shrink-0">
        <h3 className="text-[10px] tracking-[0.2em] text-bulb">
          {ronda ? `TURNO DE ${NOMBRES[ronda].toUpperCase()}` : "PARA VOTAR"}
        </h3>

        <p className="mt-2 text-[11px] leading-[1.6] text-muted">
          {!rondaAbierta ? (
            <>
              Cuando estemos los seis, las frases salen en la pantalla y acá aparecen los
              números. El texto no se repite en el celular.
            </>
          ) : !ronda ? (
            <>La ronda está por empezar. Mira la pantalla.</>
          ) : esMiTurno ? (
            <>
              Te toca: tus tres frases están{" "}
              <span className="text-bone">en la pantalla</span> y los demás están votando.
              Tú no votas esta ronda.
            </>
          ) : resultado ? (
            <>
              La mentira era la{" "}
              <span className="text-bone">{resultado.indiceMentira + 1}</span>.
            </>
          ) : miVoto !== null ? (
            <>
              Votaste la <span className="text-bone">{miVoto + 1}</span>. Mira la pantalla.
            </>
          ) : (
            <>
              Las frases están <span className="text-bone">en la pantalla</span>. Acá solo
              eliges el número.
            </>
          )}
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => {
            const esMio = miVoto === i;
            const esLaMentira = resultado?.indiceMentira === i;
            const puedoVotar = rondaAbierta && puedoOpinar && miVoto === null && !resultado;
            return (
              <button
                key={i}
                type="button"
                disabled={!puedoVotar}
                onClick={() => {
                  if (!ronda) return;
                  setVoto({ ronda, indice: i });
                  votarMentira(ronda, i).catch(() => setVoto(null));
                }}
                aria-label={`Votar que la frase ${i + 1} es la mentira`}
                className={`flex aspect-square items-center justify-center border font-cartel text-4xl transition-all ${
                  esLaMentira
                    ? "border-rec bg-rec text-tape"
                    : esMio
                      ? "border-chroma-cyan bg-chroma-cyan text-tape"
                      : "border-tape-line text-bone"
                } ${miVoto !== null && !esMio && !esLaMentira ? "opacity-25" : ""} disabled:cursor-not-allowed disabled:opacity-30`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {acerte !== null && (
          <p className={`mt-2 text-[11px] ${acerte ? "text-bulb" : "text-rec"}`}>
            {acerte ? "La cazaste." : "Te la creíste."}
          </p>
        )}
      </section>
    </>
  );
}
