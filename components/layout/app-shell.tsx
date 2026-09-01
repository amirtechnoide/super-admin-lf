import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/** Sidebar fixe (desktop) + topbar collante + zone de contenu. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh md:pl-62">
      <Sidebar />
      <div className="flex min-h-dvh min-w-0 flex-col">
        <Topbar />
        <main className="min-w-0 flex-1 px-3 py-5 sm:px-5 sm:py-6 lg:px-7">
          <div className="mx-auto w-full min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
