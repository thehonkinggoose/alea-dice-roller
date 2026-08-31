import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/dice/AppHeader";
import { JawsTutorial } from "@/components/dice/docs/JawsTutorial";

export const Route = createFileRoute("/keys")({
  component: KeysPage,
  head: () => ({
    meta: [
      { title: "Keys · Alea" },
      {
        name: "description",
        content: "A JAWS Professional 2026 tutorial for casting dice on Alea with the keyboard only.",
      },
    ],
  }),
});

function KeysPage() {
  return (
    <div className="page-shell">
      <AppHeader />
      <main
        id="main-content"
        tabIndex={-1}
        aria-labelledby="keys-heading"
        className="flex min-w-0 flex-col gap-5 outline-none sm:gap-6"
      >
        <JawsTutorial />
      </main>
    </div>
  );
}
