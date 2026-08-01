"use client";

import * as React from "react";
import { toast } from "sonner";
import { updateAdmin } from "@/lib/data";
import { useAppStore } from "@/lib/store/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { UserAvatar } from "@/components/ui/avatar";
import { SettingRow, Switch } from "@/components/ui/switch";

export default function ProfilePage() {
  const admin = useAppStore((s) => s.admin);
  const setAdmin = useAppStore((s) => s.setAdmin);

  const [name, setName] = React.useState(admin.name);
  const [email, setEmail] = React.useState(admin.email);
  const [avatarUrl, setAvatarUrl] = React.useState(admin.avatarUrl ?? "");
  const [pending, setPending] = React.useState(false);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [compactSidebar, setCompactSidebar] = React.useState(false);
  const [keyboardShortcuts, setKeyboardShortcuts] = React.useState(true);

  async function saveProfile() {
    if (!name.trim() || !email.trim()) {
      toast.error("Le nom et l'adresse e-mail sont obligatoires.");
      return;
    }
    setPending(true);
    try {
      const updated = await updateAdmin({
        name: name.trim(),
        email: email.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });
      setAdmin(updated);
      toast.success("Profil mis à jour");
    } finally {
      setPending(false);
    }
  }

  function changePassword() {
    if (!currentPassword || !newPassword) {
      toast.error("Renseignez le mot de passe actuel et le nouveau.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Mot de passe modifié");
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Profil"
        description="Vos informations d'administrateur du dashboard."
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3.5">
              <UserAvatar name={name || "?"} src={avatarUrl} className="size-14" />
              <div className="min-w-0 flex-1">
                <Input
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="/media/avatar.jpg"
                  className="font-mono text-[13px]"
                  aria-label="Adresse de l'avatar"
                />
                <p className="mt-1.5 text-xs text-muted">
                  Collez une adresse d&apos;image, ou laissez vide pour les
                  initiales.
                </p>
              </div>
            </div>

            <Field label="Nom" htmlFor="name">
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>

            <Field label="Adresse e-mail" htmlFor="email">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="font-mono text-[13px]"
              />
            </Field>

            <div className="flex justify-end">
              <Button onClick={saveProfile} disabled={pending}>
                {pending ? "Enregistrement…" : "Enregistrer le profil"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Mot de passe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Mot de passe actuel" htmlFor="current-password">
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </Field>
              <Field label="Nouveau mot de passe" htmlFor="new-password">
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </Field>
              <Field label="Confirmer le nouveau" htmlFor="confirm-password">
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </Field>
              <div className="flex justify-end">
                <Button variant="outline" onClick={changePassword}>
                  Modifier le mot de passe
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Préférences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                <SettingRow
                  title="Sidebar compacte"
                  description="Réduit la navigation aux icônes sur les grands écrans."
                  htmlFor="compact-sidebar"
                >
                  <Switch
                    id="compact-sidebar"
                    checked={compactSidebar}
                    onCheckedChange={setCompactSidebar}
                  />
                </SettingRow>
                <SettingRow
                  title="Raccourcis clavier"
                  description="Active ⌘K pour la recherche globale."
                  htmlFor="shortcuts"
                >
                  <Switch
                    id="shortcuts"
                    checked={keyboardShortcuts}
                    onCheckedChange={setKeyboardShortcuts}
                  />
                </SettingRow>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
