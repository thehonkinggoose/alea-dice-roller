import {
  NotationError,
  clamp,
  describeCast,
  formatPool,
  isCompoundExpression,
  keepLabel,
  parseNotation,
  poolFromExpression,
  totalDiffersFromPrimaryFace,
} from "@/lib/dice/notation";
import type { TestDef } from "@/lib/test/harness";

function diceTerm(parsed: ReturnType<typeof parseNotation>, index = 0) {
  const term = parsed.terms.filter((t) => t.kind === "dice")[index];
  if (!term || term.kind !== "dice") throw new Error(`no dice term at ${index}`);
  return term.term;
}

export const notationCases: TestDef[] = [
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
      t.eq(diceTerm(parsed).keep, { mode: "none", n: 1 }, "keep all");
      t.eq(parsed.modifier, 0, "no modifier");
    },
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
    },
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
    },
  },
  {
    id: "notation-unicode-minus",
    suite: "Notation",
    name: "Unicode minuses paste as subtraction",
    description: "Minus (U+2212), en-dash, and em-dash are normalized to ASCII hyphen-minus before parsing, so copied results paste back into the field.",
    why: "The roll line uses a typographic minus. If paste failed, the copy button would be a trap.",
    run: (t) => {
      for (const input of ["2d6−1d4", "2d6–1d4", "2d6—1d4"]) {
        const parsed = parseNotation(input);
        t.eq(diceTerm(parsed, 1).sign, -1, `${input} d4 sign`);
      }
      t.note("samples", ["2d6−1d4", "2d6–1d4", "2d6—1d4"]);
    },
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
      t.eq(adv.keep, { mode: "highest", n: 1 }, "advantage");
      t.eq(dis.keep, { mode: "lowest", n: 1 }, "disadvantage");
      t.eq(stats.keep, { mode: "highest", n: 3 }, "4d6dl1 → keep 3 high");
      t.eq(dropHigh.keep, { mode: "lowest", n: 3 }, "4d6dh1 → keep 3 low");
      t.eq(short.keep, { mode: "highest", n: 1 }, "k1 shorthand");
    },
  },
  {
    id: "notation-keep-clamps",
    suite: "Notation",
    name: "Keep n never exceeds the pool and never drops to zero",
    description: "`2d6kh9` clamps to keep 2. `4d6dl5` drops 5 of 4, which would empty the pool, so n stays at least 1.",
    why: "A keep of 0 would discard every face and print a total of 0 — a silent scoring failure.",
    run: (t) => {
      t.eq(diceTerm(parseNotation("2d6kh9")).keep.n, 2, "kh9 clamps to count");
      t.eq(diceTerm(parseNotation("4d6dl5")).keep, { mode: "highest", n: 1 }, "over-drop keeps 1");
      t.eq(diceTerm(parseNotation("2d6kl0")).keep.n, 1, "kl0 treated as 1");
      t.eq(diceTerm(parseNotation("4d6dl0")).keep, { mode: "none", n: 4 }, "dl0 drops nothing, keeps all");
      t.eq(diceTerm(parseNotation("4d6dh0")).keep, { mode: "none", n: 4 }, "dh0 drops nothing, keeps all");
    },
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
    },
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
    },
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
    },
  },
  {
    id: "notation-format-pool",
    suite: "Notation",
    name: "formatPool writes the canonical simple expression",
    description: "Count, sides, keep, bang, and signed modifier serialize in that order. Zero modifier is omitted. Negative modifier keeps its sign.",
    why: "Every stepper click rewrites the notation field from this function. A wrong order would no longer parse.",
    run: (t) => {
      t.eq(formatPool({ count: 1, sides: 20, keepMode: "none", keepN: 1, exploding: false, modifier: 0, repeat: 1 }), "1d20", "plain");
      t.eq(formatPool({ count: 2, sides: 20, keepMode: "highest", keepN: 1, exploding: false, modifier: 0, repeat: 1 }), "2d20kh1", "adv");
      t.eq(formatPool({ count: 2, sides: 20, keepMode: "lowest", keepN: 1, exploding: false, modifier: 0, repeat: 1 }), "2d20kl1", "dis");
      t.eq(formatPool({ count: 2, sides: 6, keepMode: "highest", keepN: 1, exploding: true, modifier: 2, repeat: 1 }), "2d6kh1!+2", "kitchen sink");
      t.eq(formatPool({ count: 3, sides: 6, keepMode: "none", keepN: 2, exploding: false, modifier: -2, repeat: 1 }), "3d6-2", "negative mod");
    },
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
    },
  },
  {
    id: "notation-keep-label-and-clamp",
    suite: "Notation",
    name: "keepLabel and clamp are the display and bound helpers",
    description: "keepLabel is null for keep-all, otherwise `keep n high/low`. clamp pins a number into [min, max].",
    why: "Luck, chaos, streak, and hydrated garbage all flow through clamp. A NaN leak would tilt every subsequent roll.",
    run: (t) => {
      t.eq(keepLabel({ count: 2, sides: 20, keep: { mode: "none", n: 2 }, exploding: false, sign: 1 }), null, "none");
      t.eq(keepLabel({ count: 2, sides: 20, keep: { mode: "highest", n: 1 }, exploding: false, sign: 1 }), "keep 1 high", "high");
      t.eq(keepLabel({ count: 2, sides: 20, keep: { mode: "lowest", n: 1 }, exploding: false, sign: 1 }), "keep 1 low", "low");
      t.eq(keepLabel({ count: 2, sides: 20, keep: { mode: "highest", n: 2 }, exploding: false, sign: 1 }), null, "keep-all");
      t.eq(clamp(3, 0, 1), 1, "above");
      t.eq(clamp(-2, 0, 1), 0, "below");
      t.eq(clamp(0.4, 0, 1), 0.4, "inside");
    },
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
      t.eq(formatPool({ count: 8, sides: 6, keepMode: "none", keepN: 1, exploding: true, modifier: 0, repeat: 1 }), "8d6!", "format explode only");
      t.throws(() => parseNotation("2d6!kh1"), "Could not parse", "bang before keep");
      t.throws(() => parseNotation("2d6k"), "Could not parse", "k without digits");
    },
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
      t.eq(diceTerm(parseNotation("1d20kh1")).keep, { mode: "highest", n: 1 }, "parser allows kh1 on one die");
      t.eq(poolFromExpression(parseNotation("1d20kh1"))?.keepMode, "none", "maps keep-all on one die");
    },
  },
  {
    id: "notation-bounds-and-aliases",
    suite: "Notation",
    name: "Count 100, a d1000, dF, and leftover junk hit the exact edges",
    description: "100d6 and 1d1000 are legal. 101d6 and 1d1001 are not. `dF` lowercases to fudge (3 faces). `2d6foo` leftover and `2d6-` trailing minus fail with the leftover snippet.",
    why: "The bounds are the only thing between a 10,000-die paste and a locked tab. Alias coverage is how percentile and FATE players arrive.",
    run: (t) => {
      t.eq(diceTerm(parseNotation("100d6")).count, 100, "max count");
      t.eq(diceTerm(parseNotation("1d1000")).sides, 1000, "max sides");
      t.eq(diceTerm(parseNotation("dF")).sides, 3, "FATE alias");
      t.eq(diceTerm(parseNotation("4df")).count, 4, "4dF");
      t.throws(() => parseNotation("2d6foo"), "foo", "leftover snippet");
      t.throws(() => parseNotation("2d6-"), "-", "trailing minus");
      t.eq(parseNotation("2d6+3-1+4").modifier, 6, "three numeric mods");
    },
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
    },
  },
];
