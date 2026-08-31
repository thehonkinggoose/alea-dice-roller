import { Harness, isBrowser, runTests, stringify, type TestDef } from "@/lib/test/harness";

export const harnessCases: TestDef[] = [
  {
    id: "harness-equality-stringify-and-throws",
    suite: "Harness",
    name: "The recorder stores expected vs actual, including weird JSON",
    description: "Deep equality ignores key order and walks arrays. stringify prints NaN, Infinity, bigint, undefined, and functions as readable text. throws() records `(no throw)` when the function succeeds.",
    why: "Every other case is only as trustworthy as this recorder. If stringify dropped NaN or equality shuffled arrays, a failed assertion would look like a pass.",
    run: (t) => {
      t.eq({ b: { c: [1, 2] }, a: 1 }, { a: 1, b: { c: [1, 2] } }, "key order");
      t.eq([1, 2, 3], [1, 2, 3], "array");
      const inner = new Harness();
      inner.eq(1, 2, "mismatch");
      inner.ok(0, "falsey");
      inner.approx(10, 0, 0.1, "far");
      inner.throws(() => 1, "boom", "no throw");
      inner.log("hello", { n: 1 });
      t.eq(inner.failed, true, "failed flag");
      t.eq(inner.assertions.filter((a) => !a.passed).length, 4, "four recorded fails");
      t.eq(inner.assertions.find((a) => a.name === "no throw")?.actual, "(no throw)", "no-throw marker");
      t.ok(inner.logs[0]?.includes("hello"), "log kept");
      t.eq(stringify(Number.NaN), '"NaN"', "NaN");
      t.eq(stringify(Number.POSITIVE_INFINITY), '"Infinity"', "Infinity");
      t.eq(stringify(100n), '"100"', "bigint");
      t.eq(stringify(undefined), "undefined", "undefined");
      t.ok(stringify(() => undefined).includes("Function"), "function");
      const circular: { me?: unknown } = {};
      circular.me = circular;
      t.ok(stringify(circular).length > 0, "circular does not throw");
      const innerThrow = new Harness();
      innerThrow.throws(() => {
        throw new Error("abc");
      }, /ab/, "regex match");
      innerThrow.throws(
        () => {
          throw "nope";
        },
        "nope",
        "string throw",
      );
      t.eq(innerThrow.assertions.every((a) => a.passed), true, "regex and string throws recorded as pass");
      t.note("innerFailures", inner.assertions.map((a) => ({ name: a.name, passed: a.passed, actual: a.actual, expected: a.expected })));
    },
  },
  {
    id: "harness-skip-unknown-and-unique-ids",
    suite: "Harness",
    name: "Browser-only cases skip in the shell; ids are unique; unknown ids throw",
    description: "A def with env=browser is skipped when there is no document, and still carries its name, description, and why. runOneTest of a missing id throws. Every catalog id is unique.",
    why: "The command-line runner and the Assay page share this catalog. Duplicate ids would make 'Run this case' rewrite the wrong row.",
    run: async (t) => {
      const probe: TestDef = {
        id: "tmp-browser-only",
        suite: "Harness",
        name: "tmp",
        description: "tmp description",
        why: "tmp why",
        env: "browser",
        run: () => {
          throw new Error("should not run");
        },
      };
      if (!isBrowser()) {
        const summary = await runTests([probe]);
        t.eq(summary.skipped, 1, "skipped in node");
        t.eq(summary.results[0]?.status, "skipped", "status");
        t.eq(summary.results[0]?.description, "tmp description", "description kept");
        t.ok((summary.results[0]?.skipReason ?? "").includes("Assay"), "points at Assay");
      } else {
        t.ok(true, "in a document — skip probe does not apply");
      }
      const { ALL_TESTS, runOneTest } = await import("@/lib/test/index");
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
      t.ok(
        ALL_TESTS.every((d) => d.name.trim() && d.description.trim() && d.why.trim()),
        "every case has a name, description, and why",
      );
      const boom: TestDef = {
        id: "tmp-boom",
        suite: "Harness",
        name: "tmp boom",
        description: "throws",
        why: "covers the catch path",
        run: () => {
          throw new Error("felt caught fire");
        },
      };
      const exploded = await runTests([boom]);
      t.eq(exploded.failed, 1, "throwing run is failed");
      t.ok((exploded.results[0]?.error?.message ?? "").includes("felt caught fire"), "message kept");
      t.note("catalog", { count: ids.length, suites: [...new Set(ALL_TESTS.map((d) => d.suite))] });
    },
  },
];
