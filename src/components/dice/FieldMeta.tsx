import { Label } from "@/components/ui/label";

type Props = {
  htmlFor?: string;
  label: string;
  hint?: string;
  hintId?: string;
  labelId?: string;
};

export function FieldMeta({ htmlFor, label, hint, hintId, labelId }: Props) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Label htmlFor={htmlFor} id={labelId}>
        {label}
      </Label>
      {hint ? (
        <p id={hintId} className="text-xs leading-snug text-pretty text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
