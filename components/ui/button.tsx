import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-neutral-700 to-neutral-900 border border-neutral-900 text-white shadow-[inset_0px_0px_1px_0px_rgba(255,255,255,0.80),0px_1px_1px_0px_rgba(0,0,0,0.25)] transition-all duration-300 ease-out hover:bg-gradient-to-b hover:from-neutral-800 hover:to-neutral-900 hover:shadow-[inset_0px_0px_1px_0px_rgba(0,0,0,1.0),0px_1px_1px_0px_rgba(0,0,0,0.0)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "bg-gradient-to-b from-neutral-50 to-neutral-100 border border-neutral-300 text-neutral-900 shadow-[inset_0px_0px_1px_1px_rgba(255,255,255,1.0)] transition-all duration-300 ease-out hover:bg-gradient-to-b hover:from-neutral-100 hover:to-neutral-100 hover:shadow-[inset_0px_0px_1px_0px_rgba(0,0,0,0)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
