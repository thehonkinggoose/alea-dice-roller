# Alea — Comprehensive Technical Architecture & Design Specification

> **Document Version:** 1.0.0  
> **Target Audience:** Software Engineers, Systems Architects, and Autonomous AI Agents (Antigravity, Gemini)  
> **Repository:** `thehonkinggoose/alea-dice-roller`  
> **Application Tagline:** *"Alea iacta est — The die is cast."*  

---

## 1. Executive Summary & Philosophy

**Alea** is a specialized, zero-backend, accessibility-first tabletop dice simulation and probabilistic laboratory web application. Built with modern TypeScript, React 19, TanStack Start/Router, and Tailwind CSS v4, Alea provides:

1. **A Full-Spectrum Dice Caster**: Supports standard polyhedral dice, mixed compound expressions (e.g., `2d6+1d4-2`), advantage/disadvantage keep filters (`kh`, `kl`, `dh`, `dl`), exploding dice (`!`), percentile dice (`d%`, `d100`), and flat modifiers with mathematical rigor.
2. **A Controlled Probability Laboratory ("Randomness Lab")**: Enables continuous mathematical bias tuning across three axes—**Luck** (face weighting tilt), **Chaos** (dispersion/kurtosis reshaping), and **Streak** (adaptive autoregressive momentum/mean-reversion)—alongside a choice between the browser's cryptographic RNG (`crypto.getRandomValues`) and a deterministic, seedable pseudo-random generator (`FNV-1a` + `mulberry32`).
3. **Deep Accessibility & Screen Reader Optimization**: Engineered specifically around screen readers (including a dedicated curriculum for **JAWS Professional 2026**). Features live region announcements, dual-mode responsive presentation (accessible semantic tables on desktop vs. semantic `<article>` cards on mobile to preserve naming trees), and acoustic label decoupling (`SpokenLabel` prevents small-caps visual styling from shouting abbreviations).
4. **Local-First & Ephemeral Architecture**: Zero databases, zero cloud dependencies, zero external tracker analytics, and zero authentication overhead. History (up to 200 rolls) persists entirely in the client's `localStorage` (`alea-v1`).
5. **Built-In Self-Verification ("Assay")**: An embedded in-app test suite running 50+ unit and integration specifications capable of executing both in headless Node CLI environments and interactively directly within the browser client.

---

## 2. Technology Stack & Architectural Constraints

| Layer / Concern | Technology | Selection Rationale & Invariants |
| :--- | :--- | :--- |
| **Runtime & Framework** | React 19.2.0, TanStack React Start 1.168.0, TanStack Router 1.170.0 | High-performance routing, SSR/client hydration support, type-safe route trees (`routeTree.gen.ts`). |
| **Build & Dev Tooling** | Vite 8.2.0, Nitro 3 (Vercel preset), `@tailwindcss/vite` | Instant HMR, static prerendering for GitHub Pages, strict port contracts (`0.0.0.0:8080` dev, `127.0.0.1:8081` preview). |
| **Styling & Design System** | Tailwind CSS v4.3.0, Vanilla CSS | Custom "quiet felt table" palette, responsive typography via Google Fonts (Figtree, Instrument Serif, IBM Plex Mono), pure CSS polyhedral clip paths. |
| **State Management** | Zustand 5.0.0 | Lightweight, selector-based external store with integrated `localStorage` synchronization and defensive data sanitization. |
| **Data Visualization** | Recharts 2.13.0 | Real-time reactive bar chart depicting dynamic probability mass functions (PMF) across dice faces. |
| **Notifications & Toasts** | Sonner 2.0.7 | Low-profile dark toasts for clipboard feedback and validation notices. |
| **Accessibility Primitives** | Custom native implementations (`input[type="range"]`, native button `role="switch"`) | Radix UI primitives were intentionally bypassed or stripped for sliders and switches to prevent React 19 SSR/client hydration mismatches. |
| **Deployment Targets** | GitHub Pages (`/alea-dice-roller/`) & Vercel | Dual-target architecture: GitHub Pages uses static SPA prerendering via `scripts/pages-postbuild.mjs`; Vercel uses Nitro serverless output. |

