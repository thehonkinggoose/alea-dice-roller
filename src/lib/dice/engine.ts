import { clamp, parseNotation } from "./notation";
import { hashSeed, mulberry32, rngFor } from "./rng";
import type { DieFace, ParsedExpression, Randomness, RollRecord } from "./types";

const MAX_EXPLOSIONS = 24;

export const FACTOR_TICK = 0.01;
export const EXPECTED_SAMPLES = 1200;

export function luckLoaded(luck: number): boolean {
  return Math.abs(luck) >= FACTOR_TICK;
}

export function chaosLoaded(chaos: number): boolean {
  return Math.abs(chaos - 0.5) >= FACTOR_TICK;
}

export function streakLoaded(streak: number): boolean {
  return Math.abs(streak) >= FACTOR_TICK;
}

export function effectiveLuck(luck: number): number {
  return luckLoaded(luck) ? clamp(luck, -1, 1) : 0;
}

export function effectiveChaos(chaos: number): number {
  return chaosLoaded(chaos) ? clamp(chaos, 0, 1) : 0.5;
}

export function effectiveBias(bias: number): number {
  return Math.abs(bias) >= FACTOR_TICK ? clamp(bias, -1, 1) : 0;
}

export function appliedStreak(slider: number, bias: number): number {
  return streakLoaded(slider) && Math.abs(bias) >= FACTOR_TICK ? slider : 0;
}

export function rollFactorFlags(roll: Pick<RollRecord, "luck" | "chaos" | "streak" | "seedUsed">) {
  return {
    luck: luckLoaded(roll.luck),
    chaos: chaosLoaded(roll.chaos),
    streak: streakLoaded(roll.streak),
    seed: Boolean(roll.seedUsed),
  };
}

export function faceWeights(
  sides: number,
  luck: number,
  chaos: number,
  streakBias: number,
): number[] {
  const tilt = clamp(effectiveLuck(luck) + effectiveBias(streakBias), -1, 1);
  const mixChaos = effectiveChaos(chaos);
  const weights: number[] = [];
  for (let i = 1; i <= sides; i++) {
    const x = sides === 1 ? 0.5 : (i - 1) / (sides - 1);
    const centered = x * 2 - 1;
    const luckW = Math.exp(tilt * 2.45 * centered);
    const peak = Math.exp(-3.4 * centered * centered);
    const uShape = 1.08 - peak;
    const mix =
      mixChaos <= 0.5
        ? peak * (1 - mixChaos / 0.5) + 1 * (mixChaos / 0.5)
        : 1 * (1 - (mixChaos - 0.5) / 0.5) + uShape * ((mixChaos - 0.5) / 0.5);
    weights.push(Math.max(luckW * mix, 1e-12));
  }
  return weights;
}

export function sampleWeighted(weights: number[], rng: () => number): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i] ?? 0;
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

export function expectedFace(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.reduce((sum, w, i) => sum + ((i + 1) * w) / total, 0);
}

export function streakBiasFrom(history: RollRecord[], streak: number): number {
  if (!streakLoaded(streak) || history.length === 0) return 0;
  const recent = history.slice(0, 5);
  let acc = 0;
  for (const roll of recent) {
    const spread = Math.max(1, Math.abs(roll.expected) * 0.55);
    acc += (roll.total - roll.expected) / spread;
  }
  const z = clamp(acc / recent.length, -1.4, 1.4) / 1.4;
  return effectiveBias(clamp(streak * z, -1, 1));
}

function nextId(rng: () => number): string {
  return `d${Math.floor(rng() * 1e9).toString(36)}${Math.floor(rng() * 1e9).toString(36)}`;
}

function rollOneDie(
  sides: number,
  exploding: boolean,
  weights: number[],
  rng: () => number,
  group: number,
  sign: 1 | -1,
): DieFace[] {
  const out: DieFace[] = [];
  let explosions = 0;
  let explode = true;
  while (explode) {
    const face = sampleWeighted(weights, rng) + 1;
    out.push({
      id: nextId(rng),
      sides,
      face,
      kept: true,
      exploded: explosions > 0,
      group,
      sign,
    });
    explode = exploding && face === sides && explosions < MAX_EXPLOSIONS;
    explosions += 1;
  }
  return out;
}

