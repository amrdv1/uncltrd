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
                className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-sm w-full border border-black/5 dark:border-white/10 text-center relative overflow-hidden"
              >
                {/* Decorative element */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </div>
                
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>ВИХІД</h3>
                <p className="text-zinc-500 mb-8 font-medium text-sm">Ви дійсно хочете вийти з акаунту?</p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3.5 rounded-xl bg-red-500 text-white font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors w-full shadow-lg shadow-red-500/20 active:scale-[0.98]"
                  >
                    ВИЙТИ З АКАУНТУ
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors w-full active:scale-[0.98]"
                  >
                    СКАСУВАТИ
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
