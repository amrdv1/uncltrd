"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Laptop } from "lucide-react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-full animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>;
  }

  const themes = [
    { id: "light", label: "Світла", icon: <Sun size={16} /> },
    { id: "dark", label: "Темна", icon: <Moon size={16} /> },
    { id: "system", label: "Авто", icon: <Laptop size={16} /> },
  ];

  return (
    <div className="flex bg-secondary p-1 rounded-xl border border-border">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
            theme === t.id
              ? "bg-background text-foreground shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}
