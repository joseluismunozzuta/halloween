/** La barra del visor de la cámara: el punto de REC y la fecha de grabación. */
export function Osd({ right = "31 OCT 2026" }: { right?: string }) {
  return (
    <div className="flex items-center justify-between text-[10px] tracking-[0.1em]">
      <span className="flex items-center gap-1.5 text-rec">
        <span aria-hidden className="rec-dot block h-[7px] w-[7px] rounded-full bg-rec" />
        REC
      </span>
      <span className="text-muted">{right}</span>
    </div>
  );
}
