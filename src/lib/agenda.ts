/** Los bloques de la noche. La hora es local de Lima, en minutos desde medianoche. */
export type AgendaBlock = {
  id: string;
  /** Minutos desde las 00:00 del 31. Pasada medianoche se suma 24 h. */
  startsAt: number;
  label: string;
  title: string;
  detail: string;
  /** Ancla de la atracción que le corresponde, si tiene una. */
  href?: string;
};

const h = (hour: number, min = 0) => hour * 60 + min;

export const AGENDA: AgendaBlock[] = [
  {
    id: "llegada",
    startsAt: h(19),
    label: "7:00 pm",
    title: "Llegada",
    detail: "Abres tu misión secreta y te tomas la foto del disfraz con tu pareja.",
    href: "#misiones",
  },
  {
    id: "supervivencia",
    startsAt: h(20),
    label: "8:00 pm",
    title: "Plan de supervivencia",
    detail: "Tu caso sale en la tele y tienes dos minutos para defender tu plan.",
    href: "#supervivencia",
  },
  {
    id: "cena",
    startsAt: h(21),
    label: "9:00 pm",
    title: "Cena y disfraces",
    detail: "Se come, y mientras tanto cada uno puntúa a las otras dos parejas.",
    href: "#disfraces",
  },
  {
    id: "mentiras",
    startsAt: h(21, 30),
    label: "9:30 pm",
    title: "Dos mentiras y una verdad",
    detail: "Tres cosas raras. Dos las inventaste. Que adivinen cuál pasó.",
    href: "#mentiras",
  },
  {
    id: "trivia",
    startsAt: h(22),
    label: "10:00 pm",
    title: "Trivia de terror",
    detail: "Cuarenta minutos. La pregunta va en la tele, tú respondes desde el celular.",
    href: "#trivia",
  },
  {
    id: "impostor",
    startsAt: h(23),
    label: "11:00 pm",
    title: "Impostor",
    detail: "Sin celulares. Este se juega en la mesa.",
  },
  {
    id: "premiacion",
    startsAt: h(24),
    label: "12:00 am",
    title: "Revelación y premiación",
    detail: "Se revelan las misiones secretas y se cierra el Marcador de Almas.",
    href: "#marcador",
  },
  {
    id: "pelicula",
    startsAt: h(24, 30),
    label: "12:30 am",
    title: "Película de cierre",
    detail: "La que ganó la votación.",
    href: "#pelicula",
  },
];

/**
 * Bloque en curso según la hora de Lima. Devuelve null antes de las 7 pm del 31
 * o una vez terminada la noche.
 *
 * `now` se recibe por parámetro para que el componente decida cuándo leer el
 * reloj: en el servidor la hora sería la del servidor, no la de Lima.
 */
export function currentBlock(now: Date): AgendaBlock | null {
  const lima = limaMinutes(now);
  if (lima === null) return null;

  let found: AgendaBlock | null = null;
  for (const block of AGENDA) {
    if (lima >= block.startsAt) found = block;
  }
  return found;
}

/**
 * Minutos del 31 de octubre en hora de Lima, o null si no es esa noche.
 * Después de medianoche devuelve 24h+ para que el orden de AGENDA se mantenga.
 */
function limaMinutes(now: Date): number | null {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);

  const [year, month, day, hour, minute] = [
    get("year"),
    get("month"),
    get("day"),
    get("hour"),
    get("minute"),
  ];

  if (year !== 2026) return null;
  if (month === 10 && day === 31) return hour * 60 + minute;
  // La madrugada del 1 de noviembre sigue siendo la misma noche: se le suman
  // 24 h para que siga el orden de AGENDA, que cruza la medianoche.
  if (month === 11 && day === 1 && hour < 6) return 24 * 60 + hour * 60 + minute;
  return null;
}
