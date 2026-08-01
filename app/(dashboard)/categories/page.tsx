"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, FolderTree, Hash, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  getCategories,
  getTags,
  updateCategory,
  updateTag,
} from "@/lib/data";
import { useAsync } from "@/lib/hooks/use-async";
import { useActiveSite, useAppStore } from "@/lib/store/app-store";
import type { Category, Tag } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SWATCHES = [
  "#2563EB",
  "#0E9AA7",
  "#4D7C2F",
  "#7C5CFF",
  "#D4483B",
  "#A3620A",
  "#6B6B72",
];

/** Formulaire de création inline : nom → slug auto, modifiable. */
function InlineCreate({
  namePlaceholder,
  withDescription,
  withColor,
  onCreate,
}: {
  namePlaceholder: string;
  withDescription?: boolean;
  withColor?: boolean;
  onCreate: (data: {
    name: string;
    slug: string;
    description?: string;
    color?: string;
  }) => Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [description, setDescription] = React.useState("");
  const [color, setColor] = React.useState(SWATCHES[0]);
  const [pending, setPending] = React.useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    try {
      await onCreate({
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: withDescription ? description.trim() || undefined : undefined,
        color: withColor ? color : undefined,
      });
      setName("");
      setSlug("");
      setSlugTouched(false);
      setDescription("");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 gap-2 border-b border-border p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-[1fr_1fr_auto]"
    >
      <Input
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          if (!slugTouched) setSlug(slugify(event.target.value));
        }}
        placeholder={namePlaceholder}
        aria-label={namePlaceholder}
      />
      <Input
        value={slug}
        onChange={(event) => {
          setSlugTouched(true);
          setSlug(slugify(event.target.value));
        }}
        placeholder="slug-auto"
        className="font-mono text-[13px]"
        aria-label="Slug"
      />

      {withDescription ? (
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (facultative)"
          aria-label="Description"
          className="sm:col-span-2 lg:col-span-1 lg:col-start-1"
        />
      ) : null}

      {withColor ? (
        <div className="flex items-center gap-1.5 sm:col-span-2 lg:col-span-1">
          <span className="text-xs text-muted">Couleur</span>
          {SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => setColor(swatch)}
              aria-label={`Couleur ${swatch}`}
              aria-pressed={color === swatch}
              className="flex size-7 items-center justify-center rounded-md transition-transform hover:scale-110"
              style={{ backgroundColor: swatch }}
            >
              {color === swatch ? (
                <Check className="size-3.5 text-white" strokeWidth={3} />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={!name.trim() || pending}
        className="sm:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-1"
      >
        <Plus />
        {pending ? "Ajout…" : "Ajouter"}
      </Button>
    </form>
  );
}

interface TaxonomyRow {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
}

function TaxonomyList({
  rows,
  loading,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  showColor,
  onSave,
  onDelete,
}: {
  rows: TaxonomyRow[];
  loading: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: React.ComponentType<{ className?: string }>;
  showColor?: boolean;
  onSave: (id: string, data: { name: string; slug: string }) => Promise<void>;
  onDelete: (row: TaxonomyRow) => void;
}) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState({ name: "", slug: "" });

  function startEdit(row: TaxonomyRow) {
    setEditingId(row.id);
    setDraft({ name: row.name, slug: row.slug });
  }

  async function commit(id: string) {
    if (!draft.name.trim()) return;
    await onSave(id, { name: draft.name.trim(), slug: draft.slug.trim() });
    setEditingId(null);
  }

  if (loading) return <TableSkeleton rows={4} columns={4} />;

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {rows.map((row) => {
        const editing = editingId === row.id;
        return (
          <li
            key={row.id}
            className="flex flex-col gap-2 px-3 py-3 transition-colors hover:bg-surface-2 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
          >
            {editing ? (
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, name: event.target.value }))
                  }
                  aria-label="Nom"
                  autoFocus
                />
                <Input
                  value={draft.slug}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      slug: slugify(event.target.value),
                    }))
                  }
                  className="font-mono text-[13px]"
                  aria-label="Slug"
                />
              </div>
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                {showColor ? (
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color ?? "var(--muted)" }}
                  />
                ) : (
                  <Hash className="size-3.5 shrink-0 text-muted" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.name}</p>
                  <p className="truncate font-mono text-[11px] text-muted">
                    /{row.slug}
                    {row.description ? ` · ${row.description}` : ""}
                  </p>
                </div>
              </div>
            )}

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <span className="mr-auto whitespace-nowrap rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted tabular sm:mr-0">
                {row.postCount} article{row.postCount > 1 ? "s" : ""}
              </span>

              {editing ? (
                <>
                  <Button size="sm" onClick={() => commit(row.id)}>
                    <Check />
                    Enregistrer
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditingId(null)}
                    aria-label="Annuler"
                  >
                    <X />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => startEdit(row)}
                    aria-label={`Modifier ${row.name}`}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(row)}
                    aria-label={`Supprimer ${row.name}`}
                  >
                    <Trash2 />
                  </Button>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function CategoriesPage() {
  const activeSiteId = useAppStore((s) => s.activeSiteId);
  const activeSite = useActiveSite();
  const [pendingDelete, setPendingDelete] = React.useState<{
    kind: "category" | "tag";
    row: TaxonomyRow;
  } | null>(null);

  const categories = useAsync(() => getCategories(activeSiteId), [activeSiteId]);
  const tags = useAsync(() => getTags(activeSiteId), [activeSiteId]);

  const targetSiteId = activeSiteId;

  async function handleDelete() {
    if (!pendingDelete) return;
    if (pendingDelete.kind === "category") {
      await deleteCategory(pendingDelete.row.id);
      toast.success("Catégorie supprimée");
      categories.reload();
    } else {
      await deleteTag(pendingDelete.row.id);
      toast.success("Tag supprimé");
      tags.reload();
    }
    setPendingDelete(null);
  }

  if (!targetSiteId) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Catégories & tags"
          description="Choisissez un site pour gérer ses catégories et ses tags."
        />
        <Card>
          <EmptyState
            icon={FolderTree}
            title="Sélectionnez un site"
            description="Les catégories et les tags appartiennent à un site : basculez depuis le sélecteur en haut de page."
          />
        </Card>
      </div>
    );
  }

  const categoryRows: TaxonomyRow[] = (categories.data ?? []) as Category[];
  const tagRows: TaxonomyRow[] = (tags.data ?? []) as Tag[];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Catégories & tags"
        description={`Organisation du contenu de ${activeSite?.name ?? "ce site"}.`}
      />

      <Tabs defaultValue="categories">
        <TabsList className="sm:w-auto">
          <TabsTrigger value="categories" className="flex-1 sm:flex-none">
            Catégories
            <span className="font-mono text-[11px] text-muted tabular">
              {categoryRows.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex-1 sm:flex-none">
            Tags
            <span className="font-mono text-[11px] text-muted tabular">
              {tagRows.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card className="overflow-hidden">
            <InlineCreate
              namePlaceholder="Nom de la catégorie"
              withDescription
              withColor
              onCreate={async (data) => {
                await createCategory({ siteId: targetSiteId, ...data });
                toast.success("Catégorie créée");
                categories.reload();
              }}
            />
            <TaxonomyList
              rows={categoryRows}
              loading={categories.loading}
              showColor
              emptyIcon={FolderTree}
              emptyTitle="Aucune catégorie pour l'instant"
              emptyDescription="Créez la première catégorie avec le formulaire ci-dessus."
              onSave={async (id, data) => {
                await updateCategory(id, data);
                toast.success("Catégorie mise à jour");
                categories.reload();
              }}
              onDelete={(row) => setPendingDelete({ kind: "category", row })}
            />
          </Card>
        </TabsContent>

        <TabsContent value="tags">
          <Card className="overflow-hidden">
            <InlineCreate
              namePlaceholder="Nom du tag"
              onCreate={async (data) => {
                await createTag({ siteId: targetSiteId, ...data });
                toast.success("Tag créé");
                tags.reload();
              }}
            />
            <TaxonomyList
              rows={tagRows}
              loading={tags.loading}
              emptyIcon={Hash}
              emptyTitle="Aucun tag pour l'instant"
              emptyDescription="Ajoutez un premier tag pour affiner le classement des articles."
              onSave={async (id, data) => {
                await updateTag(id, data);
                toast.success("Tag mis à jour");
                tags.reload();
              }}
              onDelete={(row) => setPendingDelete({ kind: "tag", row })}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={
          pendingDelete?.kind === "category"
            ? "Supprimer cette catégorie ?"
            : "Supprimer ce tag ?"
        }
        description={`« ${pendingDelete?.row.name ?? ""} » sera retiré des ${pendingDelete?.row.postCount ?? 0} article(s) concerné(s). Les articles eux-mêmes sont conservés.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
