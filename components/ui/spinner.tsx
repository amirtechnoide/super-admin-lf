import { cn } from "@/lib/utils";

/** Indicateur d'attente — hérite de la couleur du texte parent. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70",
        className
      )}
    />
  );
}
