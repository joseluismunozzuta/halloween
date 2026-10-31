import type { PersonaId } from "./identidad";

/**
 * Los casos de supervivencia.
 *
 * Cada uno es UN problema limpio con varias salidas válidas, no un acertijo
 * con una sola respuesta. Tres reglas al escribirlos:
 *
 * 1. **Los objetos no se repiten entre casos.** En cuanto dos personas tienen
 *    el mismo juguete, el segundo plan suena a copia del primero.
 * 2. **El pliego del jurado da criterio antes que soluciones.** Lo que el
 *    jurado necesita para poner una nota es saber qué tiene que resolver un
 *    buen plan; la lista de salidas es para reconocerlas, no para corregir.
 * 3. **El giro no está en la ficha del jugador.** Lo tiene el jurado y lo
 *    suelta cuando ya lleva un minuto defendiendo su plan, para que tenga que
 *    improvisar delante de todos.
 *
 * No llevan etiqueta de dificultad a propósito: si la nota decide puntos, un
 * «difícil» escrito en la ficha es una excusa antes de empezar.
 */

export type CasoPublico = {
  id: string;
  nombre: string;
  /** El villano, para la proyección. Archivo de public/personajes. */
  personaje: string;
  /** Dónde estás y qué está pasando. Dos o tres frases. */
  contexto: string;
  /** Qué tienes que conseguir, en una línea. */
  objetivo: string;
  tienes: string[];
  noPuedes: string[];
  /** No se le reparte a esta persona, si el caso la nombra. */
  excluye?: PersonaId;
};

export type PliegoJurado = {
  id: string;
  /** Qué tiene que resolver un buen plan. Es el criterio para la nota. */
  criterio: string;
  /** Salidas que sí funcionan, para reconocerlas cuando aparezcan. */
  soluciones: string[];
  /** El error que suena bien y no lo es. */
  error: string;
  /** La bomba. La suelta cualquiera del jurado, a mitad del turno. */
  giro: string;
};

