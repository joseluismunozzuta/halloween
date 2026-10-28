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
    id: "menu",
    titulo: "El menú lo decidimos entre todos",
    cuando: "antes",
    cuandoTexto: "Ahora, antes del 31",
    queEs:
      "La comida de la noche no la elige nadie solo: cualquiera propone un plato y todos votan cuáles entran.",
    queHaces: [
      "Propón lo que te gustaría comer, o lo que sabes preparar.",
      "Vota los platos que quieres en la mesa. Puedes quitar tu voto y cambiarlo.",
      "Cuando el menú esté cerrado, cada uno queda con una tarea: cocinar algo o traerlo.",
    ],
    paraQue:
      "Para llegar el 31 con la comida resuelta y cada uno sabiendo qué le toca, en vez de improvisar a último momento.",
  },
  {
    id: "disfraces",
    titulo: "Concurso de disfraces, en pareja",
    cuando: "noche",
    actividad: "disfraces",
    cuandoTexto: "El 31, al llegar",
    queEs:
      "Vienen disfrazados en pareja. Cada pareja sube una foto y después se vota por categorías.",
    queHaces: [
      "Ponte de acuerdo con tu pareja y vengan disfrazados. Eso es lo único que hay que preparar antes.",
      "Al llegar, suben una foto juntos desde el celular.",
      "Votas en tres categorías: más terrorífico, más original y más improvisado. No puedes votar por tu propia pareja.",
    ],
    paraQue:
      "Tres categorías para que casi todos se lleven algo, y porque esa foto va a ser el recuerdo de la noche.",
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
    cuando: "noche",
    actividad: "misiones",
    cuandoTexto: "7:00 pm · al llegar",
    queEs:
      "Al llegar recibes una misión en un sobre sellado. Es algo pequeño que tienes que lograr durante la noche sin que te descubran.",
    queHaces: [
      "Abre tu sobre al llegar. Se abre una sola vez y nadie más puede verlo.",
      "Cúmplela cuando puedas, sin anunciarla.",
      "A la 1:30 se revelan todas y el grupo vota si la cumpliste.",
    ],
    paraQue:
      "Para que durante toda la noche estés tramando algo por debajo de la conversación, y para que al final haya algo que contar.",
  },
  {
    id: "supervivencia",
    titulo: "Plan de supervivencia",
    cuando: "noche",
    actividad: "supervivencia",
    cuandoTexto: "11:00 pm",
    queEs:
      "Eliges tres villanos del terror y tienes dos minutos para explicar cómo los vencerías.",
    queHaces: [
      "Piensa a quiénes eliges. No hace falta prepararlo, pero si vienes con algo pensado se nota.",
      "Dos minutos por persona, con cronómetro en la pantalla.",
      "Al final votamos el plan más convincente. No puedes votar por el tuyo.",
    ],
    paraQue:
      "Es la parte en la que cada uno habla solo frente al grupo. Dos minutos es poco a propósito: obliga a ir al grano y gana el que mejor lo cuenta.",
  },
  {
    id: "mentiras",
    titulo: "Dos verdades y una mentira",
    cuando: "antes",
    actividad: "mentiras",
    cuandoTexto: "Escribes ahora · se juega a las 12:00 am",
    queEs:
      "Cada uno escribe tres experiencias raras propias: dos que pasaron de verdad y una inventada. En la noche el resto adivina cuál es la falsa.",
    queHaces: [
      "Escribe tus tres frases desde ya y marca cuál es la mentira.",
      "Nadie las ve hasta que llegue tu turno esa noche: ni el resto, ni el anfitrión.",
      "En la noche votas la mentira de los demás desde tu celular.",
    ],
    paraQue:
      "Reemplaza al clásico «cuenten historias de terror», donde siempre hay alguien que se queda sin material. Con anécdotas propias nadie se queda callado.",
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
