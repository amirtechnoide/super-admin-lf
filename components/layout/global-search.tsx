"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Building2, FileText, Search } from "lucide-react";
import { usePosts } from "@/lib/queries/use-posts";
import { useCompanies } from "@/lib/queries/use-companies";
import { useAppStore } from "@/lib/store/app-store";
import { POST_STATUS_LABELS } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NAV_SECTIONS } from "./nav-items";
import { CompanyDot } from "./company-switcher";

const itemClass = cn(
  "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm text-text outline-none",
  "data-[selected=true]:bg-surface-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted"
);

const groupClass =
  "[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-muted";

/**
 * Recherche globale ⌘K. L'API n'expose pas de recherche plein texte, mais
 * `GET /posts` renvoie tout le périmètre : cmdk filtre donc l'ensemble.
 */
export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const activeCompanyId = useAppStore((s) => s.activeCompanyId);
  const setActiveCompany = useAppStore((s) => s.setActiveCompany);
  const { data: companies = [] } = useCompanies();
  const { data: posts = [] } = usePosts({ companyId: activeCompanyId });

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden lg:flex h-9 w-64 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-[13px] text-muted transition-colors hover:border-border-strong"
      >
        <Search className="size-3.5 shrink-0" />
        <span>Rechercher…</span>
        <kbd className="ml-auto rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Rechercher"
        className="lg:hidden flex size-9 max-md:size-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text"
      >
        <Search className="size-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          size="md"
          className="p-0 sm:top-[18%] sm:translate-y-0"
          aria-describedby={undefined}
        >
          <Command
            label="Recherche globale"
            className="flex max-h-[70dvh] flex-col overflow-hidden"
          >
            <div className="flex shrink-0 items-center gap-2.5 border-b border-border px-4 pr-12">
              <Search className="size-4 shrink-0 text-muted" />
              <Command.Input
                placeholder="Rechercher un article, une entreprise, une page…"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>

            <Command.List className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-1.5">
              <Command.Empty className="px-3 py-10 text-center text-[13px] text-muted">
                Aucun résultat. Essayez un autre terme.
              </Command.Empty>

              <Command.Group heading="Articles" className={groupClass}>
                {posts.map((post) => (
                  <Command.Item
                    key={post.id}
                    value={`${post.title} ${post.slug} ${post.company?.name ?? ""}`}
                    onSelect={() =>
                      go(() => router.push(`/posts/${post.id}/edit`))
                    }
                    className={itemClass}
                  >
                    <FileText />
                    <span className="min-w-0 flex-1 truncate">{post.title}</span>
                    <span className="shrink-0 text-xs text-muted">
                      {POST_STATUS_LABELS[post.status]}
                    </span>
                    {!activeCompanyId && post.company ? (
                      <CompanyDot company={post.company} />
                    ) : null}
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Entreprises" className={groupClass}>
                {companies.map((company) => (
                  <Command.Item
                    key={company.id}
                    value={`entreprise ${company.name} ${company.code}`}
                    onSelect={() =>
                      go(() => {
                        setActiveCompany(company.id);
                        router.push(`/companies/${company.id}`);
                      })
                    }
                    className={itemClass}
                  >
                    <Building2 />
                    <span className="min-w-0 flex-1 truncate">
                      {company.name}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {company.code}
                    </span>
                    <CompanyDot company={company} />
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Navigation" className={groupClass}>
                {NAV_SECTIONS.flatMap((section) => section.items).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Command.Item
                      key={item.href}
                      value={`aller ${item.label}`}
                      onSelect={() => go(() => router.push(item.href))}
                      className={itemClass}
                    >
                      <Icon />
                      <span className="flex-1 truncate">{item.label}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
