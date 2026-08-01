"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Eye, ImagePlus, Plus, Trash2, X } from "lucide-react";
import {
  createPost,
  createTag,
  deletePost,
  getCategories,
  getTags,
  updatePost,
} from "@/lib/data";
import { useAsync } from "@/lib/hooks/use-async";
import { useAppStore } from "@/lib/store/app-store";
import type { Post, PostStatus } from "@/lib/types";
import { POST_STATUS_LABELS } from "@/lib/types";
import {
  cn,
  estimateReadingTime,
  fromDatetimeLocal,
  slugify,
  toDatetimeLocal,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Field, Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UserAvatar } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "./rich-text-editor";
import { SeoPreview, CharCounter } from "./seo-preview";
import { PreviewDialog } from "./preview-dialog";
import { MediaPickerDialog } from "./media-picker";
import { SiteDot } from "@/components/layout/site-switcher";

const META_TITLE_MAX = 60;
const META_DESCRIPTION_MAX = 160;

interface FormState {
  siteId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: PostStatus;
  scheduledAt: string;
  categoryIds: string[];
  tagIds: string[];
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

function initialState(post: Post | undefined, fallbackSiteId: string): FormState {
  return {
    siteId: post?.siteId ?? fallbackSiteId,
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    coverImage: post?.coverImage ?? "",
    status: post?.status ?? "draft",
    scheduledAt: toDatetimeLocal(post?.scheduledAt),
    categoryIds: post?.categoryIds ?? [],
    tagIds: post?.tagIds ?? [],
    metaTitle: post?.seo.metaTitle ?? "",
    metaDescription: post?.seo.metaDescription ?? "",
    ogImage: post?.seo.ogImage ?? "",
  };
}

/** Libellé du bouton principal : il dit exactement l'action réalisée. */
const PRIMARY_LABEL: Record<PostStatus, string> = {
  draft: "Enregistrer le brouillon",
  published: "Publier",
  scheduled: "Planifier",
  archived: "Archiver",
};

const SUCCESS_TOAST: Record<PostStatus, string> = {
  draft: "Brouillon enregistré",
  published: "Article publié",
  scheduled: "Article planifié",
  archived: "Article archivé",
};

export function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const sites = useAppStore((s) => s.sites);
  const admin = useAppStore((s) => s.admin);
  const activeSiteId = useAppStore((s) => s.activeSiteId);
  const setActiveSite = useAppStore((s) => s.setActiveSite);

  const [form, setForm] = React.useState<FormState>(() =>
    initialState(post, activeSiteId ?? sites[0]?.id ?? "camci")
  );
  const [slugTouched, setSlugTouched] = React.useState(Boolean(post));
  const [pending, setPending] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = React.useState(false);
  const [ogPickerOpen, setOgPickerOpen] = React.useState(false);
  const [newTag, setNewTag] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // En création, le site de destination suit le switcher.
  const [scope, setScope] = React.useState(activeSiteId);
  if (scope !== activeSiteId) {
    setScope(activeSiteId);
    if (!post && activeSiteId) {
      setForm((prev) => ({ ...prev, siteId: activeSiteId }));
    }
  }

  const site = sites.find((s) => s.id === form.siteId);

  const categories = useAsync(() => getCategories(form.siteId), [form.siteId]);
  const tags = useAsync(() => getTags(form.siteId), [form.siteId]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(value: string) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  }

