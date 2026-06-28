import Link from "next/link";
import Image from "next/image";
import { Search, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { NavLinks } from "@/components/layout/NavLinks";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";


export async function Sidebar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  let dbUser = null;
  if (isLoggedIn) {
    dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, image: true, role: true }
    });
  }

  const userRole = dbUser?.role || session?.user?.role;
  const userName = dbUser?.name || session?.user?.name;
  const userImage = dbUser?.image || session?.user?.image;

  return (
    <aside className="fixed left-0 top-0 h-[125vh] w-[320px] bg-white dark:bg-card text-black dark:text-white border-r border-zinc-200 dark:border-white/10 hidden lg:flex flex-col overflow-y-auto font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
      <div className="p-8 pb-4">
        {isLoggedIn ? (
          <div className="flex flex-col space-y-4 mb-4">
            <div className="flex items-center space-x-3 text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
              <div className="w-10 h-10 rounded-full bg-black dark:bg-zinc-800 flex items-center justify-center text-white overflow-hidden relative shrink-0">
                {userImage ? (
                  <img src={userImage} alt={userName || "Avatar"} className="w-full h-full object-cover" />
                ) : (
                  <User size={18} />
                )}
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-bold truncate max-w-[150px]">{userName || "Користувач"}</span>
                <span className="text-xs text-zinc-500 font-medium tracking-wide">{userRole}</span>
              </div>
            </div>

            {(userRole === "ADMIN" || userRole === "EDITOR") && (
              <Link href="/admin-panel" className="block w-full text-center border-2 border-black dark:border-white text-black dark:text-white py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                Адмін-панель
              </Link>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Link href="/settings" className="flex-1 text-center border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white transition-colors">
                Профіль
              </Link>
              <LogoutButton className="flex-1 w-full text-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors">
                Вийти
              </LogoutButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-3 mb-4">
            <Link href="/login" className="block w-full py-3 px-6 text-center border-2 border-black rounded-full font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300 shadow-sm">
              Увійти
            </Link>
            <Link href="/register" className="block w-full py-3 px-6 text-center bg-black text-white rounded-full font-black uppercase tracking-widest hover:bg-zinc-800 transition-all duration-300 shadow-sm">
              Реєстрація
            </Link>
          </div>
        )}
      </div>

      <nav className="flex-1 px-8">
        <NavLinks />

        <hr className="my-4 border-zinc-200 dark:border-zinc-800" />

        <form action="/search" method="GET" className="flex items-center group relative">
          <input
            type="search"
            name="q"
            placeholder="ПОШУК"
            className="w-full pl-10 pr-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-black dark:text-white border border-transparent focus:border-black dark:focus:border-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            required
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
        </form>

        <hr className="my-4 border-zinc-200 dark:border-zinc-800" />

        <div className="flex items-center space-x-4 text-zinc-500 pb-2">
          <Link href="https://t.me/uncultured_media" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
            <span className="sr-only">Telegram</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.2 3.45-.49.33-.94.5-1.34.49-.45-.01-1.3-.25-1.93-.46-.78-.26-1.4-.4-1.35-.85.03-.23.36-.47 1-.74 3.94-1.71 6.57-2.85 7.89-3.4 3.75-1.56 4.53-1.84 5.04-1.85.11 0 .36.03.49.14.11.09.14.22.15.33-.01.07-.01.12-.02.2z" />
            </svg>
          </Link>
          <Link href="https://www.instagram.com/uncultured.ua?igsh=aDR0ZjZveHczNzk4&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
            <span className="sr-only">Instagram</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </Link>
          <Link href="https://www.tiktok.com/@uncultured_media?_r=1&_t=ZN-97adGKSZIOI" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
            <span className="sr-only">TikTok</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19.321 5.562a5.122 5.122 0 0 1-3.552-1.332 5.105 5.105 0 0 1-1.36-3.522h-3.442v15.221a3.633 3.633 0 1 1-3.633-3.633 3.59 3.59 0 0 1 1.761.455v-3.765a7.352 7.352 0 0 0-1.761-.212 7.382 7.382 0 1 0 7.382 7.382V8.497a8.55 8.55 0 0 0 4.605 1.341V6.264a5.132 5.132 0 0 1-1.29-.11z" /></svg>
          </Link>
        </div>

        </nav>

      {/* Logo placed at the bottom */}
      <div className="sticky bottom-0 p-8 mt-auto bg-white dark:bg-card z-10 border-t border-zinc-100 dark:border-zinc-800 transition-colors">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="Uncultured Logo"
            width={240}
            height={60}
            className="animate-logo-pulse origin-left dark:invert transition-all"
          />
        </Link>
      </div>
    </aside>
  );
}
