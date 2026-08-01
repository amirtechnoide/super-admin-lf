import type { ComponentType } from "react";
import {
  FileText,
  FolderTree,
  Globe,
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
      { href: "/sites", label: "Sites", icon: Globe },
    ],
  },
  {
    label: "Contenu",
    items: [
      { href: "/posts", label: "Articles", icon: FileText },
      { href: "/categories", label: "Catégories & tags", icon: FolderTree },
      { href: "/media", label: "Médias", icon: Image },
      { href: "/comments", label: "Commentaires", icon: MessageSquare },
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
