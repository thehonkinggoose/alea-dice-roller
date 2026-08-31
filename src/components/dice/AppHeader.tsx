import { Dices } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { FOCUS_RING } from "@/lib/dice/a11y";
import { cn } from "@/lib/utils";

const linkBase = cn(
  FOCUS_RING,
  "inline-flex h-11 items-center rounded-md px-2 text-xs font-medium uppercase tracking-widest transition-colors",
);

const NAV = [
  { to: "/", label: "Table", aria: "Table" },
  { to: "/guide", label: "Guide", aria: "Guide" },
  { to: "/faq", label: "FAQ", aria: "FAQ" },
  { to: "/keys", label: "Keys", aria: "Keyboard tutorial" },
  { to: "/tests", label: "Tests", aria: "Tests" },
] as const;

const HINTS: Record<string, { mobile?: string; desktop: string }> = {
  "/": {
    mobile: "Space to roll · history stays on this device",
    desktop: "Space to roll · Enter in the notation field · History stays on this device",
  },
  "/guide": { desktop: "How the table works" },
  "/faq": { desktop: "Short answers, same honesty as the table" },
  "/keys": { desktop: "JAWS Professional 2026 · Insert on desktop, Caps Lock on a laptop" },
  "/tests": { desktop: "Open a case for the full technical record" },
};

export function AppHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const hint = HINTS[path] ?? HINTS["/guide"];

  return (
    <header className="flex min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-end md:justify-between">
      <div className="flex items-baseline gap-3">
        <span
          className="flex size-10 items-center justify-center rounded-lg border border-border bg-elevated text-foreground"
          aria-hidden="true"
        >
          <Dices className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <h1 id="app-title" className="font-display text-3xl leading-none tracking-tight text-foreground sm:text-4xl">
            Alea
          </h1>
          <p className="mt-1 text-sm italic text-muted-foreground">The die is cast.</p>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-1 md:items-end">
        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center gap-1 md:justify-end">
            {NAV.map((item) => {
              const current = path === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-label={item.aria}
                    aria-current={current ? "page" : undefined}
                    className={linkBase}
                    activeProps={{ className: cn(linkBase, "text-foreground") }}
                    inactiveProps={{ className: cn(linkBase, "text-subtle hover:text-foreground") }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {hint.mobile ? (
          <>
            <p className="max-w-48 text-right text-xs leading-relaxed text-subtle sm:hidden">{hint.mobile}</p>
            <p className="hidden max-w-xs text-right text-xs leading-relaxed text-subtle sm:block">{hint.desktop}</p>
          </>
        ) : (
          <p className="hidden max-w-xs text-right text-xs leading-relaxed text-subtle sm:block">{hint.desktop}</p>
        )}
      </div>
    </header>
  );
}
