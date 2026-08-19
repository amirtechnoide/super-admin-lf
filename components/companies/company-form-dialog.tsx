"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import {
  companyFormSchema,
  type Company,
  type CompanyFormValues,
} from "@/lib/api/schemas";
import { ApiError } from "@/lib/api/errors";
import { useCreateCompany, useUpdateCompany } from "@/lib/queries/use-companies";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, Label } from "@/components/ui/label";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Création et édition d'entreprise — le logo part en multipart. */
export function CompanyFormDialog({
  open,
  onOpenChange,
  company,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company;
  onSaved?: (company: Company) => void;
}) {
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const [logo, setLogo] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: company?.name ?? "",
      code: company?.code ?? "",
      logoUrl: company?.logoUrl ?? "",
    },
  });

  // Rouvrir la modale doit repartir des valeurs à jour.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      form.reset({
        name: company?.name ?? "",
        code: company?.code ?? "",
        logoUrl: company?.logoUrl ?? "",
      });
      setLogo(null);
    }
  }

  const pending = createCompany.isPending || updateCompany.isPending;

  async function submit(values: CompanyFormValues) {
    try {
      const saved = company
        ? await updateCompany.mutateAsync({ id: company.id, ...values, logo })
        : await createCompany.mutateAsync({ ...values, logo });
      toast.success(company ? "Entreprise mise à jour" : "Entreprise ajoutée");
      onOpenChange(false);
      onSaved?.(saved);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "L'enregistrement a échoué."
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>
            {company ? "Modifier l'entreprise" : "Ajouter une entreprise"}
          </DialogTitle>
          <DialogDescription>
            {company
              ? "Le nom et le code identifient l'entreprise côté API."
              : "L'entreprise apparaîtra immédiatement dans le sélecteur."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(submit)}>
          <DialogBody className="space-y-4">
            <Field
              label="Nom"
              htmlFor="company-name"
              error={form.formState.errors.name?.message}
            >
              <Input
                id="company-name"
                placeholder="CAMCI"
                {...form.register("name")}
              />
            </Field>

            <Field
              label="Code"
              htmlFor="company-code"
              error={form.formState.errors.code?.message}
              hint="identifiant technique"
            >
              <Input
                id="company-code"
                placeholder="ENT_CAMCI"
                className="font-mono text-[13px]"
                {...form.register("code")}
              />
            </Field>

            <div className="space-y-2">
              <Label>Logo</Label>
              {logo ? (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
                  <ImagePlus className="size-4 shrink-0 text-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">
                      {logo.name}
                    </p>
                    <p className="font-mono text-[11px] text-muted">
                      {formatBytes(logo.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setLogo(null)}
                    aria-label="Retirer le logo"
                  >
                    <X />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus />
                  Téléverser un logo
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  setLogo(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
              />
            </div>

            <Field
              label="ou adresse du logo"
              htmlFor="company-logo-url"
              error={form.formState.errors.logoUrl?.message}
            >
              <Input
                id="company-logo-url"
                placeholder="https://…"
                className="font-mono text-[13px]"
                {...form.register("logoUrl")}
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
            <Button type="submit" disabled={pending}>
              {pending
                ? "Enregistrement…"
                : company
                  ? "Enregistrer"
                  : "Ajouter l'entreprise"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
