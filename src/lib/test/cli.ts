import { installMemoryStorage } from "@/lib/test/helpers";
import { runAllTests } from "@/lib/test/index";
import { stringify } from "@/lib/test/harness";

installMemoryStorage();
if (typeof (globalThis as { window?: unknown }).window === "undefined") {
  Object.defineProperty(globalThis, "window", { value: globalThis, configurable: true });
}

export async function runCli(): Promise<number> {
  const summary = await runAllTests();
  const suites = new Map<string, typeof summary.results>();
  for (const result of summary.results) {
    const list = suites.get(result.suite) ?? [];
    list.push(result);
    suites.set(result.suite, list);
  }

  console.log("Assay — Alea unit tests");
  console.log(`started ${summary.startedAt}`);
  console.log("");

  for (const [suite, results] of suites) {
    console.log(suite);
    for (const result of results) {
      const mark = result.status === "passed" ? "ok  " : result.status === "skipped" ? "skip" : "FAIL";
      console.log(`  ${mark}  ${String(result.durationMs).padStart(4)}ms  ${result.name}`);
      if (result.status === "skipped" && result.skipReason) {
        console.log(`         ${result.skipReason}`);
      }
      if (result.status === "failed") {
        if (result.error) console.log(`         ${result.error.message}`);
        for (const assertion of result.assertions.filter((a) => !a.passed)) {
          console.log(`         ✗ ${assertion.name}`);
          console.log(`           expected: ${stringify(assertion.expected)}`);
          console.log(`           actual:   ${stringify(assertion.actual)}`);
        }
        if (result.error?.stack) console.log(result.error.stack);
      }
    }
    console.log("");
  }

  console.log(
    `${summary.passed} passed  ${summary.failed} failed  ${summary.skipped} skipped  ${summary.total} total  ${summary.durationMs}ms`,
  );
  return summary.failed === 0 ? 0 : 1;
}
