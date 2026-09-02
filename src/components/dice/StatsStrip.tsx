import { useMemo } from "react";
import { SpokenLabel } from "@/components/dice/SpokenLabel";
import { useDiceStore } from "@/lib/dice/store";

export function StatsStrip() {
  const history = useDiceStore((s) => s.history);

  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        n: 0,
        mean: 0,
        expected: 0,
        high: 0,
        low: 0,
        natMax: 0,
        natMin: 0,
      };
    }
    let sum = 0;
    let exp = 0;
    let high = -Infinity;
    let low = Infinity;
    let natMax = 0;
    let natMin = 0;
    for (const roll of history) {
      sum += roll.total;
      exp += roll.expected;
      high = Math.max(high, roll.total);
      low = Math.min(low, roll.total);
      for (const die of roll.dice) {
        if (!die.kept) continue;
        const isPositive = (die.sign ?? 1) > 0;
        if (isPositive && die.face === die.sides) natMax += 1;
        if (isPositive && die.face === 1) natMin += 1;
      }
    }
    return {
      n: history.length,
      mean: sum / history.length,
      expected: exp / history.length,
      high,
      low,
      natMax,
      natMin,
    };
  }, [history]);

  const cells = [
    { label: "Rolls", hint: "Casts in this table", value: String(stats.n) },
    { label: "Mean", hint: "Average total so far", value: stats.n ? stats.mean.toFixed(1) : "—" },
    {
      label: "Expected",
      hint: "What the table predicted",
      value: stats.n ? stats.expected.toFixed(1) : "—",
    },
    { label: "High", hint: "Best total", value: stats.n ? String(stats.high) : "—" },
    { label: "Low", hint: "Worst total", value: stats.n ? String(stats.low) : "—" },
    {
      label: "Max faces",
      hint: "A kept die showed its highest face",
      value: stats.n ? String(stats.natMax) : "—",
    },
    {
      label: "Ones",
      hint: "A kept die showed a 1",
      value: stats.n ? String(stats.natMin) : "—",
    },
  ];

  return (
    <section aria-labelledby="stats-heading" className="overflow-hidden rounded-xl border border-border">
      <h2 id="stats-heading" className="sr-only">
        Session statistics
      </h2>
      <dl className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4 lg:grid-cols-7">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="min-w-0 bg-card px-3 py-3 sm:px-4 first:col-span-2 sm:first:col-span-2 lg:first:col-span-1"
            title={`${cell.label}: ${cell.hint}`}
          >
            <dt className="text-xs text-subtle">
              <SpokenLabel>{cell.label}</SpokenLabel>
            </dt>
            <dd className="mt-1 font-mono text-lg tabular-nums text-foreground">
              {cell.value}
              <span className="mt-1 block font-sans text-xs font-normal leading-snug text-subtle">
                {cell.hint}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
