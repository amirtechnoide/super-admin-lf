"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Building2, FileText, Pencil, Trash2 } from "lucide-react";
import { useCompanies, useDeleteCompany } from "@/lib/queries/use-companies";
import { usePosts } from "@/lib/queries/use-posts";
import { useStats } from "@/lib/queries/use-stats";
import { useAppStore } from "@/lib/store/app-store";
import { ApiError } from "@/lib/api/errors";
import { accentForCompany, hasBrandAccent } from "@/lib/theme/company-accent";
import { formatDate, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/ui/query-state";
import { CompanyFormDialog } from "@/components/companies/company-form-dialog";
import { CompanyLogo } from "@/components/layout/company-switcher";

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const companyId = Number(id);
  const router = useRouter();

  const companies = useCompanies();
  const stats = useStats();
  const deleteCompany = useDeleteCompany();
  const activeCompanyId = useAppStore((s) => s.activeCompanyId);
  const setActiveCompany = useAppStore((s) => s.setActiveCompany);

  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const company = companies.data?.find((c: any) => c.id === companyId) ?? null;

  const posts = usePosts({
    companyId: Number.isFinite(companyId) ? companyId : null,
  });
  // L'API renvoie tout : on n'affiche ici que les cinq derniers.
  const latestPosts = (posts.data ?? []).slice(0, 5);

  const postCount =
    stats.data?.postsPerCompany.find((r: any) => r.companyName === company?.name)
      ?.postCount ?? 0;

  async function handleDelete() {
    try {
      await deleteCompany.mutateAsync(companyId);
      if (activeCompanyId === companyId) setActiveCompany(null);
      toast.success("Entreprise supprimée");
      router.push("/companies");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "La suppression a échoué."
      );
    }
  }

  if (companies.isError) {
    return (
      <Card>
        <QueryError
          error={companies.error}
          onRetry={() => companies.refetch()}
        />
      </Card>
    );
  }

  if (companies.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-[320px] w-full rounded-xl" />
      </div>
    );
  }

  if (!company) {
    return (
      <Card>
        <EmptyState
          icon={Building2}
          title="Cette entreprise n'existe plus"
          description="Elle a peut-être été supprimée depuis un autre écran."
          action={
            <Button asChild>
              <Link href="/companies">Revenir aux entreprises</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  const accent = accentForCompany(company);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Retour aux entreprises"
          >
            <Link href="/companies">
              <ArrowLeft />
            </Link>
          </Button>
          <CompanyLogo company={company} className="size-10" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {company.name}
            </h1>
            <p className="truncate font-mono text-[11px] text-muted">
              {company.code} · {formatNumber(postCount)} article
              {postCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteOpen(true)}
            aria-label="Supprimer l'entreprise"
          >
            <Trash2 />
          </Button>
          <Button onClick={() => setEditOpen(true)}>
            <Pencil />
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Identité</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border text-[13px]">
              <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0">
                <dt className="text-muted">Nom</dt>
                <dd className="truncate font-medium">{company.name}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-muted">Code</dt>
                <dd className="truncate font-mono">{company.code}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-muted">Identifiant</dt>
                <dd className="font-mono">#{company.id}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5 last:pb-0">
                <dt className="text-muted">Logo</dt>
                <dd className="min-w-0 truncate font-mono text-xs">
                  {company.logoUrl ? (
                    <a
                      href={company.logoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      Ouvrir
                    </a>
                  ) : (
                    <span className="text-muted">aucun</span>
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apparence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex h-8 items-center rounded-lg px-3 text-[13px] font-medium"
                style={{ backgroundColor: accent, color: "#fff" }}
              >
                Publier
              </span>
              <span
                className="inline-flex h-8 items-center rounded-lg px-3 text-[13px] font-medium"
                style={{ backgroundColor: `${accent}1f`, color: accent }}
              >
                Publié
              </span>
              <span className="font-mono text-xs uppercase text-muted">
                {accent}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted">
              {hasBrandAccent(company)
                ? "L'API ne stocke pas de couleur : c'est la couleur de marque associée au code de l'entreprise. Elle teinte le dashboard quand cette entreprise est active."
                : "L'API ne stocke pas de couleur : cet accent est dérivé du code de l'entreprise, donc identique sur tous les postes. Il teinte le dashboard quand cette entreprise est active."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle>Derniers articles</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link
              href="/posts"
              onClick={() => setActiveCompany(company.id)}
            >
              Tout voir
            </Link>
          </Button>
        </CardHeader>

        {posts.isPending ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2 px-4 py-3.5 sm:px-5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : posts.isError ? (
          <QueryError error={posts.error} onRetry={() => posts.refetch()} />
        ) : latestPosts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucun article pour cette entreprise"
            description="Créez le premier article depuis l'écran Articles."
          />
        ) : (
          <ul className="divide-y divide-border">
            {latestPosts.map((post: any) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{post.title}</p>
                    <p className="truncate font-mono text-[11px] text-muted">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                  <PostStatusBadge status={post.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <CompanyFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        company={company}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer cette entreprise ?"
        description={`« ${company.name} » et ses articles ne seront plus administrables ici. Cette action est irréversible.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
