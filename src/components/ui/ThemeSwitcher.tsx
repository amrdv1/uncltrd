"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Laptop } from "lucide-react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-full animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>;
  }

  return (
    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <button
        onClick={() => setTheme("light")}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
          theme === "light"
            ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white"
            : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
        }`}
      >
        <Sun size={16} /> Світла
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
          theme === "dark"
            ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white"
            : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
        }`}
      >
        <Moon size={16} /> Темна
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
          theme === "system"
            ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white"
            : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
        }`}
      >
        <Laptop size={16} /> Авто
      </button>
    </div>
  );
}
