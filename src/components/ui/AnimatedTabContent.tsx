"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

export function AnimatedTabContent({ 
  viewKey, 
  children 
}: { 
  viewKey: string; 
  children: ReactNode 
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
