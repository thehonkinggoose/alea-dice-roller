import { Copy, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DieFace } from "@/components/dice/DieFace";
import { SpokenLabel } from "@/components/dice/SpokenLabel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRollLine, rollFactorFlags } from "@/lib/dice/engine";
import { useDiceStore } from "@/lib/dice/store";
import type { RollRecord } from "@/lib/dice/types";
import { cn, copyText } from "@/lib/utils";

function timeLabel(at: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(at);
}

function factorChips(roll: RollRecord) {
  const flags = rollFactorFlags(roll);
  const chips: { key: string; text: string; hint: string }[] = [];
  if (flags.luck) {
    chips.push({
      key: "luck",
      text: `L ${roll.luck > 0 ? "+" : ""}${Math.round(roll.luck * 100)}`,
      hint: "Luck was on for this roll",
    });
  }
  if (flags.chaos) {
    chips.push({
      key: "chaos",
      text: `C ${Math.round(roll.chaos * 100)}`,
      hint: "Chaos was off 50 — the curve was loaded",
    });
  }
  if (flags.streak) {
    chips.push({
      key: "streak",
      text: `S ${roll.streak > 0 ? "+" : ""}${Math.round(roll.streak * 100)}`,
      hint: "Streak used recent rolls to tilt this one",
    });
  }
  if (flags.seed) chips.push({ key: "seed", text: "seed", hint: "This roll used a locked seed" });
  return chips;
}

function signedFaces(roll: RollRecord, keptOnly: boolean | null): string {
  return roll.dice
    .filter((d) => (keptOnly === null ? true : keptOnly ? d.kept : !d.kept))
    .map((d) => `${d.sign < 0 ? "-" : ""}${d.face}`)
    .join(" ");
}

function DiceList({ roll }: { roll: RollRecord }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={`Dice for ${roll.notation}`}>
      {roll.dice.map((die) => (
        <li key={die.id}>
          <DieFace die={die} size="sm" />
        </li>
      ))}
    </ul>
  );
}

function ModifierValue({ roll }: { roll: RollRecord }) {
  if (roll.modifier === 0) return <span aria-label="no modifier">—</span>;
  return <>{roll.modifier > 0 ? `+${roll.modifier}` : String(roll.modifier)}</>;
}

function FactorList({ roll }: { roll: RollRecord }) {
  const chips = factorChips(roll);
  return (
    <div className="flex flex-wrap justify-end gap-1 md:justify-start">
      {chips.length === 0 ? (
        <span className="text-xs text-subtle" title="No luck, chaos, streak, or seed">
          fair
        </span>
      ) : (
        chips.map((c) => (
          <Badge key={c.key} variant="outline" title={c.hint} aria-label={`${c.hint}: ${c.text}`}>
            {c.text}
          </Badge>
        ))
      )}
    </div>
  );
}

