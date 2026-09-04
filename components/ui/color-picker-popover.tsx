"use client";

import * as React from "react";
import { Popover } from "radix-ui";
import { ChannelColorPicker } from "@/components/ui/channel-color-picker";
import type { ColorFormat } from "@/lib/color-format";
import { cn } from "@/lib/utils";

type ColorPickerPopoverProps = {
  value: string;
  format: ColorFormat;
  onChange: (hex: string) => void;
  className?: string;
};

const ColorPickerPopover = ({
  value,
  format,
  onChange,
  className,
}: ColorPickerPopoverProps) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className={cn(
            // Figma "Color Picker" swatch: 36px, 8px radius, hairline
            // border, 2px white inset ring and a soft 1px halo
            "w-9 h-9 shrink-0 p-0 rounded-lg border-[0.5px] border-black/30 hover:border-black/50 transition-[border-color,transform] duration-200 cursor-pointer active:scale-[0.96]",
            // Focused or open: the same 1px dark border the channel fields
            // get, so the swatch reads as part of the input family
            "focus-visible:outline-none focus-visible:border focus-visible:border-neutral-800 data-[state=open]:border data-[state=open]:border-neutral-800",
            className
          )}
          style={{
            backgroundColor: value,
            boxShadow:
              "inset 0 0 0 2px #fff, 0 0 1px 1px rgba(0, 0, 0, 0.08)",
          }}
          aria-label="Select color"
          type="button"
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="z-50 w-80 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg"
        >
          <ChannelColorPicker
            value={value}
            format={format}
            onChange={onChange}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export { ColorPickerPopover };
