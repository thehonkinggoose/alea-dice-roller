import { DocsPage } from "@/components/dice/docs/DocsPage";

export function Faq() {
  return (
    <DocsPage
      eyebrow="FAQ"
      title="Questions the table actually answers"
      headingId="faq-heading"
      lede="Short answers, same honesty as the caster. If a control looks fair, the next roll is fair. If a stepper shows a dash, it is not driving the pool."
      sections={[
        {
          id: "where-rolls-live",
          title: "Where are my rolls stored?",
          children: (
            <>
              <p>
                Only on this device, in this browser. There is no account, no cloud, and no sync. Clear removes them from this device. Export downloads a CSV if you want a copy elsewhere.
              </p>
            </>
          ),
        },
        {
          id: "roll-disabled",
          title: "Why is Roll disabled?",
          children: (
            <>
              <p>
                The pool is not a legal expression. The live readout under Pool names the problem — leftover junk, a d1, more than 100 dice, a 1001-sider, or a modifier outside −99 to +99. Roll’s accessible name becomes “Roll, waits for a valid pool.” Fix the notation or tap a die chip to start a fresh 1dN.
              </p>
            </>
          ),
        },
        {
          id: "steppers-dash",
          title: "Why do the steppers show a dash?",
          children: (
            <>
              <p>
                The notation is mixed (more than one die type) or invalid. Dice, Sides, Modifier, Keep, exploding, and How many lock so a leftover simple pool cannot silently rewrite what you typed. Repeat still applies. A die chip starts a new simple pool of that size and keeps Repeat.
              </p>
            </>
          ),
        },
        {
          id: "exploding",
          title: "What does exploding mean?",
          children: (
            <>
              <p>
                If a die lands on its highest face, it is rolled again and that roll is added. On a d6, a 6 explodes into another d6. Extra faces can explode too, up to 24 extras. A bang after a die in the notation turns this on. Typing an expression without ! turns it off. On a mixed pool the switch follows whichever dice have bangs.
              </p>
            </>
          ),
        },
        {
          id: "keep",
          title: "What is Keep High versus Keep Low?",
          children: (
            <>
              <p>
                After the roll, some dice can be dropped. High keeps the best faces (advantage is two d20s, keep 1 high). Low keeps the worst (disadvantage). Keep all counts every die. High and Low need two or more dice. How many is how many faces still count.
              </p>
            </>
          ),
        },
        {
          id: "keep-one-die",
          title: "Why does 1d20kh1 warn me?",
          children: (
            <>
              <p>
                Keep needs two dice. On a single die the table remaps that to Keep all and the live readout says so. It will not pretend to have advantage on one die.
              </p>
            </>
          ),
        },
        {
          id: "luck-did-nothing",
          title: "I moved Luck and the roll still looks fair.",
          children: (
            <>
              <p>
                Below 1%, luck is fair. The slider snaps to a 1% grid so a dusty control cannot load the table in secret. The lab status is the source of truth for the next roll. Tray chips describe the last roll — change a slider after you cast, and they will not match until you roll again.
              </p>
            </>
          ),
        },
        {
          id: "streak-waiting",
          title: "Streak is on. Why isn’t it tilting?",
          children: (
            <>
              <p>
                Streak reads recent totals against their expected values. With no history it waits. If recent totals sit near expected, it is armed but not tilting yet. A Repeat batch uses the streak from before the click, so the six scores do not feed each other.
              </p>
            </>
          ),
        },
        {
          id: "fair-keeps-seed",
          title: "Fair cleared luck. Why is the seed still there?",
          children: (
            <>
              <p>
                Fair resets luck, chaos, and streak. The seed and its stream stay, so you can compare a loaded table to a fair replay of the same sequence. Unlock the seed if you want true random.
              </p>
            </>
          ),
        },
        {
          id: "seed-vs-random",
          title: "What is the difference between a locked seed and true random?",
          children: (
            <>
              <p>
                A locked seed replays the same faces when the expression and factors match. Editing the seed restarts the sequence from the beginning. Unlocked uses the browser’s cryptographic RNG. That is true random and not repeatable.
              </p>
            </>
          ),
        },
        {
          id: "reroll-vs-roll",
          title: "Reroll versus Roll?",
          children: (
            <>
              <p>
                Roll casts the pool you are editing, Repeat times. Reroll casts one row’s expression once with the current factors and leaves the pool as you set it. Use Reroll to try the same notation again after you move luck, without losing a mixed pool you typed.
              </p>
            </>
          ),
        },
        {
          id: "space-and-jaws",
          title: "Space did not roll — or it rolled while I was reading.",
          children: (
            <>
              <p>
                Space casts only on the Table tab, and only when the focus is not already on a field, switch, slider, button, link, or radio. In JAWS browse mode, Space belongs to JAWS (scroll, or activate, depending on the virtual cursor). Use the Roll button, or press Enter in the notation field. The Keys tab is the full walkthrough for JAWS Professional 2026.
              </p>
            </>
          ),
        },
        {
          id: "phone-table",
          title: "On my phone I do not hear a results table.",
          children: (
            <>
              <p>
                On a narrow screen each roll is a card — a heading, labeled fields, and actions — so VoiceOver and JAWS keep names for every value. A CSS-stacked table would have lost its rows. Widen the window and a real table with column headers returns. Only the visible layout is in the accessibility tree.
              </p>
            </>
          ),
        },
        {
          id: "expected",
          title: "What does “versus expected” mean?",
          children: (
            <>
              <p>
                Expected is the average total for that pool with the luck, chaos, and streak that were on for that roll. Plus versus expected ran hot. Minus ran cold. It is a comparison, not a target you failed.
              </p>
            </>
          ),
        },
        {
          id: "df",
          title: "Is dF a Fudge die?",
          children: (
            <>
              <p>
                No. <span className="font-mono text-foreground">dF</span> is a three-faced alias in this table, not plus/minus/blank Fudge faces. <span className="font-mono text-foreground">d%</span> is a d100.
              </p>
            </>
          ),
        },
        {
          id: "shouting",
          title: "Why do the labels look like TABLE but my reader says Table?",
          children: (
            <>
              <p>
                Small caps are visual. The accessible name is normal case so JAWS and VoiceOver do not shout. That is deliberate.
              </p>
            </>
          ),
        },
        {
          id: "keyboard-only",
          title: "Can I use the whole app without a mouse?",
          children: (
            <>
              <p>
                Yes. Tab, Shift+Tab, Enter, arrows, Home, End, and the skip link cover every control. Keep and Die are radio groups. Steppers and sliders take arrows. The Keys tab maps this onto JAWS Professional 2026, including Forms Mode.
              </p>
            </>
          ),
        },
        {
          id: "assay",
          title: "What is the Tests tab?",
          children: (
            <>
              <p>
                Live unit tests for the caster — notation, the RNG, evaluation, the session store, the interface, and the harness. Open a case for every assertion with expected versus actual. They are proofs for the table, not a second caster.
              </p>
            </>
          ),
        },
        {
          id: "share",
          title: "Can I share a table with someone else?",
          children: (
            <>
              <p>
                Not as a live session. Export the CSV, or copy a roll line. A locked seed plus the same notation and factors will replay the same faces on another device that runs Alea, because the stream is deterministic. True random will not.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
