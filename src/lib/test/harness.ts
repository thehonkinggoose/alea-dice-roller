export type Assertion = {
  name: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  detail?: string;
};

export type TestDef = {
  id: string;
  suite: string;
  name: string;
  description: string;
  why: string;
  env?: "any" | "browser";
  run: (t: Harness) => void | Promise<void>;
};

export type TestResult = {
  id: string;
  suite: string;
  name: string;
  description: string;
  why: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
  assertions: Assertion[];
  logs: string[];
  notes: Record<string, unknown>;
  error?: { message: string; stack?: string };
  skipReason?: string;
};

export type SuiteSummary = {
  startedAt: string;
  durationMs: number;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  results: TestResult[];
};

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  }
  const ak = Object.keys(a as object).sort();
  const bk = Object.keys(b as object).sort();
  if (ak.length !== bk.length) return false;
  return ak.every((k, i) => k === bk[i] && deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

export class Harness {
  assertions: Assertion[] = [];
  logs: string[] = [];
  notes: Record<string, unknown> = {};
  failed = false;

  eq(actual: unknown, expected: unknown, name: string) {
    const passed = deepEqual(actual, expected);
    this.assertions.push({ name, passed, actual, expected });
    if (!passed) this.failed = true;
  }

  ok(condition: unknown, name: string, detail?: string) {
    const passed = Boolean(condition);
    this.assertions.push({
      name,
      passed,
      actual: condition,
      expected: true,
      detail,
    });
    if (!passed) this.failed = true;
  }

  approx(actual: number, expected: number, epsilon: number, name: string) {
    const passed = Number.isFinite(actual) && Math.abs(actual - expected) <= epsilon;
    this.assertions.push({
      name,
      passed,
      actual,
      expected,
      detail: `±${epsilon}`,
    });
    if (!passed) this.failed = true;
  }

  throws(fn: () => unknown, match: string | RegExp, name: string) {
    let actual: unknown = "(no throw)";
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
      expected: typeof match === "string" ? match : match.toString(),
    });
    if (!passed) this.failed = true;
  }

  log(message: string, data?: unknown) {
    this.logs.push(data === undefined ? message : `${message} ${stringify(data)}`);
  }

  note(key: string, value: unknown) {
    this.notes[key] = value;
  }
}

export function stringify(value: unknown): string {
  if (value === undefined) return "undefined";
  try {
    const text = JSON.stringify(
      value,
      (_k, v) => {
        if (typeof v === "number" && !Number.isFinite(v)) return String(v);
        if (typeof v === "bigint") return v.toString();
        if (typeof v === "function") return `[Function ${v.name || "anonymous"}]`;
        if (v instanceof Error) return { name: v.name, message: v.message, stack: v.stack };
        return v as unknown;
      },
      2,
    );
    return text ?? String(value);
  } catch {
    return String(value);
  }
}


export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export async function runTests(defs: TestDef[]): Promise<SuiteSummary> {
  const started = Date.now();
  const startedAt = new Date().toISOString();
  const results: TestResult[] = [];

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
        skipReason: "Requires a browser document (run this case in the Assay page).",
      });
      continue;
    }

    const harness = new Harness();
    harness.note("_env", isBrowser() ? "browser" : "node");
    harness.note("_startedAt", new Date().toISOString());
    try {
      await def.run(harness);
      harness.note("_assertionCount", harness.assertions.length);
      if (harness.failed) {
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
          error: { message: "One or more assertions failed." },
        });
      } else {
        results.push({
          id: def.id,
          suite: def.suite,
          name: def.name,
          description: def.description,
          why: def.why,
          status: "passed",
          durationMs: Date.now() - t0,
          assertions: harness.assertions,
          logs: harness.logs,
          notes: harness.notes,
        });
      }
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
          stack: err instanceof Error ? err.stack : undefined,
        },
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
    results,
  };
}
