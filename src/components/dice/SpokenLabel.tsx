import { cn } from "@/lib/utils";

type Props = {
  children: string;
  className?: string;
};

/** Felt labels stay in small caps visually; the accessible name stays in normal case. */
export function SpokenLabel({ children, className }: Props) {
  return (
    <span className={className}>
      <span aria-hidden="true" className="uppercase tracking-widest">
        {children}
      </span>
      <span className="sr-only normal-case tracking-normal">{children}</span>
    </span>
  );
}
