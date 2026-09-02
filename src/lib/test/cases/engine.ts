import {
  chartTicks,
  distributionSeries,
  estimateExpected,
  evaluateExpression,
  expectedFace,
  faceWeights,
  formatRollLine,
  makeRoll,
  primarySides,
  sampleWeighted,
  streakBiasFrom,
  appliedStreak,
  chaosLoaded,
  effectiveBias,
  effectiveChaos,
  effectiveLuck,
  luckLoaded,
  rollFactorFlags,
  streakLoaded,
} from "@/lib/dice/engine";
import { parseNotation } from "@/lib/dice/notation";
import { constantRng, fakeDie, fakeRoll, rngQueue } from "@/lib/test/helpers";
import type { TestDef } from "@/lib/test/harness";
import type { Randomness } from "@/lib/dice/types";

const FAIR: Pick<Randomness, "luck" | "chaos"> = { luck: 0, chaos: 0.5 };

function facesOf(dice: { face: number; kept: boolean; sign: number; exploded: boolean }[]) {
  return dice.map((d) => ({
    face: d.face,
    kept: d.kept,
    sign: d.sign,
    exploded: d.exploded,
    group: (d as { group?: number }).group,
  }));
}

export const engineCases: TestDef[] = [
  {
    id: "engine-fair-weights",
    suite: "Face weights",
    name: "A fair d6 is uniform; luck tilts high; chaos focuses then goes wild",
    description: "At luck 0 and chaos 0.5 every face has equal weight. Luck +1 inflates high faces. Chaos 0 peaks the middle. Chaos 1 inflates the ends.",
    why: "The curve in the Randomness lab is this function. If fair is not uniform, every 'vs expected' delta in the table is a lie.",
    run: (t) => {
      const fair = faceWeights(6, 0, 0.5, 0);
      t.note("fair", fair);
      t.eq(fair.length, 6, "six weights");
      t.ok(fair.every((w) => Math.abs(w - fair[0]!) < 1e-12), "uniform");
      const lucky = faceWeights(6, 1, 0.5, 0);
      t.ok(lucky[5]! > lucky[0]!, "luck prefers 6 over 1");
      t.note("lucky", lucky);
      const focused = faceWeights(6, 0, 0, 0);
      t.ok(focused[2]! > focused[0]! && focused[3]! > focused[5]!, "focus peaks middle");
      const wild = faceWeights(6, 0, 1, 0);
      t.ok(wild[0]! > wild[2]! && wild[5]! > wild[3]!, "wild prefers ends");
      const one = faceWeights(1, 0, 0.5, 0);
      t.eq(one.length, 1, "sides=1 still defined");
      t.ok(one[0]! > 0, "positive");
    },
  },
  {
    id: "engine-sample-and-expected",
    suite: "Face weights",
    name: "sampleWeighted walks the prefix; expectedFace is the mean",
    description: "rng=0 always hits index 0. rng just under 1 hits the last index via the fallback. Empty weights return -1. expectedFace of a fair d6 is 3.5. An empty weight list reduces to 0.",
    why: "This is the only place a random number becomes a face. Off-by-one here would make a d20 never show 20.",
    run: (t) => {
      const w = [1, 1, 1, 1, 1, 1];
      t.eq(sampleWeighted(w, () => 0), 0, "rng 0 → face index 0");
      t.eq(sampleWeighted(w, () => 0.999999), 5, "high rng → last index");
      t.eq(sampleWeighted(w, () => 1), 5, "rng 1 falls through to last");
      t.eq(sampleWeighted([], () => 0.5), -1, "empty weights");
      t.approx(expectedFace(faceWeights(6, 0, 0.5, 0)), 3.5, 1e-9, "fair d6 mean");
      t.ok(expectedFace(faceWeights(20, 1, 0.5, 0)) > 14, "lucky d20 mean well above 10.5");
      t.eq(expectedFace([]), 0, "empty weights reduce to 0");
    },
  },
  {
    id: "engine-distribution-and-ticks",
    suite: "Face weights",
    name: "distributionSeries sums to 1; chartTicks thin out large dice",
    description: "Each p is weight/total. Ticks are omitted at 12 faces or fewer, five labels on a d20, and 1 / mid / n on a d100.",
    why: "A d100 with 100 axis labels is unreadable. The lab chart has to stay a curve, not a barcode.",
    run: (t) => {
      const series = distributionSeries(6, 0, 0.5, 0);
      const sum = series.reduce((a, s) => a + s.p, 0);
      t.approx(sum, 1, 1e-12, "probabilities sum to 1");
      t.eq(series.map((s) => s.face), [1, 2, 3, 4, 5, 6], "faces");
      t.eq(chartTicks(6), undefined, "d6 all ticks");
      t.eq(chartTicks(12), undefined, "d12 all ticks");
      t.eq(chartTicks(13), [1, 5, 10], "d13 filtered");
      t.eq(chartTicks(20), [1, 5, 10, 15, 20], "d20");
      t.eq(chartTicks(100), [1, 50, 100], "d100");
      t.eq(chartTicks(21), [1, 11, 21], "odd large");
    },
  },
  {
    id: "engine-streak-bias",
    suite: "Face weights",
    name: "Streak bias reads the last five totals against their expected",
    description: "No history or streak 0 is zero. A hot streak with momentum (>0) pushes positive. Mean-reversion flips the sign. The result is clamped to [-1, 1].",
    why: "Streak is the only factor that looks at the past. If it used the wrong window, a single crit would lock the table forever.",
    run: (t) => {
      t.eq(streakBiasFrom([], 1), 0, "empty history");
      t.eq(streakBiasFrom([fakeRoll()], 0), 0, "streak zero");
      t.eq(streakBiasFrom([fakeRoll({ total: 20, expected: 10.5 })], 0.004), 0, "sub-tick streak is off");
      const hot = [fakeRoll({ total: 20, expected: 10.5 }), fakeRoll({ total: 18, expected: 10.5 })];
      const momentum = streakBiasFrom(hot, 1);
      const revert = streakBiasFrom(hot, -1);
      t.note("momentum", momentum);
      t.note("revert", revert);
      t.ok(momentum > 0, "hot + momentum is positive");
      t.ok(revert < 0, "hot + reversion is negative");
      t.ok(Math.abs(streakBiasFrom(hot, 1)) <= 1, "clamped");
    },
  },
  {
    id: "engine-eval-signed",
    suite: "Evaluation",
    name: "2d6-1d4 with all 1s totals 1, not 3",
    description: "A constant-zero RNG always lands face 1. The two sixes add, the four-sider subtracts: 1+1-1=1. Three dice are recorded, the d4 with sign -1.",
    why: "This is the scoring bug that treated a penalty die as a bonus. The tray total is this number.",
    run: (t) => {
      const result = evaluateExpression(parseNotation("2d6-1d4"), FAIR, 0, constantRng(0));
      t.note("result", { total: result.total, modifier: result.modifier, dice: facesOf(result.dice) });
      t.eq(result.total, 1, "1+1-1");
      t.eq(result.dice.length, 3, "three faces");
      t.eq(result.dice.filter((d) => d.sign < 0).length, 1, "one negative die");
      t.eq(result.dice.filter((d) => d.sign < 0)[0]?.sides, 4, "negative is the d4");
    },
  },
  {
    id: "engine-eval-keep-high",
    suite: "Evaluation",
    name: "Advantage keeps the higher of two d20s",
    description: "Queued RNG yields face 1 then face 20. `2d20kh1` keeps 20 and marks the 1 dropped. Total is 20, not 21.",
    why: "Dropped dice stay visible in the table. If they still counted, advantage would be 3d20 in disguise.",
    run: (t) => {
      const rng = rngQueue([0, 0, 0, 0.999, 0, 0]);
      const result = evaluateExpression(parseNotation("2d20kh1"), FAIR, 0, rng);
      t.note("dice", facesOf(result.dice));
      t.eq(result.total, 20, "kept high");
      t.eq(result.dice.filter((d) => d.kept).map((d) => d.face), [20], "kept face");
      t.eq(result.dice.filter((d) => !d.kept).map((d) => d.face), [1], "dropped face");
    },
  },
  {
    id: "engine-eval-drop-low",
    suite: "Evaluation",
    name: "4d6dl1 keeps three and discards the lowest group",
    description: "All ones: four groups of 1, keep 3 high, total 3. Keep-all (`none`) would total 4. Groups, not extra exploding faces, are what get ranked.",
    why: "Character stats are 4d6 drop lowest. Counting an extra explode as a fifth die would inflate every ability score.",
    run: (t) => {
      const drop = evaluateExpression(parseNotation("4d6dl1"), FAIR, 0, constantRng(0));
      const all = evaluateExpression(parseNotation("4d6"), FAIR, 0, constantRng(0));
      t.note("drop", facesOf(drop.dice));
      t.eq(drop.dice.length, 4, "four dice");
      t.eq(drop.dice.filter((d) => d.kept).length, 3, "kept 3");
      t.eq(drop.total, 3, "three ones");
      t.eq(all.total, 4, "keep all is 4");
    },
  },
  {
    id: "engine-eval-explode-cap",
    suite: "Evaluation",
    name: "Exploding d6 chains 24 extras then stops",
    description: "A generator that always returns ~1 always hits max. `1d6!` therefore produces 25 faces (the original plus 24 explosions), all 6s, total 150.",
    why: "Without a cap, luck +100 on exploding dice would hang the tab in an infinite loop.",
    run: (t) => {
      const result = evaluateExpression(parseNotation("1d6!"), FAIR, 0, constantRng(0.999));
      const extras = result.dice.filter((d) => d.exploded);
      t.note("count", result.dice.length);
      t.eq(result.dice.length, 25, "1 original + 24 extras");
      t.eq(extras.length, 24, "exploded flag");
      t.eq(result.total, 150, "25×6");
      t.ok(result.dice.every((d) => d.face === 6), "all sixes");
    },
  },
  {
    id: "engine-eval-keep-exploding-groups",
    suite: "Evaluation",
    name: "Keep ranks exploding chains as one group, not extra dice",
    description: "`2d6kh1!` with all sixes: each die explodes to 25 faces of 6 (group sum 150). Keep 1 group, total 150 — not 300.",
    why: "If keep looked at `dice.length`, exploding would disable keep entirely and advantage would keep both chains.",
    run: (t) => {
      const result = evaluateExpression(parseNotation("2d6kh1!"), FAIR, 0, constantRng(0.999));
      const kept = result.dice.filter((d) => d.kept);
      const dropped = result.dice.filter((d) => !d.kept);
      t.note("kept", kept.length);
      t.note("dropped", dropped.length);
      t.eq(result.dice.length, 50, "two chains");
      t.eq(kept.length, 25, "one chain kept");
      t.eq(dropped.length, 25, "one chain dropped");
      t.eq(result.total, 150, "one chain of 6s");
    },
  },
  {
    id: "engine-eval-modifier-and-primary",
    suite: "Evaluation",
    name: "Numeric modifiers add once; primarySides is the first die",
    description: "`2d6+3` with all 1s totals 5. primarySides of that expression is 6, of an empty-dice stub is 20.",
    why: "Double-counting +3 would show 8 on a pair of ones. The lab chart keys off primarySides.",
    run: (t) => {
      const result = evaluateExpression(parseNotation("2d6+3"), FAIR, 0, constantRng(0));
      t.eq(result.modifier, 3, "modifier echoed");
      t.eq(result.total, 5, "1+1+3");
      t.eq(primarySides(parseNotation("1d20+1d4")), 20, "first die");
      t.eq(primarySides({ raw: "", terms: [], modifier: 0 }), 20, "fallback");
    },
  },
  {
    id: "engine-estimate-expected-deterministic",
    suite: "Evaluation",
    name: "estimateExpected is seeded from the expression and factors",
    description: "Two calls with the same arguments match exactly. A fair 1d6 with 400 samples sits near 3.5. Luck 1 sits higher.",
    why: "The tray prints `vs expected` from this Monte Carlo. If it jittered, the same roll would disagree with itself on refresh.",
    run: (t) => {
      const parsed = parseNotation("1d6");
      const a = estimateExpected(parsed, 0, 0.5, 0, 400);
      const b = estimateExpected(parsed, 0, 0.5, 0, 400);
      const lucky = estimateExpected(parsed, 1, 0.5, 0, 400);
      t.note("fair", a);
      t.note("lucky", lucky);
      t.eq(a, b, "deterministic");
      t.approx(a, 3.5, 0.15, "fair ~3.5");
      t.ok(lucky > a + 0.8, "luck raises expected");
      const d20 = estimateExpected(parseNotation("1d20"), 0, 0.5, 0);
      t.approx(d20, 10.5, 1e-9, "fair 1d20 exact expected is 10.5");
      const d6Exact = estimateExpected(parseNotation("1d6"), 0, 0.5, 0);
      t.approx(d6Exact, 3.5, 1e-9, "fair 1d6 exact expected is 3.5");
      const compoundExact = estimateExpected(parseNotation("2d6+3"), 0, 0.5, 0);
      t.approx(compoundExact, 10, 1e-9, "fair 2d6+3 exact expected is 10");
    },
  },
  {
    id: "engine-make-roll-seed-stream",
    suite: "Roll records",
    name: "makeRoll only advances the stream when a seed is actually used",
    description: "Locked `oak` at index 5 returns stream 6 and records seedUsed. Unlocked or empty-lock returns the same index and seedUsed null. The same seed+index replays the same faces.",
    why: "Unlocked rolls used to burn the stream, so locking later skipped the start of a replay.",
    run: (t) => {
      const base: Randomness = { luck: 0, chaos: 0.5, streak: 0, seed: "oak", seedLocked: true, streamIndex: 5 };
      const a = makeRoll("1d20", base, []);
      const b = makeRoll("1d20", base, []);
      t.eq(a.streamIndex, 6, "seeded advances");
      t.eq(a.record.seedUsed, "oak", "seed recorded");
      t.eq(a.record.dice.map((d) => d.face), b.record.dice.map((d) => d.face), "replay matches");
      const unlocked = makeRoll("1d20", { ...base, seedLocked: false, streamIndex: 5 }, []);
      t.eq(unlocked.streamIndex, 5, "unlocked does not advance");
      t.eq(unlocked.record.seedUsed, null, "no seed recorded");
      const emptyLock = makeRoll("1d20", { ...base, seed: "   ", streamIndex: 9 }, []);
      t.eq(emptyLock.streamIndex, 9, "blank seed ignored");
      t.eq(a.record.notation, "1d20", "raw notation stored");
      t.ok(a.record.id.length > 4, "id assigned");
      t.ok(a.record.expected > 0, "expected computed");
    },
  },
  {
    id: "engine-format-roll-line",
    suite: "Roll records",
    name: "formatRollLine marks exploded, dropped, and signed faces",
    description: "A negative exploded 4, a dropped 2, and a -3 modifier render as `−4!, 2↓ − 3`. Zero modifier is omitted. Positive modifier uses `+`.",
    why: "This is the clipboard payload. If dropped faces look identical to kept ones, a paste into chat lies about the total.",
    run: (t) => {
      const line = formatRollLine({
        ...fakeRoll({
          notation: "2d6-1d4-3",
          modifier: -3,
          total: 1,
          dice: [
            fakeDie({ id: "a", face: 4, sides: 6, sign: -1, exploded: true, kept: true }),
            fakeDie({ id: "b", face: 2, sides: 6, kept: false }),
          ],
        }),
      });
      t.note("line", line);
      t.ok(line.includes("−4!"), "exploded negative");
      t.ok(line.includes("2↓"), "dropped mark");
      t.ok(line.includes(" − 3"), "negative modifier");
      t.ok(line.endsWith("= 1"), "total");
      const plus = formatRollLine(fakeRoll({ notation: "1d20", modifier: 5, total: 15, dice: [fakeDie({ face: 10, sides: 20 })] }));
      t.ok(plus.includes(" + 5"), "positive modifier");
      const plain = formatRollLine(fakeRoll({ modifier: 0, dice: [fakeDie({ face: 7, sides: 20 })] }));
      t.ok(!plain.includes(" + ") && !plain.includes(" − "), "zero modifier omitted");
    },
  },
  {
    id: "engine-make-roll-id-fallback",
    suite: "Roll records",
    name: "makeRoll can mint an id without randomUUID",
    description: "If `crypto.randomUUID` is missing, the id is `r` plus a timestamp/random mix. Restores the original crypto object afterwards.",
    why: "Older WebViews and some test runtimes have crypto but not randomUUID. A throw here would eat the roll.",
    run: (t) => {
      const real = globalThis.crypto;
      Object.defineProperty(globalThis, "crypto", {
        configurable: true,
        value: { getRandomValues: real.getRandomValues.bind(real) },
      });
      try {
        const { record } = makeRoll("1d4", {
          luck: 0,
          chaos: 0.5,
          streak: 0,
          seed: "",
          seedLocked: false,
          streamIndex: 0,
        }, []);
        t.ok(/^r/.test(record.id), `fallback id ${record.id}`);
        t.note("id", record.id);
      } finally {
        Object.defineProperty(globalThis, "crypto", { configurable: true, value: real });
      }
    },
  },
  {
    id: "engine-unlucky-and-combined-tilt",
    suite: "Face weights",
    name: "Unlucky tilts low; luck plus streak clamp to the same cap",
    description: "Luck -1 inflates face 1 over face 6. Luck 1 with streakBias 1 is clamped to the same curve as luck 1 alone. Chaos 0.25 sits between focused and fair.",
    why: "The lab sliders add. If they stacked past the clamp, +100 luck plus momentum would make a d20 almost never show below 18.",
    run: (t) => {
      const unlucky = faceWeights(6, -1, 0.5, 0);
      t.note("unlucky", unlucky);
      t.ok(unlucky[0]! > unlucky[5]!, "unlucky prefers 1 over 6");
      const cap = faceWeights(20, 1, 0.5, 0);
      const stacked = faceWeights(20, 1, 0.5, 1);
      t.eq(cap.map((w) => w.toFixed(8)), stacked.map((w) => w.toFixed(8)), "tilt clamped at 1");
      const mix = distributionSeries(6, 0, 0.25, 0);
      const fair = distributionSeries(6, 0, 0.5, 0);
      const focused = distributionSeries(6, 0, 0, 0);
      t.ok(mix[2]!.p > fair[2]!.p && mix[2]!.p < focused[2]!.p, "chaos 0.25 is between");
      t.note("middleP", { mix: mix[2]!.p, fair: fair[2]!.p, focused: focused[2]!.p });
    },
  },
  {
    id: "engine-sample-uneven",
    suite: "Face weights",
    name: "Uneven weights walk the prefix in order",
    description: "Weights [10, 1, 1] send rng 0 to index 0 and rng just under 1 to the last index. All-zero weights still return 0 rather than hanging.",
    why: "Luck is implemented as uneven weights. An off-by-one here would make +100 luck skip the natural 20.",
    run: (t) => {
      const w = [10, 1, 1];
      t.eq(sampleWeighted(w, () => 0), 0, "start of prefix");
      t.eq(sampleWeighted(w, () => 0.0001), 0, "still in first bucket");
      t.eq(sampleWeighted(w, () => 0.999), 2, "tail");
      t.eq(sampleWeighted([0, 0, 0], () => 0.5), 0, "zero total falls to 0");
    },
  },
  {
    id: "engine-eval-keep-low-and-keep-all",
    suite: "Evaluation",
    name: "Disadvantage keeps the low face; keep-n that covers the pool keeps all",
    description: "Queued 1 then 20 on `2d20kl1` totals 1. The same faces on `2d20kh2` keep both and total 21 — keep n at the pool size is keep-all.",
    why: "Disadvantage that kept the 20 would be advantage. Keep-2 of 2 must not drop a die for looking like a keep rule.",
    run: (t) => {
      const dis = evaluateExpression(parseNotation("2d20kl1"), FAIR, 0, rngQueue([0, 0, 0, 0.999, 0, 0]));
      t.note("dis", facesOf(dis.dice));
      t.eq(dis.total, 1, "kept low");
      t.eq(dis.dice.filter((d) => d.kept).map((d) => d.face), [1], "kept 1");
      t.eq(dis.dice.filter((d) => !d.kept).map((d) => d.face), [20], "dropped 20");
      const all = evaluateExpression(parseNotation("2d20kh2"), FAIR, 0, rngQueue([0, 0, 0, 0.999, 0, 0]));
      t.eq(all.dice.every((d) => d.kept), true, "both kept");
      t.eq(all.total, 21, "1+20");
    },
  },
  {
    id: "engine-eval-mixed-and-percentile",
    suite: "Evaluation",
    name: "A mixed pool and a percentile die both score by sign and size",
    description: "`1d20+1d4+3` with all 1s totals 5. `d%` has 100 faces; rng 0 yields 1. `df` has 3 faces; rng 0 yields 1.",
    why: "A rapier plus sneak die is the everyday mixed pool. Percentile is how old-school tables write chance-in-100.",
    run: (t) => {
      const mixed = evaluateExpression(parseNotation("1d20+1d4+3"), FAIR, 0, constantRng(0));
      t.note("mixed", { total: mixed.total, dice: facesOf(mixed.dice) });
      t.eq(mixed.total, 5, "1+1+3");
      t.eq(mixed.dice.map((d) => d.sides), [20, 4], "sides in order");
      const pct = evaluateExpression(parseNotation("d%"), FAIR, 0, constantRng(0));
      t.eq(pct.dice[0]?.sides, 100, "percentile sides");
      t.eq(pct.total, 1, "rng 0 → 1");
      const fudge = evaluateExpression(parseNotation("df"), FAIR, 0, constantRng(0));
      t.eq(fudge.dice[0]?.sides, 3, "fudge sides");
      t.eq(fudge.total, 1, "fudge face 1");
    },
  },
  {
    id: "engine-streak-window-and-cold",
    suite: "Face weights",
    name: "Streak only reads five recent totals and flips on a cold run",
    description: "Six history rows: the sixth is ignored. A run of totals under expected with momentum is negative. Expected 0 uses a spread of 1 so it does not divide by zero.",
    why: "Without a window, a campaign of 200 rolls would pin luck forever. Without a floor on spread, a 0-expected fudge pool would NaN the lab.",
    run: (t) => {
      const cold = Array.from({ length: 5 }, () => fakeRoll({ total: 1, expected: 10.5 }));
      const hotTail = fakeRoll({ total: 20, expected: 10.5 });
      const windowed = streakBiasFrom([...cold, hotTail], 1);
      const coldOnly = streakBiasFrom(cold, 1);
      t.note("windowed", windowed);
      t.eq(windowed, coldOnly, "sixth row ignored");
      t.ok(coldOnly < 0, "cold + momentum is negative");
      const zeroExp = streakBiasFrom([fakeRoll({ total: 4, expected: 0 })], 1);
      t.ok(Number.isFinite(zeroExp) && zeroExp > 0, "expected 0 still finite");
    },
  },
  {
    id: "engine-format-exploded-kept-and-streaked-roll",
    suite: "Roll records",
    name: "An exploded six prints 6!; streaked history changes expected",
    description: "A kept exploded 6 with no modifier is `6!`. makeRoll of 1d6 after a hot streak with momentum does not match the fair expected, and still records the factors.",
    why: "Explode marks are how a paste proves the extra sixes. Expected must move when streak is on, or the tray's vs-expected line is a prop.",
    run: (t) => {
      const line = formatRollLine(
        fakeRoll({
          notation: "1d6!",
          modifier: 0,
          total: 12,
          dice: [fakeDie({ face: 6, sides: 6, exploded: false }), fakeDie({ id: "x", face: 6, sides: 6, exploded: true })],
        }),
      );
      t.note("line", line);
      t.ok(line.includes("6!"), "exploded mark");
      t.ok(line.startsWith("1d6!"), "notation");
      const fair = makeRoll("1d6", { luck: 0, chaos: 0.5, streak: 0, seed: "oak", seedLocked: true, streamIndex: 0 }, []);
      const hotHist = [fakeRoll({ total: 20, expected: 3.5 }), fakeRoll({ total: 18, expected: 3.5 })];
      const streaked = makeRoll("1d6", { luck: 0, chaos: 0.5, streak: 1, seed: "oak", seedLocked: true, streamIndex: 0 }, hotHist);
      t.note("fairExpected", fair.record.expected);
      t.note("streakExpected", streaked.record.expected);
      t.ok(streaked.record.expected !== fair.record.expected, "streak moves expected");
      t.eq(streaked.record.streak, 1, "streak recorded");
      t.eq(streaked.record.luck, 0, "luck recorded");
    },
  },
  {
    id: "engine-factors-apply-to-seeded-faces",
    suite: "Roll records",
    name: "Luck, chaos, and streak change seeded faces only when they actually tilt",
    description: "Same oak#0: luck +1 and chaos 1 each diverge from fair faces and raise or reshape expected. Streak +1 with no history matches fair faces and records streak 0. Hot history with streak +1 diverges and records streak 1. appliedStreak/flags agree.",
    why: "The sliders are implied to load the table. If a lucky oak replay matched a fair one, the lab would be a costume. If an empty-history streak tagged Momentum, the first roll would lie.",
    run: (t) => {
      const base: Randomness = { luck: 0, chaos: 0.5, streak: 0, seed: "oak", seedLocked: true, streamIndex: 0 };
      const fair = makeRoll("1d20", base, []);
      const lucky = makeRoll("1d20", { ...base, luck: 1 }, []);
      const wild = makeRoll("1d20", { ...base, chaos: 1 }, []);
      const waiting = makeRoll("1d20", { ...base, streak: 1 }, []);
      const hot = [fakeRoll({ total: 20, expected: 10.5 }), fakeRoll({ total: 18, expected: 10.5 })];
      const streaked = makeRoll("1d20", { ...base, streak: 1 }, hot);
      t.note("faces", {
        fair: fair.record.dice.map((d) => d.face),
        lucky: lucky.record.dice.map((d) => d.face),
        wild: wild.record.dice.map((d) => d.face),
        waiting: waiting.record.dice.map((d) => d.face),
        streaked: streaked.record.dice.map((d) => d.face),
      });
      t.ok(lucky.record.expected > fair.record.expected + 2, "luck raises expected");
      t.eq(lucky.record.luck, 1, "luck stored");
      const luckyDiffs = Array.from({ length: 24 }, (_, i) => {
        const a = makeRoll("1d20", { ...base, streamIndex: i }, []);
        const b = makeRoll("1d20", { ...base, luck: 1, streamIndex: i }, []);
        return a.record.dice[0]!.face !== b.record.dice[0]!.face;
      });
      t.ok(luckyDiffs.some(Boolean), "luck diverges on some oak index");
      const wildDiffs = Array.from({ length: 24 }, (_, i) => {
        const a = makeRoll("1d20", { ...base, streamIndex: i }, []);
        const b = makeRoll("1d20", { ...base, chaos: 1, streamIndex: i }, []);
        return a.record.dice[0]!.face !== b.record.dice[0]!.face;
      });
      t.ok(wildDiffs.some(Boolean), "chaos diverges on some oak index");
      t.eq(waiting.record.dice[0]!.face, fair.record.dice[0]!.face, "streak without history is fair");
      t.eq(waiting.record.streak, 0, "waiting streak not recorded");
      t.eq(waiting.record.expected, fair.record.expected, "waiting expected is fair");
      const streakDiffs = Array.from({ length: 24 }, (_, i) => {
        const a = makeRoll("1d20", { ...base, streamIndex: i }, []);
        const b = makeRoll("1d20", { ...base, streak: 1, streamIndex: i }, hot);
        return a.record.dice[0]!.face !== b.record.dice[0]!.face;
      });
      t.ok(streakDiffs.some(Boolean), "hot streak diverges on some oak index");
      t.eq(streaked.record.streak, 1, "applied streak stored");
      t.eq(appliedStreak(1, 0), 0, "appliedStreak zero bias");
      t.eq(appliedStreak(1, 0.4), 1, "appliedStreak with bias");
      t.eq(appliedStreak(0.004, 0.4), 0, "sub-tick slider is not recorded");
      t.eq(luckLoaded(0.01), true, "1% luck is loaded");
      t.eq(luckLoaded(0), false, "0 luck is fair");
      t.eq(luckLoaded(0.004), false, "0.4% luck is fair");
      t.eq(chaosLoaded(0.51), true, "chaos 51 is loaded");
      t.eq(chaosLoaded(0.5), false, "chaos 50 is fair");
      t.eq(chaosLoaded(0.504), false, "chaos 50.4 is fair");
      t.eq(streakLoaded(0), false, "0 streak");
      t.eq(rollFactorFlags(waiting.record).streak, false, "waiting flags hide streak");
      t.eq(rollFactorFlags(streaked.record).streak, true, "hot flags show streak");
      t.eq(rollFactorFlags(lucky.record).luck, true, "luck flag");
      const adv = estimateExpected(parseNotation("2d20kh1"), 0, 0.5, 0, 400);
      const single = estimateExpected(parseNotation("1d20"), 0, 0.5, 0, 400);
      t.note("advVsSingle", { adv, single });
      t.ok(adv > single + 1.5, "advantage expected beats a single d20");
    },
  },
  {
    id: "engine-subtick-factors-match-fair",
    suite: "Roll records",
    name: "A factor below 1% is fair in weights, expected, and the recorded row",
    description: "Luck 0.4%, chaos 50.4, and streak 0.4% produce the same d20 weights as a fair table. makeRoll records luck 0 / chaos 0.5 / streak 0. A 1% luck tick does load. effectiveLuck/Chaos/Bias snap the same way.",
    why: "The sliders move in 1% ticks and the chips use that threshold. A dusty localStorage value must not silently tilt faces while the row still says fair.",
    run: (t) => {
      const fairW = faceWeights(20, 0, 0.5, 0);
      t.eq(
        faceWeights(20, 0.004, 0.5, 0).map((w) => w.toFixed(12)),
        fairW.map((w) => w.toFixed(12)),
        "sub-tick luck is fair weights",
      );
      t.eq(
        faceWeights(20, 0, 0.504, 0).map((w) => w.toFixed(12)),
        fairW.map((w) => w.toFixed(12)),
        "sub-tick chaos is fair weights",
      );
      t.eq(
        faceWeights(20, 0, 0.5, 0.004).map((w) => w.toFixed(12)),
        fairW.map((w) => w.toFixed(12)),
        "sub-tick bias is fair weights",
      );
      t.ok(expectedFace(faceWeights(20, 0.01, 0.5, 0)) > expectedFace(fairW), "1% luck moves the mean");
      const base: Randomness = {
        luck: 0.004,
        chaos: 0.504,
        streak: 0.004,
        seed: "oak",
        seedLocked: true,
        streamIndex: 0,
      };
      const dusty = makeRoll("1d20", base, [fakeRoll({ total: 20, expected: 10.5 })]);
      const fair = makeRoll("1d20", { ...base, luck: 0, chaos: 0.5, streak: 0 }, []);
      t.eq(dusty.record.luck, 0, "recorded luck snapped");
      t.eq(dusty.record.chaos, 0.5, "recorded chaos snapped");
      t.eq(dusty.record.streak, 0, "recorded streak snapped");
      t.eq(dusty.record.dice[0]!.face, fair.record.dice[0]!.face, "dusty oak matches fair oak");
      t.eq(dusty.record.expected, fair.record.expected, "dusty expected is fair");
      t.eq(effectiveLuck(0.004), 0, "effectiveLuck");
      t.eq(effectiveLuck(2), 1, "effectiveLuck clamps");
      t.eq(effectiveChaos(0.504), 0.5, "effectiveChaos");
      t.eq(effectiveChaos(1.4), 1, "effectiveChaos clamps");
      t.eq(effectiveBias(0.004), 0, "effectiveBias");
      t.eq(effectiveBias(-0.4), -0.4, "effectiveBias keeps a real tilt");
      t.eq(rollFactorFlags(dusty.record).luck, false, "dusty luck flag off");
      t.eq(rollFactorFlags(dusty.record).chaos, false, "dusty chaos flag off");
    },
  },
  {
    id: "engine-dropped-exploded-and-subtick-estimate",
    suite: "Roll records",
    name: "Dropped exploded dice show !↓; sub-tick factors match fair expected",
    description: "An exploded die in a dropped group formats with both ! and ↓. Sub-tick luck/chaos/bias in estimateExpected produce the exact same deterministic expected as fair.",
    why: "Dropped exploded faces without ↓ appear counted in the total, causing disputes over rolls. Sub-tick factors must not desync the lab and table.",
    run: (t) => {
      const line = formatRollLine(
        fakeRoll({
          notation: "2d6kh1!",
          total: 6,
          dice: [
            fakeDie({ id: "a", face: 6, sides: 6, exploded: false, kept: true }),
            fakeDie({ id: "b", face: 6, sides: 6, exploded: false, kept: false }),
            fakeDie({ id: "c", face: 3, sides: 6, exploded: true, kept: false }),
          ],
        }),
      );
      t.note("line", line);
      t.ok(line.includes("6!↓") === false, "non-exploded dropped die is just 6↓");
      t.ok(line.includes("6↓"), "dropped first die has ↓");
      t.ok(line.includes("3!↓"), "dropped exploded die has !↓");

      const statsPool = parseNotation("4d6dl1");
      const fairExpected = estimateExpected(statsPool, 0, 0.5, 0);
      const subTickExpected = estimateExpected(statsPool, 0.004, 0.504, 0.004);
      t.eq(subTickExpected, fairExpected, "sub-tick estimateExpected matches fair exactly");
    },
  },
];

