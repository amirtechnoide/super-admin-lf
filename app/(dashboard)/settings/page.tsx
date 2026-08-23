"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Building2,
  CircleCheck,
  Eye,
  FileText,
  Monitor,
  Moon,
  PenSquare,
  Send,
  Sun,
} from "lucide-react";
import { useMounted } from "@/lib/hooks/use-mounted";
import { useStats } from "@/lib/queries/use-stats";
import { MAX_CONTENT_LENGTH } from "@/lib/api/schemas";
import { cn, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";

const THEMES = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Système", icon: Monitor },
];

/** Le mode d'emploi, écrit pour quelqu'un qui découvre l'outil. */
const STEPS = [
  {
    icon: Building2,
    title: "Choisir l'entreprise",
    body: "En haut de l'écran, le sélecteur indique sur quelle entreprise vous travaillez. Tout ce que vous voyez ensuite — articles, chiffres — ne concerne qu'elle. L'option « Toutes les entreprises » affiche l'ensemble.",
  },
  {
    icon: PenSquare,
    title: "Écrire un article",
    body: "Bouton « Nouvel article ». Donnez un titre, rédigez le texte, ajoutez si vous le souhaitez un court extrait et une image de couverture. L'adresse de l'article est générée automatiquement à partir du titre.",
  },
  {
    icon: Eye,
    title: "Vérifier avant de publier",
    body: "Le bouton « Aperçu » montre l'article tel qu'il apparaîtra sur le blog, avec son image, son titre et sa date. Rien n'est visible en ligne tant que vous n'avez pas publié.",
  },
  {
    icon: Send,
    title: "Enregistrer ou publier",
    body: "Dans le panneau « Publication », le statut « Brouillon » garde l'article pour vous seule ; « Publié » le met en ligne. Le bouton en bas change de nom selon votre choix, il dit toujours ce qu'il va faire.",
  },
  {
    icon: FileText,
    title: "Retrouver et modifier",
    body: "L'écran « Articles » liste tout. Basculez entre l'affichage en cartes et en tableau, filtrez par statut ou tapez quelques mots pour retrouver un article. Un clic dessus l'ouvre pour le modifier.",
  },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  // Une requête réelle sert de test de connexion au serveur.
  const stats = useStats();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Paramètres"
        description="L'apparence du tableau de bord et son mode d'emploi."
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Apparence</CardTitle>
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
              « Système » suit le réglage clair ou sombre de votre ordinateur.
              Ce choix ne concerne que votre écran, pas le blog en ligne.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3">
            <CardTitle>État du service</CardTitle>
            {stats.isPending ? (
              <Badge tone="neutral">Vérification…</Badge>
            ) : stats.isError ? (
              <Badge tone="danger">Hors service</Badge>
            ) : (
              <Badge tone="success">Connecté</Badge>
            )}
          </CardHeader>
          <CardContent>
            {stats.isError ? (
              <p className="text-[13px] leading-relaxed text-muted">
                Le serveur ne répond pas. Vos articles ne sont ni perdus ni
                modifiés : réessayez dans quelques minutes, et prévenez
                l&apos;équipe technique si cela persiste.
              </p>
            ) : (
              <>
                <dl className="divide-y divide-border text-[13px]">
                  <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0">
                    <dt className="text-muted">Entreprises</dt>
                    <dd className="font-mono tabular">
                      {stats.data?.totalCompanies ?? "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-muted">Articles publiés</dt>
                    <dd className="font-mono tabular">
                      {stats.data?.totalPublishedPosts ?? "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-2.5 last:pb-0">
                    <dt className="text-muted">Brouillons</dt>
                    <dd className="font-mono tabular">
                      {stats.data?.totalDraftPosts ?? "—"}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs leading-relaxed text-muted">
                  Vos modifications sont enregistrées sur le serveur dès que
                  vous cliquez sur le bouton d&apos;enregistrement.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comment utiliser le tableau de bord</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-5">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex gap-3.5">
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <p className="text-[13px] font-medium">
                      <span className="mr-1.5 font-mono text-muted">
                        {index + 1}.
                      </span>
                      {step.title}
                    </p>
                    <p className="text-[13px] leading-relaxed text-muted">
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 space-y-2 rounded-lg border border-border bg-surface-2 p-4">
            <p className="flex items-center gap-2 text-[13px] font-medium">
              <CircleCheck className="size-4 text-success" />
              Bon à savoir
            </p>
            <ul className="space-y-1.5 text-[13px] leading-relaxed text-muted">
              <li>
                {`Un article fait au maximum ${formatNumber(MAX_CONTENT_LENGTH)} caractères.`}{" "}
                Le compteur sous l&apos;éditeur vous prévient avant la limite.
              </li>
              <li>
                Une suppression est définitive : une fenêtre vous demande
                toujours confirmation avant.
              </li>
              <li>
                Pour changer votre mot de passe, allez dans{" "}
                <Link
                  href="/profile"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  Profil
                </Link>
                .
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
