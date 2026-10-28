# 🎪 Circo del Terror

> **FUNCIÓN ÚNICA — 31 de octubre de 2026, 7:00 pm, casa de Alexandra.**
> Seis entran. Uno gana.

Agenda viva de una noche de Halloween para seis amigos. Antes del 31 sirve para
decidir el menú y salir con una tarea asignada; el 31 es el mando de todas las
dinámicas de la noche.

El sitio es **una cinta VHS que alguien encontró**, grabada en un circo del
terror. El VHS pone el lenguaje visual; el circo pone el tema, y cada sección
es una atracción con su propio monstruo.

## El concepto

La regla que sostiene el diseño: **el monstruo no acompaña a la sección, la
sección entra por culpa del monstruo**. El globo de Pennywise no está al lado
del concurso de disfraces — es lo que te tapa el concurso hasta que revienta.
El cuchillo de Michael Myers no adorna el plan de supervivencia, lo abre de un
tajo.

| Sección | Personaje | Cómo entra |
|---|---|---|
| Portada | Art el payaso | Arrastras el tracking y la cinta se enfoca |
| Agenda | Chucky | Los reflectores se encienden sobre cada hora |
| Menú | Leatherface | El carnicero preside la cocina |
| Disfraces | Pennywise | El globo revienta, sangra, y queda en loop |
| Trivia | Samara | Sale del televisor, que es donde corre la trivia |
| Misiones | Jigsaw | «Quiero jugar un juego»: tu misión, en secreto |
| Supervivencia | Michael Myers | Un tajo abre la sección en dos |
| Mentiras | Ghostface | La voz al teléfono que miente |
| Marcador | Cementerio | Lápida para el podio, fantasmas para el resto |
| Película | Proyector | La bobina tira la votación contra la pared |

## Rutas

| Ruta | Para qué | Pensada para |
|---|---|---|
| `/` | El recorrido completo del circo | Celular |
| `/soy` | «¿Quién eres?» — ata tu cuenta a una persona | Celular |
| `/trivia` | El mando del jugador | Celular |
| `/proyeccion` | Tablero de la TV | Pantalla grande |
| `/admin` | Cabina de proyección (solo el anfitrión) | Cualquiera |

`/proyeccion` acepta `?modo=mentiras` y `&fase=resultado` mientras el backend
no decida el modo solo.

## Quién es quién

Todos entran con Google, pero Google no sabe que Mar y Jose son pareja. La
primera vez que entras eliges tu nombre en `/soy` y queda atado a tu cuenta.
Las tres parejas están en [`src/lib/identidad.ts`](src/lib/identidad.ts), junto
con un atajo opcional por correo para saltarse la pantalla.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19.2, React Compiler)
- **Tailwind v4** — los componentes propios viven en `@layer components`, si no
  el CSS sin capa le gana a las utilidades
- **Firebase**: Auth (Google) + Firestore, sin backend propio
- Dos tipografías: **Alfa Slab One** (cartel de circo) y **Share Tech Mono**
  (visor de cámara)

## Correr

```bash
npm install
npm run dev      # desarrollo
npm run build    # build de producción
npm start        # servir el build
```

Firebase requiere, una sola vez desde la consola: habilitar el proveedor
Google, crear Firestore y pegar [`firestore.rules`](firestore.rules).

## Estado

Frontend y backend completos: todas las dinámicas leen y escriben en Firestore.
No queda nada con datos de muestra.

Antes de usarlo quedan **tres pasos manuales**, todos en la consola de Firebase
o desde la cabina:

1. Pegar [`firestore.rules`](firestore.rules) en Firestore → Reglas y publicar.
   Hasta que esto pase, el sitio carga pero cualquier escritura se rechaza.
2. Desde `/admin/trivia`, sembrar el banco de preguntas.
3. Desde `/admin/noche`, sembrar el banco de misiones.

Opcional: añadir los correos del grupo en
[`src/lib/identidad.ts`](src/lib/identidad.ts) para que se salten la pantalla
de «¿quién eres?».

El diseño y el modelo de datos están escritos en
[`docs/superpowers/specs/2026-10-27-circo-del-terror-design.md`](docs/superpowers/specs/2026-10-27-circo-del-terror-design.md).

### Cómo se reparten los puntos

Cada dinámica aporta al mismo Marcador de Almas, y la trivia vuelca su
**puesto final** —no sus puntos crudos— para que no decida la noche ella sola.

| Dinámica | Aporta |
|---|---|
| Trivia | 1000 / 800 / 600 / 400 / 300 / 200 según el puesto |
| Disfraces | 400 por categoría ganada, a los dos de la pareja |
| Supervivencia | 600 al mejor plan |
| Mentiras | 200 por acertar la ajena, 150 por cada quien que no descubra la tuya |
| Misiones | 500 si el grupo da la tuya por cumplida |

Los números viven en [`src/lib/almas.ts`](src/lib/almas.ts).

## Editar el contenido

- Fecha, lugar e invitados: [`src/lib/event-config.ts`](src/lib/event-config.ts)
- Bloques de la noche: [`src/lib/agenda.ts`](src/lib/agenda.ts)
- Parejas: [`src/lib/identidad.ts`](src/lib/identidad.ts)
- Banco de la trivia: [`src/lib/trivia-bank.ts`](src/lib/trivia-bank.ts)
- Personajes: `public/personajes/` (los originales, en `src/img/`)
