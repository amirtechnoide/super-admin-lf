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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ResetPasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: { email: "", newPassword: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      resetPassword({ email: values.email, newPassword: values.newPassword }),
    onSuccess: () => {
      toast.success("Mot de passe modifié", {
        description: "Connectez-vous avec votre nouveau mot de passe.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError ? error.message : "La modification a échoué."
      ),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          <DialogDescription>
            Saisissez votre adresse et le nouveau mot de passe souhaité.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
          <DialogBody className="space-y-4">
            <Field
              label="Adresse e-mail"
              htmlFor="reset-email"
              error={form.formState.errors.email?.message}
            >
              <Input id="reset-email" type="email" {...form.register("email")} />
            </Field>
            <Field
              label="Nouveau mot de passe"
              htmlFor="reset-password"
              error={form.formState.errors.newPassword?.message}
            >
              <Input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                {...form.register("newPassword")}
              />
            </Field>
            <Field
              label="Confirmer le mot de passe"
              htmlFor="reset-confirm"
              error={form.formState.errors.confirmPassword?.message}
            >
              <Input
                id="reset-confirm"
                type="password"
                autoComplete="new-password"
                {...form.register("confirmPassword")}
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Spinner />
                  Modification…
                </>
              ) : (
                "Modifier le mot de passe"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
