import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("skeleton rounded-md", className)}
      {...props}
    />
  );
}

/**
 * Squelette de liste : table dense sur desktop, cartes empilées sous `md`,
 * pour que la structure de chargement corresponde au rendu final.
 */
export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div role="status" aria-label="Chargement de la liste">
      <div className="hidden md:block divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-[45%]" />
              <Skeleton className="h-3 w-[65%]" />
            </div>
            {Array.from({ length: Math.max(0, columns - 1) }).map((__, colIndex) => (
              <Skeleton key={colIndex} className="h-4 w-16 shrink-0" />
            ))}
          </div>
        ))}
      </div>

      <div className="md:hidden divide-y divide-border">
        {Array.from({ length: Math.min(rows, 4) }).map((_, rowIndex) => (
          <div key={rowIndex} className="space-y-2 px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-5 w-16 shrink-0 rounded-md" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Chargement"
      className={cn(
        "rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-3",
        className
      )}
    >
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

/** Squelette de liste simple (articles récents, entreprises…). */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Chargement" className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-[55%]" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-16 shrink-0 rounded-md" />
        </div>
      ))}
    </div>
  );
}
