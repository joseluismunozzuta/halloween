import { Portada } from "@/components/atracciones/Portada";
import { Agenda } from "@/components/atracciones/Agenda";
import { Disfraces } from "@/components/atracciones/Disfraces";
import { Trivia } from "@/components/atracciones/Trivia";
import { Misiones } from "@/components/atracciones/Misiones";
import { Supervivencia } from "@/components/atracciones/Supervivencia";
import { Mentiras } from "@/components/atracciones/Mentiras";
import { Marcador } from "@/components/atracciones/Marcador";
import { Pelicula } from "@/components/atracciones/Pelicula";

/**
 * El recorrido del circo, carpa por carpa.
 *
 * El orden es el de la noche, de principio a fin: lo primero que abres al
 * llegar arriba del todo y lo último que pasa abajo. Así, a cualquier hora,
 * lo que te toca está más o menos donde te quedaste la vez anterior.
 */
export default function Home() {
  return (
    <div className="mx-auto w-full max-w-[520px]">
      <Portada />
      <Agenda />
      <Misiones />
      <Supervivencia />
      <Disfraces />
      <Mentiras />
      <Trivia />
      <Marcador />
      <Pelicula />
    </div>
  );
}
