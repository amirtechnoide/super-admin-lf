"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { resetPassword } from "@/lib/api/auth";
import {
  resetPasswordRequestSchema,
  type ResetPasswordFormValues,
} from "@/lib/api/schemas";
import { ApiError } from "@/lib/api/errors";
import { useAuthStore } from "@/lib/auth/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { UserAvatar } from "@/components/ui/avatar";

export default function ProfilePage() {
  const email = useAuthStore((s) => s.email);
  const displayName = email?.split("@")[0] ?? "Admin";

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: {
      email: email ?? "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      resetPassword({ email: values.email, newPassword: values.newPassword }),
    onSuccess: () => {
      toast.success("Mot de passe modifié");
      form.reset({ email: email ?? "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError ? error.message : "La modification a échoué."
      ),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Profil"
        description="Compte administrateur utilisé pour accéder à l'API."
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3.5">
              <UserAvatar name={displayName} className="size-14" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="truncate font-mono text-xs text-muted">
                  {email ?? "—"}
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted">
              Ces informations proviennent du jeton d&apos;authentification.
              L&apos;API n&apos;expose ni nom d&apos;affichage ni avatar : seul
              le mot de passe est modifiable ci-contre.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mot de passe</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              className="space-y-4"
              noValidate
            >
              <Field
                label="Adresse e-mail du compte"
                htmlFor="profile-email"
                error={form.formState.errors.email?.message}
              >
                <Input
                  id="profile-email"
                  type="email"
                  className="font-mono text-[13px]"
                  {...form.register("email")}
                />
              </Field>

              <Field
                label="Nouveau mot de passe"
                htmlFor="profile-new-password"
                error={form.formState.errors.newPassword?.message}
              >
                <Input
                  id="profile-new-password"
                  type="password"
                  autoComplete="new-password"
                  {...form.register("newPassword")}
                />
              </Field>

              <Field
                label="Confirmer le nouveau"
                htmlFor="profile-confirm-password"
                error={form.formState.errors.confirmPassword?.message}
              >
                <Input
                  id="profile-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  {...form.register("confirmPassword")}
                />
              </Field>

              <div className="flex justify-end">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending
                    ? "Modification…"
                    : "Modifier le mot de passe"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
