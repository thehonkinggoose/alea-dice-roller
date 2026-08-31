import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/dice/AppHeader";
import { UserGuide } from "@/components/dice/docs/UserGuide";

export const Route = createFileRoute("/guide")({
  component: GuidePage,
  head: () => ({
    meta: [
      { title: "Guide · Alea" },
      {
        name: "description",
        content: "How to build a pool, load or fair the table, and read every face in Alea.",
      },
    ],
  }),
});

function GuidePage() {
  return (
    <div className="page-shell">
      <AppHeader />
      <main
        id="main-content"
        tabIndex={-1}
        aria-labelledby="guide-heading"
        className="flex min-w-0 flex-col gap-5 outline-none sm:gap-6"
      >
        <UserGuide />
      </main>
    </div>
  );
}
