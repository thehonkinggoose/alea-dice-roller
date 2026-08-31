import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/dice/AppHeader";
import { Assay } from "@/components/dice/Assay";

export const Route = createFileRoute("/tests")({
  component: TestsPage,
  head: () => ({
    meta: [
      { title: "Assay · Alea" },
      {
        name: "description",
        content: "Unit tests for Alea’s dice engine, session store, and interface — run live in the app.",
      },
    ],
  }),
});

function TestsPage() {
  return (
    <div className="page-shell">
      <AppHeader />
      <main
        id="main-content"
        tabIndex={-1}
        aria-labelledby="app-title"
        className="flex min-w-0 flex-col gap-5 outline-none sm:gap-6"
      >
        <Assay />
      </main>
    </div>
  );
}
