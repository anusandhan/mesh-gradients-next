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
            "w-9 h-9 shrink-0 p-0 rounded-lg border border-[1.25px] border-neutral-400 hover:border-neutral-700 transition-all duration-200 ease cursor-pointer",
            className
          )}
          style={{
            backgroundColor: value,
            boxShadow: "inset 0 0 0 2px rgba(255, 255, 255, 0.25)",
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
