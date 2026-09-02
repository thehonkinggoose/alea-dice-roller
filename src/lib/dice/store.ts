import { create } from "zustand";
import { clamp, formatPool, NotationError, parseNotation, poolFromExpression, DICE_COUNT_MAX, DIE_SIDES_MAX, MODIFIER_ABS_MAX, isCompoundExpression } from "./notation";
import { makeRoll } from "./engine";
import type { DieFace, PoolControls, Randomness, RollRecord } from "./types";

const STORAGE_KEY = "alea-v1";
const MAX_HISTORY = 200;

const DEFAULT_POOL: PoolControls = {
  count: 1,
  sides: 20,
  modifier: 0,
  keepMode: "none",
  keepN: 1,
  exploding: false,
  repeat: 1,
};

const DEFAULT_RANDOMNESS: Randomness = {
  luck: 0,
  chaos: 0.5,
  streak: 0,
  seed: "",
  seedLocked: false,
  streamIndex: 0,
};

export const PRESETS: { label: string; notation: string; repeat?: number; hint: string }[] = [
  { label: "d20", notation: "1d20", hint: "One twenty-sided die" },
  { label: "d20+5", notation: "1d20+5", hint: "A d20 plus five" },
  { label: "Adv", notation: "2d20kh1", hint: "Advantage: two d20s, keep the higher" },
  { label: "Dis", notation: "2d20kl1", hint: "Disadvantage: two d20s, keep the lower" },
  { label: "2d6", notation: "2d6", hint: "Two six-sided dice" },
  { label: "3d6", notation: "3d6", hint: "Three six-sided dice" },
  { label: "4d6dl1", notation: "4d6dl1", hint: "Four d6, drop the lowest" },
  { label: "Stats", notation: "4d6dl1", repeat: 6, hint: "Six ability scores: 4d6 drop lowest, six times" },
  { label: "d100", notation: "1d100", hint: "Percentile die, faces 1–100" },
  { label: "8d6", notation: "8d6", hint: "Eight six-sided dice" },
];

import { playDiceRollSound } from "./sound";

export const DIE_SIDES = [4, 6, 8, 10, 12, 20, 100] as const;

type PersistShape = {
  notation: string;
  pool: PoolControls;
  randomness: Randomness;
  history: RollRecord[];
  soundEnabled?: boolean;
};

type DiceState = PersistShape & {
  last: RollRecord | null;
  lastBatch: RollRecord[] | null;
  rollCount: number;
  rolling: boolean;
  error: string | null;
  hydrated: boolean;
  poolNotice: string | null;
  rngNotice: string | null;
  soundEnabled: boolean;
  setNotation: (value: string, fromPool?: boolean) => void;
  patchPool: (patch: Partial<PoolControls>) => void;
  patchRandomness: (patch: Partial<Randomness>) => void;
  resetRandomness: () => void;
  applyPreset: (notation: string, repeat?: number) => void;
  loadPoolFromNotation: (notation: string) => boolean;
  roll: (timesOverride?: number) => RollRecord[] | null;
  reroll: (record?: RollRecord) => RollRecord[] | null;
  deleteRoll: (id: string) => void;
  restoreHistory: (records: RollRecord[]) => void;
  clearHistory: () => void;
  toggleSound: () => void;
  hydrate: () => void;
};

function syncNotation(pool: PoolControls): string {
  return formatPool(pool);
}

function tickPercent(n: number): number {
  return Math.round(n * 100) / 100;
}

function sanitizePool(raw: Partial<PoolControls> | undefined): PoolControls {
  const pool = { ...DEFAULT_POOL, ...raw };
  pool.count = Math.min(DICE_COUNT_MAX, Math.max(1, Math.round(Number(pool.count)) || 1));
  pool.sides = Math.min(DIE_SIDES_MAX, Math.max(2, Math.round(Number(pool.sides)) || 20));
  pool.modifier = Math.min(MODIFIER_ABS_MAX, Math.max(-MODIFIER_ABS_MAX, Math.round(Number(pool.modifier)) || 0));
  pool.keepN = Math.round(Number(pool.keepN)) || 1;
  pool.repeat = Math.min(20, Math.max(1, Math.round(Number(pool.repeat)) || 1));
  pool.exploding = Boolean(pool.exploding);
  if (pool.count < 2) pool.keepMode = "none";
  if (pool.keepMode !== "none" && pool.keepMode !== "highest" && pool.keepMode !== "lowest") {
    pool.keepMode = "none";
  }
  if (pool.keepMode !== "none") {
    pool.keepN = Math.min(Math.max(1, pool.keepN), Math.max(1, pool.count - 1));
  } else {
    pool.keepN = Math.max(1, pool.keepN);
  }
  return pool;
}

