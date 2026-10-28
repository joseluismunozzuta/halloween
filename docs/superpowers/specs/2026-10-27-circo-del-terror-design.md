# Circo del Terror — documento de diseño

**Fecha:** 27 de octubre de 2026
**Evento:** sábado 31 de octubre de 2026, 7:00 pm, casa de Alexandra (Lima)
**Estado:** diseño aprobado, pendiente de plan de implementación

---

## 1. Qué es y por qué

Seis amigos —JL, Mar, Victor, Alexandra, Caro y Marcelo— se reúnen en Halloween.
Este sitio es la **agenda viva** de esa noche, y antes del 31 es también la
herramienta con la que deciden qué van a cocinar y quién trae qué.

Tiene dos momentos de uso claramente distintos:

1. **Del 28 al 30.** El link circula en el grupo. Abre con una animación que
   invita a tocarla. Sirve para proponer y votar platos, salir con una tarea
   asignada, registrar el disfraz y votar la película de cierre.
2. **El 31, desde las 7 pm.** Se vuelve la agenda del momento: muestra en qué
   bloque va la noche, y es el mando de las dinámicas. La trivia es el único
   punto donde el celular es **obligatorio** para todos.

El por qué detrás de todo: al grupo le gusta **competir**, **contar anécdotas**
y **la música**. Cada decisión de este diseño se apoya en una de esas tres.
El Marcador de Almas —un puntaje global que suma todas las dinámicas— es lo que
convierte cinco juegos sueltos en un torneo, y es la razón por la que el sitio
existe en vez de ser un mensaje de WhatsApp con la agenda.

### Por qué partimos de este repositorio

El repositorio contiene hoy "Expediente Confidencial JL", una invitación de
cumpleaños. **Se reutiliza únicamente su motor de trivia tipo Kahoot**, que ya
está terminado y probado: estado compartido en Firestore, celulares como mandos,
pantalla de TV como tablero, calificación idempotente con bonus por velocidad y
racha. Todo lo demás del concepto anterior se elimina.

---

## 2. Objetivos

- Que el link, abierto en el grupo antes del 31, dé ganas de abrirlo. El sitio
  es parte de la fiesta, no su documentación.
- Que el 31 nadie tenga que preguntar "¿y ahora qué toca?".
- Que al cerrar la noche haya **un ganador** y nadie dude de cómo se calculó.
- Que todo funcione bien **en celular**. Es donde va a vivir.
- Que antes del 31 el menú quede decidido y **cada uno sepa qué le toca**.

## 3. No-objetivos

- Escritorio. Se soporta (una columna centrada), no se optimiza. La excepción
  es `/proyeccion`, que es para la TV y sí se diseña aparte.
- Invitaciones, RSVP, confirmaciones de asistencia. Los seis ya están confirmados.
- Lista de regalos, check-in por QR, turnos de llegada. Todo eso se borra.
- Cuentas, perfiles, recuperación de contraseña. Se entra con Google y punto.
- Que sobreviva al 1 de noviembre. Es un sitio para una noche.

## 4. Anti-objetivos

Cosas que harían fracasar esto aunque funcione técnicamente:

- **Que se vea genérico.** Un fondo negro con calabazas flotando es exactamente
  lo que cualquiera espera. Si el resultado se parece a una plantilla de
  Halloween, falló.
- **Que las animaciones se sientan "fofas".** Formas dibujadas en CSS sin
  textura ni peso. Es la razón por la que el diseño usa ilustración real.
- **Que haya que explicar cómo se usa.** Si alguien a las 11 pm, con un trago
  encima, no entiende qué botón tocar, falló.
- **Que el celular se trabe.** Diez animaciones corriendo a la vez en un equipo
  de gama media arruina justo lo que se quiso lograr.
- **Que la trivia se pueda hacer trampa.** Ya está resuelto en el motor
  heredado; no se debe romper al refactorizar.

## 5. Restricciones

- **Tiempo: 4 días.** Hoy es martes 27. La primera versión circula el miércoles
  28 o jueves 29. El evento es el sábado 31. Esto es lo que manda sobre el
  alcance, y está reflejado en §10.
