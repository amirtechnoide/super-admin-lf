"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreHorizontal,
  PenSquare,
  Search,
  Send,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import { usePosts, useDeletePost, useUpdatePost } from "@/lib/queries/use-posts";
import { useAppStore } from "@/lib/store/app-store";
import {
  POST_STATUS_LABELS,
  type Post,
  type PostStatus,
} from "@/lib/api/schemas";
import { ApiError } from "@/lib/api/errors";
import { formatDate, formatRelative } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PostStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/ui/query-state";
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
import {
  CompanyDot,
  useActiveCompany,
} from "@/components/layout/company-switcher";

const PAGE_SIZE = 10;

export default function PostsPage() {
  const router = useRouter();
  const activeCompanyId = useAppStore((s) => s.activeCompanyId);
  const activeCompany = useActiveCompany();
  const aggregated = activeCompanyId === null;

  const [page, setPage] = React.useState(0);
  const [status, setStatus] = React.useState<PostStatus | "ALL">("ALL");
  const [query, setQuery] = React.useState("");
  const [toDelete, setToDelete] = React.useState<Post | null>(null);

  // Changer de périmètre, de filtre ou de recherche ramène en première page.
  const scopeKey = `${activeCompanyId ?? "all"}|${status}|${query.trim()}`;
  const [scope, setScope] = React.useState(scopeKey);
  if (scope !== scopeKey) {
    setScope(scopeKey);
    setPage(0);
  }

  const posts = usePosts({
    companyId: activeCompanyId,
    status: status === "ALL" ? null : status,
  });

  const deletePost = useDeletePost();
  const updatePost = useUpdatePost();

  // L'API renvoie tout le périmètre d'un coup : la recherche porte donc sur
  // l'ensemble des articles, et la pagination est calculée ici.
  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return posts.data ?? [];
    return (posts.data ?? []).filter((post) =>
      `${post.title} ${post.excerpt} ${post.slug}`.toLowerCase().includes(needle)
    );
  }, [posts.data, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const rows = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  async function togglePublication(post: Post) {
    // Le PUT exige un companyId : sans entreprise rattachee, on ne peut pas
    // republier depuis la liste sans en choisir une dans l'editeur.
    if (!post.company) {
      toast.error(
        "Cet article n'est rattache a aucune entreprise : ouvrez-le pour en choisir une."
      );
      return;
    }
    const next: PostStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await updatePost.mutateAsync({
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        status: next,
        companyId: post.company.id,
        coverImageUrl: post.coverImageUrl ?? undefined,
      });
      toast.success(
        next === "PUBLISHED" ? "Article publié" : "Article repassé en brouillon"
      );
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "La mise à jour a échoué."
      );
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deletePost.mutateAsync(toDelete.id);
      toast.success("Article supprimé");
      setToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "La suppression a échoué."
      );
    }
  }

  const totalElements = filtered.length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Articles"
        description={
          aggregated
            ? "Tous les articles, toutes entreprises confondues."
            : `Les articles du blog ${activeCompany?.name ?? "…"}.`
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
        <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center sm:p-4">
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
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as PostStatus | "ALL")}
          >
            <SelectTrigger className="sm:w-44" aria-label="Filtrer par statut">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              <SelectItem value="PUBLISHED">
                {POST_STATUS_LABELS.PUBLISHED}
              </SelectItem>
              <SelectItem value="DRAFT">{POST_STATUS_LABELS.DRAFT}</SelectItem>
            </SelectContent>
          </Select>
          {query ? (
            <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
              <X />
              Effacer
            </Button>
          ) : null}
        </div>

        {posts.isError ? (
          <QueryError error={posts.error} onRetry={() => posts.refetch()} />
        ) : posts.isPending ? (
          <TableSkeleton rows={5} columns={4} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={query ? Search : FileText}
            title={
              query
                ? "Aucun article ne correspond"
                : "Aucun article pour l'instant"
            }
            description={
              query
                ? `Aucun résultat pour « ${query.trim()} ». Essayez un autre terme.`
                : "Créez le premier article — il apparaîtra immédiatement dans cette liste."
            }
            action={
              query ? (
                <Button variant="outline" onClick={() => setQuery("")}>
                  Effacer la recherche
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/posts/new">
                    <PenSquare />
                    Créer le premier article
                  </Link>
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto scrollbar-thin">
              <table
                className="w-full border-collapse text-sm"
                style={{ minWidth: 760 }}
              >
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted">
                      Article
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted">
                      Statut
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted">
                      Entreprise
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted">
                      Créé le
                    </th>
                    <th className="px-3 py-2.5 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((post) => (
                    <tr
                      key={post.id}
                      onClick={() => router.push(`/posts/${post.id}/edit`)}
                      className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-surface-2"
                    >
                      <td className="w-full max-w-0 px-4 py-3 align-middle">
                        <p className="truncate font-medium text-text">
                          {post.title}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {post.excerpt || post.slug}
                        </p>
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <PostStatusBadge status={post.status} />
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <span className="flex items-center gap-2 whitespace-nowrap text-[13px] text-muted">
                          <CompanyDot company={post.company} />
                          {post.company?.name ?? "—"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle font-mono text-xs text-muted">
                        {formatDate(post.createdAt)}
                      </td>
                      <td
                        className="px-3 py-3 text-right align-middle"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Actions sur ${post.title}`}
                            >
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() =>
                                router.push(`/posts/${post.id}/edit`)
                              }
                            >
                              <SquarePen />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => togglePublication(post)}
                            >
                              <Send />
                              {post.status === "PUBLISHED"
                                ? "Repasser en brouillon"
                                : "Publier"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              destructive
                              onSelect={() => setToDelete(post)}
                            >
                              <Trash2 />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="md:hidden divide-y divide-border">
              {rows.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.id}/edit`}
                    className="block space-y-1.5 px-4 py-3.5 transition-colors hover:bg-surface-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 text-sm font-medium leading-snug">
                        {post.title}
                      </p>
                      <PostStatusBadge status={post.status} />
                    </div>
                    {post.excerpt ? (
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted">
                        {post.excerpt}
                      </p>
                    ) : null}
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <CompanyDot company={post.company} />
                        {post.company?.name ?? "—"}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{formatRelative(post.createdAt)}</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
            <p className="text-xs text-muted tabular">
              Page {currentPage + 1} sur {totalPages} · {totalElements} article
              {totalElements > 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                aria-label="Page précédente"
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={currentPage + 1 >= totalPages}
                aria-label="Page suivante"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer cet article ?"
        description={`« ${toDelete?.title ?? ""} » sera définitivement retiré du blog. Cette action est irréversible.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
