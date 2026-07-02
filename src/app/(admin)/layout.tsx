import Link from "next/link";
import { Users, FileText, Settings, LayoutDashboard, BookOpen, LogOut, Image as ImageIcon } from "lucide-react";
import { auth } from "@/lib/auth";

import { redirect } from "next/navigation";
import { TelegramSpacer } from "@/components/ui/TelegramSpacer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // 1. Check if user is logged in at all
  if (!session?.user) {
    redirect("/login");
  }

  const allowedEmails = ["gokrai@uncultured.media", "leanoplav@uncultured.media", "skyti@uncultured.media"];
  const isAdmin = session?.user?.role === "ADMIN" || allowedEmails.includes(session?.user?.email?.toLowerCase() || "");
  const isEditor = session?.user?.role === "EDITOR";

  // 2. Block access for normal users (must be ADMIN or EDITOR)
  if (!isAdmin && !isEditor) {
    redirect("/"); // Redirect unauthorized users to the main page
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-white selection:bg-accent selection:text-white transition-colors">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border-r border-zinc-200 dark:border-zinc-800/50 p-6 hidden md:flex flex-col relative z-20 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-b from-black/[0.02] dark:from-white/[0.02] to-transparent pointer-events-none" />
        <div className="mb-8 relative z-10">
          <h2 className="text-2xl font-black tracking-tight text-black dark:text-white font-serif flex items-center gap-2">
            UNCULTURED<span className="text-accent">.</span>
          </h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">Admin Panel</p>
        </div>

        <nav className="flex-1 space-y-1 relative z-10">
          <Link href="/admin-panel" className="flex items-center space-x-3 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 px-4 py-3 rounded-xl transition-all hover:translate-x-1 group">
            <LayoutDashboard size={18} className="group-hover:text-accent transition-colors" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
          <Link href="/admin-panel/articles" className="flex items-center space-x-3 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 px-4 py-3 rounded-xl transition-all hover:translate-x-1 group">
            <FileText size={18} className="group-hover:text-blue-500 transition-colors" />
            <span className="font-medium text-sm">Articles</span>
          </Link>
          <Link href="/admin-panel/gif-converter" className="flex items-center space-x-3 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 px-4 py-3 rounded-xl transition-all hover:translate-x-1 group">
            <ImageIcon size={18} className="group-hover:text-pink-500 transition-colors" />
            <span className="font-medium text-sm">GIF Конвертор</span>
          </Link>
          {isAdmin && (
            <>
              <Link href="/admin-panel/users" className="flex items-center space-x-3 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 px-4 py-3 rounded-xl transition-all hover:translate-x-1 group">
                <Users size={18} className="group-hover:text-green-500 transition-colors" />
                <span className="font-medium text-sm">Users</span>
              </Link>
              <Link href="/admin-panel/settings" className="flex items-center space-x-3 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 px-4 py-3 rounded-xl transition-all hover:translate-x-1 group">
                <Settings size={18} className="group-hover:text-purple-500 transition-colors" />
                <span className="font-medium text-sm">Settings</span>
              </Link>
            </>
          )}
          <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800/50">
            <Link href="/admin-panel/guide" className="flex items-center space-x-3 text-accent hover:text-black dark:hover:text-white bg-accent/5 dark:bg-accent/10 hover:bg-accent/10 dark:hover:bg-accent/20 border border-accent/20 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] group shadow-sm">
              <BookOpen size={18} className="animate-pulse" />
              <span className="font-bold text-sm">Довідник</span>
            </Link>
          </div>
        </nav>
        
        <div className="mt-auto pt-6 relative z-10">
          <Link href="/" className="flex items-center justify-center w-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-all">
            &larr; На сайт
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl border-t border-zinc-200 dark:border-zinc-800/50 z-50 flex justify-around items-center px-2 py-3 pb-safe transition-colors">
        <Link href="/admin-panel" className="flex flex-col items-center p-2 text-zinc-500 hover:text-accent dark:text-zinc-400 dark:hover:text-accent">
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold uppercase mt-1">Головна</span>
        </Link>
        <Link href="/admin-panel/articles" className="flex flex-col items-center p-2 text-zinc-500 hover:text-blue-500 dark:text-zinc-400 dark:hover:text-blue-500">
          <FileText size={20} />
          <span className="text-[10px] font-bold uppercase mt-1">Статті</span>
        </Link>
        <Link href="/admin-panel/gif-converter" className="flex flex-col items-center p-2 text-zinc-500 hover:text-pink-500 dark:text-zinc-400 dark:hover:text-pink-500">
          <ImageIcon size={20} />
          <span className="text-[10px] font-bold uppercase mt-1">GIF</span>
        </Link>
        {isAdmin && (
          <Link href="/admin-panel/users" className="flex flex-col items-center p-2 text-zinc-500 hover:text-green-500 dark:text-zinc-400 dark:hover:text-green-500">
            <Users size={20} />
            <span className="text-[10px] font-bold uppercase mt-1">Люди</span>
          </Link>
        )}
        <Link href="/admin-panel/settings" className="flex flex-col items-center p-2 text-zinc-500 hover:text-purple-500 dark:text-zinc-400 dark:hover:text-purple-500">
          <Settings size={20} />
          <span className="text-[10px] font-bold uppercase mt-1">Налаштування</span>
        </Link>
        <Link href="/" className="flex flex-col items-center p-2 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-500">
          <LogOut size={20} />
          <span className="text-[10px] font-bold uppercase mt-1">На сайт</span>
        </Link>
      </nav>

      {/* Admin Content */}
      <main className="flex-1 p-4 pb-24 md:pb-8 md:p-8 lg:p-12 relative z-10 overflow-x-hidden">
        <TelegramSpacer />
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