---

## 3. Directory Structure & Key Files

```
alea-dice-roller/
├── .github/workflows/pages.yml      # CI workflow building & deploying static client to GitHub Pages
├── migrations/auth/                 # Pre-wired template schema (dormant; auth is disabled)
├── public/
│   ├── __grok/                      # Platform chrome & PWA manifest artifacts
│   ├── favicon.svg                  # SVG dice favicon
│   └── og.jpg                       # OpenGraph share card image
├── scripts/
│   ├── app-env-plugin.mjs           # Dev plugin exposing env invariants
│   ├── browser-smoke.mjs            # Playwright desktop & mobile render auditing
│   ├── pages-postbuild.mjs          # SPA fallback generator (copies index.html to 404.html, .nojekyll)
│   ├── run-app-tests.mjs            # CLI entry point to run "Assay" tests via headless Vite SSR
│   └── with-app-env.mjs             # Dev process wrapper loading .grok/app-env.json
├── src/
│   ├── components/
│   │   ├── dice/
│   │   │   ├── AppHeader.tsx        # Top navigation, logo, dynamic route hints
│   │   │   ├── Assay.tsx            # In-app interactive test runner ("Assay") component
│   │   │   ├── DiceTray.tsx         # Felt table rendering last roll total, factor badges, visual dice
│   │   │   ├── DieFace.tsx          # Polyhedral die rendering (clip-paths, pips, nat-max rings)
│   │   │   ├── FieldMeta.tsx        # Label and hint wrapper for form controls
│   │   │   ├── RandomnessLab.tsx    # Luck/Chaos/Streak sliders, PMF chart, seed controls
│   │   │   ├── ResultsTable.tsx     # Dual-mode roll history (table on desktop, cards on mobile)
│   │   │   ├── RollPanel.tsx        # Pool notation input, die chips, steppers, presets, roll triggers
│   │   │   ├── SpokenLabel.tsx      # Dual-layer text wrapper decoupling visual case from AT speech
│   │   │   ├── StatsStrip.tsx       # Aggregate session metrics (mean, expected, extremes, nat counts)
│   │   │   ├── Stepper.tsx          # Accessible stepped number inputs with keyboard boundaries
│   │   │   └── docs/                # Built-in documentation & tutorials
│   │   │       ├── DocsPage.tsx     # Standard layout for documentation pages
│   │   │       ├── Faq.tsx          # FAQ content component
│   │   │       ├── JawsTutorial.tsx # Comprehensive JAWS 2026 keyboard tutorial
│   │   │       └── UserGuide.tsx    # Comprehensive user guide component
│   │   ├── preview-host-bridge.tsx  # Iframe postMessage bridge for preview integration
│   │   └── ui/                      # Base accessible UI primitives (Button, Switch, Slider, etc.)
│   ├── lib/
│   │   ├── dice/
│   │   │   ├── a11y.ts              # Screen-reader descriptions, focus rings, slug helpers
│   │   │   ├── engine.ts            # Mathematical distribution tilting, roll execution, Monte Carlo
│   │   │   ├── keyboard.ts          # Focus target detection & ARIA radiogroup arrow navigation
│   │   │   ├── notation.ts          # Expression lexer/parser, formatting, and AST models
│   │   │   ├── rng.ts               # Web Crypto & FNV-1a / mulberry32 seeded RNG generators
│   │   │   ├── store.ts             # Zustand store: pool, randomness, history, sanitization
│   │   │   └── types.ts             # Core domain TypeScript types
│   │   ├── test/                    # "Assay" test harness & test cases
│   │   │   ├── cases/               # Test suites (notation, engine, rng, store, ui, harness)
│   │   │   ├── cli.ts               # Terminal test output formatter
│   │   │   ├── harness.ts           # Test harness asserting deep equality, exceptions, timers
│   │   │   ├── helpers.ts           # Mock dice, fake rolls, memory storage stubs
│   │   │   └── index.ts             # Test catalog aggregation
│   │   ├── error-component.tsx      # Route error boundary displaying raw error.message
│   │   └── utils.ts                 # cn (clsx + twMerge), copyText clipboard wrapper
│   ├── routes/
│   │   ├── __root.tsx               # Root document layout, fonts, skip link, providers, Toaster
│   │   ├── index.tsx                # Main dice caster ("Table" view) & global spacebar handler
│   │   ├── guide.tsx                # User Guide route (`/guide`)
│   │   ├── faq.tsx                  # FAQ route (`/faq`)
│   │   ├── keys.tsx                 # JAWS 2026 Tutorial route (`/keys`)
│   │   └── tests.tsx                # In-app Assay route (`/tests`)
│   ├── router.tsx                   # TanStack Router instance creation with basepath resolution
│   ├── routeTree.gen.ts             # Auto-generated route tree
│   └── styles.css                   # Tailwind v4 theme, polyhedral clip-paths, custom animations
├── package.json                     # Dependency definitions & scripts
├── tsconfig.json                    # Strict TypeScript configuration
└── vite.config.ts                   # Vite configuration (PWA, TanStack Start, Nitro, GitHub Pages base)
```

