/** Pantalla de espera: la cinta todavía no engancha la señal. */
export function TapeLoader({ label }: { label: string }) {
  return (
    <main className="scanlines grain relative flex min-h-[100svh] flex-col items-center justify-center gap-4 px-6">
      <span className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-rec">
        <span aria-hidden className="rec-dot block h-[7px] w-[7px] rounded-full bg-rec" />
        REC
      </span>
      <p className="text-center text-[11px] tracking-[0.25em] text-muted">{label}</p>
    </main>
  );
}
