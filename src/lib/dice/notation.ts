import type { DiceTerm, ExpressionTerm, ParsedExpression, PoolControls } from "./types";

export class NotationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotationError";
  }
}

export const DICE_COUNT_MAX = 100;
export const DIE_SIDES_MAX = 1000;
export const MODIFIER_ABS_MAX = 99;

const TERM_RE =
  /([+-])(?:(\d*)d(\d+|f|%)((?:kh|kl|dh|dl|k)\d+)?(!)?|(\d+))/gi;

function parseKeep(raw: string | undefined, count: number): DiceTerm["keep"] {
  if (!raw) return { mode: "none", n: count };

  let drop = false;
  let mode: "highest" | "lowest" = "highest";
  let digits: string;

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
  } else {
    return { mode: "none", n: count };
  }

  const n = Math.max(1, Number.parseInt(digits, 10) || 1);
  if (drop) {
    return { mode, n: Math.max(1, count - n) };
  }
  return { mode, n: Math.min(n, count) };
}

function sidesFrom(raw: string): number {
  if (raw === "%" || raw === "100") return 100;
  if (raw === "f") return 3;
  return Number.parseInt(raw, 10);
}

export function parseNotation(input: string): ParsedExpression {
  const compact = input
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, "")
    .toLowerCase();
  if (!compact) throw new NotationError("Enter a dice expression, like 2d6+3.");

  const signed = /^[+-]/.test(compact) ? compact : `+${compact}`;
  const terms: ExpressionTerm[] = [];
  let cursor = 0;
  TERM_RE.lastIndex = 0;

  for (const match of signed.matchAll(TERM_RE)) {
    if (match.index !== cursor) {
      throw new NotationError(`Could not parse “${signed.slice(cursor, match.index) || signed}”.`);
    }
    cursor = (match.index ?? 0) + match[0].length;
    const sign = match[1] === "-" ? -1 : 1;

    if (match[6] !== undefined) {
      terms.push({ kind: "mod", value: sign * Number.parseInt(match[6], 10) });
      continue;
    }

    const count = match[2] === "" || match[2] === undefined ? 1 : Number.parseInt(match[2], 10);
    const sides = sidesFrom(match[3] ?? "6");
    if (!Number.isFinite(count) || count < 1 || count > DICE_COUNT_MAX) {
      throw new NotationError(`Dice count must be between 1 and ${DICE_COUNT_MAX}.`);
    }
    if (!Number.isFinite(sides) || sides < 2 || sides > DIE_SIDES_MAX) {
      throw new NotationError(`Die size must be between 2 and ${DIE_SIDES_MAX}.`);
    }

    terms.push({
      kind: "dice",
      term: {
        count,
        sides,
        keep: parseKeep(match[4], count),
        exploding: match[5] === "!",
        sign,
      },
    });
  }

  if (cursor !== signed.length) {
    throw new NotationError(`Could not parse “${signed.slice(cursor)}”.`);
  }
  if (!terms.some((t) => t.kind === "dice")) {
    throw new NotationError("Add at least one die, like d20 or 4d6.");
  }

  const modifier = terms.reduce((sum, t) => (t.kind === "mod" ? sum + t.value : sum), 0);
  if (Math.abs(modifier) > MODIFIER_ABS_MAX) {
    throw new NotationError(`Modifier must be between −${MODIFIER_ABS_MAX} and ${MODIFIER_ABS_MAX}.`);
  }
  return { raw: compact, terms, modifier };
}

export function formatPool(pool: PoolControls): string {
  let s = `${pool.count}d${pool.sides}`;
  if (pool.keepMode === "highest") s += `kh${pool.keepN}`;
  if (pool.keepMode === "lowest") s += `kl${pool.keepN}`;
  if (pool.exploding) s += "!";
  if (pool.modifier > 0) s += `+${pool.modifier}`;
  if (pool.modifier < 0) s += `${pool.modifier}`;
  return s;
}

export function poolFromExpression(parsed: ParsedExpression): PoolControls | null {
  const diceTerms = parsed.terms.filter(
    (t): t is { kind: "dice"; term: DiceTerm } => t.kind === "dice",
  );
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
    repeat: 1,
  };
}

export function isCompoundExpression(parsed: ParsedExpression): boolean {
  return poolFromExpression(parsed) === null;
}

export function keepLabel(term: DiceTerm): string | null {
  if (term.keep.mode === "none" || term.keep.n >= term.count) return null;
  if (term.keep.mode === "highest") return `keep ${term.keep.n} high`;
  return `keep ${term.keep.n} low`;
}

export function totalDiffersFromPrimaryFace(parsed: ParsedExpression): boolean {
  const diceTerms = parsed.terms.filter(
    (t): t is { kind: "dice"; term: DiceTerm } => t.kind === "dice",
  );
  if (diceTerms.length !== 1) return true;
  const d = diceTerms[0].term;
  if (d.sign < 0 || d.count !== 1 || d.exploding) return true;
  if (parsed.modifier !== 0) return true;
  if (d.keep.mode !== "none" && d.keep.n < d.count && d.count >= 2) return true;
  return false;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function describeCast(
  notation: string,
  repeat: number,
): { headline: string; detail: string; compound: boolean; valid: boolean } {
  try {
    const parsed = parseNotation(notation);
    const compound = isCompoundExpression(parsed);
    const parts: string[] = [];
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
      valid: true,
    };
  } catch (err) {
    return {
      headline: notation.trim() || "—",
      detail: err instanceof Error ? err.message : "Enter a dice expression.",
      compound: false,
      valid: false,
    };
  }
}