---

## 4. Core Domain: Dice Notation & AST (`src/lib/dice/notation.ts`)

### 4.1. Grammar & Lexical Specification
Alea parses standard and extended tabletop dice expressions using regular expression tokenization matching `TERM_RE`:

```regex
/([+-])(?:(\d*)d(\d+|f|%)((?:kh|kl|dh|dl|k)\d+)?(!)?|(\d+))/gi
```

#### Supported Lexical Elements:
1. **Implicit & Explicit Signs**: Expressions are prefixed implicitly with `+` if not specified. Subtraction terms (`-1d4`, `-2`) are preserved with `sign: -1`.
2. **Unicode Normalization**: Prior to regex matching, all typographic minuses (en-dash `–`, em-dash `—`, unicode minus `−` / `U+2212`) are normalized to ASCII hyphen-minus `-`. Whitespace is stripped, and casing is converted to lowercase.
3. **Dice Quantities & Die Faces**:
   - `d20` implies `1d20`.
   - Counts are bounded in $[1, 100]$.
   - Polyhedral faces are bounded in $[2, 1000]$.
   - `d%` and `d100` both evaluate to 100 faces.
   - `df` (Fudge stand-in) evaluates to 3 faces (1, 2, 3).
4. **Keep / Drop Specifiers**:
   - `kh<N>`: Keep Highest $N$.
   - `kl<N>`: Keep Lowest $N$.
   - `dh<N>`: Drop Highest $N$ $\rightarrow$ internally compiles to `mode: "lowest", n: Math.max(1, count - N)`.
   - `dl<N>`: Drop Lowest $N$ $\rightarrow$ internally compiles to `mode: "highest", n: Math.max(1, count - N)`.
   - `k<N>`: Shorthand for Keep Highest $N$.
   - **Safety Clamping**: $N$ is clamped so that $1 \le N \le count$. Over-dropping never empties the pool to 0.
   - **Single-Die Keep Rules**: If $count = 1$, keep is mathematically redundant. The parser records `keep.mode = "none"` to prevent phantom advantage states.
5. **Exploding Dice (`!`)**:
   - Appending `!` triggers cascading re-rolls whenever a die lands on its maximum face (`face === sides`). Cascades are capped at `MAX_EXPLOSIONS = 24` to prevent infinite execution cycles.
6. **Flat Modifiers**:
   - Numeric constants (e.g., `+3`, `-5`) accumulate algebraically into a net `modifier` clamped in $[-99, +99]$.

### 4.2. Concrete AST Shape
The notation module compiles strings into `ParsedExpression`:

```typescript
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
  raw: string;                 // e.g., "2d6+3"
  terms: ExpressionTerm[];
  modifier: number;            // Net sum of all flat modifiers
};
```

