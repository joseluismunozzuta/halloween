"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ElegirIdentidad } from "@/components/ElegirIdentidad";
import { TapeLoader } from "@/components/tape/TapeLoader";
import { signInWithGoogle } from "@/lib/firebase";
import { useSesion } from "@/lib/sesion";
import { reclamarIdentidad } from "@/lib/identidad-db";
import type { PersonaId } from "@/lib/identidad";

/**
 * Registro de entrada. Aquí cae quien ya entró con Google pero todavía no ha
 * dicho quién es. Si ya lo dijo, no hay nada que hacer y se devuelve al circo.
 */
export default function SoyPage() {
  const router = useRouter();
  const { user, persona, identidades, cargando } = useSesion();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Quien ya tiene identidad no debería volver a elegir.
  useEffect(() => {
    if (!cargando && persona) router.replace("/");
  }, [cargando, persona, router]);

  async function elegir(elegida: PersonaId) {
    setGuardando(true);
    setError("");
    try {
      await reclamarIdentidad(elegida);
      router.replace("/");
    } catch (err) {
      const causa = err instanceof Error ? err.message : "";
      setError(
        causa === "nombre-tomado"
          ? "Alguien se adelantó con ese nombre. Elige otro."
          : causa === "ya-elegiste"
            ? "Esta cuenta ya tiene un nombre."
            : "No se pudo guardar. Intenta de nuevo."
      );
      setGuardando(false);
    }
  }

  if (cargando) return <TapeLoader label="IDENTIFICANDO" />;

  if (!user) {
    return (
      <main className="scanlines relative flex min-h-[100svh] flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-[10px] tracking-[0.25em] text-bulb">REGISTRO DE ENTRADA</p>
        <h1 className="chroma-soft font-cartel text-2xl uppercase">Primero, entra</h1>
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="border border-bulb bg-bulb px-6 py-3 text-[12px] tracking-[0.2em] text-tape transition-opacity hover:opacity-90"
        >
          ENTRAR CON GOOGLE
        </button>
      </main>
    );
  }

  return (
    <ElegirIdentidad
      tomadas={identidades.map((i) => i.persona)}
      guardando={guardando}
      error={error}
      onElegir={elegir}
    />
  );
}
