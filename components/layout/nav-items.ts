import type { ComponentType } from "react";
import {
  Building2,
  FileText,
  FolderTree,
  Image,
  LayoutDashboard,
  MessageSquare,
  Settings,
  User,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Correspondance exacte (sinon on teste le préfixe). */
  exact?: boolean;
  /** Module sans endpoint côté API — signalé dans la navigation. */
  planned?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/** Un seul rôle : la navigation est identique partout, sans condition. */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Pilotage",
    items: [
      { href: "/", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
      { href: "/companies", label: "Entreprises", icon: Building2 },
    ],
  },
  {
    label: "Contenu",
    items: [
      { href: "/posts", label: "Articles", icon: FileText },
      {
        href: "/categories",
        label: "Catégories & tags",
        icon: FolderTree,
        planned: true,
      },
      { href: "/media", label: "Médias", icon: Image, planned: true },
      {
        href: "/comments",
        label: "Commentaires",
        icon: MessageSquare,
        planned: true,
      },
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
