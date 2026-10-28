import { Portada } from "@/components/atracciones/Portada";
import { Agenda } from "@/components/atracciones/Agenda";
import { Disfraces } from "@/components/atracciones/Disfraces";
import { Menu } from "@/components/atracciones/Menu";
import { Trivia } from "@/components/atracciones/Trivia";
import { Misiones } from "@/components/atracciones/Misiones";
import { Supervivencia } from "@/components/atracciones/Supervivencia";
import { Mentiras } from "@/components/atracciones/Mentiras";
import { Marcador } from "@/components/atracciones/Marcador";
import { Pelicula } from "@/components/atracciones/Pelicula";

/**
 * El recorrido del circo, carpa por carpa. El orden sigue el de la noche: lo
 * que se usa antes del 31 va primero, después las dinámicas en el orden en que
 * ocurren, y el marcador al final porque es el cierre.
 */
export default function Home() {
  return (
    <div className="mx-auto w-full max-w-[520px]">
      <Portada />
      <Agenda />
      <Menu />
      <Disfraces />
      <Trivia />
      <Misiones />
      <Supervivencia />
      <Mentiras />
      <Marcador />
      <Pelicula />
    </div>
  );
}
