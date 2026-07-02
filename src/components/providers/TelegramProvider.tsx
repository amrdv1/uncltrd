"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Script from "next/script";
import { signIn, getSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

interface TelegramContextType {
  webApp: any | null;
  user: any | null;
  isTelegram: boolean;
}

const TelegramContext = createContext<TelegramContextType>({ 
  webApp: null, 
  user: null,
  isTelegram: false
});

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [webApp, setWebApp] = useState<any | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only run if we are in the browser and Telegram WebApp is injected
    const initTelegram = async () => {
      const tg = (window as any).Telegram?.WebApp;
      // If initData is present, it means the app is running inside Telegram
      if (tg && (tg.initData || window.location.hash.includes('tgWebAppData'))) {
        setIsTelegram(true);
        setWebApp(tg);
        document.documentElement.classList.add("in-telegram");
        
        // Notify Telegram that the app is ready to be displayed
        tg.ready();
        
        // Prevent accidental swipe closing
        if (typeof tg.disableVerticalSwipes === 'function') {
          tg.disableVerticalSwipes();
        }

        // Expand the Web App to take up the full available screen height or full screen
        if (typeof tg.requestFullscreen === 'function') {
          try {
            tg.requestFullscreen();
          } catch (e) {
            tg.expand();
          }
        } else {
          tg.expand();
        }
        
        // Set Theme Color based on Telegram's current color scheme
        if (tg.colorScheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        
        // Tell Telegram what our header color is so it blends in seamlessly
        try {
          tg.setHeaderColor(tg.colorScheme === "dark" ? "#000000" : "#ffffff");
          tg.setBackgroundColor(tg.colorScheme === "dark" ? "#000000" : "#ffffff");
        } catch (e) {
          console.error("Could not set TG colors", e);
        }

        // Seamless Authentication
        if (tg.initData) {
          try {
            const session = await getSession();
            if (!session?.user) {
              await signIn("telegram", { 
                initData: tg.initData, 
                redirect: false 
              });
              // Reload to apply authenticated state globally
              window.location.reload();
            }
          } catch (e) {
            console.error("Seamless TG Auth failed", e);
          }
        }
      }
    };

    // Since the script might load asynchronously, we can try initializing immediately and set a small timeout just in case
    initTelegram();
    const timer = setTimeout(initTelegram, 300);
    return () => clearTimeout(timer);
  }, []);

  // Handle BackButton based on current route
  useEffect(() => {
    if (!webApp) return;

    if (pathname !== "/") {
      webApp.BackButton.show();
    } else {
      webApp.BackButton.hide();
    }

    const handleBack = () => {
      router.back();
    };

    webApp.BackButton.onClick(handleBack);

    return () => {
      webApp.BackButton.offClick(handleBack);
    };
  }, [pathname, webApp, router]);

  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <TelegramContext.Provider value={{ 
        webApp, 
        user: webApp?.initDataUnsafe?.user || null,
        isTelegram
      }}>
        {children}
      </TelegramContext.Provider>
    </>
  );
}

export const useTelegram = () => useContext(TelegramContext);
