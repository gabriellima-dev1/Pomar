import type { WeekDot } from "@/lib/gamification/present";

/** As 7 bolinhas da colheita da semana (`--fruit` = dia com emblema). Telas 01 e 12. */
export function WeekDots({ days, size = 14 }: { days: WeekDot[]; size?: number }) {
  const count = days.filter((d) => d.code).length;
  return (
    <span className="flex items-center gap-1.5" role="img" aria-label={`${count} de 7 dias`}>
      {days.map((d) => (
        <span
          key={d.day}
          aria-hidden
          className={`rounded-full ${d.code ? "bg-fruit" : "bg-surface-300"}`}
          style={{ width: size, height: size }}
        />
      ))}
    </span>
  );
}
