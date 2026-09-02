import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { DieFace } from "@/components/dice/DieFace";
import { SpokenLabel } from "@/components/dice/SpokenLabel";
import { StatsStrip } from "@/components/dice/StatsStrip";
import { Stepper } from "@/components/dice/Stepper";
import { DiceTray } from "@/components/dice/DiceTray";
import { filterHistory, ResultsTable, signedFaces } from "@/components/dice/ResultsTable";
import { RollPanel } from "@/components/dice/RollPanel";
import { labStatusText, RandomnessLab } from "@/components/dice/RandomnessLab";
import { Faq } from "@/components/dice/docs/Faq";
import { JawsTutorial } from "@/components/dice/docs/JawsTutorial";
import { UserGuide } from "@/components/dice/docs/UserGuide";
import { AppErrorComponent } from "@/lib/error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkipLink } from "@/components/ui/skip-link";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { describeDie, describeDieTitle, describeRollAnnouncement } from "@/lib/dice/a11y";
import { isTypingTarget, onRadioGroupKeyDown } from "@/lib/dice/keyboard";
import { cn, copyText } from "@/lib/utils";
import { fakeDie, fakeRoll, withStore } from "@/lib/test/helpers";
import { useDiceStore } from "@/lib/dice/store";
import type { TestDef } from "@/lib/test/harness";
import { isBrowser } from "@/lib/test/harness";

function html(node: ReturnType<typeof createElement>): string {
  return renderToString(node);
}

