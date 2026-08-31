import type { DieFace } from "@/lib/dice/types";

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
  const sign = (die.sign ?? 1) < 0 ? "−" : "";
  return `${sign}d${die.sides}: ${sign}${die.face}${die.exploded ? " (explode)" : ""}${die.kept ? "" : " dropped"}`;
}

export function slugLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
