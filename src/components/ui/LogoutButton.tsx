"use client";

import { logout } from "@/app/actions/user";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export function LogoutButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    // Clear theme from localStorage
    localStorage.removeItem("theme");
    
    // Clear accent color cookie
    document.cookie = "accentColor=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Reset CSS variables to default
    document.documentElement.style.removeProperty('--accent');
    document.body.style.removeProperty('--accent');
    
    // Switch to system theme by removing dark class
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.remove('light');

    // Proceed with server logout
    await logout();
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={className}>
        {children}
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-[#111] p-8 rounded-3xl shadow-xl max-w-sm w-full border border-zinc-200 dark:border-zinc-800 text-center relative overflow-hidden"
              >
                <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>Вихід з акаунту</h3>
                <p className="text-zinc-500 mb-8 font-medium text-sm">Ви дійсно хочете вийти?</p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  >
                    СКАСУВАТИ
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors"
                  >
                    ВИЙТИ
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
