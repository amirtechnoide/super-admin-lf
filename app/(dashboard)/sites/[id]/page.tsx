"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Globe, ImagePlus, Trash2 } from "lucide-react";
import { deleteSite, getSite, getSites, updateSite } from "@/lib/data";
import { useAsync } from "@/lib/hooks/use-async";
import { useAppStore } from "@/lib/store/app-store";
import type { Site } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccentPicker } from "@/components/sites/accent-picker";

const TIMEZONES = [
  "Africa/Douala",
  "Africa/Lagos",
  "Africa/Abidjan",
  "Europe/Paris",
  "Europe/London",
  "UTC",
];

export default function SiteConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const setSites = useAppStore((s) => s.setSites);
  const setActiveSite = useAppStore((s) => s.setActiveSite);
  const activeSiteId = useAppStore((s) => s.activeSiteId);

  const site = useAsync(() => getSite(id), [id]);
  const [form, setForm] = React.useState<Site | null>(null);
  const [pending, setPending] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  // Initialise le formulaire dès que le site est chargé (ou rechargé).
  const [loadedSite, setLoadedSite] = React.useState<Site | null>(null);
  if (site.data && site.data !== loadedSite) {
    setLoadedSite(site.data);
    setForm(site.data);
  }

  function set<K extends keyof Site>(key: K, value: Site[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!form) return;
    if (!form.name.trim() || !form.domain.trim()) {
      toast.error("Le nom et le domaine sont obligatoires.");
      return;
    }
    setPending(true);
    try {
      await updateSite(form.id, form);
      const refreshed = await getSites();
      setSites(refreshed);
      toast.success("Site mis à jour");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    await deleteSite(id);
    const refreshed = await getSites();
    setSites(refreshed);
    if (activeSiteId === id) setActiveSite(null);
    toast.success("Site supprimé");
    router.push("/sites");
  }

  if (site.loading || (site.data && !form)) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-[440px] w-full rounded-xl" />
      </div>
    );
  }

  if (!site.data || !form) {
    return (
      <Card>
        <EmptyState
          icon={Globe}
          title="Ce site n'existe plus"
          description="Il a peut-être été supprimé depuis un autre écran."
          action={
            <Button asChild>
              <Link href="/sites">Revenir aux sites</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Retour aux sites">
            <Link href="/sites">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {form.name}
            </h1>
            <p className="truncate font-mono text-[11px] text-muted">
              {form.domain} · {formatNumber(form.postsCount)} article
              {form.postsCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteOpen(true)}
            aria-label="Supprimer le site"
          >
            <Trash2 />
          </Button>
          <Button onClick={save} disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Identité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Nom du site" htmlFor="name">
              <Input
                id="name"
                value={form.name}
                onChange={(event) => set("name", event.target.value)}
              />
            </Field>

            <Field label="Domaine" htmlFor="domain">
              <Input
                id="domain"
                value={form.domain}
                onChange={(event) => set("domain", event.target.value)}
                className="font-mono text-[13px]"
              />
            </Field>

            <Field label="Logo" htmlFor="logo">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-12 shrink-0 items-center justify-center rounded-lg font-display text-sm font-semibold"
                  style={{
                    backgroundColor: `${form.accentColor}1f`,
                    color: form.accentColor,
                  }}
                >
                  {form.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Input
                    id="logo"
                    value={form.logoUrl ?? ""}
                    onChange={(event) =>
                      set("logoUrl", event.target.value || undefined)
                    }
                    placeholder="/media/logo.svg"
                    className="font-mono text-[13px]"
                  />
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <ImagePlus className="size-3.5" />
                    Upload simulé — collez une adresse de média.
                  </p>
                </div>
              </div>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apparence</CardTitle>
          </CardHeader>
          <CardContent>
            <AccentPicker
              value={form.accentColor}
              onChange={(color) => set("accentColor", color)}
            />
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Cette couleur teinte le dashboard lorsque ce site est actif :
              statuts, liens de navigation et focus clavier.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Langue du site" htmlFor="locale">
              <Select
                value={form.locale}
                onValueChange={(value) => set("locale", value as Site["locale"])}
              >
                <SelectTrigger id="locale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">Anglais</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Fuseau horaire" htmlFor="timezone">
              <Select
                value={form.timezone}
                onValueChange={(value) => set("timezone", value)}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>État</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Statut du site" htmlFor="status">
              <Select
                value={form.status}
                onValueChange={(value) => set("status", value as Site["status"])}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <p className="text-xs leading-relaxed text-muted">
              {form.status === "active"
                ? "Le blog est publié et accessible aux visiteurs."
                : "Le blog reste administrable ici, mais n'est plus servi aux visiteurs."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action d'enregistrement rappelée en bas sur mobile. */}
      <div className="sm:hidden">
        <Button className="w-full" size="lg" onClick={save} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer ce site ?"
        description={`Tous les articles, catégories, médias et commentaires de ${form.name} seront retirés du dashboard. Cette action est irréversible.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
