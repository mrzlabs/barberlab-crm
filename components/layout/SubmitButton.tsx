"use client";

import { useFormStatus } from "react-dom";

type Props = {
  label: string;
  pendingLabel?: string;
  className?: string;
};

export function SubmitButton({ label, pendingLabel, className }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`relative flex items-center justify-center gap-2 transition disabled:opacity-60 ${className ?? ""}`}
      disabled={pending}
      type="submit"
      aria-busy={pending}
    >
      {pending && (
        <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {pending ? (pendingLabel ?? label) : label}
    </button>
  );
}
