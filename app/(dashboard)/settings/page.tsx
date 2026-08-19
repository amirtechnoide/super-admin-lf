"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useMounted } from "@/lib/hooks/use-mounted";
import { useStats } from "@/lib/queries/use-stats";
import { API_BASE_URL } from "@/lib/api/client";
import { MAX_CONTENT_LENGTH } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";

const THEMES = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Système", icon: Monitor },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  // Une requête réelle sert de test de connexion au backend.
  const stats = useStats();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Paramètres"
        description="Préférences d'affichage et état de la connexion à l'API."
      />

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
              Le chrome du dashboard reste neutre : seule la couleur d&apos;accent
              change selon l&apos;entreprise sur laquelle vous travaillez.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3">
            <CardTitle>Connexion à l&apos;API</CardTitle>
            {stats.isPending ? (
              <Badge tone="neutral">Vérification…</Badge>
            ) : stats.isError ? (
              <Badge tone="danger">Injoignable</Badge>
            ) : (
              <Badge tone="success">Connecté</Badge>
            )}
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-border text-[13px]">
              <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0">
                <dt className="shrink-0 text-muted">URL de base</dt>
                <dd className="min-w-0 truncate font-mono text-xs">
                  {API_BASE_URL || "non configurée"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-muted">Entreprises</dt>
                <dd className="font-mono text-xs tabular">
                  {stats.data?.totalCompanies ?? "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5 last:pb-0">
                <dt className="shrink-0 text-muted">Articles</dt>
                <dd className="font-mono text-xs tabular">
                  {stats.data?.totalPosts ?? "—"}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Modifiez <span className="font-mono">NEXT_PUBLIC_API_BASE_URL</span>{" "}
              dans <span className="font-mono">.env.local</span> pour pointer vers
              un autre environnement.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Limites connues du backend</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5 text-[13px] leading-relaxed text-muted">
            <li>
              <span className="font-medium text-text">
                Contenu limité à {MAX_CONTENT_LENGTH} caractères.
              </span>{" "}
              L&apos;API reçoit le corps de l&apos;article en paramètre
              d&apos;URL ; au-delà de ~8 Ko d&apos;URL, le serveur répond 400.
              Déplacer ces champs dans le corps de la requête lèverait la limite.
            </li>
            <li>
              <span className="font-medium text-text">
                Deux statuts seulement :
              </span>{" "}
              brouillon et publié. Ni planification, ni archivage.
            </li>
            <li>
              <span className="font-medium text-text">
                Statistiques globales.
              </span>{" "}
              <span className="font-mono">/stats</span> n&apos;accepte pas de
              filtre par entreprise.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
