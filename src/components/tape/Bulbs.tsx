/**
 * Focos de la carpa persiguiéndose alrededor de un marco.
 * El elemento padre tiene que ser `position: relative`.
 */
export function Bulbs({ cols = 9, rows = 4 }: { cols?: number; rows?: number }) {
  const spots: { left: string; top: string }[] = [];

  for (let i = 0; i <= cols; i++) {
    const left = `${(i / cols) * 100}%`;
    spots.push({ left, top: "0%" }, { left, top: "100%" });
  }
  for (let i = 1; i < rows; i++) {
    const top = `${(i / rows) * 100}%`;
    spots.push({ left: "0%", top }, { left: "100%", top });
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
      {spots.map((spot, i) => (
        <span
          key={i}
          className="bulb"
          style={{ ...spot, animationDelay: `${(i % 24) * 0.07}s` }}
        />
      ))}
    </div>
  );
}
