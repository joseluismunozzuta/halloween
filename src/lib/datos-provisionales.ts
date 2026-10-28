import type { ParejaId, PersonaId } from "@/lib/identidad";

/**
 * Datos de muestra para armar el frontend.
 *
 * TODO: cuando entre Firestore, esto se reemplaza por las colecciones `dishes`,
 * `dishVotes` y `movies` descritas en el documento de diseño. La forma de los
 * tipos es a propósito la misma, para que el cambio sea solo de origen.
 */

export type Plato = {
  id: string;
  titulo: string;
  tipo: "cocinar" | "traer";
  propuestoPor: string;
  votos: number;
  asignadoA: string | null;
};

export const PLATOS: Plato[] = [
  {
    id: "d1",
    titulo: "Dedos de bruja (salchipapa con uñas de almendra)",
    tipo: "cocinar",
    propuestoPor: "Alexandra",
    votos: 5,
    asignadoA: "Alexandra",
  },
  {
    id: "d2",
    titulo: "Pizza con pepperoni en forma de murciélago",
    tipo: "cocinar",
    propuestoPor: "Marcelo",
    votos: 4,
    asignadoA: "Marcelo",
  },
  {
    id: "d3",
    titulo: "Ponche sangriento",
    tipo: "traer",
    propuestoPor: "Victor",
    votos: 4,
    asignadoA: "Victor",
  },
  {
    id: "d4",
    titulo: "Ojos de monstruo (huevos rellenos)",
    tipo: "cocinar",
    propuestoPor: "Caro",
    votos: 3,
    asignadoA: "Caro",
  },
  {
    id: "d5",
    titulo: "Hielo y vasos",
    tipo: "traer",
    propuestoPor: "Mar",
    votos: 3,
    asignadoA: "Mar",
  },
  {
    id: "d6",
    titulo: "Galletas de lápida",
    tipo: "cocinar",
    propuestoPor: "JL",
    votos: 2,
    asignadoA: null,
  },
];

export type Pelicula = {
  id: string;
  titulo: string;
  anio: number;
  votos: number;
};

export const PELICULAS: Pelicula[] = [
  { id: "m1", titulo: "Terrifier", anio: 2016, votos: 2 },
  { id: "m2", titulo: "Hereditary", anio: 2018, votos: 3 },
  { id: "m3", titulo: "La Masacre de Texas", anio: 1974, votos: 1 },
  { id: "m4", titulo: "Scream", anio: 1996, votos: 4 },
];

export const MISION_DE_MUESTRA =
  "Logra que dos personas se cambien de asiento sin pedírselo.";

// ── Concurso de disfraces: una foto por pareja, no una por persona ──
export type Disfraz = {
  parejaId: ParejaId;
  /** null mientras no hayan subido la suya. */
  foto: string | null;
  subidaPor: PersonaId | null;
};

export const DISFRACES: Disfraz[] = [
  { parejaId: "p1", foto: null, subidaPor: null },
  { parejaId: "p2", foto: null, subidaPor: null },
  { parejaId: "p3", foto: null, subidaPor: null },
];

// ── Dos verdades y una mentira ──
export type FichaMentira = {
  autor: PersonaId;
  frases: [string, string, string];
};

/** Quién ya dejó sus tres frases. El resto todavía debe. */
export const FICHAS_MENTIRA: FichaMentira[] = [
  {
    autor: "caroline",
    frases: [
      "Se me apagaron todas las luces de la casa a la misma hora, tres noches seguidas.",
      "Dormí en un hostal donde el cuarto de al lado llevaba dos años cerrado con candado.",
      "Vi pasar a alguien por el pasillo y cuando fui a ver no había nadie en toda la casa.",
    ],
  },
  {
    autor: "victor",
    frases: [
      "Me quedé encerrado en un ascensor con la luz apagada veinte minutos.",
      "Encontré una foto mía en una casa donde nunca había estado.",
      "Mi perro le ladraba todas las noches al mismo rincón vacío.",
    ],
  },
];

export const PERSONAS_PENDIENTES: PersonaId[] = ["jose", "mar", "marcelo", "alexandra"];

// ── Marcador de Almas ──
export type Alma = {
  persona: PersonaId;
  puntos: number;
};

export const ALMAS: Alma[] = [
  { persona: "alexandra", puntos: 4820 },
  { persona: "marcelo", puntos: 4310 },
  { persona: "jose", puntos: 3950 },
  { persona: "mar", puntos: 3640 },
  { persona: "victor", puntos: 2980 },
  { persona: "caroline", puntos: 2510 },
];
