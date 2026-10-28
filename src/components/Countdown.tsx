"use client";

import { useEffect, useState } from "react";
import { EVENT_DATE } from "@/lib/event-config";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
};

function computeRemaining(): Remaining {
  const diff = EVENT_DATE.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isPast: false,
  };
}

export function Countdown() {
  // null hasta el primer efecto en cliente: evita mismatch de hidratación
  // entre el momento del render en servidor y el del cliente.
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(computeRemaining());
    // setTimeout(0) difiere la primera actualización a una tarea async,
    // en vez de llamar setState de forma síncrona dentro del efecto.
    const timeoutId = setTimeout(tick, 0);
    const intervalId = setInterval(tick, 1000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  if (remaining?.isPast) {
    return (
      <p className="text-center text-[11px] tracking-[0.25em] text-rec">
        LA FUNCIÓN YA EMPEZÓ
      </p>
    );
  }

  const units = [
    { label: "DÍAS", value: remaining?.days },
    { label: "HRS", value: remaining?.hours },
    { label: "MIN", value: remaining?.minutes },
    { label: "SEG", value: remaining?.seconds },
  ];

  return (
    <div
      className="flex items-end justify-between gap-2 border-t border-tape-line pt-3"
      role="timer"
      aria-live="off"
    >
      {units.map((u) => (
        <div key={u.label} className="flex-1 text-center">
          <div className="font-cartel text-[clamp(1.3rem,6vw,1.9rem)] leading-none tabular-nums text-bulb">
            {u.value === undefined ? "--" : String(u.value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[9px] tracking-[0.2em] text-muted">{u.label}</div>
        </div>
      ))}
    </div>
  );
}
