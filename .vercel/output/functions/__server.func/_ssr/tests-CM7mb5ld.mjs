import { i as __toESM, n as __exportAll } from "../_runtime.mjs";
import { l as require_react_dom, u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { l as require_server_node } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Play, c as Download, d as ChevronDown, r as RotateCcw, s as FlaskConical, u as Copy } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as copyText, i as cn, n as SkipLink, r as AppErrorComponent } from "./router-BNAdKw7A.mjs";
import { a as describeDieTitle, i as describeDie, n as FOCUS_RING, r as SpokenLabel, t as AppHeader } from "./AppHeader-CETfn4LJ.mjs";
import { t as Faq } from "./Faq-BiWz9N-m.mjs";
import { t as UserGuide } from "./UserGuide-CSOSLwRQ.mjs";
import { t as JawsTutorial } from "./JawsTutorial-B-o_Et3v.mjs";
import { A as formatPool, B as onRadioGroupKeyDown, C as effectiveBias, D as evaluateExpression, E as estimateExpected, F as keepLabel, G as rollFactorFlags, H as poolFromExpression, I as labStatusText, J as streakLoaded, K as sampleWeighted, L as luckLoaded, M as hashSeed, N as isCompoundExpression, O as expectedFace, P as isTypingTarget, R as makeRoll, S as distributionSeries, T as effectiveLuck, U as primarySides, V as parseNotation, W as rngFor, X as useDiceStore, Y as totalDiffersFromPrimaryFace, _ as chaosLoaded, a as DieFace, b as cryptoRng, c as PRESETS, d as RollPanel, f as Slider, g as appliedStreak, h as Switch, i as DiceTray, j as formatRollLine, k as faceWeights, l as RandomnessLab, m as Stepper, n as Button, o as Input, p as StatsStrip, q as streakBiasFrom, r as DIE_SIDES, s as NotationError, t as Badge, u as ResultsTable, v as chartTicks, w as effectiveChaos, x as describeCast, y as clamp, z as mulberry32 } from "./RandomnessLab-Buyzdbxj.mjs";
import { t as require_client } from "../_libs/react-dom+scheduler.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tests-CM7mb5ld.js
var tests_CM7mb5ld_exports = /* @__PURE__ */ __exportAll({
	component: () => TestsPage,
	i: () => testsBySuite,
	n: () => runAllTests,
	r: () => runOneTest,
	t: () => ALL_TESTS
});
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
var import_client = require_client();
var import_server_node = /* @__PURE__ */ __toESM(require_server_node());
function rngQueue(values) {
	let i = 0;
	return () => {
		const v = values[Math.min(i, values.length - 1)] ?? 0;
		i += 1;
		return v;
	};
}
function constantRng(value = 0) {
	return () => value;
}
function fakeDie(partial) {
	return {
		id: partial.id ?? `d-${partial.face}`,
		kept: true,
		exploded: false,
		group: 1,
		sign: 1,
		...partial
	};
}
function fakeRoll(partial = {}) {
	return {
		id: partial.id ?? "r1",
		at: partial.at ?? 1,
		notation: partial.notation ?? "1d20",
		dice: partial.dice ?? [fakeDie({
			face: 10,
			sides: 20
		})],
		modifier: partial.modifier ?? 0,
		total: partial.total ?? 10,
		expected: partial.expected ?? 10.5,
		luck: partial.luck ?? 0,
		chaos: partial.chaos ?? .5,
		streak: partial.streak ?? 0,
		seedUsed: partial.seedUsed ?? null
	};
}
var DEFAULT_POOL = {
	count: 1,
	sides: 20,
	modifier: 0,
	keepMode: "none",
	keepN: 1,
	exploding: false,
	repeat: 1
};
var DEFAULT_RANDOMNESS = {
	luck: 0,
	chaos: .5,
	streak: 0,
	seed: "",
	seedLocked: false,
	streamIndex: 0
};
function resetStore() {
	useDiceStore.getState().clearHistory();
	useDiceStore.setState({
		notation: "1d20",
		pool: { ...DEFAULT_POOL },
		randomness: { ...DEFAULT_RANDOMNESS },
		history: [],
		last: null,
		rolling: false,
		error: null,
		hydrated: true,
		poolNotice: null,
		rngNotice: null
	});
}
function withStore(fn) {
	const prev = useDiceStore.getState();
	const snap = {
		notation: prev.notation,
		pool: { ...prev.pool },
		randomness: { ...prev.randomness },
		history: prev.history,
		last: prev.last,
		rolling: prev.rolling,
		error: prev.error,
		hydrated: prev.hydrated,
		poolNotice: prev.poolNotice,
		rngNotice: prev.rngNotice
	};
	let stored = null;
	try {
		stored = localStorage.getItem("alea-v1");
	} catch {
		stored = null;
	}
	resetStore();
	try {
		return fn();
	} finally {
		useDiceStore.getState().clearHistory();
		useDiceStore.setState(snap);
		try {
			if (stored === null) localStorage.removeItem("alea-v1");
			else localStorage.setItem("alea-v1", stored);
		} catch {}
	}
}
var FAIR = {
	luck: 0,
	chaos: .5
};
function facesOf(dice) {
	return dice.map((d) => ({
		face: d.face,
		kept: d.kept,
		sign: d.sign,
		exploded: d.exploded,
		group: d.group
	}));
}
var engineCases = [
	{
		id: "engine-fair-weights",
		suite: "Face weights",
		name: "A fair d6 is uniform; luck tilts high; chaos focuses then goes wild",
		description: "At luck 0 and chaos 0.5 every face has equal weight. Luck +1 inflates high faces. Chaos 0 peaks the middle. Chaos 1 inflates the ends.",
		why: "The curve in the Randomness lab is this function. If fair is not uniform, every 'vs expected' delta in the table is a lie.",
		run: (t) => {
			const fair = faceWeights(6, 0, .5, 0);
			t.note("fair", fair);
			t.eq(fair.length, 6, "six weights");
			t.ok(fair.every((w) => Math.abs(w - fair[0]) < 1e-12), "uniform");
			const lucky = faceWeights(6, 1, .5, 0);
			t.ok(lucky[5] > lucky[0], "luck prefers 6 over 1");
			t.note("lucky", lucky);
			const focused = faceWeights(6, 0, 0, 0);
			t.ok(focused[2] > focused[0] && focused[3] > focused[5], "focus peaks middle");
			const wild = faceWeights(6, 0, 1, 0);
			t.ok(wild[0] > wild[2] && wild[5] > wild[3], "wild prefers ends");
			const one = faceWeights(1, 0, .5, 0);
			t.eq(one.length, 1, "sides=1 still defined");
			t.ok(one[0] > 0, "positive");
		}
	},
	{
		id: "engine-sample-and-expected",
		suite: "Face weights",
		name: "sampleWeighted walks the prefix; expectedFace is the mean",
		description: "rng=0 always hits index 0. rng just under 1 hits the last index via the fallback. Empty weights return -1. expectedFace of a fair d6 is 3.5. An empty weight list reduces to 0.",
		why: "This is the only place a random number becomes a face. Off-by-one here would make a d20 never show 20.",
		run: (t) => {
			const w = [
				1,
				1,
				1,
				1,
				1,
				1
			];
			t.eq(sampleWeighted(w, () => 0), 0, "rng 0 → face index 0");
			t.eq(sampleWeighted(w, () => .999999), 5, "high rng → last index");
			t.eq(sampleWeighted(w, () => 1), 5, "rng 1 falls through to last");
			t.eq(sampleWeighted([], () => .5), -1, "empty weights");
			t.approx(expectedFace(faceWeights(6, 0, .5, 0)), 3.5, 1e-9, "fair d6 mean");
			t.ok(expectedFace(faceWeights(20, 1, .5, 0)) > 14, "lucky d20 mean well above 10.5");
			t.eq(expectedFace([]), 0, "empty weights reduce to 0");
		}
	},
	{
		id: "engine-distribution-and-ticks",
		suite: "Face weights",
		name: "distributionSeries sums to 1; chartTicks thin out large dice",
		description: "Each p is weight/total. Ticks are omitted at 12 faces or fewer, five labels on a d20, and 1 / mid / n on a d100.",
		why: "A d100 with 100 axis labels is unreadable. The lab chart has to stay a curve, not a barcode.",
		run: (t) => {
			const series = distributionSeries(6, 0, .5, 0);
			const sum = series.reduce((a, s) => a + s.p, 0);
			t.approx(sum, 1, 1e-12, "probabilities sum to 1");
			t.eq(series.map((s) => s.face), [
				1,
				2,
				3,
				4,
				5,
				6
			], "faces");
			t.eq(chartTicks(6), void 0, "d6 all ticks");
			t.eq(chartTicks(12), void 0, "d12 all ticks");
			t.eq(chartTicks(13), [
				1,
				5,
				10
			], "d13 filtered");
			t.eq(chartTicks(20), [
				1,
				5,
				10,
				15,
				20
			], "d20");
			t.eq(chartTicks(100), [
				1,
				50,
				100
			], "d100");
			t.eq(chartTicks(21), [
				1,
				11,
				21
			], "odd large");
		}
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
			t.eq(streakBiasFrom([fakeRoll({
				total: 20,
				expected: 10.5
			})], .004), 0, "sub-tick streak is off");
			const hot = [fakeRoll({
				total: 20,
				expected: 10.5
			}), fakeRoll({
				total: 18,
				expected: 10.5
			})];
			const momentum = streakBiasFrom(hot, 1);
			const revert = streakBiasFrom(hot, -1);
			t.note("momentum", momentum);
			t.note("revert", revert);
			t.ok(momentum > 0, "hot + momentum is positive");
			t.ok(revert < 0, "hot + reversion is negative");
			t.ok(Math.abs(streakBiasFrom(hot, 1)) <= 1, "clamped");
		}
	},
	{
		id: "engine-eval-signed",
		suite: "Evaluation",
		name: "2d6-1d4 with all 1s totals 1, not 3",
		description: "A constant-zero RNG always lands face 1. The two sixes add, the four-sider subtracts: 1+1-1=1. Three dice are recorded, the d4 with sign -1.",
		why: "This is the scoring bug that treated a penalty die as a bonus. The tray total is this number.",
		run: (t) => {
			const result = evaluateExpression(parseNotation("2d6-1d4"), FAIR, 0, constantRng(0));
			t.note("result", {
				total: result.total,
				modifier: result.modifier,
				dice: facesOf(result.dice)
			});
			t.eq(result.total, 1, "1+1-1");
			t.eq(result.dice.length, 3, "three faces");
			t.eq(result.dice.filter((d) => d.sign < 0).length, 1, "one negative die");
			t.eq(result.dice.filter((d) => d.sign < 0)[0]?.sides, 4, "negative is the d4");
		}
	},
	{
		id: "engine-eval-keep-high",
		suite: "Evaluation",
		name: "Advantage keeps the higher of two d20s",
		description: "Queued RNG yields face 1 then face 20. `2d20kh1` keeps 20 and marks the 1 dropped. Total is 20, not 21.",
		why: "Dropped dice stay visible in the table. If they still counted, advantage would be 3d20 in disguise.",
		run: (t) => {
			const rng = rngQueue([
				0,
				0,
				0,
				.999,
				0,
				0
			]);
			const result = evaluateExpression(parseNotation("2d20kh1"), FAIR, 0, rng);
			t.note("dice", facesOf(result.dice));
			t.eq(result.total, 20, "kept high");
			t.eq(result.dice.filter((d) => d.kept).map((d) => d.face), [20], "kept face");
			t.eq(result.dice.filter((d) => !d.kept).map((d) => d.face), [1], "dropped face");
		}
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
		}
	},
	{
		id: "engine-eval-explode-cap",
		suite: "Evaluation",
		name: "Exploding d6 chains 24 extras then stops",
		description: "A generator that always returns ~1 always hits max. `1d6!` therefore produces 25 faces (the original plus 24 explosions), all 6s, total 150.",
		why: "Without a cap, luck +100 on exploding dice would hang the tab in an infinite loop.",
		run: (t) => {
			const result = evaluateExpression(parseNotation("1d6!"), FAIR, 0, constantRng(.999));
			const extras = result.dice.filter((d) => d.exploded);
			t.note("count", result.dice.length);
			t.eq(result.dice.length, 25, "1 original + 24 extras");
			t.eq(extras.length, 24, "exploded flag");
			t.eq(result.total, 150, "25×6");
			t.ok(result.dice.every((d) => d.face === 6), "all sixes");
		}
	},
	{
		id: "engine-eval-keep-exploding-groups",
		suite: "Evaluation",
		name: "Keep ranks exploding chains as one group, not extra dice",
		description: "`2d6kh1!` with all sixes: each die explodes to 25 faces of 6 (group sum 150). Keep 1 group, total 150 — not 300.",
		why: "If keep looked at `dice.length`, exploding would disable keep entirely and advantage would keep both chains.",
		run: (t) => {
			const result = evaluateExpression(parseNotation("2d6kh1!"), FAIR, 0, constantRng(.999));
			const kept = result.dice.filter((d) => d.kept);
			const dropped = result.dice.filter((d) => !d.kept);
			t.note("kept", kept.length);
			t.note("dropped", dropped.length);
			t.eq(result.dice.length, 50, "two chains");
			t.eq(kept.length, 25, "one chain kept");
			t.eq(dropped.length, 25, "one chain dropped");
			t.eq(result.total, 150, "one chain of 6s");
		}
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
			t.eq(primarySides({
				raw: "",
				terms: [],
				modifier: 0
			}), 20, "fallback");
		}
	},
	{
		id: "engine-estimate-expected-deterministic",
		suite: "Evaluation",
		name: "estimateExpected is seeded from the expression and factors",
		description: "Two calls with the same arguments match exactly. A fair 1d6 with 400 samples sits near 3.5. Luck 1 sits higher.",
		why: "The tray prints `vs expected` from this Monte Carlo. If it jittered, the same roll would disagree with itself on refresh.",
		run: (t) => {
			const parsed = parseNotation("1d6");
			const a = estimateExpected(parsed, 0, .5, 0, 400);
			const b = estimateExpected(parsed, 0, .5, 0, 400);
			const lucky = estimateExpected(parsed, 1, .5, 0, 400);
			t.note("fair", a);
			t.note("lucky", lucky);
			t.eq(a, b, "deterministic");
			t.approx(a, 3.5, .15, "fair ~3.5");
			t.ok(lucky > a + .8, "luck raises expected");
		}
	},
	{
		id: "engine-make-roll-seed-stream",
		suite: "Roll records",
		name: "makeRoll only advances the stream when a seed is actually used",
		description: "Locked `oak` at index 5 returns stream 6 and records seedUsed. Unlocked or empty-lock returns the same index and seedUsed null. The same seed+index replays the same faces.",
		why: "Unlocked rolls used to burn the stream, so locking later skipped the start of a replay.",
		run: (t) => {
			const base = {
				luck: 0,
				chaos: .5,
				streak: 0,
				seed: "oak",
				seedLocked: true,
				streamIndex: 5
			};
			const a = makeRoll("1d20", base, []);
			const b = makeRoll("1d20", base, []);
			t.eq(a.streamIndex, 6, "seeded advances");
			t.eq(a.record.seedUsed, "oak", "seed recorded");
			t.eq(a.record.dice.map((d) => d.face), b.record.dice.map((d) => d.face), "replay matches");
			const unlocked = makeRoll("1d20", {
				...base,
				seedLocked: false,
				streamIndex: 5
			}, []);
			t.eq(unlocked.streamIndex, 5, "unlocked does not advance");
			t.eq(unlocked.record.seedUsed, null, "no seed recorded");
			const emptyLock = makeRoll("1d20", {
				...base,
				seed: "   ",
				streamIndex: 9
			}, []);
			t.eq(emptyLock.streamIndex, 9, "blank seed ignored");
			t.eq(a.record.notation, "1d20", "raw notation stored");
			t.ok(a.record.id.length > 4, "id assigned");
			t.ok(a.record.expected > 0, "expected computed");
		}
	},
	{
		id: "engine-format-roll-line",
		suite: "Roll records",
		name: "formatRollLine marks exploded, dropped, and signed faces",
		description: "A negative exploded 4, a dropped 2, and a -3 modifier render as `−4!, 2↓ − 3`. Zero modifier is omitted. Positive modifier uses `+`.",
		why: "This is the clipboard payload. If dropped faces look identical to kept ones, a paste into chat lies about the total.",
		run: (t) => {
			const line = formatRollLine({ ...fakeRoll({
				notation: "2d6-1d4-3",
				modifier: -3,
				total: 1,
				dice: [fakeDie({
					id: "a",
					face: 4,
					sides: 6,
					sign: -1,
					exploded: true,
					kept: true
				}), fakeDie({
					id: "b",
					face: 2,
					sides: 6,
					kept: false
				})]
			}) });
			t.note("line", line);
			t.ok(line.includes("−4!"), "exploded negative");
			t.ok(line.includes("2↓"), "dropped mark");
			t.ok(line.includes(" − 3"), "negative modifier");
			t.ok(line.endsWith("= 1"), "total");
			const plus = formatRollLine(fakeRoll({
				notation: "1d20",
				modifier: 5,
				total: 15,
				dice: [fakeDie({
					face: 10,
					sides: 20
				})]
			}));
			t.ok(plus.includes(" + 5"), "positive modifier");
			const plain = formatRollLine(fakeRoll({
				modifier: 0,
				dice: [fakeDie({
					face: 7,
					sides: 20
				})]
			}));
			t.ok(!plain.includes(" + ") && !plain.includes(" − "), "zero modifier omitted");
		}
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
				value: { getRandomValues: real.getRandomValues.bind(real) }
			});
			try {
				const { record } = makeRoll("1d4", {
					luck: 0,
					chaos: .5,
					streak: 0,
					seed: "",
					seedLocked: false,
					streamIndex: 0
				}, []);
				t.ok(/^r/.test(record.id), `fallback id ${record.id}`);
				t.note("id", record.id);
			} finally {
				Object.defineProperty(globalThis, "crypto", {
					configurable: true,
					value: real
				});
			}
		}
	},
	{
		id: "engine-unlucky-and-combined-tilt",
		suite: "Face weights",
		name: "Unlucky tilts low; luck plus streak clamp to the same cap",
		description: "Luck -1 inflates face 1 over face 6. Luck 1 with streakBias 1 is clamped to the same curve as luck 1 alone. Chaos 0.25 sits between focused and fair.",
		why: "The lab sliders add. If they stacked past the clamp, +100 luck plus momentum would make a d20 almost never show below 18.",
		run: (t) => {
			const unlucky = faceWeights(6, -1, .5, 0);
			t.note("unlucky", unlucky);
			t.ok(unlucky[0] > unlucky[5], "unlucky prefers 1 over 6");
			const cap = faceWeights(20, 1, .5, 0);
			const stacked = faceWeights(20, 1, .5, 1);
			t.eq(cap.map((w) => w.toFixed(8)), stacked.map((w) => w.toFixed(8)), "tilt clamped at 1");
			const mix = distributionSeries(6, 0, .25, 0);
			const fair = distributionSeries(6, 0, .5, 0);
			const focused = distributionSeries(6, 0, 0, 0);
			t.ok(mix[2].p > fair[2].p && mix[2].p < focused[2].p, "chaos 0.25 is between");
			t.note("middleP", {
				mix: mix[2].p,
				fair: fair[2].p,
				focused: focused[2].p
			});
		}
	},
	{
		id: "engine-sample-uneven",
		suite: "Face weights",
		name: "Uneven weights walk the prefix in order",
		description: "Weights [10, 1, 1] send rng 0 to index 0 and rng just under 1 to the last index. All-zero weights still return 0 rather than hanging.",
		why: "Luck is implemented as uneven weights. An off-by-one here would make +100 luck skip the natural 20.",
		run: (t) => {
			const w = [
				10,
				1,
				1
			];
			t.eq(sampleWeighted(w, () => 0), 0, "start of prefix");
			t.eq(sampleWeighted(w, () => 1e-4), 0, "still in first bucket");
			t.eq(sampleWeighted(w, () => .999), 2, "tail");
			t.eq(sampleWeighted([
				0,
				0,
				0
			], () => .5), 0, "zero total falls to 0");
		}
	},
	{
		id: "engine-eval-keep-low-and-keep-all",
		suite: "Evaluation",
		name: "Disadvantage keeps the low face; keep-n that covers the pool keeps all",
		description: "Queued 1 then 20 on `2d20kl1` totals 1. The same faces on `2d20kh2` keep both and total 21 — keep n at the pool size is keep-all.",
		why: "Disadvantage that kept the 20 would be advantage. Keep-2 of 2 must not drop a die for looking like a keep rule.",
		run: (t) => {
			const dis = evaluateExpression(parseNotation("2d20kl1"), FAIR, 0, rngQueue([
				0,
				0,
				0,
				.999,
				0,
				0
			]));
			t.note("dis", facesOf(dis.dice));
			t.eq(dis.total, 1, "kept low");
			t.eq(dis.dice.filter((d) => d.kept).map((d) => d.face), [1], "kept 1");
			t.eq(dis.dice.filter((d) => !d.kept).map((d) => d.face), [20], "dropped 20");
			const all = evaluateExpression(parseNotation("2d20kh2"), FAIR, 0, rngQueue([
				0,
				0,
				0,
				.999,
				0,
				0
			]));
			t.eq(all.dice.every((d) => d.kept), true, "both kept");
			t.eq(all.total, 21, "1+20");
		}
	},
	{
		id: "engine-eval-mixed-and-percentile",
		suite: "Evaluation",
		name: "A mixed pool and a percentile die both score by sign and size",
		description: "`1d20+1d4+3` with all 1s totals 5. `d%` has 100 faces; rng 0 yields 1. `df` has 3 faces; rng 0 yields 1.",
		why: "A rapier plus sneak die is the everyday mixed pool. Percentile is how old-school tables write chance-in-100.",
		run: (t) => {
			const mixed = evaluateExpression(parseNotation("1d20+1d4+3"), FAIR, 0, constantRng(0));
			t.note("mixed", {
				total: mixed.total,
				dice: facesOf(mixed.dice)
			});
			t.eq(mixed.total, 5, "1+1+3");
			t.eq(mixed.dice.map((d) => d.sides), [20, 4], "sides in order");
			const pct = evaluateExpression(parseNotation("d%"), FAIR, 0, constantRng(0));
			t.eq(pct.dice[0]?.sides, 100, "percentile sides");
			t.eq(pct.total, 1, "rng 0 → 1");
			const fudge = evaluateExpression(parseNotation("df"), FAIR, 0, constantRng(0));
			t.eq(fudge.dice[0]?.sides, 3, "fudge sides");
			t.eq(fudge.total, 1, "fudge face 1");
		}
	},
	{
		id: "engine-streak-window-and-cold",
		suite: "Face weights",
		name: "Streak only reads five recent totals and flips on a cold run",
		description: "Six history rows: the sixth is ignored. A run of totals under expected with momentum is negative. Expected 0 uses a spread of 1 so it does not divide by zero.",
		why: "Without a window, a campaign of 200 rolls would pin luck forever. Without a floor on spread, a 0-expected fudge pool would NaN the lab.",
		run: (t) => {
			const cold = Array.from({ length: 5 }, () => fakeRoll({
				total: 1,
				expected: 10.5
			}));
			const hotTail = fakeRoll({
				total: 20,
				expected: 10.5
			});
			const windowed = streakBiasFrom([...cold, hotTail], 1);
			const coldOnly = streakBiasFrom(cold, 1);
			t.note("windowed", windowed);
			t.eq(windowed, coldOnly, "sixth row ignored");
			t.ok(coldOnly < 0, "cold + momentum is negative");
			const zeroExp = streakBiasFrom([fakeRoll({
				total: 4,
				expected: 0
			})], 1);
			t.ok(Number.isFinite(zeroExp) && zeroExp > 0, "expected 0 still finite");
		}
	},
	{
		id: "engine-format-exploded-kept-and-streaked-roll",
		suite: "Roll records",
		name: "An exploded six prints 6!; streaked history changes expected",
		description: "A kept exploded 6 with no modifier is `6!`. makeRoll of 1d6 after a hot streak with momentum does not match the fair expected, and still records the factors.",
		why: "Explode marks are how a paste proves the extra sixes. Expected must move when streak is on, or the tray's vs-expected line is a prop.",
		run: (t) => {
			const line = formatRollLine(fakeRoll({
				notation: "1d6!",
				modifier: 0,
				total: 12,
				dice: [fakeDie({
					face: 6,
					sides: 6,
					exploded: false
				}), fakeDie({
					id: "x",
					face: 6,
					sides: 6,
					exploded: true
				})]
			}));
			t.note("line", line);
			t.ok(line.includes("6!"), "exploded mark");
			t.ok(line.startsWith("1d6!"), "notation");
			const fair = makeRoll("1d6", {
				luck: 0,
				chaos: .5,
				streak: 0,
				seed: "oak",
				seedLocked: true,
				streamIndex: 0
			}, []);
			const hotHist = [fakeRoll({
				total: 20,
				expected: 3.5
			}), fakeRoll({
				total: 18,
				expected: 3.5
			})];
			const streaked = makeRoll("1d6", {
				luck: 0,
				chaos: .5,
				streak: 1,
				seed: "oak",
				seedLocked: true,
				streamIndex: 0
			}, hotHist);
			t.note("fairExpected", fair.record.expected);
			t.note("streakExpected", streaked.record.expected);
			t.ok(streaked.record.expected !== fair.record.expected, "streak moves expected");
			t.eq(streaked.record.streak, 1, "streak recorded");
			t.eq(streaked.record.luck, 0, "luck recorded");
		}
	},
	{
		id: "engine-factors-apply-to-seeded-faces",
		suite: "Roll records",
		name: "Luck, chaos, and streak change seeded faces only when they actually tilt",
		description: "Same oak#0: luck +1 and chaos 1 each diverge from fair faces and raise or reshape expected. Streak +1 with no history matches fair faces and records streak 0. Hot history with streak +1 diverges and records streak 1. appliedStreak/flags agree.",
		why: "The sliders are implied to load the table. If a lucky oak replay matched a fair one, the lab would be a costume. If an empty-history streak tagged Momentum, the first roll would lie.",
		run: (t) => {
			const base = {
				luck: 0,
				chaos: .5,
				streak: 0,
				seed: "oak",
				seedLocked: true,
				streamIndex: 0
			};
			const fair = makeRoll("1d20", base, []);
			const lucky = makeRoll("1d20", {
				...base,
				luck: 1
			}, []);
			const wild = makeRoll("1d20", {
				...base,
				chaos: 1
			}, []);
			const waiting = makeRoll("1d20", {
				...base,
				streak: 1
			}, []);
			const hot = [fakeRoll({
				total: 20,
				expected: 10.5
			}), fakeRoll({
				total: 18,
				expected: 10.5
			})];
			const streaked = makeRoll("1d20", {
				...base,
				streak: 1
			}, hot);
			t.note("faces", {
				fair: fair.record.dice.map((d) => d.face),
				lucky: lucky.record.dice.map((d) => d.face),
				wild: wild.record.dice.map((d) => d.face),
				waiting: waiting.record.dice.map((d) => d.face),
				streaked: streaked.record.dice.map((d) => d.face)
			});
			t.ok(lucky.record.expected > fair.record.expected + 2, "luck raises expected");
			t.eq(lucky.record.luck, 1, "luck stored");
			const luckyDiffs = Array.from({ length: 24 }, (_, i) => {
				const a = makeRoll("1d20", {
					...base,
					streamIndex: i
				}, []);
				const b = makeRoll("1d20", {
					...base,
					luck: 1,
					streamIndex: i
				}, []);
				return a.record.dice[0].face !== b.record.dice[0].face;
			});
			t.ok(luckyDiffs.some(Boolean), "luck diverges on some oak index");
			const wildDiffs = Array.from({ length: 24 }, (_, i) => {
				const a = makeRoll("1d20", {
					...base,
					streamIndex: i
				}, []);
				const b = makeRoll("1d20", {
					...base,
					chaos: 1,
					streamIndex: i
				}, []);
				return a.record.dice[0].face !== b.record.dice[0].face;
			});
			t.ok(wildDiffs.some(Boolean), "chaos diverges on some oak index");
			t.eq(waiting.record.dice[0].face, fair.record.dice[0].face, "streak without history is fair");
			t.eq(waiting.record.streak, 0, "waiting streak not recorded");
			t.eq(waiting.record.expected, fair.record.expected, "waiting expected is fair");
			const streakDiffs = Array.from({ length: 24 }, (_, i) => {
				const a = makeRoll("1d20", {
					...base,
					streamIndex: i
				}, []);
				const b = makeRoll("1d20", {
					...base,
					streak: 1,
					streamIndex: i
				}, hot);
				return a.record.dice[0].face !== b.record.dice[0].face;
			});
			t.ok(streakDiffs.some(Boolean), "hot streak diverges on some oak index");
			t.eq(streaked.record.streak, 1, "applied streak stored");
			t.eq(appliedStreak(1, 0), 0, "appliedStreak zero bias");
			t.eq(appliedStreak(1, .4), 1, "appliedStreak with bias");
			t.eq(appliedStreak(.004, .4), 0, "sub-tick slider is not recorded");
			t.eq(luckLoaded(.01), true, "1% luck is loaded");
			t.eq(luckLoaded(0), false, "0 luck is fair");
			t.eq(luckLoaded(.004), false, "0.4% luck is fair");
			t.eq(chaosLoaded(.51), true, "chaos 51 is loaded");
			t.eq(chaosLoaded(.5), false, "chaos 50 is fair");
			t.eq(chaosLoaded(.504), false, "chaos 50.4 is fair");
			t.eq(streakLoaded(0), false, "0 streak");
			t.eq(rollFactorFlags(waiting.record).streak, false, "waiting flags hide streak");
			t.eq(rollFactorFlags(streaked.record).streak, true, "hot flags show streak");
			t.eq(rollFactorFlags(lucky.record).luck, true, "luck flag");
			const adv = estimateExpected(parseNotation("2d20kh1"), 0, .5, 0, 400);
			const single = estimateExpected(parseNotation("1d20"), 0, .5, 0, 400);
			t.note("advVsSingle", {
				adv,
				single
			});
			t.ok(adv > single + 1.5, "advantage expected beats a single d20");
		}
	},
	{
		id: "engine-subtick-factors-match-fair",
		suite: "Roll records",
		name: "A factor below 1% is fair in weights, expected, and the recorded row",
		description: "Luck 0.4%, chaos 50.4, and streak 0.4% produce the same d20 weights as a fair table. makeRoll records luck 0 / chaos 0.5 / streak 0. A 1% luck tick does load. effectiveLuck/Chaos/Bias snap the same way.",
		why: "The sliders move in 1% ticks and the chips use that threshold. A dusty localStorage value must not silently tilt faces while the row still says fair.",
		run: (t) => {
			const fairW = faceWeights(20, 0, .5, 0);
			t.eq(faceWeights(20, .004, .5, 0).map((w) => w.toFixed(12)), fairW.map((w) => w.toFixed(12)), "sub-tick luck is fair weights");
			t.eq(faceWeights(20, 0, .504, 0).map((w) => w.toFixed(12)), fairW.map((w) => w.toFixed(12)), "sub-tick chaos is fair weights");
			t.eq(faceWeights(20, 0, .5, .004).map((w) => w.toFixed(12)), fairW.map((w) => w.toFixed(12)), "sub-tick bias is fair weights");
			t.ok(expectedFace(faceWeights(20, .01, .5, 0)) > expectedFace(fairW), "1% luck moves the mean");
			const base = {
				luck: .004,
				chaos: .504,
				streak: .004,
				seed: "oak",
				seedLocked: true,
				streamIndex: 0
			};
			const dusty = makeRoll("1d20", base, [fakeRoll({
				total: 20,
				expected: 10.5
			})]);
			const fair = makeRoll("1d20", {
				...base,
				luck: 0,
				chaos: .5,
				streak: 0
			}, []);
			t.eq(dusty.record.luck, 0, "recorded luck snapped");
			t.eq(dusty.record.chaos, .5, "recorded chaos snapped");
			t.eq(dusty.record.streak, 0, "recorded streak snapped");
			t.eq(dusty.record.dice[0].face, fair.record.dice[0].face, "dusty oak matches fair oak");
			t.eq(dusty.record.expected, fair.record.expected, "dusty expected is fair");
			t.eq(effectiveLuck(.004), 0, "effectiveLuck");
			t.eq(effectiveLuck(2), 1, "effectiveLuck clamps");
			t.eq(effectiveChaos(.504), .5, "effectiveChaos");
			t.eq(effectiveChaos(1.4), 1, "effectiveChaos clamps");
			t.eq(effectiveBias(.004), 0, "effectiveBias");
			t.eq(effectiveBias(-.4), -.4, "effectiveBias keeps a real tilt");
			t.eq(rollFactorFlags(dusty.record).luck, false, "dusty luck flag off");
			t.eq(rollFactorFlags(dusty.record).chaos, false, "dusty chaos flag off");
		}
	}
];
function deepEqual(a, b) {
	if (Object.is(a, b)) return true;
	if (typeof a !== typeof b) return false;
	if (typeof a !== "object" || a === null || b === null) return false;
	if (Array.isArray(a) !== Array.isArray(b)) return false;
	if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
	const ak = Object.keys(a).sort();
	const bk = Object.keys(b).sort();
	if (ak.length !== bk.length) return false;
	return ak.every((k, i) => k === bk[i] && deepEqual(a[k], b[k]));
}
var Harness = class {
	assertions = [];
	logs = [];
	notes = {};
	failed = false;
	eq(actual, expected, name) {
		const passed = deepEqual(actual, expected);
		this.assertions.push({
			name,
			passed,
			actual,
			expected
		});
		if (!passed) this.failed = true;
	}
	ok(condition, name, detail) {
		const passed = Boolean(condition);
		this.assertions.push({
			name,
			passed,
			actual: condition,
			expected: true,
			detail
		});
		if (!passed) this.failed = true;
	}
	approx(actual, expected, epsilon, name) {
		const passed = Number.isFinite(actual) && Math.abs(actual - expected) <= epsilon;
		this.assertions.push({
			name,
			passed,
			actual,
			expected,
			detail: `±${epsilon}`
		});
		if (!passed) this.failed = true;
	}
	throws(fn, match, name) {
		let actual = "(no throw)";
		let passed = false;
		try {
			fn();
		} catch (err) {
			actual = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
			const text = err instanceof Error ? err.message : String(err);
			passed = typeof match === "string" ? text.includes(match) : match.test(text);
		}
		this.assertions.push({
			name,
			passed,
			actual,
			expected: typeof match === "string" ? match : match.toString()
		});
		if (!passed) this.failed = true;
	}
	log(message, data) {
		this.logs.push(data === void 0 ? message : `${message} ${stringify(data)}`);
	}
	note(key, value) {
		this.notes[key] = value;
	}
};
function stringify(value) {
	if (value === void 0) return "undefined";
	try {
		return JSON.stringify(value, (_k, v) => {
			if (typeof v === "number" && !Number.isFinite(v)) return String(v);
			if (typeof v === "bigint") return v.toString();
			if (typeof v === "function") return `[Function ${v.name || "anonymous"}]`;
			if (v instanceof Error) return {
				name: v.name,
				message: v.message,
				stack: v.stack
			};
			return v;
		}, 2) ?? String(value);
	} catch {
		return String(value);
	}
}
function isBrowser() {
	return typeof window !== "undefined" && typeof document !== "undefined";
}
async function runTests(defs) {
	const started = Date.now();
	const startedAt = (/* @__PURE__ */ new Date()).toISOString();
	const results = [];
	for (const def of defs) {
		const t0 = Date.now();
		if (def.env === "browser" && !isBrowser()) {
			results.push({
				id: def.id,
				suite: def.suite,
				name: def.name,
				description: def.description,
				why: def.why,
				status: "skipped",
				durationMs: 0,
				assertions: [],
				logs: [],
				notes: { _env: isBrowser() ? "browser" : "node" },
				skipReason: "Requires a browser document (run this case in the Assay page)."
			});
			continue;
		}
		const harness = new Harness();
		harness.note("_env", isBrowser() ? "browser" : "node");
		harness.note("_startedAt", (/* @__PURE__ */ new Date()).toISOString());
		try {
			await def.run(harness);
			harness.note("_assertionCount", harness.assertions.length);
			if (harness.failed) results.push({
				id: def.id,
				suite: def.suite,
				name: def.name,
				description: def.description,
				why: def.why,
				status: "failed",
				durationMs: Date.now() - t0,
				assertions: harness.assertions,
				logs: harness.logs,
				notes: harness.notes,
				error: { message: "One or more assertions failed." }
			});
			else results.push({
				id: def.id,
				suite: def.suite,
				name: def.name,
				description: def.description,
				why: def.why,
				status: "passed",
				durationMs: Date.now() - t0,
				assertions: harness.assertions,
				logs: harness.logs,
				notes: harness.notes
			});
		} catch (err) {
			harness.note("_assertionCount", harness.assertions.length);
			results.push({
				id: def.id,
				suite: def.suite,
				name: def.name,
				description: def.description,
				why: def.why,
				status: "failed",
				durationMs: Date.now() - t0,
				assertions: harness.assertions,
				logs: harness.logs,
				notes: harness.notes,
				error: {
					message: err instanceof Error ? err.message : String(err),
					stack: err instanceof Error ? err.stack : void 0
				}
			});
		}
	}
	const passed = results.filter((r) => r.status === "passed").length;
	const failed = results.filter((r) => r.status === "failed").length;
	const skipped = results.filter((r) => r.status === "skipped").length;
	return {
		startedAt,
		durationMs: Date.now() - started,
		passed,
		failed,
		skipped,
		total: results.length,
		results
	};
}
var harnessCases = [{
	id: "harness-equality-stringify-and-throws",
	suite: "Harness",
	name: "The recorder stores expected vs actual, including weird JSON",
	description: "Deep equality ignores key order and walks arrays. stringify prints NaN, Infinity, bigint, undefined, and functions as readable text. throws() records `(no throw)` when the function succeeds.",
	why: "Every other case is only as trustworthy as this recorder. If stringify dropped NaN or equality shuffled arrays, a failed assertion would look like a pass.",
	run: (t) => {
		t.eq({
			b: { c: [1, 2] },
			a: 1
		}, {
			a: 1,
			b: { c: [1, 2] }
		}, "key order");
		t.eq([
			1,
			2,
			3
		], [
			1,
			2,
			3
		], "array");
		const inner = new Harness();
		inner.eq(1, 2, "mismatch");
		inner.ok(0, "falsey");
		inner.approx(10, 0, .1, "far");
		inner.throws(() => 1, "boom", "no throw");
		inner.log("hello", { n: 1 });
		t.eq(inner.failed, true, "failed flag");
		t.eq(inner.assertions.filter((a) => !a.passed).length, 4, "four recorded fails");
		t.eq(inner.assertions.find((a) => a.name === "no throw")?.actual, "(no throw)", "no-throw marker");
		t.ok(inner.logs[0]?.includes("hello"), "log kept");
		t.eq(stringify(NaN), "\"NaN\"", "NaN");
		t.eq(stringify(Number.POSITIVE_INFINITY), "\"Infinity\"", "Infinity");
		t.eq(stringify(100n), "\"100\"", "bigint");
		t.eq(stringify(void 0), "undefined", "undefined");
		t.ok(stringify(() => void 0).includes("Function"), "function");
		const circular = {};
		circular.me = circular;
		t.ok(stringify(circular).length > 0, "circular does not throw");
		const innerThrow = new Harness();
		innerThrow.throws(() => {
			throw new Error("abc");
		}, /ab/, "regex match");
		innerThrow.throws(() => {
			throw "nope";
		}, "nope", "string throw");
		t.eq(innerThrow.assertions.every((a) => a.passed), true, "regex and string throws recorded as pass");
		t.note("innerFailures", inner.assertions.map((a) => ({
			name: a.name,
			passed: a.passed,
			actual: a.actual,
			expected: a.expected
		})));
	}
}, {
	id: "harness-skip-unknown-and-unique-ids",
	suite: "Harness",
	name: "Browser-only cases skip in the shell; ids are unique; unknown ids throw",
	description: "A def with env=browser is skipped when there is no document, and still carries its name, description, and why. runOneTest of a missing id throws. Every catalog id is unique.",
	why: "The command-line runner and the Assay page share this catalog. Duplicate ids would make 'Run this case' rewrite the wrong row.",
	run: async (t) => {
		const probe = {
			id: "tmp-browser-only",
			suite: "Harness",
			name: "tmp",
			description: "tmp description",
			why: "tmp why",
			env: "browser",
			run: () => {
				throw new Error("should not run");
			}
		};
		if (!isBrowser()) {
			const summary = await runTests([probe]);
			t.eq(summary.skipped, 1, "skipped in node");
			t.eq(summary.results[0]?.status, "skipped", "status");
			t.eq(summary.results[0]?.description, "tmp description", "description kept");
			t.ok((summary.results[0]?.skipReason ?? "").includes("Assay"), "points at Assay");
		} else t.ok(true, "in a document — skip probe does not apply");
		const { ALL_TESTS, runOneTest } = await import("./test-BO7IIxUj.mjs");
		let threw = "";
		try {
			await runOneTest("does-not-exist");
		} catch (err) {
			threw = err instanceof Error ? err.message : String(err);
		}
		t.ok(threw.includes("Unknown test"), "unknown id");
		const ids = ALL_TESTS.map((d) => d.id);
		t.eq(ids.length, new Set(ids).size, "unique ids");
		t.ok(ids.length >= 50, `catalog size ${ids.length}`);
		t.ok(ALL_TESTS.every((d) => d.name.trim() && d.description.trim() && d.why.trim()), "every case has a name, description, and why");
		const exploded = await runTests([{
			id: "tmp-boom",
			suite: "Harness",
			name: "tmp boom",
			description: "throws",
			why: "covers the catch path",
			run: () => {
				throw new Error("felt caught fire");
			}
		}]);
		t.eq(exploded.failed, 1, "throwing run is failed");
		t.ok((exploded.results[0]?.error?.message ?? "").includes("felt caught fire"), "message kept");
		t.note("catalog", {
			count: ids.length,
			suites: [...new Set(ALL_TESTS.map((d) => d.suite))]
		});
	}
}];
function diceTerm(parsed, index = 0) {
	const term = parsed.terms.filter((t) => t.kind === "dice")[index];
	if (!term || term.kind !== "dice") throw new Error(`no dice term at ${index}`);
	return term.term;
}
var notationCases = [
	{
		id: "notation-bare-d20",
		suite: "Notation",
		name: "Bare d20 is one twenty-sided die",
		description: "Omitting the count is the table’s shorthand for a single die. `d20` must parse as 1d20 with no keep, explode, or modifier.",
		why: "Almost every session starts on a d20. If this shorthand slips, the notation field feels broken on first keystroke.",
		run: (t) => {
			const parsed = parseNotation("d20");
			t.note("input", "d20");
			t.note("parsed", parsed);
			t.eq(parsed.raw, "d20", "compact raw");
			t.eq(diceTerm(parsed).count, 1, "implied count");
			t.eq(diceTerm(parsed).sides, 20, "sides");
			t.eq(diceTerm(parsed).sign, 1, "sign");
			t.eq(diceTerm(parsed).exploding, false, "not exploding");
			t.eq(diceTerm(parsed).keep, {
				mode: "none",
				n: 1
			}, "keep all");
			t.eq(parsed.modifier, 0, "no modifier");
		}
	},
	{
		id: "notation-spaces-case",
		suite: "Notation",
		name: "Spaces and capitals collapse to compact form",
		description: "`2D6 + 3` is the same pool as `2d6+3`. Whitespace is stripped and letters lowercased before matching.",
		why: "People type the way they talk. The parser has to accept messy input without changing the math.",
		run: (t) => {
			const parsed = parseNotation("  2D6 + 3 ");
			t.note("parsed", parsed);
			t.eq(parsed.raw, "2d6+3", "raw");
			t.eq(diceTerm(parsed).count, 2, "count");
			t.eq(parsed.modifier, 3, "modifier");
		}
	},
	{
		id: "notation-signed-subtraction",
		suite: "Notation",
		name: "2d6-1d4 subtracts the four-sider",
		description: "Each dice term carries a sign from the leading + or -. The d4 is a negative term, not a modifier of 1.",
		why: "Penalty dice are how 5e-style tables write `2d6-1d4`. Adding the d4 was a real scoring bug.",
		run: (t) => {
			const parsed = parseNotation("2d6-1d4");
			t.note("parsed", parsed);
			t.eq(parsed.terms.length, 2, "two dice terms");
			t.eq(diceTerm(parsed, 0).sign, 1, "2d6 positive");
			t.eq(diceTerm(parsed, 1).sign, -1, "1d4 negative");
			t.eq(diceTerm(parsed, 1).sides, 4, "d4 sides");
			t.eq(parsed.modifier, 0, "no numeric modifier");
			t.ok(isCompoundExpression(parsed), "compound because two dice");
		}
	},
	{
		id: "notation-unicode-minus",
		suite: "Notation",
		name: "Unicode minuses paste as subtraction",
		description: "Minus (U+2212), en-dash, and em-dash are normalized to ASCII hyphen-minus before parsing, so copied results paste back into the field.",
		why: "The roll line uses a typographic minus. If paste failed, the copy button would be a trap.",
		run: (t) => {
			for (const input of [
				"2d6−1d4",
				"2d6–1d4",
				"2d6—1d4"
			]) {
				const parsed = parseNotation(input);
				t.eq(diceTerm(parsed, 1).sign, -1, `${input} d4 sign`);
			}
			t.note("samples", [
				"2d6−1d4",
				"2d6–1d4",
				"2d6—1d4"
			]);
		}
	},
	{
		id: "notation-keep-high-low-drop",
		suite: "Notation",
		name: "kh, kl, dl, dh, and k rewrite into keep-n",
		description: "Keep-high, keep-low, drop-low, drop-high, and the `k` shorthand all compile to a keep mode plus n. Drop-low 1 of 4 is keep 3 high.",
		why: "Stats (`4d6dl1`) and advantage (`2d20kh1`) are the two most-used presets. They must round-trip through the same keep engine.",
		run: (t) => {
			const adv = diceTerm(parseNotation("2d20kh1"));
			const dis = diceTerm(parseNotation("2d20kl1"));
			const stats = diceTerm(parseNotation("4d6dl1"));
			const dropHigh = diceTerm(parseNotation("4d6dh1"));
			const short = diceTerm(parseNotation("2d6k1"));
			t.note("adv", adv.keep);
			t.note("dis", dis.keep);
			t.note("stats", stats.keep);
			t.eq(adv.keep, {
				mode: "highest",
				n: 1
			}, "advantage");
			t.eq(dis.keep, {
				mode: "lowest",
				n: 1
			}, "disadvantage");
			t.eq(stats.keep, {
				mode: "highest",
				n: 3
			}, "4d6dl1 → keep 3 high");
			t.eq(dropHigh.keep, {
				mode: "lowest",
				n: 3
			}, "4d6dh1 → keep 3 low");
			t.eq(short.keep, {
				mode: "highest",
				n: 1
			}, "k1 shorthand");
		}
	},
	{
		id: "notation-keep-clamps",
		suite: "Notation",
		name: "Keep n never exceeds the pool and never drops to zero",
		description: "`2d6kh9` clamps to keep 2. `4d6dl5` drops 5 of 4, which would empty the pool, so n stays at least 1.",
		why: "A keep of 0 would discard every face and print a total of 0 — a silent scoring failure.",
		run: (t) => {
			t.eq(diceTerm(parseNotation("2d6kh9")).keep.n, 2, "kh9 clamps to count");
			t.eq(diceTerm(parseNotation("4d6dl5")).keep, {
				mode: "highest",
				n: 1
			}, "over-drop keeps 1");
			t.eq(diceTerm(parseNotation("2d6kl0")).keep.n, 1, "kl0 treated as 1");
		}
	},
	{
		id: "notation-exploding-and-percent",
		suite: "Notation",
		name: "Exploding bang, d%, and d100 are the same hundred-sider",
		description: "`2d6kh1!` attaches explode after keep. `d%` and `d100` both become 100 faces. `df` is the three-faced fudge stand-in.",
		why: "Percentile rolls and exploding fireballs are written differently across books. The engine has to treat the aliases as one die size.",
		run: (t) => {
			const boom = diceTerm(parseNotation("2d6kh1!"));
			t.eq(boom.exploding, true, "exploding");
			t.eq(boom.keep.mode, "highest", "keep still parsed");
			t.eq(diceTerm(parseNotation("d%")).sides, 100, "d%");
			t.eq(diceTerm(parseNotation("1d100")).sides, 100, "d100");
			t.eq(diceTerm(parseNotation("df")).sides, 3, "df");
		}
	},
	{
		id: "notation-modifiers-accumulate",
		suite: "Notation",
		name: "Stacked numeric modifiers net into one total",
		description: "`2d6+3+2` is +5. `2d6-3+2` is -1. A leading `+3+2d6` still finds the dice term.",
		why: "The pool steppers only expose one modifier. The parser must fold split bonuses so the table and the stepper agree.",
		run: (t) => {
			t.eq(parseNotation("2d6+3+2").modifier, 5, "plus plus");
			t.eq(parseNotation("2d6-3+2").modifier, -1, "minus then plus");
			t.eq(parseNotation("+3+2d6").modifier, 3, "leading bonus");
			t.eq(diceTerm(parseNotation("+3+2d6")).count, 2, "dice still found");
		}
	},
	{
		id: "notation-rejects-garbage",
		suite: "Notation",
		name: "Illegal expressions throw NotationError with a useful line",
		description: "Empty input, leftover junk, zero dice, a d1, 101 dice, a 1001-sider, and a modifier with no die all fail closed.",
		why: "The Roll button must never send an unparsed string into the RNG. The message is what the notation field shows in red.",
		run: (t) => {
			t.throws(() => parseNotation(""), "Enter a dice expression", "empty");
			t.throws(() => parseNotation("   "), "Enter a dice expression", "whitespace");
			t.throws(() => parseNotation("nope"), "Could not parse", "junk");
			t.throws(() => parseNotation("2d6+"), "Could not parse", "trailing plus");
			t.throws(() => parseNotation("0d6"), "Dice count must be between 1 and 100", "zero count");
			t.throws(() => parseNotation("101d6"), "Dice count must be between 1 and 100", "too many");
			t.throws(() => parseNotation("1d1"), "Die size must be between 2 and 1000", "d1");
			t.throws(() => parseNotation("1d1001"), "Die size must be between 2 and 1000", "too big");
			t.throws(() => parseNotation("+3"), "Add at least one die", "modifier only");
			t.throws(() => parseNotation("1d20+100"), "Modifier must be between", "+100");
			t.throws(() => parseNotation("2d6+50+50"), "Modifier must be between", "stacked +100");
			t.eq(parseNotation("1d20+99").modifier, 99, "+99 allowed");
			t.ok(new NotationError("x").name === "NotationError", "error name");
		}
	},
	{
		id: "notation-format-pool",
		suite: "Notation",
		name: "formatPool writes the canonical simple expression",
		description: "Count, sides, keep, bang, and signed modifier serialize in that order. Zero modifier is omitted. Negative modifier keeps its sign.",
		why: "Every stepper click rewrites the notation field from this function. A wrong order would no longer parse.",
		run: (t) => {
			t.eq(formatPool({
				count: 1,
				sides: 20,
				keepMode: "none",
				keepN: 1,
				exploding: false,
				modifier: 0,
				repeat: 1
			}), "1d20", "plain");
			t.eq(formatPool({
				count: 2,
				sides: 20,
				keepMode: "highest",
				keepN: 1,
				exploding: false,
				modifier: 0,
				repeat: 1
			}), "2d20kh1", "adv");
			t.eq(formatPool({
				count: 2,
				sides: 20,
				keepMode: "lowest",
				keepN: 1,
				exploding: false,
				modifier: 0,
				repeat: 1
			}), "2d20kl1", "dis");
			t.eq(formatPool({
				count: 2,
				sides: 6,
				keepMode: "highest",
				keepN: 1,
				exploding: true,
				modifier: 2,
				repeat: 1
			}), "2d6kh1!+2", "kitchen sink");
			t.eq(formatPool({
				count: 3,
				sides: 6,
				keepMode: "none",
				keepN: 2,
				exploding: false,
				modifier: -2,
				repeat: 1
			}), "3d6-2", "negative mod");
		}
	},
	{
		id: "notation-pool-from-expression",
		suite: "Notation",
		name: "Simple pools map to steppers; compounds and signed dice do not",
		description: "One positive dice term becomes PoolControls. Two dice, or a negative single die, return null so the UI locks the steppers.",
		why: "If a compound expression mapped to the first die only, bumping Sides would destroy `1d20+1d4`.",
		run: (t) => {
			const simple = poolFromExpression(parseNotation("4d6dl1"));
			t.note("simple", simple);
			t.eq(simple?.count, 4, "count");
			t.eq(simple?.keepMode, "highest", "dl1 → highest");
			t.eq(simple?.keepN, 3, "keep 3");
			t.eq(simple?.repeat, 1, "repeat default");
			t.eq(poolFromExpression(parseNotation("1d20+1d4")), null, "two dice");
			t.eq(poolFromExpression(parseNotation("-1d20")), null, "signed single");
			t.eq(poolFromExpression(parseNotation("1d20+5"))?.modifier, 5, "mod kept");
			t.eq(poolFromExpression(parseNotation("3d6"))?.keepN, 2, "none → keepN count-1");
			t.eq(poolFromExpression(parseNotation("2d20kh2"))?.keepMode, "none", "keep-all is none");
			t.eq(poolFromExpression(parseNotation("1d20kh1"))?.keepMode, "none", "kh1 of 1 is keep-all");
			t.ok(isCompoundExpression(parseNotation("-1d20")), "-1d20 is compound");
			t.ok(!isCompoundExpression(parseNotation("1d20+5")), "1d20+5 is simple");
			t.eq(totalDiffersFromPrimaryFace(parseNotation("1d20")), false, "plain d20 is a face mean");
			t.eq(totalDiffersFromPrimaryFace(parseNotation("2d6")), true, "two dice is a pool total");
			t.eq(totalDiffersFromPrimaryFace(parseNotation("1d20+5")), true, "modifier is a pool total");
			t.eq(totalDiffersFromPrimaryFace(parseNotation("1d6!")), true, "explode is a pool total");
			t.eq(totalDiffersFromPrimaryFace(parseNotation("2d20kh1")), true, "advantage is a pool total");
			t.eq(totalDiffersFromPrimaryFace(parseNotation("1d20kh1")), false, "one-die keep is a no-op");
		}
	},
	{
		id: "notation-keep-label-and-clamp",
		suite: "Notation",
		name: "keepLabel and clamp are the display and bound helpers",
		description: "keepLabel is null for keep-all, otherwise `keep n high/low`. clamp pins a number into [min, max].",
		why: "Luck, chaos, streak, and hydrated garbage all flow through clamp. A NaN leak would tilt every subsequent roll.",
		run: (t) => {
			t.eq(keepLabel({
				count: 2,
				sides: 20,
				keep: {
					mode: "none",
					n: 2
				},
				exploding: false,
				sign: 1
			}), null, "none");
			t.eq(keepLabel({
				count: 2,
				sides: 20,
				keep: {
					mode: "highest",
					n: 1
				},
				exploding: false,
				sign: 1
			}), "keep 1 high", "high");
			t.eq(keepLabel({
				count: 2,
				sides: 20,
				keep: {
					mode: "lowest",
					n: 1
				},
				exploding: false,
				sign: 1
			}), "keep 1 low", "low");
			t.eq(keepLabel({
				count: 2,
				sides: 20,
				keep: {
					mode: "highest",
					n: 2
				},
				exploding: false,
				sign: 1
			}), null, "keep-all");
			t.eq(clamp(3, 0, 1), 1, "above");
			t.eq(clamp(-2, 0, 1), 0, "below");
			t.eq(clamp(.4, 0, 1), .4, "inside");
		}
	},
	{
		id: "notation-explode-plain-and-mod",
		suite: "Notation",
		name: "A bang without keep still explodes, then the modifier",
		description: "`3d6!` is three exploding sixes with keep-all. `3d6!+4` keeps that bang and nets +4. Keep must come before the bang; `2d6!kh1` is rejected.",
		why: "Fireball notation is `8d6!` in some books and `8d6kh1!` in others. Swapping the bang and the keep used to silently drop exploding.",
		run: (t) => {
			const boom = diceTerm(parseNotation("3d6!"));
			t.note("boom", boom);
			t.eq(boom.exploding, true, "exploding");
			t.eq(boom.keep.mode, "none", "keep all");
			t.eq(parseNotation("3d6!+4").modifier, 4, "modifier after bang");
			t.eq(formatPool({
				count: 8,
				sides: 6,
				keepMode: "none",
				keepN: 1,
				exploding: true,
				modifier: 0,
				repeat: 1
			}), "8d6!", "format explode only");
			t.throws(() => parseNotation("2d6!kh1"), "Could not parse", "bang before keep");
			t.throws(() => parseNotation("2d6k"), "Could not parse", "k without digits");
		}
	},
	{
		id: "notation-leading-mod-and-mixed",
		suite: "Notation",
		name: "A leading penalty and a mixed three-term pool both parse",
		description: "`-5+1d20` is one d20 with modifier -5. `1d20+1d4-2` is two dice and -2. `1d20kh1` on a single die is a no-op keep that the store later strips.",
		why: "Initiative penalties and `weapon + bonus die` are how people actually type. The steppers lock on the mixed form so they cannot eat the d4.",
		run: (t) => {
			const penalty = parseNotation("-5+1d20");
			t.note("penalty", penalty);
			t.eq(penalty.modifier, -5, "leading minus");
			t.eq(diceTerm(penalty).sides, 20, "d20");
			t.eq(diceTerm(penalty).sign, 1, "die itself is positive");
			const mixed = parseNotation("1d20+1d4-2");
			t.eq(mixed.terms.filter((x) => x.kind === "dice").length, 2, "two dice");
			t.eq(mixed.modifier, -2, "trailing penalty");
			t.ok(isCompoundExpression(mixed), "mixed is compound");
			t.eq(diceTerm(parseNotation("1d20kh1")).keep, {
				mode: "highest",
				n: 1
			}, "parser allows kh1 on one die");
			t.eq(poolFromExpression(parseNotation("1d20kh1"))?.keepMode, "none", "maps keep-all on one die");
		}
	},
	{
		id: "notation-bounds-and-aliases",
		suite: "Notation",
		name: "Count 100, a d1000, dF, and leftover junk hit the exact edges",
		description: "100d6 and 1d1000 are legal. 101d6 and 1d1001 are not. `dF` lowercases to fudge (3 faces). `2d6foo` leftover and `2d6-` trailing minus fail with the leftover snippet.",
		why: "The bounds are the only thing between a 10,000-die paste and a locked tab. Alias coverage is how percentile and FATE players arrive.",
		run: (t) => {
			t.eq(diceTerm(parseNotation("100d6")).count, 100, "max count");
			t.eq(diceTerm(parseNotation("1d1000")).sides, 1e3, "max sides");
			t.eq(diceTerm(parseNotation("dF")).sides, 3, "FATE alias");
			t.eq(diceTerm(parseNotation("4df")).count, 4, "4dF");
			t.throws(() => parseNotation("2d6foo"), "foo", "leftover snippet");
			t.throws(() => parseNotation("2d6-"), "-", "trailing minus");
			t.eq(parseNotation("2d6+3-1+4").modifier, 6, "three numeric mods");
		}
	},
	{
		id: "notation-describe-cast",
		suite: "Notation",
		name: "describeCast spells keep, exploding, compound, and a one-die keep warning",
		description: "2d20kh1 ×2 headlines with repeat. 1d20kh1 notes that keep needs two dice. 1d20+1d4 is compound. Bang adds exploding. Junk returns the parser error and valid false.",
		why: "This string is the sticky pool readout. If it lies, the steppers can change keep off-screen and the caster never sees it.",
		run: (t) => {
			const adv = describeCast("2d20kh1", 2);
			t.note("adv", adv);
			t.eq(adv.valid, true, "valid");
			t.eq(adv.compound, false, "simple");
			t.eq(adv.headline, "2d20kh1 ×2", "headline");
			t.ok(adv.detail.includes("keep 1 high"), "keep words");
			t.ok(adv.detail.includes("repeat ×2"), "repeat words");
			const lonely = describeCast("1d20kh1", 1);
			t.ok(lonely.detail.includes("needs two dice"), "one-die keep warning");
			t.eq(lonely.headline, "1d20kh1", "keeps typed notation");
			const keepAll = describeCast("2d20kh2", 1);
			t.ok(!keepAll.detail.includes("keep 2 high"), "keep-all is not advantage copy");
			const mixed = describeCast("1d20+1d4", 3);
			t.eq(mixed.compound, true, "compound");
			t.ok(mixed.detail.includes("d20") && mixed.detail.includes("d4"), "both dice");
			const boom = describeCast("2d6!", 1);
			t.ok(boom.detail.includes("exploding"), "exploding word");
			const bad = describeCast("nope", 1);
			t.eq(bad.valid, false, "invalid");
			t.ok(bad.detail.includes("Could not parse"), "error detail");
			const empty = describeCast("", 1);
			t.eq(empty.valid, false, "empty invalid");
			t.eq(empty.headline, "—", "empty headline");
			const low = describeCast("2d20kl1", 1);
			t.ok(low.detail.includes("keep 1 low"), "keep low words");
			const penalty = describeCast("2d6-1d4-3", 1);
			t.ok(penalty.detail.includes("minus d4"), "minus die");
			t.ok(penalty.detail.includes("minus 3"), "minus modifier");
			t.ok(penalty.detail.includes("2d6"), "positive pool");
		}
	}
];
var rngCases = [
	{
		id: "rng-hash-seed-stable",
		suite: "RNG",
		name: "hashSeed is a stable FNV-1a unsigned 32",
		description: "The same string always hashes to the same uint32. Different strings diverge. Empty string is a defined value, not zero by accident of a skipped loop only.",
		why: "Seeded replay is only possible if `oak#0` hashes the same way tomorrow as it does today.",
		run: (t) => {
			const a = hashSeed("oak");
			const b = hashSeed("oak");
			const c = hashSeed("oak#0");
			t.note("oak", a);
			t.note("oak#0", c);
			t.eq(a, b, "deterministic");
			t.ok(a !== c, "seed and stream salt differ");
			t.ok(a >= 0 && a <= 4294967295, "uint32 range");
			t.eq(hashSeed(""), 2166136261, "FNV offset basis for empty");
		}
	},
	{
		id: "rng-mulberry-unit-interval",
		suite: "RNG",
		name: "mulberry32 yields a repeatable unit interval",
		description: "A generator from the same seed repeats. Outputs stay in [0, 1). Two seeds do not share a prefix.",
		why: "Every weighted face pick is `rng() * totalWeight`. A value of 1.0 would skip the last-face fallback; a NaN would freeze exploding loops.",
		run: (t) => {
			const a = mulberry32(1);
			const b = mulberry32(1);
			const seqA = [
				a(),
				a(),
				a(),
				a(),
				a()
			];
			const seqB = [
				b(),
				b(),
				b(),
				b(),
				b()
			];
			t.note("seq", seqA);
			t.eq(seqA, seqB, "same seed, same stream");
			t.ok(seqA.every((n) => n >= 0 && n < 1), "unit interval");
			const other = mulberry32(2);
			t.ok(other() !== seqA[0], "different seed diverges");
		}
	},
	{
		id: "rng-for-seed-vs-crypto",
		suite: "RNG",
		name: "rngFor uses the seed stream only when a seed is present",
		description: "`rngFor('oak', 0)` is mulberry32 of hash('oak#0'). Null or empty seed returns the cryptographic generator instead.",
		why: "Unlocked rolls must not consume or define the replay stream. Mixing the two would make Lock start on the wrong face.",
		run: (t) => {
			const seeded = rngFor("oak", 0);
			const again = rngFor("oak", 0);
			t.eq(seeded(), again(), "same seed and index");
			const next = rngFor("oak", 1);
			t.ok(next() !== rngFor("oak", 0)(), "stream index changes the draw");
			const cryptoA = rngFor(null, 0);
			const cryptoB = rngFor("", 99);
			const x = cryptoA();
			const y = cryptoB();
			t.ok(x >= 0 && x < 1, "null seed unit interval");
			t.ok(y >= 0 && y < 1, "empty seed unit interval");
			t.note("cryptoSamples", [x, y]);
		}
	},
	{
		id: "rng-crypto-direct",
		suite: "RNG",
		name: "cryptoRng reads the Web Crypto buffer as [0, 1)",
		description: "Each call fills a Uint32 and divides by 2^32. A missing slot falls back to 0, so the function never returns undefined.",
		why: "This is the unlocked table. If it threw in a worker without crypto, every unseeded roll would crash the tray.",
		run: (t) => {
			const rng = cryptoRng();
			const samples = Array.from({ length: 8 }, () => rng());
			t.note("samples", samples);
			t.ok(samples.every((n) => n >= 0 && n < 1), "unit interval");
			t.ok(new Set(samples.map((n) => n.toFixed(8))).size >= 2, "not a constant");
		}
	},
	{
		id: "rng-unicode-and-long-seed",
		suite: "RNG",
		name: "Unicode and long seeds still hash to a uint32 stream",
		description: "`oak🎲` and a 2,000-character seed both produce a uint32. The unicode seed diverges from `oak`. The long seed still seeds a unit-interval generator.",
		why: "People paste table names with emoji. A throw on a code point above 255 would crash Lock.",
		run: (t) => {
			const uni = hashSeed("oak🎲");
			t.note("unicode", uni);
			t.ok(uni !== hashSeed("oak"), "emoji changes the hash");
			t.ok(uni >= 0 && uni <= 4294967295, "uint32");
			const long = "x".repeat(2e3);
			const h = hashSeed(long);
			t.ok(h >= 0 && h <= 4294967295, "long seed uint32");
			const n = rngFor(long, 0)();
			t.ok(n >= 0 && n < 1, "long seed unit interval");
			t.eq(rngFor("oak🎲", 3)(), rngFor("oak🎲", 3)(), "unicode stream repeats");
		}
	}
];
var storeCases = [
	{
		id: "store-presets-parse",
		suite: "Session store",
		name: "Every preset is a legal expression",
		description: "d20, advantage, disadvantage, 4d6dl1, Stats ×6, d100, and the rest all parse. DIE_SIDES is the chip row.",
		why: "A preset that does not parse would paint an error the first time someone taps Adv.",
		run: (t) => {
			t.note("presets", PRESETS);
			t.note("sides", [...DIE_SIDES]);
			for (const preset of PRESETS) {
				const parsed = parseNotation(preset.notation);
				t.ok(parsed.terms.some((x) => x.kind === "dice"), `${preset.label} has dice`);
			}
			t.eq([...DIE_SIDES], [
				4,
				6,
				8,
				10,
				12,
				20,
				100
			], "chip sizes");
			t.eq(PRESETS.find((p) => p.label === "Stats")?.repeat, 6, "Stats is ×6");
		}
	},
	{
		id: "store-set-notation-and-repeat",
		suite: "Session store",
		name: "Typing a simple pool updates steppers but keeps Repeat",
		description: "After Stats (repeat 6), typing `3d6` maps count/sides and leaves Repeat at 6. Invalid text is live-typed with no throw.",
		why: "Repeat is an independent control. Destroying it on every keystroke made Stats unusable with any follow-up expression.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().applyPreset("4d6dl1", 6);
				useDiceStore.getState().setNotation("3d6");
				const s = useDiceStore.getState();
				t.note("after", {
					notation: s.notation,
					pool: s.pool
				});
				t.eq(s.pool.count, 3, "count");
				t.eq(s.pool.sides, 6, "sides");
				t.eq(s.pool.repeat, 6, "repeat preserved");
				useDiceStore.getState().setNotation("nope");
				t.eq(useDiceStore.getState().notation, "nope", "invalid kept");
				t.eq(useDiceStore.getState().pool.count, 3, "pool unchanged on junk");
				useDiceStore.getState().setNotation("2d6", true);
				t.eq(useDiceStore.getState().pool.count, 3, "fromPool skips remap");
			});
		}
	},
	{
		id: "store-compound-repeat-only",
		suite: "Session store",
		name: "Repeat-only patches do not rewrite a compound expression",
		description: "`1d20+1d4+3` plus patchPool({repeat:2}) keeps the string. A sides-only patch is ignored so leftover steppers cannot eat the mixed pool. A die-chip rebuild (count, sides, keepMode) writes `1d8`.",
		why: "The Repeat stepper used to call formatPool and collapse mixed pools to the first die. A leftover Sides click did the same while the field still showed 1d20+1d4.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().setNotation("1d20+1d4+3");
				useDiceStore.getState().patchPool({ repeat: 2 });
				t.eq(useDiceStore.getState().notation, "1d20+1d4+3", "repeat preserved compound");
				t.eq(useDiceStore.getState().pool.repeat, 2, "repeat 2");
				useDiceStore.getState().patchPool({ sides: 8 });
				t.eq(useDiceStore.getState().notation, "1d20+1d4+3", "sides-only does not eat compound");
				useDiceStore.getState().patchPool({
					count: 1,
					sides: 8,
					modifier: 0,
					keepMode: "none",
					exploding: false
				});
				t.eq(useDiceStore.getState().notation, "1d8", "rebuild chip replaces");
			});
		}
	},
	{
		id: "store-keep-disabled-on-one-die",
		suite: "Session store",
		name: "A one-die pool cannot keep high or low",
		description: "patchPool({count:1, keepMode:'highest'}) forces keepMode none. Count 2 allows highest and clamps keepN to count-1.",
		why: "`1d20kh1` is a no-op that looked like advantage. The High button is disabled for a reason.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().patchPool({
					count: 2,
					keepMode: "highest",
					keepN: 9
				});
				t.eq(useDiceStore.getState().pool.keepN, 1, "clamped to count-1");
				t.eq(useDiceStore.getState().notation, "2d20kh1", "notation");
				useDiceStore.getState().patchPool({ count: 1 });
				t.eq(useDiceStore.getState().pool.keepMode, "none", "cleared");
				t.eq(useDiceStore.getState().notation, "1d20", "kh stripped");
			});
		}
	},
	{
		id: "store-sanitize-garbage",
		suite: "Session store",
		name: "Sanitization clamps hydrated garbage into legal pool and factors",
		description: "Out-of-range count, sides, luck, chaos, keepMode, and a locked blank seed are repaired on patch and on hydrate.",
		why: "Old localStorage from before a bugfix would otherwise resurrect Keep High on a single die, or Lock with no seed.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().patchPool({
					count: 500,
					sides: 1,
					modifier: 500,
					keepMode: "banana",
					keepN: 0,
					repeat: 0
				});
				const pool = useDiceStore.getState().pool;
				t.note("pool", pool);
				t.eq(pool.count, 100, "count max 100");
				t.eq(pool.sides, 2, "sides min 2");
				t.eq(pool.modifier, 99, "mod max");
				t.eq(pool.keepMode, "none", "invalid mode");
				t.eq(pool.repeat, 1, "repeat min 1");
				useDiceStore.getState().patchRandomness({
					luck: 4,
					chaos: -2,
					streak: -4,
					seed: "  ",
					seedLocked: true,
					streamIndex: -9
				});
				const r = useDiceStore.getState().randomness;
				t.note("randomness", r);
				t.eq(r.luck, 1, "luck clamp");
				t.eq(r.chaos, 0, "chaos floor");
				t.eq(r.streak, -1, "streak clamp");
				t.eq(r.seedLocked, false, "blank seed cannot lock");
				t.eq(r.streamIndex, 0, "stream floor");
			});
		}
	},
	{
		id: "store-fair-keeps-seed",
		suite: "Session store",
		name: "Fair resets luck, chaos, and streak but keeps the seed stream",
		description: "resetRandomness writes luck 0, chaos 0.5, streak 0. Seed, lock, and streamIndex stay put so a replay does not jump.",
		why: "Fair is 'put the table back', not 'forget the seed I was proving'.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().patchRandomness({
					luck: 1,
					chaos: 1,
					streak: -.5,
					seed: "oak",
					seedLocked: true,
					streamIndex: 3
				});
				useDiceStore.getState().resetRandomness();
				const r = useDiceStore.getState().randomness;
				t.note("after", r);
				t.eq(r.luck, 0, "luck");
				t.eq(r.chaos, .5, "chaos");
				t.eq(r.streak, 0, "streak");
				t.eq(r.seed, "oak", "seed");
				t.eq(r.seedLocked, true, "lock");
				t.eq(r.streamIndex, 3, "stream");
			});
		}
	},
	{
		id: "store-roll-reentrancy-and-error",
		suite: "Session store",
		name: "A roll in flight blocks the next; bad notation sets error instead",
		description: "roll() while rolling returns null. Invalid notation sets error and does not start the animation. timesOverride of 3 writes three history rows even if Repeat is 1.",
		why: "Holding Enter used to dump a row per key-repeat. Stats ×6 vs table reroll is the timesOverride contract.",
		run: (t) => {
			withStore(() => {
				const first = useDiceStore.getState().roll(1);
				const stacked = useDiceStore.getState().roll(1);
				t.ok(first && first.length === 1, "first roll");
				t.eq(stacked, null, "reentrant blocked");
				t.eq(useDiceStore.getState().history.length, 1, "one row");
				t.eq(useDiceStore.getState().rolling, true, "animation on");
				useDiceStore.getState().clearHistory();
				useDiceStore.getState().setNotation("nope");
				const bad = useDiceStore.getState().roll();
				t.eq(bad, null, "invalid returns null");
				t.ok((useDiceStore.getState().error ?? "").includes("Could not parse"), "error message");
				t.eq(useDiceStore.getState().rolling, false, "did not animate");
				useDiceStore.getState().setNotation("1d4");
				const batch = useDiceStore.getState().roll(3);
				t.eq(batch?.length, 3, "override ×3");
				t.eq(useDiceStore.getState().history.length, 3, "three rows");
				t.eq(useDiceStore.getState().last?.id, batch?.[2]?.id, "last is newest of batch");
			});
		}
	},
	{
		id: "store-reroll-one",
		suite: "Session store",
		name: "Reroll always casts once, even when Repeat is 6",
		description: "After Stats, reroll(last) adds a single 4d6dl1 row. reroll() with no last returns null. reroll while rolling returns null.",
		why: "Table reroll used the live Repeat, so Stats ×6 leaked into every replay click.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().applyPreset("4d6dl1", 6);
				const rows = useDiceStore.getState().roll();
				t.eq(rows?.length, 6, "stats six");
				useDiceStore.getState().clearHistory();
				useDiceStore.setState({
					last: null,
					rolling: false
				});
				t.eq(useDiceStore.getState().reroll(), null, "no last");
				useDiceStore.getState().applyPreset("4d6dl1", 6);
				const six = useDiceStore.getState().roll();
				t.ok(six, "rolled");
				const blocked = useDiceStore.getState().reroll(six[0]);
				t.eq(blocked, null, "blocked while rolling");
				useDiceStore.setState({ rolling: false });
				const extra = useDiceStore.getState().reroll(six[0]);
				t.eq(extra?.length, 1, "one extra");
				t.eq(useDiceStore.getState().history.length, 7, "7 rows");
				t.eq(useDiceStore.getState().notation, "4d6dl1", "notation restored");
				t.eq(useDiceStore.getState().pool.repeat, 6, "repeat still 6");
			});
		}
	},
	{
		id: "store-reroll-does-not-steal-pool",
		suite: "Session store",
		name: "Reroll casts the old expression without rewriting the live pool",
		description: "After a 1d20, typing 3d6 and rerolling last adds a 1d20 row. Notation stays 3d6, count stays 3, Repeat is untouched.",
		why: "Table and tray reroll used to call setNotation, so a row click silently replaced Adv with an old d20 while the user was looking at the table.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().setNotation("1d20");
				const first = useDiceStore.getState().roll(1);
				t.ok(first, "rolled d20");
				useDiceStore.setState({ rolling: false });
				useDiceStore.getState().setNotation("3d6");
				t.eq(useDiceStore.getState().pool.count, 3, "pool is 3d6");
				const again = useDiceStore.getState().reroll(first[0]);
				t.eq(again?.length, 1, "one extra");
				t.eq(again?.[0]?.notation, "1d20", "row is the old expression");
				t.eq(useDiceStore.getState().notation, "3d6", "live notation kept");
				t.eq(useDiceStore.getState().pool.count, 3, "count kept");
				t.eq(useDiceStore.getState().pool.sides, 6, "sides kept");
			});
		}
	},
	{
		id: "store-coupling-notices",
		suite: "Session store",
		name: "Auto-changes to Keep and Lock write a visible notice",
		description: "Dropping Adv from 2 dice to 1 turns Keep High off and sets poolNotice. Clamping keepN on 4d6kh3 when count becomes 2 mentions the new keep. Clearing a locked seed unlocks and sets rngNotice. Toggling Lock off on purpose does not.",
		why: "These are the couplings that used to mutate a control the user was not looking at. The notice is the only guaranteed on-screen record.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().applyPreset("2d20kh1");
				useDiceStore.getState().patchPool({ count: 1 });
				t.eq(useDiceStore.getState().pool.keepMode, "none", "keep cleared");
				t.ok((useDiceStore.getState().poolNotice ?? "").includes("Keep High turned off"), "keep notice");
				useDiceStore.getState().patchPool({
					count: 4,
					keepMode: "highest",
					keepN: 3
				});
				t.eq(useDiceStore.getState().notation, "4d20kh3", "kh3");
				useDiceStore.getState().patchPool({ count: 2 });
				t.eq(useDiceStore.getState().pool.keepN, 1, "clamped");
				t.ok((useDiceStore.getState().poolNotice ?? "").includes("Keep reduced to 1"), "keepN notice");
				useDiceStore.getState().patchRandomness({
					seed: "oak",
					seedLocked: true
				});
				t.eq(useDiceStore.getState().rngNotice, null, "lock on is silent");
				useDiceStore.getState().patchRandomness({ seed: "" });
				t.eq(useDiceStore.getState().randomness.seedLocked, false, "unlocked");
				t.ok((useDiceStore.getState().rngNotice ?? "").includes("Lock turned off"), "lock notice");
				useDiceStore.getState().patchRandomness({
					seed: "oak",
					seedLocked: true
				});
				useDiceStore.getState().patchRandomness({ seedLocked: false });
				t.eq(useDiceStore.getState().rngNotice, null, "explicit unlock is silent");
			});
		}
	},
	{
		id: "store-compound-chip-rebuilds-simple",
		suite: "Session store",
		name: "Leaving a compound pool via a die chip starts a fresh 1dN",
		description: "Adv, then 1d20+1d4, then a chip-style patch of d6 writes 1d6 with keep none. Repeat 6 from Stats survives.",
		why: "The chip used to replay the locked Adv pool (2d6kh1) so Keep High came back without the user looking at Keep.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().applyPreset("4d6dl1", 6);
				useDiceStore.getState().setNotation("1d20+1d4");
				t.eq(useDiceStore.getState().pool.repeat, 6, "repeat still 6");
				t.eq(useDiceStore.getState().pool.keepMode, "highest", "stale keep until chip");
				useDiceStore.getState().patchPool({
					count: 1,
					sides: 6,
					modifier: 0,
					keepMode: "none",
					exploding: false
				});
				t.eq(useDiceStore.getState().notation, "1d6", "fresh d6");
				t.eq(useDiceStore.getState().pool.keepMode, "none", "keep reset");
				t.eq(useDiceStore.getState().pool.repeat, 6, "repeat kept");
				t.eq(useDiceStore.getState().poolNotice, null, "intentional patch is silent");
			});
		}
	},
	{
		id: "store-hydrate-and-persist",
		suite: "Session store",
		name: "hydrate restores a session and refuses to run twice",
		description: "A saved payload with Keep High on 1 die and Lock on a blank seed is repaired. Corrupt JSON is ignored. A second hydrate is a no-op.",
		why: "This is the only load path. A crash here blanks the table on every visit.",
		run: (t) => {
			withStore(() => {
				localStorage.setItem("alea-v1", JSON.stringify({
					notation: "2d6",
					pool: {
						count: 1,
						sides: 6,
						keepMode: "highest",
						keepN: 1,
						exploding: false,
						modifier: 0,
						repeat: 2
					},
					randomness: {
						luck: .2,
						chaos: .5,
						streak: 0,
						seed: "",
						seedLocked: true,
						streamIndex: 4
					},
					history: [fakeRoll({
						id: "h1",
						notation: "2d6",
						total: 7
					})]
				}));
				useDiceStore.setState({ hydrated: false });
				useDiceStore.getState().hydrate();
				const s = useDiceStore.getState();
				t.note("hydrated", {
					notation: s.notation,
					pool: s.pool,
					randomness: s.randomness,
					last: s.last?.id
				});
				t.eq(s.notation, "2d6", "notation");
				t.eq(s.pool.keepMode, "none", "keep cleared on 1 die");
				t.eq(s.randomness.seedLocked, false, "blank lock cleared");
				t.eq(s.last?.id, "h1", "last from history[0]");
				t.eq(s.hydrated, true, "flag");
				useDiceStore.getState().setNotation("1d20");
				useDiceStore.getState().hydrate();
				t.eq(useDiceStore.getState().notation, "1d20", "second hydrate no-op");
				localStorage.setItem("alea-v1", "{not json");
				useDiceStore.setState({
					hydrated: false,
					notation: "3d6"
				});
				useDiceStore.getState().hydrate();
				t.eq(useDiceStore.getState().notation, "3d6", "corrupt ignored");
				t.eq(useDiceStore.getState().hydrated, true, "still hydrates");
			});
		}
	},
	{
		id: "store-history-cap-and-clear",
		suite: "Session store",
		name: "History caps at 200 and clearHistory unlocks a mid-flight roll",
		description: "199 existing rows plus one roll stay at 200. clearHistory empties last, history, and rolling, even if the 720ms timer is outstanding.",
		why: "Clear during the tumble used to leave Roll disabled forever.",
		run: (t) => {
			withStore(() => {
				const filler = Array.from({ length: 199 }, (_, i) => fakeRoll({
					id: `f${i}`,
					at: i
				}));
				useDiceStore.setState({
					history: filler,
					rolling: false,
					notation: "1d4"
				});
				useDiceStore.getState().roll(1);
				t.eq(useDiceStore.getState().history.length, 200, "capped");
				t.eq(useDiceStore.getState().rolling, true, "rolling");
				useDiceStore.getState().clearHistory();
				t.eq(useDiceStore.getState().history.length, 0, "cleared");
				t.eq(useDiceStore.getState().last, null, "no last");
				t.eq(useDiceStore.getState().rolling, false, "unlocked");
			});
		}
	},
	{
		id: "store-apply-preset-and-persist-quota",
		suite: "Session store",
		name: "Invalid presets error; persist failures are swallowed",
		description: "applyPreset('%%%') sets error. A throwing localStorage.setItem does not explode out of patchPool.",
		why: "Safari quota errors are real. The table has to keep rolling even when the disk is full.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().applyPreset("%%%");
				t.ok(useDiceStore.getState().error, "preset error");
				const original = localStorage.setItem.bind(localStorage);
				localStorage.setItem = () => {
					throw new Error("quota");
				};
				try {
					useDiceStore.getState().patchPool({ modifier: 1 });
					t.eq(useDiceStore.getState().pool.modifier, 1, "state still updates");
				} finally {
					localStorage.setItem = original;
				}
			});
		}
	},
	{
		id: "store-seed-stream-unlocked-rolls",
		suite: "Session store",
		name: "Unlocked rolls do not burn the seed stream",
		description: "Type seed oak, roll unlocked, lock, streamIndex is still 0. One locked roll then moves it to 1.",
		why: "Replay starts at the beginning of the seed, not wherever the cryptographic table happened to sit.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().patchRandomness({
					seed: "oak",
					streamIndex: 0
				});
				useDiceStore.getState().roll(1);
				useDiceStore.setState({ rolling: false });
				t.eq(useDiceStore.getState().randomness.streamIndex, 0, "unlocked did not advance");
				t.eq(useDiceStore.getState().last?.seedUsed, null, "unseeded record");
				useDiceStore.getState().patchRandomness({ seedLocked: true });
				useDiceStore.getState().roll(1);
				t.eq(useDiceStore.getState().randomness.streamIndex, 1, "locked advanced");
				t.eq(useDiceStore.getState().last?.seedUsed, "oak", "seeded record");
			});
		}
	},
	{
		id: "store-hydrate-missing-fields",
		suite: "Session store",
		name: "A sparse or hostile payload still hydrates a legal table",
		description: "Empty object restores 1d20. Empty notation string falls back. Non-array history becomes []. getItem throwing still marks hydrated so the table is usable.",
		why: "This is first paint after a storage failure. Looping on a throw would blank the caster forever.",
		run: (t) => {
			withStore(() => {
				localStorage.setItem("alea-v1", JSON.stringify({}));
				useDiceStore.setState({ hydrated: false });
				useDiceStore.getState().hydrate();
				t.eq(useDiceStore.getState().notation, "1d20", "empty object → default");
				t.eq(useDiceStore.getState().history.length, 0, "no history");
				localStorage.setItem("alea-v1", JSON.stringify({
					notation: "",
					history: "nope"
				}));
				useDiceStore.setState({
					hydrated: false,
					notation: "3d6"
				});
				useDiceStore.getState().hydrate();
				t.eq(useDiceStore.getState().notation, "1d20", "empty string notation");
				t.eq(Array.isArray(useDiceStore.getState().history), true, "bad history array");
				t.eq(useDiceStore.getState().history.length, 0, "ignored non-array");
				const original = localStorage.getItem.bind(localStorage);
				localStorage.getItem = () => {
					throw new Error("denied");
				};
				try {
					useDiceStore.setState({
						hydrated: false,
						notation: "2d8"
					});
					useDiceStore.getState().hydrate();
					t.eq(useDiceStore.getState().hydrated, true, "still hydrates");
					t.eq(useDiceStore.getState().notation, "2d8", "state kept on throw");
				} finally {
					localStorage.getItem = original;
				}
			});
		}
	},
	{
		id: "store-apply-preset-keep-and-compound",
		suite: "Session store",
		name: "Presets write keep modes; a compound preset keeps the string",
		description: "Adv is 2d20kh1 with keep highest. Dis is lowest. applyPreset('1d20+1d4', 2) keeps the mixed notation and sets Repeat 2 without flattening to 1d20.",
		why: "The Adv chip is how most people start. Flattening a mixed preset would be the same Repeat bug in a different coat.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().applyPreset("2d20kh1");
				t.eq(useDiceStore.getState().pool.keepMode, "highest", "adv keep");
				t.eq(useDiceStore.getState().pool.keepN, 1, "keep 1");
				useDiceStore.getState().applyPreset("2d20kl1");
				t.eq(useDiceStore.getState().pool.keepMode, "lowest", "dis keep");
				useDiceStore.getState().applyPreset("1d20+1d4", 2);
				t.eq(useDiceStore.getState().notation, "1d20+1d4", "compound kept");
				t.eq(useDiceStore.getState().pool.repeat, 2, "repeat 2");
				t.note("afterCompound", useDiceStore.getState().pool);
			});
		}
	},
	{
		id: "store-roll-times-persist-explode-reroll",
		suite: "Session store",
		name: "Times clamp, persist, explode, and reroll-last all agree",
		description: "roll(0) casts once. roll(99) caps at 50. patchPool exploding rewrites `1d20!`. persist writes alea-v1. reroll() with no argument uses last.",
		why: "Stats ×6, a fat-fingered override, and the tray's Reroll last all share this path. They cannot mean different things.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().setNotation("1d4");
				const once = useDiceStore.getState().roll(0);
				t.eq(once?.length, 1, "0 clamps to 1");
				useDiceStore.setState({
					rolling: false,
					history: [],
					last: null
				});
				const many = useDiceStore.getState().roll(99);
				t.eq(many?.length, 50, "99 clamps to 50");
				t.eq(useDiceStore.getState().history.length, 50, "50 rows");
				useDiceStore.setState({ rolling: false });
				const raw = localStorage.getItem("alea-v1");
				t.ok(raw && raw.includes("1d4"), "persisted notation");
				t.note("persistKeys", raw ? Object.keys(JSON.parse(raw)) : []);
				useDiceStore.setState({
					rolling: false,
					history: [],
					last: null,
					notation: "1d20",
					pool: {
						...useDiceStore.getState().pool,
						exploding: false,
						sides: 20,
						count: 1
					}
				});
				useDiceStore.getState().patchPool({ exploding: true });
				t.eq(useDiceStore.getState().notation, "1d20!", "explode notation");
				const first = useDiceStore.getState().roll(1);
				useDiceStore.setState({ rolling: false });
				const again = useDiceStore.getState().reroll();
				t.eq(again?.length, 1, "reroll last once");
				t.eq(useDiceStore.getState().history.length, 2, "two rows");
				t.eq(first?.[0]?.notation, "1d20!", "last was exploding");
			});
		}
	},
	{
		id: "store-nan-factors-and-keep-low-patch",
		suite: "Session store",
		name: "NaN factors become fair; Keep Low patches the notation",
		description: "NaN luck becomes 0. Non-finite chaos becomes 0.5. patchPool keepMode lowest on 2d20 writes `2d20kl1`.",
		why: "A corrupted slider event can ship NaN. Fair is the only safe repair. Keep Low is the Dis chip's body.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().patchRandomness({
					luck: NaN,
					chaos: Number.POSITIVE_INFINITY,
					streak: NaN
				});
				const r = useDiceStore.getState().randomness;
				t.note("repaired", r);
				t.eq(r.luck, 0, "luck NaN → 0");
				t.eq(r.chaos, .5, "chaos inf → 0.5");
				t.eq(r.streak, 0, "streak NaN → 0");
				useDiceStore.getState().patchPool({
					count: 2,
					keepMode: "lowest",
					keepN: 1
				});
				t.eq(useDiceStore.getState().notation, "2d20kl1", "kl notation");
				t.eq(useDiceStore.getState().pool.keepMode, "lowest", "mode");
			});
		}
	},
	{
		id: "store-randomness-applies-and-repeat-freezes-streak",
		suite: "Session store",
		name: "Luck loads the next roll; Repeat does not feed streak inside one click",
		description: "Locked oak, luck +1: the recorded expected sits well above a fair oak replay at the same index. Fair then rolls oak#1 matching a fair generator, not a lucky one. Repeat ×2 with streak +1 and empty history records streak 0 on both rows; the second face equals a standalone oak#1 with no history.",
		why: "If Repeat let the first Stats score tilt the second, ability scores would self-feed. If Fair left luck on the next seeded face, Reset to fair would be a costume.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().setNotation("1d20");
				useDiceStore.getState().patchRandomness({
					seed: "oak",
					seedLocked: true,
					luck: 1,
					streamIndex: 0
				});
				const lucky = useDiceStore.getState().roll(1);
				t.ok(lucky, "rolled lucky");
				t.eq(lucky[0].luck, 1, "luck on the row");
				t.ok(lucky[0].expected > 13, "lucky expected");
				useDiceStore.setState({ rolling: false });
				useDiceStore.getState().resetRandomness();
				t.eq(useDiceStore.getState().randomness.luck, 0, "fair luck");
				t.eq(useDiceStore.getState().randomness.seed, "oak", "seed kept");
				t.eq(useDiceStore.getState().randomness.streamIndex, 1, "stream kept");
				const afterFair = useDiceStore.getState().roll(1);
				const fairAt1 = makeRoll("1d20", {
					luck: 0,
					chaos: .5,
					streak: 0,
					seed: "oak",
					seedLocked: true,
					streamIndex: 1
				}, []);
				t.eq(afterFair[0].dice[0].face, fairAt1.record.dice[0].face, "Fair applies to the next seeded face");
				t.eq(afterFair[0].luck, 0, "row luck 0");
				useDiceStore.setState({
					rolling: false,
					history: [],
					last: null
				});
				useDiceStore.getState().patchRandomness({
					luck: 0,
					chaos: .5,
					streak: 1,
					seed: "oak",
					seedLocked: true,
					streamIndex: 0
				});
				const batch = useDiceStore.getState().roll(2);
				t.eq(batch?.length, 2, "×2");
				t.eq(batch[0].streak, 0, "first of batch not streaked");
				t.eq(batch[1].streak, 0, "second of batch not streaked");
				const solo1 = makeRoll("1d20", {
					luck: 0,
					chaos: .5,
					streak: 1,
					seed: "oak",
					seedLocked: true,
					streamIndex: 1
				}, []);
				t.eq(batch[1].dice[0].face, solo1.record.dice[0].face, "second matches empty-history stream 1");
			});
		}
	},
	{
		id: "store-repeat-shares-one-streak-curve",
		suite: "Session store",
		name: "A Repeat batch with streak on shares one curve, not a self-feeding one",
		description: "Hot history plus streak +1, Repeat ×2 on locked oak: both rows record streak 1 and the same expected. The second face matches a standalone oak#1 against the original history, not against a history that already includes the first of the batch.",
		why: "If Repeat let the first Stats score tilt the second, ability scores would self-feed. If it recorded streak 0 after real history, Momentum would look off while the curve was loaded.",
		run: (t) => {
			withStore(() => {
				const hot = [fakeRoll({
					total: 20,
					expected: 10.5
				}), fakeRoll({
					total: 18,
					expected: 10.5
				})];
				useDiceStore.setState({
					history: hot,
					last: hot[0],
					rolling: false,
					notation: "1d20"
				});
				useDiceStore.getState().patchRandomness({
					luck: 0,
					chaos: .5,
					streak: 1,
					seed: "oak",
					seedLocked: true,
					streamIndex: 0
				});
				const batch = useDiceStore.getState().roll(2);
				t.eq(batch?.length, 2, "×2");
				t.eq(batch[0].streak, 1, "first of batch is streaked");
				t.eq(batch[1].streak, 1, "second of batch is streaked");
				t.eq(batch[0].expected, batch[1].expected, "shared expected — same bias");
				const frozen1 = makeRoll("1d20", {
					luck: 0,
					chaos: .5,
					streak: 1,
					seed: "oak",
					seedLocked: true,
					streamIndex: 1
				}, hot);
				t.eq(batch[1].dice[0].face, frozen1.record.dice[0].face, "second matches frozen history");
				t.eq(frozen1.record.streak, 1, "generator agrees streak applied");
			});
		}
	},
	{
		id: "store-hydrate-snaps-dusty-factors",
		suite: "Session store",
		name: "Hydrated sub-tick luck and chaos snap to the 1% grid",
		description: "Saved luck 0.004 and chaos 0.504 become luck 0 and chaos 0.5 on hydrate. Luck 0.006 rounds to 0.01, the first loaded tick.",
		why: "Old sessions stored raw floats. Without a snap, the slider would read 0 while the next roll still tilted.",
		run: (t) => {
			withStore(() => {
				localStorage.setItem("alea-v1", JSON.stringify({
					notation: "1d20",
					pool: {
						count: 1,
						sides: 20,
						keepMode: "none",
						keepN: 1,
						exploding: false,
						modifier: 0,
						repeat: 1
					},
					randomness: {
						luck: .004,
						chaos: .504,
						streak: .004,
						seed: "",
						seedLocked: false,
						streamIndex: 0
					},
					history: []
				}));
				useDiceStore.setState({ hydrated: false });
				useDiceStore.getState().hydrate();
				const r = useDiceStore.getState().randomness;
				t.note("snapped", r);
				t.eq(r.luck, 0, "luck 0.004 → 0");
				t.eq(r.chaos, .5, "chaos 50.4 → 50");
				t.eq(r.streak, 0, "streak 0.004 → 0");
				useDiceStore.getState().patchRandomness({
					luck: .006,
					chaos: .506,
					streak: -.006
				});
				const q = useDiceStore.getState().randomness;
				t.eq(q.luck, .01, "0.6% luck rounds to 1%");
				t.eq(q.chaos, .51, "50.6 chaos rounds to 51");
				t.eq(q.streak, -.01, "−0.6% streak rounds to −1%");
			});
		}
	},
	{
		id: "store-notation-keep-all-and-count-agree",
		suite: "Session store",
		name: "Keep-all notation and a 50-die pool agree with the steppers",
		description: "`2d20kh2` is keep-all, so Keep maps to none. `50d6` maps count 50, inside the 100 cap. A saved row missing expected is dropped on hydrate so the tray cannot crash on toFixed.",
		why: "Typing kh2 used to light Keep High 1 (advantage) while the roll kept both dice. A 50-die fireball used to show 40 on the stepper and throw 50.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().setNotation("2d20kh2");
				t.eq(useDiceStore.getState().pool.keepMode, "none", "kh2 of 2 is keep-all");
				t.eq(useDiceStore.getState().pool.count, 2, "count 2");
				t.eq(useDiceStore.getState().notation, "2d20kh2", "typed notation kept");
				useDiceStore.getState().setNotation("50d6");
				t.eq(useDiceStore.getState().pool.count, 50, "count 50");
				t.eq(useDiceStore.getState().notation, "50d6", "notation 50d6");
				localStorage.setItem("alea-v1", JSON.stringify({
					notation: "1d20",
					pool: {
						count: 1,
						sides: 20,
						keepMode: "none",
						keepN: 1,
						exploding: false,
						modifier: 0,
						repeat: 1
					},
					randomness: {
						luck: 0,
						chaos: .5,
						streak: 0,
						seed: "",
						seedLocked: false,
						streamIndex: 0
					},
					history: [{
						id: "bad",
						notation: "1d20",
						total: 10,
						at: 1,
						dice: [{
							face: 10,
							sides: 20
						}]
					}, fakeRoll({
						id: "good",
						notation: "1d6",
						total: 4,
						expected: 3.5
					})]
				}));
				useDiceStore.setState({ hydrated: false });
				useDiceStore.getState().hydrate();
				t.eq(useDiceStore.getState().history.map((r) => r.id), ["good"], "broken row dropped");
				t.eq(useDiceStore.getState().last?.id, "good", "last is the surviving row");
			});
		}
	},
	{
		id: "store-invalid-steppers-do-not-clobber",
		suite: "Session store",
		name: "Invalid notation is not overwritten by leftover steppers",
		description: "After an exploding 3d6, typing `1d20+100` keeps the string. patchPool({modifier:1}) and Keep High are ignored. Repeat still applies. A die-chip rebuild writes 1d8 with exploding off.",
		why: "A modifier click used to replace the typed expression with 3d6!+1 while the field still looked like 1d20+100. The leftover Keep High and bang would come along for the ride.",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().setNotation("3d6!");
				t.eq(useDiceStore.getState().pool.exploding, true, "exploding on");
				useDiceStore.getState().setNotation("1d20+100");
				t.eq(useDiceStore.getState().notation, "1d20+100", "invalid kept");
				t.eq(useDiceStore.getState().pool.exploding, true, "leftover exploding until rebuild");
				t.eq(useDiceStore.getState().pool.sides, 6, "leftover sides");
				useDiceStore.getState().patchPool({ modifier: 1 });
				t.eq(useDiceStore.getState().notation, "1d20+100", "modifier stepper ignored");
				useDiceStore.getState().patchPool({
					keepMode: "highest",
					count: 3
				});
				t.eq(useDiceStore.getState().notation, "1d20+100", "keep patch ignored");
				useDiceStore.getState().patchPool({ repeat: 4 });
				t.eq(useDiceStore.getState().notation, "1d20+100", "repeat does not rewrite");
				t.eq(useDiceStore.getState().pool.repeat, 4, "repeat still applies");
				useDiceStore.getState().patchPool({
					count: 1,
					sides: 8,
					modifier: 0,
					keepMode: "none",
					exploding: false
				});
				t.eq(useDiceStore.getState().notation, "1d8", "chip rebuild");
				t.eq(useDiceStore.getState().pool.exploding, false, "bang cleared");
				t.eq(useDiceStore.getState().pool.repeat, 4, "repeat kept");
			});
		}
	}
];
function html(node) {
	return (0, import_server_node.renderToString)(node);
}
var uiCases = [
	{
		id: "ui-die-shapes-and-pips",
		suite: "Interface",
		name: "DieFace picks a clip path per polyhedron and pips on a six",
		description: "d4/d8/d10/d12/d20 use clip classes. A d6 with face 5 renders pip cells, not the numeral. A dropped die is faded. A max face gets the max ring. Rolling adds die-tumble.",
		why: "The tray is the product. A d20 that looks like a cube, or a six that prints '5' instead of pips, is immediately wrong.",
		run: (t) => {
			const d4 = html((0, import_react.createElement)(DieFace, {
				die: fakeDie({
					face: 3,
					sides: 4
				}),
				size: "lg"
			}));
			const d6 = html((0, import_react.createElement)(DieFace, {
				die: fakeDie({
					face: 5,
					sides: 6
				}),
				size: "md"
			}));
			const d20 = html((0, import_react.createElement)(DieFace, {
				die: fakeDie({
					face: 20,
					sides: 20
				}),
				size: "sm",
				rolling: true,
				delay: 40
			}));
			const dropped = html((0, import_react.createElement)(DieFace, { die: fakeDie({
				face: 1,
				sides: 20,
				kept: false
			}) }));
			const exploded = html((0, import_react.createElement)(DieFace, { die: fakeDie({
				face: 8,
				sides: 8,
				exploded: true
			}) }));
			t.ok(d4.includes("clip-d4"), "d4 clip");
			t.ok(html((0, import_react.createElement)(DieFace, { die: fakeDie({
				face: 4,
				sides: 8
			}) })).includes("clip-d8"), "d8");
			t.ok(html((0, import_react.createElement)(DieFace, { die: fakeDie({
				face: 5,
				sides: 10
			}) })).includes("clip-d10"), "d10");
			t.ok(html((0, import_react.createElement)(DieFace, { die: fakeDie({
				face: 6,
				sides: 12
			}) })).includes("clip-d12"), "d12");
			t.ok(d20.includes("clip-d20"), "d20 clip");
			t.ok(d6.includes("grid-cols-3"), "d6 pips grid");
			t.ok(!d6.includes(">5<"), "d6 is not a numeral");
			t.ok(d20.includes("die-tumble"), "rolling");
			t.ok(d20.includes("ring-max"), "nat max ring");
			t.ok(dropped.includes("opacity-35"), "dropped fade");
			t.ok(dropped.includes("ring-crit") === false, "dropped 1 does not crit-ring");
			t.ok(exploded.includes("explode"), "explode title");
			t.ok(d4.includes("aria-label"), "die has an accessible name");
			t.note("d4Snippet", d4.slice(0, 240));
		}
	},
	{
		id: "ui-die-negative-outside-clip",
		suite: "Interface",
		name: "A subtracted die shows a minus outside the clipped shape",
		description: "sign -1 renders an absolute − badge and a −d4 caption even at sm size. The title string includes −d4.",
		why: "Putting the minus inside clip-path on a d4 made penalty dice look unsigned in the results table.",
		run: (t) => {
			const markup = html((0, import_react.createElement)(DieFace, {
				die: fakeDie({
					face: 2,
					sides: 4,
					sign: -1
				}),
				size: "sm"
			}));
			t.note("markup", markup);
			t.ok(markup.includes("−"), "minus glyph");
			t.ok(markup.includes("d4"), "d4 label");
			t.ok(markup.includes("minus"), "accessible name says minus");
		}
	},
	{
		id: "ui-stepper-bounds-and-sign",
		suite: "Interface",
		name: "Stepper disables the exhausted bound and prints a leading plus",
		description: "At min the decrease button is disabled; at max the increase is. signed +3 renders `+3`. Disabled=true disables both.",
		why: "A stepper that still fires at the bound would fight sanitizePool and look clickable when it is not.",
		run: (t) => {
			const min = html((0, import_react.createElement)(Stepper, {
				label: "Dice",
				value: 1,
				min: 1,
				max: 40,
				onStep: () => void 0
			}));
			const max = html((0, import_react.createElement)(Stepper, {
				label: "Dice",
				value: 40,
				min: 1,
				max: 40,
				onStep: () => void 0
			}));
			const signed = html((0, import_react.createElement)(Stepper, {
				label: "Modifier",
				value: 3,
				min: -9,
				max: 9,
				signed: true,
				onStep: () => void 0
			}));
			const off = html((0, import_react.createElement)(Stepper, {
				label: "Sides",
				value: 6,
				min: 2,
				max: 20,
				disabled: true,
				onStep: () => void 0
			}));
			const dashed = html((0, import_react.createElement)(Stepper, {
				label: "Dice",
				value: 3,
				min: 1,
				max: 100,
				disabled: true,
				display: "—",
				onStep: () => void 0
			}));
			t.ok(min.includes("disabled") && min.includes("Decrease Dice"), "min disables decrease");
			t.ok(max.includes("Increase Dice") && max.includes("disabled"), "max disables increase");
			t.ok(signed.includes("+3"), "signed plus");
			t.ok((off.match(/disabled/g) ?? []).length >= 2, "both disabled");
			t.ok(dashed.includes("—") && !dashed.includes(">3<"), "compound dash hides the stale count");
			t.ok(min.includes("role=\"group\""), "stepper is a labelled group");
			t.ok(dashed.includes("Dice locked"), "locked value named for AT");
		}
	},
	{
		id: "ui-controls-primitives",
		suite: "Interface",
		name: "Switch, slider, input, badge, and button expose the right ARIA",
		description: "Switch is role=switch with aria-checked and a hidden thumb. Slider is input type=range using value[0]. Input sets suppressHydrationWarning. Badge and Button render children. Skip link points at main content.",
		why: "Native range/switch replaced Radix here to kill hydration mismatches. If they regress, the smoke test goes red again.",
		run: (t) => {
			const on = html((0, import_react.createElement)(Switch, {
				id: "exploding",
				checked: true
			}));
			const off = html((0, import_react.createElement)(Switch, {
				checked: false,
				disabled: true
			}));
			const slider = html((0, import_react.createElement)(Slider, {
				value: [40],
				min: -100,
				max: 100,
				onValueChange: () => void 0,
				"aria-label": "Luck"
			}));
			const input = html((0, import_react.createElement)(Input, {
				id: "notation",
				value: "1d20",
				onChange: () => void 0
			}));
			const badge = html((0, import_react.createElement)(Badge, { variant: "outline" }, "seed"));
			const button = html((0, import_react.createElement)(Button, { size: "lg" }, "Roll"));
			const skip = html((0, import_react.createElement)(SkipLink));
			t.ok(on.includes("role=\"switch\"") && on.includes("aria-checked=\"true\""), "switch on");
			t.ok(off.includes("disabled") && off.includes("aria-checked=\"false\""), "switch off");
			t.ok(on.includes("aria-hidden"), "switch thumb hidden from AT");
			t.ok(slider.includes("type=\"range\"") && slider.includes("value=\"40\""), "slider value");
			t.ok(slider.includes("Luck"), "slider label");
			t.ok(input.includes("id=\"notation\""), "input id");
			t.ok(badge.includes("seed"), "badge text");
			t.ok(button.includes("Roll"), "button text");
			t.ok(skip.includes("Skip to main content") && skip.includes("#main-content"), "skip link");
			const spoken = html((0, import_react.createElement)(SpokenLabel, null, "Pool"));
			t.ok(spoken.includes("aria-hidden"), "caps are visual only");
			t.ok(spoken.includes("sr-only") && spoken.includes("Pool"), "spoken text stays in the tree");
			t.ok(spoken.includes("normal-case"), "spoken text is not shouted");
		}
	},
	{
		id: "ui-shell-empty-states",
		suite: "Interface",
		name: "Empty tray, stats, table, and pool speak in product copy",
		description: "DiceTray says No rolls yet. StatsStrip shows em dashes. ResultsTable explains dropped dice. RollPanel lists Pool and presets.",
		why: "The first paint is what the live preview shows. Blank chrome is the #1 reported failure.",
		run: (t) => {
			withStore(() => {
				const tray = html((0, import_react.createElement)(DiceTray));
				const stats = html((0, import_react.createElement)(StatsStrip));
				const table = html((0, import_react.createElement)(ResultsTable));
				const panel = html((0, import_react.createElement)(RollPanel));
				t.ok(tray.includes("No rolls yet"), "tray empty");
				t.ok(stats.includes("—"), "stats dashes");
				t.ok(table.includes("Roll to fill the table") || table.includes("faded as discarded"), "table hint");
				t.ok(panel.includes("Pool") && panel.includes("Adv") && panel.includes("Stats"), "presets");
				t.ok(panel.includes("How many"), "keep N mounted empty");
				t.ok(panel.includes("pool-live"), "live readout");
				t.note("panel", panel.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 280));
			});
		}
	},
	{
		id: "ui-shell-with-history",
		suite: "Interface",
		name: "A recorded roll fills the tray total, stats, and table row",
		description: "Zustand SSR snapshots the initial store, so this case mounts on a live document. One 4d6dl1 roll of 12 vs 10.5 must fill the tray, stats, and table.",
		why: "If the store updates and the table stays empty, the whole product looks like it did not roll.",
		env: "browser",
		run: (t) => {
			withStore(() => {
				const roll = fakeRoll({
					id: "vis1",
					notation: "4d6dl1",
					total: 12,
					expected: 10.5,
					luck: .5,
					dice: [
						fakeDie({
							id: "a",
							face: 6,
							sides: 6,
							kept: true
						}),
						fakeDie({
							id: "b",
							face: 4,
							sides: 6,
							kept: true
						}),
						fakeDie({
							id: "c",
							face: 2,
							sides: 6,
							kept: true
						}),
						fakeDie({
							id: "d",
							face: 1,
							sides: 6,
							kept: false
						})
					]
				});
				useDiceStore.setState({
					history: [roll],
					last: roll
				});
				const host = document.createElement("div");
				document.body.appendChild(host);
				const root = (0, import_client.createRoot)(host);
				try {
					(0, import_react_dom.flushSync)(() => {
						root.render((0, import_react.createElement)("div", null, (0, import_react.createElement)(DiceTray), (0, import_react.createElement)(StatsStrip), (0, import_react.createElement)(ResultsTable)));
					});
					const markup = host.innerHTML;
					t.note("markup", markup.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400));
					t.ok(markup.includes("Lucky"), "luck badge");
					t.ok(markup.includes("vs expected"), "delta copy");
					t.ok(markup.includes("4d6dl1"), "expr column");
					t.ok(markup.includes("Reroll this expression"), "reroll action");
					t.ok(markup.includes("<caption"), "history table has a caption");
					t.ok(markup.includes("data-testid=\"roll-cards\""), "phone cards name every field");
					t.ok(markup.includes("data-testid=\"roll-table\""), "wide table stays a real table");
					t.ok(!markup.includes("stack-table"), "stacked display:block table is gone");
					t.ok(!markup.includes("min-w-[44rem]"), "table is not forced wider than the phone");
					t.ok(markup.includes("Dice that landed"), "tray dice list named");
				} finally {
					root.unmount();
					host.remove();
				}
			});
		}
	},
	{
		id: "ui-error-component",
		suite: "Interface",
		name: "The route error boundary still prints error.message",
		description: "AppErrorComponent renders the message of the thrown Error, not a generic stand-in that hides the cause.",
		why: "The platform contract: without the message on screen, a crash is an un-debuggable red box.",
		run: (t) => {
			const markup = html((0, import_react.createElement)(AppErrorComponent, {
				error: /* @__PURE__ */ new Error("felt caught fire"),
				reset: () => void 0
			}));
			t.ok(markup.includes("felt caught fire"), "message visible");
			t.ok(markup.includes("Something went wrong"), "heading");
		}
	},
	{
		id: "ui-utils-cn-and-copy",
		suite: "Utilities",
		name: "cn merges Tailwind conflicts; copyText reports clipboard success",
		description: "cn('px-2', 'px-4') yields px-4. copyText returns true when writeText resolves and false when it throws.",
		why: "Conflicting utility classes would leave stale padding on every button. Clipboard denials must not throw into the UI.",
		run: async (t) => {
			t.eq(cn("px-2", "px-4"), "px-4", "tailwind merge");
			t.ok(cn("a", false, void 0).includes("a"), "falsy skipped");
			t.eq(isTypingTarget(null), false, "null is not a typing target");
			const nav = globalThis.navigator;
			if (!nav) {
				t.ok(true, "no navigator — copyText is browser-only here");
				return;
			}
			const original = nav.clipboard;
			try {
				Object.defineProperty(nav, "clipboard", {
					configurable: true,
					value: { writeText: async () => void 0 }
				});
				t.eq(await copyText("ok"), true, "success");
				Object.defineProperty(nav, "clipboard", {
					configurable: true,
					value: { writeText: async () => {
						throw new Error("denied");
					} }
				});
				t.eq(await copyText("x"), false, "failure");
			} finally {
				if (original) Object.defineProperty(nav, "clipboard", {
					configurable: true,
					value: original
				});
			}
		}
	},
	{
		id: "ui-spacebar-target-guard",
		suite: "Utilities",
		name: "Space is ignored on fields, switches, sliders, buttons, links, and radios",
		description: "isTypingTarget is true for input/textarea/select/contenteditable and for button / link / role=button|switch|slider|radio|tab. Plain document.body is false. Non-elements are false.",
		why: "Space-to-roll on a focused Lock switch would toggle and cast. On a slider, radio, or Table link it would also fire the page-level handler.",
		env: "browser",
		run: (t) => {
			t.eq(isTypingTarget(null), false, "null");
			t.eq(isTypingTarget(document.createTextNode("x")), false, "text node");
			const input = document.createElement("input");
			t.eq(isTypingTarget(input), true, "input");
			const ta = document.createElement("textarea");
			t.eq(isTypingTarget(ta), true, "textarea");
			const sel = document.createElement("select");
			t.eq(isTypingTarget(sel), true, "select");
			const edit = document.createElement("div");
			edit.setAttribute("contenteditable", "true");
			t.eq(isTypingTarget(edit), true, "contenteditable");
			const btn = document.createElement("button");
			t.eq(isTypingTarget(btn), true, "button");
			const sw = document.createElement("div");
			sw.setAttribute("role", "switch");
			t.eq(isTypingTarget(sw), true, "switch");
			const slider = document.createElement("div");
			slider.setAttribute("role", "slider");
			t.eq(isTypingTarget(slider), true, "slider");
			const roleBtn = document.createElement("div");
			roleBtn.setAttribute("role", "button");
			t.eq(isTypingTarget(roleBtn), true, "role=button");
			const link = document.createElement("a");
			link.href = "/tests";
			t.eq(isTypingTarget(link), true, "link");
			const radio = document.createElement("button");
			radio.setAttribute("role", "radio");
			t.eq(isTypingTarget(radio), true, "radio");
			const tab = document.createElement("button");
			tab.setAttribute("role", "tab");
			t.eq(isTypingTarget(tab), true, "tab");
			t.eq(isTypingTarget(document.body), false, "body is a cast target");
			t.ok(isBrowser(), "running in a document");
		}
	},
	{
		id: "ui-die-crit-pips-and-percentile",
		suite: "Interface",
		name: "A natural 1 rings crit; pip faces stay pips; a d100 is a square",
		description: "A kept 1 on a d20 gets the crit ring. A d6 showing 1 still uses the pip grid. A d100 uses rounded-lg, not a clip path. An out-of-range d6 face 9 prints the numeral.",
		why: "Nat-1 feedback is how the tray shouts a fumble. A hundred-sider must not inherit the d20 silhouette.",
		run: (t) => {
			const crit = html((0, import_react.createElement)(DieFace, { die: fakeDie({
				face: 1,
				sides: 20
			}) }));
			const pipOne = html((0, import_react.createElement)(DieFace, { die: fakeDie({
				face: 1,
				sides: 6
			}) }));
			const d100 = html((0, import_react.createElement)(DieFace, { die: fakeDie({
				face: 42,
				sides: 100
			}) }));
			const weird = html((0, import_react.createElement)(DieFace, { die: fakeDie({
				face: 9,
				sides: 6
			}) }));
			t.ok(crit.includes("ring-crit"), "nat 1 ring");
			t.ok(pipOne.includes("grid-cols-3"), "d6 face 1 is pips");
			t.ok(!pipOne.includes("ring-crit"), "d6 one is not a crit ring");
			t.ok(d100.includes("rounded-lg"), "d100 square");
			t.ok(!d100.includes("clip-d"), "d100 not clipped");
			t.ok(d100.includes("42"), "percentile numeral");
			t.ok(weird.includes("9"), "invalid pip face falls back to numeral");
		}
	},
	{
		id: "ui-lab-panel-and-stats-filled",
		suite: "Interface",
		name: "Lab, pool, and stats speak for loaded, compound, and filled states",
		description: "Zustand SSR snapshots the initial store, so this mounts live. Streak with no history waits. Luck loads the table. A compound pool prints the lock copy. A bad notation shows the error. Stats count max faces and ones.",
		why: "These strings are the only explanation of what the sliders are doing. If they stay on the empty-state copy after a roll, the lab looks broken.",
		env: "browser",
		run: (t) => {
			withStore(() => {
				const host = document.createElement("div");
				document.body.appendChild(host);
				const root = (0, import_client.createRoot)(host);
				try {
					t.eq(labStatusText(0, .5, 1, 0, 0), "Streak waits for prior rolls before it can tilt the curve.", "streak waiting");
					t.eq(labStatusText(1, .5, 0, 0, 0), "This table is loaded. Fair is chaos 50 with luck and streak at 0.", "loaded copy");
					t.eq(labStatusText(0, .5, 0, 0, 0), "Uniform and independent — a mathematically fair table.", "fair copy");
					t.eq(labStatusText(.01, .5, 0, 0, 0), "This table is loaded. Fair is chaos 50 with luck and streak at 0.", "1% luck is loaded");
					t.eq(labStatusText(0, .51, 0, 0, 0), "This table is loaded. Fair is chaos 50 with luck and streak at 0.", "chaos 51 is loaded");
					t.eq(labStatusText(0, .5, .01, 0, 1), "Streak is armed, but recent totals sit near expected so it is not tilting yet.", "armed streak with no tilt is idle");
					t.eq(labStatusText(0, .5, 1, .4, 1), "This table is loaded. Fair is chaos 50 with luck and streak at 0.", "tilting streak is loaded");
					t.eq(labStatusText(1, .5, 1, 0, 0), "This table is loaded. Fair is chaos 50 with luck and streak at 0.", "luck wins over waiting streak");
					t.eq(labStatusText(0, .5, 0, 0, 0, true), "Uniform — a mathematically fair curve, replayed from the seed.", "seeded fair is not independent");
					t.eq(labStatusText(0, .5, 0, 0, 0, false), "Uniform and independent — a mathematically fair table.", "unlocked fair is independent");
					useDiceStore.getState().setNotation("1d20+1d4");
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RollPanel)));
					t.ok(host.innerHTML.includes("Compound pool"), "compound lock");
					useDiceStore.setState({
						error: "Could not parse “nope”.",
						notation: "nope"
					});
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RollPanel)));
					t.ok(host.innerHTML.includes("Could not parse"), "error line");
					const filled = fakeRoll({
						id: "s1",
						total: 12,
						expected: 10.5,
						dice: [
							fakeDie({
								id: "m",
								face: 6,
								sides: 6,
								kept: true
							}),
							fakeDie({
								id: "o",
								face: 1,
								sides: 6,
								kept: true
							}),
							fakeDie({
								id: "d",
								face: 6,
								sides: 6,
								kept: false
							})
						]
					});
					useDiceStore.setState({
						history: [filled],
						last: filled,
						error: null
					});
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(StatsStrip)));
					const statsText = host.textContent ?? "";
					t.ok(statsText.includes("Rolls"), "rolls label");
					t.ok(statsText.includes("Ones"), "ones label");
					t.ok(statsText.includes("Max faces"), "max faces label");
					t.ok(statsText.includes("12.0") || statsText.includes("12"), "mean from the 12");
					useDiceStore.setState({
						history: [],
						last: null,
						randomness: {
							luck: 1,
							chaos: .5,
							streak: 1,
							seed: "",
							seedLocked: false,
							streamIndex: 0
						}
					});
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RandomnessLab)));
					t.ok((host.textContent ?? "").includes("This table is loaded"), "lab copy: luck beats waiting streak");
					useDiceStore.setState({
						history: [fakeRoll({
							total: 10.5,
							expected: 10.5
						})],
						randomness: {
							luck: 0,
							chaos: .5,
							streak: 1,
							seed: "",
							seedLocked: false,
							streamIndex: 0
						}
					});
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RandomnessLab)));
					t.ok((host.textContent ?? "").includes("not tilting yet"), "lab copy: idle streak when totals sit on expected");
				} finally {
					root.unmount();
					host.remove();
				}
			});
		}
	},
	{
		id: "ui-table-factor-chips-and-tray-badges",
		suite: "Interface",
		name: "Factor chips and tray badges match the recorded luck, chaos, streak, and seed",
		description: "A loaded unlucky, wild, reverting, seeded roll of 3 vs 10.5 paints Unlucky / Wild / Reverting / Seeded on the tray and L / C / S / seed chips plus a negative delta in the table. Fair rolls show the fair chip.",
		why: "If the tray says Lucky while the row says fair, the table cannot be trusted as a log.",
		env: "browser",
		run: (t) => {
			withStore(() => {
				const loaded = fakeRoll({
					id: "chips1",
					notation: "1d20",
					total: 3,
					expected: 10.5,
					luck: -.5,
					chaos: 1,
					streak: -.8,
					seedUsed: "oak",
					modifier: -2,
					dice: [fakeDie({
						face: 5,
						sides: 20,
						sign: 1
					})]
				});
				const fair = fakeRoll({
					id: "chips2",
					notation: "1d6",
					total: 4,
					expected: 3.5,
					luck: 0,
					chaos: .5,
					streak: 0,
					seedUsed: null
				});
				useDiceStore.setState({
					history: [loaded, fair],
					last: loaded,
					rolling: true
				});
				const host = document.createElement("div");
				document.body.appendChild(host);
				const root = (0, import_client.createRoot)(host);
				try {
					(0, import_react_dom.flushSync)(() => {
						root.render((0, import_react.createElement)("div", null, (0, import_react.createElement)(DiceTray), (0, import_react.createElement)(ResultsTable)));
					});
					const text = host.textContent ?? "";
					t.note("text", text.replace(/\s+/g, " ").trim().slice(0, 500));
					t.ok(text.includes("Unlucky"), "unlucky badge");
					t.ok(host.innerHTML.includes("data-testid=\"tray-factors\""), "tray factor mount");
					t.ok(text.includes("Wild"), "wild badge");
					t.ok(text.includes("Reverting"), "reverting badge");
					t.ok(text.includes("Seeded"), "seeded badge");
					t.ok(text.includes("L -50") || text.includes("L-50"), "luck chip");
					t.ok(text.includes("C 100"), "chaos chip");
					t.ok(text.includes("seed"), "seed chip");
					t.ok(text.includes("fair"), "fair chip on second row");
					t.ok(host.innerHTML.includes("Reroll this expression"), "reroll present");
					t.ok(host.innerHTML.includes("aria-busy=\"true\""), "reroll busy while rolling, focus kept");
					t.ok(text.includes("-2"), "modifier shown");
					t.ok((host.textContent ?? "").includes("Rolling."), "tray announces rolling");
				} finally {
					root.unmount();
					host.remove();
				}
			});
		}
	},
	{
		id: "ui-spacebar-nested-control",
		suite: "Utilities",
		name: "Space ignores a click target nested inside a button",
		description: "A span inside a button, and an SVG-like child inside role=switch, both count as typing/control targets. A plain paragraph does not.",
		why: "The Roll button's icon is the actual event.target. If the guard only looked at the node itself, Space on Roll would double-cast.",
		env: "browser",
		run: (t) => {
			const btn = document.createElement("button");
			const span = document.createElement("span");
			btn.appendChild(span);
			t.eq(isTypingTarget(span), true, "child of button");
			const sw = document.createElement("div");
			sw.setAttribute("role", "switch");
			const knob = document.createElement("i");
			sw.appendChild(knob);
			t.eq(isTypingTarget(knob), true, "child of switch");
			const p = document.createElement("p");
			p.textContent = "felt";
			t.eq(isTypingTarget(p), false, "paragraph is a cast target");
			const link = document.createElement("a");
			const linkIcon = document.createElement("span");
			link.appendChild(linkIcon);
			t.eq(isTypingTarget(linkIcon), true, "child of link");
		}
	},
	{
		id: "ui-live-pool-and-keep-n-always-on",
		suite: "Interface",
		name: "The sticky pool readout and How many stepper stay on screen",
		description: "SSR still prints pool-live and How many on 1d20. On a live document, Adv then dropping to 1 die paints pool-notice naming Keep High; How many stays mounted.",
		why: "Keep N used to unmount when Keep snapped to all, so a dice-count click could hide the control it had just changed.",
		env: "browser",
		run: (t) => {
			withStore(() => {
				const empty = html((0, import_react.createElement)(RollPanel));
				t.ok(empty.includes("data-testid=\"pool-live\""), "live readout");
				t.ok(empty.includes("1d20"), "default headline");
				t.ok(empty.includes("How many"), "keep N always mounted");
				const host = document.createElement("div");
				document.body.appendChild(host);
				const root = (0, import_client.createRoot)(host);
				try {
					useDiceStore.getState().applyPreset("2d20kh1");
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RollPanel)));
					t.ok(host.innerHTML.includes("2d20kh1"), "adv headline");
					t.ok((host.textContent ?? "").includes("keep 1 high"), "keep words");
					useDiceStore.getState().patchPool({ count: 1 });
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RollPanel)));
					t.ok(host.innerHTML.includes("data-testid=\"pool-notice\""), "notice in DOM");
					t.ok((host.textContent ?? "").includes("Keep High turned off"), "coupling copy");
					t.ok((host.textContent ?? "").includes("How many"), "keep N still mounted");
				} finally {
					root.unmount();
					host.remove();
				}
			});
		}
	},
	{
		id: "ui-lock-notice-and-compound-rebuild-copy",
		suite: "Interface",
		name: "Lock auto-off and compound controls follow the notation, not a stale pool",
		description: "Clearing a locked seed paints rng-notice. A compound expression locks the steppers on a dash, starts a fresh 1dN from a die chip, and the exploding switch follows a bang in the notation rather than leftover simple-pool state.",
		why: "Seed lock used to uncheck off-screen. Compound chips used to resurrect Adv. The exploding switch used to stay on after typing 1d20+1d4 from an exploding d20, or stay off on 1d20+1d6!.",
		env: "browser",
		run: (t) => {
			withStore(() => {
				const host = document.createElement("div");
				document.body.appendChild(host);
				const root = (0, import_client.createRoot)(host);
				try {
					useDiceStore.getState().patchRandomness({
						seed: "oak",
						seedLocked: true
					});
					useDiceStore.getState().patchRandomness({ seed: "" });
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RandomnessLab)));
					t.ok(host.innerHTML.includes("data-testid=\"rng-notice\""), "rng notice");
					t.ok((host.textContent ?? "").includes("Lock turned off"), "lock copy");
					useDiceStore.getState().applyPreset("2d20kh1");
					useDiceStore.getState().setNotation("1d20+1d4");
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RollPanel)));
					let text = host.textContent ?? "";
					t.ok(text.includes("Compound pool"), "compound banner");
					t.ok(text.includes("fresh 1dN"), "chip rebuild copy");
					t.ok(!text.includes("Locked simple pool"), "stale locked pool gone");
					t.ok(text.includes("1d20+1d4"), "live compound notation");
					t.ok(host.querySelector("#exploding")?.getAttribute("aria-checked") === "false", "no bang → exploding off");
					t.ok(text.includes("No bangs in this mixed pool"), "mixed exploding copy when none explode");
					useDiceStore.getState().setNotation("1d20!");
					useDiceStore.getState().setNotation("1d20+1d6!");
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RollPanel)));
					text = host.textContent ?? "";
					t.eq(host.querySelector("#exploding")?.getAttribute("aria-checked"), "true", "compound bang → exploding on");
					t.ok(text.includes("1 of 2 dice explode"), "mixed exploding names the bang");
					t.ok(text.includes("—"), "steppers dash on compound");
					t.ok((text.match(/—/g) ?? []).length >= 4, "dice, sides, modifier, and how many dash");
					useDiceStore.getState().applyPreset("2d20kh1");
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RandomnessLab)));
					t.ok((host.textContent ?? "").includes("pool E["), "advantage shows pool E");
					useDiceStore.getState().applyPreset("1d20");
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RandomnessLab)));
					t.ok(!(host.textContent ?? "").includes("pool E["), "plain d20 hides pool E");
				} finally {
					root.unmount();
					host.remove();
				}
			});
		}
	},
	{
		id: "ui-invalid-notation-hides-leftover-pool",
		suite: "Interface",
		name: "Invalid notation hides leftover steppers and the fake d20 curve",
		description: "Adv, then `1d20+100`: Keep High is not pressed, exploding is off, Dice/Sides/Modifier/How many dash, Roll is disabled, and a d20 chip starts a fresh 1d20. The lab drops the curve instead of drawing a d20 while the pool is illegal. A locked fair seed says the curve is replayed, not independent.",
		why: "Typing past the modifier cap used to unlock the leftover Adv steppers so a + click rewrote the field as 2d20kh1. The lab also jumped to a d20 curve on any parse error, including a trailing plus.",
		env: "browser",
		run: (t) => {
			withStore(() => {
				const host = document.createElement("div");
				document.body.appendChild(host);
				const root = (0, import_client.createRoot)(host);
				try {
					useDiceStore.getState().applyPreset("2d20kh1");
					useDiceStore.getState().setNotation("1d20+100");
					(0, import_react_dom.flushSync)(() => {
						root.render((0, import_react.createElement)("div", null, (0, import_react.createElement)(RollPanel), (0, import_react.createElement)(RandomnessLab)));
					});
					const text = host.textContent ?? "";
					t.ok(text.includes("Modifier must be between"), "sticky parse error");
					t.ok(text.includes("Steppers wait for a valid pool"), "lock copy");
					t.ok(text.includes("Curve waits for a valid pool"), "lab waits");
					t.ok(!text.includes("E["), "no fake d20 expected");
					t.eq(host.querySelector("#exploding")?.getAttribute("aria-checked"), "false", "leftover exploding not shown");
					const keepHigh = [...host.querySelectorAll("button")].find((b) => b.textContent === "High");
					t.eq(keepHigh?.getAttribute("aria-checked"), "false", "leftover Keep High not pressed");
					t.eq(keepHigh?.disabled, true, "Keep High disabled");
					const d20Chip = [...host.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === "Start a simple d20 pool");
					t.eq(d20Chip?.getAttribute("aria-pressed"), "false", "d20 chip not pressed from leftover");
					const rollBtn = host.querySelector("button[title=\"Cast the current pool\"]");
					t.eq(rollBtn?.disabled, true, "cannot cast invalid");
					t.ok((text.match(/—/g) ?? []).length >= 4, "steppers dash");
					d20Chip?.click();
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RollPanel)));
					t.eq(useDiceStore.getState().notation, "1d20", "chip rebuilds a simple d20");
					t.eq(useDiceStore.getState().pool.keepMode, "none", "keep reset");
					useDiceStore.getState().patchRandomness({
						seed: "oak",
						seedLocked: true,
						luck: 0,
						chaos: .5,
						streak: 0
					});
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RandomnessLab)));
					t.ok((host.textContent ?? "").includes("replayed from the seed"), "seeded fair copy");
					t.ok(!(host.textContent ?? "").includes("independent"), "does not claim independence");
				} finally {
					root.unmount();
					host.remove();
				}
			});
		}
	},
	{
		id: "ui-a11y-names-roles-and-hints",
		suite: "Interface",
		name: "Every pool control has a name, a role, and a description a screen reader can reach",
		description: "Notation is labelled and described. Keep radios are named with the short label plus the hint. Die chips are radios on a simple pool and named rebuild actions when locked. Exploding is a labelled switch. Luck/chaos/streak sliders expose valuetext. The skip link targets main content. describeDie names exploded and dropped faces. The pool form is named. An invalid Roll button says why it waits.",
		why: "JAWS and VoiceOver skip untitled sliders and unlabeled icon buttons. If a control only has a hover title, it is invisible to a screen reader.",
		env: "browser",
		run: (t) => {
			t.eq(describeDie(fakeDie({
				face: 8,
				sides: 8,
				exploded: true
			})), "d8 showing 8, exploded", "explode name");
			t.eq(describeDie(fakeDie({
				face: 1,
				sides: 20,
				kept: false
			})), "d20 showing 1, dropped, not counted", "dropped name");
			t.eq(describeDie(fakeDie({
				face: 2,
				sides: 4,
				sign: -1
			})), "minus d4 showing 2", "penalty name");
			t.ok(describeDieTitle(fakeDie({
				face: 8,
				sides: 8,
				exploded: true
			})).includes("explode"), "title keeps explode");
			withStore(() => {
				const host = document.createElement("div");
				document.body.appendChild(host);
				const root = (0, import_client.createRoot)(host);
				try {
					(0, import_react_dom.flushSync)(() => {
						root.render((0, import_react.createElement)("div", null, (0, import_react.createElement)(SkipLink), (0, import_react.createElement)(RollPanel), (0, import_react.createElement)(RandomnessLab)));
					});
					const notation = host.querySelector("#notation");
					t.ok(notation, "notation field");
					t.eq(notation?.getAttribute("aria-describedby")?.includes("notation-hint"), true, "notation described");
					t.ok(host.querySelector("label[for='notation']"), "notation label");
					t.ok(host.querySelector("[role='radiogroup'][aria-labelledby='keep-label']"), "keep radiogroup");
					t.ok(host.querySelector("[role='radiogroup'][aria-labelledby='die-label']"), "die radiogroup");
					const keepAll = [...host.querySelectorAll("[role='radio']")].find((b) => b.textContent === "Keep all");
					t.eq(keepAll?.getAttribute("aria-checked"), "true", "keep all selected");
					t.ok(keepAll?.getAttribute("aria-label")?.includes("Keep all"), "keep all name includes the short label");
					t.ok(keepAll?.getAttribute("aria-label")?.includes("Count every die"), "keep all name includes the hint");
					t.eq(host.querySelector("form")?.getAttribute("aria-label"), "Dice pool", "form named");
					const validRoll = host.querySelector("button[title=\"Cast the current pool\"]");
					t.eq(validRoll?.hasAttribute("aria-label"), false, "valid roll uses the visible name");
					t.eq(host.querySelector("#exploding")?.getAttribute("aria-describedby"), "exploding-hint", "exploding described");
					t.ok(host.querySelector("label[for='exploding']"), "exploding label");
					t.ok(host.querySelector("form"), "pool is a form");
					const luck = host.querySelector("#factor-luck");
					t.ok(luck, "luck slider");
					t.eq(luck?.getAttribute("aria-valuetext"), "Luck 0", "luck valuetext");
					t.ok(host.querySelector("label[for='factor-luck']"), "luck label");
					t.ok(host.querySelector("label[for='seed']"), "seed label");
					t.ok(host.querySelector("label[for='seed-lock']"), "lock label");
					t.eq(host.querySelector(".skip-link")?.getAttribute("href"), "#main-content", "skip href");
					useDiceStore.getState().setNotation("1d20+100");
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RollPanel)));
					t.eq(host.querySelector("#notation")?.getAttribute("aria-invalid"), "true", "invalid flagged");
					t.eq(host.querySelector("#notation")?.getAttribute("aria-errormessage"), "pool-live-detail", "errormessage linked to live detail");
					t.ok((host.querySelector("#notation")?.getAttribute("aria-describedby") ?? "").includes("pool-live-detail"), "invalid described by live detail");
					t.ok(host.querySelector("button[title=\"Cast the current pool\"]")?.getAttribute("aria-label")?.includes("waits for a valid pool"), "invalid roll explains the wait");
				} finally {
					root.unmount();
					host.remove();
				}
			});
		}
	},
	{
		id: "ui-a11y-keyboard-radiogroup-and-stepper",
		suite: "Interface",
		name: "Arrow keys move Keep radios and steppers without a pointer",
		description: "onRadioGroupKeyDown on ArrowRight focuses and clicks the next enabled radio. Home jumps to the first. A Sides stepper ArrowRight from 20 becomes 21 via onStep. Space on a focused radio is treated as a typing target so it does not also roll.",
		why: "Keep High used to be mouse-only in practice: the buttons were tabbable but arrows did nothing, and Space on a radio would also fire the page-level roll.",
		env: "browser",
		run: (t) => {
			withStore(() => {
				useDiceStore.getState().applyPreset("2d20kh1");
				const host = document.createElement("div");
				document.body.appendChild(host);
				const root = (0, import_client.createRoot)(host);
				try {
					(0, import_react_dom.flushSync)(() => root.render((0, import_react.createElement)(RollPanel)));
					const group = host.querySelector("[role='radiogroup'][aria-labelledby='keep-label']");
					t.ok(group, "keep group");
					const radios = [...group?.querySelectorAll("[role='radio']:not(:disabled)") ?? []];
					t.eq(radios.length, 3, "three keep options on advantage");
					const high = radios.find((b) => b.textContent === "High");
					t.ok(high, "high radio");
					t.eq(useDiceStore.getState().pool.keepMode, "highest", "starts on high");
					onRadioGroupKeyDown({
						key: "ArrowRight",
						preventDefault: () => void 0,
						currentTarget: high ?? null
					});
					t.eq(useDiceStore.getState().pool.keepMode, "lowest", "arrow right from High selects Low");
					const low = [...group?.querySelectorAll("[role='radio']:not(:disabled)") ?? []].find((b) => b.textContent === "Low");
					onRadioGroupKeyDown({
						key: "Home",
						preventDefault: () => void 0,
						currentTarget: low ?? null
					});
					t.eq(useDiceStore.getState().pool.keepMode, "none", "home selects Keep all");
				} finally {
					root.unmount();
					host.remove();
				}
			});
			let delta = 0;
			const stepHost = document.createElement("div");
			document.body.appendChild(stepHost);
			const stepRoot = (0, import_client.createRoot)(stepHost);
			try {
				(0, import_react_dom.flushSync)(() => stepRoot.render((0, import_react.createElement)(Stepper, {
					label: "Sides",
					value: 20,
					min: 2,
					max: 100,
					onStep: (d) => {
						delta = d;
					}
				})));
				const inc = [...stepHost.querySelectorAll("button")].find((b) => (b.getAttribute("aria-label") ?? "").startsWith("Increase Sides"));
				t.ok(inc, "increase sides");
				inc?.dispatchEvent(new KeyboardEvent("keydown", {
					key: "ArrowRight",
					bubbles: true
				}));
				t.eq(delta, 1, "arrow right steps +1");
				inc?.dispatchEvent(new KeyboardEvent("keydown", {
					key: "Home",
					bubbles: true
				}));
				t.eq(delta, -18, "home steps to min");
				inc?.dispatchEvent(new KeyboardEvent("keydown", {
					key: "End",
					bubbles: true
				}));
				t.eq(delta, 80, "end steps to max");
			} finally {
				stepRoot.unmount();
				stepHost.remove();
			}
		}
	},
	{
		id: "ui-docs-guide-faq-jaws",
		suite: "Interface",
		name: "Guide, FAQ, and the JAWS tutorial document the real table",
		description: "The Guide names exploding, Keep, luck, seed, and this-device history. FAQ answers why Roll waits and why a phone has cards, not a stacked table. The Keys page is a JAWS Professional 2026 lesson: Virtual Cursor versus Forms Mode, Insert+F6, Num Pad Plus, and why Space must not be used to roll in browse mode. Keystroke tables are real tables with captions.",
		why: "A help tab that invents controls, or a JAWS lesson that tells someone to press Space in browse mode, would train the reader to fight the table.",
		run: (t) => {
			const guide = html((0, import_react.createElement)(UserGuide));
			const faq = html((0, import_react.createElement)(Faq));
			const keys = html((0, import_react.createElement)(JawsTutorial));
			t.ok(guide.includes("How the table works"), "guide title");
			t.ok(guide.includes("exploding") && guide.includes("Keep"), "guide names exploding and Keep");
			t.ok(guide.includes("this device"), "history is local");
			t.ok(guide.includes("On this page"), "guide has a contents list");
			t.ok(faq.includes("Where are my rolls stored?"), "faq storage");
			t.ok(faq.includes("waits for a valid pool"), "faq invalid roll");
			t.ok(faq.includes("three-faced alias"), "faq dF honesty");
			t.ok(faq.includes("each roll is a card"), "faq phone cards");
			t.ok(keys.includes("JAWS Professional 2026"), "jaws edition");
			t.ok(keys.includes("Virtual Cursor") && keys.includes("Forms Mode"), "modes");
			t.ok(keys.includes("Insert+F6"), "heading list");
			t.ok(keys.includes("Num Pad Plus"), "leave forms mode");
			t.ok(keys.includes("Caps Lock"), "laptop layout");
			t.ok(keys.includes("Do not use it to roll") || keys.includes("Leave Space-to-roll alone"), "space warning");
			t.ok(keys.includes("<table") && keys.includes("<caption"), "keystroke tables are real tables");
			t.ok(keys.includes("scope=\"col\""), "column headers");
			t.ok(keys.includes("role=switch") || keys.includes("switches, not checkboxes"), "exploding is a switch");
		}
	}
];
var ALL_TESTS = [
	...notationCases,
	...rngCases,
	...engineCases,
	...storeCases,
	...uiCases,
	...harnessCases
];
function testsBySuite() {
	const order = [];
	const map = /* @__PURE__ */ new Map();
	for (const test of ALL_TESTS) {
		if (!map.has(test.suite)) {
			map.set(test.suite, []);
			order.push(test.suite);
		}
		map.get(test.suite).push(test);
	}
	return order.map((suite) => ({
		suite,
		tests: map.get(suite)
	}));
}
function runAllTests() {
	return runTests(ALL_TESTS);
}
function runOneTest(id) {
	const def = ALL_TESTS.find((t) => t.id === id);
	if (!def) throw new Error(`Unknown test ${id}`);
	return runTests([def]);
}
function statusClass(status) {
	if (status === "passed") return "text-max";
	if (status === "failed") return "text-crit";
	return "text-subtle";
}
function StatusPip({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("mt-1.5 size-2 shrink-0 rounded-full", status === "passed" && "bg-max", status === "failed" && "bg-crit", status === "skipped" && "bg-subtle"),
		"aria-hidden": true
	});
}
function TechnicalValue({ value }) {
	const text = typeof value === "string" ? value : stringify(value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		className: "max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md border border-border bg-elevated px-3 py-2 font-mono text-xs leading-relaxed text-muted-foreground",
		children: text
	});
}
function Heading({ children, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
		className: cn("text-xs font-medium", tone === "crit" ? "text-crit" : "text-subtle"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children })
	});
}
function TestDetail({ result, onRerun, busy }) {
	const failed = result.assertions.filter((a) => !a.passed);
	const passed = result.assertions.filter((a) => a.passed);
	const record = {
		id: result.id,
		suite: result.suite,
		name: result.name,
		status: result.status,
		durationMs: result.durationMs,
		env: result.notes._env ?? null,
		skipReason: result.skipReason ?? null,
		error: result.error ?? null,
		logs: result.logs,
		notes: result.notes,
		assertions: result.assertions
	};
	async function copyRecord() {
		const ok = await copyText(stringify(record));
		toast(ok ? "Copied technical record" : "Couldn’t copy");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: `assay-detail-${result.id}`,
		"data-testid": "assay-detail",
		"data-assay-detail": result.id,
		role: "region",
		"aria-label": `Technical record for ${result.name}`,
		className: "flex flex-col gap-5 border-t border-border px-4 py-4 sm:px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading, { children: "What is under test" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm leading-relaxed text-foreground",
					children: result.description
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading, { children: "Why it matters" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm leading-relaxed text-foreground",
					children: result.why
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["id ", result.id] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [result.durationMs, "ms"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: statusClass(result.status),
						children: result.status
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						passed.length,
						"/",
						result.assertions.length,
						" assertions"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["env ", String(result.notes._env ?? "unknown")] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						disabled: busy,
						onClick: onRerun,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { "aria-hidden": "true" }), "Run this case"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						onClick: () => void copyRecord(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { "aria-hidden": "true" }), "Copy record"]
					})
				]
			}),
			result.skipReason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: result.skipReason
			}) : null,
			result.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading, {
					tone: "crit",
					children: "Failure"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-mono text-sm text-crit",
					children: result.error.message
				}),
				result.error.stack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechnicalValue, { value: result.error.stack }) : null
			] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-full min-w-0 overflow-x-auto",
				tabIndex: 0,
				role: "region",
				"aria-label": `Assertions for ${result.name}. Scroll sideways for every column.`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading, { children: "Assertions" }), result.assertions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: result.status === "skipped" ? "Not run in this environment." : "No assertions recorded."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "data-table mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("caption", {
							className: "sr-only",
							children: [
								"Assertions for ",
								result.name,
								". ",
								passed.length,
								" passed, ",
								failed.length,
								" failed."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-y border-border text-xs text-subtle",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									className: "py-2 pr-3 font-medium",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "Assertion" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									className: "py-2 pr-3 font-medium",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "Expected" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									className: "py-2 pr-3 font-medium",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "Actual" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									className: "py-2 font-medium",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "Result" })
								})
							]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: result.assertions.map((assertion, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/80 align-top",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
									scope: "row",
									className: "py-2 pr-3 text-left font-normal text-foreground",
									children: [assertion.name, assertion.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 block font-mono text-xs text-subtle",
										children: assertion.detail
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 pr-3 font-mono text-xs break-all text-muted-foreground",
									children: stringify(assertion.expected)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 pr-3 font-mono text-xs break-all text-muted-foreground",
									children: stringify(assertion.actual)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("py-2 font-mono text-xs", assertion.passed ? "text-max" : "text-crit"),
									children: assertion.passed ? "pass" : "fail"
								})
							]
						}, `${assertion.name}-${i}`)) })
					]
				})]
			}),
			failed.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-crit",
				role: "status",
				children: [
					failed.length,
					" assertion",
					failed.length === 1 ? "" : "s",
					" failed",
					passed.length ? ` · ${passed.length} passed` : ""
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading, { children: "Log" }), result.logs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechnicalValue, { value: result.logs.join("\n") })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "No log lines."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading, { children: "Technical record" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: "Inputs, outputs, and recorder notes for this case — including environment and assertion count."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechnicalValue, { value: record })
				})
			] })
		]
	});
}
function Assay() {
	const [summary, setSummary] = (0, import_react.useState)(null);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [suiteFilter, setSuiteFilter] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const [openId, setOpenId] = (0, import_react.useState)(null);
	async function runAll() {
		setRunning(true);
		try {
			const next = await runAllTests();
			setSummary(next);
			const firstFail = next.results.find((r) => r.status === "failed");
			setOpenId(firstFail?.id ?? next.results[0]?.id ?? null);
		} finally {
			setRunning(false);
		}
	}
	async function runOne(id) {
		setRunning(true);
		try {
			const slice = await runOneTest(id);
			const next = slice.results[0];
			if (!next) return;
			setSummary((prev) => {
				if (!prev) return slice;
				const results = prev.results.map((r) => r.id === id ? next : r);
				return {
					...prev,
					results,
					passed: results.filter((r) => r.status === "passed").length,
					failed: results.filter((r) => r.status === "failed").length,
					skipped: results.filter((r) => r.status === "skipped").length
				};
			});
			setOpenId(id);
		} finally {
			setRunning(false);
		}
	}
	(0, import_react.useEffect)(() => {
		runAll();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!openId || running) return;
		document.getElementById(`assay-detail-${openId}`)?.scrollIntoView({ block: "nearest" });
	}, [openId, running]);
	const grouped = testsBySuite();
	const visible = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return (summary?.results ?? []).filter((r) => {
			if (filter !== "all" && r.status !== filter) return false;
			if (suiteFilter !== "all" && r.suite !== suiteFilter) return false;
			if (!q) return true;
			return `${r.name} ${r.id} ${r.description} ${r.why}`.toLowerCase().includes(q);
		});
	}, [
		summary,
		filter,
		suiteFilter,
		query
	]);
	const bySuite = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const result of visible) {
			const list = map.get(result.suite) ?? [];
			list.push(result);
			map.set(result.suite, list);
		}
		return grouped.map((g) => ({
			suite: g.suite,
			results: map.get(g.suite) ?? []
		})).filter((g) => g.results.length > 0);
	}, [visible, grouped]);
	const cells = [
		{
			label: "Cases",
			value: String(summary?.total ?? ALL_TESTS.length)
		},
		{
			label: "Passed",
			value: summary ? String(summary.passed) : "—"
		},
		{
			label: "Failed",
			value: summary ? String(summary.failed) : "—"
		},
		{
			label: "Skipped",
			value: summary ? String(summary.skipped) : "—"
		},
		{
			label: "Time",
			value: summary ? `${summary.durationMs}ms` : "—"
		}
	];
	function exportJson() {
		if (!summary) return;
		const blob = new Blob([stringify(summary)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "alea-assay.json";
		a.click();
		URL.revokeObjectURL(url);
		toast("Exported assay JSON");
	}
	const liveSummary = running ? "Running tests." : summary ? `${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped.` : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5 sm:gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				role: "status",
				"aria-live": "polite",
				children: liveSummary
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "felt relative overflow-hidden rounded-xl border border-border p-4 sm:p-6",
				"aria-labelledby": "assay-heading",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "Assay" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "assay-heading",
							className: "mt-2 font-display text-3xl tracking-tight text-foreground sm:text-4xl",
							children: "Proofs for the table"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground",
							children: "These are the live unit tests for the caster — the same cases the command-line runner executes. Every row names the case and says what it proves. Open one for why it exists, every assertion with expected vs actual, the log, and the raw technical record."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							size: "lg",
							onClick: exportJson,
							disabled: !summary,
							"aria-label": "Export assay results as JSON",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { "aria-hidden": "true" }), "Export JSON"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "lg",
							onClick: () => void runAll(),
							disabled: running,
							"aria-busy": running,
							children: [running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
								className: "animate-spin",
								"aria-hidden": "true"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { "aria-hidden": "true" }), running ? "Running" : "Run all"]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-labelledby": "assay-stats-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					id: "assay-stats-heading",
					className: "sr-only",
					children: "Assay totals"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					className: "grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-5",
					children: cells.map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 bg-card px-3 py-3 sm:px-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-subtle",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: cell.label })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 font-mono text-lg tabular-nums text-foreground",
							children: cell.value
						})]
					}, cell.label))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center",
				role: "search",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sm:max-w-sm sm:flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "assay-filter",
						className: "sr-only",
						children: "Filter cases by name, id, or description"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "assay-filter",
						type: "search",
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Filter by name, id, or description"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "group",
					"aria-label": "Filter by result",
					className: "flex flex-wrap gap-1.5",
					children: [
						"all",
						"passed",
						"failed",
						"skipped"
					].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setFilter(key),
						"aria-pressed": filter === key,
						className: cn(FOCUS_RING, "h-11 rounded-md px-3 text-xs font-medium capitalize transition-colors", filter === key ? "bg-primary text-primary-foreground" : "bg-elevated text-muted-foreground hover:text-foreground"),
						children: key
					}, key))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "group",
				"aria-label": "Filter by suite",
				className: "flex flex-wrap gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setSuiteFilter("all"),
					"aria-pressed": suiteFilter === "all",
					className: cn(FOCUS_RING, "h-11 rounded-full border px-3 text-xs", suiteFilter === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"),
					children: "All suites"
				}), grouped.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setSuiteFilter(g.suite),
					"aria-pressed": suiteFilter === g.suite,
					className: cn(FOCUS_RING, "h-11 rounded-full border px-3 text-xs", suiteFilter === g.suite ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"),
					children: g.suite
				}, g.suite))]
			}),
			bySuite.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: running ? "Casting the suite…" : "No cases match that filter."
			}) : bySuite.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "overflow-hidden rounded-xl border border-border bg-card",
				"aria-labelledby": `suite-${group.suite.replace(/\s+/g, "-")}`,
				"aria-busy": running,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center justify-between gap-3 px-5 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						id: `suite-${group.suite.replace(/\s+/g, "-")}`,
						className: "text-sm text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: group.suite })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs tabular-nums text-subtle",
						children: [
							group.results.filter((r) => r.status === "passed").length,
							"/",
							group.results.length
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: group.results.map((result) => {
					const open = openId === result.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "border-t border-border",
						"data-assay-id": result.id,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							id: `assay-row-${result.id}`,
							"data-testid": `assay-row-${result.id}`,
							onClick: () => setOpenId(open ? null : result.id),
							className: cn(FOCUS_RING, "flex w-full items-start gap-3 px-4 py-3 text-left sm:px-5"),
							"aria-expanded": open,
							"aria-controls": `assay-detail-${result.id}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPip, { status: result.status }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "sr-only",
											children: [result.status, ". "]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-sm font-medium text-foreground",
											children: result.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-0.5 block text-xs text-muted-foreground",
											children: result.description
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block font-mono text-xs text-subtle",
											children: result.id
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 shrink-0 font-mono text-xs tabular-nums text-subtle",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "sm:hidden",
										children: result.assertions.length
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "hidden sm:inline",
										children: [
											result.assertions.length,
											" assert · ",
											result.durationMs,
											"ms"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
									"aria-hidden": "true",
									className: cn("mt-0.5 size-4 shrink-0 text-subtle transition-transform", open && "rotate-180")
								})
							]
						}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TestDetail, {
							result,
							busy: running,
							onRerun: () => void runOne(result.id)
						}) : null]
					}, result.id);
				}) })]
			}, group.suite)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs text-subtle",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, {
						className: "size-3.5",
						"aria-hidden": "true"
					}),
					ALL_TESTS.length,
					" cases covering notation, RNG, evaluation, the session store, the interface, and this harness. Browser-only guards skip in the shell and run here."
				]
			})
		]
	});
}
function TestsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			id: "main-content",
			tabIndex: -1,
			"aria-labelledby": "app-title",
			className: "flex min-w-0 flex-col gap-5 outline-none sm:gap-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Assay, {})
		})]
	});
}
//#endregion
export { tests_CM7mb5ld_exports as a, TestsPage as component, testsBySuite as i, runAllTests as n, runOneTest as r, ALL_TESTS as t };