export const CASOS: CasoPublico[] = [
  {
    id: "c01",
    nombre: "El cuarto de lavandería",
    personaje: "/personajes/chucky.webp",
    contexto:
      "Estás encerrado en un cuarto de lavandería de tres por tres. Chucky acaba de aparecer con un cuchillo, a dos metros. Te agarró un calambre en las dos piernas: caminas lento, no corres, no pateas.",
    objetivo: "Salir por la puerta, que está detrás de él.",
    tienes: ["Una escoba", "Un cesto de ropa de plástico duro", "Una manta gruesa", "Una silla"],
    noPuedes: ["Correr, saltar ni patear", "Ganarle en corto: mide medio metro y es más rápido"],
  },
  {
    id: "c02",
    nombre: "La cocina",
    personaje: "/personajes/leatherface.webp",
    contexto:
      "Estás en la cocina de la casa de Leatherface. Lo oyes encender la motosierra en el pasillo; entra en treinta segundos. La puerta principal tiene llave. Hay una ventana al jardín, a un metro del suelo.",
    objetivo: "Estar fuera de la casa antes de que él entre a la cocina.",
    tienes: ["Una silla", "Una olla de metal", "Una cortina larga", "Un saco de papas"],
    noPuedes: ["Enfrentarlo", "Apagar la motosierra", "Abrir la puerta principal"],
  },
  {
    id: "c03",
    nombre: "El apagón",
    personaje: "/personajes/michael.webp",
    contexto:
      "Casa de dos pisos, sin luz. Michael Myers acabó de entrar y sube las escaleras despacio. Tú estás arriba; tu amigo está escondido en el baño del mismo piso. Hay una ventana que da a un techo bajo, y del techo se baja al jardín.",
    objetivo: "Salir de la casa con tu amigo.",
    tienes: ["Cinco metros de cuerda", "Una sábana", "Una linterna", "Tu celular al 5%"],
    noPuedes: ["Bajar por las escaleras", "Dejar a tu amigo", "Tocarlo"],
  },
  {
    id: "c04",
    nombre: "La sala a oscuras",
    personaje: "/personajes/ghost.svg",
    contexto:
      "Hay un hombre con un traje que lo vuelve invisible dentro de la casa. Lo oyes caminar en la sala. No lo ves. La puerta del patio está a ocho metros.",
    objetivo: "Llegar a la puerta del patio.",
    tienes: ["Una bolsa de harina", "Un balde con agua", "Un ventilador de pie", "Una manta"],
    noPuedes: ["Atacarlo", "Romper el traje", "Encender las luces"],
  },
  {
    id: "c05",
    nombre: "Siete días",
    personaje: "/personajes/samara.webp",
    contexto:
      "Viste la cinta. Te quedan siete días y hoy es el séptimo. Samara sale por cualquier pantalla encendida. Ya intentaste quemar la cinta: apareció otra vez en tu casa, intacta.",
    objetivo: "Llegar vivo a mañana.",
    tienes: ["Una videocasetera", "Una cinta virgen", "Un televisor", "Un teléfono fijo"],
    noPuedes: ["Destruir la cinta", "Irte del país: no llegas a tiempo", "Pedirle nada a ella"],
  },
  {
    id: "c06",
    nombre: "El baño del cine",
    personaje: "/personajes/art.webp",
    contexto:
      "Art el payaso te acorraló en el baño de un cine vacío. No habla. Te mira y sonríe, y se nota que no tiene ninguna prisa. La única puerta es la del pasillo por donde él entró.",
    objetivo: "Salir del baño.",
    tienes: ["Un espejo grande", "Un dispensador de jabón", "Un trapeador", "Tu celular sin señal"],
    noPuedes: ["Pedir ayuda: el cine está cerrado", "Pelear con él", "Salir por otro lado"],
  },
  {
    id: "c07",
    nombre: "La llamada",
    personaje: "/personajes/ghostface.webp",
    contexto:
      "Estás en casa con un amigo. Te llama Ghostface y te dice que está en la puerta principal. Miras por la ventana y ahí está, con el cuchillo. Tu amigo quiere salir por la puerta de atrás. Tú sospechas que no está solo.",
    objetivo: "Salir los dos a la calle.",
    tienes: ["Dos celulares", "Una mesa pesada", "El control del garaje", "La puerta de atrás, sin llave"],
    noPuedes: ["Atacar a nadie", "Separarte de tu amigo", "Tardar más de dos minutos en decidir"],
  },
  {
    id: "c08",
    nombre: "El último campista",
    personaje: "/personajes/jigsaw.webp",
    contexto:
      "Cabaña en Crystal Lake. Por la ventana ves a Jason venir con el machete: está a veinte metros de la puerta. Una camioneta de rescate pasa por el camino principal en tres minutos, y el camino está a cien metros.",
    objetivo: "Llegar vivo al camino antes de que pase la camioneta.",
    tienes: ["Un armario pesado", "Un rollo de cinta adhesiva", "Una bengala", "Un bote de remos"],
    noPuedes: ["Matarlo: no se puede", "Usar un vehículo", "Esconderte y esperar"],
  },
];