function RollActions({ roll, rolling }: { roll: RollRecord; rolling: boolean }) {
  const reroll = useDiceStore((s) => s.reroll);
  return (
    <div className="flex justify-end gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Copy this roll, ${roll.notation} totaling ${roll.total}`}
        title="Copy this roll as text"
        onClick={async () => {
          const ok = await copyText(formatRollLine(roll));
          toast(ok ? "Copied roll" : "Couldn’t copy");
        }}
      >
        <Copy aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Reroll this expression, ${roll.notation}, with current factors`}
        title="Cast this expression once more with the current luck, chaos, streak, and seed"
        aria-busy={rolling}
        onClick={() => reroll(roll)}
      >
        <RotateCcw aria-hidden="true" />
      </Button>
    </div>
  );
}

const COLUMNS = [
  { key: "time", label: "Time", hint: "When this was cast" },
  { key: "expr", label: "Notation", hint: "The pool as written" },
  { key: "dice", label: "Each die", hint: "Every face. Faded dice were dropped by Keep." },
  { key: "mod", label: "Modifier", hint: "Flat bonus or penalty added after the dice" },
  { key: "total", label: "Total", hint: "Kept dice plus modifier" },
  { key: "vs", label: "vs expected", hint: "How far the total is from the predicted average" },
  { key: "factors", label: "Factors", hint: "Luck, chaos, streak, or seed in effect" },
] as const;

export function ResultsTable() {
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
        r.seedUsed ?? "",
      ]
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(",");
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

  return (
    <Card className="rounded-xl" role="region" aria-labelledby="results-heading">
      <CardHeader className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <CardTitle id="results-heading" className="text-sm text-muted-foreground">
            <SpokenLabel>Results</SpokenLabel>
          </CardTitle>
          <CardDescription className="mt-1">
            {history.length === 0
              ? "Each die lands in this table after a roll. Dropped dice stay visible, faded."
              : `${history.length} roll${history.length === 1 ? "" : "s"} this session`}
          </CardDescription>
        </div>
        <div className="flex shrink-0 gap-1 self-start">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={history.length === 0}
            title="Download this table as a CSV spreadsheet"
            aria-label="Export roll history as CSV"
            onClick={exportCsv}
          >
            Export
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={history.length === 0}
            title="Wipe this session’s rolls from this device"
            aria-label="Clear roll history from this device"
            onClick={clearHistory}
          >
            <Trash2 aria-hidden="true" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-2">
        {history.length === 0 ? (
          <div className="px-5 pb-4 text-sm text-subtle" role="status">
            Roll to fill the table. Dropped dice stay visible, faded as discarded.
          </div>
        ) : (
          <>
            <ul
              className="md:hidden"
              data-testid="roll-cards"
              aria-label={`Roll history. ${history.length} roll${history.length === 1 ? "" : "s"} this session.`}
            >
              {history.map((roll) => {
                const delta = roll.total - roll.expected;
                return (
                  <li
                    key={roll.id}
                    className={cn(
                      "border-b border-border/80 px-5 py-4 last:border-b-0",
                      roll.id === lastId && "bg-elevated/40",
                    )}
                  >
                    <article aria-labelledby={`roll-card-${roll.id}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3
                            id={`roll-card-${roll.id}`}
                            className="break-all font-mono text-sm text-foreground"
                          >
                            {roll.notation}
                          </h3>
                          <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
                            <time dateTime={new Date(roll.at).toISOString()}>{timeLabel(roll.at)}</time>
                          </p>
                        </div>
                        <p className="font-display text-2xl tabular-nums leading-none text-foreground">
                          {roll.total}
                          <span className="sr-only"> total</span>
                        </p>
                      </div>
                      <dl className="mt-3 flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                          <dt className="text-xs text-subtle">
                            <SpokenLabel>Each die</SpokenLabel>
                          </dt>
                          <dd>
                            <DiceList roll={roll} />
                          </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-xs text-subtle">
                            <SpokenLabel>Modifier</SpokenLabel>
                          </dt>
                          <dd className="font-mono text-xs tabular-nums text-muted-foreground">
                            <ModifierValue roll={roll} />
                          </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-xs text-subtle">
                            <SpokenLabel>vs expected</SpokenLabel>
                          </dt>
                          <dd
                            className={cn(
                              "font-mono text-xs tabular-nums",
                              delta >= 0 ? "text-max" : "text-crit",
                            )}
                          >
                            {delta >= 0 ? "+" : ""}
                            {delta.toFixed(1)}
                            <span className="sr-only"> versus expected</span>
                          </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-xs text-subtle">
                            <SpokenLabel>Factors</SpokenLabel>
                          </dt>
                          <dd>
                            <FactorList roll={roll} />
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-2">
                        <RollActions roll={roll} rolling={rolling} />
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
            <div
              className="hidden max-w-full overflow-x-auto md:block"
              data-testid="roll-table"
              tabIndex={0}
              role="region"
              aria-label="Roll history table. Scroll sideways for every column."
            >
              <table className="data-table">
                <caption className="sr-only">
                  Roll history. {history.length} roll{history.length === 1 ? "" : "s"} this session.
                </caption>
                <thead>
                  <tr className="border-y border-border text-xs text-subtle">
                    {COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        scope="col"
                        className="px-3 py-2 font-medium first:px-5"
                        title={col.hint}
                      >
                        <SpokenLabel>{col.label}</SpokenLabel>
                        <span className="mt-0.5 block max-w-36 font-normal normal-case tracking-normal text-subtle">
                          {col.hint}
                        </span>
                      </th>
                    ))}
                    <th scope="col" className="px-5 py-2 font-medium">
                      <SpokenLabel>Actions</SpokenLabel>
                      <span className="mt-0.5 block font-normal normal-case tracking-normal text-subtle">
                        Copy or reroll this row
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((roll) => {
                    const delta = roll.total - roll.expected;
                    return (
                      <tr
                        key={roll.id}
                        className={cn(
                          "border-b border-border/80 align-top",
                          roll.id === lastId && "bg-elevated/40",
                        )}
                      >
                        <td className="whitespace-nowrap px-5 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                          <time dateTime={new Date(roll.at).toISOString()}>{timeLabel(roll.at)}</time>
                        </td>
                        <th
                          scope="row"
                          className="px-3 py-3 text-left font-mono text-xs font-normal text-foreground"
                        >
                          <span className="break-all">{roll.notation}</span>
                        </th>
                        <td className="px-3 py-3">
                          <DiceList roll={roll} />
                        </td>
                        <td className="px-3 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                          <ModifierValue roll={roll} />
                        </td>
                        <td className="px-3 py-3 font-display text-xl tabular-nums leading-none text-foreground">
                          {roll.total}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-3 font-mono text-xs tabular-nums",
                            delta >= 0 ? "text-max" : "text-crit",
                          )}
                        >
                          {delta >= 0 ? "+" : ""}
                          {delta.toFixed(1)}
                          <span className="sr-only"> versus expected</span>
                        </td>
                        <td className="px-3 py-3">
                          <FactorList roll={roll} />
                        </td>
                        <td className="px-4 py-2">
                          <RollActions roll={roll} rolling={rolling} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
