"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Check,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import {
  bulkDeleteComments,
  bulkModerateComments,
  getComments,
  getPosts,
  moderateComment,
} from "@/lib/data";
import { useAsync } from "@/lib/hooks/use-async";
import { useActiveSite, useAppStore } from "@/lib/store/app-store";
import type { CommentStatus } from "@/lib/types";
import { cn, formatRelative, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CommentStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { BulkActionBar } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteDot } from "@/components/layout/site-switcher";

const TABS: { value: CommentStatus; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "approved", label: "Approuvés" },
  { value: "spam", label: "Spam" },
];

export default function CommentsPage() {
  const activeSiteId = useAppStore((s) => s.activeSiteId);
  const activeSite = useActiveSite();
  const sites = useAppStore((s) => s.sites);
  const aggregated = activeSiteId === null;

  const [tab, setTab] = React.useState<CommentStatus>("pending");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const comments = useAsync(
    () => getComments({ siteId: activeSiteId }),
    [activeSiteId]
  );
  const posts = useAsync(
    () => getPosts({ siteId: activeSiteId, pageSize: 500 }),
    [activeSiteId]
  );

  // La sélection ne suit ni le changement d'onglet ni celui de site.
  const scopeKey = `${tab}|${activeSiteId ?? "all"}`;
  const [scope, setScope] = React.useState(scopeKey);
  if (scope !== scopeKey) {
    setScope(scopeKey);
    setSelected([]);
  }

  const all = comments.data ?? [];
  const counts: Record<CommentStatus, number> = {
    pending: all.filter((c) => c.status === "pending").length,
    approved: all.filter((c) => c.status === "approved").length,
    spam: all.filter((c) => c.status === "spam").length,
  };
  const rows = all.filter((c) => c.status === tab);

  function postTitle(postId: string) {
    return (
      posts.data?.items.find((p) => p.id === postId)?.title ??
      "Article supprimé"
    );
  }

  async function moderate(id: string, status: CommentStatus, message: string) {
    await moderateComment(id, status);
    toast.success(message);
    comments.reload();
  }

  async function bulkModerate(status: CommentStatus, message: string) {
    const count = selected.length;
    await bulkModerateComments(selected, status);
    toast.success(`${count} ${message}`);
    setSelected([]);
    comments.reload();
  }

  async function confirmDelete() {
    const count = selected.length;
    await bulkDeleteComments(selected);
    toast.success(`${count} commentaire(s) supprimé(s)`);
    setSelected([]);
    comments.reload();
  }

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Commentaires"
        description={
          aggregated
            ? "Modération sur l'ensemble des sites."
            : `Modération des commentaires de ${activeSite?.name ?? "ce site"}.`
        }
      />

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as CommentStatus)}
      >
        <TabsList className="sm:w-auto">
          {TABS.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="flex-1 sm:flex-none"
            >
              {item.label}
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 font-mono text-[10px] tabular",
                  item.value === "pending" && counts.pending > 0
                    ? "bg-accent-soft text-accent"
                    : "bg-surface-2 text-muted"
                )}
              >
                {counts[item.value]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((item) => (
          <TabsContent key={item.value} value={item.value}>
            <Card className="overflow-hidden">
              {rows.length > 0 ? (
                <div className="flex items-center gap-2.5 border-b border-border px-4 py-2.5 sm:px-5">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={() =>
                      setSelected(allSelected ? [] : rows.map((r) => r.id))
                    }
                    aria-label="Tout sélectionner"
                  />
                  <span className="text-xs text-muted">Tout sélectionner</span>
                </div>
              ) : null}

              <BulkActionBar
                count={selected.length}
                onClear={() => setSelected([])}
              >
                {tab !== "approved" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      bulkModerate("approved", "commentaire(s) approuvé(s)")
                    }
                  >
                    <Check />
                    Approuver
                  </Button>
                ) : null}
                {tab !== "pending" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      bulkModerate("pending", "commentaire(s) remis en attente")
                    }
                  >
                    <RotateCcw />
                    Remettre en attente
                  </Button>
                ) : null}
                {tab !== "spam" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      bulkModerate("spam", "commentaire(s) marqué(s) comme spam")
                    }
                  >
                    <ShieldAlert />
                    Spam
                  </Button>
                ) : null}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 />
                  Supprimer
                </Button>
              </BulkActionBar>

              {comments.loading ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="space-y-2 px-4 py-4 sm:px-5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  ))}
                </div>
              ) : rows.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title={
                    item.value === "pending"
                      ? "Rien à modérer"
                      : item.value === "approved"
                        ? "Aucun commentaire approuvé"
                        : "Aucun spam détecté"
                  }
                  description={
                    item.value === "pending"
                      ? "Tous les commentaires ont été traités. Revenez plus tard."
                      : "Cette file est vide pour le périmètre sélectionné."
                  }
                />
              ) : (
                <ul className="divide-y divide-border">
                  {rows.map((comment) => {
                    const site = sites.find((s) => s.id === comment.siteId);
                    const isSelected = selected.includes(comment.id);
                    return (
                      <li
                        key={comment.id}
                        className={cn(
                          "flex gap-3 px-4 py-4 transition-colors sm:px-5",
                          isSelected ? "bg-accent-softer" : "hover:bg-surface-2"
                        )}
                      >
                        <span className="flex size-11 shrink-0 -m-2 items-center justify-center sm:size-8">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggle(comment.id)}
                            aria-label={`Sélectionner le commentaire de ${comment.authorName}`}
                          />
                        </span>

                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10px] font-medium text-muted">
                              {initials(comment.authorName)}
                            </span>
                            <span className="text-[13px] font-medium">
                              {comment.authorName}
                            </span>
                            <span className="truncate font-mono text-[11px] text-muted">
                              {comment.authorEmail}
                            </span>
                            <CommentStatusBadge status={comment.status} />
                          </div>

                          <p className="text-[13px] leading-relaxed text-text">
                            {comment.content}
                          </p>

                          <p className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-muted">
                            {aggregated && site ? (
                              <>
                                <SiteDot color={site.accentColor} />
                                <span>{site.name}</span>
                                <span aria-hidden>·</span>
                              </>
                            ) : null}
                            <span>{formatRelative(comment.createdAt)}</span>
                            <span aria-hidden>·</span>
                            <Link
                              href={`/posts/${comment.postId}/edit`}
                              className="truncate text-accent underline-offset-2 hover:underline"
                            >
                              {postTitle(comment.postId)}
                            </Link>
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {comment.status !== "approved" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  moderate(
                                    comment.id,
                                    "approved",
                                    "Commentaire approuvé"
                                  )
                                }
                              >
                                <Check />
                                Approuver
                              </Button>
                            ) : null}
                            {comment.status !== "pending" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  moderate(
                                    comment.id,
                                    "pending",
                                    "Commentaire remis en attente"
                                  )
                                }
                              >
                                <RotateCcw />
                                Rejeter
                              </Button>
                            ) : null}
                            {comment.status !== "spam" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  moderate(
                                    comment.id,
                                    "spam",
                                    "Commentaire marqué comme spam"
                                  )
                                }
                              >
                                <ShieldAlert />
                                Spam
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Supprimer ${selected.length} commentaire(s) ?`}
        description="Les commentaires sélectionnés seront définitivement retirés. Cette action est irréversible."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
