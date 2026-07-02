"use client";
import { useTelegram } from "@/components/providers/TelegramProvider";

export function TelegramSpacer() {
  const { isTelegram } = useTelegram();
  
  if (!isTelegram) return null;
  
  return (
    <div 
      className="w-full shrink-0 lg:hidden"
      style={{ height: 'var(--tg-header-padding, 48px)' }}
      aria-hidden="true" 
    />
  );
}