export const PLIEGOS: PliegoJurado[] = [
  {
    id: "c01",
    criterio:
      "Un buen plan tiene que hacer dos cosas: mantenerlo lejos del cuerpo y quitarlo de la puerta. Sin lo segundo, solo está ganando tiempo.",
    soluciones: [
      "Usar la escoba como tope para empujarlo sin acercarse",
      "Taparlo con la manta y pisarla o sentarse encima",
      "Encerrarlo bajo el cesto de plástico y salir caminando",
      "Usar la silla como barrera y rodearlo con la pared de apoyo",
    ],
    error: "Atacarlo a golpes. Con las piernas agarrotadas, agacharse es entregarle el cuello.",
    giro: "Se mete debajo de la lavadora y deja de hacer ruido. No sabes por dónde va a salir.",
  },
  {
    id: "c02",
    criterio:
      "Treinta segundos no alcanzan para abrir la ventana y salir. El plan tiene que comprar segundos antes de empezar a abrirla.",
    soluciones: [
      "Atrancar la puerta de la cocina con la silla y abrir la ventana mientras él fuerza",
      "Vaciar el saco de papas en el suelo del pasillo para que pierda pie",
      "Lanzar la olla lejos para que vaya hacia el ruido",
      "Usar la cortina para colgarse por la ventana sin caer de un metro",
    ],
    error: "Parar la motosierra con la olla o la cortina. Esa pelea no se gana.",
    giro: "La ventana está atascada por la pintura: cede, pero te va a costar cinco segundos más.",
  },
  {
    id: "c03",
    criterio:
      "Son dos personas y una sola ventana. El plan tiene que resolver cómo se comunican sin ruido y en qué orden bajan.",
    soluciones: [
      "Atar la cuerda a algo fijo para bajar al techo sin saltar",
      "Mandarle un mensaje al amigo en vez de llamarlo: el 5% da para eso",
      "Usar la sábana para amortiguar la caída del techo al jardín",
      "Sacar al amigo primero, que es el que está peor",
    ],
    error: "Usar la linterna para ver dónde está Michael. Lo que hace es decirle dónde estás tú.",
    giro: "Tu amigo oye los pasos, entra en pánico y empieza a gritar desde el baño.",
  },
  {
    id: "c04",
    criterio:
      "Hay que resolver dos cosas distintas: saber dónde está, y moverse sin que él sepa dónde estás tú. Un plan que solo hace lo primero se queda a medias.",
    soluciones: [
      "Harina al aire con el ventilador, para que se le pegue encima",
      "Agua en el piso: deja huellas y se oyen las pisadas",
      "Lanzarle la manta para marcarlo aunque sea unos segundos",
      "Harina en el suelo y leer por dónde camina",
    ],
    error:
      "Tratarlo como un fantasma. Es invisible, no intangible: puede bloquear la puerta con el cuerpo.",
    giro: "Se queda completamente quieto. Llevas veinte segundos sin oír nada.",
  },
  {
    id: "c05",
    criterio:
      "La cinta no se destruye y ella no negocia. La única salida conocida es pasarle el problema a otro, y eso obliga a decidir a quién y cómo convencerlo.",
    soluciones: [
      "Copiar la cinta con la videocasetera y enseñársela a alguien más",
      "Tener la copia lista antes de la medianoche, no después",
      "Apagar y desenchufar todo lo que sea pantalla mientras tanto",
      "Usar el teléfono fijo para traer a alguien a casa",
    ],
    error: "Pensar que si no miras la pantalla no pasa nada. La cinta ya corre contigo.",
    giro: "La persona a la que ibas a enseñarle la copia te dice que no, que ya sabe de qué va.",
  },
  {
    id: "c06",
    criterio:
      "Art no tiene prisa y disfruta el juego: no hay salida por la fuerza. El plan tiene que darle algo que mirar o aprovechar que él quiere que esto dure.",
    soluciones: [
      "Jabón en el piso, delante de la puerta, y salir pegado a la pared",
      "Usar el espejo para que vea su propio número y se entretenga",
      "El trapeador como pértiga para mantenerlo a dos metros",
      "Hacerle creer que te rindes y arrancar cuando se relaje",
    ],
    error: "Encerrarse en un cubículo. Es exactamente lo que él quiere y tiene toda la noche.",
    giro: "Se aparta de la puerta y te la deja libre. Te sonríe y espera a ver qué haces.",
  },
  {
    id: "c07",
    criterio:
      "El plan tiene que tratar la información como sospechosa: lo que dice la llamada no es un dato. Y tiene que elegir una salida que se pueda comprobar antes de cruzarla.",
    soluciones: [
      "Abrir el garaje con el control y mirar desde dentro antes de salir",
      "Llamar a emergencias con un celular mientras mantienes la llamada en el otro",
      "Atrancar la puerta principal con la mesa para fijar a ese por lo menos",
      "Salir por donde él no sabe que puedes salir",
    ],
    error: "Abrir la puerta principal para comprobar si es él de verdad.",
    giro: "Suena el celular de tu amigo. Y la llamada entra desde dentro de la casa.",
  },
  {
    id: "c08",
    criterio:
      "Cien metros con Jason a veinte de la puerta no se hacen en línea recta. El plan necesita una ventaja de salida y una forma de que la camioneta lo vea.",
    soluciones: [
      "Trancar la puerta con el armario para que pierda medio minuto",
      "La bengala para que la camioneta lo vea llegar desde lejos",
      "Cinta adhesiva entre dos árboles del camino, a la altura de la rodilla",
      "Salir por el lado del agua y rodear, en vez de correr por el camino",
    ],
    error: "Meterse al lago. Jason entra al agua, y además ahí es donde mejor se mueve.",
    giro: "La camioneta pasa de largo. No te vio, y no vuelve hasta dentro de media hora.",
  },
];

export function pliegoDe(casoId: string): PliegoJurado | undefined {
  return PLIEGOS.find((p) => p.id === casoId);
}

export function casoDe(casoId: string): CasoPublico | undefined {
  return CASOS.find((c) => c.id === casoId);
}