- **Seis usuarios.** Nada tiene que escalar. Se puede preferir lo simple sobre
  lo eficiente en todos los casos.
- **Sin backend propio.** Next.js 16 (App Router, React 19.2, React Compiler),
  Tailwind v4, Firebase Auth + Firestore desde el cliente. Lo que protege los
  datos son las reglas de Firestore, no un servidor.
- **En la casa hay:** una TV, un parlante, una laptop y sofás. La laptop o la TV
  muestran `/proyeccion`; los celulares son los mandos. El host (JL) necesita
  mantener su pestaña de `/admin` abierta durante la trivia, porque la
  calificación corre en su navegador.
- **El proyecto Firebase es `operationjl`**, ya configurado con Google Sign-In.
  La configuración pública del SDK está en el código y no es secreta.

---

## 6. Concepto visual: una cinta encontrada de un circo maldito

El sitio es **una cinta VHS que alguien encontró**, grabada en un circo del
terror. El VHS pone el lenguaje visual; el circo pone el tema y el nombre.

Esto resuelve tres problemas de un golpe:

1. Un circo es **una sucesión de atracciones**, lo que da una metáfora natural
   para las secciones.
2. Una cinta **aplana todo lo que graba**: cinco ilustraciones de estilos
   distintos, pasadas por el mismo grado, dejan de pelearse entre sí.
3. El fondo negro, el grano y las líneas de barrido son un contexto donde la
   ilustración de terror se ve bien sin esfuerzo.

### 6.1 Paleta

```
--tape-black      #07070a   fondo, todo
--bone            #e8e4d9   texto
--rec-red         #ff1f3d   el punto de REC, estados de alerta, cuenta regresiva
--chroma-cyan     #2ee6c8   fleco de color, datos secundarios
--chroma-magenta  #ff00a8   fleco de color (solo en el fleco, nunca como texto)
--bulb-amber      #ff8c1a   focos de la carpa, acento principal de interacción
--blood           #c01612   sangre viva
--blood-dark      #8c0a06   sangre seca, chorretones
```

Cian y magenta **solo** aparecen como aberración cromática —el fleco a los lados
de un título o de una banda que salta—, nunca como color de relleno. Esa
restricción es lo que hace que la paleta se lea como una cinta y no como neón.

### 6.2 Tipografía

Dos familias, ninguna más:

- **Alfa Slab One** — títulos. Es un slab de cartel de circo antiguo. Siempre en
  mayúsculas, con el fleco cian/magenta encima. Es la voz del cartel.
- **Share Tech Mono** — absolutamente todo lo demás: horas, nombres, etiquetas,
  enunciados de la trivia, textos de misión, descripciones. Es la voz del
  visor de la cámara.

La mono se usa también para los textos de lectura. Es una decisión deliberada:
en este sitio no hay párrafos largos —hay horas, nombres, preguntas y frases
cortas—, y la mono mantiene la voz del camcorder en toda la interfaz. Si en la
implementación aparece un bloque de texto largo, es señal de que ese texto
sobra, no de que falte una tercera tipografía.

### 6.3 El grado de cinta

Un conjunto de capas reutilizables que se aplican a cualquier sección o imagen:

- **Líneas de barrido.** `repeating-linear-gradient` de 1px negro cada 3px.
  Va encima de todo, sin eventos de puntero.
- **Banda de barrido.** Una franja clara de ~40px que recorre la sección de
  arriba abajo cada 6–7 s.
- **Salto de banda.** Dos copias de la imagen, recortadas en franjas
  horizontales con `clip-path`, desplazadas unos píxeles y tintadas con
  `hue-rotate` hacia cian y magenta. Aparecen 2–3 cuadros cada ~4,5 s.
  **Máximo un elemento con esta técnica por sección** (duplica la imagen).
- **Fleco cromático en títulos.** `text-shadow` de −2,5px magenta y +2,5px cian.
- **Grano.** Ruido SVG en `mix-blend-mode: screen`, animado a pasos.

### 6.4 Las dos formas de presentar un personaje

