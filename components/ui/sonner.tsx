"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Toast surface mirrors the outline buttons (rounded-lg, px-4 py-2); the
// action button mirrors the primary Download button's gradient treatment.
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    className="toaster group"
    toastOptions={{
      classNames: {
        toast:
          "group toast !rounded-lg !px-4 !py-2 !items-center !bg-white !text-neutral-800 !border-neutral-200 !shadow-lg",
        title: "!text-sm !font-normal",
        description: "!text-neutral-500",
        actionButton:
          "!h-8 !rounded-lg !border !border-neutral-900 !bg-gradient-to-b !from-neutral-700 !to-neutral-900 !px-3 !text-sm !font-medium !text-white !shadow-[inset_0px_0px_1px_0px_rgba(255,255,255,0.80),0px_1px_1px_0px_rgba(0,0,0,0.25)]",
        cancelButton: "!bg-neutral-100 !text-neutral-500",
      },
    }}
    {...props}
  />
);

export { Toaster };
