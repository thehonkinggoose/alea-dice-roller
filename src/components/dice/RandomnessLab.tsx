import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from "recharts";
import { FieldMeta } from "@/components/dice/FieldMeta";
import { SpokenLabel } from "@/components/dice/SpokenLabel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  chartTicks,
  chaosLoaded,
  distributionSeries,
  estimateExpected,
  expectedFace,
  EXPECTED_SAMPLES,
  faceWeights,
  FACTOR_TICK,
  luckLoaded,
  primarySides,
  streakBiasFrom,
  streakLoaded,
} from "@/lib/dice/engine";
import { parseNotation, totalDiffersFromPrimaryFace } from "@/lib/dice/notation";
import { useDiceStore } from "@/lib/dice/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function labStatusText(
  luck: number,
  chaos: number,
  streak: number,
  bias: number,
  historyLength: number,
  seedLocked = false,
): string {
  const tilting =
    luckLoaded(luck) || chaosLoaded(chaos) || Math.abs(bias) >= FACTOR_TICK;
  if (tilting) return "This table is loaded. Fair is chaos 50 with luck and streak at 0.";
  if (streakLoaded(streak) && historyLength === 0) {
    return "Streak waits for prior rolls before it can tilt the curve.";
  }
  if (streakLoaded(streak) && historyLength > 0) {
    return "Streak is armed, but recent totals sit near expected so it is not tilting yet.";
  }
  if (seedLocked) {
    return "Uniform — a mathematically fair curve, replayed from the seed.";
  }
  return "Uniform and independent — a mathematically fair table.";
}

function FactorRow({
  id,
  label,
  hint,
  value,
  display,
  valuetext,
  min,
  max,
  step,
  left,
  right,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  display: string;
  valuetext: string;
  min: number;
  max: number;
  step: number;
  left: string;
  right: string;
  onChange: (n: number) => void;
}) {
  const hintId = `${id}-hint`;
  const valueId = `${id}-value`;
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <FieldMeta htmlFor={id} label={label} hint={hint} hintId={hintId} />
        </div>
        <span id={valueId} className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {display}
        </span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0] ?? value)}
        aria-label={label}
        aria-valuetext={valuetext}
        aria-describedby={`${hintId} ${valueId}`}
        title={hint}
      />
      <div className="flex justify-between text-xs uppercase tracking-wider text-subtle" aria-hidden="true">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

const BIAS_PRESETS = [
  { id: "fair", label: "Fair", hint: "Uniform mathematical odds", luck: 0, chaos: 0.5, streak: 0 },
  { id: "heroic", label: "Heroic", hint: "Tilt high, slightly wild with positive momentum", luck: 0.3, chaos: 0.6, streak: 0.25 },
  { id: "gritty", label: "Gritty", hint: "Tilt low, tighter spread with cooling streaks", luck: -0.2, chaos: 0.4, streak: -0.2 },
  { id: "wild", label: "Wild", hint: "Extreme odds — crits and fumbles abound", luck: 0, chaos: 0.9, streak: 0 },
] as const;

