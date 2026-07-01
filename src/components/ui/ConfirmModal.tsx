"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Підтвердити",
  cancelText = "Скасувати",
  isDestructive = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-[#111] p-8 rounded-3xl shadow-xl max-w-sm w-full border border-zinc-200 dark:border-zinc-800 text-center relative overflow-hidden"
          >
            <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              {title}
            </h3>
            <p className="text-zinc-500 mb-8 font-medium text-sm">
              {description}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors text-white ${
                  isDestructive 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-accent hover:bg-accent/80"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
