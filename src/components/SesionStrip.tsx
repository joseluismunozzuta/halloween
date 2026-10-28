"use client";

import Link from "next/link";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/firebase";
import { useSesion } from "@/lib/sesion";
import { NOMBRES } from "@/lib/identidad";

/**
 * Estado de sesión, en la voz del visor de la cámara.
 *
 * No es un muro: cualquiera puede recorrer el circo sin entrar. Solo hace
 * falta identificarse para proponer, votar o recibir tu misión, y cada sección
 * lo pide cuando toca.
 */
export function SesionStrip() {
  const { user, persona, cargando } = useSesion();
  const [entrando, setEntrando] = useState(false);

  if (cargando) {
    return <span className="text-[10px] tracking-[0.1em] text-muted">···</span>;
  }

  if (!user) {
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
        className="text-[10px] tracking-[0.15em] text-bulb transition-opacity hover:opacity-80 disabled:opacity-40"
      >
        {entrando ? "CONECTANDO…" : "ENTRAR"}
      </button>
    );
  }

  if (!persona) {
    return (
      <Link href="/soy" className="text-[10px] tracking-[0.15em] text-rec hover:opacity-80">
        ¿QUIÉN ERES? →
      </Link>
    );
  }

  return (
    <span className="text-[10px] tracking-[0.1em] text-muted">
      {NOMBRES[persona].toUpperCase()}
    </span>
  );
}
