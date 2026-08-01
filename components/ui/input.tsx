"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-9 max-md:h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-sm text-text",
      "placeholder:text-muted transition-colors",
      "hover:border-border-strong",
      "disabled:cursor-not-allowed disabled:opacity-60",
      "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex w-full min-w-0 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text",
      "placeholder:text-muted transition-colors hover:border-border-strong",
      "disabled:cursor-not-allowed disabled:opacity-60 resize-y",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
