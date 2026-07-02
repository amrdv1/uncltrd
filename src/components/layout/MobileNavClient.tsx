"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, Menu, X } from "lucide-react";
import { NavLinks } from "@/components/layout/NavLinks";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

export function MobileNavClient({ userRole, userName, userImage, isLoggedIn }: any) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 w-full h-16 telegram-header-height telegram-header-padding bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 z-40 flex items-center justify-between px-6 shadow-sm transition-all">
        <Link href="/" className="text-2xl font-black uppercase tracking-tighter font-serif">
          uncultured<span className="text-accent">.</span>
        </Link>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 -mr-2 text-black dark:text-white hover:text-accent transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Backdrop */}
      <div 
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 w-[80vw] sm:w-[320px] h-full bg-white/80 dark:bg-background/80 backdrop-blur-xl z-50 flex flex-col overflow-y-auto shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.21,0.47,0.32,0.98)] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
              <div className="flex items-center justify-between p-4 telegram-header-padding border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xl font-black uppercase tracking-tighter font-serif">Меню</span>
                <button onClick={() => setIsOpen(false)} className="p-2">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 flex flex-col flex-1">
                {isLoggedIn ? (
                  <div className="flex flex-col space-y-4 mb-8">
                    <div className="flex items-center space-x-3 text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                      <div className="w-10 h-10 rounded-full bg-black dark:bg-zinc-800 flex items-center justify-center text-white overflow-hidden relative shrink-0">
                        {userImage ? (
                          <img src={userImage} alt={userName || "Avatar"} className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} />
                        )}
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-bold truncate max-w-[150px]">{userName || "Користувач"}</span>
                        <span className="text-xs text-zinc-500 font-medium tracking-wide">{userRole}</span>
                      </div>
                    </div>
                    
                    {(userRole === "ADMIN" || userRole === "EDITOR") && (
                      <Link href="/admin-panel" onClick={() => setIsOpen(false)} className="block w-full text-center border-2 border-black dark:border-white text-black dark:text-white py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                        Адмін-панель
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="mb-8 flex flex-col space-y-3">
                    <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center space-x-2 bg-transparent border-2 border-black dark:border-white text-black dark:text-white py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors w-full">
                      <User size={16} />
                      <span>Увійти</span>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center space-x-2 bg-accent text-white py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors w-full">
                      <span>Створити акаунт</span>
                    </Link>
                  </div>
                )}

                <form action="/search" className="relative mb-8" onSubmit={() => setIsOpen(false)}>
                  <input
                    type="text"
                    name="q"
                    placeholder="ПОШУК..."
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-accent outline-none uppercase tracking-widest"
                  />
                  <Search size={16} className="absolute left-4 top-3.5 text-zinc-400" />
                </form>

                <nav className="flex-1">
                  <NavLinks onLinkClick={() => setIsOpen(false)} />
                </nav>

                {isLoggedIn && (
                  <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                    <Link href="/settings" onClick={() => setIsOpen(false)} className="block text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                      Налаштування
                    </Link>
                    <LogoutButton className="text-left text-sm font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors w-full">
                      Вийти
                    </LogoutButton>
                  </div>
                )}
              </div>
            </div>
    </div>
  );
}
