import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/dice/AppHeader";
import { DiceTray } from "@/components/dice/DiceTray";
import { RandomnessLab } from "@/components/dice/RandomnessLab";
import { ResultsTable } from "@/components/dice/ResultsTable";
import { RollPanel } from "@/components/dice/RollPanel";
import { StatsStrip } from "@/components/dice/StatsStrip";
import { isTypingTarget } from "@/lib/dice/keyboard";
import { useDiceStore } from "@/lib/dice/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const hydrate = useDiceStore((s) => s.hydrate);
  const roll = useDiceStore((s) => s.roll);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      if (e.repeat) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (useDiceStore.getState().rolling) return;
      e.preventDefault();
      roll();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [roll]);

  return (
    <div className="page-shell">
      <AppHeader />
      <main
        id="main-content"
        tabIndex={-1}
        aria-labelledby="app-title"
        className="flex min-w-0 flex-col gap-5 outline-none sm:gap-6"
      >
        <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-7">
            <DiceTray />
            <StatsStrip />
          </div>
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-5">
            <RollPanel />
            <RandomnessLab />
          </div>
        </div>
        <ResultsTable />
      </main>
    </div>
  );
}
