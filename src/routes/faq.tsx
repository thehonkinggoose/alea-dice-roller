import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/dice/AppHeader";
import { Faq } from "@/components/dice/docs/Faq";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQ · Alea" },
      {
        name: "description",
        content: "Short answers about exploding dice, keep, luck, streak, seed, and where rolls are stored.",
      },
    ],
  }),
});

function FaqPage() {
  return (
    <div className="page-shell">
      <AppHeader />
      <main
        id="main-content"
        tabIndex={-1}
        aria-labelledby="faq-heading"
        className="flex min-w-0 flex-col gap-5 outline-none sm:gap-6"
      >
        <Faq />
      </main>
    </div>
  );
}
