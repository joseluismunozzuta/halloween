"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, signInWithGoogle, signOutUser } from "@/lib/firebase";
import { ADMIN_EMAIL } from "@/lib/event-config";
import { Bulbs } from "@/components/tape/Bulbs";
import { Osd } from "@/components/tape/Osd";

/**
 * Centro de control de la función. Solo para la cuenta del anfitrión.
 *
 * La landing es la cinta; esto es la cabina desde donde se pasa. Por eso no se
 * parece a un panel de administración sino a la chapa de un aparato: paneles
 * rojos con el rótulo pegado al borde, interruptores grandes y el ámbar
 * reservado para lo que está al aire.
 */
export default function AdminPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  if (user === undefined) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center px-6 text-[11px] tracking-[0.25em] text-muted">
        VERIFICANDO CREDENCIALES
      </main>
    );
  }

  if (!isAdmin) {
    return <Puerta conSesion={user !== null} />;
  }

  return (
    <main className="scanlines relative min-h-[100svh] px-5 py-7">
      <div aria-hidden className="carpa-fondo pointer-events-none fixed inset-0" />

      <div className="relative mx-auto max-w-lg">
        <Osd right={user?.email ?? undefined} />

        <header className="marquesina relative mt-3 px-6 py-7 text-center">
          <Bulbs cols={10} rows={3} />
          <p className="relative z-10 text-[10px] tracking-[0.3em] text-rec">
            ENTRADA DE ARTISTAS
          </p>
          <h1 className="chroma-soft relative z-10 mt-2 font-cartel text-[clamp(1.25rem,6.4vw,1.9rem)] leading-[1.1] uppercase text-bone">
            Cabina de proyección
          </h1>
        </header>

        <nav className="mt-6 flex flex-col gap-4">
          <Atajo
            href="/admin/noche"
            titulo="Cabina de la noche"
            detalle="Abrir dinámicas, cerrar votaciones y repartir puntos"
            personaje="/personajes/jigsaw.webp"
          />
          <Atajo
            href="/admin/trivia"
            titulo="Control de la trivia"
            detalle="Abrir preguntas, calificar y cerrar la partida"
            personaje="/personajes/it-payaso.webp"
          />
          <Atajo
            href="/proyeccion"
            titulo="Abrir proyección ↗"
            detalle="Lo que ve la televisión. Déjala en otra pantalla."
            personaje="/personajes/ghostface.webp"
            nuevaPestana
          />
        </nav>

        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-[10px] tracking-[0.2em] text-muted transition-colors hover:text-bulb"
          >
            ← VOLVER AL PROGRAMA
          </Link>
          <button
            type="button"
            onClick={() => signOutUser()}
            className="text-[10px] tracking-[0.2em] text-muted transition-colors hover:text-rec"
          >
            CERRAR SESIÓN
          </button>
        </div>
      </div>
    </main>
  );
}

/**
 * Cada atajo lleva a su monstruo asomado por el borde derecho, con el mismo
 * reparto de la landing: Billy manda las misiones de la noche, Pennywise la
 * función, Ghostface mira desde la pantalla.
 */
function Atajo({
  href,
  titulo,
  detalle,
  personaje,
  nuevaPestana = false,
}: {
  href: string;
  titulo: string;
  detalle: string;
  personaje: string;
  nuevaPestana?: boolean;
}) {
  return (
    <Link
      href={href}
      target={nuevaPestana ? "_blank" : undefined}
      className="panel group relative block overflow-hidden px-5 py-5 transition-colors hover:border-rec"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-3 bottom-0 h-[115%] w-28 opacity-25 transition-opacity duration-300 group-hover:opacity-50"
        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 55%)",
        }}
      >
        <Image src={personaje} alt="" fill sizes="112px" className="object-contain object-bottom" />
      </div>

      <span className="relative block font-cartel text-lg uppercase text-bone transition-colors group-hover:text-rec">
        {titulo}
      </span>
      <span className="relative mt-1.5 block max-w-[72%] text-[11px] leading-relaxed text-muted">
        {detalle}
      </span>
    </Link>
  );
}

/** La puerta cerrada: quien no es el anfitrión no pasa de acá. */
function Puerta({ conSesion }: { conSesion: boolean }) {
  return (
    <main className="scanlines relative flex min-h-[100svh] flex-col items-center justify-center gap-7 px-6 text-center">
      <div aria-hidden className="carpa-fondo pointer-events-none absolute inset-0" />

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-[55%] w-[min(420px,88vw)] -translate-x-1/2 opacity-[0.14]"
        style={{ maskImage: "linear-gradient(180deg, #000 55%, transparent)" }}
      >
        <Image
          src="/personajes/leatherface.webp"
          alt=""
          fill
          sizes="420px"
          className="object-contain object-bottom"
        />
      </div>

      <p className="relative text-[10px] tracking-[0.3em] text-rec">ACCESO RESTRINGIDO</p>
      <h1 className="chroma-soft relative font-cartel text-2xl uppercase text-bone">
        Cabina de proyección
      </h1>
      <p className="relative max-w-xs text-[11px] leading-relaxed text-muted">
        Esta puerta es solo del anfitrión. Si viniste a jugar, la función está
        en el programa.
      </p>

      {!conSesion && (
        <button type="button" onClick={() => signInWithGoogle()} className="btn-sangre relative">
          Entrar con Google
        </button>
      )}

      <Link
        href="/"
        className="relative text-[10px] tracking-[0.2em] text-muted transition-colors hover:text-bulb"
      >
        ← VOLVER AL PROGRAMA
      </Link>
    </main>
  );
}