### 4.3. Two-Way UI Synchronization (`poolFromExpression` vs `formatPool`)
The application bridges raw textual notation with interactive UI steppers:
- **Simple Expressions**: An expression containing exactly one positive dice term (e.g., `2d6+3`, `4d6dl1`) maps directly to `PoolControls`.
- **Compound Expressions**: Expressions with multiple dice terms (e.g., `1d20+1d4`, `2d6-1d4`) or negative dice terms return `null` from `poolFromExpression()`. In this state, UI steppers **lock and display em dashes (`—`)**, preventing partial edits from destroying user-authored compound formulas.
- **Die Chip Actions**: When locked in a compound or invalid state, clicking a polyhedral die chip (`d4`–`d100`) acts as a **Rebuild Action**, resetting the pool to a clean `1dN` while preserving the user's `repeat` count.

---

## 5. Mathematical Engine & Probability Tuning (`src/lib/dice/engine.ts`, `rng.ts`)

### 5.1. Continuous Probability Mass Function Reshaping
Alea does not restrict dice to uniform independent distributions. The engine permits continuous, real-time reshaping of face weights via three parameters: **Luck** ($L \in [-1, 1]$), **Chaos** ($C \in [0, 1]$), and **Streak Bias** ($S_B \in [-1, 1]$).

For a die with $N$ sides, each face $i \in [1, N]$ is normalized onto a centered coordinate $x \in [-1, 1]$:
$$x = \frac{2(i - 1)}{N - 1} - 1 \quad (\text{for } N > 1; \quad x = 0 \text{ if } N = 1)$$

Face weights are computed in `faceWeights()` using two composite factors:
1. **Directional Tilt (Luck + Streak)**:
   $$\text{tilt} = \text{clamp}(L_{\text{eff}} + S_{\text{eff}}, -1, 1)$$
   $$W_{\text{luck}}(x) = \exp(\text{tilt} \times 2.45 \times x)$$
   - When $\text{tilt} > 0$, weights scale exponentially toward higher faces.
   - When $\text{tilt} < 0$, weights scale exponentially toward lower faces.
   - When $\text{tilt} = 0$, $W_{\text{luck}}(x) = 1.0$.

2. **Dispersion / Kurtosis (Chaos)**:
   $$\text{peak}(x) = \exp(-3.4 \times x^2) \quad (\text{Gaussian centered at median})$$
   $$\text{uShape}(x) = 1.08 - \text{peak}(x) \quad (\text{Bimodal distribution peaking at extremes 1 and } N)$$
   Depending on $C_{\text{eff}} \in [0, 1]$:
   - **Focused ($C_{\text{eff}} \le 0.5$)**: Interpolates between median bell curve and uniform:
     $$W_{\text{chaos}}(x) = \text{peak}(x) \cdot \left(1 - \frac{C_{\text{eff}}}{0.5}\right) + 1.0 \cdot \left(\frac{C_{\text{eff}}}{0.5}\right)$$
   - **Wild ($C_{\text{eff}} > 0.5$)**: Interpolates between uniform and extreme bimodal:
     $$W_{\text{chaos}}(x) = 1.0 \cdot \left(1 - \frac{C_{\text{eff}} - 0.5}{0.5}\right) + \text{uShape}(x) \cdot \left(\frac{C_{\text{eff}} - 0.5}{0.5}\right)$$

3. **Composite Weight Calculation**:
   $$W(i) = \max(W_{\text{luck}}(x) \times W_{\text{chaos}}(x), 10^{-12})$$
   The probability for face $i$ is:
   $$P(\text{face} = i) = \frac{W(i)}{\sum_{j=1}^N W(j)}$$

### 5.2. Adaptive Streak Bias Calculation
`streakBiasFrom(history, streakSlider)` dynamically alters the upcoming roll based on recent session deviation:
- Reads the last $k = \min(5, \text{history.length})$ rolls.
- For each roll $r$, calculates normalized deviation:
  $$\delta_r = \frac{r.\text{total} - r.\text{expected}}{\max(1, |r.\text{expected}| \times 0.55)}$$
- Computes mean $z$-score clamped to $[-1.4, 1.4]$:
  $$z = \frac{\text{clamp}\left(\frac{1}{k} \sum \delta_r, -1.4, 1.4\right)}{1.4}$$
