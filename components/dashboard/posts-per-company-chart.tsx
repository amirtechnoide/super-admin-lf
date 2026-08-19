"use client";

import { useCompanies } from "@/lib/queries/use-companies";
import { accentForCompany } from "@/lib/theme/company-accent";
import { formatNumber } from "@/lib/utils";

interface Row {
  companyName: string;
  postCount: number;
}

/**
 * Répartition des articles par entreprise — barres horizontales alimentées par
 * `/stats`. Pas de librairie de charts : la donnée est un simple classement.
 */
export function PostsPerCompanyChart({ rows }: { rows: Row[] }) {
  const { data: companies = [] } = useCompanies();

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] text-muted">
        Aucun article pour l&apos;instant.
      </p>
    );
  }

  const max = Math.max(...rows.map((r) => r.postCount), 1);
  const sorted = [...rows].sort((a, b) => b.postCount - a.postCount);

  return (
    <ul className="space-y-3">
      {sorted.map((row) => {
        const company = companies.find((c) => c.name === row.companyName);
        const accent = accentForCompany(company);
        const width = Math.max(2, (row.postCount / max) * 100);
        return (
          <li key={row.companyName} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-[13px] font-medium">
                {row.companyName}
              </span>
              <span className="shrink-0 font-mono text-xs text-muted tabular">
                {formatNumber(row.postCount)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${width}%`, backgroundColor: accent }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
