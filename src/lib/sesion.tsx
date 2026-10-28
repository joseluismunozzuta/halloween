"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ADMIN_EMAIL } from "@/lib/event-config";
import { suscribirIdentidades, type Identidad } from "@/lib/identidad-db";
import type { PersonaId } from "@/lib/identidad";

type Sesion = {
  /** undefined mientras Firebase resuelve; null si nadie entró. */
  user: User | null | undefined;
  /** Quién es, una vez que lo eligió en /soy. */
  persona: PersonaId | null;
  /** Todas las identidades reclamadas, para saber qué nombres quedan libres. */
  identidades: Identidad[];
  esAdmin: boolean;
  /** true hasta saber si hay usuario Y si ya tiene identidad. */
  cargando: boolean;
};

const Contexto = createContext<Sesion>({
  user: undefined,
  persona: null,
  identidades: [],
  esAdmin: false,
  cargando: true,
});

export function SesionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [identidades, setIdentidades] = useState<Identidad[]>([]);
  const [identidadesListas, setIdentidadesListas] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  // Las identidades son públicas a propósito: el sitio necesita mostrar nombres
  // de verdad en el marcador y en las parejas, no correos de Google.
  useEffect(
    () =>
      suscribirIdentidades(
        (lista) => {
          setIdentidades(lista);
          setIdentidadesListas(true);
        },
        () => setIdentidadesListas(true)
      ),
    []
  );

  const valor = useMemo<Sesion>(() => {
    const mia = user ? identidades.find((i) => i.uid === user.uid) : undefined;
    return {
      user,
      persona: mia?.persona ?? null,
      identidades,
      esAdmin: user?.email === ADMIN_EMAIL,
      cargando: user === undefined || !identidadesListas,
    };
  }, [user, identidades, identidadesListas]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion() {
  return useContext(Contexto);
}
