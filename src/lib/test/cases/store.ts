import { PRESETS, DIE_SIDES, useDiceStore } from "@/lib/dice/store";
import { parseNotation } from "@/lib/dice/notation";
import { makeRoll } from "@/lib/dice/engine";
import { fakeRoll, resetStore, withStore } from "@/lib/test/helpers";
import type { TestDef } from "@/lib/test/harness";

export const storeCases: TestDef[] = [
  {
    id: "store-presets-parse",
    suite: "Session store",
    name: "Every preset is a legal expression",
    description: "d20, advantage, disadvantage, 4d6dl1, Stats ×6, d100, and the rest all parse. DIE_SIDES is the chip row.",
    why: "A preset that does not parse would paint an error the first time someone taps Adv.",
    run: (t) => {
      t.note("presets", PRESETS);
      t.note("sides", [...DIE_SIDES]);
      for (const preset of PRESETS) {
        const parsed = parseNotation(preset.notation);
        t.ok(parsed.terms.some((x) => x.kind === "dice"), `${preset.label} has dice`);
      }
      t.eq([...DIE_SIDES], [4, 6, 8, 10, 12, 20, 100], "chip sizes");
      t.eq(PRESETS.find((p) => p.label === "Stats")?.repeat, 6, "Stats is ×6");
    },
  },
  {
    id: "store-set-notation-and-repeat",
    suite: "Session store",
    name: "Typing a simple pool updates steppers but keeps Repeat",
    description: "After Stats (repeat 6), typing `3d6` maps count/sides and leaves Repeat at 6. Invalid text is live-typed with no throw.",
    why: "Repeat is an independent control. Destroying it on every keystroke made Stats unusable with any follow-up expression.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().applyPreset("4d6dl1", 6);
        useDiceStore.getState().setNotation("3d6");
        const s = useDiceStore.getState();
        t.note("after", { notation: s.notation, pool: s.pool });
        t.eq(s.pool.count, 3, "count");
        t.eq(s.pool.sides, 6, "sides");
        t.eq(s.pool.repeat, 6, "repeat preserved");
        useDiceStore.getState().setNotation("nope");
        t.eq(useDiceStore.getState().notation, "nope", "invalid kept");
        t.eq(useDiceStore.getState().pool.count, 3, "pool unchanged on junk");
        useDiceStore.getState().setNotation("2d6", true);
        t.eq(useDiceStore.getState().pool.count, 3, "fromPool skips remap");
      });
    },
  },
  {
    id: "store-compound-repeat-only",
    suite: "Session store",
    name: "Repeat-only patches do not rewrite a compound expression",
    description: "`1d20+1d4+3` plus patchPool({repeat:2}) keeps the string. A sides-only patch is ignored so leftover steppers cannot eat the mixed pool. A die-chip rebuild (count, sides, keepMode) writes `1d8`.",
    why: "The Repeat stepper used to call formatPool and collapse mixed pools to the first die. A leftover Sides click did the same while the field still showed 1d20+1d4.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().setNotation("1d20+1d4+3");
        useDiceStore.getState().patchPool({ repeat: 2 });
        t.eq(useDiceStore.getState().notation, "1d20+1d4+3", "repeat preserved compound");
        t.eq(useDiceStore.getState().pool.repeat, 2, "repeat 2");
        useDiceStore.getState().patchPool({ sides: 8 });
        t.eq(useDiceStore.getState().notation, "1d20+1d4+3", "sides-only does not eat compound");
        useDiceStore.getState().patchPool({
          count: 1,
          sides: 8,
          modifier: 0,
          keepMode: "none",
          exploding: false,
        });
        t.eq(useDiceStore.getState().notation, "1d8", "rebuild chip replaces");
      });
    },
  },
  {
    id: "store-keep-disabled-on-one-die",
    suite: "Session store",
    name: "A one-die pool cannot keep high or low",
    description: "patchPool({count:1, keepMode:'highest'}) forces keepMode none. Count 2 allows highest and clamps keepN to count-1.",
    why: "`1d20kh1` is a no-op that looked like advantage. The High button is disabled for a reason.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().patchPool({ count: 2, keepMode: "highest", keepN: 9 });
        t.eq(useDiceStore.getState().pool.keepN, 1, "clamped to count-1");
        t.eq(useDiceStore.getState().notation, "2d20kh1", "notation");
        useDiceStore.getState().patchPool({ count: 1 });
        t.eq(useDiceStore.getState().pool.keepMode, "none", "cleared");
        t.eq(useDiceStore.getState().notation, "1d20", "kh stripped");
      });
    },
  },
  {
    id: "store-sanitize-garbage",
    suite: "Session store",
    name: "Sanitization clamps hydrated garbage into legal pool and factors",
    description: "Out-of-range count, sides, luck, chaos, keepMode, and a locked blank seed are repaired on patch and on hydrate.",
    why: "Old localStorage from before a bugfix would otherwise resurrect Keep High on a single die, or Lock with no seed.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().patchPool({
          count: 500 as number,
          sides: 1 as number,
          modifier: 500,
          keepMode: "banana" as unknown as "none",
          keepN: 0,
          repeat: 0,
        });
        const pool = useDiceStore.getState().pool;
        t.note("pool", pool);
        t.eq(pool.count, 100, "count max 100");
        t.eq(pool.sides, 2, "sides min 2");
        t.eq(pool.modifier, 99, "mod max");
        t.eq(pool.keepMode, "none", "invalid mode");
        t.eq(pool.repeat, 1, "repeat min 1");
        useDiceStore.getState().patchRandomness({ luck: 4, chaos: -2, streak: -4, seed: "  ", seedLocked: true, streamIndex: -9 });
        const r = useDiceStore.getState().randomness;
        t.note("randomness", r);
        t.eq(r.luck, 1, "luck clamp");
        t.eq(r.chaos, 0, "chaos floor");
        t.eq(r.streak, -1, "streak clamp");
        t.eq(r.seedLocked, false, "blank seed cannot lock");
        t.eq(r.streamIndex, 0, "stream floor");
      });
    },
  },
  {
    id: "store-fair-keeps-seed",
    suite: "Session store",
    name: "Fair resets luck, chaos, and streak but keeps the seed stream",
    description: "resetRandomness writes luck 0, chaos 0.5, streak 0. Seed, lock, and streamIndex stay put so a replay does not jump.",
    why: "Fair is 'put the table back', not 'forget the seed I was proving'.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().patchRandomness({ luck: 1, chaos: 1, streak: -0.5, seed: "oak", seedLocked: true, streamIndex: 3 });
        useDiceStore.getState().resetRandomness();
        const r = useDiceStore.getState().randomness;
        t.note("after", r);
        t.eq(r.luck, 0, "luck");
        t.eq(r.chaos, 0.5, "chaos");
        t.eq(r.streak, 0, "streak");
        t.eq(r.seed, "oak", "seed");
        t.eq(r.seedLocked, true, "lock");
        t.eq(r.streamIndex, 3, "stream");
      });
    },
  },
  {
    id: "store-roll-reentrancy-and-error",
    suite: "Session store",
    name: "A roll in flight blocks the next; bad notation sets error instead",
    description: "roll() while rolling returns null. Invalid notation sets error and does not start the animation. timesOverride of 3 writes three history rows even if Repeat is 1.",
    why: "Holding Enter used to dump a row per key-repeat. Stats ×6 vs table reroll is the timesOverride contract.",
    run: (t) => {
      withStore(() => {
        const first = useDiceStore.getState().roll(1);
        const stacked = useDiceStore.getState().roll(1);
        t.ok(first && first.length === 1, "first roll");
        t.eq(stacked, null, "reentrant blocked");
        t.eq(useDiceStore.getState().history.length, 1, "one row");
        t.eq(useDiceStore.getState().rolling, true, "animation on");
        useDiceStore.getState().clearHistory();
        useDiceStore.getState().setNotation("nope");
        const bad = useDiceStore.getState().roll();
        t.eq(bad, null, "invalid returns null");
        t.ok((useDiceStore.getState().error ?? "").includes("Could not parse"), "error message");
        t.eq(useDiceStore.getState().rolling, false, "did not animate");
        useDiceStore.getState().setNotation("1d4");
        const batch = useDiceStore.getState().roll(3);
        t.eq(batch?.length, 3, "override ×3");
        t.eq(useDiceStore.getState().history.length, 3, "three rows");
        t.eq(useDiceStore.getState().last?.id, batch?.[2]?.id, "last is newest of batch");
      });
    },
  },
  {
    id: "store-reroll-one",
    suite: "Session store",
    name: "Reroll always casts once, even when Repeat is 6",
    description: "After Stats, reroll(last) adds a single 4d6dl1 row. reroll() with no last returns null. reroll while rolling returns null.",
    why: "Table reroll used the live Repeat, so Stats ×6 leaked into every replay click.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().applyPreset("4d6dl1", 6);
        const rows = useDiceStore.getState().roll();
        t.eq(rows?.length, 6, "stats six");
        useDiceStore.getState().clearHistory();
        useDiceStore.setState({ last: null, rolling: false });
        t.eq(useDiceStore.getState().reroll(), null, "no last");
        useDiceStore.getState().applyPreset("4d6dl1", 6);
        const six = useDiceStore.getState().roll();
        t.ok(six, "rolled");
        const blocked = useDiceStore.getState().reroll(six![0]);
        t.eq(blocked, null, "blocked while rolling");
        useDiceStore.setState({ rolling: false });
        const extra = useDiceStore.getState().reroll(six![0]);
        t.eq(extra?.length, 1, "one extra");
        t.eq(useDiceStore.getState().history.length, 7, "7 rows");
        t.eq(useDiceStore.getState().notation, "4d6dl1", "notation restored");
        t.eq(useDiceStore.getState().pool.repeat, 6, "repeat still 6");
      });
    },
  },
  {
    id: "store-reroll-does-not-steal-pool",
    suite: "Session store",
    name: "Reroll casts the old expression without rewriting the live pool",
    description: "After a 1d20, typing 3d6 and rerolling last adds a 1d20 row. Notation stays 3d6, count stays 3, Repeat is untouched.",
    why: "Table and tray reroll used to call setNotation, so a row click silently replaced Adv with an old d20 while the user was looking at the table.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().setNotation("1d20");
        const first = useDiceStore.getState().roll(1);
        t.ok(first, "rolled d20");
        useDiceStore.setState({ rolling: false });
        useDiceStore.getState().setNotation("3d6");
        t.eq(useDiceStore.getState().pool.count, 3, "pool is 3d6");
        const again = useDiceStore.getState().reroll(first![0]);
        t.eq(again?.length, 1, "one extra");
        t.eq(again?.[0]?.notation, "1d20", "row is the old expression");
        t.eq(useDiceStore.getState().notation, "3d6", "live notation kept");
        t.eq(useDiceStore.getState().pool.count, 3, "count kept");
        t.eq(useDiceStore.getState().pool.sides, 6, "sides kept");
      });
    },
  },
  {
    id: "store-coupling-notices",
    suite: "Session store",
    name: "Auto-changes to Keep and Lock write a visible notice",
    description: "Dropping Adv from 2 dice to 1 turns Keep High off and sets poolNotice. Clamping keepN on 4d6kh3 when count becomes 2 mentions the new keep. Clearing a locked seed unlocks and sets rngNotice. Toggling Lock off on purpose does not.",
    why: "These are the couplings that used to mutate a control the user was not looking at. The notice is the only guaranteed on-screen record.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().applyPreset("2d20kh1");
        useDiceStore.getState().patchPool({ count: 1 });
        t.eq(useDiceStore.getState().pool.keepMode, "none", "keep cleared");
        t.ok((useDiceStore.getState().poolNotice ?? "").includes("Keep High turned off"), "keep notice");
        useDiceStore.getState().patchPool({ count: 4, keepMode: "highest", keepN: 3 });
        t.eq(useDiceStore.getState().notation, "4d20kh3", "kh3");
        useDiceStore.getState().patchPool({ count: 2 });
        t.eq(useDiceStore.getState().pool.keepN, 1, "clamped");
        t.ok((useDiceStore.getState().poolNotice ?? "").includes("Keep reduced to 1"), "keepN notice");
        useDiceStore.getState().patchRandomness({ seed: "oak", seedLocked: true });
        t.eq(useDiceStore.getState().rngNotice, null, "lock on is silent");
        useDiceStore.getState().patchRandomness({ seed: "" });
        t.eq(useDiceStore.getState().randomness.seedLocked, false, "unlocked");
        t.ok((useDiceStore.getState().rngNotice ?? "").includes("Lock turned off"), "lock notice");
        useDiceStore.getState().patchRandomness({ seed: "oak", seedLocked: true });
        useDiceStore.getState().patchRandomness({ seedLocked: false });
        t.eq(useDiceStore.getState().rngNotice, null, "explicit unlock is silent");
      });
    },
  },
  {
    id: "store-compound-chip-rebuilds-simple",
    suite: "Session store",
    name: "Leaving a compound pool via a die chip starts a fresh 1dN",
    description: "Adv, then 1d20+1d4, then a chip-style patch of d6 writes 1d6 with keep none. Repeat 6 from Stats survives.",
    why: "The chip used to replay the locked Adv pool (2d6kh1) so Keep High came back without the user looking at Keep.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().applyPreset("4d6dl1", 6);
        useDiceStore.getState().setNotation("1d20+1d4");
        t.eq(useDiceStore.getState().pool.repeat, 6, "repeat still 6");
        t.eq(useDiceStore.getState().pool.keepMode, "highest", "stale keep until chip");
        useDiceStore.getState().patchPool({
          count: 1,
          sides: 6,
          modifier: 0,
          keepMode: "none",
          exploding: false,
        });
        t.eq(useDiceStore.getState().notation, "1d6", "fresh d6");
        t.eq(useDiceStore.getState().pool.keepMode, "none", "keep reset");
        t.eq(useDiceStore.getState().pool.repeat, 6, "repeat kept");
        t.eq(useDiceStore.getState().poolNotice, null, "intentional patch is silent");
      });
    },
  },
  {
    id: "store-hydrate-and-persist",
    suite: "Session store",
    name: "hydrate restores a session and refuses to run twice",
    description: "A saved payload with Keep High on 1 die and Lock on a blank seed is repaired. Corrupt JSON is ignored. A second hydrate is a no-op.",
    why: "This is the only load path. A crash here blanks the table on every visit.",
    run: (t) => {
      withStore(() => {
        localStorage.setItem(
          "alea-v1",
          JSON.stringify({
            notation: "2d6",
            pool: { count: 1, sides: 6, keepMode: "highest", keepN: 1, exploding: false, modifier: 0, repeat: 2 },
            randomness: { luck: 0.2, chaos: 0.5, streak: 0, seed: "", seedLocked: true, streamIndex: 4 },
            history: [fakeRoll({ id: "h1", notation: "2d6", total: 7 })],
          }),
        );
        useDiceStore.setState({ hydrated: false });
        useDiceStore.getState().hydrate();
        const s = useDiceStore.getState();
        t.note("hydrated", { notation: s.notation, pool: s.pool, randomness: s.randomness, last: s.last?.id });
        t.eq(s.notation, "2d6", "notation");
        t.eq(s.pool.keepMode, "none", "keep cleared on 1 die");
        t.eq(s.randomness.seedLocked, false, "blank lock cleared");
        t.eq(s.last?.id, "h1", "last from history[0]");
        t.eq(s.hydrated, true, "flag");
        useDiceStore.getState().setNotation("1d20");
        useDiceStore.getState().hydrate();
        t.eq(useDiceStore.getState().notation, "1d20", "second hydrate no-op");
        localStorage.setItem("alea-v1", "{not json");
        useDiceStore.setState({ hydrated: false, notation: "3d6" });
        useDiceStore.getState().hydrate();
        t.eq(useDiceStore.getState().notation, "3d6", "corrupt ignored");
        t.eq(useDiceStore.getState().hydrated, true, "still hydrates");
      });
    },
  },
  {
    id: "store-history-cap-and-clear",
    suite: "Session store",
    name: "History caps at 200 and clearHistory unlocks a mid-flight roll",
    description: "199 existing rows plus one roll stay at 200. clearHistory empties last, history, and rolling, even if the 720ms timer is outstanding.",
    why: "Clear during the tumble used to leave Roll disabled forever.",
    run: (t) => {
      withStore(() => {
        const filler = Array.from({ length: 199 }, (_, i) => fakeRoll({ id: `f${i}`, at: i }));
        useDiceStore.setState({ history: filler, rolling: false, notation: "1d4" });
        useDiceStore.getState().roll(1);
        t.eq(useDiceStore.getState().history.length, 200, "capped");
        t.eq(useDiceStore.getState().rolling, true, "rolling");
        useDiceStore.getState().clearHistory();
        t.eq(useDiceStore.getState().history.length, 0, "cleared");
        t.eq(useDiceStore.getState().last, null, "no last");
        t.eq(useDiceStore.getState().rolling, false, "unlocked");
      });
    },
  },
  {
    id: "store-apply-preset-and-persist-quota",
    suite: "Session store",
    name: "Invalid presets error; persist failures are swallowed",
    description: "applyPreset('%%%') sets error. A throwing localStorage.setItem does not explode out of patchPool.",
    why: "Safari quota errors are real. The table has to keep rolling even when the disk is full.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().applyPreset("%%%");
        t.ok(useDiceStore.getState().error, "preset error");
        const original = localStorage.setItem.bind(localStorage);
        localStorage.setItem = () => {
          throw new Error("quota");
        };
        try {
          useDiceStore.getState().patchPool({ modifier: 1 });
          t.eq(useDiceStore.getState().pool.modifier, 1, "state still updates");
        } finally {
          localStorage.setItem = original;
        }
      });
    },
  },
  {
    id: "store-seed-stream-unlocked-rolls",
    suite: "Session store",
    name: "Unlocked rolls do not burn the seed stream",
    description: "Type seed oak, roll unlocked, lock, streamIndex is still 0. One locked roll then moves it to 1.",
    why: "Replay starts at the beginning of the seed, not wherever the cryptographic table happened to sit.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().patchRandomness({ seed: "oak", streamIndex: 0 });
        useDiceStore.getState().roll(1);
        useDiceStore.setState({ rolling: false });
        t.eq(useDiceStore.getState().randomness.streamIndex, 0, "unlocked did not advance");
        t.eq(useDiceStore.getState().last?.seedUsed, null, "unseeded record");
        useDiceStore.getState().patchRandomness({ seedLocked: true });
        useDiceStore.getState().roll(1);
        t.eq(useDiceStore.getState().randomness.streamIndex, 1, "locked advanced");
        t.eq(useDiceStore.getState().last?.seedUsed, "oak", "seeded record");
      });
    },
  },
  {
    id: "store-hydrate-missing-fields",
    suite: "Session store",
    name: "A sparse or hostile payload still hydrates a legal table",
    description: "Empty object restores 1d20. Empty notation string falls back. Non-array history becomes []. getItem throwing still marks hydrated so the table is usable.",
    why: "This is first paint after a storage failure. Looping on a throw would blank the caster forever.",
    run: (t) => {
      withStore(() => {
        localStorage.setItem("alea-v1", JSON.stringify({}));
        useDiceStore.setState({ hydrated: false });
        useDiceStore.getState().hydrate();
        t.eq(useDiceStore.getState().notation, "1d20", "empty object → default");
        t.eq(useDiceStore.getState().history.length, 0, "no history");
        localStorage.setItem("alea-v1", JSON.stringify({ notation: "", history: "nope" }));
        useDiceStore.setState({ hydrated: false, notation: "3d6" });
        useDiceStore.getState().hydrate();
        t.eq(useDiceStore.getState().notation, "1d20", "empty string notation");
        t.eq(Array.isArray(useDiceStore.getState().history), true, "bad history array");
        t.eq(useDiceStore.getState().history.length, 0, "ignored non-array");
        const original = localStorage.getItem.bind(localStorage);
        localStorage.getItem = () => {
          throw new Error("denied");
        };
        try {
          useDiceStore.setState({ hydrated: false, notation: "2d8" });
          useDiceStore.getState().hydrate();
          t.eq(useDiceStore.getState().hydrated, true, "still hydrates");
          t.eq(useDiceStore.getState().notation, "2d8", "state kept on throw");
        } finally {
          localStorage.getItem = original;
        }
      });
    },
  },
  {
    id: "store-apply-preset-keep-and-compound",
    suite: "Session store",
    name: "Presets write keep modes; a compound preset keeps the string",
    description: "Adv is 2d20kh1 with keep highest. Dis is lowest. applyPreset('1d20+1d4', 2) keeps the mixed notation and sets Repeat 2 without flattening to 1d20.",
    why: "The Adv chip is how most people start. Flattening a mixed preset would be the same Repeat bug in a different coat.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().applyPreset("2d20kh1");
        t.eq(useDiceStore.getState().pool.keepMode, "highest", "adv keep");
        t.eq(useDiceStore.getState().pool.keepN, 1, "keep 1");
        useDiceStore.getState().applyPreset("2d20kl1");
        t.eq(useDiceStore.getState().pool.keepMode, "lowest", "dis keep");
        useDiceStore.getState().applyPreset("1d20+1d4", 2);
        t.eq(useDiceStore.getState().notation, "1d20+1d4", "compound kept");
        t.eq(useDiceStore.getState().pool.repeat, 2, "repeat 2");
        t.note("afterCompound", useDiceStore.getState().pool);
      });
    },
  },
  {
    id: "store-roll-times-persist-explode-reroll",
    suite: "Session store",
    name: "Times clamp, persist, explode, and reroll-last all agree",
    description: "roll(0) casts once. roll(99) caps at 50. patchPool exploding rewrites `1d20!`. persist writes alea-v1. reroll() with no argument uses last.",
    why: "Stats ×6, a fat-fingered override, and the tray's Reroll last all share this path. They cannot mean different things.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().setNotation("1d4");
        const once = useDiceStore.getState().roll(0);
        t.eq(once?.length, 1, "0 clamps to 1");
        useDiceStore.setState({ rolling: false, history: [], last: null });
        const many = useDiceStore.getState().roll(99);
        t.eq(many?.length, 50, "99 clamps to 50");
        t.eq(useDiceStore.getState().history.length, 50, "50 rows");
        useDiceStore.setState({ rolling: false });
        const raw = localStorage.getItem("alea-v1");
        t.ok(raw && raw.includes("1d4"), "persisted notation");
        t.note("persistKeys", raw ? Object.keys(JSON.parse(raw)) : []);
        useDiceStore.setState({ rolling: false, history: [], last: null, notation: "1d20", pool: { ...useDiceStore.getState().pool, exploding: false, sides: 20, count: 1 } });
        useDiceStore.getState().patchPool({ exploding: true });
        t.eq(useDiceStore.getState().notation, "1d20!", "explode notation");
        const first = useDiceStore.getState().roll(1);
        useDiceStore.setState({ rolling: false });
        const again = useDiceStore.getState().reroll();
        t.eq(again?.length, 1, "reroll last once");
        t.eq(useDiceStore.getState().history.length, 2, "two rows");
        t.eq(first?.[0]?.notation, "1d20!", "last was exploding");
      });
    },
  },
  {
    id: "store-nan-factors-and-keep-low-patch",
    suite: "Session store",
    name: "NaN factors become fair; Keep Low patches the notation",
    description: "NaN luck becomes 0. Non-finite chaos becomes 0.5. patchPool keepMode lowest on 2d20 writes `2d20kl1`.",
    why: "A corrupted slider event can ship NaN. Fair is the only safe repair. Keep Low is the Dis chip's body.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().patchRandomness({ luck: Number.NaN, chaos: Number.POSITIVE_INFINITY, streak: Number.NaN });
        const r = useDiceStore.getState().randomness;
        t.note("repaired", r);
        t.eq(r.luck, 0, "luck NaN → 0");
        t.eq(r.chaos, 0.5, "chaos inf → 0.5");
        t.eq(r.streak, 0, "streak NaN → 0");
        useDiceStore.getState().patchPool({ count: 2, keepMode: "lowest", keepN: 1 });
        t.eq(useDiceStore.getState().notation, "2d20kl1", "kl notation");
        t.eq(useDiceStore.getState().pool.keepMode, "lowest", "mode");
      });
    },
  },
  {
    id: "store-randomness-applies-and-repeat-freezes-streak",
    suite: "Session store",
    name: "Luck loads the next roll; Repeat does not feed streak inside one click",
    description: "Locked oak, luck +1: the recorded expected sits well above a fair oak replay at the same index. Fair then rolls oak#1 matching a fair generator, not a lucky one. Repeat ×2 with streak +1 and empty history records streak 0 on both rows; the second face equals a standalone oak#1 with no history.",
    why: "If Repeat let the first Stats score tilt the second, ability scores would self-feed. If Fair left luck on the next seeded face, Reset to fair would be a costume.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().setNotation("1d20");
        useDiceStore.getState().patchRandomness({ seed: "oak", seedLocked: true, luck: 1, streamIndex: 0 });
        const lucky = useDiceStore.getState().roll(1);
        t.ok(lucky, "rolled lucky");
        t.eq(lucky![0]!.luck, 1, "luck on the row");
        t.ok(lucky![0]!.expected > 13, "lucky expected");
        useDiceStore.setState({ rolling: false });
        useDiceStore.getState().resetRandomness();
        t.eq(useDiceStore.getState().randomness.luck, 0, "fair luck");
        t.eq(useDiceStore.getState().randomness.seed, "oak", "seed kept");
        t.eq(useDiceStore.getState().randomness.streamIndex, 1, "stream kept");
        const afterFair = useDiceStore.getState().roll(1);
        const fairAt1 = makeRoll("1d20", { luck: 0, chaos: 0.5, streak: 0, seed: "oak", seedLocked: true, streamIndex: 1 }, []);
        t.eq(afterFair![0]!.dice[0]!.face, fairAt1.record.dice[0]!.face, "Fair applies to the next seeded face");
        t.eq(afterFair![0]!.luck, 0, "row luck 0");
        useDiceStore.setState({ rolling: false, history: [], last: null });
        useDiceStore.getState().patchRandomness({ luck: 0, chaos: 0.5, streak: 1, seed: "oak", seedLocked: true, streamIndex: 0 });
        const batch = useDiceStore.getState().roll(2);
        t.eq(batch?.length, 2, "×2");
        t.eq(batch![0]!.streak, 0, "first of batch not streaked");
        t.eq(batch![1]!.streak, 0, "second of batch not streaked");
        const solo1 = makeRoll("1d20", { luck: 0, chaos: 0.5, streak: 1, seed: "oak", seedLocked: true, streamIndex: 1 }, []);
        t.eq(batch![1]!.dice[0]!.face, solo1.record.dice[0]!.face, "second matches empty-history stream 1");
      });
    },
  },
  {
    id: "store-repeat-shares-one-streak-curve",
    suite: "Session store",
    name: "A Repeat batch with streak on shares one curve, not a self-feeding one",
    description: "Hot history plus streak +1, Repeat ×2 on locked oak: both rows record streak 1 and the same expected. The second face matches a standalone oak#1 against the original history, not against a history that already includes the first of the batch.",
    why: "If Repeat let the first Stats score tilt the second, ability scores would self-feed. If it recorded streak 0 after real history, Momentum would look off while the curve was loaded.",
    run: (t) => {
      withStore(() => {
        const hot = [fakeRoll({ total: 20, expected: 10.5 }), fakeRoll({ total: 18, expected: 10.5 })];
        useDiceStore.setState({ history: hot, last: hot[0], rolling: false, notation: "1d20" });
        useDiceStore.getState().patchRandomness({
          luck: 0,
          chaos: 0.5,
          streak: 1,
          seed: "oak",
          seedLocked: true,
          streamIndex: 0,
        });
        const batch = useDiceStore.getState().roll(2);
        t.eq(batch?.length, 2, "×2");
        t.eq(batch![0]!.streak, 1, "first of batch is streaked");
        t.eq(batch![1]!.streak, 1, "second of batch is streaked");
        t.eq(batch![0]!.expected, batch![1]!.expected, "shared expected — same bias");
        const frozen1 = makeRoll(
          "1d20",
          { luck: 0, chaos: 0.5, streak: 1, seed: "oak", seedLocked: true, streamIndex: 1 },
          hot,
        );
        t.eq(batch![1]!.dice[0]!.face, frozen1.record.dice[0]!.face, "second matches frozen history");
        t.eq(frozen1.record.streak, 1, "generator agrees streak applied");
      });
    },
  },
  {
    id: "store-hydrate-snaps-dusty-factors",
    suite: "Session store",
    name: "Hydrated sub-tick luck and chaos snap to the 1% grid",
    description: "Saved luck 0.004 and chaos 0.504 become luck 0 and chaos 0.5 on hydrate. Luck 0.006 rounds to 0.01, the first loaded tick.",
    why: "Old sessions stored raw floats. Without a snap, the slider would read 0 while the next roll still tilted.",
    run: (t) => {
      withStore(() => {
        localStorage.setItem(
          "alea-v1",
          JSON.stringify({
            notation: "1d20",
            pool: { count: 1, sides: 20, keepMode: "none", keepN: 1, exploding: false, modifier: 0, repeat: 1 },
            randomness: { luck: 0.004, chaos: 0.504, streak: 0.004, seed: "", seedLocked: false, streamIndex: 0 },
            history: [],
          }),
        );
        useDiceStore.setState({ hydrated: false });
        useDiceStore.getState().hydrate();
        const r = useDiceStore.getState().randomness;
        t.note("snapped", r);
        t.eq(r.luck, 0, "luck 0.004 → 0");
        t.eq(r.chaos, 0.5, "chaos 50.4 → 50");
        t.eq(r.streak, 0, "streak 0.004 → 0");
        useDiceStore.getState().patchRandomness({ luck: 0.006, chaos: 0.506, streak: -0.006 });
        const q = useDiceStore.getState().randomness;
        t.eq(q.luck, 0.01, "0.6% luck rounds to 1%");
        t.eq(q.chaos, 0.51, "50.6 chaos rounds to 51");
        t.eq(q.streak, -0.01, "−0.6% streak rounds to −1%");
      });
    },
  },
  {
    id: "store-notation-keep-all-and-count-agree",
    suite: "Session store",
    name: "Keep-all notation and a 50-die pool agree with the steppers",
    description: "`2d20kh2` is keep-all, so Keep maps to none. `50d6` maps count 50, inside the 100 cap. A saved row missing expected is dropped on hydrate so the tray cannot crash on toFixed.",
    why: "Typing kh2 used to light Keep High 1 (advantage) while the roll kept both dice. A 50-die fireball used to show 40 on the stepper and throw 50.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().setNotation("2d20kh2");
        t.eq(useDiceStore.getState().pool.keepMode, "none", "kh2 of 2 is keep-all");
        t.eq(useDiceStore.getState().pool.count, 2, "count 2");
        t.eq(useDiceStore.getState().notation, "2d20kh2", "typed notation kept");
        useDiceStore.getState().setNotation("50d6");
        t.eq(useDiceStore.getState().pool.count, 50, "count 50");
        t.eq(useDiceStore.getState().notation, "50d6", "notation 50d6");
        localStorage.setItem(
          "alea-v1",
          JSON.stringify({
            notation: "1d20",
            pool: { count: 1, sides: 20, keepMode: "none", keepN: 1, exploding: false, modifier: 0, repeat: 1 },
            randomness: { luck: 0, chaos: 0.5, streak: 0, seed: "", seedLocked: false, streamIndex: 0 },
            history: [
              { id: "bad", notation: "1d20", total: 10, at: 1, dice: [{ face: 10, sides: 20 }] },
              fakeRoll({ id: "good", notation: "1d6", total: 4, expected: 3.5 }),
            ],
          }),
        );
        useDiceStore.setState({ hydrated: false });
        useDiceStore.getState().hydrate();
        t.eq(useDiceStore.getState().history.map((r) => r.id), ["good"], "broken row dropped");
        t.eq(useDiceStore.getState().last?.id, "good", "last is the surviving row");
      });
    },
  },
  {
    id: "store-invalid-steppers-do-not-clobber",
    suite: "Session store",
    name: "Invalid notation is not overwritten by leftover steppers",
    description: "After an exploding 3d6, typing `1d20+100` keeps the string. patchPool({modifier:1}) and Keep High are ignored. Repeat still applies. A die-chip rebuild writes 1d8 with exploding off.",
    why: "A modifier click used to replace the typed expression with 3d6!+1 while the field still looked like 1d20+100. The leftover Keep High and bang would come along for the ride.",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().setNotation("3d6!");
        t.eq(useDiceStore.getState().pool.exploding, true, "exploding on");
        useDiceStore.getState().setNotation("1d20+100");
        t.eq(useDiceStore.getState().notation, "1d20+100", "invalid kept");
        t.eq(useDiceStore.getState().pool.exploding, true, "leftover exploding until rebuild");
        t.eq(useDiceStore.getState().pool.sides, 6, "leftover sides");
        useDiceStore.getState().patchPool({ modifier: 1 });
        t.eq(useDiceStore.getState().notation, "1d20+100", "modifier stepper ignored");
        useDiceStore.getState().patchPool({ keepMode: "highest", count: 3 });
        t.eq(useDiceStore.getState().notation, "1d20+100", "keep patch ignored");
        useDiceStore.getState().patchPool({ repeat: 4 });
        t.eq(useDiceStore.getState().notation, "1d20+100", "repeat does not rewrite");
        t.eq(useDiceStore.getState().pool.repeat, 4, "repeat still applies");
        useDiceStore.getState().patchPool({
          count: 1,
          sides: 8,
          modifier: 0,
          keepMode: "none",
          exploding: false,
        });
        t.eq(useDiceStore.getState().notation, "1d8", "chip rebuild");
        t.eq(useDiceStore.getState().pool.exploding, false, "bang cleared");
        t.eq(useDiceStore.getState().pool.repeat, 4, "repeat kept");
      });
    },
  },
];