- **Recorte.** El personaje va encima del negro del sitio, sin caja, con un
  halo radial detrás que le dibuja la silueta (necesario sobre todo para
  Ghostface, que es casi todo manto negro).
- **Fotograma.** La ilustración va dentro de un marco rectangular con su propio
  fondo, tratada con el grado de cinta. Se usa cuando la imagen trae un fondo
  deliberado del ilustrador. Conceptualmente es lo correcto: son cuadros de la
  grabación.

---

## 7. El sistema: cada sección es una atracción

**La regla, y es lo que hace que el diseño funcione:** el monstruo no acompaña a
la sección, **la sección entra por culpa del monstruo**. El globo no está al
lado del concurso de disfraces; el globo es lo que te tapa el concurso hasta que
revienta. El cuchillo no adorna el plan de supervivencia, lo abre de un tajo.

Así el scroll deja de ser scroll y pasa a ser recorrer el circo, carpa por carpa.

### 7.1 El reparto

| Sección | Personaje | Cómo entra la sección | Presentación |
|---|---|---|---|
| Portada | Art el payaso | Arrastras el control de tracking y la cinta se enfoca hasta mostrar el cartel | Fotograma |
| Agenda | Art el payaso | De maestro de ceremonias: los reflectores se encienden uno por uno sobre cada hora | Fotograma |
| Menú | Leatherface | La motosierra preside la cocina — en su película él es el carnicero de la familia | Recorte |
| Disfraces | Pennywise | El globo llena la pantalla, revienta, sangra, y queda el payaso en loop | Recorte |
| Trivia | Samara | Sale del televisor, que es literalmente donde va a correr la trivia | Fotograma |
| Misiones | Jigsaw | «Quiero jugar un juego»: te entrega tu misión en secreto | Recorte |
| Supervivencia | Michael Myers | El cuchillo abre la sección en dos mitades que se separan | Fotograma |
| Mentiras | Ghostface | Suena el teléfono: la voz que miente | Recorte |
| Marcador | Cementerio (sin personaje) | Cada jugador es una lápida que sube según sus puntos | — |
| Película | Proyector (sin personaje) | La bobina arranca y tira la votación contra la pared | — |

Jigsaw desplazó a la ouija en las misiones secretas (aprobado por JL el 27 de
octubre). El gesto de arrastrar que motivó la ouija no se perdió: vive en la
portada, sintonizando la cinta.

### 7.2 La portada, en detalle

Es la primera impresión y el único momento que ve todo el que abra el link en el
grupo, así que se trata aparte.

La cinta llega **mal sintonizada**: ruido encima, el cartel borroso y partido en
cian y magenta, ilegible. Debajo hay un control de tracking. **Arrastrarlo**
baja el ruido y enfoca el cartel hasta que se lee *CIRCO DEL TERROR*, con la
fecha, la hora y la dirección como estampado de cámara.

Es un gesto de arrastre, no un clic: nace del tema en vez de estar pegado
encima, y en celular el arrastre es táctil de nacimiento.

### 7.3 La secuencia del globo, en detalle

Pedida explícitamente y validada en prototipo. Tres fases:

1. El globo ocupa el **86% del ancho** de la sección. A esa escala no es un
   adorno: es un obstáculo. (Un globo de 60px es un ícono y reventarlo no se
   siente; uno de 290px sí.) Flota suavemente. Aviso: "toca el globo".
2. Al tocarlo: rebote corto (escala 1 → 1,26 → 0) y, en el mismo cuadro, tres
   cosas distintas — una salpicadura de fondo que queda al 32% de opacidad,
   ~30 gotas disparadas radialmente con caída, y ~10 chorretones que escurren
   hacia abajo con anchos y separaciones irregulares. **Los chorretones se
   quedan**: la sangre no se limpia, como si hubiera salpicado el lente.
3. Sube Pennywise desde abajo y queda en **loop**: balanceo suave y su globito
   meciéndose. Aparecen los casilleros de las fotos de disfraz.

### 7.4 Movimiento: reglas generales

- Las secciones son `min-height: 100svh`. **Sin `scroll-snap`**: hay secciones
  con formularios y listas que superan el alto de pantalla, y el snap las pelea.