- Computes effective bias:
  $$\text{streakBias} = \text{clamp}(\text{streakSlider} \times z, -1, 1)$$
  - **Momentum ($\text{streakSlider} > 0$)**: Positive outcomes produce positive bias (hot streaks run hotter).
  - **Reversion ($\text{streakSlider} < 0$)**: Positive outcomes produce negative bias (gambler's fallacy manifested physically).
- **Batch Isolation Invariant**: During a repeated roll (e.g., `repeat = 6` for D&D ability stats), the streak bias is computed **once prior to the batch**. Individual rolls within the batch do not mutate the streak bias mid-execution.

### 5.3. Fair Deadband & Snapping
To prevent micro-slider displacements or rounding artifacts from loading the table in secret, the engine enforces strict deadbands (`FACTOR_TICK = 0.01`):
- `luckLoaded(l)`: $|l| \ge 0.01$ (otherwise $L_{\text{eff}} = 0$)
- `chaosLoaded(c)`: $|c - 0.5| \ge 0.01$ (otherwise $C_{\text{eff}} = 0.5$)
- `streakLoaded(s)`: $|s| \ge 0.01$ (otherwise $S_{\text{eff}} = 0$)

### 5.4. Dual Random Number Generators (`src/lib/dice/rng.ts`)
Alea uses two distinct RNG implementations depending on seed lock status:
1. **Cryptographic RNG (`cryptoRng`)**:
   Uses `crypto.getRandomValues(new Uint32Array(1))` divided by $2^{32}$. Generates non-deterministic, cryptographically secure uniform random unit floats in $[0, 1)$.
2. **Deterministic Seeded PRNG (`mulberry32` + `hashSeed`)**:
   - Seed string is combined with the monotonically incrementing `streamIndex`: `${seed}#${streamIndex}`.
   - Hashed using the 32-bit `FNV-1a` non-cryptographic hash (initial offset basis `2166136261`, prime `16777619`).
   - Fed into `mulberry32` to produce deterministic, repeatable pseudo-random streams.
   - Editing the seed string resets `streamIndex` to 0.

### 5.5. Expected Value Estimation via Monte Carlo Simulation
Because arbitrary combinations of exploding dice, keep filters, modifiers, and non-linear weights lack simple closed-form analytical expectations, Alea calculates predicted expected values (`estimateExpected`) via Monte Carlo simulation:
- Runs `EXPECTED_SAMPLES = 1200` iterations.
- Uses a deterministic PRNG seeded by the JSON hash of the parsed formula and effective factors.
- Produces a consistent, repeatable expected total used for "vs expected" session metrics.

---

## 6. State Architecture & Storage Contract (`src/lib/dice/store.ts`)

Alea's state is coordinated by a single Zustand store `useDiceStore`.

```typescript
export type DiceState = {
  // Persisted state (localStorage key 'alea-v1')
  notation: string;
  pool: PoolControls;
  randomness: Randomness;
  history: RollRecord[];

  // Ephemeral state
  last: RollRecord | null;
  rolling: boolean;
  error: string | null;
  hydrated: boolean;
  poolNotice: string | null;
  rngNotice: string | null;

  // Actions
  hydrate: () => void;
  setNotation: (value: string, fromPool?: boolean) => void;
  patchPool: (patch: Partial<PoolControls>) => void;
  patchRandomness: (patch: Partial<Randomness>) => void;
  resetRandomness: () => void;
  applyPreset: (notation: string, repeat?: number) => void;
  roll: (timesOverride?: number) => RollRecord[] | null;
  reroll: (record?: RollRecord) => RollRecord[] | null;
  clearHistory: () => void;
};
```

### Defensive Hydration & Sanitization
When loading from `localStorage`, Alea never trusts stored data:
- `sanitizePool`: Enforces integer counts $[1, 100]$, sides $[2, 1000]$, modifiers $[-99, 99]$, repeat $[1, 20]$. Clears invalid keep modes if count $< 2$.
- `sanitizeRandomness`: Clamps luck and streak to $[-1, 1]$, chaos to $[0, 1]$. Automatically clears `seedLocked` if the seed string is blank.
- `sanitizeHistory`: Validates die structures, finite numbers, caps records at `MAX_HISTORY = 200`.

---

## 7. User Interface & Visual Design System

### 7.1. Aesthetic Foundations ("Quiet Felt Table")
The visual identity represents a quiet, dark green/charcoal gaming felt table:
- **Background**: `#0b0c0b` with radial elevated highlights.
- **Cards & Surfaces**: Card surface `#141614`, elevated `#1c1e1b`, border `rgb(236 234 228 / 0.12)`.
- **Text & Foreground**: Light warm ivory `#eceae4`, muted `#9a9b94`, subtle `#7d7e76`.
- **Outcome Accents**: Critical minimums / fumbles `#c45c4a` (vermillion), maximums / crits `#7d9a74` (olive green).
- **Typography Hierarchy**:
  - Headings / Totals: *Instrument Serif* (expressive classic serif).
  - UI Labels / Controls: *Figtree* (clean, legible sans-serif).
  - Dice faces, formulas, notation, code: *IBM Plex Mono* (tabular numbers, monospace).

### 7.2. Pure CSS Polyhedral Die Geometry (`src/styles.css`, `DieFace.tsx`)
Alea uses CSS polygon `clip-path` rules to draw distinct polyhedral silhouettes without external 3D engine overhead:
- **d4**: `polygon(50% 4%, 96% 94%, 4% 94%)` (Tetrahedron)
- **d8**: `polygon(50% 2%, 98% 50%, 50% 98%, 2% 50%)` (Octahedron)
- **d10**: `polygon(50% 0%, 92% 32%, 92% 72%, 50% 100%, 8% 72%, 8% 32%)` (Trapezohedron)
- **d12**: `polygon(50% 0%, 93% 22%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 7% 22%)` (Dodecahedron)
- **d20**: `polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)` (Icosahedron)
- **d6**: Rounded square containing a $3 \times 3$ grid of circular pips (dots) representing faces 1–6.
- **Negative Dice Handling**: Negative penalty dice (`sign: -1`) place the `−` sign badge **outside the clipped polygon container** so that clip-paths do not truncate the minus symbol.

### 7.3. Micro-Animations & Reduced Motion
- Rolling triggers `.die-tumble`: A 700ms cubic-bezier rotation, scale, and subtle blur keyframe sequence (`@keyframes tumble`).
- When `@media (prefers-reduced-motion: reduce)` is detected, `.die-tumble`, button active transforms, and skip-link transitions are disabled.

---

## 8. Accessibility Architecture & JAWS 2026 Integration

Alea was designed to be fully operable via screen readers, featuring first-class support for **JAWS Professional 2026**, NVDA, VoiceOver, and Windows Narrator.

### 8.1. Acoustic Decoupling via `SpokenLabel`
Small-caps headers on dark felt surfaces look elegant visually but cause screen readers to spell out words letter-by-letter (e.g., pronouncing "POOL" as "P-O-O-L").
The `SpokenLabel` component decouples visual rendering from accessible naming:
```tsx
export function SpokenLabel({ children, className }: Props) {
  return (
    <span className={className}>
      <span aria-hidden="true" className="uppercase tracking-widest">
        {children}
      </span>
      <span className="sr-only normal-case tracking-normal">{children}</span>
    </span>
  );
}
```

### 8.2. Spacebar Conflict Resolution (`isTypingTarget`)
In tabletop web apps, developers often attach a global `keydown` listener for the Spacebar to trigger dice rolls. However, in screen reader browse mode (Virtual Cursor), Spacebar is reserved for screen reader navigation or activating buttons/checkboxes.
Alea implements strict target guards in `src/lib/dice/keyboard.ts`:
- Spacebar casting is blocked if `event.target` is an `input`, `textarea`, `select`, `[contenteditable]`, or any interactive element (`button`, `switch`, `slider`, `radio`, `tab`, `link`, etc.).
- The documentation explicitly instructs screen reader users to activate the **Roll Button** or press **Enter** inside the notation input rather than relying on global spacebar casting.

### 8.3. Dual-Mode Responsive History Presentation
Standard CSS-stacked tables (`display: block; width: 100%`) break accessibility trees on mobile devices, stripping table rows and headers.
`ResultsTable.tsx` uses dual semantic rendering:
1. **Desktop View (`md:block hidden`)**: Renders a semantic `<table>` with explicit `<colgroup>`, `<th scope="col">`, `<th scope="row">` (the roll notation), and a descriptive `<caption>`.
2. **Mobile View (`md:hidden`)**: Renders a list of independent `<article>` cards within a `<ul>`, preserving accessible field labels (`<dl>`, `<dt>`, `<dd>`) on viewports $\le 768\text{px}$.

---

## 9. Verification & "Assay" Test Architecture (`src/lib/test/`)

Alea ships with a custom, zero-dependency test framework named **Assay** located in `src/lib/test/`.

### 9.1. Dual-Environment Execution
Tests can be executed in two environments:
1. **Headless Node CLI**: Run via `node scripts/run-app-tests.mjs` (which invokes `vite` SSR to execute `cli.ts`).
2. **In-Browser Client**: Navigating to `/tests` loads `Assay.tsx`, allowing users and testers to run individual test cases or the entire suite live in the DOM.

### 9.2. Test Suites Overview
| Suite | Case Count | Coverage Areas |
| :--- | :--- | :--- |
| **Notation** | 12 | Shorthand `d20`, space/casing collapse, signed subtraction (`2d6-1d4`), unicode minuses, keep high/low (`kh`, `kl`, `dh`, `dl`), clamp limits, exploding bang (`!`), percentile aliases (`d%`, `d100`), invalid string rejection (`NotationError`). |
| **RNG** | 5 | FNV-1a hash determinism, `mulberry32` unit interval bounds $[0, 1)$, seed isolation from Web Crypto, unicode emoji seed stability. |
| **Face Weights & Engine** | 16 | Weight uniformity at fair settings, luck tilt, chaos kurtosis/bimodality, streak bias accumulation, `sampleWeighted` boundary handling, expected face calculation, Monte Carlo convergence. |
| **Session Store** | 11 | Presets parsing, notation two-way synchronization, repeat persistence, single-die keep stripping, garbage hydration sanitization, roll animation timer lifecycle. |
| **Interface** | 15 | Polyhedral clip-path assignment, d6 pip rendering, negative die badge placement outside clip-paths, stepper bound exhaustion, ARIA role verification, empty states vs. populated states. |
| **Harness** | 2 | Deep equality verification, circular reference stringification, browser-only environment skipping logic. |

---

## 10. AI Agent Operational Guidelines (Antigravity & Gemini)

When interacting with or extending this codebase, autonomous AI agents MUST adhere to the following strict architectural rules:

1. **Authentication & Persistence Invariant**:
   - **Do NOT add auth or remote databases.** Do not import `@/lib/db` or create server database migrations. Alea is strictly a client-side, local-first application.
2. **Hydration & Component Primitives Invariant**:
   - Do **NOT** replace the custom native `<Slider>` or `<Switch>` with Radix UI slider/switch primitives without testing SSR hydration. The custom primitives were specifically created to eliminate React 19 SSR hydration mismatches.
3. **Stepper Locking on Compound Notation**:
   - If extending the notation parser, ensure that compound expressions (expressions with $> 1$ dice term or negative dice) continue to return `null` from `poolFromExpression()`. Never allow stepper increments to truncate or rewrite a compound notation string like `1d20+1d4`.
4. **Accessible Naming & Small Caps**:
   - Never wrap visual labels directly in uppercase CSS classes without using `SpokenLabel`. Screen reader users must hear normal sentence case.
5. **Deployment Basepaths**:
   - GitHub Pages builds use the base path `/alea-dice-roller/`. When adding internal links or routing helpers, always use `@tanstack/react-router` `Link` components or resolve through `import.meta.env.BASE_URL`.
6. **Platform Workspace Script**:
   - Never remove or overwrite `/workspace/startup.sh`. It is the platform hibernate/revive restart contract that maintains the preview on `0.0.0.0:8080`.
