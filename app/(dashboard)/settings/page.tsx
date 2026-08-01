"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Monitor, Moon, Sun } from "lucide-react";
import { updateSite } from "@/lib/data";
import { useMounted } from "@/lib/hooks/use-mounted";
import { useActiveSite, useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { SettingRow, Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccentPicker } from "@/components/sites/accent-picker";

const THEMES = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Système", icon: Monitor },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const activeSite = useActiveSite();
  const setSites = useAppStore((s) => s.setSites);
  const sites = useAppStore((s) => s.sites);

  // Valeurs SEO par défaut — appliquées aux nouveaux articles.
  const [titleTemplate, setTitleTemplate] = React.useState(
    "%titre% — %site%"
  );
  const [defaultDescription, setDefaultDescription] = React.useState(
    "Actualités, guides et coulisses publiés par l'équipe éditoriale."
  );
  const [autoSlug, setAutoSlug] = React.useState(true);
  const [noindexDrafts, setNoindexDrafts] = React.useState(true);

  // Préférences générales du dashboard.
  const [density, setDensity] = React.useState(true);
  const [confirmDeletes, setConfirmDeletes] = React.useState(true);
  const [emailDigest, setEmailDigest] = React.useState(false);

  async function saveAccent(color: string) {
    if (!activeSite) return;
    await updateSite(activeSite.id, { accentColor: color });
    setSites(
      sites.map((s) =>
        s.id === activeSite.id ? { ...s, accentColor: color } : s
      )
    );
    toast.success("Couleur d'accent mise à jour");
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Paramètres"
        description="Réglages du dashboard et valeurs par défaut appliquées aux articles."
      />

      <Tabs defaultValue="seo">
        <TabsList className="sm:w-auto">
          <TabsTrigger value="seo" className="flex-1 sm:flex-none">
            SEO par défaut
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex-1 sm:flex-none">
            Thème
          </TabsTrigger>
          <TabsTrigger value="general" className="flex-1 sm:flex-none">
            Général
          </TabsTrigger>
        </TabsList>

        {/* SEO ------------------------------------------------------------ */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>Valeurs SEO par défaut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field
                label="Modèle de meta title"
                htmlFor="title-template"
                hint="%titre% et %site% sont remplacés"
              >
                <Input
                  id="title-template"
                  value={titleTemplate}
                  onChange={(event) => setTitleTemplate(event.target.value)}
                  className="font-mono text-[13px]"
                />
              </Field>

              <Field
                label="Meta description par défaut"
                htmlFor="default-description"
                hint={`${defaultDescription.length}/160`}
              >
                <Textarea
                  id="default-description"
                  rows={3}
                  value={defaultDescription}
                  onChange={(event) => setDefaultDescription(event.target.value)}
                />
              </Field>

              <div className="divide-y divide-border border-t border-border pt-1">
                <SettingRow
                  title="Générer le slug automatiquement"
                  description="Le slug se déduit du titre tant qu'il n'a pas été modifié à la main."
                  htmlFor="auto-slug"
                >
                  <Switch
                    id="auto-slug"
                    checked={autoSlug}
                    onCheckedChange={setAutoSlug}
                  />
                </SettingRow>
                <SettingRow
                  title="Exclure les brouillons de l'indexation"
                  description="Ajoute une balise noindex tant que l'article n'est pas publié."
                  htmlFor="noindex"
                >
                  <Switch
                    id="noindex"
                    checked={noindexDrafts}
                    onCheckedChange={setNoindexDrafts}
                  />
                </SettingRow>
              </div>

              <div className="flex justify-end pt-1">
                <Button onClick={() => toast.success("Réglages SEO enregistrés")}>
                  Enregistrer les réglages
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Thème ---------------------------------------------------------- */}
        <TabsContent value="theme">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Thème du dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {THEMES.map((option) => {
                    const Icon = option.icon;
                    const active = mounted && theme === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTheme(option.value)}
                        aria-pressed={active}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors",
                          active
                            ? "border-accent bg-accent-softer text-accent"
                            : "border-border text-muted hover:border-border-strong hover:text-text"
                        )}
                      >
                        <Icon className="size-4" />
                        <span className="text-[13px] font-medium">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted">
                  Le chrome du dashboard reste neutre : seule la couleur
                  d&apos;accent change selon le site sur lequel vous travaillez.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Accent {activeSite ? `— ${activeSite.name}` : ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeSite ? (
                  <AccentPicker
                    value={activeSite.accentColor}
                    onChange={saveAccent}
                  />
                ) : (
                  <p className="text-[13px] leading-relaxed text-muted">
                    L&apos;accent appartient à un site. Sélectionnez un site dans
                    le switcher pour modifier sa couleur.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Général -------------------------------------------------------- */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Préférences générales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <SettingRow
                  title="Affichage dense des tables"
                  description="Réduit la hauteur des lignes pour afficher plus d'articles à l'écran."
                  htmlFor="density"
                >
                  <Switch
                    id="density"
                    checked={density}
                    onCheckedChange={setDensity}
                  />
                </SettingRow>
                <SettingRow
                  title="Confirmer avant suppression"
                  description="Une modale de confirmation s'affiche avant toute suppression."
                  htmlFor="confirm-deletes"
                >
                  <Switch
                    id="confirm-deletes"
                    checked={confirmDeletes}
                    onCheckedChange={setConfirmDeletes}
                  />
                </SettingRow>
                <SettingRow
                  title="Résumé hebdomadaire par e-mail"
                  description="Un récapitulatif des publications et commentaires, chaque lundi."
                  htmlFor="digest"
                >
                  <Switch
                    id="digest"
                    checked={emailDigest}
                    onCheckedChange={setEmailDigest}
                  />
                </SettingRow>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => toast.success("Préférences enregistrées")}>
                  Enregistrer les préférences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
