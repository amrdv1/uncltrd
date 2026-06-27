"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";

const ACCENT_COLORS = [
  { id: "pink", value: "345 100% 60%", bgClass: "bg-[#FF3366]" },
  { id: "blue", value: "217 91% 60%", bgClass: "bg-[#2A75FF]" },
  { id: "green", value: "145 100% 39%", bgClass: "bg-[#00C853]" },
  { id: "orange", value: "40 100% 50%", bgClass: "bg-[#FFAB00]" },
  { id: "purple", value: "280 100% 50%", bgClass: "bg-[#AA00FF]" },
];

export function AccentColorPicker() {
  const [mounted, setMounted] = useState(false);
  const [activeColor, setActiveColor] = useState(ACCENT_COLORS[0].value);

  useEffect(() => {
    setMounted(true);
    // Read the cookie directly in the client if possible, or fallback to CSS variable
    const match = document.cookie.match(/(?:^|; )accentColor=([^;]*)/);
    if (match) {
      setActiveColor(decodeURIComponent(match[1]));
    } else {
      // get computed style fallback
      const current = getComputedStyle(document.body).getPropertyValue("--accent").trim();
      if (current) setActiveColor(current);
    }
  }, []);

  const changeAccentColor = (value: string) => {
    setActiveColor(value);
    
    // Set CSS Variable immediately for fast visual feedback
    document.body.style.setProperty("--accent", value);
    
    // Save to cookie (1 year expiry)
    document.cookie = `accentColor=${encodeURIComponent(value)}; max-age=31536000; path=/`;
  };

  if (!mounted) {
    return <div className="h-14 w-full animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {ACCENT_COLORS.map((color) => (
        <button
          key={color.id}
          onClick={() => changeAccentColor(color.value)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${color.bgClass} shadow-md`}
          aria-label={`Select ${color.id} accent color`}
        >
          {activeColor === color.value && <Check size={24} className="text-white" />}
        </button>
      ))}
    </div>
  );
}
