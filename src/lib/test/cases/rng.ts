import { cryptoRng, hashSeed, mulberry32, rngFor } from "@/lib/dice/rng";
import type { TestDef } from "@/lib/test/harness";

export const rngCases: TestDef[] = [
  {
    id: "rng-hash-seed-stable",
    suite: "RNG",
    name: "hashSeed is a stable FNV-1a unsigned 32",
    description: "The same string always hashes to the same uint32. Different strings diverge. Empty string is a defined value, not zero by accident of a skipped loop only.",
    why: "Seeded replay is only possible if `oak#0` hashes the same way tomorrow as it does today.",
    run: (t) => {
      const a = hashSeed("oak");
      const b = hashSeed("oak");
      const c = hashSeed("oak#0");
      t.note("oak", a);
      t.note("oak#0", c);
      t.eq(a, b, "deterministic");
      t.ok(a !== c, "seed and stream salt differ");
      t.ok(a >= 0 && a <= 0xffffffff, "uint32 range");
      t.eq(hashSeed(""), 2166136261, "FNV offset basis for empty");
    },
  },
  {
    id: "rng-mulberry-unit-interval",
    suite: "RNG",
    name: "mulberry32 yields a repeatable unit interval",
    description: "A generator from the same seed repeats. Outputs stay in [0, 1). Two seeds do not share a prefix.",
    why: "Every weighted face pick is `rng() * totalWeight`. A value of 1.0 would skip the last-face fallback; a NaN would freeze exploding loops.",
    run: (t) => {
      const a = mulberry32(1);
      const b = mulberry32(1);
      const seqA = [a(), a(), a(), a(), a()];
      const seqB = [b(), b(), b(), b(), b()];
      t.note("seq", seqA);
      t.eq(seqA, seqB, "same seed, same stream");
      t.ok(seqA.every((n) => n >= 0 && n < 1), "unit interval");
      const other = mulberry32(2);
      t.ok(other() !== seqA[0], "different seed diverges");
    },
  },
  {
    id: "rng-for-seed-vs-crypto",
    suite: "RNG",
    name: "rngFor uses the seed stream only when a seed is present",
    description: "`rngFor('oak', 0)` is mulberry32 of hash('oak#0'). Null or empty seed returns the cryptographic generator instead.",
    why: "Unlocked rolls must not consume or define the replay stream. Mixing the two would make Lock start on the wrong face.",
    run: (t) => {
      const seeded = rngFor("oak", 0);
      const again = rngFor("oak", 0);
      t.eq(seeded(), again(), "same seed and index");
      const next = rngFor("oak", 1);
      t.ok(next() !== rngFor("oak", 0)(), "stream index changes the draw");
      const cryptoA = rngFor(null, 0);
      const cryptoB = rngFor("", 99);
      const x = cryptoA();
      const y = cryptoB();
      t.ok(x >= 0 && x < 1, "null seed unit interval");
      t.ok(y >= 0 && y < 1, "empty seed unit interval");
      t.note("cryptoSamples", [x, y]);
    },
  },
  {
    id: "rng-crypto-direct",
    suite: "RNG",
    name: "cryptoRng reads the Web Crypto buffer as [0, 1)",
    description: "Each call fills a Uint32 and divides by 2^32. A missing slot falls back to 0, so the function never returns undefined.",
    why: "This is the unlocked table. If it threw in a worker without crypto, every unseeded roll would crash the tray.",
    run: (t) => {
      const rng = cryptoRng();
      const samples = Array.from({ length: 8 }, () => rng());
      t.note("samples", samples);
      t.ok(samples.every((n) => n >= 0 && n < 1), "unit interval");
      t.ok(new Set(samples.map((n) => n.toFixed(8))).size >= 2, "not a constant");
    },
  },
  {
    id: "rng-unicode-and-long-seed",
    suite: "RNG",
    name: "Unicode and long seeds still hash to a uint32 stream",
    description: "`oak🎲` and a 2,000-character seed both produce a uint32. The unicode seed diverges from `oak`. The long seed still seeds a unit-interval generator.",
    why: "People paste table names with emoji. A throw on a code point above 255 would crash Lock.",
    run: (t) => {
      const uni = hashSeed("oak🎲");
      t.note("unicode", uni);
      t.ok(uni !== hashSeed("oak"), "emoji changes the hash");
      t.ok(uni >= 0 && uni <= 0xffffffff, "uint32");
      const long = "x".repeat(2000);
      const h = hashSeed(long);
      t.ok(h >= 0 && h <= 0xffffffff, "long seed uint32");
      const rng = rngFor(long, 0);
      const n = rng();
      t.ok(n >= 0 && n < 1, "long seed unit interval");
      t.eq(rngFor("oak🎲", 3)(), rngFor("oak🎲", 3)(), "unicode stream repeats");
    },
  },
];
