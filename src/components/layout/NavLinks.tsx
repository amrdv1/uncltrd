"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { label: "Новини", href: "/news" },
  { 
    label: "Релізи", 
    subLinks: [
      { label: "Сингли", href: "/category/singles" },
      { label: "Альбоми", href: "/category/albums" },
      { label: "Кліпи", href: "/category/clips" },
    ]
  },
  { label: "Огляди", href: "/category/reviews" },
  { label: "Плейлисти", href: "/category/playlists" },
];

export function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (label: string) => {
    if (openDropdown === label) setOpenDropdown(null);
    else setOpenDropdown(label);
  };

  return (
    <ul className="flex flex-col space-y-2 lg:space-y-4">
      {NAV_LINKS.map((link) => {
        const isOpen = openDropdown === link.label;
        
        return (
          <li key={link.label}>
            {link.subLinks ? (
              <div className="flex flex-col">
                <button
                  onClick={() => toggleDropdown(link.label)}
                  className="flex items-center justify-between w-full text-left text-2xl font-extrabold uppercase tracking-tighter hover:text-accent transition-colors py-2 text-black dark:text-white"
                >
                  {link.label}
                  <motion.span
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "anticipate" }}
                    className="text-sm text-zinc-400"
                  >
                    ▼
                  </motion.span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <ul className="overflow-hidden">
                    <div className="pl-4 lg:pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 ml-2 mt-2 mb-2 flex flex-col space-y-3 py-1">
                      {link.subLinks.map((subLink) => (
                        <li key={subLink.label}>
                          <Link
                            href={subLink.href}
                            onClick={onLinkClick}
                            className="group flex items-center text-xl font-bold uppercase tracking-tight text-zinc-500 dark:text-zinc-400 hover:text-accent transition-all"
                          >
                            <span className="transform transition-transform duration-300 ease-out group-hover:translate-x-3">
                              {subLink.label}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </div>
                  </ul>
                </div>
              </div>
            ) : (
              <Link
                href={link.href!}
                onClick={onLinkClick}
                className="group flex items-center text-2xl font-extrabold uppercase tracking-tighter hover:text-accent transition-all py-2 text-black dark:text-white"
              >
                <span className="transform transition-transform duration-300 ease-out group-hover:translate-x-3">
                  {link.label}
                </span>
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
