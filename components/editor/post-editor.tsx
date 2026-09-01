"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Eye, ImagePlus, Trash2, X } from "lucide-react";
import { useCompanies } from "@/lib/queries/use-companies";
import {
  useCreatePost,
  useDeletePost,
  useUpdatePost,
} from "@/lib/queries/use-posts";
import { useAppStore } from "@/lib/store/app-store";
import { useObjectUrl } from "@/lib/hooks/use-object-url";
import {
  MAX_CONTENT_LENGTH,
  POST_STATUS_LABELS,
  postFormSchema,
  type Post,
  type PostStatus,
} from "@/lib/api/schemas";
import { ApiError } from "@/lib/api/errors";
import {
  cn,
  estimateReadingTime,
  formatDateTime,
  fromDatetimeLocal,
  isFutureServerDateTime,
  isPastServerDateTime,
  nowDatetimeLocal,
  toDatetimeLocal,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ImagePreview } from "@/components/ui/image-preview";
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
import { PreviewDialog } from "./preview-dialog";
import { CompanyLogo } from "@/components/layout/company-switcher";

interface FormState {
  title: string;
  content: string;
  excerpt: string;
  status: PostStatus;
  companyId: number | null;
  coverImageUrl: string;
  /** Valeur d'un `<input type="datetime-local">`, vide = laissé au serveur. */
  publishedAt: string;
}

function initialState(post: Post | undefined, fallbackCompanyId: number | null): FormState {
  return {
    title: post?.title ?? "",
    content: post?.content ?? "",
    excerpt: post?.excerpt ?? "",
    status: post?.status ?? "DRAFT",
    companyId: post?.company?.id ?? fallbackCompanyId,
    coverImageUrl: post?.coverImageUrl ?? "",
    publishedAt: toDatetimeLocal(post?.publishedAt),
  };
}

/**
 * Le bouton principal dit exactement l'action réalisée. Un brouillon daté n'est
 * pas rangé de côté, il est programmé : le dire « Enregistrer le brouillon »
 * masquerait la seule chose qui distingue les deux gestes.
 */
function primaryLabel(status: PostStatus, scheduling: boolean): string {
  if (status === "PUBLISHED") return "Publier";
  return scheduling ? "Planifier l'article" : "Enregistrer le brouillon";
}

function successToast(status: PostStatus, scheduling: boolean): string {
  if (status === "PUBLISHED") return "Article publié";
  return scheduling ? "Article planifié" : "Brouillon enregistré";
}

