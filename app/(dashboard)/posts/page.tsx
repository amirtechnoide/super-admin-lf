"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Archive,
  FileText,
  Filter,
  MoreHorizontal,
  PenSquare,
  Search,
  Send,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import {
  bulkDeletePosts,
  bulkUpdatePostStatus,
  deletePost,
  getCategories,
  getPosts,
} from "@/lib/data";
import { useAsync, useDebounced } from "@/lib/hooks/use-async";
import { useAppStore } from "@/lib/store/app-store";
import type { Post, PostStatus } from "@/lib/types";
import { POST_STATUS_LABELS } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PostStatusBadge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { BulkActionBar, DataTable, type Column } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiteDot } from "@/components/layout/site-switcher";

const STATUS_OPTIONS: (PostStatus | "all")[] = [
  "all",
  "published",
  "draft",
  "scheduled",
  "archived",
];

export default function PostsPage() {
  const router = useRouter();
  const activeSiteId = useAppStore((s) => s.activeSiteId);
  const sites = useAppStore((s) => s.sites);
  const admin = useAppStore((s) => s.admin);
  const aggregated = activeSiteId === null;

  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<PostStatus | "all">("all");
  const [categoryId, setCategoryId] = React.useState("all");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [toDelete, setToDelete] = React.useState<Post | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  const debouncedQuery = useDebounced(query, 300);

  const categories = useAsync(
    () => getCategories(activeSiteId),
    [activeSiteId]
  );

  const posts = useAsync(
    () =>
      getPosts({
        siteId: activeSiteId,
        status,
        categoryId: categoryId === "all" ? undefined : categoryId,
        query: debouncedQuery || undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
        pageSize: 500,
      }),
    [activeSiteId, status, categoryId, debouncedQuery, from, to]
  );

  // La sélection ne doit pas survivre à un changement de périmètre.
  const [scope, setScope] = React.useState(activeSiteId);
  if (scope !== activeSiteId) {
    setScope(activeSiteId);
    setSelected([]);
    setCategoryId("all");
  }

  const rows = posts.data?.items ?? [];
  const hasFilters =
    Boolean(query) || status !== "all" || categoryId !== "all" || from || to;

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setCategoryId("all");
    setFrom("");
    setTo("");
  }

  async function applyBulkStatus(next: PostStatus) {
    await bulkUpdatePostStatus(selected, next);
    toast.success(
      next === "published"
        ? `${selected.length} article(s) publié(s)`
        : `${selected.length} article(s) archivé(s)`
    );
    setSelected([]);
    posts.reload();
  }

  async function confirmBulkDelete() {
    const count = selected.length;
    await bulkDeletePosts(selected);
    toast.success(`${count} article(s) supprimé(s)`);
    setSelected([]);
    posts.reload();
  }

  async function confirmDelete() {
    if (!toDelete) return;
    await deletePost(toDelete.id);
    toast.success("Article supprimé");
    setToDelete(null);
    posts.reload();
  }

  function categoryNames(post: Post) {
    const names = post.categoryIds
      .map((id) => categories.data?.find((c) => c.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : "—";
  }

  const columns: Column<Post>[] = [
    {
      key: "title",
      header: "Article",
      sortValue: (post) => post.title,
      // `w-full max-w-0` : la colonne absorbe la place restante et tronque.
      className: "w-full max-w-0",
      cell: (post) => (
        <div className="flex items-start gap-2.5">
          {aggregated ? (
            <span className="mt-1.5">
              <SiteDot
                color={sites.find((s) => s.id === post.siteId)?.accentColor}
              />
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="truncate font-medium text-text">{post.title}</p>
            <p className="truncate text-xs text-muted">{post.excerpt}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      sortValue: (post) => POST_STATUS_LABELS[post.status],
      cell: (post) => <PostStatusBadge status={post.status} />,
    },
    {
      key: "category",
      header: "Catégorie",
      sortValue: categoryNames,
      cell: (post) => (
        <span className="block max-w-[160px] truncate text-[13px] text-muted">
          {categoryNames(post)}
        </span>
      ),
    },
    {
      key: "author",
      header: "Auteur",
      cell: () => (
        <div className="flex items-center gap-2">
          <UserAvatar name={admin.name} src={admin.avatarUrl} className="size-6" />
          <span className="whitespace-nowrap text-[13px] text-muted">
            {admin.name}
          </span>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortValue: (post) => post.publishedAt ?? post.createdAt,
      cell: (post) => (
        <span className="whitespace-nowrap font-mono text-xs text-muted">
          {formatDate(post.publishedAt ?? post.scheduledAt ?? post.createdAt)}
        </span>
      ),
    },
    {
      key: "views",
      header: "Vues",
      align: "right",
      sortValue: (post) => post.views,
      cell: (post) => (
        <span className="font-mono text-xs tabular text-muted">
          {formatNumber(post.views)}
        </span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      cell: (post) => (
        <div onClick={(event) => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => router.push(`/posts/${post.id}/edit`)}
              >
                <SquarePen />
                Modifier
              </DropdownMenuItem>
              {post.status !== "published" ? (
                <DropdownMenuItem
                  onSelect={async () => {
                    await bulkUpdatePostStatus([post.id], "published");
                    toast.success("Article publié");
                    posts.reload();
                  }}
                >
                  <Send />
                  Publier
                </DropdownMenuItem>
              ) : null}
              {post.status !== "archived" ? (
                <DropdownMenuItem
                  onSelect={async () => {
                    await bulkUpdatePostStatus([post.id], "archived");
                    toast.success("Article archivé");
                    posts.reload();
                  }}
                >
                  <Archive />
                  Archiver
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => setToDelete(post)}>
                <Trash2 />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Articles"
        description={
          aggregated
            ? "Tous les articles, tous sites confondus."
            : `Les articles du blog ${sites.find((s) => s.id === activeSiteId)?.name ?? "…"}.`
        }
        actions={
          <Button asChild>
            <Link href="/posts/new">
              <PenSquare />
              Nouvel article
            </Link>
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {/* Barre de recherche et filtres --------------------------------- */}
        <div className="space-y-3 border-b border-border p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un article…"
                className="pl-9"
                aria-label="Rechercher un article"
              />
            </div>
            <Button
              variant={filtersOpen ? "secondary" : "outline"}
              size="icon"
              className="sm:hidden"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-label="Filtres"
              aria-expanded={filtersOpen}
            >
              <Filter />
            </Button>
          </div>

          {/* Filtres : repliés sous sm, en ligne au-delà. */}
          <div
            className={`${filtersOpen ? "grid" : "hidden"} grid-cols-1 gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-4`}
          >
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as PostStatus | "all")}
            >
              <SelectTrigger aria-label="Filtrer par statut">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "all"
                      ? "Tous les statuts"
                      : POST_STATUS_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger aria-label="Filtrer par catégorie">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {(categories.data ?? []).map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              aria-label="Date de début"
            />
            <Input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              aria-label="Date de fin"
            />
          </div>

          {hasFilters ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted tabular">
                {rows.length} résultat{rows.length > 1 ? "s" : ""}
              </p>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X />
                Réinitialiser
              </Button>
            </div>
          ) : null}
        </div>

        <BulkActionBar count={selected.length} onClear={() => setSelected([])}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => applyBulkStatus("published")}
          >
            <Send />
            Publier
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => applyBulkStatus("archived")}
          >
            <Archive />
            Archiver
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setBulkDeleteOpen(true)}
          >
            <Trash2 />
            Supprimer
          </Button>
        </BulkActionBar>

        <DataTable
          rows={rows}
          columns={columns}
          getRowId={(post) => post.id}
          loading={posts.loading}
          selectable
          selectedIds={selected}
          onSelectedChange={setSelected}
          onRowClick={(post) => router.push(`/posts/${post.id}/edit`)}
          pageSize={12}
          minWidth={840}
          empty={
            hasFilters ? (
              <EmptyState
                icon={Search}
                title="Aucun article ne correspond"
                description="Élargissez la recherche ou retirez un filtre pour voir plus de résultats."
                action={
                  <Button variant="outline" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={FileText}
                title="Aucun article pour l'instant"
                description="Créez le premier article de ce site — il apparaîtra immédiatement dans cette liste."
                action={
                  <Button asChild>
                    <Link href="/posts/new">
                      <PenSquare />
                      Créer le premier article
                    </Link>
                  </Button>
                }
              />
            )
          }
          renderCard={(post) => (
            <Link href={`/posts/${post.id}/edit`} className="block space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 flex-1 text-sm font-medium leading-snug">
                  {post.title}
                </p>
                <PostStatusBadge status={post.status} />
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted">
                {post.excerpt}
              </p>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted">
                <span>
                  {formatDate(
                    post.publishedAt ?? post.scheduledAt ?? post.createdAt
                  )}
                </span>
                <span aria-hidden>·</span>
                <span>{formatNumber(post.views)} vues</span>
                {categoryNames(post) !== "—" ? (
                  <>
                    <span aria-hidden>·</span>
                    <span className="truncate">{categoryNames(post)}</span>
                  </>
                ) : null}
              </p>
            </Link>
          )}
        />
      </Card>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer cet article ?"
        description={`« ${toDelete?.title ?? ""} » sera définitivement retiré, ainsi que ses commentaires. Cette action est irréversible.`}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Supprimer ${selected.length} article(s) ?`}
        description="Les articles sélectionnés et leurs commentaires seront définitivement retirés. Cette action est irréversible."
        onConfirm={confirmBulkDelete}
      />
    </div>
  );
}
