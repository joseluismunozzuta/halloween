export type TriviaSeed = {
  id: string;
  text: string;
  imageUrls: string[];
  options: string[];
  correctIndex: number;
  timeLimitSeconds: number;
};

/**
 * Banco de la trivia: terror moderno.
 *
 * `correctIndex` es la posición de la alternativa correcta empezando en 0.
 * La respuesta correcta se guarda en una colección aparte (triviaKeys) que
 * solo el anfitrión puede leer — ver src/lib/trivia.ts y firestore.rules.
 *
 * `imageUrls` va vacío: el motor ya soporta carrusel de imágenes, así que
 * basta con poner archivos en public/ y listarlos aquí cuando se quieran.
 *
 * El orden del arreglo ES el orden de juego (`order: index` al sembrar), y
 * está armado como una rampa: las primeras se contestan de memoria y las
 * últimas se discuten. El anfitrión puede abrir la que quiera, pero si va
 * en orden la ronda sube de dificultad sola.
 *
 * Los datos de las películas de 2024-2025 están verificados contra fuentes
 * públicas, no de memoria. Si agregas preguntas de estrenos recientes, hazlo
 * igual: una pregunta con el dato mal arruina la ronda y nadie se acuerda del
 * resto.
 *
 * Evita preguntas cuya respuesta dependa del doblaje (nombres de lugares o
 * criaturas traducidos de distinta forma según la versión). Terminan en una
 * discusión sobre traducción en vez de sobre la película.
 */
