"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { EVENT_DATE } from "./event-config";
import { NOCHE_INICIAL, suscribirNoche, type EstadoNoche } from "./party";
import type { Ficha } from "./atracciones";

/**
 * Qué está abierto y qué sigue bajo precinto.
 *
 * Una sola suscripción a `party/live` para todo el sitio: si cada atracción se
 * suscribiera por su cuenta serían nueve escuchas del mismo documento.
 *
 * `empezo` arranca en false y recién se calcula después de montar. Es a
 * propósito: el HTML del servidor no sabe qué hora es en el celular de quien
 * mira, y si lo adivinara, la primera pintura no coincidiría con la del
 * cliente. Cerrado es el valor seguro para esa primera pintura.
 */
type Apertura = {
  noche: EstadoNoche;
  empezo: boolean;
};

const Contexto = createContext<Apertura>({ noche: NOCHE_INICIAL, empezo: false });

export function AperturaProvider({ children }: { children: React.ReactNode }) {
  const [noche, setNoche] = useState<EstadoNoche>(NOCHE_INICIAL);
  const [empezo, setEmpezo] = useState(false);

  useEffect(() => suscribirNoche(setNoche, () => {}), []);

  useEffect(() => {
    const revisar = () => setEmpezo(Date.now() >= EVENT_DATE.getTime());
    revisar();
    // Por si alguien deja la página abierta cruzando las 7:00 pm del 31.
    const id = setInterval(revisar, 30_000);
    return () => clearInterval(id);
  }, []);

  return <Contexto.Provider value={{ noche, empezo }}>{children}</Contexto.Provider>;
}

/**
 * ¿Se puede usar esta atracción?
 *
 * Las de la noche se abren solas cuando empieza la función, y además el
 * anfitrión puede adelantar cualquiera desde la cabina. Las dos vías existen
 * porque el reloj no se olvida pero tampoco se adapta: si la noche se corre, o
 * si hay que probar algo antes, manda la cabina.
 */
export function useApertura(ficha: Ficha | undefined): boolean {
  const { noche, empezo } = useContext(Contexto);
  if (!ficha) return true;
  if (ficha.cuando !== "noche") return true;
  if (empezo) return true;
  return ficha.actividad !== undefined && noche.actividadAbierta === ficha.actividad;
}
