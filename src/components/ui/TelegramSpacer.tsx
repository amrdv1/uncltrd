"use client";
import { useEffect, useState } from "react";

export function useTelegramPadding() {
  const [padding, setPadding] = useState(0);
  
  useEffect(() => {
    const checkPadding = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && (tg.initData || window.location.hash.includes('tgWebAppData'))) {
        let p = 48; // Base safe fallback
        if (tg.contentSafeAreaInset && tg.contentSafeAreaInset.top > 0) {
          p = tg.contentSafeAreaInset.top + 8;
        } else if (tg.safeAreaInset && tg.safeAreaInset.top > 0) {
          p = tg.safeAreaInset.top + 24;
        }
        setPadding(p);
      }
    };
    
    checkPadding();
    
    // In case Telegram injects data slightly after mount
    const timeoutId = setTimeout(checkPadding, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  return padding;
}

export function TelegramSpacer() {
  const padding = useTelegramPadding();
  if (!padding) return null;
  
  return <div style={{ height: `${padding}px`, width: '100%', flexShrink: 0 }} aria-hidden="true" className="lg:hidden" />;
}
