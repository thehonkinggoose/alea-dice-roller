import type { ReactNode } from "react";
import { SpokenLabel } from "@/components/dice/SpokenLabel";
import { FOCUS_RING } from "@/lib/dice/a11y";
import { cn } from "@/lib/utils";

export type DocsSection = {
  id: string;
  title: string;
  children: ReactNode;
};

export function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center rounded-sm border border-border bg-elevated px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
      {children}
    </kbd>
  );
}

export function KeyTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: readonly string[];
  rows: readonly string[][];
}) {
  return (
    <div
      className="max-w-full min-w-0 overflow-x-auto"
      tabIndex={0}
      role="region"
      aria-label={`${caption}. Scroll sideways for every column.`}
    >
      <table className="data-table mt-1">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-y border-border text-xs text-subtle">
            {columns.map((col) => (
              <th key={col} scope="col" className="px-3 py-2 text-left font-medium first:pl-0 last:pr-0">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-border/80 align-top">
              {row.map((cell, i) => {
                const Tag = i === 0 ? "th" : "td";
                return (
                  <Tag
                    key={`${row[0]}-${columns[i]}`}
                    scope={i === 0 ? "row" : undefined}
                    className={cn(
                      "px-3 py-2 first:pl-0 last:pr-0",
                      i === 0 ? "text-left font-medium text-foreground" : "font-mono text-xs text-muted-foreground",
                    )}
                  >
                    {cell}
                  </Tag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type Props = {
  eyebrow: string;
  title: string;
  headingId: string;
  lede: string;
  sections: DocsSection[];
};

export function DocsPage({ eyebrow, title, headingId, lede, sections }: Props) {
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <section className="felt relative overflow-hidden rounded-xl border border-border p-4 sm:p-6" aria-labelledby={headingId}>
        <p className="text-xs font-medium text-muted-foreground">
          <SpokenLabel>{eyebrow}</SpokenLabel>
        </p>
        <h2 id={headingId} className="mt-2 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{lede}</p>
      </section>

      <nav
        aria-label="On this page"
        className="rounded-xl border border-border bg-card p-4 sm:p-5"
      >
        <h3 className="text-sm text-muted-foreground">
          <SpokenLabel>On this page</SpokenLabel>
        </h3>
        <ol className="mt-3 flex flex-col gap-1">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={cn(
                  FOCUS_RING,
                  "flex min-h-11 items-center gap-3 rounded-md px-2 text-sm text-foreground hover:bg-elevated",
                )}
              >
                <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-subtle">{index + 1}</span>
                <span>{section.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-heading`}
          className="scroll-mt-4 rounded-xl border border-border bg-card p-4 sm:p-5"
        >
          <h3 id={`${section.id}-heading`} className="font-display text-2xl tracking-tight text-foreground">
            {section.title}
          </h3>
          <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
            {section.children}
          </div>
        </section>
      ))}

      <nav aria-label="Other pages" className="flex flex-wrap gap-2 text-sm">
        <a className={cn(FOCUS_RING, "inline-flex h-11 items-center rounded-md px-3 text-foreground hover:bg-elevated")} href="/">
          Table
        </a>
        <a className={cn(FOCUS_RING, "inline-flex h-11 items-center rounded-md px-3 text-foreground hover:bg-elevated")} href="/guide">
          Guide
        </a>
        <a className={cn(FOCUS_RING, "inline-flex h-11 items-center rounded-md px-3 text-foreground hover:bg-elevated")} href="/faq">
          FAQ
        </a>
        <a className={cn(FOCUS_RING, "inline-flex h-11 items-center rounded-md px-3 text-foreground hover:bg-elevated")} href="/keys">
          Keys
        </a>
        <a className={cn(FOCUS_RING, "inline-flex h-11 items-center rounded-md px-3 text-foreground hover:bg-elevated")} href="/tests">
          Tests
        </a>
      </nav>
    </div>
  );
}
