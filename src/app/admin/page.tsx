"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, signInWithGoogle, signOutUser } from "@/lib/firebase";
import { ADMIN_EMAIL } from "@/lib/event-config";

/** Centro de control de la función. Solo para la cuenta del anfitrión. */
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
    return (
      <main className="scanlines relative flex min-h-[100svh] flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-[10px] tracking-[0.25em] text-rec">ACCESO RESTRINGIDO</p>
        <h1 className="font-cartel text-2xl uppercase">Cabina de proyección</h1>
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="border border-bulb px-6 py-3 text-[11px] tracking-[0.2em] text-bulb transition-colors hover:bg-bulb hover:text-tape"
        >
          ENTRAR CON GOOGLE
        </button>
        <Link href="/" className="text-[10px] tracking-[0.2em] text-muted hover:text-bulb">
          ← VOLVER
        </Link>
      </main>
    );
  }

  return (
    <main className="scanlines relative min-h-[100svh] px-6 py-10">
      <div className="mx-auto max-w-lg">
        <h1 className="font-cartel text-2xl uppercase text-bulb">Cabina de proyección</h1>
        <p className="mt-1 text-[11px] text-muted">{user?.email}</p>

        <nav className="mt-7 flex flex-col gap-3">
          <Link
            href="/admin/noche"
            className="border border-tape-line px-5 py-4 transition-colors hover:border-bulb hover:text-bulb"
          >
            <span className="block text-sm">Cabina de la noche</span>
            <span className="mt-1 block text-[11px] text-muted">
              Abrir dinámicas, cerrar votaciones y repartir puntos
            </span>
          </Link>
          <Link
            href="/admin/trivia"
            className="border border-tape-line px-5 py-4 transition-colors hover:border-bulb hover:text-bulb"
          >
            <span className="block text-sm">Control de la trivia</span>
            <span className="mt-1 block text-[11px] text-muted">
              Abrir preguntas, calificar, cerrar la partida
            </span>
          </Link>
          <Link
            href="/proyeccion"
            target="_blank"
            className="border border-tape-line px-5 py-4 transition-colors hover:border-bulb hover:text-bulb"
          >
            <span className="block text-sm">Abrir proyección ↗</span>
            <span className="mt-1 block text-[11px] text-muted">La pantalla de la TV</span>
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => signOutUser()}
          className="mt-8 text-[10px] tracking-[0.2em] text-muted hover:text-rec"
        >
          CERRAR SESIÓN
        </button>
      </div>
    </main>
  );
}
