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
 * Dificultad pensada para seis amigos que ven cine de terror sin ser expertos:
 * la mitad se contestan de memoria y la otra mitad se discuten.
 */
export const TRIVIA_BANK: TriviaSeed[] = [
  {
    id: "t01",
    text: "En «It», ¿cada cuántos años despierta Pennywise?",
    imageUrls: [],
    options: ["13 años", "27 años", "33 años", "50 años"],
    correctIndex: 1,
    timeLimitSeconds: 20,
  },
  {
    id: "t02",
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
    id: "t03",
    text: "En «La Llamada», ¿cuántos días tienes después de ver la cinta?",
    imageUrls: [],
    options: ["Tres días", "Siete días", "Un mes", "Veinticuatro horas"],
    correctIndex: 1,
    timeLimitSeconds: 20,
  },
  {
    id: "t04",
    text: "¿Cuál es la regla que SÍ existe en «Gremlins»?",
    imageUrls: [],
    options: [
      "No darles de comer después de medianoche",
      "No dejarlos ver televisión",
      "No decir su nombre tres veces",
      "No dejarlos solos en la oscuridad",
    ],
    correctIndex: 0,
    timeLimitSeconds: 20,
  },
  {
    id: "t05",
    text: "En «El Resplandor», ¿qué frase escribe Jack una y otra vez?",
    imageUrls: [],
    options: [
      "Redrum, redrum, redrum",
      "Todo trabajo y nada de juego…",
      "Ya estoy en casa",
      "Aquí está Johnny",
    ],
    correctIndex: 1,
    timeLimitSeconds: 20,
  },
  {
    id: "t06",
    text: "¿Qué máscara usa Michael Myers en «Halloween»?",
    imageUrls: [],
    options: [
      "Una de hockey",
      "Una de payaso",
      "Una de William Shatner pintada de blanco",
      "Una hecha de piel humana",
    ],
    correctIndex: 2,
    timeLimitSeconds: 25,
  },
  {
    id: "t07",
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
    id: "t08",
    text: "¿Cómo se llama el muñeco de «Saw» que anda en triciclo?",
    imageUrls: [],
    options: ["Jigsaw", "Billy", "Charlie", "Sam"],
    correctIndex: 1,
    timeLimitSeconds: 20,
  },
  {
    id: "t09",
    text: "En «Smile», ¿qué se transmite de víctima en víctima?",
    imageUrls: [],
    options: [
      "Una maldición que pasa al presenciar una muerte",
      "Un virus",
      "Una llamada telefónica",
      "Un tatuaje",
    ],
    correctIndex: 0,
    timeLimitSeconds: 25,
  },
  {
    id: "t10",
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
    id: "t11",
    text: "En «El Juego del Calamar», ¿cuál es el primer juego?",
    imageUrls: [],
    options: [
      "El panal de azúcar",
      "La cuerda",
      "Luz roja, luz verde",
      "Las canicas",
    ],
    correctIndex: 2,
    timeLimitSeconds: 15,
  },
  {
    id: "t12",
    text: "En «Terrifier», ¿cuál es la característica más incómoda de Art?",
    imageUrls: [],
    options: [
      "Que nunca habla",
      "Que no se puede matar",
      "Que solo aparece de día",
      "Que imita tu voz",
    ],
    correctIndex: 0,
    timeLimitSeconds: 20,
  },
  {
    id: "t13",
    text: "En «Insidious», ¿cómo se llama el lugar al que viaja el alma?",
    imageUrls: [],
    options: ["El Vacío", "La Otra Parte", "El Más Allá", "La Noche Oscura"],
    correctIndex: 1,
    timeLimitSeconds: 25,
  },
  {
    id: "t14",
    text: "¿Qué objeto está maldito en «El Conjuro»?",
    imageUrls: [],
    options: [
      "Un espejo",
      "Una caja de música",
      "La muñeca Annabelle",
      "Un reloj de pared",
    ],
    correctIndex: 2,
    timeLimitSeconds: 20,
  },
  {
    id: "t15",
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
    id: "t16",
    text: "¿Cuál es el arma de Leatherface en «La Masacre de Texas»?",
    imageUrls: [],
    options: ["Un hacha", "Un machete", "Una motosierra", "Un martillo"],
    correctIndex: 2,
    timeLimitSeconds: 15,
  },
  {
    id: "t17",
    text: "En «Chucky», ¿qué es el muñeco en realidad?",
    imageUrls: [],
    options: [
      "Un juguete poseído por un demonio",
      "Un asesino en serie que se transfirió con vudú",
      "Un robot defectuoso",
      "Un muñeco común; todo pasa en la cabeza del niño",
    ],
    correctIndex: 1,
    timeLimitSeconds: 25,
  },
  {
    id: "t18",
    text: "En «Viernes 13», ¿quién es el asesino de la PRIMERA película?",
    imageUrls: [],
    options: [
      "Jason Voorhees",
      "La madre de Jason",
      "El guardabosques",
      "Un campista anónimo",
    ],
    correctIndex: 1,
    timeLimitSeconds: 25,
  },
  {
    id: "t19",
    text: "En «Déjame Salir», ¿cómo se llama el estado de trance?",
    imageUrls: [],
    options: [
      "El Lugar Hundido",
      "El Vacío",
      "La Sala Blanca",
      "El Sótano",
    ],
    correctIndex: 0,
    timeLimitSeconds: 20,
  },
  {
    id: "t20",
    text: "En «Pesadilla en Elm Street», ¿dónde te mata Freddy?",
    imageUrls: [],
    options: [
      "Frente a un espejo",
      "En el agua",
      "Mientras duermes",
      "En la calle donde murió",
    ],
    correctIndex: 2,
    timeLimitSeconds: 15,
  },
];
