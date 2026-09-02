import type { DieFace, PoolControls, Randomness, RollRecord } from "@/lib/dice/types";
import { useDiceStore } from "@/lib/dice/store";

export function rngQueue(values: number[]): () => number {
  let i = 0;
  return () => {
    const v = values[Math.min(i, values.length - 1)] ?? 0;
    i += 1;
    return v;
  };
}

export function constantRng(value = 0): () => number {
  return () => value;
}

export function fakeDie(partial: Partial<DieFace> & { face: number; sides: number }): DieFace {
  return {
    id: partial.id ?? `d-${partial.face}`,
    kept: true,
    exploded: false,
    group: 1,
    sign: 1,
    ...partial,
  };
}

export function fakeRoll(partial: Partial<RollRecord> = {}): RollRecord {
  return {
    id: partial.id ?? "r1",
    at: partial.at ?? 1,
    notation: partial.notation ?? "1d20",
    dice: partial.dice ?? [fakeDie({ face: 10, sides: 20 })],
    modifier: partial.modifier ?? 0,
    total: partial.total ?? 10,
    expected: partial.expected ?? 10.5,
    luck: partial.luck ?? 0,
    chaos: partial.chaos ?? 0.5,
    streak: partial.streak ?? 0,
    seedUsed: partial.seedUsed ?? null,
  };
}

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

export function resetStore() {
  useDiceStore.getState().clearHistory();
  useDiceStore.setState({
    notation: "1d20",
    pool: { ...DEFAULT_POOL },
    randomness: { ...DEFAULT_RANDOMNESS },
    history: [],
    last: null,
    rolling: false,
    error: null,
    hydrated: true,
    poolNotice: null,
    rngNotice: null,
  });
}

export function withStore<T>(fn: () => T): T {
  const prev = useDiceStore.getState();
  const snap = {
    notation: prev.notation,
    pool: { ...prev.pool },
    randomness: { ...prev.randomness },
    history: prev.history,
    last: prev.last,
    rolling: prev.rolling,
    error: prev.error,
    hydrated: prev.hydrated,
    poolNotice: prev.poolNotice,
    rngNotice: prev.rngNotice,
  };
  let stored: string | null = null;
  try {
    stored = localStorage.getItem("alea-v1");
  } catch {
    stored = null;
  }
  resetStore();
  try {
    return fn();
  } finally {
    useDiceStore.getState().clearHistory();
    useDiceStore.setState(snap);
    try {
      if (stored === null) localStorage.removeItem("alea-v1");
      else localStorage.setItem("alea-v1", stored);
    } catch {
      /* ignore */
    }
  }
}

export function installMemoryStorage() {
  try {
    if (
      typeof globalThis.localStorage !== "undefined" &&
      typeof globalThis.localStorage.getItem === "function" &&
      typeof globalThis.localStorage.setItem === "function"
    ) {
      globalThis.localStorage.setItem("__test__", "1");
      globalThis.localStorage.removeItem("__test__");
      return;
    }
  } catch {
    /* fall through to install memory storage */
  }
  const mem = new Map<string, string>();
  const storage: Storage = {
    getItem: (k) => (mem.has(k) ? (mem.get(k) ?? null) : null),
    setItem: (k, v) => {
      mem.set(k, String(v));
    },
    removeItem: (k) => {
      mem.delete(k);
    },
    clear: () => mem.clear(),
    key: (i) => [...mem.keys()][i] ?? null,
    get length() {
      return mem.size;
    },
  };
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
}
