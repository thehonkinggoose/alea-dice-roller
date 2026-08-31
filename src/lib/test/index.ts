import { engineCases } from "@/lib/test/cases/engine";
import { harnessCases } from "@/lib/test/cases/harness";
import { notationCases } from "@/lib/test/cases/notation";
import { rngCases } from "@/lib/test/cases/rng";
import { storeCases } from "@/lib/test/cases/store";
import { uiCases } from "@/lib/test/cases/ui";
import type { TestDef } from "@/lib/test/harness";
import { runTests } from "@/lib/test/harness";

export const ALL_TESTS: TestDef[] = [
  ...notationCases,
  ...rngCases,
  ...engineCases,
  ...storeCases,
  ...uiCases,
  ...harnessCases,
];

export function testsBySuite(): { suite: string; tests: TestDef[] }[] {
  const order: string[] = [];
  const map = new Map<string, TestDef[]>();
  for (const test of ALL_TESTS) {
    if (!map.has(test.suite)) {
      map.set(test.suite, []);
      order.push(test.suite);
    }
    map.get(test.suite)!.push(test);
  }
  return order.map((suite) => ({ suite, tests: map.get(suite)! }));
}

export function runAllTests() {
  return runTests(ALL_TESTS);
}

export function runOneTest(id: string) {
  const def = ALL_TESTS.find((t) => t.id === id);
  if (!def) throw new Error(`Unknown test ${id}`);
  return runTests([def]);
}
