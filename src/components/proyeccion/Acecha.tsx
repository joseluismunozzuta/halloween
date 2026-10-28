import Image from "next/image";

/**
 * Un personaje al borde de la proyección.
 *
 * La regla que lo mantiene a raya: acecha, no presenta. Va oscurecido, con los
 * bordes difuminados y detrás del contenido, porque lo que hay que leer desde
 * el sofá es la pregunta, no el monstruo. Si alguna vez compite con el texto,
 * el que sobra es el monstruo.
 *
 * Dos reglas más, que son las que evitan que esto se vuelva un collage:
 *
 * 1. Solo salen en las pantallas donde no hay nada que leer —la sala de espera
 *    y el podio—, nunca sobre una pregunta. Los monstruos aparecen cuando el
 *    grupo está esperando, que es justo cuando la pantalla necesita ambiente.
 * 2. Solo sirven los recortes con fondo transparente. Los personajes que son
 *    fotograma (Art, Samara, Michael) traen su propio fondo y acá se verían
 *    como un rectángulo pegado encima.
 */
export function Acecha({
  src,
  lado,
  ancho = 320,
  alto = 520,
}: {
  src: string;
  lado: "izquierda" | "derecha";
  ancho?: number;
  alto?: number;
}) {
  return (
    <div
      aria-hidden
      className="acecha hidden lg:block"
      style={{
        width: ancho,
        height: alto,
        [lado === "izquierda" ? "left" : "right"]: "-1.5rem",
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="320px"
        className="object-contain object-bottom"
      />
    </div>
  );
}
