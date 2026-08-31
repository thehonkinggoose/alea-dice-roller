import { useMemo } from "react";
import { DieFace } from "@/components/dice/DieFace";
import { SpokenLabel } from "@/components/dice/SpokenLabel";
import { Badge } from "@/components/ui/badge";
import { rollFactorFlags } from "@/lib/dice/engine";
import { useDiceStore } from "@/lib/dice/store";

export function DiceTray() {
  const last = useDiceStore((s) => s.last);
  const rolling = useDiceStore((s) => s.rolling);

  const kept = last?.dice.filter((d) => d.kept) ?? [];
  const dropped = last?.dice.filter((d) => !d.kept) ?? [];
  const delta = last ? last.total - last.expected : 0;
  const n = kept.length + dropped.length;
  const step = n > 12 ? Math.max(12, Math.floor(400 / Math.max(n - 1, 1))) : 40;
  const flags = last ? rollFactorFlags(last) : null;

  const totalLabel = useMemo(() => {
    if (!last) return "—";
    return String(last.total);
  }, [last]);

  const announcement = rolling
    ? "Rolling."
    : last
      ? `Total ${last.total} from ${last.notation}. Expected ${last.expected.toFixed(1)}, ${delta >= 0 ? "plus" : "minus"} ${Math.abs(delta).toFixed(1)} versus expected.`
      : "";

  return (
    <section
      aria-labelledby="last-cast-heading"
      aria-busy={rolling}
      className="felt relative flex min-h-64 min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-border p-4 sm:min-h-80 sm:p-6"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="last-cast-heading" className="text-xs font-medium text-muted-foreground">
            <SpokenLabel>Last cast</SpokenLabel>
          </h2>
          <p className="mt-1 text-xs leading-snug text-subtle">
            The most recent roll’s total, then each die. Faded dice were dropped by Keep.
          </p>
          <p className="mt-1 break-all font-mono text-sm text-muted-foreground">{last ? last.notation : "No rolls yet"}</p>
        </div>
        {last ? (
          <div className="flex max-w-[50%] min-w-0 flex-wrap justify-end gap-1.5" data-testid="tray-factors" aria-label="Factors that were on for this roll">
            {flags?.luck && (
              <Badge
                title="Luck biased faces high or low"
                aria-label={`${last.luck > 0 ? "Lucky" : "Unlucky"}. Luck biased faces high or low`}
              >
                {last.luck > 0 ? "Lucky" : "Unlucky"}
              </Badge>
            )}
            {flags?.chaos && (
              <Badge
                title="Chaos reshaped the curve away from even odds"
                aria-label={`${last.chaos > 0.5 ? "Wild" : "Focused"}. Chaos reshaped the curve away from even odds`}
              >
                {last.chaos > 0.5 ? "Wild" : "Focused"}
              </Badge>
            )}
            {flags?.streak && (
              <Badge
                title="Streak used recent rolls to tilt this one"
                aria-label={`${last.streak > 0 ? "Momentum" : "Reverting"}. Streak used recent rolls to tilt this one`}
              >
                {last.streak > 0 ? "Momentum" : "Reverting"}
              </Badge>
            )}
            {flags?.seed ? (
              <Badge title="This roll followed a locked seed" aria-label="Seeded. This roll followed a locked seed">
                Seeded
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-6">
        <div aria-live="polite" aria-atomic="true">
          <p
            className="font-display text-5xl tabular-nums leading-none tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            aria-hidden="true"
          >
            {totalLabel}
          </p>
          <p className="sr-only">{announcement}</p>
        </div>
        {last ? (
          <p className="mt-3 max-w-sm px-1 text-center text-sm text-muted-foreground text-pretty">
            Expected {last.expected.toFixed(1)}
            <span className="mx-1.5 text-subtle" aria-hidden="true">
              ·
            </span>
            <span className={delta >= 0 ? "text-max" : "text-crit"}>
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)} vs expected
            </span>
            <span className="mt-1 block text-xs text-subtle">
              Expected is the average total for this pool with the luck, chaos, and streak that were on for this roll.
            </span>
          </p>
        ) : (
          <p className="mt-3 max-w-xs text-center text-sm text-muted-foreground text-pretty">
            Build a pool, then roll. Spacebar casts from anywhere except a text field.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-end justify-center gap-2">
        {last ? (
          <ul className="flex flex-wrap items-end justify-center gap-2" aria-label="Dice that landed">
            {kept.map((die, i) => (
              <li key={die.id}>
                <DieFace die={die} rolling={rolling} delay={Math.min(i * step, 400)} size="lg" />
              </li>
            ))}
            {dropped.map((die, i) => (
              <li key={die.id}>
                <DieFace
                  die={die}
                  rolling={rolling}
                  delay={Math.min((kept.length + i) * step, 400)}
                  size="md"
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex gap-2 opacity-40" aria-hidden="true">
            {[20, 6, 8].map((sides, i) => (
              <DieFace
                key={sides}
                die={{
                  id: `ghost-${sides}`,
                  sides,
                  face: sides === 6 ? 5 : sides === 20 ? 12 : 4,
                  kept: true,
                  exploded: false,
                  group: i,
                  sign: 1,
                }}
                size="md"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
