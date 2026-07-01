"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function PrivacyPolicyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-zinc-400 hover:text-accent transition-colors uppercase tracking-widest text-xs font-bold"
      >
        Політика конфіденційності
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-500 ease-out">
          
          <div className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-[2rem] w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-500 ease-out relative overflow-hidden">

            {/* Header */}
            <div className="relative flex-none flex items-center justify-center px-4 py-5 sm:py-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-[#111]">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-widest text-black dark:text-white">
                Політика конфіденційності
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white transition-all hover:scale-110 active:scale-95"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 space-y-8 custom-scrollbar -webkit-overflow-scrolling-touch">
              <section>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black dark:text-white mb-3 flex items-baseline gap-2" style={{ fontFamily: "var(--font-space-grotesk)"}}>
                  <span className="text-accent">01.</span> Загальні положення
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  Ця Політика конфіденційності визначає порядок збору, зберігання, використання та захисту персональних даних користувачів нашого порталу. Використовуючи сайт, ви погоджуєтеся з умовами цієї політики.
                </p>
              </section>
              
              <section>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black dark:text-white mb-3 flex items-baseline gap-2" style={{ fontFamily: "var(--font-space-grotesk)"}}>
                  <span className="text-accent">02.</span> Збір інформації
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium mb-3">Ми збираємо такі дані:</p>
                <ul className="space-y-3">
                  <li className="relative pl-5 text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-accent" />
                    Інформація для авторизації (ім'я, email), надана через Google або інші сервіси.
                  </li>
                  <li className="relative pl-5 text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-accent" />
                    Користувацький контент (оцінки, рецензії, коментарі).
                  </li>
                  <li className="relative pl-5 text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-accent" />
                    Технічні дані (IP-адреса, тип браузера, файли cookie) для покращення роботи сайту.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black dark:text-white mb-3 flex items-baseline gap-2" style={{ fontFamily: "var(--font-space-grotesk)"}}>
                  <span className="text-accent">03.</span> Використання даних
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium mb-3">Зібрана інформація використовується виключно для:</p>
                <ul className="space-y-3">
                  <li className="relative pl-5 text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-accent" />
                    Надання доступу до функціоналу сайту (оцінювання, коментування).
                  </li>
                  <li className="relative pl-5 text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-accent" />
                    Персоналізації досвіду користувача.
                  </li>
                  <li className="relative pl-5 text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                    <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-accent" />
                    Аналітики та покращення продукту.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black dark:text-white mb-3 flex items-baseline gap-2" style={{ fontFamily: "var(--font-space-grotesk)"}}>
                  <span className="text-accent">04.</span> Захист та передача
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  Ми вживаємо всіх необхідних заходів для захисту ваших даних від несанкціонованого доступу. Ваші персональні дані не передаються третім особам, за винятком випадків, передбачених чинним законодавством України.
                </p>
              </section>
              
              <section>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black dark:text-white mb-3 flex items-baseline gap-2" style={{ fontFamily: "var(--font-space-grotesk)"}}>
                  <span className="text-accent">05.</span> Сторонні сервіси
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  Наш сайт може містити посилання на сторонні платформи (SoundCloud, Spotify, Apple Music, YouTube). Ми не несемо відповідальності за політику конфіденційності цих ресурсів. Прослуховування музики через вбудовані плеєри може підпорядковуватись їхнім власним правилам обробки даних.
                </p>
              </section>

              <section>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black dark:text-white mb-3 flex items-baseline gap-2" style={{ fontFamily: "var(--font-space-grotesk)"}}>
                  <span className="text-accent">06.</span> Права користувачів
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  Ви маєте право у будь-який момент запитати видалення вашого акаунту та пов'язаних з ним персональних даних, звернувшись до адміністрації сайту.
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="flex-none p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-[#111] relative z-10 shadow-[0_-10px_30px_rgba(255,255,255,1)] dark:shadow-[0_-10px_30px_rgba(17,17,17,1)]">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 rounded-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:scale-[1.02] active:scale-95 transition-all text-xs shadow-lg"
              >
                Зрозуміло, дякую
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