function sanitizeRandomness(raw: Partial<Randomness> | undefined): Randomness {
  const randomness = { ...DEFAULT_RANDOMNESS, ...raw };
  randomness.luck = clamp(tickPercent(Number(randomness.luck) || 0), -1, 1);
  const chaosRaw = Number.isFinite(Number(randomness.chaos)) ? Number(randomness.chaos) : 0.5;
  randomness.chaos = clamp(tickPercent(chaosRaw), 0, 1);
  randomness.streak = clamp(tickPercent(Number(randomness.streak) || 0), -1, 1);
  randomness.seed = typeof randomness.seed === "string" ? randomness.seed : "";
  randomness.streamIndex = Math.max(0, Math.floor(Number(randomness.streamIndex)) || 0);
  randomness.seedLocked = Boolean(randomness.seedLocked) && randomness.seed.trim().length > 0;
  return randomness;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function sanitizeDie(raw: unknown): DieFace | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Partial<DieFace>;
  if (!isFiniteNumber(d.face) || !isFiniteNumber(d.sides)) return null;
  return {
    id: typeof d.id === "string" && d.id ? d.id : `d${d.face}`,
    sides: Math.round(d.sides),
    face: Math.round(d.face),
    kept: d.kept !== false,
    exploded: Boolean(d.exploded),
    group: isFiniteNumber(d.group) ? d.group : 1,
    sign: d.sign === -1 ? -1 : 1,
  };
}

function sanitizeHistory(raw: unknown): RollRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: RollRecord[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Partial<RollRecord>;
    if (typeof r.id !== "string" || !r.id) continue;
    if (typeof r.notation !== "string" || !r.notation) continue;
    if (!isFiniteNumber(r.total) || !isFiniteNumber(r.expected) || !isFiniteNumber(r.at)) continue;
    if (!Array.isArray(r.dice)) continue;
    const dice = r.dice.map(sanitizeDie).filter((d): d is DieFace => d !== null);
    if (dice.length === 0) continue;
    out.push({
      id: r.id,
      at: r.at,
      notation: r.notation,
      dice,
      modifier: isFiniteNumber(r.modifier) ? r.modifier : 0,
      total: r.total,
      expected: r.expected,
      luck: isFiniteNumber(r.luck) ? r.luck : 0,
      chaos: isFiniteNumber(r.chaos) ? r.chaos : 0.5,
      streak: isFiniteNumber(r.streak) ? r.streak : 0,
      seedUsed: typeof r.seedUsed === "string" && r.seedUsed ? r.seedUsed : null,
    });
  }
  return out.slice(0, MAX_HISTORY);
}

