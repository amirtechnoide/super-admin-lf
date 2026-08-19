"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap select-none" +
    " transition-[transform,background-color,border-color,color,box-shadow] duration-150" +
    " active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50" +
    " [&_svg]:shrink-0 [&_svg]:size-4",
  {
    variants: {
      variant: {
        // Couleur d'accent = celle du site actif.
        default:
          "bg-accent text-accent-contrast hover:brightness-110 active:brightness-95 shadow-xs",
        secondary:
          "bg-surface-2 text-text hover:bg-surface-3 border border-border",
        outline: "border border-border bg-surface text-text hover:bg-surface-2",
        ghost: "text-muted hover:bg-surface-2 hover:text-text",
        subtle: "bg-accent-soft text-accent hover:brightness-105",
        danger: "bg-danger text-white hover:brightness-110 shadow-xs",
        link: "text-accent underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-8 max-md:h-9 px-2.5 text-[13px]",
        md: "h-9 max-md:h-11 px-3.5 text-sm",
        lg: "h-10 max-md:h-12 px-5 text-sm",
        icon: "h-9 w-9 max-md:h-11 max-md:w-11",
        "icon-sm": "h-8 w-8 max-md:h-9 max-md:w-9",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
