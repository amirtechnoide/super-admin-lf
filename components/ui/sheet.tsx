"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Drawer latéral, utilisé pour la sidebar sur mobile. */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "left" | "right" | "bottom";
    title: string;
  }
>(({ className, children, side = "left", title, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
      )}
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 flex flex-col bg-surface shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-200",
        side === "left" &&
          "inset-y-0 left-0 w-[86vw] max-w-[300px] border-r border-border data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
        side === "right" &&
          "inset-y-0 right-0 w-[86vw] max-w-[340px] border-l border-border data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
        side === "bottom" &&
          "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl border-t border-border data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
        className
      )}
      {...props}
    >
      <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
      <DialogPrimitive.Description className="sr-only">
        {title}
      </DialogPrimitive.Description>
      {children}
      <DialogPrimitive.Close
        className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text"
        aria-label="Fermer"
      >
        <X className="size-4" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";
