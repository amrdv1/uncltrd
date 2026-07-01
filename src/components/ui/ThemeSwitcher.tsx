"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Coffee, Star } from "lucide-react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-20 w-full animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>;
  }

  const themes = [
    { id: "light", label: "Світла", icon: <Sun size={16} /> },
    { id: "dark", label: "Темна", icon: <Moon size={16} /> },
    { id: "midnight", label: "Опівніч", icon: <Star size={16} /> },
    { id: "coffee", label: "Кава", icon: <Coffee size={16} /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 bg-secondary p-2 rounded-xl border border-border">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-bold transition-all ${
            theme === t.id
              ? "bg-background text-foreground shadow-md ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
