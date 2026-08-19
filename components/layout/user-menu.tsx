"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Settings, User } from "lucide-react";
import { useAuthStore } from "@/lib/auth/auth-store";
import { UserAvatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const email = useAuthStore((s) => s.email);
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();
  const router = useRouter();

  function signOut() {
    clearSession();
    // Le cache contient des données d'un compte : il ne doit rien en rester.
    queryClient.clear();
    router.replace("/login");
  }

  const displayName = email?.split("@")[0] ?? "Admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex size-9 max-md:size-10 items-center justify-center rounded-lg transition-colors hover:bg-surface-2"
          aria-label="Menu utilisateur"
        >
          <UserAvatar name={displayName} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[13rem]">
        <div className="px-2.5 py-2">
          <p className="truncate text-[13px] font-medium text-text">
            {displayName}
          </p>
          <p className="truncate font-mono text-xs text-muted">
            {email ?? "—"}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User />
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Paramètres
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}>
          <LogOut />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
