"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowUpRight, Globe, Plus } from "lucide-react";
import { createSite, getSites } from "@/lib/data";
import { useAsync } from "@/lib/hooks/use-async";
import { useAppStore } from "@/lib/store/app-store";
import { formatNumber, slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { SiteStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CardSkeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccentPicker } from "@/components/sites/accent-picker";

export default function SitesPage() {
  const router = useRouter();
  const setSites = useAppStore((s) => s.setSites);
  const setActiveSite = useAppStore((s) => s.setActiveSite);

  const sites = useAsync(() => getSites(), []);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [domain, setDomain] = React.useState("");
  const [accent, setAccent] = React.useState("#2563EB");
  const [pending, setPending] = React.useState(false);

  async function handleCreate() {
    if (!name.trim() || !domain.trim()) {
      toast.error("Renseignez le nom et le domaine du site.");
      return;
    }
    setPending(true);
    try {
      const site = await createSite({
        name: name.trim(),
        domain: domain.trim(),
        accentColor: accent,
        locale: "fr",
        timezone: "Africa/Douala",
        status: "active",
      });
      toast.success("Site ajouté");
      setCreateOpen(false);
      setName("");
      setDomain("");
      const refreshed = await getSites();
      setSites(refreshed);
      sites.reload();
      setActiveSite(site.id);
      router.push(`/sites/${site.id}`);
    } finally {
      setPending(false);
    }
  }

  const items = sites.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sites"
        description="Les blogs que vous administrez depuis ce dashboard."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Ajouter un site
          </Button>
        }
      />

      {sites.loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <CardSkeleton key={index} className="h-[164px]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Globe}
            title="Aucun site enregistré"
            description="Ajoutez un premier site pour commencer à gérer son blog."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus />
                Ajouter un site
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((site) => (
            <li key={site.id}>
              <Link
                href={`/sites/${site.id}`}
                onClick={() => setActiveSite(site.id)}
                className="group flex h-full flex-col rounded-xl border border-border bg-surface p-4 shadow-xs transition-colors hover:border-border-strong sm:p-5"
              >
                <div className="flex items-start gap-3">
                  {/* Le logo tient dans une pastille teintée par le site. */}
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg font-display text-sm font-semibold"
                    style={{
                      backgroundColor: `${site.accentColor}1f`,
                      color: site.accentColor,
                    }}
                  >
                    {site.name.slice(0, 2).toUpperCase()}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{site.name}</p>
                    <p className="truncate font-mono text-[11px] text-muted">
                      {site.domain}
                    </p>
                  </div>

                  <ArrowUpRight className="size-4 shrink-0 text-muted transition-colors group-hover:text-text" />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <SiteStatusBadge status={site.status} />
                  <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted tabular">
                    {formatNumber(site.postsCount)} article
                    {site.postsCount > 1 ? "s" : ""}
                  </span>
                  <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] uppercase text-muted">
                    {site.locale}
                  </span>
                  <span
                    aria-hidden
                    className="ml-auto size-4 rounded-full border border-border"
                    style={{ backgroundColor: site.accentColor }}
                    title={site.accentColor}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Ajouter un site</DialogTitle>
            <DialogDescription>
              Le site apparaîtra immédiatement dans le sélecteur.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <Field label="Nom du site" htmlFor="site-name">
              <Input
                id="site-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (!domain) return;
                }}
                placeholder="Nouveau Client"
              />
            </Field>
            <Field
              label="Domaine"
              htmlFor="site-domain"
              hint={name ? `${slugify(name)}.com` : undefined}
            >
              <Input
                id="site-domain"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                placeholder="exemple.com"
                className="font-mono text-[13px]"
              />
            </Field>
            <AccentPicker value={accent} onChange={setAccent} />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={pending}>
              {pending ? "Ajout…" : "Ajouter le site"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
