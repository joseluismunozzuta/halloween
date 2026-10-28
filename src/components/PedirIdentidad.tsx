"use client";

import Link from "next/link";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/firebase";
import { useSesion } from "@/lib/sesion";

/**
 * Lo que ve una sección cuando hace falta saber quién eres.
 *
 * No bloquea el recorrido: el circo se puede mirar entero sin entrar. Esto
 * aparece solo donde hay que escribir algo —proponer, votar, subir una foto—
 * y distingue los dos casos, que son distintos: no haber entrado con Google,
 * y haber entrado pero no haber elegido todavía quién eres.
 */
export function PedirIdentidad({ accion }: { accion: string }) {
  const { user } = useSesion();
  const [entrando, setEntrando] = useState(false);

  if (user) {
    return (
      <Link
        href="/soy"
        className="block border border-rec px-4 py-3 text-center text-[11px] leading-[1.5] text-rec transition-colors hover:bg-rec hover:text-tape"
      >
        Elige quién eres para {accion} →
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        setEntrando(true);
        try {
          await signInWithGoogle();
        } finally {
          setEntrando(false);
        }
      }}
      disabled={entrando}
      className="w-full border border-bulb px-4 py-3 text-[11px] leading-[1.5] text-bulb transition-colors hover:bg-bulb hover:text-tape disabled:opacity-40"
    >
      {entrando ? "CONECTANDO…" : `Entra con Google para ${accion}`}
    </button>
  );
}
