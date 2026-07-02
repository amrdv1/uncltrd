"use client";
import { useEffect, useState } from "react";

export function TelegramSpacer() {
  const [tgPadding, setTgPadding] = useState(0);

  useEffect(() => {
    const checkTg = () => {
      const isTgRaw = document.documentElement.classList.contains('is-telegram-raw');
      const isTgAgent = navigator.userAgent.toLowerCase().includes('telegram');
      const tg = (window as any).Telegram?.WebApp;
      const isTgObj = tg && tg.platform && tg.platform !== 'unknown';
      
      if (isTgRaw || isTgAgent || isTgObj || (tg && tg.initData)) {
        let p = 54; // fallback
        if (tg && tg.contentSafeAreaInset && tg.contentSafeAreaInset.top > 0) {
          p = tg.contentSafeAreaInset.top + 8;
        } else if (tg && tg.safeAreaInset && tg.safeAreaInset.top > 0) {
          p = tg.safeAreaInset.top + 24;
        }
        setTgPadding(p);
      }
    };
    checkTg();
    setTimeout(checkTg, 500);
    setTimeout(checkTg, 1500);
  }, []);
  
  if (tgPadding === 0) return null;
  
  return (
    <div 
      className="w-full shrink-0 lg:hidden"
      style={{ height: `${tgPadding}px` }}
      aria-hidden="true" 
    />
  );
}