export function RandomnessLab() {
  const randomness = useDiceStore((s) => s.randomness);
  const history = useDiceStore((s) => s.history);
  const notation = useDiceStore((s) => s.notation);
  const patchRandomness = useDiceStore((s) => s.patchRandomness);
  const resetRandomness = useDiceStore((s) => s.resetRandomness);
  const rngNotice = useDiceStore((s) => s.rngNotice);

  const parsed = useMemo(() => {
    try {
      return parseNotation(notation);
    } catch {
      return null;
    }
  }, [notation]);

  const sides = parsed ? primarySides(parsed) : null;
  const bias = streakBiasFrom(history, randomness.streak);
  const series = useMemo(
    () => (sides ? distributionSeries(sides, randomness.luck, randomness.chaos, bias) : []),
    [sides, randomness.luck, randomness.chaos, bias],
  );
  const mean = sides ? expectedFace(faceWeights(sides, randomness.luck, randomness.chaos, bias)) : null;
  const fair = sides ? (sides + 1) / 2 : null;
  const showPoolExpected = parsed ? totalDiffersFromPrimaryFace(parsed) : false;
  const poolExpected = useMemo(() => {
    if (!showPoolExpected || !parsed) return null;
    return estimateExpected(
      parsed,
      randomness.luck,
      randomness.chaos,
      bias,
      EXPECTED_SAMPLES,
    );
  }, [showPoolExpected, parsed, randomness.luck, randomness.chaos, bias]);
  const status = labStatusText(
    randomness.luck,
    randomness.chaos,
    randomness.streak,
    bias,
    history.length,
    randomness.seedLocked,
  );
  const ticks = sides ? chartTicks(sides) : undefined;
  const luckDisplay = `${randomness.luck > 0 ? "+" : ""}${Math.round(randomness.luck * 100)}`;
  const chaosDisplay = `${Math.round(randomness.chaos * 100)}`;
  const streakDisplay = `${randomness.streak > 0 ? "+" : ""}${Math.round(randomness.streak * 100)}`;

  const curveSummary = useMemo(() => {
    if (!sides || mean === null || fair === null || series.length === 0) return null;
    const midIndex = Math.floor(series.length / 2);
    const midFace = series[midIndex];
    const bits = [
      `Odds for a d${sides}. Expected face ${mean.toFixed(2)}, fair ${fair.toFixed(1)}.`,
      `Face 1 is ${((series[0]?.p ?? 0) * 100).toFixed(1)} percent.`,
    ];
    if (series.length > 2 && midFace) {
      bits.push(`Middle face ${midFace.face} is ${((midFace.p ?? 0) * 100).toFixed(1)} percent.`);
    }
    bits.push(`Face ${sides} is ${((series[series.length - 1]?.p ?? 0) * 100).toFixed(1)} percent.`);
    if (showPoolExpected && poolExpected !== null) {
      bits.push(`Pool expected total ${poolExpected.toFixed(2)}.`);
    }
    return bits.join(" ");
  }, [sides, mean, fair, series, showPoolExpected, poolExpected]);

  return (
    <Card className="rounded-xl" role="region" aria-labelledby="randomness-heading">
      <CardHeader className="flex flex-col items-stretch gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle id="randomness-heading" className="text-sm text-muted-foreground">
            <SpokenLabel>Randomness</SpokenLabel>
          </CardTitle>
          <CardDescription>
            Load the table or keep it fair. Fair resets luck, chaos, and streak; the seed is kept.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          title="Reset luck, chaos, and streak. The seed is kept."
          aria-label="Reset luck, chaos, and streak to fair. The seed is kept."
          onClick={resetRandomness}
        >
          <RotateCcw aria-hidden="true" />
          Fair
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-labelledby="bias-presets-label">
          <span id="bias-presets-label" className="text-[0.7rem] uppercase tracking-wider text-subtle">
            <SpokenLabel>Presets</SpokenLabel>:
          </span>
          {BIAS_PRESETS.map((preset) => {
            const isMatch =
              Math.abs(randomness.luck - preset.luck) < 0.01 &&
              Math.abs(randomness.chaos - preset.chaos) < 0.01 &&
              Math.abs(randomness.streak - preset.streak) < 0.01;
            return (
              <button
                key={preset.id}
                type="button"
                title={preset.hint}
                aria-pressed={isMatch}
                aria-label={`${preset.label}: ${preset.hint}`}
                onClick={() => {
                  patchRandomness({ luck: preset.luck, chaos: preset.chaos, streak: preset.streak });
                  toast(`Applied ${preset.label} bias preset`);
                }}
                className={cn(
                  "h-7 rounded-full border px-2.5 text-xs transition-colors",
                  isMatch
                    ? "border-primary bg-primary font-medium text-primary-foreground"
                    : "border-border bg-elevated text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <FactorRow
          id="factor-luck"
          label="Luck"
          hint="Bias toward low or high faces. At +100 a d20 averages about 16 instead of 10.5."
          value={Math.round(randomness.luck * 100)}
          display={luckDisplay}
          valuetext={`Luck ${luckDisplay}`}
          min={-100}
          max={100}
          step={1}
          left="Unlucky"
          right="Lucky"
          onChange={(n) => patchRandomness({ luck: n / 100 })}
        />
        <FactorRow
          id="factor-chaos"
          label="Chaos"
          hint="50 is even odds. Lower bunches near the middle. Higher makes crits and fumbles more common."
          value={Math.round(randomness.chaos * 100)}
          display={chaosDisplay}
          valuetext={`Chaos ${chaosDisplay}`}
          min={0}
          max={100}
          step={1}
          left="Focused"
          right="Wild"
          onChange={(n) => patchRandomness({ chaos: n / 100 })}
        />
        <FactorRow
          id="factor-streak"
          label="Streak"
          hint="Reads recent rolls. Momentum keeps a hot streak hot. Revert makes the next rolls go cold. A Repeat batch uses the streak from before the click, so the scores don't feed each other."
          value={Math.round(randomness.streak * 100)}
          display={streakDisplay}
          valuetext={`Streak ${streakDisplay}`}
          min={-100}
          max={100}
          step={1}
          left="Revert"
          right="Momentum"
          onChange={(n) => patchRandomness({ streak: n / 100 })}
        />

        <div>
          {sides && mean !== null && fair !== null ? (
            <>
              <div className="mb-2 flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0 flex-1">
                  <FieldMeta
                    label={`d${sides} curve`}
                    hint="Odds of each face on this die. Pool E is the average total the table will compare against — keep, explode, and extra dice are included."
                  />
                </div>
                <p className="shrink-0 text-left font-mono text-xs tabular-nums text-muted-foreground sm:text-right">
                  <span className="sr-only">
                    Expected face {mean.toFixed(2)}, fair {fair.toFixed(1)}
                    {showPoolExpected && poolExpected !== null ? `, pool expected total ${poolExpected.toFixed(2)}` : ""}
                  </span>
                  <span aria-hidden="true">
                    E[{mean.toFixed(2)}]
                    <span className="mx-1 text-subtle">vs</span>
                    {fair.toFixed(1)}
                    {showPoolExpected && poolExpected !== null ? (
                      <span className="mt-0.5 block text-subtle">
                        pool E[{poolExpected.toFixed(2)}]
                      </span>
                    ) : null}
                  </span>
                </p>
              </div>
              <div className="h-24 w-full min-w-0 overflow-hidden" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={series}
                    margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                    barCategoryGap={sides > 20 ? 0 : 2}
                  >
                    <XAxis
                      dataKey="face"
                      tickLine={false}
                      axisLine={false}
                      ticks={ticks}
                      interval={0}
                      tick={{
                        fill: "var(--color-subtle)",
                        fontSize: 10,
                        fontFamily: "IBM Plex Mono, ui-monospace, monospace",
                      }}
                    />
                    <Bar dataKey="p" radius={[2, 2, 0, 0]}>
                      {series.map((entry) => (
                        <Cell
                          key={entry.face}
                          fill={
                            entry.face === 1
                              ? "var(--color-crit)"
                              : entry.face === sides
                                ? "var(--color-max)"
                                : "var(--color-primary)"
                          }
                          fillOpacity={0.75}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {curveSummary ? <p className="sr-only">{curveSummary}</p> : null}
            </>
          ) : (
            <p data-testid="lab-curve-wait" className="text-xs leading-snug text-muted-foreground">
              Curve waits for a valid pool.
            </p>
          )}
          <p
            data-testid="lab-status"
            role="status"
            className={cn("mt-1 text-xs text-muted-foreground", status.startsWith("Uniform") && "text-subtle")}
          >
            {status}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <FieldMeta
                htmlFor="seed"
                hintId="seed-hint"
                label="Seed"
                hint="Optional phrase that can replay the same sequence of faces. Editing it restarts the sequence from the beginning."
              />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <label id="seed-lock-label" htmlFor="seed-lock" className="text-xs font-medium tracking-wide text-muted-foreground">
                Lock
              </label>
              <Switch
                id="seed-lock"
                aria-label="Lock seed"
                aria-labelledby="seed-lock-label"
                checked={randomness.seedLocked}
                title="When on, rolls follow this seed instead of true random"
                aria-describedby="seed-lock-hint"
                onCheckedChange={(seedLocked) => {
                  if (seedLocked && !randomness.seed.trim()) {
                    toast("Enter a seed first");
                    return;
                  }
                  patchRandomness({ seedLocked });
                }}
              />
            </div>
          </div>
          <p id="seed-lock-hint" className="text-xs leading-snug text-subtle">
            On: follow this seed. Off: true random.
          </p>
          <Input
            id="seed"
            value={randomness.seed}
            placeholder="Optional — lock to replay a sequence"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="font-mono"
            aria-describedby="seed-hint seed-stream"
            onChange={(e) =>
              patchRandomness({ seed: e.target.value, streamIndex: 0 })
            }
          />
          {rngNotice ? (
            <p
              id="seed-stream"
              data-testid="rng-notice"
              role="status"
              aria-live="polite"
              className="text-xs leading-snug text-foreground"
            >
              {rngNotice}
            </p>
          ) : randomness.seedLocked && randomness.seed.trim() ? (
            <p id="seed-stream" className="text-xs text-muted-foreground">
              Stream {randomness.streamIndex} · same seed and factors replay the same faces
            </p>
          ) : (
            <p id="seed-stream" className="text-xs text-subtle">
              Unlocked uses the browser’s cryptographic RNG — true random, not repeatable.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
