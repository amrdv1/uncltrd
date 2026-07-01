"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function AboutModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest text-xs font-bold"
      >
        Про нас
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-500 ease-out">
          
          <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-[2rem] w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-500 ease-out relative overflow-hidden">

            {/* Header */}
            <div className="relative flex-none flex items-center justify-center px-4 py-5 sm:py-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-[#111]">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-widest text-black dark:text-white">
                Про нас
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white transition-all hover:scale-110 active:scale-95"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-8 sm:py-10 space-y-6 custom-scrollbar -webkit-overflow-scrolling-touch">
              <section>
                <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  <strong>uncultured.</strong> — це проєкт, створений для популяризації сучасної української музичної індустрії та руйнування стереотипів про українську музику.
                </p>
              </section>
              
              <section>
                <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  Ми хочемо показати, що українська музика — це не «крінж», а якісна, самобутня й різноманітна сцена, яка постійно розвивається та заслуговує на увагу.
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="flex-none p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-[#111] relative z-10 shadow-[0_-10px_30px_rgba(255,255,255,1)] dark:shadow-[0_-10px_30px_rgba(17,17,17,1)]">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 rounded-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:scale-[1.02] active:scale-95 transition-all text-xs shadow-lg"
              >
                Зрозуміло
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
