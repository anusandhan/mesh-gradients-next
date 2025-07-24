"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ColorInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange"
  > {
  value: string;
  onChange: (value: string) => void;
  triggerClassName?: string;
  previewClassName?: string;
  previewSize?: "sm" | "md" | "lg";
  previewShape?: "circle" | "square" | "rounded";
}

const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  (
    {
      className,
      triggerClassName,
      previewClassName,
      previewSize = "md",
      previewShape = "rounded",
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-9 h-9",
      lg: "w-12 h-12",
    };

    const shapeClasses = {
      circle: "rounded-full",
      square: "rounded-none",
      rounded: "rounded-md",
    };

    return (
      <div className={cn("relative", className)}>
        <input
          ref={ref}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "absolute inset-0 opacity-0 cursor-pointer w-full h-full",
            triggerClassName
          )}
          {...props}
        />
        <div
          className={cn(
            "border-1 border-neutral-200 cursor-pointer",
            sizeClasses[previewSize],
            shapeClasses[previewShape],
            previewClassName
          )}
          style={{ backgroundColor: value }}
        />
      </div>
    );
  }
);

ColorInput.displayName = "ColorInput";

export { ColorInput };
