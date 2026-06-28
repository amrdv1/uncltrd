"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface Tab {
  id: string;
  label: string;
  href: string;
}

export function AnimatedTabs({ tabs, defaultTabId }: { tabs: Tab[], defaultTabId: string }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("view") || defaultTabId;

  return (
    <div className="flex flex-wrap gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <Link 
            key={tab.id} 
            href={tab.href}
            className={`relative pb-4 px-2 md:px-6 font-bold uppercase tracking-widest text-xs md:text-sm transition-colors ${
              isActive ? "text-black dark:text-white" : "text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="activeCategoryTabIndicator"
                className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black dark:bg-white z-10"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
