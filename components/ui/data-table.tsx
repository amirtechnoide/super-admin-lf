"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "./checkbox";
import { Button } from "./button";
import { TableSkeleton } from "./skeleton";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  /** Rendu de la cellule. */
  cell: (row: T) => React.ReactNode;
  /** Valeur de tri ; rend la colonne triable si fournie. */
  sortValue?: (row: T) => string | number;
  className?: string;
  headerClassName?: string;
  align?: "left" | "right";
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  /** Rendu mobile : une carte empilée par ligne (obligatoire sous md). */
  renderCard: (row: T) => React.ReactNode;
  loading?: boolean;
  empty?: React.ReactNode;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectedChange?: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  /** Largeur minimale de la table sur desktop (scroll horizontal maîtrisé). */
  minWidth?: number;
  className?: string;
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  renderCard,
  loading,
  empty,
  selectable,
  selectedIds = [],
  onSelectedChange,
  onRowClick,
  pageSize = 10,
  minWidth = 860,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = React.useState<{
    key: string;
    dir: "asc" | "desc";
  } | null>(null);
  const [page, setPage] = React.useState(1);
  const [knownCount, setKnownCount] = React.useState(rows.length);

  // Revenir en page 1 quand le jeu de données change de taille (filtres).
  // Ajustement pendant le rendu : pas d'aller-retour d'effet.
  if (knownCount !== rows.length) {
    setKnownCount(rows.length);
    setPage(1);
  }

  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return rows;
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = column.sortValue!(a);
      const vb = column.sortValue!(b);
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * factor;
      }
      return String(va).localeCompare(String(vb), "fr") * factor;
    });
  }, [rows, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pageIds = pageRows.map(getRowId);
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const someSelected = pageIds.some((id) => selectedIds.includes(id));

  function toggleAll() {
    if (!onSelectedChange) return;
    onSelectedChange(
      allSelected
        ? selectedIds.filter((id) => !pageIds.includes(id))
        : [...new Set([...selectedIds, ...pageIds])]
    );
  }

  function toggleRow(id: string) {
    if (!onSelectedChange) return;
    onSelectedChange(
      selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id]
    );
  }

  function toggleSort(key: string) {
    setSort((prev) =>
      prev?.key === key
        ? prev.dir === "asc"
          ? { key, dir: "desc" }
          : null
        : { key, dir: "asc" }
    );
  }

  if (loading) {
    return (
      <div className={className}>
        <TableSkeleton rows={5} columns={columns.length} />
      </div>
    );
  }

  if (sorted.length === 0) {
    return <div className={className}>{empty}</div>;
  }

  return (
    <div className={className}>
      {/* Desktop : table dense, scroll horizontal contenu dans le conteneur. */}
      <div className="hidden md:block overflow-x-auto scrollbar-thin">
        <table
          className="w-full border-collapse text-sm"
          style={{ minWidth }}
        >
          <thead>
            <tr className="border-b border-border">
              {selectable ? (
                <th className="w-10 px-4 py-2.5 text-left align-middle">
                  <Checkbox
                    checked={
                      allSelected
                        ? true
                        : someSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={toggleAll}
                    aria-label="Tout sélectionner"
                  />
                </th>
              ) : null}
              {columns.map((column) => {
                const sortable = Boolean(column.sortValue);
                const active = sort?.key === column.key;
                return (
                  <th
                    key={column.key}
                    className={cn(
                      "px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted",
                      column.align === "right" ? "text-right" : "text-left",
                      column.headerClassName
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded transition-colors hover:text-text",
                          active && "text-text"
                        )}
                      >
                        {column.header}
                        {active ? (
                          sort!.dir === "asc" ? (
                            <ArrowUp className="size-3" />
                          ) : (
                            <ArrowDown className="size-3" />
                          )
                        ) : null}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
              const id = getRowId(row);
              const selected = selectedIds.includes(id);
              return (
                <tr
                  key={id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-border transition-colors last:border-0",
                    selected ? "bg-accent-softer" : "hover:bg-surface-2",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {selectable ? (
                    <td
                      className="px-4 py-3 align-middle"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleRow(id)}
                        aria-label="Sélectionner la ligne"
                      />
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-3 py-3 align-middle",
                        column.align === "right" && "text-right",
                        column.className
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile : cartes empilées. */}
      <ul className="md:hidden divide-y divide-border">
        {pageRows.map((row) => {
          const id = getRowId(row);
          const selected = selectedIds.includes(id);
          return (
            <li
              key={id}
              className={cn(
                "flex items-start gap-3 px-4 py-3.5 transition-colors",
                selected && "bg-accent-softer"
              )}
            >
              {selectable ? (
                <span className="flex size-11 shrink-0 -m-2 items-center justify-center">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggleRow(id)}
                    aria-label="Sélectionner"
                  />
                </span>
              ) : null}
              <div
                className="min-w-0 flex-1"
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {renderCard(row)}
              </div>
            </li>
          );
        })}
      </ul>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
          <p className="text-xs text-muted tabular">
            {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, sorted.length)} sur{" "}
            {sorted.length}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Page précédente"
            >
              <ChevronLeft />
            </Button>
            <span className="px-1 text-xs text-muted tabular">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Page suivante"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Barre d'actions groupées, affichée dès qu'une ligne est sélectionnée. */
export function BulkActionBar({
  count,
  onClear,
  children,
}: {
  count: number;
  onClear: () => void;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-accent-softer px-4 py-2.5 sm:px-5">
      <p className="mr-auto text-[13px] font-medium text-text tabular">
        {count} sélectionné{count > 1 ? "s" : ""}
      </p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Annuler
      </Button>
    </div>
  );
}