export const TRIVIA_BANK: TriviaSeed[] = [
  // ── Calentamiento: de memoria ───────────────────────────────────────────
  {
    id: "t01",
    text: "¿Qué hay que hacer para sobrevivir en «Un lugar en silencio»?",
    imageUrls: [],
    options: [
      "No hacer ruido",
      "No mirarlos a los ojos",
      "No dormir",
      "No salir de día",
    ],
    correctIndex: 0,
    timeLimitSeconds: 15,
  },
  {
    id: "t02",
    text: "¿Cuál es el arma de Leatherface en «La Masacre de Texas»?",
    imageUrls: [],
    options: [
      "Un hacha",
      "Un machete",
      "Una motosierra",
      "Un martillo",
    ],
    correctIndex: 2,
    timeLimitSeconds: 15,
  },
  {
    id: "t03",
    text: "En «Pesadilla en Elm Street», ¿dónde te mata Freddy?",
    imageUrls: [],
    options: [
      "En la calle donde murió",
      "Frente a un espejo",
      "En el agua",
      "Mientras duermes",
    ],
    correctIndex: 3,
    timeLimitSeconds: 15,
  },
  {
    id: "t04",
    text: "En «El Juego del Calamar», ¿cuál es el primer juego?",
    imageUrls: [],
    options: [
      "Luz roja, luz verde",
      "Las canicas",
      "El panal de azúcar",
      "La cuerda",
    ],
    correctIndex: 0,
    timeLimitSeconds: 15,
  },
  {
    id: "t05",
    text: "En «M3GAN», ¿qué es M3GAN exactamente?",
    imageUrls: [],
    options: [
      "Una niña clonada",
      "Un programa de televisión infantil",
      "Una muñeca con inteligencia artificial",
      "Un fantasma que habita un juguete",
    ],
    correctIndex: 2,
    timeLimitSeconds: 15,
  },
  {
    id: "t06",
    text: "En «Bird Box», ¿qué es lo que NO se puede hacer?",
    imageUrls: [],
    options: [
      "Hablar",
      "Dormir",
      "Tocar el suelo",
      "Mirar",
    ],
    correctIndex: 3,
    timeLimitSeconds: 15,
  },

  // ── Terreno conocido ────────────────────────────────────────────────────
  {
    id: "t07",
    text: "En «It», ¿cada cuántos años despierta Pennywise?",
    imageUrls: [],
    options: ["13 años", "27 años", "33 años", "50 años"],
    correctIndex: 1,
    timeLimitSeconds: 20,
  },
  {
    id: "t08",
    text: "En «La Llamada», ¿cuántos días tienes después de ver la cinta?",
    imageUrls: [],
    options: [
      "Siete días",
      "Un mes",
      "Veinticuatro horas",
      "Tres días",
    ],
    correctIndex: 0,
    timeLimitSeconds: 20,
  },
  {
    id: "t09",
    text: "¿Cuál es la regla que SÍ existe en «Gremlins»?",
    imageUrls: [],
    options: [
      "No decir su nombre tres veces",
      "No dejarlos solos en la oscuridad",
      "No darles de comer después de medianoche",
      "No dejarlos ver televisión",
    ],
    correctIndex: 2,
    timeLimitSeconds: 20,
  },
  {
    id: "t10",
    text: "En «Nosotros» (Us), ¿de qué color va vestido cada doble?",
    imageUrls: [],
    options: [
      "Blanco",
      "Negro",
      "Amarillo",
      "Rojo",
    ],
    correctIndex: 3,
    timeLimitSeconds: 20,
  },
  {
    id: "t11",
    text: "¿Qué objeto está maldito en «El Conjuro»?",
    imageUrls: [],
    options: [
      "La muñeca Annabelle",
      "Un reloj de pared",
      "Un espejo",
      "Una caja de música",
    ],
    correctIndex: 0,
    timeLimitSeconds: 20,
  },
  {
    id: "t12",
    text: "¿Qué pregunta hace Ghostface por teléfono en «Scream»?",
    imageUrls: [],
    options: [
      "¿Estás sola en casa?",
      "¿Cuál es tu película de terror favorita?",
      "¿Quieres jugar un juego?",
      "¿Sabes quién soy?",
    ],
    correctIndex: 1,
    timeLimitSeconds: 20,
  },
  {
    id: "t13",
    text: "¿Cuántas veces hay que decir «Candyman» frente al espejo para invocarlo?",
    imageUrls: [],
    options: ["Tres", "Cinco", "Siete", "Trece"],
    correctIndex: 1,
    timeLimitSeconds: 20,
  },
  {
    id: "t14",
    text: "En «Host», ¿dónde hacen la sesión espiritista que lo arruina todo?",
    imageUrls: [],
    options: [
      "En un hotel abandonado",
      "En un cementerio",
      "En una videollamada",
      "En el sótano de la casa",
    ],
    correctIndex: 2,
    timeLimitSeconds: 20,
  },
  {
    id: "t15",
    text: "En «El Resplandor», ¿qué frase escribe Jack una y otra vez?",
    imageUrls: [],
    options: [
      "Ya estoy en casa",
      "Aquí está Johnny",
      "Redrum, redrum, redrum",
      "Todo trabajo y nada de juego…",
    ],
    correctIndex: 3,
    timeLimitSeconds: 20,
  },
  {
    id: "t16",
    text: "En «Hereditary», ¿qué sonido hace Charlie que no se olvida?",
    imageUrls: [],
    options: [
      "Un chasquido con la lengua",
      "Un silbido bajo",
      "Un golpeteo en la pared",
      "Una risa seca",
    ],
    correctIndex: 0,
    timeLimitSeconds: 20,
  },
  {
    id: "t17",
    text: "En «Midsommar», ¿dónde transcurre casi toda la película?",
    imageUrls: [],
    options: [
      "De noche, en un bosque",
      "A plena luz del día, en un prado",
      "En una cueva",
      "En una iglesia abandonada",
    ],
    correctIndex: 1,
    timeLimitSeconds: 20,
  },
  {
    id: "t18",
    text: "En «Terrifier», ¿cuál es la característica más incómoda de Art?",
    imageUrls: [],
    options: [
      "Que solo aparece de día",
      "Que imita tu voz",
      "Que nunca habla",
      "Que no se puede matar",
    ],
    correctIndex: 2,
    timeLimitSeconds: 20,
  },
  {
    id: "t19",
    text: "En «Háblame» (Talk to Me), ¿qué objeto usan para contactar a los espíritus?",
    imageUrls: [],
    options: [
      "Una tabla ouija",
      "Un espejo roto",
      "Una vela negra",
      "Una mano embalsamada",
    ],
    correctIndex: 3,
    timeLimitSeconds: 20,
  },
  {
    id: "t20",
    text: "En «El Babadook», ¿cómo entra el Babadook a la casa?",
    imageUrls: [],
    options: [
      "En un libro infantil desplegable",
      "En una caja de música",
      "Por el espejo del baño",
      "En una cinta de video",
    ],
    correctIndex: 0,
    timeLimitSeconds: 20,
  },
  {
    id: "t21",
    text: "En «28 días después», ¿cómo se llama el virus que arrasa con todo?",
    imageUrls: [],
    options: [
      "Némesis",
      "Rabia",
      "Solanum",
      "Cordyceps",
    ],
    correctIndex: 1,
    timeLimitSeconds: 20,
  },

  // ── Las que se discuten ─────────────────────────────────────────────────
  {
    id: "t22",
    text: "En «Déjame Salir», ¿cómo se llama el estado de trance?",
    imageUrls: [],
    options: [
      "La Sala Blanca",
      "El Sótano",
      "El Lugar Hundido",
      "El Vacío",
    ],
    correctIndex: 2,
    timeLimitSeconds: 20,
  },
  {
    id: "t23",
    text: "En «Chucky», ¿qué es el muñeco en realidad?",
    imageUrls: [],
    options: [
      "Un robot defectuoso",
      "Un muñeco común; todo pasa en la cabeza del niño",
      "Un juguete poseído por un demonio",
      "Un asesino en serie que se transfirió con vudú",
    ],
    correctIndex: 3,
    timeLimitSeconds: 25,
  },
  {
    id: "t24",
    text: "¿Qué máscara usa Michael Myers en «Halloween»?",
    imageUrls: [],
    options: [
      "Una de William Shatner pintada de blanco",
      "Una hecha de piel humana",
      "Una de hockey",
      "Una de payaso",
    ],
    correctIndex: 0,
    timeLimitSeconds: 25,
  },
  {
    id: "t25",
    text: "En «Smile», ¿qué se transmite de víctima en víctima?",
    imageUrls: [],
    options: [
      "Un tatuaje",
      "Una maldición que pasa al presenciar una muerte",
      "Un virus",
      "Una llamada telefónica",
    ],
    correctIndex: 1,
    timeLimitSeconds: 25,
  },
  {
    id: "t26",
    text: "¿Cuál es el verdadero nombre de Jigsaw, el asesino de «Saw»?",
    imageUrls: [],
    options: [
      "Lawrence Gordon",
      "Amanda Young",
      "John Kramer",
      "Mark Hoffman",
    ],
    correctIndex: 2,
    timeLimitSeconds: 25,
  },
  {
    id: "t27",
    text: "En «La Sustancia», ¿cada cuántos días deben intercambiar los cuerpos?",
    imageUrls: [],
    options: ["Cada 3 días", "Cada 7 días", "Cada 14 días", "Cada mes"],
    correctIndex: 1,
    timeLimitSeconds: 25,
  },
  {
    id: "t28",
    text: "En «Viernes 13», ¿quién es el asesino de la PRIMERA película?",
    imageUrls: [],
    options: [
      "El guardabosques",
      "Un campista anónimo",
      "Jason Voorhees",
      "La madre de Jason",
    ],
    correctIndex: 3,
    timeLimitSeconds: 25,
  },
  {
    id: "t29",
    text: "«Terrifier 3» no ocurre en Halloween. ¿En qué fecha ocurre?",
    imageUrls: [],
    options: [
      "Navidad",
      "Año Nuevo",
      "San Valentín",
      "Acción de Gracias",
    ],
    correctIndex: 0,
    timeLimitSeconds: 25,
  },
  {
    id: "t30",
    text: "¿Qué actor interpreta al asesino en «Longlegs»?",
    imageUrls: [],
    options: [
      "Christian Bale",
      "Nicolas Cage",
      "Willem Dafoe",
      "Ethan Hawke",
    ],
    correctIndex: 1,
    timeLimitSeconds: 25,
  },
  {
    id: "t31",
    text: "En «Pecadores» (Sinners), ¿qué actor interpreta a los gemelos Smoke y Stack?",
    imageUrls: [],
    options: [
      "John Boyega",
      "Jonathan Majors",
      "Michael B. Jordan",
      "Daniel Kaluuya",
    ],
    correctIndex: 2,
    timeLimitSeconds: 25,
  },
  {
    id: "t32",
    text: "En «Weapons», ¿a qué hora salen corriendo los 17 niños de sus casas?",
    imageUrls: [],
    options: [
      "3:00 de la madrugada",
      "Medianoche",
      "4:44 de la madrugada",
      "2:17 de la madrugada",
    ],
    correctIndex: 3,
    timeLimitSeconds: 25,
  },
];
