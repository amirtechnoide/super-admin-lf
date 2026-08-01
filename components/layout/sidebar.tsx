"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveSite, useAppStore } from "@/lib/store/app-store";
import { Button } from "@/components/ui/button";
import { isActivePath, NAV_SECTIONS } from "./nav-items";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="mb-5 last:mb-0">
          <p className="px-2.5 pb-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
            {section.label}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActivePath(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 max-md:py-3 text-[13px] font-medium transition-colors duration-150",
                      active
                        ? // La section active prend la couleur du site actif.
                          "bg-accent-soft text-accent"
                        : "text-muted hover:bg-surface-2 hover:text-text"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        active ? "text-accent" : "text-muted"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter() {
  const activeSite = useActiveSite();
  const activeSiteId = useAppStore((s) => s.activeSiteId);

  return (
    <div className="border-t border-border p-3">
      <Button asChild className="w-full" size="md">
        <Link href="/posts/new">
          <PenSquare />
          Nouvel article
        </Link>
      </Button>
      <p className="mt-2.5 px-1 text-[11px] leading-relaxed text-muted">
        {activeSiteId ? (
          <>
            Écriture sur{" "}
            <span className="font-medium text-text">
              {activeSite?.name ?? "…"}
            </span>
          </>
        ) : (
          "Choisissez un site pour écrire"
        )}
      </p>
    </div>
  );
}

function Wordmark() {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2.5 px-4">
      {/* Chrome neutre et sans marque : un simple repère, pas un logo client. */}
      <span
        aria-hidden
        className="flex size-6 items-center justify-center rounded-md bg-text text-[10px] font-semibold text-bg"
      >
        LF
      </span>
      <span className="font-display text-[13px] font-semibold tracking-tight">
        Studio Blog
      </span>
    </div>
  );
}

/** Sidebar fixe — desktop uniquement (le drawer mobile réutilise le contenu). */
export function Sidebar() {
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-[248px] flex-col border-r border-border bg-surface">
      <Wordmark />
      <SidebarNav />
      <SidebarFooter />
    </aside>
  );
}

/** Contenu de la sidebar réutilisé dans le drawer mobile. */
export function SidebarDrawerContent({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <Wordmark />
      <SidebarNav onNavigate={onNavigate} />
      <div onClick={onNavigate}>
        <SidebarFooter />
      </div>
    </>
  );
}
