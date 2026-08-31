import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Copy, Download, FlaskConical, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpokenLabel } from "@/components/dice/SpokenLabel";
import { ALL_TESTS, runAllTests, runOneTest, testsBySuite } from "@/lib/test/index";
import { stringify, type SuiteSummary, type TestResult } from "@/lib/test/harness";
import { FOCUS_RING } from "@/lib/dice/a11y";
import { cn, copyText } from "@/lib/utils";
import { toast } from "sonner";

type Filter = "all" | "passed" | "failed" | "skipped";

function statusClass(status: TestResult["status"]) {
  if (status === "passed") return "text-max";
  if (status === "failed") return "text-crit";
  return "text-subtle";
}

function StatusPip({ status }: { status: TestResult["status"] }) {
  return (
    <span
      className={cn(
        "mt-1.5 size-2 shrink-0 rounded-full",
        status === "passed" && "bg-max",
        status === "failed" && "bg-crit",
        status === "skipped" && "bg-subtle",
      )}
      aria-hidden
    />
  );
}

function TechnicalValue({ value }: { value: unknown }) {
  const text = typeof value === "string" ? value : stringify(value);
  return (
    <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md border border-border bg-elevated px-3 py-2 font-mono text-xs leading-relaxed text-muted-foreground">
      {text}
    </pre>
  );
}

function Heading({ children, tone }: { children: string; tone?: "crit" | "muted" }) {
  return (
    <h4 className={cn("text-xs font-medium", tone === "crit" ? "text-crit" : "text-subtle")}>
      <SpokenLabel>{children}</SpokenLabel>
    </h4>
  );
}