function persist(state: PersistShape) {
  try {
    const payload: PersistShape = {
      notation: state.notation,
      pool: state.pool,
      randomness: state.randomness,
      history: state.history.slice(0, MAX_HISTORY),
      soundEnabled: state.soundEnabled,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

function couplingNotice(prev: PoolControls, next: PoolControls, patch: Partial<PoolControls>): string | null {
  const keepTouched = Object.prototype.hasOwnProperty.call(patch, "keepMode");
  const keepNTouched = Object.prototype.hasOwnProperty.call(patch, "keepN");
  if (!keepTouched && prev.keepMode !== "none" && next.keepMode === "none") {
    const which = prev.keepMode === "lowest" ? "Keep Low" : "Keep High";
    return `${which} turned off — it needs two or more dice.`;
  }
  if (
    !keepNTouched &&
    next.keepMode !== "none" &&
    next.keepN !== prev.keepN &&
    next.keepN < prev.keepN
  ) {
    return `Keep reduced to ${next.keepN} so it stays below the number of dice.`;
  }
  return null;
}

function isPoolRebuild(patch: Partial<PoolControls>): boolean {
  return (
    Object.prototype.hasOwnProperty.call(patch, "count") &&
    Object.prototype.hasOwnProperty.call(patch, "sides") &&
    Object.prototype.hasOwnProperty.call(patch, "keepMode")
  );
}

function notationOwnership(notation: string): "simple" | "compound" | "invalid" {
  try {
    return isCompoundExpression(parseNotation(notation)) ? "compound" : "simple";
  } catch {
    return "invalid";
  }
}

let rollAnimTimer: ReturnType<typeof setTimeout> | null = null;

function startRollAnimation(set: (partial: Partial<DiceState>) => void) {
  if (rollAnimTimer) clearTimeout(rollAnimTimer);
  rollAnimTimer = setTimeout(() => {
    set({ rolling: false });
    rollAnimTimer = null;
  }, 720);
}

export const useDiceStore = create<DiceState>((set, get) => {
  const cast = (raw: string, times: number): RollRecord[] | null => {
    if (get().rolling) return null;
    const { randomness, history } = get();
    let parsed;
    try {
      parsed = parseNotation(raw);
    } catch (err) {
      set({
        error:
          err instanceof NotationError || err instanceof Error
            ? err.message
            : "Invalid expression.",
      });
      return null;
    }

    const n = Math.min(50, Math.max(1, times));
    const records: RollRecord[] = [];
    let streamIndex = randomness.streamIndex;
    let nextHistory = history;

    for (let i = 0; i < n; i++) {
      const { record, streamIndex: nextIndex } = makeRoll(
        parsed.raw,
        { ...randomness, streamIndex },
        history,
      );
      records.push(record);
      streamIndex = nextIndex;
      nextHistory = [record, ...nextHistory].slice(0, MAX_HISTORY);
    }

    if (get().soundEnabled) {
      const hasCrit = records.some((r) =>
        r.dice.some((d) => d.kept && (d.sign ?? 1) > 0 && d.sides >= 20 && d.face === d.sides),
      );
      const hasFumble = records.some((r) =>
        r.dice.some((d) => d.kept && !d.exploded && (d.sign ?? 1) > 0 && d.sides >= 20 && d.face === 1),
      );
      playDiceRollSound({ isCrit: Boolean(hasCrit), isFumble: Boolean(!hasCrit && hasFumble) });
    }

    set({
      history: nextHistory,
      last: records[records.length - 1] ?? null,
      lastBatch: records.length > 1 ? records : null,
      rollCount: (get().rollCount || 0) + 1,
      randomness: { ...randomness, streamIndex },
      rolling: true,
      error: null,
    });
    persist(get());
    startRollAnimation(set);
    return records;
  };

  return {
    notation: "1d20",
    pool: { ...DEFAULT_POOL },
    randomness: { ...DEFAULT_RANDOMNESS },
    history: [],
    last: null,
    lastBatch: null,
    rollCount: 0,
    rolling: false,
    error: null,
    hydrated: false,
    poolNotice: null,
    rngNotice: null,
    soundEnabled: false,

    hydrate: () => {
      if (get().hydrated || typeof window === "undefined") return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<PersistShape>;
          const history = sanitizeHistory(saved.history);
          set({
            notation: typeof saved.notation === "string" && saved.notation ? saved.notation : "1d20",
            pool: sanitizePool(saved.pool),
            randomness: sanitizeRandomness(saved.randomness),
            history,
            last: history[0] ?? null,
            rolling: false,
            poolNotice: null,
            rngNotice: null,
            soundEnabled: Boolean(saved.soundEnabled),
          });
        }
      } catch {
        /* ignore */
      }
      set({ hydrated: true });
    },

    setNotation: (value, fromPool = false) => {
      const next: Partial<DiceState> = { notation: value, error: null };
      if (!fromPool) {
        try {
          const parsed = parseNotation(value);
          const pool = poolFromExpression(parsed);
          if (pool) next.pool = sanitizePool({ ...get().pool, ...pool, repeat: get().pool.repeat });
        } catch {
          /* live typing */
        }
      }
      set(next);
      persist(get());
    },

    patchPool: (patch) => {
      const prev = get().pool;
      const pool = sanitizePool({ ...prev, ...patch });
      const keys = Object.keys(patch);
      const onlyRepeat = keys.length === 1 && keys[0] === "repeat";
      const poolNotice = couplingNotice(prev, pool, patch);
      if (onlyRepeat) {
        set({ pool, poolNotice });
        persist(get());
        return;
      }
      const ownership = notationOwnership(get().notation);
      if ((ownership === "compound" || ownership === "invalid") && !isPoolRebuild(patch)) {
        return;
      }
      set({ pool, notation: syncNotation(pool), error: null, poolNotice });
      persist(get());
    },

    patchRandomness: (patch) => {
      const prev = get().randomness;
      const randomness = sanitizeRandomness({ ...prev, ...patch });
      const lockCleared =
        prev.seedLocked &&
        !randomness.seedLocked &&
        !Object.prototype.hasOwnProperty.call(patch, "seedLocked");
      set({
        randomness,
        rngNotice: lockCleared ? "Lock turned off — a locked table needs a seed." : null,
      });
      persist(get());
    },

    resetRandomness: () => {
      const prev = get().randomness;
      set({
        randomness: sanitizeRandomness({
          ...DEFAULT_RANDOMNESS,
          seed: prev.seed,
          seedLocked: prev.seedLocked,
          streamIndex: prev.streamIndex,
        }),
        rngNotice: null,
      });
      persist(get());
    },

    applyPreset: (notation, repeat = 1) => {
      try {
        const parsed = parseNotation(notation);
        const derived = poolFromExpression(parsed);
        const pool = derived
          ? sanitizePool({ ...get().pool, ...derived, repeat })
          : sanitizePool({ ...get().pool, repeat });
        set({ notation, pool, error: null, poolNotice: null });
        persist(get());
      } catch (err) {
        set({ error: err instanceof Error ? err.message : "Invalid preset." });
      }
    },

    loadPoolFromNotation: (notation: string) => {
      try {
        const parsed = parseNotation(notation);
        const derived = poolFromExpression(parsed);
        const pool = derived
          ? sanitizePool({ ...get().pool, ...derived, repeat: get().pool.repeat })
          : get().pool;
        set({ notation, pool, error: null, poolNotice: null });
        persist(get());
        return true;
      } catch (err) {
        set({ error: err instanceof Error ? err.message : "Invalid expression." });
        return false;
      }
    },

    roll: (timesOverride?: number) => {
      const { notation, pool } = get();
      return cast(notation, timesOverride ?? pool.repeat);
    },

    reroll: (record) => {
      if (get().rolling) return null;
      const target = record ?? get().last;
      if (!target) return null;
      return cast(target.notation, 1);
    },

    deleteRoll: (id: string) => {
      const currentHistory = get().history;
      const nextHistory = currentHistory.filter((r) => r.id !== id);
      if (nextHistory.length === currentHistory.length) return;
      const nextLast = nextHistory[0] ?? null;
      const nextLastBatch = get().lastBatch ? get().lastBatch!.filter((r) => r.id !== id) : null;
      set({
        history: nextHistory,
        last: nextLast,
        lastBatch: nextLastBatch && nextLastBatch.length > 1 ? nextLastBatch : null,
      });
      persist(get());
    },

    restoreHistory: (records: RollRecord[]) => {
      const history = sanitizeHistory(records);
      set({
        history,
        last: history[0] ?? null,
      });
      persist(get());
    },

    clearHistory: () => {
      if (rollAnimTimer) {
        clearTimeout(rollAnimTimer);
        rollAnimTimer = null;
      }
      set({ history: [], last: null, lastBatch: null, rolling: false });
      persist(get());
    },

    toggleSound: () => {
      const next = !get().soundEnabled;
      set({ soundEnabled: next });
      persist(get());
    },
  };
});
