"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo";

export const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex size-8 shrink-0 overflow-hidden rounded-full border border-border bg-surface-2",
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

export const AvatarImage = AvatarPrimitive.Image;

export const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex size-full items-center justify-center text-[11px] font-medium text-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

/**
 * Avatar d'utilisateur.
 *
 * L'API n'expose aucune photo : plutôt que des initiales, on affiche la marque
 * LF COMPANY. Un seul compte se connecte à ce dashboard, il n'y a donc personne
 * à distinguer, et le logo tient mieux la pastille qu'une lettre isolée.
 */
export function UserAvatar({
  name,
  src,
  className,
}: {
  /** Conservé pour le texte alternatif, plus pour des initiales. */
  name: string;
  src?: string;
  className?: string;
}) {
  return (
    <Avatar className={cn("bg-surface", className)} title={name}>
      {src ? <AvatarImage src={src} alt="" /> : null}
      <AvatarFallback className="p-[18%]">
        <LogoMark size={48} className="size-full object-contain" />
      </AvatarFallback>
    </Avatar>
  );
}
