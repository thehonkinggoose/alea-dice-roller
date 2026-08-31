import { DocsPage, Kbd, KeyTable } from "@/components/dice/docs/DocsPage";

const COLS = ["Action", "Keystroke", "Notes"] as const;

export function JawsTutorial() {
  return (
    <DocsPage
      eyebrow="Keys"
      title="Cast with JAWS Professional 2026"
      headingId="keys-heading"
      lede="A lesson, not a cheat sheet. Work top to bottom in Chrome or Edge with JAWS 2026 Professional running. Desktop layout uses Insert as the JAWS key; laptop layout uses Caps Lock in its place."
      sections={[
        {
          id: "setup",
          title: "Before you start",
          children: (
            <>
              <p>
                This tutorial is written for JAWS Professional 2026 on Windows, in Chrome or Microsoft Edge. Firefox works. The Table tab is the caster. Open it before lesson 1.
              </p>
              <p>
                Desktop keyboard: the JAWS key is <Kbd>Insert</Kbd>. Laptop keyboard: the JAWS key is <Kbd>Caps Lock</Kbd>. When this page says Insert+F6, press Caps Lock+F6 on a laptop layout. To leave Forms Mode, desktop uses <Kbd>Num Pad Plus</Kbd>; laptop layout uses <Kbd>Caps Lock+Semicolon</Kbd>.
              </p>
              <p>
                Turn off JAWS Smart Navigation if radio groups or sliders feel jumpy. Press <Kbd>Insert+X</Kbd> to toggle it temporarily. Standard Virtual Cursor is what this table was built for.
              </p>
              <p>
                VoiceOver, NVDA, and Narrator can use the same headings, landmarks, and form names. The keystrokes below are JAWS-only.
              </p>
            </>
          ),
        },
        {
          id: "map",
          title: "Map the page",
          children: (
            <>
              <p>
                Press <Kbd>Tab</Kbd> once. You should hear Skip to main content. Press Enter to jump past the chrome, or Tab again to the Table link in the primary navigation.
              </p>
              <p>
                Press <Kbd>Insert+F6</Kbd> for the heading list. On the Table tab you should hear: Alea (level 1), then Last cast, Session statistics, Pool, Randomness, and Results (level 2). Choose Pool and press Enter to jump there.
              </p>
              <p>
                Press <Kbd>Insert+F3</Kbd> for Virtual HTML features, or <Kbd>R</Kbd> to walk regions. <Kbd>Q</Kbd> jumps to the main region. The pool form is named Dice pool. Results is a table on a wide window and a list of articles on a phone.
              </p>
              <p>
                Press <Kbd>Insert+F7</Kbd> for links (the five tabs). Press <Kbd>Insert+F5</Kbd> for form fields — notation, die radios, Keep radios, exploding, luck, chaos, streak, seed, lock, Roll, Reroll, Copy.
              </p>
            </>
          ),
        },
        {
          id: "modes",
          title: "Virtual Cursor and Forms Mode",
          children: (
            <>
              <p>
                JAWS has two modes on the web. Virtual Cursor (browse mode) is the default. Arrow keys read the page. Letters jump: <Kbd>H</Kbd> heading, <Kbd>F</Kbd> form control, <Kbd>B</Kbd> button, <Kbd>A</Kbd> radio, <Kbd>E</Kbd> edit box, <Kbd>T</Kbd> table, <Kbd>R</Kbd> region. Almost no key reaches the app.
              </p>
              <p>
                Forms Mode (PC cursor) passes keys to the browser. Tab lands on a field and JAWS usually enters Forms Mode with a higher-pitched beep. Type in notation. Arrows move a slider or a radio group. Space and Enter activate the focused control. Leave Forms Mode with <Kbd>Num Pad Plus</Kbd> (desktop) or <Kbd>Caps Lock+Semicolon</Kbd> (laptop). A lower-pitched beep means Virtual Cursor is back. <Kbd>Insert+Z</Kbd> toggles the virtual cursor if you need to force it.
              </p>
              <p>
                If a letter such as H types into a box when you meant “next heading,” you are still in Forms Mode. Leave it, then use the quick key.
              </p>
            </>
          ),
        },
        {
          id: "space",
          title: "The Space bar — read this first",
          children: (
            <>
              <p>
                On the Table tab, Space casts the pool when focus is not on a control. That shortcut is for sighted keyboard users on the felt. It fights JAWS.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  In Virtual Cursor, Space belongs to JAWS. It may scroll the virtual cursor or activate whatever the cursor is on. Do not use it to roll.
                </li>
                <li>
                  In Forms Mode on Roll, Space activates Roll. That is the right way to cast with Space.
                </li>
                <li>
                  In Forms Mode on Exploding or Lock, Space toggles the switch and does not also roll — the table treats a focused switch as busy.
                </li>
                <li>
                  In Forms Mode in Notation, Space types a space. The expression still parses, because spaces are ignored.
                </li>
                <li>
                  If focus is on the page itself (for example after Skip to main content), Space will roll. That surprise is why this tutorial uses the Roll button.
                </li>
              </ul>
              <p>
                Rule: with JAWS, cast with the Roll button or with Enter in the notation field. Leave Space-to-roll alone.
              </p>
            </>
          ),
        },
        {
          id: "lesson-roll",
          title: "Lesson 1 — Cast a d20",
          children: (
            <>
              <p>
                Jump to Pool (<Kbd>Insert+F6</Kbd>, then Pool). Press <Kbd>B</Kbd> until you hear Roll. Press <Kbd>Enter</Kbd>. JAWS should enter Forms Mode on the button; Enter or Space activates it.
              </p>
              <p>
                After the animation, Last cast announces the total on a polite live region: total, notation, expected, and versus expected. Press <Kbd>Insert+Up Arrow</Kbd> (Say Line) if you missed it, or <Kbd>H</Kbd> back to Last cast and arrow through the dice. Each die is an image with a name such as “d20 showing 11.”
              </p>
              <p>
                If Roll is disabled, JAWS will say so. The name includes “waits for a valid pool.” Go to lesson 2 and fix notation.
              </p>
            </>
          ),
        },
        {
          id: "lesson-notation",
          title: "Lesson 2 — Type a pool",
          children: (
            <>
              <p>
                From Pool, press <Kbd>E</Kbd> for the next edit box, or <Kbd>Insert+F5</Kbd> and choose Notation. JAWS should switch to Forms Mode. Type <Kbd>2d6+3</Kbd>. The live readout above the field restates the pool as you type. Press <Kbd>Enter</Kbd> to submit the form and cast, or <Kbd>Num Pad Plus</Kbd> to leave Forms Mode without rolling.
              </p>
              <p>
                If JAWS says invalid, the live detail is linked as the error message. Arrow to it in Virtual Cursor, or keep Forms Mode and Shift+Tab to the readout.
              </p>
            </>
          ),
        },
        {
          id: "lesson-radios",
          title: "Lesson 3 — Die, Keep, and exploding",
          children: (
            <>
              <p>
                Die chips are a radio group on a simple pool. Press <Kbd>A</Kbd> for the next radio, or <Kbd>Ctrl+Insert+A</Kbd> for the list. When a chip is focused, JAWS is in Forms Mode. Arrow keys move to the next size and select it. Home and End jump to the ends. The selected chip is checked.
              </p>
              <p>
                On a mixed or invalid pool those chips are buttons, not radios. JAWS will say “Start a simple d20 pool.” Activate one to rebuild 1d20 and unlock the steppers.
              </p>
              <p>
                Keep is a second radio group. The names are the short label plus the hint, for example “Keep all. Count every die toward the total.” High and Low disable themselves on a single die. Arrows skip disabled options.
              </p>
              <p>
                Exploding is a switch, not a checkbox. Quick key <Kbd>X</Kbd> (checkbox) will not find it. Use <Kbd>F</Kbd> or <Kbd>Insert+F5</Kbd>. In Forms Mode, Space toggles it. JAWS should say “Exploding, switch, on” or “off,” and the hint defines the bang.
              </p>
            </>
          ),
        },
        {
          id: "lesson-steppers",
          title: "Lesson 4 — Steppers",
          children: (
            <>
              <p>
                Each stepper is a group: Decrease, a live value, Increase. The buttons are named with the current number — “Increase Dice, currently 2.” Focus Increase, then press Arrow Up or Arrow Right to step, Home for the minimum, End for the maximum. When the group is locked the value speaks “Dice locked” and both buttons disable.
              </p>
              <p>
                Repeat is never locked by a mixed pool. How many locks when Keep is all, when there is only one die, or when the pool is locked.
              </p>
            </>
          ),
        },
        {
          id: "lesson-lab",
          title: "Lesson 5 — Luck, chaos, streak, and seed",
          children: (
            <>
              <p>
                Jump to the Randomness heading. The three sliders are native ranges. <Kbd>Insert+F5</Kbd> lists Luck, Chaos, and Streak. In Forms Mode, Arrow Left and Right change the value. JAWS speaks the valuetext: “Luck +20,” “Chaos 50,” “Streak 0.” The lab status under the chart says whether the next roll is loaded, waiting, idle, or fair.
              </p>
              <p>
                The bar chart is hidden from the reader. A short text summary of the curve sits after it. If the pool is invalid the curve waits and no fake d20 is drawn.
              </p>
              <p>
                Seed is an edit box. Lock is a switch next to it. Type a phrase, then toggle Lock. If the seed is empty, Lock refuses and a toast says to enter a seed first. Fair (the button in the Randomness heading) resets luck, chaos, and streak and keeps this seed.
              </p>
            </>
          ),
        },
        {
          id: "lesson-results",
          title: "Lesson 6 — Last cast, stats, and the log",
          children: (
            <>
              <p>
                Last cast’s total is announced live. The visible giant number is hidden from the reader so it is not spoken twice. Dice that landed are a list. Dropped faces stay in that list, named as dropped.
              </p>
              <p>
                Session statistics is a description list: Rolls, Mean, Expected, High, Low, Max faces, Ones. Each name is spoken in normal case.
              </p>
              <p>
                On a wide window, Results is a real table. Press <Kbd>T</Kbd> to jump to it. Move cell by cell with <Kbd>Ctrl+Alt+Arrow keys</Kbd>. The caption is “Roll history.” Column headers include a short hint. The notation is the row header. Actions in the last column are Copy and Reroll for that row.
              </p>
              <p>
                Layered help for tables: <Kbd>Insert+Space</Kbd>, then <Kbd>T</Kbd>, then <Kbd>?</Kbd>. Next row is <Kbd>Windows+Alt+Down</Kbd>. Read the current row with <Kbd>Windows+Comma</Kbd>.
              </p>
              <p>
                On a phone-width window there is no table. Each roll is an article (<Kbd>O</Kbd> for next article) with a heading — the notation — and labeled fields. Copy and Reroll sit at the bottom of the card. JAWS will not find a table with T here; that is the layout, not a missing log.
              </p>
            </>
          ),
        },
        {
          id: "lesson-tabs",
          title: "Lesson 7 — Tabs, Assay, Guide, and FAQ",
          children: (
            <>
              <p>
                Primary navigation is a list of links, not a tab control. JAWS lists them with <Kbd>Insert+F7</Kbd>. The current page is marked current. Guide, FAQ, and this Keys page use the same pattern: a heading, an “On this page” list, then sections as level-3 headings. Insert+F6 is the fastest way through a long article.
              </p>
              <p>
                Assay (the Tests tab) is a list of cases. Each row is a button that expands a technical record. Assertions are a real table — headers, row titles, caption — even on a narrow screen. Run all, or open one case and press Run this case.
              </p>
            </>
          ),
        },
        {
          id: "reference",
          title: "JAWS keystroke reference",
          children: (
            <>
              <p>
                Desktop layout. On a laptop, replace Insert with Caps Lock. These are Freedom Scientific’s commands as they ship in JAWS 2026 Professional; Alea does not override them.
              </p>
              <h4 className="font-medium text-foreground">Find your way</h4>
              <KeyTable
                caption="JAWS page navigation for Alea"
                columns={COLS}
                rows={[
                  ["List headings", "Insert+F6", "Jump to Pool, Last cast, Results"],
                  ["Heading at a level", "1 through 6", "2 for the Table landmarks"],
                  ["Next heading", "H", "Shift+H previous"],
                  ["List links", "Insert+F7", "The five tabs"],
                  ["List form fields", "Insert+F5", "Notation, sliders, Roll"],
                  ["Virtual HTML features", "Insert+F3", "Landmarks and more"],
                  ["Next region", "R", "Q jumps to main"],
                  ["Next button", "B", "Ctrl+Insert+B lists them"],
                  ["Next radio", "A", "Die chips and Keep"],
                  ["Next edit box", "E", "Notation and Seed"],
                  ["Next form control", "F", "Includes switches and sliders"],
                  ["Next table", "T", "Results on a wide window; Assay assertions"],
                  ["Next article", "O", "Result cards on a phone"],
                  ["Say all", "Insert+Down Arrow", "Caps Lock+A on laptop"],
                  ["Say line", "Insert+Up Arrow", "Caps Lock+I on laptop"],
                ]}
              />
              <h4 className="font-medium text-foreground">Forms Mode</h4>
              <KeyTable
                caption="JAWS Forms Mode for Alea"
                columns={COLS}
                rows={[
                  ["Enter Forms Mode", "Enter", "Also happens when you Tab onto a field"],
                  ["Leave Forms Mode", "Num Pad Plus", "Laptop: Caps Lock+Semicolon"],
                  ["Toggle virtual cursor", "Insert+Z", "If mode feels stuck"],
                  ["Activate Roll or a preset", "Enter or Space", "Focus must be on the button"],
                  ["Toggle exploding or Lock", "Space", "These are switches, not checkboxes"],
                  ["Move Keep or Die", "Arrow keys", "Home and End jump to the ends"],
                  ["Nudge a slider", "Left or Right Arrow", "Luck, chaos, streak"],
                  ["Submit the pool form", "Enter in Notation", "Casts if the pool is valid"],
                ]}
              />
              <h4 className="font-medium text-foreground">Tables</h4>
              <KeyTable
                caption="JAWS table navigation for the results log"
                columns={COLS}
                rows={[
                  ["Next table", "T", "Shift+T previous"],
                  ["Cell right / left", "Ctrl+Alt+Right / Left", "Along a row"],
                  ["Cell down / up", "Ctrl+Alt+Down / Up", "Along a column"],
                  ["Read current row", "Windows+Comma", "Or Windows+Num Pad 5"],
                  ["Read current column", "Windows+Period", ""],
                  ["Next row", "Windows+Alt+Down", "Prior: Windows+Alt+Up"],
                  ["Table layered help", "Insert+Space, T, ?", "JAWS 2026 layered keyboard"],
                ]}
              />
            </>
          ),
        },
        {
          id: "troubleshoot",
          title: "If something feels wrong",
          children: (
            <>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="font-medium text-foreground">JAWS shouts TABLE or POOL.</strong> That was an old bug. Names are now Table, Pool, Last cast. Refresh if a cached tab still shouts.
                </li>
                <li>
                  <strong className="font-medium text-foreground">T finds no results table.</strong> The window is narrow; rolls are articles. Press O, or widen the window.
                </li>
                <li>
                  <strong className="font-medium text-foreground">X does not find Exploding.</strong> It is a switch. Use F or Insert+F5.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Arrows do not move Keep.</strong> Leave Smart Navigation (Insert+X), enter Forms Mode on a Keep radio, then arrow.
                </li>
                <li>
                  <strong className="font-medium text-foreground">H types into Notation.</strong> Leave Forms Mode with Num Pad Plus, then H.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Space cast while you were reading.</strong> Focus was on the page, not on a control. Use Roll instead.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Roll is silent and disabled.</strong> The name should include “waits for a valid pool.” Read the live readout under Pool.
                </li>
                <li>
                  <strong className="font-medium text-foreground">The curve is missing.</strong> Invalid notation. The lab does not fake a d20 while the pool is illegal.
                </li>
              </ul>
              <p>
                The FAQ tab answers product questions (exploding, streak, seed, history). This page is only how JAWS drives the table.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
