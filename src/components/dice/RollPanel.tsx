import { Copy, Dices, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { FieldMeta } from "@/components/dice/FieldMeta";
import { SpokenLabel } from "@/components/dice/SpokenLabel";
import { Stepper } from "@/components/dice/Stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FOCUS_RING } from "@/lib/dice/a11y";
import { chaosLoaded, formatRollLineClipboard, luckLoaded, streakLoaded } from "@/lib/dice/engine";
import { onRadioGroupKeyDown } from "@/lib/dice/keyboard";
import { describeCast, DICE_COUNT_MAX, DIE_SIDES_MAX, isCompoundExpression, MODIFIER_ABS_MAX, parseNotation } from "@/lib/dice/notation";
import { DIE_SIDES, PRESETS, useDiceStore } from "@/lib/dice/store";
import { cn, copyText } from "@/lib/utils";

const KEEP_MODES = [
  {
    mode: "none" as const,
    label: "Keep all",
    hint: "Count every die toward the total.",
  },
  {
    mode: "highest" as const,
    label: "High",
    hint: "Keep the highest dice. Advantage is two d20s, keep 1 high.",
  },
  {
    mode: "lowest" as const,
    label: "Low",
    hint: "Keep the lowest dice. Disadvantage is two d20s, keep 1 low.",
  },
];

export function RollPanel() {
  const notation = useDiceStore((s) => s.notation);
  const pool = useDiceStore((s) => s.pool);
  const error = useDiceStore((s) => s.error);
  const last = useDiceStore((s) => s.last);
  const rolling = useDiceStore((s) => s.rolling);
  const poolNotice = useDiceStore((s) => s.poolNotice);
  const setNotation = useDiceStore((s) => s.setNotation);
  const patchPool = useDiceStore((s) => s.patchPool);
  const applyPreset = useDiceStore((s) => s.applyPreset);
  const roll = useDiceStore((s) => s.roll);
  const reroll = useDiceStore((s) => s.reroll);

  let compound = false;
  let anyExploding = false;
  let explodingCount = 0;
  let diceTermCount = 0;
  try {
    const parsed = parseNotation(notation);
    compound = isCompoundExpression(parsed);
    const diceTerms = parsed.terms.filter((t) => t.kind === "dice");
    diceTermCount = diceTerms.length;
    explodingCount = diceTerms.filter((t) => t.term.exploding).length;
    anyExploding = explodingCount > 0;
  } catch {
    compound = false;
    anyExploding = false;
  }

  const live = describeCast(notation, pool.repeat);
  const poolLocked = compound || !live.valid;
  const keepNDisabled = poolLocked || pool.keepMode === "none" || pool.count < 2;
  const chipSelected = DIE_SIDES.includes(pool.sides as (typeof DIE_SIDES)[number]);
  const randomness = useDiceStore((s) => s.randomness);
  const isLoaded =
    luckLoaded(randomness.luck) ||
    chaosLoaded(randomness.chaos) ||
    streakLoaded(randomness.streak) ||
    randomness.seedLocked;

  let explodingHint: string;
  if (poolLocked && !live.valid) {
    explodingHint = "Exploding waits for a valid pool. A bang after a die in the notation turns it on.";
  } else if (compound) {
    if (explodingCount === 0) {
      explodingHint = "No bangs in this mixed pool — exploding is off for every die. The switch is locked to the notation.";
    } else if (explodingCount === diceTermCount) {
      explodingHint = "Every die in this mixed pool explodes (bang after each). The switch is locked to the notation.";
    } else {
      explodingHint = `${explodingCount} of ${diceTermCount} dice explode (bang after that die). The switch is locked to the notation.`;
    }
  } else {
    explodingHint =
      "If a die lands on its highest face, roll it again and add that roll. On a d6, a 6 explodes into another d6. Typing a new expression without ! turns this off.";
  }

  const notationDescribedBy = [
    "notation-hint",
    !live.valid ? "pool-live-detail" : null,
    error ? "notation-error" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card className="rounded-xl" role="region" aria-labelledby="pool-heading">
      <CardHeader className="border-b border-border bg-card pb-3 lg:sticky lg:top-0 lg:z-10">
        <div className="flex items-center justify-between gap-2">
          <CardTitle id="pool-heading" className="text-sm text-muted-foreground">
            <SpokenLabel>Pool</SpokenLabel>
          </CardTitle>
          {isLoaded ? (
            <span
              role="status"
              className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[0.7rem] font-medium text-primary"
              title="Luck, chaos, streak, or seed bias is active"
            >
              Loaded table
            </span>
          ) : null}
        </div>
        <CardDescription>
          The dice you will cast. A pool is one expression, like 2d6+3.
        </CardDescription>
        <div
          data-testid="pool-live"
          role="region"
          aria-label="Current pool"
          className="mt-2 rounded-md border border-border bg-elevated px-3 py-2"
        >
          <p className="break-all font-mono text-sm text-foreground">{live.headline}</p>
          <p
            id="pool-live-detail"
            className={cn("mt-0.5 text-xs leading-snug", live.valid ? "text-muted-foreground" : "text-crit")}
          >
            {live.detail}
          </p>
        </div>
        {poolNotice ? (
          <p
            data-testid="pool-notice"
            role="status"
            aria-live="polite"
            className="mt-2 text-xs leading-snug text-foreground"
          >
            {poolNotice}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="pt-4">
        <form
          className="flex flex-col gap-4"
          aria-label="Dice pool"
          onSubmit={(event) => {
            event.preventDefault();
            if (!rolling && live.valid) roll();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <FieldMeta
              htmlFor="notation"
              hintId="notation-hint"
              label="Notation"
              hint="Written form of the pool. 2d6+3 is two six-sided dice plus 3. kh keeps high; kl keeps low."
            />
            <div className="relative">
              <Input
                id="notation"
                value={notation}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                placeholder="2d6+3 or 4d6kh3"
                className={cn("font-mono", notation ? "pr-8" : "")}
                onChange={(e) => setNotation(e.target.value)}
                aria-invalid={!live.valid || Boolean(error)}
                aria-describedby={notationDescribedBy}
                aria-errormessage={!live.valid ? "pool-live-detail" : error ? "notation-error" : undefined}
              />
              {notation ? (
                <button
                  type="button"
                  aria-label="Clear notation"
                  title="Clear notation"
                  onClick={() => setNotation("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle transition-colors hover:text-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
            {error ? (
              <p id="notation-error" role="alert" className="text-xs text-crit">
                {error}
              </p>
            ) : null}
            {!live.valid ? (
              <p className="text-xs text-muted-foreground">
                Steppers wait for a valid pool. A die chip starts a fresh 1dN from that size; Repeat is kept.
              </p>
            ) : compound ? (
              <p className="text-xs text-muted-foreground">
                Compound pool — more than one die type, so the steppers lock and show a dash.
                Repeat still applies. A die chip starts a fresh 1dN from that size; Repeat is kept.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldMeta
              labelId="die-label"
              hintId="die-hint"
              label="Die"
              hint={
                poolLocked
                  ? "Starts a new simple pool of this die. Keep, exploding, and modifier reset; Repeat stays."
                  : "Faces on each die in a simple pool. A d20 shows 1 through 20."
              }
            />
            <div
              role={poolLocked ? "group" : "radiogroup"}
              aria-labelledby="die-label"
              aria-describedby="die-hint"
              className="flex flex-wrap gap-1.5"
            >
              {DIE_SIDES.map((sides, index) => {
                const selected = pool.sides === sides && !poolLocked;
                const tabStop = poolLocked ? 0 : chipSelected ? (selected ? 0 : -1) : index === 0 ? 0 : -1;
                return (
                  <button
                    key={sides}
                    type="button"
                    role={poolLocked ? undefined : "radio"}
                    title={
                      poolLocked
                        ? `Start a simple d${sides} pool`
                        : `d${sides} — a die with ${sides} faces`
                    }
                    aria-label={
                      poolLocked
                        ? `Start a simple d${sides} pool`
                        : `d${sides}, a die with ${sides} faces`
                    }
                    aria-pressed={poolLocked ? false : undefined}
                    aria-checked={poolLocked ? undefined : selected}
                    tabIndex={tabStop}
                    onKeyDown={poolLocked ? undefined : onRadioGroupKeyDown}
                    onClick={() => {
                      if (poolLocked) {
                        patchPool({
                          count: 1,
                          sides,
                          modifier: 0,
                          keepMode: "none",
                          exploding: false,
                        });
                      } else {
                        patchPool({ sides });
                      }
                    }}
                    className={cn(
                      FOCUS_RING,
                      "h-11 min-w-11 rounded-md border px-2.5 font-mono text-sm tabular-nums transition-[background-color,border-color,color] duration-150",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-elevated text-muted-foreground hover:text-foreground",
                    )}
                  >
                    d{sides}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stepper
              label="Dice"
              hint="How many dice to throw together. Dropping to 1 turns Keep High/Low off."
              value={pool.count}
              min={1}
              max={DICE_COUNT_MAX}
              disabled={poolLocked}
              display={poolLocked ? "—" : undefined}
              onStep={(d) => patchPool({ count: useDiceStore.getState().pool.count + d })}
            />
            <Stepper
              label="Sides"
              hint="Faces on each die."
              value={pool.sides}
              min={2}
              max={DIE_SIDES_MAX}
              disabled={poolLocked}
              display={poolLocked ? "—" : undefined}
              onStep={(d) => patchPool({ sides: useDiceStore.getState().pool.sides + d })}
            />
            <Stepper
              label="Modifier"
              hint="Flat bonus or penalty added after the dice land."
              value={pool.modifier}
              min={-MODIFIER_ABS_MAX}
              max={MODIFIER_ABS_MAX}
              signed
              disabled={poolLocked}
              display={poolLocked ? "—" : undefined}
              onStep={(d) => patchPool({ modifier: useDiceStore.getState().pool.modifier + d })}
            />
            <Stepper
              label="Repeat"
              hint="Casts in one click. Stats uses 6. Independent of notation. The batch uses streak from before the click, so the six scores don't feed each other."
              value={pool.repeat}
              min={1}
              max={20}
              onStep={(d) => patchPool({ repeat: useDiceStore.getState().pool.repeat + d })}
            />
          </div>

          {!poolLocked ? (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[0.7rem] uppercase tracking-wider text-subtle">
                <SpokenLabel>Quick modifier</SpokenLabel>:
              </span>
              {[-1, 1, 2, 5].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  aria-label={`${delta > 0 ? "Add" : "Subtract"} ${Math.abs(delta)} to modifier`}
                  title={`${delta > 0 ? "Add" : "Subtract"} ${Math.abs(delta)} to modifier`}
                  onClick={() => patchPool({ modifier: pool.modifier + delta })}
                  className={cn(
                    FOCUS_RING,
                    "h-8 rounded border border-border bg-elevated px-2 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
              <button
                type="button"
                aria-label="Reset modifier to zero"
                title="Reset modifier to zero"
                disabled={pool.modifier === 0}
                onClick={() => patchPool({ modifier: 0 })}
                className={cn(
                  FOCUS_RING,
                  "h-8 rounded border border-border bg-elevated px-2 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-40",
                )}
              >
                Zero
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <FieldMeta
              labelId="keep-label"
              hintId="keep-hint"
              label="Keep"
              hint={
                poolLocked
                  ? "Keep follows the notation on a mixed or invalid pool — the buttons lock."
                  : pool.count < 2
                    ? "High and Low need two or more dice — they stay on Keep all for a single die."
                    : "After the roll, drop some dice. High keeps the best (advantage). Low keeps the worst (disadvantage)."
              }
            />
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <div
                role="radiogroup"
                aria-labelledby="keep-label"
                aria-describedby="keep-hint"
                className="flex w-full items-center gap-1 rounded-lg border border-border bg-elevated p-1 sm:w-auto"
              >
                {KEEP_MODES.map(({ mode, label, hint }) => {
                  const blocked = poolLocked || (mode !== "none" && pool.count < 2);
                  const selected = pool.keepMode === mode && !poolLocked;
                  return (
                    <button
                      key={mode}
                      type="button"
                      role="radio"
                      title={hint}
                      aria-label={`${label}. ${hint}`}
                      aria-checked={selected}
                      tabIndex={blocked ? -1 : selected ? 0 : -1}
                      disabled={blocked}
                      onKeyDown={onRadioGroupKeyDown}
                      onClick={() => patchPool({ keepMode: mode })}
                      className={cn(
                        FOCUS_RING,
                        "h-11 flex-1 rounded-md px-3 text-xs font-medium transition-[background-color,color,opacity] duration-150 disabled:opacity-40 sm:flex-none",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="w-full max-w-48 sm:w-auto sm:max-w-none">
                <Stepper
                  label="How many"
                  hint="How many dice still count toward the total when High or Low is on."
                  value={pool.keepN}
                  min={1}
                  max={Math.max(1, pool.count - 1)}
                  disabled={keepNDisabled}
                  display={poolLocked ? "—" : undefined}
                  onStep={(d) => patchPool({ keepN: useDiceStore.getState().pool.keepN + d })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Switch
              id="exploding"
              aria-label="Exploding dice"
              aria-labelledby="exploding-label"
              className="mt-0.5"
              checked={poolLocked ? anyExploding : pool.exploding}
              disabled={poolLocked}
              title="When a die shows its highest face, roll it again and add that roll"
              aria-describedby="exploding-hint"
              onCheckedChange={(exploding) => patchPool({ exploding })}
            />
            <FieldMeta
              htmlFor="exploding"
              labelId="exploding-label"
              hintId="exploding-hint"
              label="Exploding"
              hint={explodingHint}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldMeta
              labelId="presets-label"
              hintId="presets-hint"
              label="Presets"
              hint="Ready-made pools. Adv is advantage (2d20, keep the higher). Dis is disadvantage (keep the lower). Stats is six ability scores. Each preset also sets Repeat."
            />
            <div role="group" aria-labelledby="presets-label" aria-describedby="presets-hint" className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  title={preset.hint}
                  aria-label={`${preset.label}. ${preset.hint}`}
                  onClick={() => applyPreset(preset.notation, preset.repeat)}
                  className={cn(
                    FOCUS_RING,
                    "h-11 rounded-full border border-border px-2.5 text-xs text-muted-foreground transition-[background-color,color] duration-150 hover:bg-elevated hover:text-foreground",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              size="lg"
              disabled={!live.valid}
              title="Cast the current pool"
              aria-label={!live.valid ? "Roll, waits for a valid pool" : undefined}
              aria-keyshortcuts="Space"
              aria-describedby="roll-hint"
              aria-busy={rolling}
            >
              <Dices aria-hidden="true" />
              Roll{pool.repeat > 1 ? ` ×${pool.repeat}` : ""}
            </Button>
            <p id="roll-hint" className="text-xs leading-snug text-subtle">
              Casts the pool shown above. Spacebar does the same, except in a text field.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                title="Cast the last result’s expression once with the current luck, chaos, streak, and seed. Does not change this pool."
                aria-label="Reroll the last result with current factors"
                disabled={!last}
                aria-busy={rolling}
                onClick={() => reroll()}
              >
                <RotateCcw aria-hidden="true" />
                Reroll
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                title="Copy the last result as text"
                aria-label="Copy the last result as text"
                disabled={!last}
                onClick={async () => {
                  if (!last) return;
                  const ok = await copyText(formatRollLineClipboard(last));
                  toast(ok ? "Copied last result" : "Couldn’t copy");
                }}
              >
                <Copy aria-hidden="true" />
                Copy
              </Button>
            </div>
            <p className="text-xs leading-snug text-subtle">
              Reroll casts that row’s expression once with the current luck, chaos, streak, and
              seed, and leaves this pool as you set it. Copy puts that line on the clipboard.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
