"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

// A wrapping group of standalone pills - grows to any number of items,
// spilling onto new rows instead of squeezing into fixed columns.
const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex flex-wrap gap-1.5", className)}
    {...props}
  />
));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      // Resting pills sit raised on a soft shadow; the active pill reads as
      // physically pressed - inset shadow, firmer border, no elevation
      "flex h-8 items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-sm text-neutral-600 shadow-[0px_1px_2px_rgba(0,0,0,0.06),0px_2px_4px_rgba(0,0,0,0.05)] outline-none transition-[box-shadow,background-color,border-color,color,scale] duration-200 active:scale-[0.96] hover:text-neutral-800 focus-visible:ring-1 focus-visible:ring-ring data-[state=on]:border-neutral-300 data-[state=on]:bg-neutral-50 data-[state=on]:text-neutral-900 data-[state=on]:shadow-[inset_0px_1px_3px_rgba(0,0,0,0.12),inset_0px_1px_2px_rgba(0,0,0,0.06)]",
      className
    )}
    {...props}
  >
    {children}
  </ToggleGroupPrimitive.Item>
));
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
