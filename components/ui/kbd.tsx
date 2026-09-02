import * as React from "react";

import { cn } from "@/lib/utils";

const Kbd = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <kbd
    className={cn(
      "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-neutral-200 bg-neutral-50 px-1.5 font-sans text-[10px] font-medium text-neutral-500",
      className
    )}
    {...props}
  />
);

export { Kbd };
