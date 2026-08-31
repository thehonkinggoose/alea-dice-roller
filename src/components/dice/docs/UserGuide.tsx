import { DocsPage } from "@/components/dice/docs/DocsPage";

export function UserGuide() {
  return (
    <DocsPage
      eyebrow="Guide"
      title="How the table works"
      headingId="guide-heading"
      lede="Alea is a dice caster. You write a pool, load the table or leave it fair, and read every face. History stays on this device. Nothing is sent to a server."
      sections={[
        {
          id: "at-a-glance",
          title: "The table at a glance",
          children: (
            <>
              <p>
                The first heading on every page is Alea. Under it, the primary navigation has five tabs: Table, Guide, FAQ, Keys, and Tests. The Table tab is the caster. This Guide explains it. FAQ answers short questions. Keys is a JAWS Professional 2026 tutorial. Tests is the live Assay — the same unit tests the table is proved with.
              </p>
              <p>
                On the Table tab the page is split into landmarks a screen reader can list: Last cast, Session statistics, Pool, Randomness, and Results. Pool is the dice you will throw. Last cast is the most recent result. Randomness is luck, chaos, streak, and seed. Results is the session log.
              </p>
              <p>
                A skip link sits at the top of the document: “Skip to main content.” It is the first Tab stop.
              </p>
            </>
          ),
        },
        {
          id: "pool",
          title: "Building a pool",
          children: (
            <>
              <p>
                A pool is one expression, like <span className="font-mono text-foreground">2d6+3</span> — two six-sided dice plus three. The live readout under the Pool heading always names what the next Roll will actually cast. If the readout and the steppers ever disagree, trust the readout.
              </p>
              <p>
                <strong className="font-medium text-foreground">Notation</strong> is the written form. Letters are case-insensitive. Spaces are ignored. Unicode minuses paste as subtraction.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <span className="font-mono text-foreground">d20</span> is one twenty-sided die. Omitting the count means 1.
                </li>
                <li>
                  <span className="font-mono text-foreground">2d6+3</span> is two sixes plus a flat 3.
                </li>
                <li>
                  <span className="font-mono text-foreground">2d20kh1</span> is advantage: two d20s, keep the higher.
                </li>
                <li>
                  <span className="font-mono text-foreground">2d20kl1</span> is disadvantage: keep the lower.
                </li>
                <li>
                  <span className="font-mono text-foreground">4d6dl1</span> is four d6, drop the lowest (keep 3 high).
                </li>
                <li>
                  <span className="font-mono text-foreground">3d6!</span> explodes. A bang after a die means: if that die shows its highest face, roll it again and add the new roll. Chains stop after 24 extras.
                </li>
                <li>
                  <span className="font-mono text-foreground">1d20+1d4</span> is a mixed, compound pool. Steppers lock.
                </li>
                <li>
                  <span className="font-mono text-foreground">d%</span> and <span className="font-mono text-foreground">d100</span> are the same hundred-sider. <span className="font-mono text-foreground">dF</span> is a three-faced stand-in, not a true Fudge die.
                </li>
              </ul>
              <p>
                Limits: at most 100 dice, 1000 faces, and a modifier from −99 to +99. Past those, Roll waits and the live readout names the problem.
              </p>
            </>
          ),
        },
        {
          id: "steppers-and-keep",
          title: "Steppers, Keep, and exploding",
          children: (
            <>
              <p>
                On a simple pool (one die type, valid notation) the steppers drive the expression: Dice, Sides, Modifier, Repeat, and How many. Decrease and Increase name the current value. Arrow keys, Home, and End work when a stepper button is focused.
              </p>
              <p>
                <strong className="font-medium text-foreground">Keep</strong> decides which faces count. Keep all counts every die. High keeps the best — advantage is two d20s, keep 1 high. Low keeps the worst. High and Low need two or more dice; a single die stays on Keep all. How many is how many faces still count when High or Low is on.
              </p>
              <p>
                Typing <span className="font-mono text-foreground">1d20kh1</span> on a single die is a no-op keep. The live readout warns that keep needs two dice, and the store maps it to Keep all.
              </p>
              <p>
                <strong className="font-medium text-foreground">Exploding</strong> is a switch. When on, a die that lands on its highest face is rolled again and the extra face is added. A bang in the notation turns it on. Typing a new expression without a bang turns it off. On a mixed pool the switch follows the bangs and locks, because some dice may explode and others may not.
              </p>
              <p>
                <strong className="font-medium text-foreground">Repeat</strong> is casts in one click. Stats uses 6. Repeat is independent of the notation string. A Repeat batch freezes streak: all six scores use the curve from before the click, so they do not feed each other.
              </p>
              <p>
                Die chips (d4 through d100) select the size of a simple pool. On a mixed or invalid pool they are rebuild actions: they start a fresh 1dN, reset Keep, exploding, and modifier, and keep Repeat.
              </p>
              <p>
                Presets are ready-made pools. Adv is advantage. Dis is disadvantage. Stats is six ability scores. Each preset also sets Repeat.
              </p>
            </>
          ),
        },
        {
          id: "casting",
          title: "Casting",
          children: (
            <>
              <p>
                <strong className="font-medium text-foreground">Roll</strong> casts the pool shown above it. If Repeat is 6 it reads Roll ×6. Enter in the notation field submits the same form. Spacebar also casts, except when a field, switch, slider, button, link, or radio is focused — those keep Space for themselves. If the pool is invalid, Roll is disabled and named “Roll, waits for a valid pool.”
              </p>
              <p>
                Screen reader users should prefer the Roll button. In JAWS browse mode, Space belongs to JAWS, not to the caster. The Keys tab walks this in detail.
              </p>
              <p>
                <strong className="font-medium text-foreground">Reroll</strong> casts the last result’s expression once with the current luck, chaos, streak, and seed. It does not rewrite this pool. A Reroll on a results row does the same for that row. Repeat is ignored: reroll is always one cast.
              </p>
              <p>
                <strong className="font-medium text-foreground">Copy</strong> puts the last line on the clipboard as text. Each results row has its own Copy.
              </p>
            </>
          ),
        },
        {
          id: "reading",
          title: "Reading a result",
          children: (
            <>
              <p>
                Last cast shows the total, then each die. Faded dice were dropped by Keep and are named “dropped, not counted.” An exploded face is named “exploded.” A subtracted die is named with “minus.” Expected is the average total for this pool with the luck, chaos, and streak that were on for this roll — not a promise of the next one.
              </p>
              <p>
                Session statistics summarize this table: how many casts, mean total, mean expected, high, low, max faces (a kept die showed its highest face), and ones (a kept die showed a 1).
              </p>
              <p>
                On a wide screen, Results is a real table with headers, a caption, and the notation as the row title. On a phone, each roll is a named card so a screen reader still gets labels — a CSS-stacked table would have lost its rows. Factor chips (L, C, S, seed) name luck, chaos, streak, or a locked seed. Fair means none of those were on.
              </p>
            </>
          ),
        },
        {
          id: "randomness",
          title: "Luck, chaos, streak, and seed",
          children: (
            <>
              <p>
                Fair is chaos 50 with luck and streak at 0. If the lab says fair, the engine is fair. A factor below 1% snaps to fair so a dusty slider cannot load the table in secret.
              </p>
              <p>
                <strong className="font-medium text-foreground">Luck</strong> biases faces high or low. At +100 a d20 averages about 16 instead of 10.5. Unlucky tilts toward 1.
              </p>
              <p>
                <strong className="font-medium text-foreground">Chaos</strong> at 50 is even odds. Lower bunches near the middle. Higher makes crits and fumbles more common.
              </p>
              <p>
                <strong className="font-medium text-foreground">Streak</strong> reads up to five recent totals against their expected values. Momentum keeps a hot streak hot. Revert makes the next rolls go cold. If there is no history, streak waits. If recent totals sit on expected, streak is armed but not tilting yet. Repeat does not feed streak inside one click.
              </p>
              <p>
                The curve chart is the odds of each face on the primary die. Pool E is the average total the table will compare against — keep, explode, and extra dice are included.
              </p>
              <p>
                <strong className="font-medium text-foreground">Seed</strong> is an optional phrase that can replay the same sequence of faces. Lock it on after typing a seed. Editing the seed restarts the sequence from the beginning. Unlocked uses the browser’s cryptographic RNG — true random, not repeatable. Fair resets luck, chaos, and streak; the seed and stream are kept.
              </p>
              <p>
                Lab copy describes the next roll. Tray chips describe the last one. Those can differ if you moved a slider after you cast.
              </p>
            </>
          ),
        },
        {
          id: "history",
          title: "History, export, and this device",
          children: (
            <>
              <p>
                Up to 200 rolls stay in this browser under a local key. There is no account and no cross-device sync. Clear wipes this session from this device. Export downloads a CSV of time, notation, faces, kept, dropped, modifier, total, expected, and the factors that were on.
              </p>
            </>
          ),
        },
        {
          id: "compound-and-invalid",
          title: "When the steppers lock",
          children: (
            <>
              <p>
                A mixed pool (more than one die type) or an illegal expression locks Dice, Sides, Modifier, Keep, exploding, and How many. They show a dash so a leftover simple pool cannot pretend to still apply. Repeat still works. A die chip starts a fresh 1dN from that size. The live readout stays on the string you typed until the pool is valid again.
              </p>
            </>
          ),
        },
        {
          id: "keyboard-and-readers",
          title: "Keyboard and screen readers",
          children: (
            <>
              <p>
                Everything on the table is reachable without a pointer. Tab moves through controls. Keep and Die are radio groups: arrows, Home, and End move the selection. Steppers accept arrows, Home, and End. Sliders are native ranges with a spoken value. Switches announce pressed or not pressed.
              </p>
              <p>
                Labels stay in small caps visually; a screen reader hears them in normal case — Table, not TABLE. The Keys tab is a full tutorial for JAWS Professional 2026, including Virtual Cursor, Forms Mode, and why Space-to-roll must not be used in browse mode.
              </p>
            </>
          ),
        },
        {
          id: "assay",
          title: "Assay",
          children: (
            <>
              <p>
                The Tests tab runs the same catalog the command-line runner uses. Open a case for the description, why it exists, every assertion with expected versus actual, the log, and the raw technical record. Browser-only cases skip in the shell and run here.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
