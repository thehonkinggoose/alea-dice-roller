export type KeepMode = "none" | "highest" | "lowest";

export type DiceTerm = {
  count: number;
  sides: number;
  keep: { mode: KeepMode; n: number };
  exploding: boolean;
  sign: 1 | -1;
};

export type ExpressionTerm =
  | { kind: "dice"; term: DiceTerm }
  | { kind: "mod"; value: number };

export type ParsedExpression = {
  raw: string;
  terms: ExpressionTerm[];
  modifier: number;
};

export type DieFace = {
  id: string;
  sides: number;
  face: number;
  kept: boolean;
  exploded: boolean;
  group: number;
  sign: 1 | -1;
};

export type Randomness = {
  luck: number;
  chaos: number;
  streak: number;
  seed: string;
  seedLocked: boolean;
  streamIndex: number;
};

export type RollRecord = {
  id: string;
  at: number;
  notation: string;
  dice: DieFace[];
  modifier: number;
  total: number;
  expected: number;
  luck: number;
  chaos: number;
  streak: number;
  seedUsed: string | null;
};

export type PoolControls = {
  count: number;
  sides: number;
  modifier: number;
  keepMode: KeepMode;
  keepN: number;
  exploding: boolean;
  repeat: number;
};
