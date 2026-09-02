import { cn } from "@/lib/utils";
import { describeDie, describeDieTitle } from "@/lib/dice/a11y";
import type { DieFace as DieFaceData } from "@/lib/dice/types";

const PIP_MAP: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Pips({ n }: { n: number }) {
  const on = new Set(PIP_MAP[n] ?? []);
  return (
    <div className="grid size-8 grid-cols-3 grid-rows-3 place-items-center" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className={cn("size-1.5 rounded-full", on.has(i) ? "bg-die-fg" : "bg-transparent")}
        />
      ))}
    </div>
  );
}

type Props = {
  die: DieFaceData;
  rolling?: boolean;
  delay?: number;
  size?: "sm" | "md" | "lg";
};

export function DieFace({ die, rolling = false, delay = 0, size = "md" }: Props) {
  const sign = die.sign ?? 1;
  const isMax = die.face === die.sides;
  const isMin = die.face === 1;
  const shape =
    die.sides === 4
      ? "clip-d4"
      : die.sides === 8
        ? "clip-d8"
        : die.sides === 10
          ? "clip-d10"
          : die.sides === 12
            ? "clip-d12"
            : die.sides === 20
              ? "clip-d20"
              : "rounded-lg";
  const name = describeDie(die);
  const title = describeDieTitle(die);

  const isPositive = sign > 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "relative",
          isMax && die.kept && isPositive && "[filter:drop-shadow(0_0_4px_var(--color-max))]",
          isMin && die.kept && isPositive && !die.exploded && die.sides >= 20 && "[filter:drop-shadow(0_0_4px_var(--color-crit))]",
        )}
      >
        {sign < 0 ? (
          <span
            className="pointer-events-none absolute -left-1 -top-1 z-10 rounded-sm bg-card px-0.5 font-mono text-[0.65rem] leading-none text-crit"
            aria-hidden
          >
            −
          </span>
        ) : null}
        <div
          role="img"
          aria-label={name}
          className={cn(
            "die relative grid place-items-center bg-die text-die-fg",
            shape,
            size === "sm" && "size-10",
            size === "md" && "size-14",
            size === "lg" && "size-16",
            !die.kept && "opacity-35",
            rolling && "die-tumble",
            isMax && die.kept && isPositive && "ring-1 ring-max/50",
            isMin && die.kept && isPositive && !die.exploded && die.sides >= 20 && "ring-1 ring-crit/50",
          )}
          style={{ animationDelay: `${delay}ms` }}
          title={title}
        >
          {die.sides === 6 && die.face >= 1 && die.face <= 6 ? (
            <Pips n={die.face} />
          ) : (
            <span
              aria-hidden="true"
              className={cn(
                "font-mono font-medium tabular-nums leading-none",
                size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base",
              )}
            >
              {die.face}
            </span>
          )}
        </div>
      </div>
      {size !== "sm" || sign < 0 ? (
        <span className="font-mono text-[0.65rem] uppercase tracking-wide text-subtle" aria-hidden="true">
          {sign < 0 ? "−" : ""}d{die.sides}
        </span>
      ) : null}
    </div>
  );
}
