"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import twemoji from "twemoji";

export function AppleEmojiProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Run twemoji parse on the document body to replace native emojis with Apple emojis
    // We wrap it in a small timeout to ensure React has finished rendering the DOM
    const timeout = setTimeout(() => {
      twemoji.parse(document.body, {
        base: 'https://unpkg.com/emoji-datasource-apple@15.0.1/img/apple/',
        folder: '64',
        ext: '.png',
        className: 'apple-emoji'
      });
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [pathname]);

  return <>{children}</>;
}