export const uiCases: TestDef[] = [
  {
    id: "ui-die-shapes-and-pips",
    suite: "Interface",
    name: "DieFace picks a clip path per polyhedron and pips on a six",
    description: "d4/d8/d10/d12/d20 use clip classes. A d6 with face 5 renders pip cells, not the numeral. A dropped die is faded. A max face gets the max ring. Rolling adds die-tumble.",
    why: "The tray is the product. A d20 that looks like a cube, or a six that prints '5' instead of pips, is immediately wrong.",
    run: (t) => {
      const d4 = html(createElement(DieFace, { die: fakeDie({ face: 3, sides: 4 }), size: "lg" }));
      const d6 = html(createElement(DieFace, { die: fakeDie({ face: 5, sides: 6 }), size: "md" }));
      const d20 = html(createElement(DieFace, { die: fakeDie({ face: 20, sides: 20 }), size: "sm", rolling: true, delay: 40 }));
      const dropped = html(createElement(DieFace, { die: fakeDie({ face: 1, sides: 20, kept: false }) }));
      const exploded = html(createElement(DieFace, { die: fakeDie({ face: 8, sides: 8, exploded: true }) }));
      t.ok(d4.includes("clip-d4"), "d4 clip");
      t.ok(html(createElement(DieFace, { die: fakeDie({ face: 4, sides: 8 }) })).includes("clip-d8"), "d8");
      t.ok(html(createElement(DieFace, { die: fakeDie({ face: 5, sides: 10 }) })).includes("clip-d10"), "d10");
      t.ok(html(createElement(DieFace, { die: fakeDie({ face: 6, sides: 12 }) })).includes("clip-d12"), "d12");
      t.ok(d20.includes("clip-d20"), "d20 clip");
      t.ok(d6.includes("grid-cols-3"), "d6 pips grid");
      t.ok(!d6.includes(">5<"), "d6 is not a numeral");

      // Verify non-d6 polyhedra (d20, d12) never render pips for faces 1-6
      for (let f = 1; f <= 6; f++) {
        const d20Html = html(createElement(DieFace, { die: fakeDie({ face: f, sides: 20 }) }));
        t.ok(!d20Html.includes("grid-cols-3"), `d20 face ${f} must not render pips`);
        t.ok(d20Html.includes(`>${f}<`), `d20 face ${f} must render numeral`);

        const d12Html = html(createElement(DieFace, { die: fakeDie({ face: f, sides: 12 }) }));
        t.ok(!d12Html.includes("grid-cols-3"), `d12 face ${f} must not render pips`);
        t.ok(d12Html.includes(`>${f}<`), `d12 face ${f} must render numeral`);
      }

      t.ok(d20.includes("die-tumble"), "rolling");
      t.ok(d20.includes("ring-max"), "nat max ring");
      t.ok(dropped.includes("opacity-35"), "dropped fade");
      t.ok(dropped.includes("ring-crit") === false, "dropped 1 does not crit-ring");
      t.ok(exploded.includes("explode"), "explode title");
      t.ok(d4.includes("aria-label"), "die has an accessible name");
      t.note("d4Snippet", d4.slice(0, 240));
    },
  },
  {
    id: "ui-die-negative-outside-clip",
    suite: "Interface",
    name: "A subtracted die shows a minus outside the clipped shape",
    description: "sign -1 renders an absolute − badge and a −d4 caption even at sm size. The title string includes −d4.",
    why: "Putting the minus inside clip-path on a d4 made penalty dice look unsigned in the results table.",
    run: (t) => {
      const markup = html(
        createElement(DieFace, { die: fakeDie({ face: 2, sides: 4, sign: -1 }), size: "sm" }),
      );
      t.note("markup", markup);
      t.ok(markup.includes("−"), "minus glyph");
      t.ok(markup.includes("d4"), "d4 label");
      t.ok(markup.includes("minus"), "accessible name says minus");
    },
  },
  {
    id: "ui-stepper-bounds-and-sign",
    suite: "Interface",
    name: "Stepper disables the exhausted bound and prints a leading plus",
    description: "At min the decrease button is disabled; at max the increase is. signed +3 renders `+3`. Disabled=true disables both.",
    why: "A stepper that still fires at the bound would fight sanitizePool and look clickable when it is not.",
    run: (t) => {
      const min = html(createElement(Stepper, { label: "Dice", value: 1, min: 1, max: 40, onStep: () => undefined }));
      const max = html(createElement(Stepper, { label: "Dice", value: 40, min: 1, max: 40, onStep: () => undefined }));
      const signed = html(createElement(Stepper, { label: "Modifier", value: 3, min: -9, max: 9, signed: true, onStep: () => undefined }));
      const off = html(createElement(Stepper, { label: "Sides", value: 6, min: 2, max: 20, disabled: true, onStep: () => undefined }));
      const dashed = html(createElement(Stepper, { label: "Dice", value: 3, min: 1, max: 100, disabled: true, display: "—", onStep: () => undefined }));
      t.ok(min.includes("disabled") && min.includes("Decrease Dice"), "min disables decrease");
      t.ok(max.includes("Increase Dice") && max.includes("disabled"), "max disables increase");
      t.ok(signed.includes("+3"), "signed plus");
      t.ok((off.match(/disabled/g) ?? []).length >= 2, "both disabled");
      t.ok(dashed.includes("—") && !dashed.includes(">3<"), "compound dash hides the stale count");
      t.ok(min.includes("role=\"group\""), "stepper is a labelled group");
      t.ok(dashed.includes("Dice locked"), "locked value named for AT");
    },
  },
  {
    id: "ui-controls-primitives",
    suite: "Interface",
    name: "Switch, slider, input, badge, and button expose the right ARIA",
    description: "Switch is role=switch with aria-checked and a hidden thumb. Slider is input type=range using value[0]. Input sets suppressHydrationWarning. Badge and Button render children. Skip link points at main content.",
    why: "Native range/switch replaced Radix here to kill hydration mismatches. If they regress, the smoke test goes red again.",
    run: (t) => {
      const on = html(createElement(Switch, { id: "exploding", checked: true }));
      const off = html(createElement(Switch, { checked: false, disabled: true }));
      const slider = html(createElement(Slider, { value: [40], min: -100, max: 100, onValueChange: () => undefined, "aria-label": "Luck" }));
      const input = html(createElement(Input, { id: "notation", value: "1d20", onChange: () => undefined }));
      const badge = html(createElement(Badge, { variant: "outline" }, "seed"));
      const button = html(createElement(Button, { size: "lg" }, "Roll"));
      const skip = html(createElement(SkipLink));
      t.ok(on.includes("role=\"switch\"") && on.includes("aria-checked=\"true\""), "switch on");
      t.ok(off.includes("disabled") && off.includes("aria-checked=\"false\""), "switch off");
      t.ok(on.includes("aria-hidden"), "switch thumb hidden from AT");
      t.ok(slider.includes("type=\"range\"") && slider.includes("value=\"40\""), "slider value");
      t.ok(slider.includes("Luck"), "slider label");
      t.ok(input.includes("id=\"notation\""), "input id");
      t.ok(badge.includes("seed"), "badge text");
      t.ok(button.includes("Roll"), "button text");
      t.ok(skip.includes("Skip to main content") && skip.includes("#main-content"), "skip link");
      const spoken = html(createElement(SpokenLabel, null, "Pool"));
      t.ok(spoken.includes("aria-hidden"), "caps are visual only");
      t.ok(spoken.includes("sr-only") && spoken.includes("Pool"), "spoken text stays in the tree");
      t.ok(spoken.includes("normal-case"), "spoken text is not shouted");
    },
  },
  {
    id: "ui-shell-empty-states",
    suite: "Interface",
    name: "Empty tray, stats, table, and pool speak in product copy",
    description: "DiceTray says No rolls yet. StatsStrip shows em dashes. ResultsTable explains dropped dice. RollPanel lists Pool and presets.",
    why: "The first paint is what the live preview shows. Blank chrome is the #1 reported failure.",
    run: (t) => {
      withStore(() => {
        const tray = html(createElement(DiceTray));
        const stats = html(createElement(StatsStrip));
        const table = html(createElement(ResultsTable));
        const panel = html(createElement(RollPanel));
        t.ok(tray.includes("No rolls yet"), "tray empty");
        t.ok(stats.includes("—"), "stats dashes");
        t.ok(table.includes("Roll to fill the table") || table.includes("faded as discarded"), "table hint");
        t.ok(panel.includes("Pool") && panel.includes("Adv") && panel.includes("Stats"), "presets");
        t.ok(panel.includes("How many"), "keep N mounted empty");
        t.ok(panel.includes("pool-live"), "live readout");
        t.note("panel", panel.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 280));
      });
    },
  },
  {
    id: "ui-shell-with-history",
    suite: "Interface",
    name: "A recorded roll fills the tray total, stats, and table row",
    description: "Zustand SSR snapshots the initial store, so this case mounts on a live document. One 4d6dl1 roll of 12 vs 10.5 must fill the tray, stats, and table.",
    why: "If the store updates and the table stays empty, the whole product looks like it did not roll.",
    env: "browser",
    run: (t) => {
      withStore(() => {
        const roll = fakeRoll({
          id: "vis1",
          notation: "4d6dl1",
          total: 12,
          expected: 10.5,
          luck: 0.5,
          dice: [
            fakeDie({ id: "a", face: 6, sides: 6, kept: true }),
            fakeDie({ id: "b", face: 4, sides: 6, kept: true }),
            fakeDie({ id: "c", face: 2, sides: 6, kept: true }),
            fakeDie({ id: "d", face: 1, sides: 6, kept: false }),
          ],
        });
        useDiceStore.setState({ history: [roll], last: roll });
        const host = document.createElement("div");
        document.body.appendChild(host);
        const root = createRoot(host);
        try {
          flushSync(() => {
            root.render(
              createElement(
                "div",
                null,
                createElement(DiceTray),
                createElement(StatsStrip),
                createElement(ResultsTable),
              ),
            );
          });
          const markup = host.innerHTML;
          t.note("markup", markup.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400));
          t.ok(markup.includes("Lucky"), "luck badge");
          t.ok(markup.includes("vs expected"), "delta copy");
          t.ok(markup.includes("4d6dl1"), "expr column");
          t.ok(markup.includes("Reroll this expression"), "reroll action");
          t.ok(markup.includes("<caption"), "history table has a caption");
          t.ok(markup.includes("data-testid=\"roll-cards\""), "phone cards name every field");
          t.ok(markup.includes("data-testid=\"roll-table\""), "wide table stays a real table");
          t.ok(!markup.includes("stack-table"), "stacked display:block table is gone");
          t.ok(!markup.includes("min-w-[44rem]"), "table is not forced wider than the phone");
          t.ok(markup.includes("Dice that landed"), "tray dice list named");
        } finally {
          root.unmount();
          host.remove();
        }
      });
    },
  },
  {
    id: "ui-error-component",
    suite: "Interface",
    name: "The route error boundary still prints error.message",
    description: "AppErrorComponent renders the message of the thrown Error, not a generic stand-in that hides the cause.",
    why: "The platform contract: without the message on screen, a crash is an un-debuggable red box.",
    run: (t) => {
      const markup = html(
        createElement(AppErrorComponent, { error: new Error("felt caught fire"), reset: () => undefined }),
      );
      t.ok(markup.includes("felt caught fire"), "message visible");
      t.ok(markup.includes("Something went wrong"), "heading");
    },
  },
  {
    id: "ui-utils-cn-and-copy",
    suite: "Utilities",
    name: "cn merges Tailwind conflicts; copyText reports clipboard success",
    description: "cn('px-2', 'px-4') yields px-4. copyText returns true when writeText resolves and false when it throws.",
    why: "Conflicting utility classes would leave stale padding on every button. Clipboard denials must not throw into the UI.",
    run: async (t) => {
      t.eq(cn("px-2", "px-4"), "px-4", "tailwind merge");
      t.ok(cn("a", Boolean(false) && "b", undefined).includes("a"), "falsy skipped");
      t.eq(isTypingTarget(null), false, "null is not a typing target");
      const nav = globalThis.navigator as Navigator | undefined;
      if (!nav) {
        t.ok(true, "no navigator — copyText is browser-only here");
        return;
      }
      const original = nav.clipboard;
      try {
        Object.defineProperty(nav, "clipboard", {
          configurable: true,
          value: { writeText: async () => undefined },
        });
        t.eq(await copyText("ok"), true, "success");
        Object.defineProperty(nav, "clipboard", {
          configurable: true,
          value: {
            writeText: async () => {
              throw new Error("denied");
            },
          },
        });
        t.eq(await copyText("x"), false, "failure");
      } finally {
        if (original) Object.defineProperty(nav, "clipboard", { configurable: true, value: original });
      }
    },
  },
  {
    id: "ui-spacebar-target-guard",
    suite: "Utilities",
    name: "Space is ignored on fields, switches, sliders, buttons, links, and radios",
    description: "isTypingTarget is true for input/textarea/select/contenteditable and for button / link / role=button|switch|slider|radio|tab. Plain document.body is false. Non-elements are false.",
    why: "Space-to-roll on a focused Lock switch would toggle and cast. On a slider, radio, or Table link it would also fire the page-level handler.",
    env: "browser",
    run: (t) => {
      t.eq(isTypingTarget(null), false, "null");
      t.eq(isTypingTarget(document.createTextNode("x") as unknown as EventTarget), false, "text node");
      const input = document.createElement("input");
      t.eq(isTypingTarget(input), true, "input");
      const ta = document.createElement("textarea");
      t.eq(isTypingTarget(ta), true, "textarea");
      const sel = document.createElement("select");
      t.eq(isTypingTarget(sel), true, "select");
      const edit = document.createElement("div");
      edit.setAttribute("contenteditable", "true");
      t.eq(isTypingTarget(edit), true, "contenteditable");
      const btn = document.createElement("button");
      t.eq(isTypingTarget(btn), true, "button");
      const sw = document.createElement("div");
      sw.setAttribute("role", "switch");
      t.eq(isTypingTarget(sw), true, "switch");
      const slider = document.createElement("div");
      slider.setAttribute("role", "slider");
      t.eq(isTypingTarget(slider), true, "slider");
      const roleBtn = document.createElement("div");
      roleBtn.setAttribute("role", "button");
      t.eq(isTypingTarget(roleBtn), true, "role=button");
      const link = document.createElement("a");
      link.href = "/tests";
      t.eq(isTypingTarget(link), true, "link");
      const radio = document.createElement("button");
      radio.setAttribute("role", "radio");
      t.eq(isTypingTarget(radio), true, "radio");
      const tab = document.createElement("button");
      tab.setAttribute("role", "tab");
      t.eq(isTypingTarget(tab), true, "tab");
      const region = document.createElement("div");
      region.setAttribute("role", "region");
      t.eq(isTypingTarget(region), true, "region");
      const tbl = document.createElement("table");
      t.eq(isTypingTarget(tbl), true, "table");
      const summary = document.createElement("summary");
      t.eq(isTypingTarget(summary), true, "summary");
      t.eq(isTypingTarget(document.body), false, "body is a cast target");
      t.ok(isBrowser(), "running in a document");
    },
  },
  {
    id: "ui-die-crit-pips-and-percentile",
    suite: "Interface",
    name: "A natural 1 rings crit; pip faces stay pips; a d100 is a square",
    description: "A kept 1 on a d20 gets the crit ring. A d6 showing 1 still uses the pip grid. A d100 uses rounded-lg, not a clip path. An out-of-range d6 face 9 prints the numeral.",
    why: "Nat-1 feedback is how the tray shouts a fumble. A hundred-sider must not inherit the d20 silhouette.",
    run: (t) => {
      const crit = html(createElement(DieFace, { die: fakeDie({ face: 1, sides: 20 }) }));
      const pipOne = html(createElement(DieFace, { die: fakeDie({ face: 1, sides: 6 }) }));
      const d100 = html(createElement(DieFace, { die: fakeDie({ face: 42, sides: 100 }) }));
      const weird = html(createElement(DieFace, { die: fakeDie({ face: 9, sides: 6 }) }));
      t.ok(crit.includes("ring-crit"), "nat 1 ring");
      t.ok(pipOne.includes("grid-cols-3"), "d6 face 1 is pips");
      t.ok(!pipOne.includes("ring-crit"), "d6 one is not a crit ring");
      t.ok(d100.includes("rounded-lg"), "d100 square");
      t.ok(!d100.includes("clip-d"), "d100 not clipped");
      t.ok(d100.includes("42"), "percentile numeral");
      t.ok(weird.includes("9"), "invalid pip face falls back to numeral");
    },
  },
  {
    id: "ui-lab-panel-and-stats-filled",
    suite: "Interface",
    name: "Lab, pool, and stats speak for loaded, compound, and filled states",
    description: "Zustand SSR snapshots the initial store, so this mounts live. Streak with no history waits. Luck loads the table. A compound pool prints the lock copy. A bad notation shows the error. Stats count max faces and ones.",
    why: "These strings are the only explanation of what the sliders are doing. If they stay on the empty-state copy after a roll, the lab looks broken.",
    env: "browser",
    run: (t) => {
      withStore(() => {
        const host = document.createElement("div");
        document.body.appendChild(host);
        const root = createRoot(host);
        try {
          t.eq(
            labStatusText(0, 0.5, 1, 0, 0),
            "Streak waits for prior rolls before it can tilt the curve.",
            "streak waiting",
          );
          t.eq(
            labStatusText(1, 0.5, 0, 0, 0),
            "This table is loaded. Fair is chaos 50 with luck and streak at 0.",
            "loaded copy",
          );
          t.eq(
            labStatusText(0, 0.5, 0, 0, 0),
            "Uniform and independent — a mathematically fair table.",
            "fair copy",
          );
          t.eq(
            labStatusText(0.01, 0.5, 0, 0, 0),
            "This table is loaded. Fair is chaos 50 with luck and streak at 0.",
            "1% luck is loaded",
          );
          t.eq(
            labStatusText(0, 0.51, 0, 0, 0),
            "This table is loaded. Fair is chaos 50 with luck and streak at 0.",
            "chaos 51 is loaded",
          );
          t.eq(
            labStatusText(0, 0.5, 0.01, 0, 1),
            "Streak is armed, but recent totals sit near expected so it is not tilting yet.",
            "armed streak with no tilt is idle",
          );
          t.eq(
            labStatusText(0, 0.5, 1, 0.4, 1),
            "This table is loaded. Fair is chaos 50 with luck and streak at 0.",
            "tilting streak is loaded",
          );
          t.eq(
            labStatusText(1, 0.5, 1, 0, 0),
            "This table is loaded. Fair is chaos 50 with luck and streak at 0.",
            "luck wins over waiting streak",
          );
          t.eq(
            labStatusText(0, 0.5, 0, 0, 0, true),
            "Uniform — a mathematically fair curve, replayed from the seed.",
            "seeded fair is not independent",
          );
          t.eq(
            labStatusText(0, 0.5, 0, 0, 0, false),
            "Uniform and independent — a mathematically fair table.",
            "unlocked fair is independent",
          );
          useDiceStore.getState().setNotation("1d20+1d4");
          flushSync(() => root.render(createElement(RollPanel)));
          t.ok(host.innerHTML.includes("Compound pool"), "compound lock");
          useDiceStore.setState({ error: "Could not parse “nope”.", notation: "nope" });
          flushSync(() => root.render(createElement(RollPanel)));
          t.ok(host.innerHTML.includes("Could not parse"), "error line");
          const filled = fakeRoll({
            id: "s1",
            total: 12,
            expected: 10.5,
            dice: [
              fakeDie({ id: "m", face: 6, sides: 6, kept: true }),
              fakeDie({ id: "o", face: 1, sides: 6, kept: true }),
              fakeDie({ id: "d", face: 6, sides: 6, kept: false }),
            ],
          });
          useDiceStore.setState({ history: [filled], last: filled, error: null });
          flushSync(() => root.render(createElement(StatsStrip)));
          const statsText = host.textContent ?? "";
          t.ok(statsText.includes("Rolls"), "rolls label");
          t.ok(statsText.includes("Ones"), "ones label");
          t.ok(statsText.includes("Max faces"), "max faces label");
          t.ok(statsText.includes("12.0") || statsText.includes("12"), "mean from the 12");
          useDiceStore.setState({
            history: [],
            last: null,
            randomness: {
              luck: 1,
              chaos: 0.5,
              streak: 1,
              seed: "",
              seedLocked: false,
              streamIndex: 0,
            },
          });
          flushSync(() => root.render(createElement(RandomnessLab)));
          t.ok((host.textContent ?? "").includes("This table is loaded"), "lab copy: luck beats waiting streak");
          useDiceStore.setState({
            history: [fakeRoll({ total: 10.5, expected: 10.5 })],
            randomness: {
              luck: 0,
              chaos: 0.5,
              streak: 1,
              seed: "",
              seedLocked: false,
              streamIndex: 0,
            },
          });
          flushSync(() => root.render(createElement(RandomnessLab)));
          t.ok(
            (host.textContent ?? "").includes("not tilting yet"),
            "lab copy: idle streak when totals sit on expected",
          );
        } finally {
          root.unmount();
          host.remove();
        }
      });
    },
  },
  {
    id: "ui-table-factor-chips-and-tray-badges",
    suite: "Interface",
    name: "Factor chips and tray badges match the recorded luck, chaos, streak, and seed",
    description: "A loaded unlucky, wild, reverting, seeded roll of 3 vs 10.5 paints Unlucky / Wild / Reverting / Seeded on the tray and L / C / S / seed chips plus a negative delta in the table. Fair rolls show the fair chip.",
    why: "If the tray says Lucky while the row says fair, the table cannot be trusted as a log.",
    env: "browser",
    run: (t) => {
      withStore(() => {
        const loaded = fakeRoll({
          id: "chips1",
          notation: "1d20",
          total: 3,
          expected: 10.5,
          luck: -0.5,
          chaos: 1,
          streak: -0.8,
          seedUsed: "oak",
          modifier: -2,
          dice: [fakeDie({ face: 5, sides: 20, sign: 1 })],
        });
        const fair = fakeRoll({
          id: "chips2",
          notation: "1d6",
          total: 4,
          expected: 3.5,
          luck: 0,
          chaos: 0.5,
          streak: 0,
          seedUsed: null,
        });
        useDiceStore.setState({ history: [loaded, fair], last: loaded, rolling: true });
        const host = document.createElement("div");
        document.body.appendChild(host);
        const root = createRoot(host);
        try {
          flushSync(() => {
            root.render(
              createElement(
                "div",
                null,
                createElement(DiceTray),
                createElement(ResultsTable),
              ),
            );
          });
          const text = host.textContent ?? "";
          t.note("text", text.replace(/\s+/g, " ").trim().slice(0, 500));
          t.ok(text.includes("Unlucky"), "unlucky badge");
          t.ok(host.innerHTML.includes("data-testid=\"tray-factors\""), "tray factor mount");
          t.ok(text.includes("Wild"), "wild badge");
          t.ok(text.includes("Reverting"), "reverting badge");
          t.ok(text.includes("Seeded"), "seeded badge");
          t.ok(text.includes("L -50") || text.includes("L-50"), "luck chip");
          t.ok(text.includes("C 100"), "chaos chip");
          t.ok(text.includes("seed"), "seed chip");
          t.ok(text.includes("fair"), "fair chip on second row");
          t.ok(host.innerHTML.includes("Reroll this expression"), "reroll present");
          t.ok(host.innerHTML.includes("aria-busy=\"true\""), "reroll busy while rolling, focus kept");
          t.ok(text.includes("-2"), "modifier shown");
          t.ok((host.textContent ?? "").includes("Rolling."), "tray announces rolling");
        } finally {
          root.unmount();
          host.remove();
        }
      });
    },
  },
  {
    id: "ui-spacebar-nested-control",
    suite: "Utilities",
    name: "Space ignores a click target nested inside a button",
    description: "A span inside a button, and an SVG-like child inside role=switch, both count as typing/control targets. A plain paragraph does not.",
    why: "The Roll button's icon is the actual event.target. If the guard only looked at the node itself, Space on Roll would double-cast.",
    env: "browser",
    run: (t) => {
      const btn = document.createElement("button");
      const span = document.createElement("span");
      btn.appendChild(span);
      t.eq(isTypingTarget(span), true, "child of button");
      const sw = document.createElement("div");
      sw.setAttribute("role", "switch");
      const knob = document.createElement("i");
      sw.appendChild(knob);
      t.eq(isTypingTarget(knob), true, "child of switch");
      const p = document.createElement("p");
      p.textContent = "felt";
      t.eq(isTypingTarget(p), false, "paragraph is a cast target");
      const link = document.createElement("a");
      const linkIcon = document.createElement("span");
      link.appendChild(linkIcon);
      t.eq(isTypingTarget(linkIcon), true, "child of link");
    },
  },
  {
    id: "ui-live-pool-and-keep-n-always-on",
    suite: "Interface",
    name: "The sticky pool readout and How many stepper stay on screen",
    description: "SSR still prints pool-live and How many on 1d20. On a live document, Adv then dropping to 1 die paints pool-notice naming Keep High; How many stays mounted.",
    why: "Keep N used to unmount when Keep snapped to all, so a dice-count click could hide the control it had just changed.",
    env: "browser",
    run: (t) => {
      withStore(() => {
        const empty = html(createElement(RollPanel));
        t.ok(empty.includes("data-testid=\"pool-live\""), "live readout");
        t.ok(empty.includes("1d20"), "default headline");
        t.ok(empty.includes("How many"), "keep N always mounted");
        const host = document.createElement("div");
        document.body.appendChild(host);
        const root = createRoot(host);
        try {
          useDiceStore.getState().applyPreset("2d20kh1");
          flushSync(() => root.render(createElement(RollPanel)));
          t.ok(host.innerHTML.includes("2d20kh1"), "adv headline");
          t.ok((host.textContent ?? "").includes("keep 1 high"), "keep words");
          useDiceStore.getState().patchPool({ count: 1 });
          flushSync(() => root.render(createElement(RollPanel)));
          t.ok(host.innerHTML.includes("data-testid=\"pool-notice\""), "notice in DOM");
          t.ok((host.textContent ?? "").includes("Keep High turned off"), "coupling copy");
          t.ok((host.textContent ?? "").includes("How many"), "keep N still mounted");
        } finally {
          root.unmount();
          host.remove();
        }
      });
    },
  },
  {
    id: "ui-lock-notice-and-compound-rebuild-copy",
    suite: "Interface",
    name: "Lock auto-off and compound controls follow the notation, not a stale pool",
    description: "Clearing a locked seed paints rng-notice. A compound expression locks the steppers on a dash, starts a fresh 1dN from a die chip, and the exploding switch follows a bang in the notation rather than leftover simple-pool state.",
    why: "Seed lock used to uncheck off-screen. Compound chips used to resurrect Adv. The exploding switch used to stay on after typing 1d20+1d4 from an exploding d20, or stay off on 1d20+1d6!.",
    env: "browser",
    run: (t) => {
      withStore(() => {
        const host = document.createElement("div");
        document.body.appendChild(host);
        const root = createRoot(host);
        try {
          useDiceStore.getState().patchRandomness({ seed: "oak", seedLocked: true });
          useDiceStore.getState().patchRandomness({ seed: "" });
          flushSync(() => root.render(createElement(RandomnessLab)));
          t.ok(host.innerHTML.includes("data-testid=\"rng-notice\""), "rng notice");
          t.ok((host.textContent ?? "").includes("Lock turned off"), "lock copy");
          useDiceStore.getState().applyPreset("2d20kh1");
          useDiceStore.getState().setNotation("1d20+1d4");
          flushSync(() => root.render(createElement(RollPanel)));
          let text = host.textContent ?? "";
          t.ok(text.includes("Compound pool"), "compound banner");
          t.ok(text.includes("fresh 1dN"), "chip rebuild copy");
          t.ok(!text.includes("Locked simple pool"), "stale locked pool gone");
          t.ok(text.includes("1d20+1d4"), "live compound notation");
          t.ok((host.querySelector("#exploding") as HTMLButtonElement | null)?.getAttribute("aria-checked") === "false", "no bang → exploding off");
          t.ok(text.includes("No bangs in this mixed pool"), "mixed exploding copy when none explode");
          useDiceStore.getState().setNotation("1d20!");
          useDiceStore.getState().setNotation("1d20+1d6!");
          flushSync(() => root.render(createElement(RollPanel)));
          text = host.textContent ?? "";
          t.eq(
            (host.querySelector("#exploding") as HTMLButtonElement | null)?.getAttribute("aria-checked"),
            "true",
            "compound bang → exploding on",
          );
          t.ok(text.includes("1 of 2 dice explode"), "mixed exploding names the bang");
          t.ok(text.includes("—"), "steppers dash on compound");
          t.ok((text.match(/—/g) ?? []).length >= 4, "dice, sides, modifier, and how many dash");
          useDiceStore.getState().applyPreset("2d20kh1");
          flushSync(() => root.render(createElement(RandomnessLab)));
          t.ok((host.textContent ?? "").includes("pool E["), "advantage shows pool E");
          useDiceStore.getState().applyPreset("1d20");
          flushSync(() => root.render(createElement(RandomnessLab)));
          t.ok(!(host.textContent ?? "").includes("pool E["), "plain d20 hides pool E");
        } finally {
          root.unmount();
          host.remove();
        }
      });
    },
  },
  {
    id: "ui-invalid-notation-hides-leftover-pool",
    suite: "Interface",
    name: "Invalid notation hides leftover steppers and the fake d20 curve",
    description: "Adv, then `1d20+100`: Keep High is not pressed, exploding is off, Dice/Sides/Modifier/How many dash, Roll is disabled, and a d20 chip starts a fresh 1d20. The lab drops the curve instead of drawing a d20 while the pool is illegal. A locked fair seed says the curve is replayed, not independent.",
    why: "Typing past the modifier cap used to unlock the leftover Adv steppers so a + click rewrote the field as 2d20kh1. The lab also jumped to a d20 curve on any parse error, including a trailing plus.",
    env: "browser",
    run: (t) => {
      withStore(() => {
        const host = document.createElement("div");
        document.body.appendChild(host);
        const root = createRoot(host);
        try {
          useDiceStore.getState().applyPreset("2d20kh1");
          useDiceStore.getState().setNotation("1d20+100");
          flushSync(() => {
            root.render(
              createElement(
                "div",
                null,
                createElement(RollPanel),
                createElement(RandomnessLab),
              ),
            );
          });
          const text = host.textContent ?? "";
          t.ok(text.includes("Modifier must be between"), "sticky parse error");
          t.ok(text.includes("Steppers wait for a valid pool"), "lock copy");
          t.ok(text.includes("Curve waits for a valid pool"), "lab waits");
          t.ok(!text.includes("E["), "no fake d20 expected");
          t.eq(
            (host.querySelector("#exploding") as HTMLButtonElement | null)?.getAttribute("aria-checked"),
            "false",
            "leftover exploding not shown",
          );
          const keepHigh = [...host.querySelectorAll("button")].find((b) => b.textContent === "High");
          t.eq(keepHigh?.getAttribute("aria-checked"), "false", "leftover Keep High not pressed");
          t.eq(keepHigh?.disabled, true, "Keep High disabled");
          const d20Chip = [...host.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === "Start a simple d20 pool");
          t.eq(d20Chip?.getAttribute("aria-pressed"), "false", "d20 chip not pressed from leftover");
          const rollBtn = host.querySelector('button[title="Cast the current pool"]') as HTMLButtonElement | null;
          t.eq(rollBtn?.disabled, true, "cannot cast invalid");
          t.ok((text.match(/—/g) ?? []).length >= 4, "steppers dash");
          d20Chip?.click();
          flushSync(() => root.render(createElement(RollPanel)));
          t.eq(useDiceStore.getState().notation, "1d20", "chip rebuilds a simple d20");
          t.eq(useDiceStore.getState().pool.keepMode, "none", "keep reset");
          useDiceStore.getState().patchRandomness({ seed: "oak", seedLocked: true, luck: 0, chaos: 0.5, streak: 0 });
          flushSync(() => root.render(createElement(RandomnessLab)));
          t.ok((host.textContent ?? "").includes("replayed from the seed"), "seeded fair copy");
          t.ok(!(host.textContent ?? "").includes("independent"), "does not claim independence");
        } finally {
          root.unmount();
          host.remove();
        }
      });
    },
  },
  {
    id: "ui-a11y-names-roles-and-hints",
    suite: "Interface",
    name: "Every pool control has a name, a role, and a description a screen reader can reach",
    description: "Notation is labelled and described. Keep radios are named with the short label plus the hint. Die chips are radios on a simple pool and named rebuild actions when locked. Exploding is a labelled switch. Luck/chaos/streak sliders expose valuetext. The skip link targets main content. describeDie names exploded and dropped faces. The pool form is named. An invalid Roll button says why it waits.",
    why: "JAWS and VoiceOver skip untitled sliders and unlabeled icon buttons. If a control only has a hover title, it is invisible to a screen reader.",
    env: "browser",
    run: (t) => {
      t.eq(describeDie(fakeDie({ face: 8, sides: 8, exploded: true })), "d8 showing 8, exploded", "explode name");
      t.eq(describeDie(fakeDie({ face: 1, sides: 20, kept: false })), "d20 showing 1, dropped, not counted", "dropped name");
      t.eq(describeDie(fakeDie({ face: 2, sides: 4, sign: -1 })), "minus d4 showing 2", "penalty name");
      t.ok(describeDieTitle(fakeDie({ face: 8, sides: 8, exploded: true })).includes("explode"), "title keeps explode");
      withStore(() => {
        const host = document.createElement("div");
        document.body.appendChild(host);
        const root = createRoot(host);
        try {
          flushSync(() => {
            root.render(
              createElement(
                "div",
                null,
                createElement(SkipLink),
                createElement(RollPanel),
                createElement(RandomnessLab),
              ),
            );
          });
          const notation = host.querySelector("#notation") as HTMLInputElement | null;
          t.ok(notation, "notation field");
          t.eq(notation?.getAttribute("aria-describedby")?.includes("notation-hint"), true, "notation described");
          t.ok(host.querySelector("label[for='notation']"), "notation label");
          t.ok(host.querySelector("[role='radiogroup'][aria-labelledby='keep-label']"), "keep radiogroup");
          t.ok(host.querySelector("[role='radiogroup'][aria-labelledby='die-label']"), "die radiogroup");
          const keepAll = [...host.querySelectorAll("[role='radio']")].find((b) => b.textContent === "Keep all");
          t.eq(keepAll?.getAttribute("aria-checked"), "true", "keep all selected");
          t.ok(keepAll?.getAttribute("aria-label")?.includes("Keep all"), "keep all name includes the short label");
          t.ok(keepAll?.getAttribute("aria-label")?.includes("Count every die"), "keep all name includes the hint");
          t.eq(host.querySelector("form")?.getAttribute("aria-label"), "Dice pool", "form named");
          const validRoll = host.querySelector('button[title="Cast the current pool"]');
          t.eq(validRoll?.hasAttribute("aria-label"), false, "valid roll uses the visible name");
          t.eq(host.querySelector("#exploding")?.getAttribute("aria-describedby"), "exploding-hint", "exploding described");
          t.ok(host.querySelector("label[for='exploding']"), "exploding label");
          t.ok(host.querySelector("form"), "pool is a form");
          const luck = host.querySelector("#factor-luck") as HTMLInputElement | null;
          t.ok(luck, "luck slider");
          t.eq(luck?.getAttribute("aria-valuetext"), "Luck 0", "luck valuetext");
          t.ok(host.querySelector("label[for='factor-luck']"), "luck label");
          t.ok(host.querySelector("label[for='seed']"), "seed label");
          t.ok(host.querySelector("label[for='seed-lock']"), "lock label");
          t.eq(host.querySelector(".skip-link")?.getAttribute("href"), "#main-content", "skip href");
          useDiceStore.getState().setNotation("1d20+100");
          flushSync(() => root.render(createElement(RollPanel)));
          t.eq(host.querySelector("#notation")?.getAttribute("aria-invalid"), "true", "invalid flagged");
          t.eq(host.querySelector("#notation")?.getAttribute("aria-errormessage"), "pool-live-detail", "errormessage linked to live detail");
          t.ok((host.querySelector("#notation")?.getAttribute("aria-describedby") ?? "").includes("pool-live-detail"), "invalid described by live detail");
          t.ok(
            host.querySelector('button[title="Cast the current pool"]')?.getAttribute("aria-label")?.includes("waits for a valid pool"),
            "invalid roll explains the wait",
          );
        } finally {
          root.unmount();
          host.remove();
        }
      });
    },
  },
  {
    id: "ui-a11y-keyboard-radiogroup-and-stepper",
    suite: "Interface",
    name: "Arrow keys move Keep radios and steppers without a pointer",
    description: "onRadioGroupKeyDown on ArrowRight focuses and clicks the next enabled radio. Home jumps to the first. A Sides stepper ArrowRight from 20 becomes 21 via onStep. Space on a focused radio is treated as a typing target so it does not also roll.",
    why: "Keep High used to be mouse-only in practice: the buttons were tabbable but arrows did nothing, and Space on a radio would also fire the page-level roll.",
    env: "browser",
    run: (t) => {
      withStore(() => {
        useDiceStore.getState().applyPreset("2d20kh1");
        const host = document.createElement("div");
        document.body.appendChild(host);
        const root = createRoot(host);
        try {
          flushSync(() => root.render(createElement(RollPanel)));
          const group = host.querySelector("[role='radiogroup'][aria-labelledby='keep-label']");
          t.ok(group, "keep group");
          const radios = [...(group?.querySelectorAll<HTMLButtonElement>("[role='radio']:not(:disabled)") ?? [])];
          t.eq(radios.length, 3, "three keep options on advantage");
          const high = radios.find((b) => b.textContent === "High");
          t.ok(high, "high radio");
          t.eq(useDiceStore.getState().pool.keepMode, "highest", "starts on high");
          onRadioGroupKeyDown({ key: "ArrowRight", preventDefault: () => undefined, currentTarget: high ?? null });
          t.eq(useDiceStore.getState().pool.keepMode, "lowest", "arrow right from High selects Low");
          const low = [...(group?.querySelectorAll<HTMLButtonElement>("[role='radio']:not(:disabled)") ?? [])].find(
            (b) => b.textContent === "Low",
          );
          onRadioGroupKeyDown({ key: "Home", preventDefault: () => undefined, currentTarget: low ?? null });
          t.eq(useDiceStore.getState().pool.keepMode, "none", "home selects Keep all");
        } finally {
          root.unmount();
          host.remove();
        }
      });
      let delta = 0;
      const stepHost = document.createElement("div");
      document.body.appendChild(stepHost);
      const stepRoot = createRoot(stepHost);
      try {
        flushSync(() =>
          stepRoot.render(createElement(Stepper, { label: "Sides", value: 20, min: 2, max: 100, onStep: (d) => { delta = d; } })),
        );
        const inc = [...stepHost.querySelectorAll("button")].find((b) =>
          (b.getAttribute("aria-label") ?? "").startsWith("Increase Sides"),
        );
        t.ok(inc, "increase sides");
        inc?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
        t.eq(delta, 1, "arrow right steps +1");
        inc?.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
        t.eq(delta, 2 - 20, "home steps to min");
        inc?.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
        t.eq(delta, 100 - 20, "end steps to max");
      } finally {
        stepRoot.unmount();
        stepHost.remove();
      }
    },
  },
  {
    id: "ui-docs-guide-faq-jaws",
    suite: "Interface",
    name: "Guide, FAQ, and the JAWS tutorial document the real table",
    description: "The Guide names exploding, Keep, luck, seed, and this-device history. FAQ answers why Roll waits and why a phone has cards, not a stacked table. The Keys page is a JAWS Professional 2026 lesson: Virtual Cursor versus Forms Mode, Insert+F6, Num Pad Plus, and why Space must not be used to roll in browse mode. Keystroke tables are real tables with captions.",
    why: "A help tab that invents controls, or a JAWS lesson that tells someone to press Space in browse mode, would train the reader to fight the table.",
    run: (t) => {
      const guide = html(createElement(UserGuide));
      const faq = html(createElement(Faq));
      const keys = html(createElement(JawsTutorial));
      t.ok(guide.includes("How the table works"), "guide title");
      t.ok(guide.includes("exploding") && guide.includes("Keep"), "guide names exploding and Keep");
      t.ok(guide.includes("this device"), "history is local");
      t.ok(guide.includes("On this page"), "guide has a contents list");
      t.ok(faq.includes("Where are my rolls stored?"), "faq storage");
      t.ok(faq.includes("waits for a valid pool"), "faq invalid roll");
      t.ok(faq.includes("three-faced alias"), "faq dF honesty");
      t.ok(faq.includes("each roll is a card"), "faq phone cards");
      t.ok(keys.includes("JAWS Professional 2026"), "jaws edition");
      t.ok(keys.includes("Virtual Cursor") && keys.includes("Forms Mode"), "modes");
      t.ok(keys.includes("Insert+F6"), "heading list");
      t.ok(keys.includes("Num Pad Plus"), "leave forms mode");
      t.ok(keys.includes("Caps Lock"), "laptop layout");
      t.ok(keys.includes("Do not use it to roll") || keys.includes("Leave Space-to-roll alone"), "space warning");
      t.ok(keys.includes("<table") && keys.includes("<caption"), "keystroke tables are real tables");
      t.ok(keys.includes("scope=\"col\""), "column headers");
      t.ok(keys.includes("role=switch") || keys.includes("switches, not checkboxes"), "exploding is a switch");
      t.ok(keys.includes("VoiceOver on iOS"), "keys covers voiceover ios");
    },
  },
  {
    id: "ui-voiceover-and-jaws-fidelity",
    suite: "Interface",
    name: "VoiceOver and JAWS screen reader accessibility fidelity",
    description: "Switches have explicit accessible names for WebKit/VoiceOver iOS. Stepper provides decoupled sr-only announcements. Live roll announcements speak natural 20 crits, natural 1 fumbles, and full repeat batch totals. StatsStrip uses valid semantic dl tags.",
    why: "VoiceOver on iOS fails to name button[role=switch] from external labels without aria-label/aria-labelledby. Screen reader live regions need batch totals and crits spoken directly.",
    run: (t) => {
      // 1. Roll announcements (single, crit, fumble, batch)
      const normalRoll = fakeRoll({ notation: "1d20", total: 14, expected: 10.5, dice: [fakeDie({ face: 14, sides: 20 })] });
      const normalAnnouncement = describeRollAnnouncement(normalRoll, 1);
      t.ok(normalAnnouncement.includes("Roll 1: Total 14 from 1d20"), "normal roll announcement");
      t.ok(normalAnnouncement.includes("plus 3.5 versus expected"), "normal delta");

      const critRoll = fakeRoll({ notation: "1d20", total: 20, expected: 10.5, dice: [fakeDie({ face: 20, sides: 20, kept: true })] });
      const critAnnouncement = describeRollAnnouncement(critRoll, 2);
      t.ok(critAnnouncement.includes("Natural 20!"), "crit roll announces Natural 20!");

      const fumbleRoll = fakeRoll({ notation: "1d20", total: 1, expected: 10.5, dice: [fakeDie({ face: 1, sides: 20, kept: true })] });
      const fumbleAnnouncement = describeRollAnnouncement(fumbleRoll, 3);
      t.ok(fumbleAnnouncement.includes("Natural 1!"), "fumble roll announces Natural 1!");

      const batchRolls = [
        fakeRoll({ total: 14 }),
        fakeRoll({ total: 11 }),
        fakeRoll({ total: 16 }),
        fakeRoll({ total: 18, notation: "4d6kh3", expected: 12.2 }),
      ];
      const batchAnnouncement = describeRollAnnouncement(batchRolls[3], 4, batchRolls);
      t.ok(batchAnnouncement.includes("Batch of 4 rolls: totals 14, 11, 16, 18"), "batch announcement lists all totals");
      t.ok(batchAnnouncement.includes("Last roll: Total 18 from 4d6kh3"), "batch mentions last roll");

      const neg20Roll = fakeRoll({ notation: "2d6-1d20", total: -8, expected: -3.5, dice: [fakeDie({ face: 20, sides: 20, kept: true, sign: -1 })] });
      const negAnnouncement = describeRollAnnouncement(neg20Roll, 5);
      t.ok(!negAnnouncement.includes("Natural 20!"), "subtracted die rolling 20 does not announce Natural 20!");

      const droppedExplosion = fakeRoll({ notation: "4d6dl1!", total: 12, dice: [fakeDie({ face: 6, sides: 6, kept: false, exploded: true })] });
      const droppedExpAnnouncement = describeRollAnnouncement(droppedExplosion, 6);
      t.ok(!droppedExpAnnouncement.includes("Exploded!"), "dropped explosion does not announce Exploded!");

      // 2. Switches in RollPanel and RandomnessLab have accessible names
      withStore(() => {
        const rollPanel = html(createElement(RollPanel));
        t.ok(rollPanel.includes('aria-label="Exploding dice"'), "exploding switch has explicit aria-label");
        t.ok(rollPanel.includes('aria-labelledby="exploding-label"'), "exploding switch has aria-labelledby");

        const lab = html(createElement(RandomnessLab));
        t.ok(lab.includes('aria-label="Lock seed"'), "seed-lock switch has explicit aria-label");
        t.ok(lab.includes('aria-labelledby="seed-lock-label"'), "seed-lock switch has aria-labelledby");

        // 3. StatsStrip dl semantics
        const stats = html(createElement(StatsStrip));
        t.ok(stats.includes("<dt"), "stats has dt");
        t.ok(stats.includes("<dd"), "stats has dd");

        // 4. Stepper decoupled sr-only structure
        const stepper = html(createElement(Stepper, { label: "Dice", value: 3, min: 1, max: 10, onStep: () => undefined }));
        t.ok(stepper.includes('class="sr-only">Dice 3</span>'), "stepper has sr-only text for iOS VoiceOver");
      });
    },
  },
  {
    id: "ui-qol-features",
    suite: "Interface",
    name: "Quality of Life features: load pool, delete roll, history search, bias presets, and audio",
    description: "ResultsTable provides load-into-pool and delete-roll actions. RandomnessLab offers thematic bias presets. ResultsTable supports search/filter and markdown copy. Store tracks soundEnabled.",
    why: "Tabletop sessions need fluid pool swapping, safe roll deletion, and quick bias presets.",
    run: (t) => {
      withStore(() => {
        const store = useDiceStore.getState();

        // 1. loadPoolFromNotation
        const loaded = store.loadPoolFromNotation("3d8+4");
        t.eq(loaded, true, "loadPoolFromNotation succeeds");
        t.eq(useDiceStore.getState().notation, "3d8+4", "notation updated to 3d8+4");
        t.eq(useDiceStore.getState().pool.count, 3, "pool count updated");
        t.eq(useDiceStore.getState().pool.sides, 8, "pool sides updated");
        t.eq(useDiceStore.getState().pool.modifier, 4, "pool modifier updated");
        useDiceStore.getState().patchPool({ repeat: 4 });
        store.loadPoolFromNotation("2d6");
        t.eq(useDiceStore.getState().pool.repeat, 4, "loadPoolFromNotation preserves repeat");

        // 2. deleteRoll and restoreHistory
        const r1 = fakeRoll({ id: "roll-1", notation: "1d20", total: 15 });
        const r2 = fakeRoll({ id: "roll-2", notation: "2d6", total: 8 });
        store.restoreHistory([r1, r2]);
        t.eq(useDiceStore.getState().history.length, 2, "2 rolls restored");
        t.eq(useDiceStore.getState().last?.id, "roll-1", "last roll is r1");

        store.deleteRoll("roll-1");
        t.eq(useDiceStore.getState().history.length, 1, "1 roll remains after delete");
        t.eq(useDiceStore.getState().last?.id, "roll-2", "last roll updated to r2");

        // 3. sound toggle
        t.eq(useDiceStore.getState().soundEnabled, false, "sound initially false");
        store.toggleSound();
        t.eq(useDiceStore.getState().soundEnabled, true, "sound toggled true");
        store.toggleSound();
        t.eq(useDiceStore.getState().soundEnabled, false, "sound toggled back to false");

        // 4. UI rendering of QoL elements (SSR-safe)
        const panel = html(createElement(RollPanel));
        t.ok(panel.includes("Quick modifier"), "quick modifier chips rendered");
        t.ok(panel.includes("Clear notation"), "clear notation button present");

        const lab = html(createElement(RandomnessLab));
        t.ok(lab.includes("Heroic") && lab.includes("Gritty") && lab.includes("Wild"), "bias presets rendered");

        const table = html(createElement(ResultsTable));
        t.ok(table.includes("Markdown") && table.includes("CSV"), "markdown and csv export buttons in header");
      });
    },
  },
  {
    id: "ui-exploded-fumble-and-table-fairness",
    suite: "Interface",
    name: "Exploded extra die rolling 1 is not a fumble; table caption omits literal $",
    description: "An explosion bonus die rolling 1 does not receive a fumble ring or title. Both Natural 20 and 1 are announced if both occur on kept dice. ResultsTable caption omits literal $.",
    why: "Extra dice from exploding hits are bonuses, not fumbles. Simultaneous crits and fumbles in multi-die rolls must both be announced.",
    run: (t) => {
      const explodedOne = html(createElement(DieFace, { die: fakeDie({ face: 1, sides: 20, exploded: true, kept: true }) }));
      t.ok(!explodedOne.includes("ring-crit"), "exploded 1 on d20 does not receive crit/fumble ring");
      t.ok(!describeDieTitle(fakeDie({ face: 1, sides: 20, exploded: true, kept: true })).includes("Natural 1!"), "exploded 1 title omits Natural 1!");

      const normalOne = html(createElement(DieFace, { die: fakeDie({ face: 1, sides: 20, exploded: false, kept: true }) }));
      t.ok(normalOne.includes("ring-crit"), "normal 1 on d20 receives crit/fumble ring");
      t.ok(describeDieTitle(fakeDie({ face: 1, sides: 20, exploded: false, kept: true })).includes("Natural 1!"), "normal 1 title has Natural 1!");

      const dualRoll = fakeRoll({
        notation: "2d20",
        total: 21,
        dice: [
          fakeDie({ id: "a", face: 20, sides: 20, kept: true }),
          fakeDie({ id: "b", face: 1, sides: 20, kept: true }),
        ],
      });
      const dualAnnouncement = describeRollAnnouncement(dualRoll);
      t.ok(dualAnnouncement.includes("Natural 20!"), "dual announcement includes Natural 20!");
      t.ok(dualAnnouncement.includes("Natural 1!"), "dual announcement also includes Natural 1!");

      // signedFaces drops format with !↓
      const droppedExplodedRoll = fakeRoll({
        notation: "2d6kh1!",
        dice: [
          fakeDie({ id: "k", face: 6, sides: 6, kept: true, exploded: false }),
          fakeDie({ id: "d1", face: 6, sides: 6, kept: false, exploded: false }),
          fakeDie({ id: "d2", face: 4, sides: 6, kept: false, exploded: true }),
        ],
      });
      const facesText = signedFaces(droppedExplodedRoll, null);
      t.ok(facesText.includes("4!↓"), "signedFaces formats dropped exploded die as 4!↓");

      // filterHistory edge cases: penalty dice and exploded dice
      const penaltyRollCrit = fakeRoll({
        id: "p1",
        notation: "2d6-1d4",
        dice: [
          fakeDie({ id: "a", face: 3, sides: 6, kept: true, sign: 1 }),
          fakeDie({ id: "b", face: 4, sides: 4, kept: true, sign: -1 }),
        ],
      });
      t.eq(filterHistory([penaltyRollCrit], "crits", "").length, 0, "penalty die rolling max is not a crit");

      const penaltyRollFumble = fakeRoll({
        id: "p2",
        notation: "2d6-1d4",
        dice: [
          fakeDie({ id: "a", face: 3, sides: 6, kept: true, sign: 1 }),
          fakeDie({ id: "b", face: 1, sides: 4, kept: true, sign: -1 }),
        ],
      });
      t.eq(filterHistory([penaltyRollFumble], "fumbles", "").length, 0, "penalty die rolling 1 is not a fumble");

      const explodedOneRoll = fakeRoll({
        id: "ex1",
        notation: "1d20!",
        dice: [
          fakeDie({ id: "a", face: 20, sides: 20, kept: true, sign: 1, exploded: false }),
          fakeDie({ id: "b", face: 1, sides: 20, kept: true, sign: 1, exploded: true }),
        ],
      });
      t.eq(filterHistory([explodedOneRoll], "fumbles", "").length, 0, "exploded die rolling 1 is not a fumble");
      t.eq(filterHistory([explodedOneRoll], "crits", "").length, 1, "original natural 20 is still a crit");

      // Search query whitespace and typographic minus normalization
      const subRoll = fakeRoll({ id: "s1", notation: "2d6-1d4", total: -5 });
      t.eq(filterHistory([subRoll], "all", "2d6 - 1d4").length, 1, "search with spaces matches compact notation");
      t.eq(filterHistory([subRoll], "all", "2d6−1d4").length, 1, "search with typographic minus matches formula");
      t.eq(filterHistory([subRoll], "all", "−5").length, 1, "search with typographic minus matches total");
    },
  },
  {
    id: "ui-qol-history-browser",
    suite: "Interface",
    name: "ResultsTable interactive history QoL: load into pool, filter, and delete",
    description: "Mounts ResultsTable on a document with history to verify search input, load-into-pool, and delete-roll actions.",
    why: "Tabletop sessions need fluid pool loading from history, searching past rolls, and removing unwanted rolls.",
    env: "browser",
    run: (t) => {
      withStore(() => {
        const r1 = fakeRoll({ id: "h1", notation: "2d6+3", total: 11 });
        useDiceStore.setState({ history: [r1], last: r1 });
        const host = document.createElement("div");
        document.body.appendChild(host);
        const root = createRoot(host);
        try {
          flushSync(() => {
            root.render(createElement(ResultsTable));
          });
          const markup = host.innerHTML;
          t.ok(markup.includes("Filter roll history"), "search input rendered with history");
          t.ok(markup.includes("Load 2d6+3 into active pool"), "load pool action rendered");
          t.ok(markup.includes("Delete roll 2d6+3"), "delete roll action rendered");
          t.ok(markup.includes("1 roll shown"), "caption renders clean 1 roll shown");
          t.ok(!markup.includes("roll$"), "caption omits literal $");
        } finally {
          root.unmount();
          host.remove();
        }
      });
    },
  },
];