function TestDetail({ result, onRerun, busy }: { result: TestResult; onRerun: () => void; busy: boolean }) {
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
    assertions: result.assertions,
  };

  async function copyRecord() {
    const ok = await copyText(stringify(record));
    toast(ok ? "Copied technical record" : "Couldn’t copy");
  }

  return (
    <div
      id={`assay-detail-${result.id}`}
      data-testid="assay-detail"
      data-assay-detail={result.id}
      role="region"
      aria-label={`Technical record for ${result.name}`}
      className="flex flex-col gap-5 border-t border-border px-4 py-4 sm:px-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Heading>What is under test</Heading>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{result.description}</p>
        </div>
        <div>
          <Heading>Why it matters</Heading>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{result.why}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums text-muted-foreground">
        <span>id {result.id}</span>
        <span>{result.durationMs}ms</span>
        <span className={statusClass(result.status)}>{result.status}</span>
        <span>
          {passed.length}/{result.assertions.length} assertions
        </span>
        <span>env {String(result.notes._env ?? "unknown")}</span>
        <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onRerun}>
          <RotateCcw aria-hidden="true" />
          Run this case
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => void copyRecord()}>
          <Copy aria-hidden="true" />
          Copy record
        </Button>
      </div>

      {result.skipReason ? (
        <p className="text-sm text-muted-foreground">{result.skipReason}</p>
      ) : null}

      {result.error ? (
        <div>
          <Heading tone="crit">Failure</Heading>
          <p className="mt-1 font-mono text-sm text-crit">{result.error.message}</p>
          {result.error.stack ? <TechnicalValue value={result.error.stack} /> : null}
        </div>
      ) : null}

      <div
        className="max-w-full min-w-0 overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label={`Assertions for ${result.name}. Scroll sideways for every column.`}
      >
        <Heading>Assertions</Heading>
        {result.assertions.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {result.status === "skipped" ? "Not run in this environment." : "No assertions recorded."}
          </p>
        ) : (
          <table className="data-table mt-2">
            <caption className="sr-only">
              Assertions for {result.name}. {passed.length} passed, {failed.length} failed.
            </caption>
            <thead>
              <tr className="border-y border-border text-xs text-subtle">
                <th scope="col" className="py-2 pr-3 font-medium">
                  <SpokenLabel>Assertion</SpokenLabel>
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  <SpokenLabel>Expected</SpokenLabel>
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  <SpokenLabel>Actual</SpokenLabel>
                </th>
                <th scope="col" className="py-2 font-medium">
                  <SpokenLabel>Result</SpokenLabel>
                </th>
              </tr>
            </thead>
            <tbody>
              {result.assertions.map((assertion, i) => (
                <tr key={`${assertion.name}-${i}`} className="border-b border-border/80 align-top">
                  <th scope="row" className="py-2 pr-3 text-left font-normal text-foreground">
                    {assertion.name}
                    {assertion.detail ? (
                      <span className="mt-0.5 block font-mono text-xs text-subtle">{assertion.detail}</span>
                    ) : null}
                  </th>
                  <td className="py-2 pr-3 font-mono text-xs break-all text-muted-foreground">
                    {stringify(assertion.expected)}
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs break-all text-muted-foreground">
                    {stringify(assertion.actual)}
                  </td>
                  <td className={cn("py-2 font-mono text-xs", assertion.passed ? "text-max" : "text-crit")}>
                    {assertion.passed ? "pass" : "fail"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {failed.length > 0 ? (
        <p className="text-xs text-crit" role="status">
          {failed.length} assertion{failed.length === 1 ? "" : "s"} failed
          {passed.length ? ` · ${passed.length} passed` : ""}
        </p>
      ) : null}

      <div>
        <Heading>Log</Heading>
        {result.logs.length > 0 ? (
          <div className="mt-2">
            <TechnicalValue value={result.logs.join("\n")} />
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No log lines.</p>
        )}
      </div>

      <div>
        <Heading>Technical record</Heading>
        <p className="mt-1 text-xs text-muted-foreground">
          Inputs, outputs, and recorder notes for this case — including environment and assertion count.
        </p>
        <div className="mt-2">
          <TechnicalValue value={record} />
        </div>
      </div>
    </div>
  );
}

export function Assay() {
  const [summary, setSummary] = useState<SuiteSummary | null>(null);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [suiteFilter, setSuiteFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

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

  async function runOne(id: string) {
    setRunning(true);
    try {
      const slice = await runOneTest(id);
      const next = slice.results[0];
      if (!next) return;
      setSummary((prev) => {
        if (!prev) return slice;
        const results = prev.results.map((r) => (r.id === id ? next : r));
        return {
          ...prev,
          results,
          passed: results.filter((r) => r.status === "passed").length,
          failed: results.filter((r) => r.status === "failed").length,
          skipped: results.filter((r) => r.status === "skipped").length,
        };
      });
      setOpenId(id);
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    void runAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!openId || running) return;
    const el = document.getElementById(`assay-detail-${openId}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [openId, running]);

  const grouped = testsBySuite();
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (summary?.results ?? []).filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (suiteFilter !== "all" && r.suite !== suiteFilter) return false;
      if (!q) return true;
      return `${r.name} ${r.id} ${r.description} ${r.why}`.toLowerCase().includes(q);
    });
  }, [summary, filter, suiteFilter, query]);

  const bySuite = useMemo(() => {
    const map = new Map<string, TestResult[]>();
    for (const result of visible) {
      const list = map.get(result.suite) ?? [];
      list.push(result);
      map.set(result.suite, list);
    }
    return grouped
      .map((g) => ({ suite: g.suite, results: map.get(g.suite) ?? [] }))
      .filter((g) => g.results.length > 0);
  }, [visible, grouped]);

  const cells = [
    { label: "Cases", value: String(summary?.total ?? ALL_TESTS.length) },
    { label: "Passed", value: summary ? String(summary.passed) : "—" },
    { label: "Failed", value: summary ? String(summary.failed) : "—" },
    { label: "Skipped", value: summary ? String(summary.skipped) : "—" },
    { label: "Time", value: summary ? `${summary.durationMs}ms` : "—" },
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

  const liveSummary = running
    ? "Running tests."
    : summary
      ? `${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped.`
      : "";

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <p className="sr-only" role="status" aria-live="polite">
        {liveSummary}
      </p>
      <section className="felt relative overflow-hidden rounded-xl border border-border p-4 sm:p-6" aria-labelledby="assay-heading">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              <SpokenLabel>Assay</SpokenLabel>
            </p>
            <h2 id="assay-heading" className="mt-2 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
              Proofs for the table
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              These are the live unit tests for the caster — the same cases the
              command-line runner executes. Every row names the case and says
              what it proves. Open one for why it exists, every assertion with
              expected vs actual, the log, and the raw technical record.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={exportJson}
              disabled={!summary}
              aria-label="Export assay results as JSON"
            >
              <Download aria-hidden="true" />
              Export JSON
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => void runAll()}
              disabled={running}
              aria-busy={running}
            >
              {running ? <RotateCcw className="animate-spin" aria-hidden="true" /> : <Play aria-hidden="true" />}
              {running ? "Running" : "Run all"}
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="assay-stats-heading">
        <h3 id="assay-stats-heading" className="sr-only">
          Assay totals
        </h3>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-5">
          {cells.map((cell) => (
            <div key={cell.label} className="min-w-0 bg-card px-3 py-3 sm:px-4">
              <dt className="text-xs text-subtle">
                <SpokenLabel>{cell.label}</SpokenLabel>
              </dt>
              <dd className="mt-1 font-mono text-lg tabular-nums text-foreground">{cell.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center" role="search">
        <div className="sm:max-w-sm sm:flex-1">
          <label htmlFor="assay-filter" className="sr-only">
            Filter cases by name, id, or description
          </label>
          <Input
            id="assay-filter"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, id, or description"
          />
        </div>
        <div role="group" aria-label="Filter by result" className="flex flex-wrap gap-1.5">
          {(["all", "passed", "failed", "skipped"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={cn(
                FOCUS_RING,
                "h-11 rounded-md px-3 text-xs font-medium capitalize transition-colors",
                filter === key ? "bg-primary text-primary-foreground" : "bg-elevated text-muted-foreground hover:text-foreground",
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div role="group" aria-label="Filter by suite" className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setSuiteFilter("all")}
          aria-pressed={suiteFilter === "all"}
          className={cn(
            FOCUS_RING,
            "h-11 rounded-full border px-3 text-xs",
            suiteFilter === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          All suites
        </button>
        {grouped.map((g) => (
          <button
            key={g.suite}
            type="button"
            onClick={() => setSuiteFilter(g.suite)}
            aria-pressed={suiteFilter === g.suite}
            className={cn(
              FOCUS_RING,
              "h-11 rounded-full border px-3 text-xs",
              suiteFilter === g.suite
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {g.suite}
          </button>
        ))}
      </div>

      {bySuite.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {running ? "Casting the suite…" : "No cases match that filter."}
        </p>
      ) : (
        bySuite.map((group) => (
          <section
            key={group.suite}
            className="overflow-hidden rounded-xl border border-border bg-card"
            aria-labelledby={`suite-${group.suite.replace(/\s+/g, "-")}`}
            aria-busy={running}
          >
            <header className="flex items-center justify-between gap-3 px-5 py-3">
              <h3
                id={`suite-${group.suite.replace(/\s+/g, "-")}`}
                className="text-sm text-muted-foreground"
              >
                <SpokenLabel>{group.suite}</SpokenLabel>
              </h3>
              <p className="font-mono text-xs tabular-nums text-subtle">
                {group.results.filter((r) => r.status === "passed").length}/{group.results.length}
              </p>
            </header>
            <ul>
              {group.results.map((result) => {
                const open = openId === result.id;
                return (
                  <li key={result.id} className="border-t border-border" data-assay-id={result.id}>
                    <button
                      type="button"
                      id={`assay-row-${result.id}`}
                      data-testid={`assay-row-${result.id}`}
                      onClick={() => setOpenId(open ? null : result.id)}
                      className={cn(FOCUS_RING, "flex w-full items-start gap-3 px-4 py-3 text-left sm:px-5")}
                      aria-expanded={open}
                      aria-controls={`assay-detail-${result.id}`}
                    >
                      <StatusPip status={result.status} />
                      <span className="min-w-0 flex-1">
                        <span className="sr-only">{result.status}. </span>
                        <span className="block text-sm font-medium text-foreground">{result.name}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{result.description}</span>
                        <span className="mt-1 block font-mono text-xs text-subtle">{result.id}</span>
                      </span>
                      <span className="min-w-0 shrink-0 font-mono text-xs tabular-nums text-subtle">
                        <span className="sm:hidden">{result.assertions.length}</span>
                        <span className="hidden sm:inline">
                          {result.assertions.length} assert · {result.durationMs}ms
                        </span>
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className={cn("mt-0.5 size-4 shrink-0 text-subtle transition-transform", open && "rotate-180")}
                      />
                    </button>
                    {open ? <TestDetail result={result} busy={running} onRerun={() => void runOne(result.id)} /> : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}

      <p className="flex items-center gap-2 text-xs text-subtle">
        <FlaskConical className="size-3.5" aria-hidden="true" />
        {ALL_TESTS.length} cases covering notation, RNG, evaluation, the session store, the interface, and this harness.
        Browser-only guards skip in the shell and run here.
      </p>
    </div>
  );
}
