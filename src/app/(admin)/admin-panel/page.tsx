import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { PlusCircle, Users, FileText, Star, Edit3, ArrowRight } from "lucide-react";
import * as motion from "framer-motion/client";

export default async function AdminDashboard() {
  const session = await auth();

  // Fetch real statistics
  const [
    publishedCount,
    draftCount,
    userCount,
    reviewCount,
    latestArticles
  ] = await Promise.all([
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.article.count({ where: { status: "DRAFT" } }),
    db.user.count(),
    // @ts-ignore
    db.userRating.count({ where: { content: { not: null } } }),
    db.article.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { author: true, category: true, trackReview: true }
    })
  ]);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
      >
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)"}}>
            Панель Керування<span className="text-accent">.</span>
          </h1>
          <p className="text-zinc-500 font-medium mt-2">Вітаємо, {session?.user?.name || session?.user?.email}</p>
        </div>
        <Link 
          href="/admin-panel/articles/new" 
          className="bg-black text-white dark:bg-white dark:text-black px-8 py-3.5 rounded-full font-bold uppercase tracking-widest hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-all hover:scale-105 flex items-center gap-2 text-xs shadow-sm"
        >
          <PlusCircle size={18} />
          Створити статтю
        </Link>
      </motion.div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#111] hover:bg-zinc-50 dark:hover:bg-[#151515] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-sm hover:shadow-blue-500/10">
          <div className="absolute -top-4 -right-4 p-6 opacity-5 group-hover:opacity-20 transition-all group-hover:scale-110 text-blue-500">
            <FileText size={100} />
          </div>
          <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 z-10">Опубліковано</h3>
          <p className="text-6xl font-black z-10 text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)"}}>{publishedCount}</p>
          <div className="mt-4 w-8 h-1 bg-blue-500 rounded-full" />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-[#111] hover:bg-zinc-50 dark:hover:bg-[#151515] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-sm hover:shadow-purple-500/10">
          <div className="absolute -top-4 -right-4 p-6 opacity-5 group-hover:opacity-20 transition-all group-hover:scale-110 text-purple-500">
            <Edit3 size={100} />
          </div>
          <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 z-10">Чернетки</h3>
          <p className="text-6xl font-black z-10 text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)"}}>{draftCount}</p>
          <div className="mt-4 w-8 h-1 bg-purple-500 rounded-full" />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-[#111] hover:bg-zinc-50 dark:hover:bg-[#151515] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-sm hover:shadow-accent/10">
          <div className="absolute -top-4 -right-4 p-6 opacity-5 group-hover:opacity-20 transition-all group-hover:scale-110 text-accent">
            <Users size={100} />
          </div>
          <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 z-10">Користувачі</h3>
          <p className="text-6xl font-black z-10 text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)"}}>{userCount}</p>
          <div className="mt-4 w-8 h-1 bg-accent rounded-full" />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-[#111] hover:bg-zinc-50 dark:hover:bg-[#151515] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-sm hover:shadow-yellow-500/10">
          <div className="absolute -top-4 -right-4 p-6 opacity-5 group-hover:opacity-20 transition-all group-hover:scale-110 text-yellow-500">
            <Star size={100} />
          </div>
          <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 z-10">Рецензії</h3>
          <p className="text-6xl font-black z-10 text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)"}}>{reviewCount}</p>
          <div className="mt-4 w-8 h-1 bg-yellow-500 rounded-full" />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Articles List */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111] rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center bg-zinc-50 dark:bg-[#151515]">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)"}}>Останні статті</h2>
            <Link href="/admin-panel/articles" className="text-[10px] font-bold text-zinc-500 hover:text-black dark:hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors">Переглянути всі <ArrowRight size={14} /></Link>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {latestArticles.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">Немає жодної статті.</div>
            ) : (
              latestArticles.map(article => (
                <div key={article.id} className="p-6 md:p-8 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-[#1a1a1a] transition-colors group">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${article.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                        {article.status === 'PUBLISHED' ? 'Опубліковано' : 'Чернетка'}
                      </span>
                      {article.isTrackReview && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          Огляд
                        </span>
                      )}
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {article.category?.name || "Без категорії"}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg md:text-xl text-black dark:text-white group-hover:text-accent transition-colors line-clamp-1">{article.title}</h3>
                    {article.isTrackReview && article.trackReview && (
                      <p className="text-sm text-zinc-500 font-medium mt-1">
                        {article.trackReview.artistName} - {article.trackReview.trackName}
                      </p>
                    )}
                    <p className="text-xs text-zinc-600 mt-3 font-medium uppercase tracking-widest">
                      {article.createdAt.toLocaleDateString("uk-UA")}
                    </p>
                  </div>
                  <Link 
                    href={`/admin-panel/articles/${article.id}`} 
                    className="ml-4 opacity-0 group-hover:opacity-100 transition-all bg-black text-white dark:bg-white dark:text-black hover:bg-accent hover:text-white dark:hover:bg-accent p-3 rounded-full hover:scale-110"
                  >
                    <Edit3 size={18} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Quick Actions / Tips */}
        <div className="bg-gradient-to-br from-white dark:from-[#111] to-zinc-50 dark:to-[#0a0a0a] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 text-black dark:text-white relative z-10" style={{ fontFamily: "var(--font-space-grotesk)"}}>Швидкі дії</h2>
          <div className="space-y-4 relative z-10">
            <Link href="/admin-panel/articles/new-review" className="block w-full text-left p-5 rounded-2xl bg-white dark:bg-[#151515] hover:bg-zinc-50 dark:hover:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 transition-all hover:-translate-y-1 hover:shadow-sm group">
              <h4 className="font-bold text-black dark:text-white mb-1 group-hover:text-accent transition-colors">Написати огляд</h4>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">Оцініть новий альбом або трек</p>
            </Link>
            <Link href="/admin-panel/articles/new?category=news" className="block w-full text-left p-5 rounded-2xl bg-white dark:bg-[#151515] hover:bg-zinc-50 dark:hover:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 transition-all hover:-translate-y-1 hover:shadow-sm group">
              <h4 className="font-bold text-black dark:text-white mb-1 group-hover:text-accent transition-colors">Додати новину</h4>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">Поділіться свіжими подіями зі світу музики</p>
            </Link>
            <Link href="/admin-panel/guide" className="block w-full text-left p-5 rounded-2xl bg-accent/5 dark:bg-accent/10 hover:bg-accent/10 dark:hover:bg-accent/20 border border-accent/20 transition-all hover:-translate-y-1 hover:shadow-sm group mt-8">
              <h4 className="font-bold text-accent mb-1 flex items-center gap-2"><Star size={14} className="animate-spin-slow" /> Довідник</h4>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">Як форматувати статті та додавати медіа</p>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
