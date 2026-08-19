import * as React from "react";
import { PlugZap } from "lucide-react";
import { Card } from "./card";
import { PageHeader } from "./page-header";

/**
 * Écran des modules que l'API n'expose pas encore. On affiche l'état réel
 * plutôt que des données inventées : le backend `/v3/api-docs` ne déclare que
 * `auth`, `companies`, `posts` et `stats`.
 */
export function ModuleUnavailable({
  title,
  description,
  endpoints,
}: {
  title: string;
  description: string;
  endpoints: string[];
}) {
  return (
    <div className="space-y-5">
      <PageHeader title={title} description={description} />
      <Card>
        <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface-2">
            <PlugZap className="size-5 text-muted" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-text">
              Module non disponible côté API
            </p>
            <p className="mx-auto max-w-md text-[13px] leading-relaxed text-muted">
              L&apos;écran est prêt, mais le backend n&apos;expose aucun endpoint
              pour ce module. Il s&apos;activera dès que ces routes existeront.
            </p>
          </div>
          <ul className="flex flex-wrap justify-center gap-1.5">
            {endpoints.map((endpoint) => (
              <li
                key={endpoint}
                className="rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-[11px] text-muted"
              >
                {endpoint}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
