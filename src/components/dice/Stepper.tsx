import { useId, type KeyboardEvent } from "react";
import { Minus, Plus } from "lucide-react";
import { FieldMeta } from "@/components/dice/FieldMeta";
import { Button } from "@/components/ui/button";
import { slugLabel } from "@/lib/dice/a11y";

type Props = {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onStep: (delta: number) => void;
  signed?: boolean;
  disabled?: boolean;
  display?: string;
};

export function Stepper({ label, hint, value, min, max, onStep, signed, disabled, display }: Props) {
  const uid = useId();
  const slug = slugLabel(label);
  const labelId = `${uid}-${slug}-label`;
  const hintId = hint ? `${uid}-${slug}-hint` : undefined;
  const valueId = `${uid}-${slug}-value`;
  const shown = display ?? (signed && value > 0 ? `+${value}` : String(value));
  const locked = Boolean(disabled && display === "—");
  const spoken = locked ? `${label} locked` : `${label} ${shown}`;

  function handleKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      if (value > min) onStep(-1);
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      if (value < max) onStep(1);
    } else if (event.key === "Home") {
      event.preventDefault();
      if (value !== min) onStep(min - value);
    } else if (event.key === "End") {
      event.preventDefault();
      if (value !== max) onStep(max - value);
    }
  }

  return (
    <div
      className="flex min-w-0 flex-col gap-1.5"
      role="group"
      aria-labelledby={labelId}
      aria-describedby={hintId}
      data-testid={`stepper-${slug}`}
    >
      <FieldMeta label={label} hint={hint} labelId={labelId} hintId={hintId} />
      <div className="flex items-center justify-between gap-1">
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="shrink-0"
          aria-label={locked ? `Decrease ${label}, locked` : `Decrease ${label}, currently ${shown}`}
          title={`Decrease ${label}`}
          disabled={disabled || value <= min}
          onClick={() => onStep(-1)}
          onKeyDown={handleKey}
        >
          <Minus aria-hidden="true" />
        </Button>
        <span
          id={valueId}
          className="min-w-8 text-center font-mono text-sm tabular-nums text-foreground"
          aria-live="polite"
          aria-atomic="true"
          aria-label={spoken}
        >
          {shown}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="shrink-0"
          aria-label={locked ? `Increase ${label}, locked` : `Increase ${label}, currently ${shown}`}
          title={`Increase ${label}`}
          disabled={disabled || value >= max}
          onClick={() => onStep(1)}
          onKeyDown={handleKey}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
