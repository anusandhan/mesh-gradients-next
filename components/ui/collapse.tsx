"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

// Height-animated reveal for optional controls (e.g. effect dials that only
// exist while an effect is on). Springs with no bounce so it reads as the
// panel making room rather than something popping in. `initial={false}`
// keeps the first paint static.
export function Collapse({
  open,
  children,
  className,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="collapse"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          style={{ overflow: "hidden" }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