export function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const activeCompanyId = useAppStore((s) => s.activeCompanyId);
  const setActiveCompany = useAppStore((s) => s.setActiveCompany);
  const { data: companies = [] } = useCompanies();

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const [form, setForm] = React.useState<FormState>(() =>
    initialState(post, activeCompanyId)
  );
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // En création, l'entreprise de destination suit le sélecteur global.
  const [scope, setScope] = React.useState(activeCompanyId);
  if (scope !== activeCompanyId) {
    setScope(activeCompanyId);
    if (!post && activeCompanyId) {
      setForm((prev) => ({ ...prev, companyId: activeCompanyId }));
    }
  }

  const company = companies.find((c) => c.id === form.companyId) ?? null;
  const pending = createPost.isPending || updatePost.isPending;

  // Plancher du champ de planification. Une valeur déjà enregistrée, même
  // passée, reste acceptée : on ne ferme la porte qu'aux saisies neuves, sinon
  // rouvrir un vieil article pour corriger une faute deviendrait impossible
  // sans toucher à sa date.
  // Planifier, c'est un brouillon portant une date à venir. L'état sert au
  // libellé du bouton comme au message de confirmation.
  const scheduling =
    form.status === "DRAFT" &&
    Boolean(form.publishedAt) &&
    isFutureServerDateTime(form.publishedAt);

  // L'aperçu doit montrer le fichier que l'admin vient de joindre, pas encore
  // envoyé au serveur, et qui prime donc sur l'URL déjà enregistrée.
  const coverPreviewUrl = useObjectUrl(coverFile);

  const initialPublishedAt = toDatetimeLocal(post?.publishedAt);
  const publishedAtMin =
    initialPublishedAt && initialPublishedAt < nowDatetimeLocal()
      ? initialPublishedAt
      : nowDatetimeLocal();
  const readingTime = estimateReadingTime(form.content);
  const contentLength = form.content.length;
  const overLimit = contentLength > MAX_CONTENT_LENGTH;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    // L'attribut `min` du champ guide le sélecteur mais n'empêche pas une
    // saisie au clavier ni un collage : le refus se décide donc ici.
    if (
      form.status === "DRAFT" &&
      form.publishedAt &&
      form.publishedAt !== initialPublishedAt &&
      isPastServerDateTime(form.publishedAt)
    ) {
      setErrors({
        publishedAt:
          "Cette date est déjà passée. Choisissez le moment présent ou une date à venir.",
      });
      toast.error("On ne peut pas planifier un article dans le passé.");
      return;
    }

    const parsed = postFormSchema.safeParse({
      title: form.title,
      content: form.content,
      excerpt: form.excerpt,
      status: form.status,
      companyId: form.companyId ?? undefined,
      coverImageUrl: form.coverImageUrl,
      // Publier, c'est mettre en ligne maintenant : le statut `PUBLISHED` part
      // toujours avec la date du jour. Un article déjà en ligne garde en
      // revanche sa date d'origine, sinon le rouvrir pour corriger une faute
      // réécrirait sa date de parution. Une date à venir n'appartient donc
      // qu'au brouillon, où elle vaut planification.
      publishedAt:
        form.status === "PUBLISHED"
          ? post?.status === "PUBLISHED" && post.publishedAt
            ? post.publishedAt
            : fromDatetimeLocal(nowDatetimeLocal())
          : fromDatetimeLocal(form.publishedAt),
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        next[key] = next[key] ?? issue.message;
      }
      setErrors(next);
      toast.error("Complétez les champs signalés avant d'enregistrer.");
      return;
    }

    setErrors({});

    try {
      const saved = post
        ? await updatePost.mutateAsync({
            id: post.id,
            ...parsed.data,
            coverImage: coverFile,
          })
        : await createPost.mutateAsync({
            ...parsed.data,
            coverImage: coverFile,
          });

      if (activeCompanyId && activeCompanyId !== parsed.data.companyId) {
        setActiveCompany(parsed.data.companyId);
      }
      toast.success(successToast(parsed.data.status, scheduling));

      // À la création, on renvoie vers la liste : l'article y est visible
      // immédiatement, ce qui vaut mieux que rester sur un formulaire vidé.
      if (!post) {
        router.push("/posts");
        return;
      }

      setCoverFile(null);
      // Le serveur peut renseigner lui-même la date de mise en ligne et l'URL
      // de couverture (téléversement) : on réaligne le formulaire dessus.
      setForm((prev) => ({
        ...prev,
        publishedAt: toDatetimeLocal(saved.publishedAt),
        coverImageUrl: saved.coverImageUrl ?? prev.coverImageUrl,
      }));
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "L'enregistrement a échoué."
      );
    }
  }

  async function handleDelete() {
    if (!post) return;
    try {
      await deletePost.mutateAsync(post.id);
      toast.success("Article supprimé");
      router.push("/posts");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "La suppression a échoué."
      );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Panneaux de réglages : mêmes sections, deux mises en page.              */
  /* ---------------------------------------------------------------------- */

  const publicationPanel = (idPrefix: string) => (
    <div className="space-y-4">
      <Field
        label="Entreprise"
        htmlFor={`${idPrefix}-company`}
        error={errors.companyId}
      >
        <Select
          value={form.companyId ? String(form.companyId) : ""}
          onValueChange={(value) => set("companyId", Number(value))}
        >
          <SelectTrigger id={`${idPrefix}-company`}>
            <SelectValue placeholder="Choisir une entreprise" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                <span className="flex items-center gap-2">
                  <CompanyLogo
                    company={option}
                    className="size-5 rounded-md text-[9px]"
                  />
                  {option.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* L'entreprise retenue est rappelée visuellement : on publie sur son blog. */}
      {company ? (
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-2 p-2.5">
          <CompanyLogo company={company} className="size-9 text-[11px]" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">{company.name}</p>
            <p className="truncate font-mono text-[11px] text-muted">
              {company.code}
            </p>
          </div>
        </div>
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
            <SelectItem value="DRAFT">{POST_STATUS_LABELS.DRAFT}</SelectItem>
            <SelectItem value="PUBLISHED">
              {POST_STATUS_LABELS.PUBLISHED}
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {form.status === "DRAFT" ? (
        <Field
          label="Planifier la mise en ligne"
          htmlFor={`${idPrefix}-published-at`}
          hint={form.publishedAt ? undefined : "facultatif"}
          error={errors.publishedAt}
        >
          <div className="flex gap-2">
            <Input
              id={`${idPrefix}-published-at`}
              type="datetime-local"
              min={publishedAtMin}
              value={form.publishedAt}
              onChange={(event) => set("publishedAt", event.target.value)}
            />
            {form.publishedAt ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() => set("publishedAt", "")}
                aria-label="Effacer la date de planification"
              >
                <X />
              </Button>
            ) : null}
          </div>
        </Field>
      ) : null}

      <div className="rounded-lg bg-surface-2 px-3 py-2.5">
        <p className="text-xs leading-relaxed text-muted">
          {form.status === "PUBLISHED"
            ? post?.status === "PUBLISHED" && post.publishedAt
              ? `En ligne depuis le ${formatDateTime(post.publishedAt)}. Enregistrer ne change pas cette date.`
              : "L'article part en ligne maintenant, à la date du jour."
            : form.publishedAt && isFutureServerDateTime(form.publishedAt)
              ? "Planifié : l'article reste un brouillon jusqu'à la date choisie ci-dessus."
              : "Le brouillon n'est visible que dans ce dashboard. Donnez-lui une date pour le planifier."}
        </p>
      </div>

      {post ? (
        <dl className="space-y-1.5 border-t border-border pt-3 text-xs">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Slug</dt>
            <dd className="truncate font-mono">{post.slug}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Identifiant</dt>
            <dd className="font-mono">#{post.id}</dd>
          </div>
        </dl>
      ) : (
        <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted">
          Le slug est généré par le serveur à partir du titre.
        </p>
      )}
    </div>
  );

  const coverPanel = (idPrefix: string) => (
    <div className="space-y-3">
      {coverFile || form.coverImageUrl ? (
        <ImagePreview
          file={coverFile}
          url={form.coverImageUrl || null}
          onRemove={() => {
            // Un fichier choisi prime sur l'URL : on le retire d'abord.
            if (coverFile) setCoverFile(null);
            else set("coverImageUrl", "");
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-strong bg-surface-2 text-muted transition-colors hover:border-accent hover:text-text"
        >
          <ImagePlus className="size-5" />
          <span className="text-[13px]">Choisir une image</span>
          <span className="text-[11px] text-muted">Format carré conseillé</span>
        </button>
      )}

      {/* Les sites affichent la couverture dans un cadre carré, sans rognage. */}
      <p className="text-[12px] leading-relaxed text-muted">
        Format conseillé : <strong className="font-medium text-text">carré (1:1)</strong>,
        par exemple 1200 × 1200 px. Une image d&apos;un autre format reste affichée
        en entier, avec des marges de chaque côté.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          setCoverFile(file);
          event.target.value = "";
        }}
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus />
          {coverFile ? "Changer de fichier" : "Téléverser un fichier"}
        </Button>
      </div>

      <Field label="ou adresse d'image" htmlFor={`${idPrefix}-cover-url`}>
        <Input
          id={`${idPrefix}-cover-url`}
          value={form.coverImageUrl}
          onChange={(event) => set("coverImageUrl", event.target.value)}
          placeholder="https://…"
          className="font-mono text-[13px]"
        />
      </Field>
    </div>
  );

  const sections = [
    { id: "publication", title: "Publication", render: publicationPanel },
    { id: "cover", title: "Image de couverture", render: coverPanel },
  ];

  return (
    <div className="space-y-5 pb-24 lg:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Retour aux articles"
          >
            <Link href="/posts">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {post ? "Modifier l'article" : "Nouvel article"}
            </h1>
            <p className="truncate font-mono text-[11px] text-muted">
              {company?.name ?? "Aucune entreprise"} · {readingTime} min de
              lecture
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
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye />
            Aperçu
          </Button>
          <Button onClick={save} disabled={pending}>
            {pending
              ? "Enregistrement…"
              : primaryLabel(form.status, scheduling)}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <Card>
            <CardContent>
              <Field label="Titre" htmlFor="title" error={errors.title}>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) => set("title", event.target.value)}
                  placeholder="Le titre de votre article"
                  className="h-11 text-base font-medium"
                />
              </Field>
            </CardContent>
          </Card>

          <div className="space-y-1.5">
            <RichTextEditor
              content={form.content}
              onChange={(html) => set("content", html)}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <p
                className={cn(
                  "font-mono text-[11px] tabular",
                  overLimit ? "text-danger" : "text-muted"
                )}
              >
                {contentLength} / {MAX_CONTENT_LENGTH} caractères
              </p>
              {overLimit ? (
                <p className="text-[11px] text-danger">
                  L&apos;API transmet l&apos;article dans l&apos;URL : au-delà de
                  cette limite, le serveur refuse la requête.
                </p>
              ) : null}
            </div>
            {errors.content ? (
              <p className="px-1 text-xs text-danger">{errors.content}</p>
            ) : null}
          </div>

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
          {pending ? "…" : primaryLabel(form.status, scheduling)}
        </Button>
      </div>

      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={form.title}
        excerpt={form.excerpt}
        content={form.content}
        coverImage={
          coverFile ? coverPreviewUrl ?? undefined : form.coverImageUrl || undefined
        }
        readingTime={readingTime}
        companyName={company?.name ?? "—"}
        status={form.status}
        publishedAt={form.publishedAt || undefined}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer cet article ?"
        description="L'article sera définitivement retiré du blog. Cette action est irréversible."
        onConfirm={handleDelete}
      />
    </div>
  );
}
