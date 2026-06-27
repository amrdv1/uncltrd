"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

export function ConfirmDeleteButton({ 
  onConfirm, 
  itemType = "статтю" 
}: { 
  onConfirm: () => void | Promise<any>;
  itemType?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm();
      setIsOpen(false);
    });
  };

  return (
    <>
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(true); }}
        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        title="Видалити"
      >
        <Trash2 size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isPending && setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <h3 className="text-xl font-bold mb-2 uppercase tracking-tight text-black dark:text-white font-serif" style={{ fontFamily: "var(--font-space-grotesk)"}}>
                Підтвердження
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6 font-medium">
                Ви дійсно хочете видалити {itemType}? Цю дію неможливо скасувати.
              </p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-widest text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isPending}
                  className="flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-widest text-xs bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                  {isPending ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Видалити"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
