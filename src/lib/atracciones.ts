/**
 * La ficha de cada atracción: qué es, qué se espera de ti, para qué se hizo y
 * cuándo se abre.
 *
 * Vive en un solo archivo porque es lo que más se va a editar y porque el
 * objetivo es que nadie tenga que explicar nada por el grupo: si algo no se
 * entiende en la noche, se arregla acá.
 *
 * `cuando` decide si la sección se puede usar:
 *
 * - `siempre`: no hay nada que bloquear (la agenda, por ejemplo).
 * - `antes`:   se usa desde ya, antes del 31.
 * - `noche`:   se desbloquea cuando empieza la función, o antes si el anfitrión
 *              abre esa dinámica desde la cabina.
 *
 * Nada de esto es seguridad: es para que nadie toque algo a destiempo. Lo que
 * de verdad protege los votos y las claves son las reglas de Firestore.
 */
export type Cuando = "siempre" | "antes" | "noche";

export type Ficha = {
  id: string;
  /** Cómo se llama en la ficha. Puede diferir del título de la sección. */
  titulo: string;
  cuando: Cuando;
  /**
   * La dinámica de la cabina que también la abre, si la hay. Deja que el
   * anfitrión adelante una sección sin esperar al reloj.
   */
  actividad?: "mentiras" | "misiones" | "disfraces" | "supervivencia" | "trivia";
  /** Cuándo se usa, en una línea. Se muestra también en el precinto. */
  cuandoTexto: string;
  queEs: string;
  /** Lo que se espera de cada uno. Frases cortas, en segunda persona. */
  queHaces: string[];
  /** Por qué existe esta dinámica. */
  paraQue: string;
};

