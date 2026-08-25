import type { ComponentType } from "react";
import {
  Building2,
  FileText,
  LayoutDashboard,
  Settings,
  User,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Correspondance exacte (sinon on teste le préfixe). */
  exact?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * Un seul rôle : la navigation est identique partout, sans condition. Elle ne
 * liste que ce que l'API sait faire, pas d'entrée qui mène nulle part.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Espace de travail",
    items: [
      { href: "/", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
      { href: "/posts", label: "Articles", icon: FileText },
      { href: "/companies", label: "Entreprises", icon: Building2 },
    ],
  },
  {
    label: "Compte",
    items: [
      { href: "/settings", label: "Paramètres", icon: Settings },
      { href: "/profile", label: "Profil", icon: User },
    ],
  },
];

export function isActivePath(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
