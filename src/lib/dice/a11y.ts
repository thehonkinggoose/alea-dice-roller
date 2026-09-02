import type { DieFace, RollRecord } from "@/lib/dice/types";

export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function describeDie(die: DieFace): string {
  const negative = (die.sign ?? 1) < 0;
  const bits = [`${negative ? "minus " : ""}d${die.sides} showing ${die.face}`];
  if (die.exploded) bits.push("exploded");
  if (!die.kept) bits.push("dropped, not counted");
  return bits.join(", ");
}

export function describeDieTitle(die: DieFace): string {
  const isPositive = (die.sign ?? 1) > 0;
  const sign = isPositive ? "" : "−";
  const natNote =
    die.kept && die.sides === 20 && isPositive
      ? die.face === 20
        ? " (Natural 20!)"
        : die.face === 1 && !die.exploded
          ? " (Natural 1!)"
          : ""
      : "";
  return `${sign}d${die.sides}: ${sign}${die.face}${die.exploded ? " (explode)" : ""}${die.kept ? "" : " dropped"}${natNote}`;
}

export function slugLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Format clear, unambiguous acoustic roll summary for JAWS and VoiceOver polite live regions. */
export function describeRollAnnouncement(
  roll: RollRecord | null,
  rollIndex?: number,
  batch?: RollRecord[] | null,
): string {
  if (!roll) return "";
  const rawDelta = roll.total - roll.expected;
  const delta = Math.abs(rawDelta) < 0.05 ? 0 : rawDelta;
  const deltaText = `${delta >= 0 ? "plus" : "minus"} ${Math.abs(delta).toFixed(1)} versus expected`;

  const highlights: string[] = [];
  const nat20 = roll.dice.some((d) => d.sides === 20 && d.face === 20 && d.kept && (d.sign ?? 1) > 0);
  const nat1 = roll.dice.some((d) => d.sides === 20 && d.face === 1 && d.kept && !d.exploded && (d.sign ?? 1) > 0);
  const anyExploded = roll.dice.some((d) => d.kept && d.exploded);

  if (nat20) highlights.push("Natural 20!");
  if (nat1) highlights.push("Natural 1!");
  if (anyExploded) highlights.push("Exploded!");

  const highlightNotice = highlights.length > 0 ? ` ${highlights.join(" ")}` : "";

  if (batch && batch.length > 1) {
    const totals = batch.map((r) => r.total).join(", ");
    return `Batch of ${batch.length} rolls: totals ${totals}. Last roll: Total ${roll.total} from ${roll.notation}.${highlightNotice} Expected ${roll.expected.toFixed(1)}, ${deltaText}.`;
  }

  const rollPrefix = rollIndex ? `Roll ${rollIndex}: ` : "";
  return `${rollPrefix}Total ${roll.total} from ${roll.notation}.${highlightNotice} Expected ${roll.expected.toFixed(1)}, ${deltaText}.`;
}