export const FICHAS: Ficha[] = [
  {
    id: "agenda",
    titulo: "La agenda de la noche",
    cuando: "siempre",
    cuandoTexto: "Siempre a la vista",
    queEs:
      "El plan del 31, hora por hora, desde que llegas hasta la película del final.",
    queHaces: [
      "Mírala antes de venir para saber a qué hora pasa cada cosa.",
      "Durante la noche se resalta sola la hora que está corriendo.",
    ],
    paraQue:
      "Para que nadie tenga que preguntar qué sigue, y para que puedas calcular a qué hora llegas sin perderte nada.",
  },
  {
    id: "disfraces",
    titulo: "Concurso de disfraces, en pareja",
    cuando: "noche",
    actividad: "disfraces",
    cuandoTexto: "El 31, al llegar",
    queEs:
      "Vienen disfrazados en pareja. Cada pareja sube una foto y después todos puntúan del 1 al 10.",
    queHaces: [
      "Ponte de acuerdo con tu pareja y vengan disfrazados. Eso es lo único que hay que preparar antes.",
      "Al llegar, suben una foto juntos desde el celular.",
      "Ves la foto de las otras dos parejas a pantalla completa y le mueves el punto del 1 al 10 a cada una. La tuya no se puntúa, y puedes cambiar la nota hasta que se cierre.",
    ],
    paraQue:
      "No es ganar o nada: cada pareja se lleva su promedio convertido en puntos, así que un 8 vale más que un 6. Y esa foto va a ser el recuerdo de la noche.",
  },
  {
    id: "trivia",
    titulo: "Trivia de terror",
    cuando: "noche",
    actividad: "trivia",
    cuandoTexto: "10:00 pm · la abre el anfitrión",
    queEs:
      "Un Kahoot de terror moderno. La pregunta sale en la televisión y tú respondes desde el celular.",
    queHaces: [
      "Entra desde tu celular y deja la pantalla abierta: aparecerás en la sala de espera, en la tele.",
      "Lee la pregunta en la pantalla grande y toca uno de los cuatro botones de color antes de que acabe el tiempo.",
      "No hace falta ser experto: hay preguntas fáciles y difíciles, y responder rápido suma más.",
    ],
    paraQue:
      "Es la dinámica más larga de la noche. Aporta al marcador según tu puesto final y no según tus puntos, para que no decida ella sola quién gana.",
  },
  {
    id: "misiones",
    titulo: "Tu misión secreta",
    cuando: "antes",
    actividad: "misiones",
    cuandoTexto: "Ábrela ahora · se revelan a medianoche",
    queEs:
      "Al llegar recibes una misión en un sobre sellado. Es algo pequeño que tienes que lograr durante la noche sin que te descubran.",
    queHaces: [
      "Abre tu casete desde ya. Nadie más puede verlo.",
      "La que te toca es la que te toca: no se puede cambiar.",
      "Cúmplela cuando puedas, sin anunciarla.",
      "A medianoche se revelan todas y el grupo vota si la cumpliste.",
    ],
    paraQue:
      "Para que durante toda la noche estés tramando algo por debajo de la conversación, y para que al final haya algo que contar.",
  },
  {
    id: "supervivencia",
    titulo: "¿Sobrevivirías a una película de terror?",
    cuando: "antes",
    actividad: "supervivencia",
    cuandoTexto: "Abre tu caso ahora · se juega a las 8:00 pm",
    queEs:
      "A cada uno le toca un caso distinto: un asesino, un sitio, cuatro objetos y unas reglas. En la noche tienes dos minutos para explicar cómo sales vivo, y los otros cinco hacen de jurado.",
    queHaces: [
      "Abre tu caso desde ya y léelo con calma: tienes toda la tarde para pensar tu plan.",
      "Si no te convence el que te tocó, puedes cambiarlo una vez por otro sin abrir.",
      "En tu turno tu caso sale en la televisión y defiendes tu plan dos minutos. A mitad te van a soltar un giro que no viste venir.",
      "Cuando no es tu turno eres jurado: puntúas del 1 al 10 y tienes en el celular las salidas que sí funcionan.",
    ],
    paraQue:
      "Es la parte en la que cada uno habla solo frente al grupo. Dos minutos es poco a propósito: obliga a ir al grano, y gana el que mejor lo cuenta, no el que tenga razón.",
  },
  {
    id: "mentiras",
    titulo: "Dos mentiras y una verdad",
    cuando: "antes",
    actividad: "mentiras",
    cuandoTexto: "Escribes ahora · se juega a las 9:30 pm",
    queEs:
      "Cada uno escribe tres experiencias raras: dos inventadas y una que le pasó de verdad. En la noche el resto tiene que adivinar cuál es la cierta.",
    queHaces: [
      "Escribe tus tres frases desde ya y marca cuál es la verdadera. Que la cierta suene tan increíble como las que inventaste.",
      "Nadie las ve hasta que llegue tu turno esa noche: ni el resto, ni el anfitrión.",
      "En la noche votas cuál crees que es la verdad de cada uno desde tu celular: eliges el número, confirmas, y ya no se puede cambiar.",
    ],
    paraQue:
      "Hace falta una sola anécdota buena en vez de dos, que es lo que deja a alguien sin material. Y como las otras dos las inventas tú, puedes camuflarla para que no cante.",
  },
  {
    id: "marcador",
    titulo: "Marcador de Almas",
    cuando: "noche",
    cuandoTexto: "Se llena esa noche",
    queEs:
      "El puntaje global. Suma lo que ganas en disfraces, trivia, supervivencia, mentiras y misiones.",
    queHaces: [
      "Nada: se llena solo con lo que vas ganando en cada dinámica.",
      "Mientras tanto, cada uno es una lápida que va subiendo.",
    ],
    paraQue:
      "Seis entran, uno gana. Ninguna dinámica decide sola el resultado, así que te conviene jugar todas aunque una se te dé mal.",
  },
  {
    id: "pelicula",
    titulo: "La película del final",
    cuando: "antes",
    cuandoTexto: "Ahora, antes del 31",
    queEs: "Con cuál cerramos la noche. Se vota antes, entre cuatro candidatas.",
    queHaces: [
      "Elige una. Un voto por persona, y lo puedes cambiar hasta el 31.",
    ],
    paraQue:
      "Para que a las 2:00 am nadie tenga que decidir nada: se pone la que ganó y listo.",
  },
];

export function buscarFicha(id: string): Ficha | undefined {
  return FICHAS.find((f) => f.id === id);
}
