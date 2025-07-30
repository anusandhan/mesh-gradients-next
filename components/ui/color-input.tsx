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
        <label className="cursor-pointer">
          <input
            ref={ref}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn("sr-only", triggerClassName)}
            {...props}
          />
          <div
            className={cn(
              "border border-[1.25px] border-neutral-300 hover:border-neutral-600 transition-all duration-200 ease-out",
              sizeClasses[previewSize],
              shapeClasses[previewShape],
              previewClassName
            )}
            style={{
              backgroundColor: value,
              boxShadow: "inset 0 0 0 2px rgba(255, 255, 255, 0.25)",
            }}
          />
        </label>
      </div>
    );
  }
);

ColorInput.displayName = "ColorInput";

export { ColorInput };
