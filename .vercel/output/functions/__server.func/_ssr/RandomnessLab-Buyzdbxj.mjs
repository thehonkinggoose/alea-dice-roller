import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { i as Plus, l as Dices, n as Trash2, o as Minus, r as RotateCcw, u as Copy } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Slot } from "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import { a as copyText, i as cn } from "./router-BNAdKw7A.mjs";
import { a as describeDieTitle, i as describeDie, n as FOCUS_RING, o as slugLabel, r as SpokenLabel } from "./AppHeader-CETfn4LJ.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { a as ResponsiveContainer, i as Cell, n as XAxis, r as Bar, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RandomnessLab-Buyzdbxj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NotationError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "NotationError";
	}
};
var DIE_SIDES_MAX = 1e3;
var TERM_RE = /([+-])(?:(\d*)d(\d+|f|%)((?:kh|kl|dh|dl|k)\d+)?(!)?|(\d+))/gi;
function parseKeep(raw, count) {
	if (!raw) return {
		mode: "none",
		n: count
	};
	let drop = false;
	let mode = "highest";
	let digits;
	if (raw.startsWith("kh")) {
		mode = "highest";
		digits = raw.slice(2);
	} else if (raw.startsWith("kl")) {
		mode = "lowest";
		digits = raw.slice(2);
	} else if (raw.startsWith("dl")) {
		drop = true;
		mode = "highest";
		digits = raw.slice(2);
	} else if (raw.startsWith("dh")) {
		drop = true;
		mode = "lowest";
		digits = raw.slice(2);
	} else if (raw.startsWith("k")) {
		mode = "highest";
		digits = raw.slice(1);
	} else return {
		mode: "none",
		n: count
	};
	const n = Math.max(1, Number.parseInt(digits, 10) || 1);
	if (drop) return {
		mode,
		n: Math.max(1, count - n)
	};
	return {
		mode,
		n: Math.min(n, count)
	};
}
function sidesFrom(raw) {
	if (raw === "%" || raw === "100") return 100;
	if (raw === "f") return 3;
	return Number.parseInt(raw, 10);
}
function parseNotation(input) {
	const compact = input.trim().replace(/[−–—]/g, "-").replace(/\s+/g, "").toLowerCase();
	if (!compact) throw new NotationError("Enter a dice expression, like 2d6+3.");
	const signed = /^[+-]/.test(compact) ? compact : `+${compact}`;
	const terms = [];
	let cursor = 0;
	TERM_RE.lastIndex = 0;
	for (const match of signed.matchAll(TERM_RE)) {
		if (match.index !== cursor) throw new NotationError(`Could not parse “${signed.slice(cursor, match.index) || signed}”.`);
		cursor = (match.index ?? 0) + match[0].length;
		const sign = match[1] === "-" ? -1 : 1;
		if (match[6] !== void 0) {
			terms.push({
				kind: "mod",
				value: sign * Number.parseInt(match[6], 10)
			});
			continue;
		}
		const count = match[2] === "" || match[2] === void 0 ? 1 : Number.parseInt(match[2], 10);
		const sides = sidesFrom(match[3] ?? "6");
		if (!Number.isFinite(count) || count < 1 || count > 100) throw new NotationError(`Dice count must be between 1 and 100.`);
		if (!Number.isFinite(sides) || sides < 2 || sides > 1e3) throw new NotationError(`Die size must be between 2 and ${DIE_SIDES_MAX}.`);
		terms.push({
			kind: "dice",
			term: {
				count,
				sides,
				keep: parseKeep(match[4], count),
				exploding: match[5] === "!",
				sign
			}
		});
	}
	if (cursor !== signed.length) throw new NotationError(`Could not parse “${signed.slice(cursor)}”.`);
	if (!terms.some((t) => t.kind === "dice")) throw new NotationError("Add at least one die, like d20 or 4d6.");
	const modifier = terms.reduce((sum, t) => t.kind === "mod" ? sum + t.value : sum, 0);
	if (Math.abs(modifier) > 99) throw new NotationError(`Modifier must be between −99 and 99.`);
	return {
		raw: compact,
		terms,
		modifier
	};
}
function formatPool(pool) {
	let s = `${pool.count}d${pool.sides}`;
	if (pool.keepMode === "highest") s += `kh${pool.keepN}`;
	if (pool.keepMode === "lowest") s += `kl${pool.keepN}`;
	if (pool.exploding) s += "!";
	if (pool.modifier > 0) s += `+${pool.modifier}`;
	if (pool.modifier < 0) s += `${pool.modifier}`;
	return s;
}
function poolFromExpression(parsed) {
	const diceTerms = parsed.terms.filter((t) => t.kind === "dice");
	if (diceTerms.length !== 1) return null;
	const term = diceTerms[0].term;
	if (term.sign < 0) return null;
	const keepAll = term.keep.mode === "none" || term.keep.n >= term.count;
	return {
		count: term.count,
		sides: term.sides,
		modifier: parsed.modifier,
		keepMode: keepAll ? "none" : term.keep.mode,
		keepN: keepAll ? Math.max(1, term.count - 1) : term.keep.n,
		exploding: term.exploding,
		repeat: 1
	};
}
function isCompoundExpression(parsed) {
	return poolFromExpression(parsed) === null;
}
function keepLabel(term) {
	if (term.keep.mode === "none" || term.keep.n >= term.count) return null;
	if (term.keep.mode === "highest") return `keep ${term.keep.n} high`;
	return `keep ${term.keep.n} low`;
}
function totalDiffersFromPrimaryFace(parsed) {
	const diceTerms = parsed.terms.filter((t) => t.kind === "dice");
	if (diceTerms.length !== 1) return true;
	const d = diceTerms[0].term;
	if (d.sign < 0 || d.count !== 1 || d.exploding) return true;
	if (parsed.modifier !== 0) return true;
	if (d.keep.mode !== "none" && d.keep.n < d.count && d.count >= 2) return true;
	return false;
}
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
function describeCast(notation, repeat) {
	try {
		const parsed = parseNotation(notation);
		const compound = isCompoundExpression(parsed);
		const parts = [];
		for (const t of parsed.terms) {
			if (t.kind === "mod") {
				parts.push(t.value > 0 ? `plus ${t.value}` : `minus ${Math.abs(t.value)}`);
				continue;
			}
			const d = t.term;
			let bit = `${d.sign < 0 ? "minus " : ""}${d.count === 1 ? "d" : `${d.count}d`}${d.sides}`;
			const keepNoOp = d.keep.mode === "none" || d.keep.n >= d.count;
			if (!keepNoOp && d.keep.mode === "highest") bit += ` keep ${d.keep.n} high`;
			else if (!keepNoOp && d.keep.mode === "lowest") bit += ` keep ${d.keep.n} low`;
			if (d.keep.mode !== "none" && d.count < 2) bit += " (needs two dice)";
			if (d.exploding) bit += " exploding";
			parts.push(bit);
		}
		if (repeat > 1) parts.push(`repeat ×${repeat}`);
		const raw = parsed.raw || notation;
		return {
			headline: repeat > 1 ? `${raw} ×${repeat}` : raw,
			detail: parts.join(" · "),
			compound,
			valid: true
		};
	} catch (err) {
		return {
			headline: notation.trim() || "—",
			detail: err instanceof Error ? err.message : "Enter a dice expression.",
			compound: false,
			valid: false
		};
	}
}
function hashSeed(seed) {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function cryptoRng() {
	return () => {
		const buf = /* @__PURE__ */ new Uint32Array(1);
		crypto.getRandomValues(buf);
		return (buf[0] ?? 0) / 4294967296;
	};
}
function rngFor(seed, streamIndex) {
	if (seed && seed.length > 0) return mulberry32(hashSeed(`${seed}#${streamIndex}`));
	return cryptoRng();
}
var MAX_EXPLOSIONS = 24;
var FACTOR_TICK = .01;
var EXPECTED_SAMPLES = 1200;
function luckLoaded(luck) {
	return Math.abs(luck) >= FACTOR_TICK;
}
function chaosLoaded(chaos) {
	return Math.abs(chaos - .5) >= FACTOR_TICK;
}
function streakLoaded(streak) {
	return Math.abs(streak) >= FACTOR_TICK;
}
function effectiveLuck(luck) {
	return luckLoaded(luck) ? clamp(luck, -1, 1) : 0;
}
function effectiveChaos(chaos) {
	return chaosLoaded(chaos) ? clamp(chaos, 0, 1) : .5;
}
function effectiveBias(bias) {
	return Math.abs(bias) >= .01 ? clamp(bias, -1, 1) : 0;
}
function appliedStreak(slider, bias) {
	return streakLoaded(slider) && Math.abs(bias) >= .01 ? slider : 0;
}
function rollFactorFlags(roll) {
	return {
		luck: luckLoaded(roll.luck),
		chaos: chaosLoaded(roll.chaos),
		streak: streakLoaded(roll.streak),
		seed: Boolean(roll.seedUsed)
	};
}
function faceWeights(sides, luck, chaos, streakBias) {
	const tilt = clamp(effectiveLuck(luck) + effectiveBias(streakBias), -1, 1);
	const mixChaos = effectiveChaos(chaos);
	const weights = [];
	for (let i = 1; i <= sides; i++) {
		const centered = (sides === 1 ? .5 : (i - 1) / (sides - 1)) * 2 - 1;
		const luckW = Math.exp(tilt * 2.45 * centered);
		const peak = Math.exp(-3.4 * centered * centered);
		const uShape = 1.08 - peak;
		const mix = mixChaos <= .5 ? peak * (1 - mixChaos / .5) + 1 * (mixChaos / .5) : 1 * (1 - (mixChaos - .5) / .5) + uShape * ((mixChaos - .5) / .5);
		weights.push(Math.max(luckW * mix, 1e-12));
	}
	return weights;
}
function sampleWeighted(weights, rng) {
	const total = weights.reduce((a, b) => a + b, 0);
	let r = rng() * total;
	for (let i = 0; i < weights.length; i++) {
		r -= weights[i] ?? 0;
		if (r <= 0) return i;
	}
	return weights.length - 1;
}
function expectedFace(weights) {
	const total = weights.reduce((a, b) => a + b, 0);
	return weights.reduce((sum, w, i) => sum + (i + 1) * w / total, 0);
}
function streakBiasFrom(history, streak) {
	if (!streakLoaded(streak) || history.length === 0) return 0;
	const recent = history.slice(0, 5);
	let acc = 0;
	for (const roll of recent) {
		const spread = Math.max(1, Math.abs(roll.expected) * .55);
		acc += (roll.total - roll.expected) / spread;
	}
	return effectiveBias(clamp(streak * (clamp(acc / recent.length, -1.4, 1.4) / 1.4), -1, 1));
}
function nextId(rng) {
	return `d${Math.floor(rng() * 1e9).toString(36)}${Math.floor(rng() * 1e9).toString(36)}`;
}
function rollOneDie(sides, exploding, weights, rng, group, sign) {
	const out = [];
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
			sign
		});
		explode = exploding && face === sides && explosions < MAX_EXPLOSIONS;
		explosions += 1;
	}
	return out;
}
function applyKeep(dice, mode, n) {
	const groups = /* @__PURE__ */ new Map();
	for (const die of dice) groups.set(die.group, (groups.get(die.group) ?? 0) + die.face);
	if (mode === "none" || groups.size <= n) return dice.map((d) => ({
		...d,
		kept: true
	}));
	const ranked = [...groups.entries()].sort((a, b) => mode === "highest" ? b[1] - a[1] : a[1] - b[1]);
	const keptGroups = new Set(ranked.slice(0, n).map(([g]) => g));
	return dice.map((d) => ({
		...d,
		kept: keptGroups.has(d.group)
	}));
}
function evaluateExpression(parsed, factors, streakBias, rng) {
	const dice = [];
	let group = 0;
	let total = parsed.modifier;
	for (const term of parsed.terms) {
		if (term.kind !== "dice") continue;
		const { count, sides, keep, exploding, sign } = term.term;
		const weights = faceWeights(sides, factors.luck, factors.chaos, streakBias);
		const bucket = [];
		for (let i = 0; i < count; i++) {
			group += 1;
			bucket.push(...rollOneDie(sides, exploding, weights, rng, group, sign));
		}
		const kept = applyKeep(bucket, keep.mode, keep.n);
		dice.push(...kept);
		const sub = kept.reduce((sum, d) => sum + (d.kept ? d.face : 0), 0);
		total += sign * sub;
	}
	return {
		dice,
		modifier: parsed.modifier,
		total
	};
}
function estimateExpected(parsed, luck, chaos, streakBias, samples = EXPECTED_SAMPLES) {
	const rng = mulberry32(hashSeed(JSON.stringify({
		raw: parsed.raw,
		luck: round4(luck),
		chaos: round4(chaos),
		streakBias: round4(streakBias)
	})));
	let acc = 0;
	for (let i = 0; i < samples; i++) acc += evaluateExpression(parsed, {
		luck,
		chaos
	}, streakBias, rng).total;
	return acc / samples;
}
function round4(n) {
	return Math.round(n * 1e4) / 1e4;
}
function makeRoll(notation, randomness, history) {
	const parsed = parseNotation(notation);
	const luck = effectiveLuck(randomness.luck);
	const chaos = effectiveChaos(randomness.chaos);
	const bias = streakBiasFrom(history, randomness.streak);
	const seedUsed = randomness.seedLocked && randomness.seed.trim() ? randomness.seed.trim() : null;
	const rng = rngFor(seedUsed, randomness.streamIndex);
	const result = evaluateExpression(parsed, {
		luck,
		chaos
	}, bias, rng);
	const expected = estimateExpected(parsed, luck, chaos, bias);
	return {
		record: {
			id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
			at: Date.now(),
			notation: parsed.raw,
			dice: result.dice,
			modifier: result.modifier,
			total: result.total,
			expected,
			luck,
			chaos,
			streak: appliedStreak(randomness.streak, bias),
			seedUsed
		},
		streamIndex: seedUsed ? randomness.streamIndex + 1 : randomness.streamIndex
	};
}
function formatRollLine(record) {
	const faces = record.dice.map((d) => {
		const sign = d.sign < 0 ? "−" : "";
		const mark = d.exploded ? "!" : d.kept ? "" : "↓";
		return `${sign}${d.face}${mark}`;
	}).join(", ");
	const mod = record.modifier === 0 ? "" : record.modifier > 0 ? ` + ${record.modifier}` : ` − ${Math.abs(record.modifier)}`;
	return `${record.notation} → ${faces}${mod} = ${record.total}`;
}
function primarySides(parsed) {
	const first = parsed.terms.find((t) => t.kind === "dice");
	return first && first.kind === "dice" ? first.term.sides : 20;
}
function distributionSeries(sides, luck, chaos, streakBias) {
	const weights = faceWeights(sides, luck, chaos, streakBias);
	const total = weights.reduce((a, b) => a + b, 0);
	return weights.map((w, i) => ({
		face: i + 1,
		p: w / total
	}));
}
function chartTicks(sides) {
	if (sides <= 12) return void 0;
	if (sides <= 20) return [
		1,
		5,
		10,
		15,
		20
	].filter((n) => n <= sides);
	return [
		1,
		Math.round(sides / 2),
		sides
	];
}
var STORAGE_KEY = "alea-v1";
var MAX_HISTORY = 200;
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
var PRESETS = [
	{
		label: "d20",
		notation: "1d20",
		hint: "One twenty-sided die"
	},
	{
		label: "d20+5",
		notation: "1d20+5",
		hint: "A d20 plus five"
	},
	{
		label: "Adv",
		notation: "2d20kh1",
		hint: "Advantage: two d20s, keep the higher"
	},
	{
		label: "Dis",
		notation: "2d20kl1",
		hint: "Disadvantage: two d20s, keep the lower"
	},
	{
		label: "2d6",
		notation: "2d6",
		hint: "Two six-sided dice"
	},
	{
		label: "3d6",
		notation: "3d6",
		hint: "Three six-sided dice"
	},
	{
		label: "4d6dl1",
		notation: "4d6dl1",
		hint: "Four d6, drop the lowest"
	},
	{
		label: "Stats",
		notation: "4d6dl1",
		repeat: 6,
		hint: "Six ability scores: 4d6 drop lowest, six times"
	},
	{
		label: "d100",
		notation: "1d100",
		hint: "Percentile die, faces 1–100"
	},
	{
		label: "8d6",
		notation: "8d6",
		hint: "Eight six-sided dice"
	}
];
var DIE_SIDES = [
	4,
	6,
	8,
	10,
	12,
	20,
	100
];
function syncNotation(pool) {
	return formatPool(pool);
}
function tickPercent(n) {
	return Math.round(n * 100) / 100;
}
function sanitizePool(raw) {
	const pool = {
		...DEFAULT_POOL,
		...raw
	};
	pool.count = Math.min(100, Math.max(1, Math.round(Number(pool.count)) || 1));
	pool.sides = Math.min(DIE_SIDES_MAX, Math.max(2, Math.round(Number(pool.sides)) || 20));
	pool.modifier = Math.min(99, Math.max(-99, Math.round(Number(pool.modifier)) || 0));
	pool.keepN = Math.round(Number(pool.keepN)) || 1;
	pool.repeat = Math.min(20, Math.max(1, Math.round(Number(pool.repeat)) || 1));
	pool.exploding = Boolean(pool.exploding);
	if (pool.count < 2) pool.keepMode = "none";
	if (pool.keepMode !== "none" && pool.keepMode !== "highest" && pool.keepMode !== "lowest") pool.keepMode = "none";
	if (pool.keepMode !== "none") pool.keepN = Math.min(Math.max(1, pool.keepN), Math.max(1, pool.count - 1));
	else pool.keepN = Math.max(1, pool.keepN);
	return pool;
}
function sanitizeRandomness(raw) {
	const randomness = {
		...DEFAULT_RANDOMNESS,
		...raw
	};
	randomness.luck = clamp(tickPercent(Number(randomness.luck) || 0), -1, 1);
	randomness.chaos = clamp(tickPercent(Number.isFinite(Number(randomness.chaos)) ? Number(randomness.chaos) : .5), 0, 1);
	randomness.streak = clamp(tickPercent(Number(randomness.streak) || 0), -1, 1);
	randomness.seed = typeof randomness.seed === "string" ? randomness.seed : "";
	randomness.streamIndex = Math.max(0, Math.floor(Number(randomness.streamIndex)) || 0);
	randomness.seedLocked = Boolean(randomness.seedLocked) && randomness.seed.trim().length > 0;
	return randomness;
}
function isFiniteNumber(n) {
	return typeof n === "number" && Number.isFinite(n);
}
function sanitizeDie(raw) {
	if (!raw || typeof raw !== "object") return null;
	const d = raw;
	if (!isFiniteNumber(d.face) || !isFiniteNumber(d.sides)) return null;
	return {
		id: typeof d.id === "string" && d.id ? d.id : `d${d.face}`,
		sides: Math.round(d.sides),
		face: Math.round(d.face),
		kept: d.kept !== false,
		exploded: Boolean(d.exploded),
		group: isFiniteNumber(d.group) ? d.group : 1,
		sign: d.sign === -1 ? -1 : 1
	};
}
function sanitizeHistory(raw) {
	if (!Array.isArray(raw)) return [];
	const out = [];
	for (const row of raw) {
		if (!row || typeof row !== "object") continue;
		const r = row;
		if (typeof r.id !== "string" || !r.id) continue;
		if (typeof r.notation !== "string" || !r.notation) continue;
		if (!isFiniteNumber(r.total) || !isFiniteNumber(r.expected) || !isFiniteNumber(r.at)) continue;
		if (!Array.isArray(r.dice)) continue;
		const dice = r.dice.map(sanitizeDie).filter((d) => d !== null);
		if (dice.length === 0) continue;
		out.push({
			id: r.id,
			at: r.at,
			notation: r.notation,
			dice,
			modifier: isFiniteNumber(r.modifier) ? r.modifier : 0,
			total: r.total,
			expected: r.expected,
			luck: isFiniteNumber(r.luck) ? r.luck : 0,
			chaos: isFiniteNumber(r.chaos) ? r.chaos : .5,
			streak: isFiniteNumber(r.streak) ? r.streak : 0,
			seedUsed: typeof r.seedUsed === "string" && r.seedUsed ? r.seedUsed : null
		});
	}
	return out.slice(0, MAX_HISTORY);
}
function persist(state) {
	try {
		const payload = {
			notation: state.notation,
			pool: state.pool,
			randomness: state.randomness,
			history: state.history.slice(0, MAX_HISTORY)
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
	} catch {}
}
function couplingNotice(prev, next, patch) {
	const keepTouched = Object.prototype.hasOwnProperty.call(patch, "keepMode");
	const keepNTouched = Object.prototype.hasOwnProperty.call(patch, "keepN");
	if (!keepTouched && prev.keepMode !== "none" && next.keepMode === "none") return `${prev.keepMode === "lowest" ? "Keep Low" : "Keep High"} turned off — it needs two or more dice.`;
	if (!keepNTouched && next.keepMode !== "none" && next.keepN !== prev.keepN && next.keepN < prev.keepN) return `Keep reduced to ${next.keepN} so it stays below the number of dice.`;
	return null;
}
function isPoolRebuild(patch) {
	return Object.prototype.hasOwnProperty.call(patch, "count") && Object.prototype.hasOwnProperty.call(patch, "sides") && Object.prototype.hasOwnProperty.call(patch, "keepMode");
}
function notationOwnership(notation) {
	try {
		return isCompoundExpression(parseNotation(notation)) ? "compound" : "simple";
	} catch {
		return "invalid";
	}
}
var rollAnimTimer = null;
function startRollAnimation(set) {
	if (rollAnimTimer) clearTimeout(rollAnimTimer);
	rollAnimTimer = setTimeout(() => {
		set({ rolling: false });
		rollAnimTimer = null;
	}, 720);
}
var useDiceStore = create((set, get) => {
	const cast = (raw, times) => {
		if (get().rolling) return null;
		const { randomness, history } = get();
		let parsed;
		try {
			parsed = parseNotation(raw);
		} catch (err) {
			set({ error: err instanceof NotationError || err instanceof Error ? err.message : "Invalid expression." });
			return null;
		}
		const n = Math.min(50, Math.max(1, times));
		const records = [];
		let streamIndex = randomness.streamIndex;
		let nextHistory = history;
		for (let i = 0; i < n; i++) {
			const { record, streamIndex: nextIndex } = makeRoll(parsed.raw, {
				...randomness,
				streamIndex
			}, history);
			records.push(record);
			streamIndex = nextIndex;
			nextHistory = [record, ...nextHistory].slice(0, MAX_HISTORY);
		}
		set({
			history: nextHistory,
			last: records[records.length - 1] ?? null,
			randomness: {
				...randomness,
				streamIndex
			},
			rolling: true,
			error: null
		});
		persist(get());
		startRollAnimation(set);
		return records;
	};
	return {
		notation: "1d20",
		pool: { ...DEFAULT_POOL },
		randomness: { ...DEFAULT_RANDOMNESS },
		history: [],
		last: null,
		rolling: false,
		error: null,
		hydrated: false,
		poolNotice: null,
		rngNotice: null,
		hydrate: () => {
			if (get().hydrated || typeof window === "undefined") return;
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (raw) {
					const saved = JSON.parse(raw);
					const history = sanitizeHistory(saved.history);
					set({
						notation: typeof saved.notation === "string" && saved.notation ? saved.notation : "1d20",
						pool: sanitizePool(saved.pool),
						randomness: sanitizeRandomness(saved.randomness),
						history,
						last: history[0] ?? null,
						rolling: false,
						poolNotice: null,
						rngNotice: null
					});
				}
			} catch {}
			set({ hydrated: true });
		},
		setNotation: (value, fromPool = false) => {
			const next = {
				notation: value,
				error: null
			};
			if (!fromPool) try {
				const pool = poolFromExpression(parseNotation(value));
				if (pool) next.pool = sanitizePool({
					...get().pool,
					...pool,
					repeat: get().pool.repeat
				});
			} catch {}
			set(next);
			persist(get());
		},
		patchPool: (patch) => {
			const prev = get().pool;
			const pool = sanitizePool({
				...prev,
				...patch
			});
			const keys = Object.keys(patch);
			const onlyRepeat = keys.length === 1 && keys[0] === "repeat";
			const poolNotice = couplingNotice(prev, pool, patch);
			if (onlyRepeat) {
				set({
					pool,
					poolNotice
				});
				persist(get());
				return;
			}
			const ownership = notationOwnership(get().notation);
			if ((ownership === "compound" || ownership === "invalid") && !isPoolRebuild(patch)) return;
			set({
				pool,
				notation: syncNotation(pool),
				error: null,
				poolNotice
			});
			persist(get());
		},
		patchRandomness: (patch) => {
			const prev = get().randomness;
			const randomness = sanitizeRandomness({
				...prev,
				...patch
			});
			set({
				randomness,
				rngNotice: prev.seedLocked && !randomness.seedLocked && !Object.prototype.hasOwnProperty.call(patch, "seedLocked") ? "Lock turned off — a locked table needs a seed." : null
			});
			persist(get());
		},
		resetRandomness: () => {
			const prev = get().randomness;
			set({
				randomness: sanitizeRandomness({
					...DEFAULT_RANDOMNESS,
					seed: prev.seed,
					seedLocked: prev.seedLocked,
					streamIndex: prev.streamIndex
				}),
				rngNotice: null
			});
			persist(get());
		},
		applyPreset: (notation, repeat = 1) => {
			try {
				const derived = poolFromExpression(parseNotation(notation));
				set({
					notation,
					pool: derived ? sanitizePool({
						...get().pool,
						...derived,
						repeat
					}) : sanitizePool({
						...get().pool,
						repeat
					}),
					error: null,
					poolNotice: null
				});
				persist(get());
			} catch (err) {
				set({ error: err instanceof Error ? err.message : "Invalid preset." });
			}
		},
		roll: (timesOverride) => {
			const { notation, pool } = get();
			return cast(notation, timesOverride ?? pool.repeat);
		},
		reroll: (record) => {
			if (get().rolling) return null;
			const target = record ?? get().last;
			if (!target) return null;
			return cast(target.notation, 1);
		},
		clearHistory: () => {
			if (rollAnimTimer) {
				clearTimeout(rollAnimTimer);
				rollAnimTimer = null;
			}
			set({
				history: [],
				last: null,
				rolling: false
			});
			persist(get());
		}
	};
});
var PIP_MAP = {
	1: [4],
	2: [0, 8],
	3: [
		0,
		4,
		8
	],
	4: [
		0,
		2,
		6,
		8
	],
	5: [
		0,
		2,
		4,
		6,
		8
	],
	6: [
		0,
		2,
		3,
		5,
		6,
		8
	]
};
function Pips({ n }) {
	const on = new Set(PIP_MAP[n] ?? []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid size-8 grid-cols-3 grid-rows-3 place-items-center",
		"aria-hidden": "true",
		children: Array.from({ length: 9 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", on.has(i) ? "bg-die-fg" : "bg-transparent") }, i))
	});
}
function DieFace({ die, rolling = false, delay = 0, size = "md" }) {
	const sign = die.sign ?? 1;
	const isMax = die.face === die.sides;
	const isMin = die.face === 1;
	const shape = die.sides === 4 ? "clip-d4" : die.sides === 8 ? "clip-d8" : die.sides === 10 ? "clip-d10" : die.sides === 12 ? "clip-d12" : die.sides === 20 ? "clip-d20" : "rounded-lg";
	const name = describeDie(die);
	const title = describeDieTitle(die);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [sign < 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "pointer-events-none absolute -left-1 -top-1 z-10 rounded-sm bg-card px-0.5 font-mono text-[0.65rem] leading-none text-crit",
				"aria-hidden": true,
				children: "−"
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "img",
				"aria-label": name,
				className: cn("die relative grid place-items-center bg-die text-die-fg", shape, size === "sm" && "size-10", size === "md" && "size-14", size === "lg" && "size-16", !die.kept && "opacity-35", rolling && "die-tumble", isMax && die.kept && "ring-1 ring-max/50", isMin && die.kept && die.sides >= 20 && "ring-1 ring-crit/50"),
				style: { animationDelay: `${delay}ms` },
				title,
				children: die.sides === 6 && die.face >= 1 && die.face <= 6 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pips, { n: die.face }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					className: cn("font-mono font-medium tabular-nums leading-none", size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base"),
					children: die.face
				})
			})]
		}), size !== "sm" || sign < 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "font-mono text-[0.65rem] uppercase tracking-wide text-subtle",
			"aria-hidden": "true",
			children: [
				sign < 0 ? "−" : "",
				"d",
				die.sides
			]
		}) : null]
	});
}
function StatsStrip() {
	const history = useDiceStore((s) => s.history);
	const stats = (0, import_react.useMemo)(() => {
		if (history.length === 0) return {
			n: 0,
			mean: 0,
			expected: 0,
			high: 0,
			low: 0,
			natMax: 0,
			natMin: 0
		};
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
				if (die.face === die.sides) natMax += 1;
				if (die.face === 1) natMin += 1;
			}
		}
		return {
			n: history.length,
			mean: sum / history.length,
			expected: exp / history.length,
			high,
			low,
			natMax,
			natMin
		};
	}, [history]);
	const cells = [
		{
			label: "Rolls",
			hint: "Casts in this table",
			value: String(stats.n)
		},
		{
			label: "Mean",
			hint: "Average total so far",
			value: stats.n ? stats.mean.toFixed(1) : "—"
		},
		{
			label: "Expected",
			hint: "What the table predicted",
			value: stats.n ? stats.expected.toFixed(1) : "—"
		},
		{
			label: "High",
			hint: "Best total",
			value: stats.n ? String(stats.high) : "—"
		},
		{
			label: "Low",
			hint: "Worst total",
			value: stats.n ? String(stats.low) : "—"
		},
		{
			label: "Max faces",
			hint: "A kept die showed its highest face",
			value: stats.n ? String(stats.natMax) : "—"
		},
		{
			label: "Ones",
			hint: "A kept die showed a 1",
			value: stats.n ? String(stats.natMin) : "—"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "stats-heading",
		className: "overflow-hidden rounded-xl border border-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			id: "stats-heading",
			className: "sr-only",
			children: "Session statistics"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
			className: "grid grid-cols-2 gap-px bg-border sm:grid-cols-4 lg:grid-cols-7",
			children: cells.map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 bg-card px-3 py-3 sm:px-4",
				title: `${cell.label}: ${cell.hint}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-xs text-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: cell.label })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 font-mono text-lg tabular-nums text-foreground",
						children: cell.value
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-snug text-subtle",
						children: cell.hint
					})
				]
			}, cell.label))
		})]
	});
}
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("text-xs font-medium tracking-wide text-muted-foreground", className),
	...props
}));
Label.displayName = Root.displayName;
function FieldMeta({ htmlFor, label, hint, hintId, labelId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-0.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor,
			id: labelId,
			children: label
		}), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			id: hintId,
			className: "text-xs leading-snug text-pretty text-subtle",
			children: hint
		}) : null]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,color,box-shadow,opacity,transform] duration-150 ease-out pressable disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-elevated text-foreground border border-border hover:bg-elevated/80",
			ghost: "text-muted-foreground hover:bg-elevated hover:text-foreground",
			outline: "border border-border bg-transparent text-foreground hover:bg-elevated",
			destructive: "bg-crit/15 text-crit hover:bg-crit/25"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5",
			icon: "size-11",
			"icon-sm": "size-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
function Stepper({ label, hint, value, min, max, onStep, signed, disabled, display }) {
	const uid = (0, import_react.useId)();
	const slug = slugLabel(label);
	const labelId = `${uid}-${slug}-label`;
	const hintId = hint ? `${uid}-${slug}-hint` : void 0;
	const valueId = `${uid}-${slug}-value`;
	const shown = display ?? (signed && value > 0 ? `+${value}` : String(value));
	const locked = Boolean(disabled && display === "—");
	const spoken = locked ? `${label} locked` : `${label} ${shown}`;
	function handleKey(event) {
		if (disabled) return;
		if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
			event.preventDefault();
			if (value > min) onStep(-1);
		} else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
			event.preventDefault();
			if (value < max) onStep(1);
		} else if (event.key === "Home") {
			event.preventDefault();
			if (value !== min) onStep(min - value);
		} else if (event.key === "End") {
			event.preventDefault();
			if (value !== max) onStep(max - value);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-1.5",
		role: "group",
		"aria-labelledby": labelId,
		"aria-describedby": hintId,
		"data-testid": `stepper-${slug}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldMeta, {
			label,
			hint,
			labelId,
			hintId
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					size: "icon-sm",
					className: "shrink-0",
					"aria-label": locked ? `Decrease ${label}, locked` : `Decrease ${label}, currently ${shown}`,
					title: `Decrease ${label}`,
					disabled: disabled || value <= min,
					onClick: () => onStep(-1),
					onKeyDown: handleKey,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { "aria-hidden": "true" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					id: valueId,
					className: "min-w-8 text-center font-mono text-sm tabular-nums text-foreground",
					"aria-live": "polite",
					"aria-atomic": "true",
					"aria-label": spoken,
					children: shown
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					size: "icon-sm",
					className: "shrink-0",
					"aria-label": locked ? `Increase ${label}, locked` : `Increase ${label}, currently ${shown}`,
					title: `Increase ${label}`,
					disabled: disabled || value >= max,
					onClick: () => onStep(1),
					onKeyDown: handleKey,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { "aria-hidden": "true" })
				})
			]
		})]
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "border-transparent bg-elevated text-muted-foreground",
		outline: "border-border text-muted-foreground",
		max: "border-transparent bg-max/15 text-max",
		crit: "border-transparent bg-crit/15 text-crit"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function DiceTray() {
	const last = useDiceStore((s) => s.last);
	const rolling = useDiceStore((s) => s.rolling);
	const kept = last?.dice.filter((d) => d.kept) ?? [];
	const dropped = last?.dice.filter((d) => !d.kept) ?? [];
	const delta = last ? last.total - last.expected : 0;
	const n = kept.length + dropped.length;
	const step = n > 12 ? Math.max(12, Math.floor(400 / Math.max(n - 1, 1))) : 40;
	const flags = last ? rollFactorFlags(last) : null;
	const totalLabel = (0, import_react.useMemo)(() => {
		if (!last) return "—";
		return String(last.total);
	}, [last]);
	const announcement = rolling ? "Rolling." : last ? `Total ${last.total} from ${last.notation}. Expected ${last.expected.toFixed(1)}, ${delta >= 0 ? "plus" : "minus"} ${Math.abs(delta).toFixed(1)} versus expected.` : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "last-cast-heading",
		"aria-busy": rolling,
		className: "felt relative flex min-h-64 min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-border p-4 sm:min-h-80 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "last-cast-heading",
							className: "text-xs font-medium text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "Last cast" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs leading-snug text-subtle",
							children: "The most recent roll’s total, then each die. Faded dice were dropped by Keep."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 break-all font-mono text-sm text-muted-foreground",
							children: last ? last.notation : "No rolls yet"
						})
					]
				}), last ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex max-w-[50%] min-w-0 flex-wrap justify-end gap-1.5",
					"data-testid": "tray-factors",
					"aria-label": "Factors that were on for this roll",
					children: [
						flags?.luck && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							title: "Luck biased faces high or low",
							"aria-label": `${last.luck > 0 ? "Lucky" : "Unlucky"}. Luck biased faces high or low`,
							children: last.luck > 0 ? "Lucky" : "Unlucky"
						}),
						flags?.chaos && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							title: "Chaos reshaped the curve away from even odds",
							"aria-label": `${last.chaos > .5 ? "Wild" : "Focused"}. Chaos reshaped the curve away from even odds`,
							children: last.chaos > .5 ? "Wild" : "Focused"
						}),
						flags?.streak && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							title: "Streak used recent rolls to tilt this one",
							"aria-label": `${last.streak > 0 ? "Momentum" : "Reverting"}. Streak used recent rolls to tilt this one`,
							children: last.streak > 0 ? "Momentum" : "Reverting"
						}),
						flags?.seed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							title: "This roll followed a locked seed",
							"aria-label": "Seeded. This roll followed a locked seed",
							children: "Seeded"
						}) : null
					]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col items-center justify-center py-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"aria-live": "polite",
					"aria-atomic": "true",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-5xl tabular-nums leading-none tracking-tight text-foreground sm:text-6xl lg:text-7xl",
						"aria-hidden": "true",
						children: totalLabel
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "sr-only",
						children: announcement
					})]
				}), last ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 max-w-sm px-1 text-center text-sm text-muted-foreground text-pretty",
					children: [
						"Expected ",
						last.expected.toFixed(1),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mx-1.5 text-subtle",
							"aria-hidden": "true",
							children: "·"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: delta >= 0 ? "text-max" : "text-crit",
							children: [
								delta >= 0 ? "+" : "",
								delta.toFixed(1),
								" vs expected"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-xs text-subtle",
							children: "Expected is the average total for this pool with the luck, chaos, and streak that were on for this roll."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-xs text-center text-sm text-muted-foreground text-pretty",
					children: "Build a pool, then roll. Spacebar casts from anywhere except a text field."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap items-end justify-center gap-2",
				children: last ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "flex flex-wrap items-end justify-center gap-2",
					"aria-label": "Dice that landed",
					children: [kept.map((die, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DieFace, {
						die,
						rolling,
						delay: Math.min(i * step, 400),
						size: "lg"
					}) }, die.id)), dropped.map((die, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DieFace, {
						die,
						rolling,
						delay: Math.min((kept.length + i) * step, 400),
						size: "md"
					}) }, die.id))]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2 opacity-40",
					"aria-hidden": "true",
					children: [
						20,
						6,
						8
					].map((sides, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DieFace, {
						die: {
							id: `ghost-${sides}`,
							sides,
							face: sides === 6 ? 5 : sides === 20 ? 12 : 4,
							kept: true,
							exploded: false,
							group: i,
							sign: 1
						},
						size: "md"
					}, sides))
				})
			})
		]
	});
}
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("min-w-0 max-w-full rounded-xl border border-border bg-card text-card-foreground", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col gap-1 p-4 pb-3 sm:p-5 sm:pb-3", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
	ref,
	className: cn("font-medium tracking-tight text-foreground", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-4 pt-0 sm:p-5 sm:pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
function timeLabel(at) {
	return new Intl.DateTimeFormat(void 0, {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"
	}).format(at);
}
function factorChips(roll) {
	const flags = rollFactorFlags(roll);
	const chips = [];
	if (flags.luck) chips.push({
		key: "luck",
		text: `L ${roll.luck > 0 ? "+" : ""}${Math.round(roll.luck * 100)}`,
		hint: "Luck was on for this roll"
	});
	if (flags.chaos) chips.push({
		key: "chaos",
		text: `C ${Math.round(roll.chaos * 100)}`,
		hint: "Chaos was off 50 — the curve was loaded"
	});
	if (flags.streak) chips.push({
		key: "streak",
		text: `S ${roll.streak > 0 ? "+" : ""}${Math.round(roll.streak * 100)}`,
		hint: "Streak used recent rolls to tilt this one"
	});
	if (flags.seed) chips.push({
		key: "seed",
		text: "seed",
		hint: "This roll used a locked seed"
	});
	return chips;
}
function signedFaces(roll, keptOnly) {
	return roll.dice.filter((d) => keptOnly === null ? true : keptOnly ? d.kept : !d.kept).map((d) => `${d.sign < 0 ? "-" : ""}${d.face}`).join(" ");
}
function DiceList({ roll }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-wrap gap-1.5",
		"aria-label": `Dice for ${roll.notation}`,
		children: roll.dice.map((die) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DieFace, {
			die,
			size: "sm"
		}) }, die.id))
	});
}
function ModifierValue({ roll }) {
	if (roll.modifier === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"aria-label": "no modifier",
		children: "—"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: roll.modifier > 0 ? `+${roll.modifier}` : String(roll.modifier) });
}
function FactorList({ roll }) {
	const chips = factorChips(roll);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap justify-end gap-1 md:justify-start",
		children: chips.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-subtle",
			title: "No luck, chaos, streak, or seed",
			children: "fair"
		}) : chips.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: "outline",
			title: c.hint,
			"aria-label": `${c.hint}: ${c.text}`,
			children: c.text
		}, c.key))
	});
}
function RollActions({ roll, rolling }) {
	const reroll = useDiceStore((s) => s.reroll);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-end gap-0.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon-sm",
			"aria-label": `Copy this roll, ${roll.notation} totaling ${roll.total}`,
			title: "Copy this roll as text",
			onClick: async () => {
				const ok = await copyText(formatRollLine(roll));
				toast(ok ? "Copied roll" : "Couldn’t copy");
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { "aria-hidden": "true" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon-sm",
			"aria-label": `Reroll this expression, ${roll.notation}, with current factors`,
			title: "Cast this expression once more with the current luck, chaos, streak, and seed",
			"aria-busy": rolling,
			onClick: () => reroll(roll),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { "aria-hidden": "true" })
		})]
	});
}
var COLUMNS = [
	{
		key: "time",
		label: "Time",
		hint: "When this was cast"
	},
	{
		key: "expr",
		label: "Notation",
		hint: "The pool as written"
	},
	{
		key: "dice",
		label: "Each die",
		hint: "Every face. Faded dice were dropped by Keep."
	},
	{
		key: "mod",
		label: "Modifier",
		hint: "Flat bonus or penalty added after the dice"
	},
	{
		key: "total",
		label: "Total",
		hint: "Kept dice plus modifier"
	},
	{
		key: "vs",
		label: "vs expected",
		hint: "How far the total is from the predicted average"
	},
	{
		key: "factors",
		label: "Factors",
		hint: "Luck, chaos, streak, or seed in effect"
	}
];
function ResultsTable() {
	const history = useDiceStore((s) => s.history);
	const lastId = useDiceStore((s) => s.last?.id);
	const rolling = useDiceStore((s) => s.rolling);
	const clearHistory = useDiceStore((s) => s.clearHistory);
	const exportCsv = () => {
		const header = "time,notation,faces,kept,dropped,modifier,total,expected,luck,chaos,streak,seed";
		const rows = history.map((r) => {
			return [
				new Date(r.at).toISOString(),
				r.notation,
				signedFaces(r, null),
				signedFaces(r, true),
				signedFaces(r, false),
				r.modifier,
				r.total,
				r.expected.toFixed(3),
				r.luck,
				r.chaos,
				r.streak,
				r.seedUsed ?? ""
			].map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(",");
		});
		const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "alea-rolls.csv";
		a.click();
		URL.revokeObjectURL(url);
		toast("Exported roll table");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "rounded-xl",
		role: "region",
		"aria-labelledby": "results-heading",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					id: "results-heading",
					className: "text-sm text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "Results" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "mt-1",
					children: history.length === 0 ? "Each die lands in this table after a roll. Dropped dice stay visible, faded." : `${history.length} roll${history.length === 1 ? "" : "s"} this session`
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 gap-1 self-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					disabled: history.length === 0,
					title: "Download this table as a CSV spreadsheet",
					"aria-label": "Export roll history as CSV",
					onClick: exportCsv,
					children: "Export"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					disabled: history.length === 0,
					title: "Wipe this session’s rolls from this device",
					"aria-label": "Clear roll history from this device",
					onClick: clearHistory,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { "aria-hidden": "true" }), "Clear"]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "px-0 pb-2",
			children: history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-5 pb-4 text-sm text-subtle",
				role: "status",
				children: "Roll to fill the table. Dropped dice stay visible, faded as discarded."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "md:hidden",
				"data-testid": "roll-cards",
				"aria-label": `Roll history. ${history.length} roll${history.length === 1 ? "" : "s"} this session.`,
				children: history.map((roll) => {
					const delta = roll.total - roll.expected;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: cn("border-b border-border/80 px-5 py-4 last:border-b-0", roll.id === lastId && "bg-elevated/40"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							"aria-labelledby": `roll-card-${roll.id}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											id: `roll-card-${roll.id}`,
											className: "break-all font-mono text-sm text-foreground",
											children: roll.notation
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 font-mono text-xs tabular-nums text-muted-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
												dateTime: new Date(roll.at).toISOString(),
												children: timeLabel(roll.at)
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-display text-2xl tabular-nums leading-none text-foreground",
										children: [roll.total, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "sr-only",
											children: " total"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-3 flex flex-col gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-xs text-subtle",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "Each die" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiceList, { roll }) })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-baseline justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-xs text-subtle",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "Modifier" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
												className: "font-mono text-xs tabular-nums text-muted-foreground",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModifierValue, { roll })
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-baseline justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-xs text-subtle",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "vs expected" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
												className: cn("font-mono text-xs tabular-nums", delta >= 0 ? "text-max" : "text-crit"),
												children: [
													delta >= 0 ? "+" : "",
													delta.toFixed(1),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "sr-only",
														children: " versus expected"
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-baseline justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-xs text-subtle",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "Factors" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorList, { roll }) })]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RollActions, {
										roll,
										rolling
									})
								})
							]
						})
					}, roll.id);
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden max-w-full overflow-x-auto md:block",
				"data-testid": "roll-table",
				tabIndex: 0,
				role: "region",
				"aria-label": "Roll history table. Scroll sideways for every column.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "data-table",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("caption", {
							className: "sr-only",
							children: [
								"Roll history. ",
								history.length,
								" roll",
								history.length === 1 ? "" : "s",
								" this session."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-y border-border text-xs text-subtle",
							children: [COLUMNS.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
								scope: "col",
								className: "px-3 py-2 font-medium first:px-5",
								title: col.hint,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: col.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block max-w-36 font-normal normal-case tracking-normal text-subtle",
									children: col.hint
								})]
							}, col.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
								scope: "col",
								className: "px-5 py-2 font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "Actions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block font-normal normal-case tracking-normal text-subtle",
									children: "Copy or reroll this row"
								})]
							})]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: history.map((roll) => {
							const delta = roll.total - roll.expected;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: cn("border-b border-border/80 align-top", roll.id === lastId && "bg-elevated/40"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "whitespace-nowrap px-5 py-3 font-mono text-xs tabular-nums text-muted-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
											dateTime: new Date(roll.at).toISOString(),
											children: timeLabel(roll.at)
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										scope: "row",
										className: "px-3 py-3 text-left font-mono text-xs font-normal text-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "break-all",
											children: roll.notation
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiceList, { roll })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 font-mono text-xs tabular-nums text-muted-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModifierValue, { roll })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 font-display text-xl tabular-nums leading-none text-foreground",
										children: roll.total
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: cn("px-3 py-3 font-mono text-xs tabular-nums", delta >= 0 ? "text-max" : "text-crit"),
										children: [
											delta >= 0 ? "+" : "",
											delta.toFixed(1),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "sr-only",
												children: " versus expected"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorList, { roll })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RollActions, {
											roll,
											rolling
										})
									})
								]
							}, roll.id);
						}) })
					]
				})
			})] })
		})]
	});
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	suppressHydrationWarning: true,
	className: cn("flex h-11 w-full min-w-0 rounded-md border border-border bg-elevated px-3 text-base text-foreground shadow-none transition-[border-color,box-shadow] duration-150 placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40", className),
	ref,
	...props
}));
Input.displayName = "Input";
var Switch = import_react.forwardRef(({ className, checked = false, onCheckedChange, disabled, id, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
	ref,
	id,
	type: "button",
	role: "switch",
	"aria-checked": checked,
	disabled,
	onClick: () => onCheckedChange?.(!checked),
	className: cn("inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-border transition-[background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40", checked ? "bg-primary" : "bg-elevated", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"aria-hidden": "true",
		className: cn("block size-4 rounded-full bg-foreground shadow-sm transition-transform duration-150", checked ? "translate-x-4 bg-primary-foreground" : "translate-x-0.5")
	})
}));
Switch.displayName = "Switch";
function isTypingTarget(target) {
	if (typeof HTMLElement === "undefined") return false;
	if (!(target instanceof HTMLElement)) return false;
	if (target.closest("input, textarea, select, [contenteditable='true']")) return true;
	if (target.closest("a, [href], button, [role='button'], [role='switch'], [role='slider'], [role='link'], [role='radio'], [role='tab'], [role='menuitem'], [role='option'], [role='combobox'], [role='spinbutton']")) return true;
	return false;
}
function onRadioGroupKeyDown(event) {
	if (event.key !== "ArrowRight" && event.key !== "ArrowDown" && event.key !== "ArrowLeft" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
	const current = event.currentTarget;
	if (!(current instanceof HTMLElement)) return;
	const group = current.closest("[role='radiogroup']");
	if (!group) return;
	const radios = [...group.querySelectorAll("[role='radio']:not(:disabled)")];
	if (radios.length === 0) return;
	const i = radios.indexOf(current);
	const index = i < 0 ? 0 : i;
	event.preventDefault();
	let next = index;
	if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % radios.length;
	else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + radios.length) % radios.length;
	else if (event.key === "Home") next = 0;
	else if (event.key === "End") next = radios.length - 1;
	const target = radios[next];
	if (!target) return;
	target.focus();
	target.click();
}
var KEEP_MODES = [
	{
		mode: "none",
		label: "Keep all",
		hint: "Count every die toward the total."
	},
	{
		mode: "highest",
		label: "High",
		hint: "Keep the highest dice. Advantage is two d20s, keep 1 high."
	},
	{
		mode: "lowest",
		label: "Low",
		hint: "Keep the lowest dice. Disadvantage is two d20s, keep 1 low."
	}
];
function RollPanel() {
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
	const chipSelected = DIE_SIDES.includes(pool.sides);
	let explodingHint;
	if (poolLocked && !live.valid) explodingHint = "Exploding waits for a valid pool. A bang after a die in the notation turns it on.";
	else if (compound) {
		if (explodingCount === 0) explodingHint = "No bangs in this mixed pool — exploding is off for every die. The switch is locked to the notation.";
		else if (explodingCount === diceTermCount) explodingHint = "Every die in this mixed pool explodes (bang after each). The switch is locked to the notation.";
		else explodingHint = `${explodingCount} of ${diceTermCount} dice explode (bang after that die). The switch is locked to the notation.`;
	} else explodingHint = "If a die lands on its highest face, roll it again and add that roll. On a d6, a 6 explodes into another d6. Typing a new expression without ! turns this off.";
	const notationDescribedBy = [
		"notation-hint",
		!live.valid ? "pool-live-detail" : null,
		error ? "notation-error" : null
	].filter(Boolean).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "rounded-xl",
		role: "region",
		"aria-labelledby": "pool-heading",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "border-b border-border bg-card pb-3 lg:sticky lg:top-0 lg:z-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					id: "pool-heading",
					className: "text-sm text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "Pool" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "The dice you will cast. A pool is one expression, like 2d6+3." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-testid": "pool-live",
					role: "region",
					"aria-label": "Current pool",
					className: "mt-2 rounded-md border border-border bg-elevated px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "break-all font-mono text-sm text-foreground",
						children: live.headline
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						id: "pool-live-detail",
						className: cn("mt-0.5 text-xs leading-snug", live.valid ? "text-muted-foreground" : "text-crit"),
						children: live.detail
					})]
				}),
				poolNotice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-testid": "pool-notice",
					role: "status",
					"aria-live": "polite",
					className: "mt-2 text-xs leading-snug text-foreground",
					children: poolNotice
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "pt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-4",
				"aria-label": "Dice pool",
				onSubmit: (event) => {
					event.preventDefault();
					if (!rolling && live.valid) roll();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldMeta, {
								htmlFor: "notation",
								hintId: "notation-hint",
								label: "Notation",
								hint: "Written form of the pool. 2d6+3 is two six-sided dice plus 3. kh keeps high; kl keeps low."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "notation",
								value: notation,
								spellCheck: false,
								autoCapitalize: "off",
								autoComplete: "off",
								placeholder: "2d6+3 or 4d6kh3",
								className: "font-mono",
								onChange: (e) => setNotation(e.target.value),
								"aria-invalid": !live.valid || Boolean(error),
								"aria-describedby": notationDescribedBy,
								"aria-errormessage": !live.valid ? "pool-live-detail" : error ? "notation-error" : void 0
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								id: "notation-error",
								role: "alert",
								className: "text-xs text-crit",
								children: error
							}) : null,
							!live.valid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Steppers wait for a valid pool. A die chip starts a fresh 1dN from that size; Repeat is kept."
							}) : compound ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Compound pool — more than one die type, so the steppers lock and show a dash. Repeat still applies. A die chip starts a fresh 1dN from that size; Repeat is kept."
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldMeta, {
							labelId: "die-label",
							hintId: "die-hint",
							label: "Die",
							hint: poolLocked ? "Starts a new simple pool of this die. Keep, exploding, and modifier reset; Repeat stays." : "Faces on each die in a simple pool. A d20 shows 1 through 20."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							role: poolLocked ? "group" : "radiogroup",
							"aria-labelledby": "die-label",
							"aria-describedby": "die-hint",
							className: "flex flex-wrap gap-1.5",
							children: DIE_SIDES.map((sides, index) => {
								const selected = pool.sides === sides && !poolLocked;
								const tabStop = poolLocked ? 0 : chipSelected ? selected ? 0 : -1 : index === 0 ? 0 : -1;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									role: poolLocked ? void 0 : "radio",
									title: poolLocked ? `Start a simple d${sides} pool` : `d${sides} — a die with ${sides} faces`,
									"aria-label": poolLocked ? `Start a simple d${sides} pool` : `d${sides}, a die with ${sides} faces`,
									"aria-pressed": poolLocked ? false : void 0,
									"aria-checked": poolLocked ? void 0 : selected,
									tabIndex: tabStop,
									onKeyDown: poolLocked ? void 0 : onRadioGroupKeyDown,
									onClick: () => {
										if (poolLocked) patchPool({
											count: 1,
											sides,
											modifier: 0,
											keepMode: "none",
											exploding: false
										});
										else patchPool({ sides });
									},
									className: cn(FOCUS_RING, "h-11 min-w-11 rounded-md border px-2.5 font-mono text-sm tabular-nums transition-[background-color,border-color,color] duration-150", selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-elevated text-muted-foreground hover:text-foreground"),
									children: ["d", sides]
								}, sides);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
								label: "Dice",
								hint: "How many dice to throw together. Dropping to 1 turns Keep High/Low off.",
								value: pool.count,
								min: 1,
								max: 100,
								disabled: poolLocked,
								display: poolLocked ? "—" : void 0,
								onStep: (d) => patchPool({ count: useDiceStore.getState().pool.count + d })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
								label: "Sides",
								hint: "Faces on each die.",
								value: pool.sides,
								min: 2,
								max: DIE_SIDES_MAX,
								disabled: poolLocked,
								display: poolLocked ? "—" : void 0,
								onStep: (d) => patchPool({ sides: useDiceStore.getState().pool.sides + d })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
								label: "Modifier",
								hint: "Flat bonus or penalty added after the dice land.",
								value: pool.modifier,
								min: -99,
								max: 99,
								signed: true,
								disabled: poolLocked,
								display: poolLocked ? "—" : void 0,
								onStep: (d) => patchPool({ modifier: useDiceStore.getState().pool.modifier + d })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
								label: "Repeat",
								hint: "Casts in one click. Stats uses 6. Independent of notation. The batch uses streak from before the click, so the six scores don't feed each other.",
								value: pool.repeat,
								min: 1,
								max: 20,
								onStep: (d) => patchPool({ repeat: useDiceStore.getState().pool.repeat + d })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldMeta, {
							labelId: "keep-label",
							hintId: "keep-hint",
							label: "Keep",
							hint: poolLocked ? "Keep follows the notation on a mixed or invalid pool — the buttons lock." : pool.count < 2 ? "High and Low need two or more dice — they stay on Keep all for a single die." : "After the roll, drop some dice. High keeps the best (advantage). Low keeps the worst (disadvantage)."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								role: "radiogroup",
								"aria-labelledby": "keep-label",
								"aria-describedby": "keep-hint",
								className: "flex w-full items-center gap-1 rounded-lg border border-border bg-elevated p-1 sm:w-auto",
								children: KEEP_MODES.map(({ mode, label, hint }) => {
									const blocked = poolLocked || mode !== "none" && pool.count < 2;
									const selected = pool.keepMode === mode && !poolLocked;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										role: "radio",
										title: hint,
										"aria-label": `${label}. ${hint}`,
										"aria-checked": selected,
										tabIndex: blocked ? -1 : selected ? 0 : -1,
										disabled: blocked,
										onKeyDown: onRadioGroupKeyDown,
										onClick: () => patchPool({ keepMode: mode }),
										className: cn(FOCUS_RING, "h-11 flex-1 rounded-md px-3 text-xs font-medium transition-[background-color,color,opacity] duration-150 disabled:opacity-40 sm:flex-none", selected ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
										children: label
									}, mode);
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
								label: "How many",
								hint: "How many dice still count toward the total when High or Low is on.",
								value: pool.keepN,
								min: 1,
								max: Math.max(1, pool.count - 1),
								disabled: keepNDisabled,
								display: poolLocked ? "—" : void 0,
								onStep: (d) => patchPool({ keepN: useDiceStore.getState().pool.keepN + d })
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							id: "exploding",
							className: "mt-0.5",
							checked: poolLocked ? anyExploding : pool.exploding,
							disabled: poolLocked,
							title: "When a die shows its highest face, roll it again and add that roll",
							"aria-describedby": "exploding-hint",
							onCheckedChange: (exploding) => patchPool({ exploding })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldMeta, {
							htmlFor: "exploding",
							hintId: "exploding-hint",
							label: "Exploding",
							hint: explodingHint
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldMeta, {
							labelId: "presets-label",
							hintId: "presets-hint",
							label: "Presets",
							hint: "Ready-made pools. Adv is advantage (2d20, keep the higher). Dis is disadvantage (keep the lower). Stats is six ability scores. Each preset also sets Repeat."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							role: "group",
							"aria-labelledby": "presets-label",
							"aria-describedby": "presets-hint",
							className: "flex flex-wrap gap-1.5",
							children: PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								title: preset.hint,
								"aria-label": `${preset.label}. ${preset.hint}`,
								onClick: () => applyPreset(preset.notation, preset.repeat),
								className: cn(FOCUS_RING, "h-11 rounded-full border border-border px-2.5 text-xs text-muted-foreground transition-[background-color,color] duration-150 hover:bg-elevated hover:text-foreground"),
								children: preset.label
							}, preset.label))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								size: "lg",
								disabled: !live.valid,
								title: "Cast the current pool",
								"aria-label": !live.valid ? "Roll, waits for a valid pool" : void 0,
								"aria-keyshortcuts": "Space",
								"aria-describedby": "roll-hint",
								"aria-busy": rolling,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dices, { "aria-hidden": "true" }),
									"Roll",
									pool.repeat > 1 ? ` ×${pool.repeat}` : ""
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								id: "roll-hint",
								className: "text-xs leading-snug text-subtle",
								children: "Casts the pool shown above. Spacebar does the same, except in a text field."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "secondary",
									size: "lg",
									title: "Cast the last result’s expression once with the current luck, chaos, streak, and seed. Does not change this pool.",
									"aria-label": "Reroll the last result with current factors",
									disabled: !last,
									"aria-busy": rolling,
									onClick: () => reroll(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { "aria-hidden": "true" }), "Reroll"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "secondary",
									size: "lg",
									title: "Copy the last result as text",
									"aria-label": "Copy the last result as text",
									disabled: !last,
									onClick: async () => {
										if (!last) return;
										const ok = await copyText(formatRollLine(last));
										toast(ok ? "Copied last result" : "Couldn’t copy");
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { "aria-hidden": "true" }), "Copy"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs leading-snug text-subtle",
								children: "Reroll casts that row’s expression once with the current luck, chaos, streak, and seed, and leaves this pool as you set it. Copy puts that line on the clipboard."
							})
						]
					})
				]
			})
		})]
	});
}
var Slider = import_react.forwardRef(({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	ref,
	type: "range",
	min,
	max,
	step,
	value: value[0] ?? min,
	suppressHydrationWarning: true,
	onChange: (e) => onValueChange([Number(e.target.value)]),
	className: cn("alea-slider w-full", className),
	...props
}));
Slider.displayName = "Slider";
function labStatusText(luck, chaos, streak, bias, historyLength, seedLocked = false) {
	if (luckLoaded(luck) || chaosLoaded(chaos) || Math.abs(bias) >= .01) return "This table is loaded. Fair is chaos 50 with luck and streak at 0.";
	if (streakLoaded(streak) && historyLength === 0) return "Streak waits for prior rolls before it can tilt the curve.";
	if (streakLoaded(streak) && historyLength > 0) return "Streak is armed, but recent totals sit near expected so it is not tilting yet.";
	if (seedLocked) return "Uniform — a mathematically fair curve, replayed from the seed.";
	return "Uniform and independent — a mathematically fair table.";
}
function FactorRow({ id, label, hint, value, display, valuetext, min, max, step, left, right, onChange }) {
	const hintId = `${id}-hint`;
	const valueId = `${id}-value`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldMeta, {
						htmlFor: id,
						label,
						hint,
						hintId
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					id: valueId,
					className: "shrink-0 font-mono text-xs tabular-nums text-muted-foreground",
					children: display
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				id,
				min,
				max,
				step,
				value: [value],
				onValueChange: (v) => onChange(v[0] ?? value),
				"aria-label": label,
				"aria-valuetext": valuetext,
				"aria-describedby": `${hintId} ${valueId}`,
				title: hint
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between text-xs uppercase tracking-wider text-subtle",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: left }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: right })]
			})
		]
	});
}
function RandomnessLab() {
	const randomness = useDiceStore((s) => s.randomness);
	const history = useDiceStore((s) => s.history);
	const notation = useDiceStore((s) => s.notation);
	const patchRandomness = useDiceStore((s) => s.patchRandomness);
	const resetRandomness = useDiceStore((s) => s.resetRandomness);
	const rngNotice = useDiceStore((s) => s.rngNotice);
	const parsed = (0, import_react.useMemo)(() => {
		try {
			return parseNotation(notation);
		} catch {
			return null;
		}
	}, [notation]);
	const sides = parsed ? primarySides(parsed) : null;
	const bias = streakBiasFrom(history, randomness.streak);
	const series = (0, import_react.useMemo)(() => sides ? distributionSeries(sides, randomness.luck, randomness.chaos, bias) : [], [
		sides,
		randomness.luck,
		randomness.chaos,
		bias
	]);
	const mean = sides ? expectedFace(faceWeights(sides, randomness.luck, randomness.chaos, bias)) : null;
	const fair = sides ? (sides + 1) / 2 : null;
	const showPoolExpected = parsed ? totalDiffersFromPrimaryFace(parsed) : false;
	const poolExpected = (0, import_react.useMemo)(() => {
		if (!showPoolExpected || !parsed) return null;
		return estimateExpected(parsed, randomness.luck, randomness.chaos, bias, EXPECTED_SAMPLES);
	}, [
		showPoolExpected,
		parsed,
		randomness.luck,
		randomness.chaos,
		bias
	]);
	const status = labStatusText(randomness.luck, randomness.chaos, randomness.streak, bias, history.length, randomness.seedLocked);
	const ticks = sides ? chartTicks(sides) : void 0;
	const luckDisplay = `${randomness.luck > 0 ? "+" : ""}${Math.round(randomness.luck * 100)}`;
	const chaosDisplay = `${Math.round(randomness.chaos * 100)}`;
	const streakDisplay = `${randomness.streak > 0 ? "+" : ""}${Math.round(randomness.streak * 100)}`;
	const curveSummary = sides && mean !== null && fair !== null && series.length > 0 ? [
		`Odds for a d${sides}. Expected face ${mean.toFixed(2)}, fair ${fair.toFixed(1)}.`,
		`Face 1 is ${((series[0]?.p ?? 0) * 100).toFixed(1)} percent.`,
		`Face ${sides} is ${((series[series.length - 1]?.p ?? 0) * 100).toFixed(1)} percent.`,
		showPoolExpected && poolExpected !== null ? `Pool expected total ${poolExpected.toFixed(2)}.` : ""
	].filter(Boolean).join(" ") : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "rounded-xl",
		role: "region",
		"aria-labelledby": "randomness-heading",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-col items-stretch gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-col gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					id: "randomness-heading",
					className: "text-sm text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpokenLabel, { children: "Randomness" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Load the table or keep it fair. Fair resets luck, chaos, and streak; the seed is kept." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				className: "self-start",
				title: "Reset luck, chaos, and streak. The seed is kept.",
				"aria-label": "Reset luck, chaos, and streak to fair. The seed is kept.",
				onClick: resetRandomness,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { "aria-hidden": "true" }), "Fair"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex flex-col gap-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorRow, {
					id: "factor-luck",
					label: "Luck",
					hint: "Bias toward low or high faces. At +100 a d20 averages about 16 instead of 10.5.",
					value: Math.round(randomness.luck * 100),
					display: luckDisplay,
					valuetext: `Luck ${luckDisplay}`,
					min: -100,
					max: 100,
					step: 1,
					left: "Unlucky",
					right: "Lucky",
					onChange: (n) => patchRandomness({ luck: n / 100 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorRow, {
					id: "factor-chaos",
					label: "Chaos",
					hint: "50 is even odds. Lower bunches near the middle. Higher makes crits and fumbles more common.",
					value: Math.round(randomness.chaos * 100),
					display: chaosDisplay,
					valuetext: `Chaos ${chaosDisplay}`,
					min: 0,
					max: 100,
					step: 1,
					left: "Focused",
					right: "Wild",
					onChange: (n) => patchRandomness({ chaos: n / 100 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorRow, {
					id: "factor-streak",
					label: "Streak",
					hint: "Reads recent rolls. Momentum keeps a hot streak hot. Revert makes the next rolls go cold. A Repeat batch uses the streak from before the click, so the scores don't feed each other.",
					value: Math.round(randomness.streak * 100),
					display: streakDisplay,
					valuetext: `Streak ${streakDisplay}`,
					min: -100,
					max: 100,
					step: 1,
					left: "Revert",
					right: "Momentum",
					onChange: (n) => patchRandomness({ streak: n / 100 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [sides && mean !== null && fair !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex min-w-0 items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldMeta, {
								label: `d${sides} curve`,
								hint: "Odds of each face on this die. Pool E is the average total the table will compare against — keep, explode, and extra dice are included."
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"aria-hidden": "true",
								children: [
									"E[",
									mean.toFixed(2),
									"]",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mx-1 text-subtle",
										children: "vs"
									}),
									fair.toFixed(1),
									showPoolExpected && poolExpected !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-0.5 block text-subtle",
										children: [
											"pool E[",
											poolExpected.toFixed(2),
											"]"
										]
									}) : null
								]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-24 w-full min-w-0 overflow-hidden",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: series,
								margin: {
									top: 4,
									right: 0,
									left: 0,
									bottom: 0
								},
								barCategoryGap: sides > 20 ? 0 : 2,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "face",
									tickLine: false,
									axisLine: false,
									ticks,
									interval: 0,
									tick: {
										fill: "var(--color-subtle)",
										fontSize: 10,
										fontFamily: "IBM Plex Mono, ui-monospace, monospace"
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "p",
									radius: [
										2,
										2,
										0,
										0
									],
									children: series.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
										fill: entry.face === 1 ? "var(--color-crit)" : entry.face === sides ? "var(--color-max)" : "var(--color-primary)",
										fillOpacity: .75
									}, entry.face))
								})]
							})
						})
					}),
					curveSummary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "sr-only",
						children: curveSummary
					}) : null
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-testid": "lab-curve-wait",
					className: "text-xs leading-snug text-muted-foreground",
					children: "Curve waits for a valid pool."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-testid": "lab-status",
					role: "status",
					className: cn("mt-1 text-xs text-muted-foreground", status.startsWith("Uniform") && "text-subtle"),
					children: status
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-w-0 flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldMeta, {
									htmlFor: "seed",
									hintId: "seed-hint",
									label: "Seed",
									hint: "Optional phrase that can replay the same sequence of faces. Editing it restarts the sequence from the beginning."
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex shrink-0 items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "seed-lock",
									className: "text-xs font-medium tracking-wide text-muted-foreground",
									children: "Lock"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									id: "seed-lock",
									checked: randomness.seedLocked,
									title: "When on, rolls follow this seed instead of true random",
									"aria-describedby": "seed-lock-hint",
									onCheckedChange: (seedLocked) => {
										if (seedLocked && !randomness.seed.trim()) {
											toast("Enter a seed first");
											return;
										}
										patchRandomness({ seedLocked });
									}
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							id: "seed-lock-hint",
							className: "text-xs leading-snug text-subtle",
							children: "On: follow this seed. Off: true random."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "seed",
							value: randomness.seed,
							placeholder: "Optional — lock to replay a sequence",
							spellCheck: false,
							autoComplete: "off",
							autoCapitalize: "off",
							className: "font-mono",
							"aria-describedby": "seed-hint seed-stream",
							onChange: (e) => patchRandomness({
								seed: e.target.value,
								streamIndex: 0
							})
						}),
						rngNotice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							id: "seed-stream",
							"data-testid": "rng-notice",
							role: "status",
							"aria-live": "polite",
							className: "text-xs leading-snug text-foreground",
							children: rngNotice
						}) : randomness.seedLocked && randomness.seed.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							id: "seed-stream",
							className: "text-xs text-muted-foreground",
							children: [
								"Stream ",
								randomness.streamIndex,
								" · same seed and factors replay the same faces"
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							id: "seed-stream",
							className: "text-xs text-subtle",
							children: "Unlocked uses the browser’s cryptographic RNG — true random, not repeatable."
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { formatPool as A, onRadioGroupKeyDown as B, effectiveBias as C, evaluateExpression as D, estimateExpected as E, keepLabel as F, rollFactorFlags as G, poolFromExpression as H, labStatusText as I, streakLoaded as J, sampleWeighted as K, luckLoaded as L, hashSeed as M, isCompoundExpression as N, expectedFace as O, isTypingTarget as P, makeRoll as R, distributionSeries as S, effectiveLuck as T, primarySides as U, parseNotation as V, rngFor as W, useDiceStore as X, totalDiffersFromPrimaryFace as Y, chaosLoaded as _, DieFace as a, cryptoRng as b, PRESETS as c, RollPanel as d, Slider as f, appliedStreak as g, Switch as h, DiceTray as i, formatRollLine as j, faceWeights as k, RandomnessLab as l, Stepper as m, Button as n, Input as o, StatsStrip as p, streakBiasFrom as q, DIE_SIDES as r, NotationError as s, Badge as t, ResultsTable as u, chartTicks as v, effectiveChaos as w, describeCast as x, clamp as y, mulberry32 as z };
