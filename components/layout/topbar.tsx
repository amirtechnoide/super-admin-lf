"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarDrawerContent } from "./sidebar";
import { CompanySwitcher } from "./company-switcher";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function Topbar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-5">
        {/* Burger : ouvre la sidebar en drawer sous md. */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Ouvrir la navigation"
          className="md:hidden flex size-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text"
        >
          <Menu className="size-5" />
        </button>

        <CompanySwitcher />

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <GlobalSearch />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" title="Navigation">
          <SidebarDrawerContent onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