- Cada atracción se dispara con `IntersectionObserver` al 55% de visibilidad,
  **una vez por carga**. No se repite al volver a pasar.
- Solo se animan `transform` y `opacity`. Nada de animar `width`, `top` o
  `filter` en bucle. (El `height` de los chorretones es la única excepción
  aceptada: son 10 elementos, una sola vez.)
- **`prefers-reduced-motion: reduce`** salta al estado final de cada sección: sin
  reventón, sin sangre volando, sin saltos de banda, sin barridos. El contenido
  queda visible y legible.
- Las capas de grado de cinta en bucle (barrido, grano) se pausan cuando la
  sección no está visible.

---

## 8. Los archivos de los personajes

Siete imágenes en `src/img/`. **Deben moverse a `public/img/`**: Next solo sirve
estáticos desde `public/`.

| Archivo | Qué es | Estado |
|---|---|---|
| `terrifier.jpg` | Art el payaso, cómic a color, 2800×3500 | Fondo negro puro (#040404). Va tal cual |
| `ghostface.webp` | Ghostface, vector, 1000×1000 | **Ya trae transparencia.** Va tal cual |
| `samara.jpg` | Samara de espaldas, 792×1224 | Degradado de estudio. Va como fotograma, sin recortar |
| `michaelMyers1.webp` | Michael Myers con cuchillo, 792×1224 | Degradado de estudio. Va como fotograma, sin recortar |
| `payasoit.jpg` | Pennywise chibi con globo, 564×1001 | Recortado. Ver abajo |
| `leatherface.webp` | Leatherface, estarcido B/N, 2000×2000 | Fondo rojo plano recortado → 1300×1905 |
| `jigsaw.png` | Billy en triciclo, 920×621 | Tablero de ajedrez recortado → 252×598 |

Samara y Michael Myers son del mismo ilustrador y comparten estilo y fondo. No
se recortan: el degradado es deliberado y recortarlo mal se notaría.

### 8.1 Recortes ya producidos

Hechos con `sharp`, mediante relleno por difusión **desde los bordes** —lo que
respeta los blancos interiores (la cara de un personaje) en vez de borrar todo
lo claro, que es el error típico. Viven hoy en
`.superpowers/brainstorm/1439-1793152843/content/` y deben copiarse a
`public/img/`:

- `it-payaso.png` (219×378) — Pennywise sin el globo
- `it-globo.png` (93×84) — solo el globo, para el loop
- `cut-leatherface-t.png` (1300×1905)
- `cut-jigsaw-t.png` (252×598) — incluye una segunda pasada que limpia el hueco
  encerrado entre el brazo y el cuerpo, al que el relleno desde los bordes no
  llega

El script está en el scratchpad de la sesión; conviene volver a crearlo en
`scripts/key-bg.js` del repositorio para poder repetir el proceso.

### 8.2 El globo grande va en vector

El recorte real del globo mide 93px. A los ~290px que ocupa en el celular se
pixela. **El globo de la fase 1 se dibuja en SVG**, con los colores muestreados
de la ilustración (`#c86164` → `#ad4345` → `#663338`, con brillo en `#e6a0a0`).
El globito del loop sí usa el recorte original, donde 93px alcanzan de sobra.

### 8.3 Imágenes de las preguntas de trivia

El banco actual apunta a fotos personales en `public/img/` del concepto anterior
(`t01`…`t20`). **El banco se reemplaza completo** por preguntas de terror
moderno. Las imágenes de apoyo son decisión posterior; el motor ya soporta
`imageUrls: string[]` con carrusel.

---

## 9. Las funcionalidades

Tres superficies distintas:

- **Celular** (`/`, `/trivia`) — lo que usan los seis.
- **TV** (`/proyeccion`) — tablero, podio, marcador. Sin interacción.
- **Host** (`/admin`) — control de JL: abrir preguntas, calificar, cerrar
  votaciones, avanzar la agenda.

### 9.1 Listado

| # | Funcionalidad | Superficie | Origen |
|---|---|---|---|
| 1 | Tema y landing del Circo del Terror | Celular | Nuevo |
| 2 | Cuenta regresiva al 31 | Celular | Se adapta `Countdown.tsx` |
| 3 | Login con Google | Todas | Se reutiliza `firebase.ts` |
| 4 | Agenda de la noche, con el bloque en curso resaltado | Celular + TV | Nuevo |
| 5 | Menú colaborativo: proponer, votar, asignar | Celular | Nuevo |
| 6 | Registro de disfraz (foto) | Celular | Nuevo |
| 7 | Votación de la película de cierre | Celular | Nuevo |
| 8 | Trivia de terror | Las tres | Se reutiliza el motor completo |
| 9 | Ronda de audio en la trivia | Las tres | Extensión del motor |
| 10 | Misiones secretas | Celular + TV | Patrón heredado de `rsvp.ts` |
| 11 | Votación de disfraces por categorías | Celular + TV | Nuevo |
| 12 | Plan de supervivencia: turnos, cronómetro, votación | Las tres | Nuevo |
| 13 | Dos verdades y una mentira | Las tres | Nuevo |
| 14 | Marcador de Almas (puntaje global) | Las tres | Nuevo, agrega a todo |
| 15 | Pantalla de proyección | TV | Se adapta `/proyeccion` |
| 16 | Panel de admin | Host | Se adapta `/admin` |

El juego del impostor se menciona en la agenda como una opción, sin soporte en
el sitio. (Era la funcionalidad 17; descartada por JL.)

### 9.2 La agenda

| Hora | Bloque | Dinámica |
|---|---|---|
| 7:00 pm | Llegada y cocina | Misión secreta en el celular, foto de disfraz, todos a la cocina |
| 9:00 pm | Cena | Votación de disfraces |
| 10:00 pm | Trivia de terror | ~40 min, con ronda de audio |
| 11:00 pm | Plan de supervivencia | 2 min por persona + votación |
| 12:00 am | Dos verdades y una mentira | Una ronda por persona |
| 1:00 am | Impostor | Sin soporte del sitio |
| 1:30 am | Revelación de misiones + Marcador de Almas | Premiación |
| 2:00 am | Película de cierre | La votada antes del evento |

La agenda resalta el bloque en curso según la hora real, con zona horaria de
Lima (`America/Lima`, UTC−5, sin horario de verano). El host puede forzar el
bloque desde `/admin` si la noche se adelanta o se atrasa, que es lo normal.

### 9.3 Reglas de cada dinámica

**Menú.** Cualquiera autenticado propone un plato (título + quién lo propone).
Todos votan; un voto por persona por plato, retirable. Los platos ganadores se
convierten en tareas: el host asigna cada plato a una persona, y cada quien ve
**su** asignación destacada. Hay dos tipos de tarea: *cocinar* y *traer*.

**Disfraces.** Cada uno sube una foto. Cuatro categorías: más terrorífico, más
original, más improvisado, mejor pareja. Voto secreto, **nadie puede votarse a
sí mismo**. Con seis personas, cuatro categorías aseguran que casi todos ganen
algo, que es el punto.

**Misiones secretas.** Al llegar, cada uno recibe **una** misión del banco, al
azar y sin repetir, entregada con una animación de sobre sellado. Nadie más la
ve. Son cosas como *hacer que alguien diga "no puede ser"* o *lograr que dos
personas se cambien de asiento*. A la 1:30 se revelan todas y el grupo vota
quién la cumplió.

**Plan de supervivencia.** Cada uno elige 3 villanos y tiene 2 minutos para
explicar cómo los vencería. Cronómetro en la TV. Al final, votación al plan más
convincente; no se puede votar por uno mismo.

**Dos verdades y una mentira, edición paranormal.** Cada uno escribe tres
experiencias raras **propias**, una inventada. Por turno, el resto vota cuál es
la mentira. Se revela al instante. Reemplaza al clásico "cuenten historias de
terror", cuyo problema es que siempre hay alguien sin material; con anécdotas
reales nadie se queda sin nada que decir.

**Marcador de Almas.** Suma de todo: disfraces, trivia, supervivencia, mentiras
y misiones. **Un solo ganador al final de la noche.** El reparto exacto de
puntos entre dinámicas queda al constructor (ver §12), con una sola condición:
la trivia no debe decidir sola el resultado.

---

## 10. Entregas

El alcance está ordenado por la restricción de tiempo, no por preferencia.

### Entrega 1 — circula en el grupo (miércoles 28 / jueves 29)

Funcionalidades 1 a 7. Es lo único que se usa **antes** del 31, así que es lo
que tiene que salir primero.

Atracciones incluidas: **portada** (Art), **agenda** (Art de maestro de
ceremonias), **menú** (Leatherface), **disfraces** (el globo de Pennywise),
**película** (proyector).

### Entrega 2 — antes del sábado (jueves 29 / viernes 30)

Funcionalidades 8 a 16. Son todas cosas que ocurren **durante** la noche.

Atracciones restantes: **trivia** (Samara), **misiones** (Jigsaw),
**supervivencia** (Michael Myers), **mentiras** (Ghostface), **marcador**
(cementerio).

### Sobre el costo de las atracciones

Son diez animaciones hechas a mano, cada una distinta. Es el rubro más caro del
proyecto y el que más fácil se degrada bajo presión de tiempo. Si hay que
recortar, **se recorta la cantidad de atracciones, no su calidad**: una sección
puede entrar con una aparición simple y seguir siendo digna. Tres atracciones
excelentes y siete sobrias se ven mucho mejor que diez a medias.

---

## 11. Qué se borra y qué se conserva

### Se conserva tal cual (o casi)

```
src/lib/trivia.ts              motor: tipos, suscripciones, siembra, flujo
src/lib/trivia-scoring.ts      calificación idempotente, velocidad y racha
src/components/trivia/options.ts        colores y formas de alternativas
src/components/trivia/useQuestionTimer.ts
src/components/trivia/TriviaBoard.tsx   tablero de TV (se reviste con el tema)
src/components/Avatar.tsx
src/lib/firebase.ts
firestore.rules                el bloque de trivia (líneas ~84–141)
```

**No romper al refactorizar:** la clave correcta vive en `triviaKeys`, que el
jugador no puede leer; `triviaQuestions` solo es legible para la pregunta
activa; `triviaResponses` solo permite `create` con id `{preguntaId}_{uid}`.
Esas tres reglas son toda la protección anti-trampa.

### Se borra

```
src/lib/rsvp.ts, questions.ts, wishlist.ts, interrogation.ts, checkin.ts
src/components/sections/  Hero, Facts, RsvpForm, Gifts, Notes, GroupReveal, Kahoot
src/components/CaseStamp.tsx, CaseLoader.tsx
src/app/ingreso/, src/app/poster/
src/lib/trivia-bank.ts    (se reemplaza el contenido, se conserva el tipo)
public/img/t*.jpg, public/img/1_*.jpg   fotos personales del concepto anterior
```

`/proyeccion` y `/admin` se conservan como rutas pero se reescriben: hoy mezclan
el flujo de testigos con la trivia.

### Se hereda como patrón, no como código

`rsvp.ts` resuelve la asignación aleatoria sin repetir mediante una transacción
de Firestore, y `GroupReveal` tiene la animación de sobre sellado. Las misiones
secretas (#10) necesitan exactamente las dos cosas. Conviene leer ese código
antes de escribir el nuevo.

---

## 12. Modelo de datos

Colecciones nuevas, además de las cinco de trivia que ya existen
(`triviaGame`, `triviaQuestions`, `triviaKeys`, `triviaResponses`,
`triviaScores`).

```
party/live           { agendaBlock, forcedBlock, openActivity }
guests/{uid}         { name, photoURL, arrivedAt }

dishes/{id}          { title, kind: 'cocinar'|'traer', proposedBy,
                       voteCount, assignedTo }
dishVotes/{dishId}_{uid}   { dishId, uid }

costumes/{uid}       { photo, uploadedAt }
costumeVotes/{voterUid}_{category}  { category, targetUid }

missionBank/{id}     { text, taken, assignedToName }
missions/{uid}       { missionId, text, completed }

survivalVotes/{voterUid}   { targetUid }

lieRounds/{uid}      { statements: string[3] }
lieKeys/{uid}        { lieIndex }          ← solo admin, igual que triviaKeys
lieVotes/{roundUid}_{voterUid}  { guessIndex }

movieVotes/{uid}     { movieId }
movies/{id}          { title, posterUrl }

souls/{uid}          { name, photoURL, total,
                       breakdown: { trivia, disfraces, supervivencia,
                                    mentiras, misiones } }
```

### Decisiones del modelo

**Las fotos de disfraz van como data URL dentro del documento**, no en Firebase
Storage. El cliente redimensiona a 640px de lado mayor y comprime a JPEG q0,72
antes de subir: ~60–90 KB, que en base64 quedan en ~80–120 KB, muy por debajo
del límite de 1 MiB por documento de Firestore. Para seis personas son ~600 KB
en total. Evita configurar Storage y sus reglas en cuatro días. **El cliente
debe rechazar cualquier resultado que supere 900 KB.**

**Las claves ocultas viven en una colección aparte**, igual que `triviaKeys`:
`lieKeys` guarda cuál de las tres frases es la mentira, y solo el admin la lee.
Es el mismo patrón ya probado, aplicado a la dinámica nueva.

**Los votos los cuenta el host, no el cliente.** Mientras una votación está
abierta, solo el admin puede leer los votos (si no, el "voto secreto" no existe).
Al cerrarla, el admin publica el resultado y los puntos en `souls`. Es
exactamente el flujo de `gradeQuestion()`, reutilizado. Toda escritura de puntos
debe ser **idempotente**, con una lista de actividades ya calificadas en
`party/live`, para que un reintento tras un corte de señal no duplique puntos.

**No votarse a sí mismo** se valida en las reglas de Firestore
(`request.resource.data.targetUid != request.auth.uid`), no solo en la interfaz.

---

## 13. Decisiones que tomé yo

Quedan marcadas porque el constructor podría razonablemente discrepar:

- **El nombre es "Circo del Terror"**, sobre la base de "algo así" que dijo JL.
- **Mono para los textos de lectura**, en vez de añadir una tercera tipografía.
- **Sin `scroll-snap`**, por los formularios.
- **Las atracciones se disparan una sola vez por carga**, no cada vez que se
  vuelve a pasar por la sección.
- **Samara y Michael Myers no se recortan.**
- **Fotos como data URL** en vez de Firebase Storage.
- **`ADMIN_EMAIL` sigue duplicado** entre `src/lib/event-config.ts` y
  `firestore.rules`. Las reglas no pueden importar del código. Centralizarlo en
  un documento de Firestore obligaría a un `get()` en cada evaluación de regla;
  con cuatro días por delante, no vale el riesgo. Debe quedar comentado en ambos
  lugares.

---

## 14. Lo que queda al constructor

- **El reparto de puntos del Marcador de Almas** entre las cinco dinámicas.
  Única condición: que la trivia no decida sola el resultado.
- **El banco de preguntas de la trivia** (terror moderno) y el de misiones
  secretas. JL los siembra después; el motor ya tiene el botón.
- **Las películas candidatas** para la votación de cierre.
- **Cómo se implementa la ronda de audio** (#9): el motor hoy entiende
  `imageUrls`. Hay que extenderlo con audio sin romper la compatibilidad con las
  preguntas que solo tienen imágenes.
- **La estructura de componentes** del tema: qué parte del grado de cinta es un
  componente, qué es una clase de utilidad de Tailwind y qué es CSS global.
- **El orden exacto de las secciones** en la página, más allá de que la portada
  va primero y el marcador al final.

---

## 15. Riesgo conocido

La calificación de la trivia corre en el navegador del host. Si JL cierra la
pestaña o se queda sin batería a mitad de la partida, el juego se detiene. Es
una limitación heredada y **aceptada**: funciona bien para una fiesta de seis
personas, y moverlo a una Cloud Function no entra en cuatro días. Mitigación:
`/admin` ya advierte que hay que mantener la pestaña abierta, y la calificación
es idempotente, así que reintentar tras un corte no duplica puntos.
