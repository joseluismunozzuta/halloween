"use client";

/**
 * El casete de la misión.
 *
 * Un sobre no decía nada: es papelería de oficina. Billy, que es quien entrega
 * esta sección, no reparte sobres — reparte **cintas**: «quiero jugar un
 * juego» llega grabado en un casete, y eso además cae justo en el idioma del
 * sitio, que entero es una cinta encontrada.
 *
 * Tres estados, uno por momento:
 *  - `sellado`: la cinta sin tocar, los carretes quietos, con su botón de PLAY.
 *  - `girando`: los carretes giran mientras se reparte la misión.
 *  - `listo`: la etiqueta ya tiene el nombre de la misión escrito encima.
 */
export function Casete({
  estado,
  nombre,
  texto,
  onPlay,
}: {
  estado: "sellado" | "girando" | "listo";
  nombre?: string;
  texto?: string;
  onPlay?: () => void;
}) {
  const girando = estado === "girando";
  const sellado = estado === "sellado";

  const cuerpo = (
    <div className="casete relative w-full overflow-hidden px-4 py-4">
      {/* Los dos tornillos de arriba, que es lo que hace que un rectángulo
          se lea como carcasa de plástico y no como una tarjeta. */}
      <span aria-hidden className="tornillo left-2.5 top-2.5" />
      <span aria-hidden className="tornillo right-2.5 top-2.5" />

      {/* La etiqueta pegada: antes de abrir trae el rótulo del banco, después
          el nombre de la misión que te tocó. */}
      <div className="casete-etiqueta px-3 py-2">
        <p className="text-[8px] tracking-[0.25em] text-tape/70">
          {sellado ? "CINTA SIN ABRIR" : "MISIÓN"}
        </p>
        <p className="mt-0.5 truncate font-cartel text-[15px] uppercase leading-tight text-tape">
          {nombre ?? "Quiero jugar un juego"}
        </p>
      </div>

      {/* La ventana con los dos carretes y la cinta entre ellos. Sin abrir, el
          rollo está entero en el de la izquierda; al final, en el de la derecha. */}
      <div className="casete-ventana mt-3 flex items-center justify-between gap-3 px-4 py-3">
        <Carrete girando={girando} lleno={sellado} />
        <div className="relative h-[3px] flex-1 bg-[#2a1a12]">
          <span
            aria-hidden
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-[#6b4a35] to-transparent ${
              girando ? "cinta-corre" : ""
            }`}
          />
        </div>
        <Carrete girando={girando} lleno={!sellado} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[8px] tracking-[0.2em] text-muted">
          {girando ? "REPRODUCIENDO" : sellado ? "SIN ABRIR" : "FIN DE LA CINTA"}
        </span>
        {girando && (
          <span aria-hidden className="rec-dot block h-[7px] w-[7px] rounded-full bg-rec" />
        )}
      </div>
    </div>
  );

  // Sellada o girando: la cinta todavía no dice nada, así que lo único que
  // importa es el botón. Antes el casete entero era el botón y debajo decía
  // «tocar para reproducir»; en un celular eso se lee como un adorno y la
  // única palabra grande que quedaba era STOP, que parece un error.
  if (sellado || girando) {
    return (
      <div>
        {cuerpo}
        <button
          type="button"
          onClick={onPlay}
          disabled={girando}
          className="btn-sangre mt-3 w-full"
        >
          {girando ? "ABRIENDO…" : "▶ OBTENER MI MISIÓN"}
        </button>
      </div>
    );
  }

  return (
    <div>
      {cuerpo}
      {texto && (
        <div className="mt-3 border border-tape-line bg-tape-deep/80 px-4 py-4">
          <p className="text-[12px] leading-[1.65] text-bone">{texto}</p>
          <p className="mt-3 text-[10px] leading-[1.5] text-muted">
            Cúmplela sin que te descubran.
          </p>
        </div>
      )}
    </div>
  );
}

/** Un carrete. `lleno` cambia cuánta cinta tiene enrollada encima. */
function Carrete({ girando, lleno }: { girando: boolean; lleno: boolean }) {
  return (
    <span className={`carrete ${girando ? "carrete-gira" : ""}`} aria-hidden>
      <span className={`carrete-cinta ${lleno ? "carrete-lleno" : ""}`} />
      {/* Los seis dientes del eje: son los que dejan ver que gira. */}
      {[0, 60, 120, 180, 240, 300].map((grado) => (
        <span
          key={grado}
          className="carrete-diente"
          style={{ transform: `rotate(${grado}deg) translateY(-9px)` }}
        />
      ))}
    </span>
  );
}