function applyKeep(dice: DieFace[], mode: "none" | "highest" | "lowest", n: number): DieFace[] {
  const groups = new Map<number, number>();
  for (const die of dice) {
    groups.set(die.group, (groups.get(die.group) ?? 0) + die.face);
  }
  if (mode === "none" || groups.size <= n) {
    return dice.map((d) => ({ ...d, kept: true }));
  }

  const ranked = [...groups.entries()].sort((a, b) =>
    mode === "highest" ? b[1] - a[1] : a[1] - b[1],
  );
  const keptGroups = new Set(ranked.slice(0, n).map(([g]) => g));
  return dice.map((d) => ({ ...d, kept: keptGroups.has(d.group) }));
}

export function evaluateExpression(
  parsed: ParsedExpression,
  factors: Pick<Randomness, "luck" | "chaos">,
  streakBias: number,
  rng: () => number,
): { dice: DieFace[]; modifier: number; total: number } {
  const dice: DieFace[] = [];
  let group = 0;
  let total = parsed.modifier;

  for (const term of parsed.terms) {
    if (term.kind !== "dice") continue;
    const { count, sides, keep, exploding, sign } = term.term;
    const weights = faceWeights(sides, factors.luck, factors.chaos, streakBias);
    const bucket: DieFace[] = [];
    for (let i = 0; i < count; i++) {
      group += 1;
      bucket.push(...rollOneDie(sides, exploding, weights, rng, group, sign));
    }
    const kept = applyKeep(bucket, keep.mode, keep.n);
    dice.push(...kept);
    const sub = kept.reduce((sum, d) => sum + (d.kept ? d.face : 0), 0);
    total += sign * sub;
  }

  return { dice, modifier: parsed.modifier, total };
}

export function estimateExpected(
  parsed: ParsedExpression,
  luck: number,
  chaos: number,
  streakBias: number,
  samples = EXPECTED_SAMPLES,
): number {
  const seed = hashSeed(
    JSON.stringify({
      raw: parsed.raw,
      luck: round4(luck),
      chaos: round4(chaos),
      streakBias: round4(streakBias),
    }),
  );
  const rng = mulberry32(seed);
  let acc = 0;
  for (let i = 0; i < samples; i++) {
    acc += evaluateExpression(parsed, { luck, chaos }, streakBias, rng).total;
  }
  return acc / samples;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function makeRoll(
  notation: string,
  randomness: Randomness,
  history: RollRecord[],
): { record: RollRecord; streamIndex: number } {
  const parsed = parseNotation(notation);
  const luck = effectiveLuck(randomness.luck);
  const chaos = effectiveChaos(randomness.chaos);
  const bias = streakBiasFrom(history, randomness.streak);
  const seedUsed = randomness.seedLocked && randomness.seed.trim() ? randomness.seed.trim() : null;
  const rng = rngFor(seedUsed, randomness.streamIndex);
  const result = evaluateExpression(parsed, { luck, chaos }, bias, rng);
  const expected = estimateExpected(parsed, luck, chaos, bias);

  const record: RollRecord = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
    notation: parsed.raw,
    dice: result.dice,
    modifier: result.modifier,
    total: result.total,
    expected,
    luck,
    chaos,
    streak: appliedStreak(randomness.streak, bias),
    seedUsed,
  };

  return { record, streamIndex: seedUsed ? randomness.streamIndex + 1 : randomness.streamIndex };
}

export function formatRollLine(record: RollRecord): string {
  const faces = record.dice
    .map((d) => {
      const sign = d.sign < 0 ? "−" : "";
      const mark = d.exploded ? "!" : d.kept ? "" : "↓";
      return `${sign}${d.face}${mark}`;
    })
    .join(", ");
  const mod =
    record.modifier === 0
      ? ""
      : record.modifier > 0
        ? ` + ${record.modifier}`
        : ` − ${Math.abs(record.modifier)}`;
  return `${record.notation} → ${faces}${mod} = ${record.total}`;
}

export function primarySides(parsed: ParsedExpression): number {
  const first = parsed.terms.find((t) => t.kind === "dice");
  return first && first.kind === "dice" ? first.term.sides : 20;
}

export function distributionSeries(
  sides: number,
  luck: number,
  chaos: number,
  streakBias: number,
): { face: number; p: number }[] {
  const weights = faceWeights(sides, luck, chaos, streakBias);
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w, i) => ({ face: i + 1, p: w / total }));
}

export function chartTicks(sides: number): number[] | undefined {
  if (sides <= 12) return undefined;
  if (sides <= 20) return [1, 5, 10, 15, 20].filter((n) => n <= sides);
  const mid = Math.round(sides / 2);
  return [1, mid, sides];
}
