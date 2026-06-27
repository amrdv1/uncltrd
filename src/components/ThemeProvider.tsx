"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

function ThemeResetter() {
  const { setTheme } = useTheme();
  React.useEffect(() => {
    if (!localStorage.getItem('theme-reset-v2')) {
      setTheme('light');
      localStorage.setItem('theme-reset-v2', 'true');
    }
  }, [setTheme]);
  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeResetter />
      {children}
    </NextThemesProvider>
  );
}