  function toggleCategory(id: string) {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));
  }

  function toggleTag(id: string) {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(id)
        ? prev.tagIds.filter((t) => t !== id)
        : [...prev.tagIds, id],
    }));
  }

  async function addTag() {
    const name = newTag.trim();
    if (!name) return;
    const tag = await createTag({ siteId: form.siteId, name });
    setNewTag("");
    tags.reload();
    setForm((prev) => ({ ...prev, tagIds: [...prev.tagIds, tag.id] }));
    toast.success("Tag créé");
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Donnez un titre à l'article.";
    if (!form.slug.trim()) next.slug = "Le slug ne peut pas être vide.";
    if (form.status === "scheduled" && !form.scheduledAt) {
      next.scheduledAt = "Choisissez une date et une heure de publication.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save() {
    if (!validate()) {
      toast.error("Complétez les champs signalés avant d'enregistrer.");
      return;
    }
    setPending(true);
    try {
      const payload = {
        siteId: form.siteId,
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content,
        coverImage: form.coverImage || undefined,
        status: form.status,
        scheduledAt:
          form.status === "scheduled"
            ? fromDatetimeLocal(form.scheduledAt)
            : undefined,
        categoryIds: form.categoryIds,
        tagIds: form.tagIds,
        authorId: admin.id,
        seo: {
          metaTitle: form.metaTitle.trim(),
          metaDescription: form.metaDescription.trim(),
          ogImage: form.ogImage || undefined,
        },
      };

      if (post) {
        await updatePost(post.id, payload);
      } else {
        const created = await createPost(payload);
        router.replace(`/posts/${created.id}/edit`);
      }

      // Le site du post devient le site actif : on reste dans le bon contexte.
      if (activeSiteId && activeSiteId !== form.siteId) setActiveSite(form.siteId);

      toast.success(SUCCESS_TOAST[form.status]);
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!post) return;
    await deletePost(post.id);
    toast.success("Article supprimé");
    router.push("/posts");
  }

  const readingTime = estimateReadingTime(form.content);
  const selectedTags = (tags.data ?? []).filter((tag) =>
    form.tagIds.includes(tag.id)
  );

  /* ---------------------------------------------------------------------- */
  /* Panneaux de réglages — un seul jeu de sections, deux mises en page.     */
  /* ---------------------------------------------------------------------- */

  const publicationPanel = (idPrefix: string) => (
    <div className="space-y-4">
      {!post ? (
        <Field label="Site" htmlFor={`${idPrefix}-site`}>
          <Select
            value={form.siteId}
            onValueChange={(value) => set("siteId", value)}
          >
            <SelectTrigger id={`${idPrefix}-site`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sites.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  <span className="flex items-center gap-2">
                    <SiteDot color={option.accentColor} />
                    {option.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}

      <Field label="Statut" htmlFor={`${idPrefix}-status`}>
        <Select
          value={form.status}
          onValueChange={(value) => set("status", value as PostStatus)}
        >
          <SelectTrigger id={`${idPrefix}-status`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(POST_STATUS_LABELS) as PostStatus[]).map((value) => (
              <SelectItem key={value} value={value}>
                {POST_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {form.status === "scheduled" ? (
        <Field
          label="Publication planifiée"
          htmlFor={`${idPrefix}-scheduled`}
          error={errors.scheduledAt}
        >
          <Input
            id={`${idPrefix}-scheduled`}
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(event) => set("scheduledAt", event.target.value)}
          />
        </Field>
      ) : null}

      <div className="rounded-lg bg-surface-2 px-3 py-2.5">
        <p className="text-xs leading-relaxed text-muted">
          {form.status === "published"
            ? "L'article sera visible immédiatement sur le site."
            : form.status === "scheduled"
              ? "L'article sera mis en ligne automatiquement à la date choisie."
              : form.status === "archived"
                ? "L'article reste accessible ici mais disparaît du site."
                : "Le brouillon n'est visible que dans ce dashboard."}
        </p>
      </div>
    </div>
  );

  const taxonomyPanel = (idPrefix: string) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Catégories</Label>
        {categories.loading ? (
          <p className="text-[13px] text-muted">Chargement…</p>
        ) : (categories.data ?? []).length === 0 ? (
          <p className="text-[13px] text-muted">
            Aucune catégorie sur ce site —{" "}
            <Link href="/categories" className="text-accent underline">
              créez-en une
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-1">
            {(categories.data ?? []).map((category) => (
              <li key={category.id}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-2 text-[13px] transition-colors hover:bg-surface-2">
                  <Checkbox
                    checked={form.categoryIds.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color ?? "var(--muted)" }}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {category.name}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-tag`}>Tags</Label>
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-accent transition-colors hover:brightness-105"
              >
                {tag.name}
                <X className="size-3" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {(tags.data ?? [])
            .filter((tag) => !form.tagIds.includes(tag.id))
            .map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted transition-colors hover:border-border-strong hover:text-text"
              >
                <Plus className="size-3" />
                {tag.name}
              </button>
            ))}
        </div>

        <div className="flex gap-2">
          <Input
            id={`${idPrefix}-tag`}
            value={newTag}
            onChange={(event) => setNewTag(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTag();
              }
            }}
            placeholder="Nouveau tag"
          />
          <Button variant="outline" onClick={addTag} disabled={!newTag.trim()}>
            Ajouter
          </Button>
        </div>
      </div>
    </div>
  );

  const coverPanel = (idPrefix: string) => (
    <div className="space-y-3">
      {form.coverImage ? (
        <div className="relative overflow-hidden rounded-lg border border-border">
          <div className="flex aspect-[16/9] items-center justify-center bg-surface-2 px-3">
            <span className="break-all text-center font-mono text-[11px] text-muted">
              {form.coverImage}
            </span>
          </div>
          <Button
            variant="secondary"
            size="icon-sm"
            className="absolute right-2 top-2"
            onClick={() => set("coverImage", "")}
            aria-label="Retirer l'image de couverture"
          >
            <X />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCoverPickerOpen(true)}
          className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-strong bg-surface-2 text-muted transition-colors hover:border-accent hover:text-text"
        >
          <ImagePlus className="size-5" />
          <span className="text-[13px]">Choisir une image</span>
        </button>
      )}

      <Input
        id={`${idPrefix}-cover`}
        value={form.coverImage}
        onChange={(event) => set("coverImage", event.target.value)}
        placeholder="/media/…"
        aria-label="Adresse de l'image de couverture"
      />
    </div>
  );

  const seoPanel = (idPrefix: string) => (
    <div className="space-y-4">
      <SeoPreview
        domain={site?.domain ?? "exemple.com"}
        slug={form.slug}
        metaTitle={form.metaTitle}
        metaDescription={form.metaDescription}
        fallbackTitle={form.title}
        fallbackDescription={form.excerpt}
      />

      <Field
        label="Meta title"
        htmlFor={`${idPrefix}-metatitle`}
        hint={<CharCounter value={form.metaTitle.length} max={META_TITLE_MAX} />}
      >
        <Input
          id={`${idPrefix}-metatitle`}
          value={form.metaTitle}
          onChange={(event) => set("metaTitle", event.target.value)}
          placeholder={form.title || "Titre affiché dans Google"}
        />
      </Field>

      <Field
        label="Meta description"
        htmlFor={`${idPrefix}-metadesc`}
        hint={
          <CharCounter
            value={form.metaDescription.length}
            max={META_DESCRIPTION_MAX}
          />
        }
      >
        <Textarea
          id={`${idPrefix}-metadesc`}
          rows={3}
          value={form.metaDescription}
          onChange={(event) => set("metaDescription", event.target.value)}
          placeholder="Résumé affiché sous le titre dans les résultats de recherche."
        />
      </Field>

      <Field label="Image Open Graph" htmlFor={`${idPrefix}-og`}>
        <div className="flex gap-2">
          <Input
            id={`${idPrefix}-og`}
            value={form.ogImage}
            onChange={(event) => set("ogImage", event.target.value)}
            placeholder="/media/…"
          />
          <Button variant="outline" onClick={() => setOgPickerOpen(true)}>
            Choisir
          </Button>
        </div>
      </Field>
    </div>
  );

  const authorPanel = () => (
    <div className="flex items-center gap-3">
      <UserAvatar name={admin.name} src={admin.avatarUrl} className="size-9" />
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium">{admin.name}</p>
        <p className="truncate font-mono text-xs text-muted">{admin.email}</p>
      </div>
    </div>
  );

  const sections = [
    { id: "publication", title: "Publication", render: publicationPanel },
    { id: "taxonomy", title: "Catégories & tags", render: taxonomyPanel },
    { id: "cover", title: "Image de couverture", render: coverPanel },
    { id: "seo", title: "SEO", render: seoPanel },
    { id: "author", title: "Auteur", render: () => authorPanel() },
  ];

  const actionButtons = (
    <>
      <Button variant="outline" onClick={() => setPreviewOpen(true)}>
        <Eye />
        Aperçu
      </Button>
      <Button onClick={save} disabled={pending}>
        {pending ? "Enregistrement…" : PRIMARY_LABEL[form.status]}
      </Button>
    </>
  );

  return (
    <div className="space-y-5 pb-24 lg:pb-0">
      {/* En-tête ---------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Retour aux articles">
            <Link href="/posts">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {post ? "Modifier l'article" : "Nouvel article"}
            </h1>
            <p className="truncate font-mono text-[11px] text-muted">
              {site?.name ?? "—"} · {readingTime} min de lecture
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {post ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteOpen(true)}
              aria-label="Supprimer l'article"
            >
              <Trash2 />
            </Button>
          ) : null}
          {actionButtons}
        </div>
      </div>

      {/* Colonne principale + panneau de réglages ------------------------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <Card>
            <CardContent className="space-y-4">
              <Field label="Titre" htmlFor="title" error={errors.title}>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  placeholder="Le titre de votre article"
                  className="h-11 text-base font-medium"
                />
              </Field>

              <Field label="Slug" htmlFor="slug" error={errors.slug}>
                <div className="flex items-center gap-2">
                  <span className="hidden shrink-0 font-mono text-xs text-muted sm:inline">
                    {site?.domain ?? "exemple.com"}/blog/
                  </span>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      set("slug", slugify(event.target.value));
                    }}
                    placeholder="slug-de-larticle"
                    className="font-mono text-[13px]"
                  />
                </div>
              </Field>
            </CardContent>
          </Card>

          <RichTextEditor
            content={form.content}
            onChange={(html) => set("content", html)}
          />

          <Card>
            <CardContent>
              <Field
                label="Extrait"
                htmlFor="excerpt"
                hint={`${form.excerpt.length} caractères`}
              >
                <Textarea
                  id="excerpt"
                  rows={3}
                  value={form.excerpt}
                  onChange={(event) => set("excerpt", event.target.value)}
                  placeholder="Une ou deux phrases qui donnent envie de lire l'article."
                />
              </Field>
            </CardContent>
          </Card>
        </div>

        {/* Desktop : sections en cartes empilées. */}
        <div className="hidden min-w-0 space-y-3 lg:block">
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>{section.render(`d-${section.id}`)}</CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile / tablette : mêmes sections en accordéon. */}
        <Card className="overflow-hidden lg:hidden">
          <Accordion type="multiple" defaultValue={["publication"]}>
            {sections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger>{section.title}</AccordionTrigger>
                <AccordionContent>
                  {section.render(`m-${section.id}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>

      {/* Barre d'action collante sur mobile — cible tactile confortable. */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-border bg-surface/95 px-3 py-2.5 backdrop-blur lg:hidden",
          "pb-[max(0.625rem,env(safe-area-inset-bottom))]"
        )}
      >
        {post ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteOpen(true)}
            aria-label="Supprimer l'article"
          >
            <Trash2 />
          </Button>
        ) : null}
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setPreviewOpen(true)}
        >
          <Eye />
          Aperçu
        </Button>
        <Button className="flex-1" onClick={save} disabled={pending}>
          {pending ? "…" : PRIMARY_LABEL[form.status]}
        </Button>
      </div>

      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={form.title}
        excerpt={form.excerpt}
        content={form.content}
        coverImage={form.coverImage || undefined}
        readingTime={readingTime}
        authorName={admin.name}
        siteName={site?.name ?? "—"}
      />

      <MediaPickerDialog
        open={coverPickerOpen}
        onOpenChange={setCoverPickerOpen}
        siteId={form.siteId}
        onSelect={(url) => set("coverImage", url)}
      />

      <MediaPickerDialog
        open={ogPickerOpen}
        onOpenChange={setOgPickerOpen}
        siteId={form.siteId}
        onSelect={(url) => set("ogImage", url)}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer cet article ?"
        description="L'article et ses commentaires seront définitivement retirés. Cette action est irréversible."
        onConfirm={handleDelete}
      />
    </div>
  );
}
