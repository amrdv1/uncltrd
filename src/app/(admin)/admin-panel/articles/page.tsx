import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Plus, Edit2, Trash2, Pin, Search } from "lucide-react";
import { deleteArticle } from "@/app/actions/articles";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { PinButton } from "@/components/ui/PinButton";
import { FadeIn } from "@/components/ui/FadeIn";

export default async function AdminArticlesPage(props: { searchParams?: Promise<{ tab?: string, q?: string }> }) {
  const session = await auth();
  if (!session?.user) return null;

  const searchParams = props.searchParams ? await props.searchParams : {};
  const tab = searchParams.tab || 'all';
  const q = searchParams.q || '';

  const isAdmin = session.user.role === "ADMIN";
  const userId = session.user.id;

  // Admins see all, Editors see all but we can highlight their own, or let's just fetch all 
  // but only let them edit ones they own or have permission to
  const articles = await db.article.findMany({
    where: {
      ...(tab === 'reviews' ? { isTrackReview: true } : tab === 'articles' ? { isTrackReview: false } : {}),
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {})
    },
    include: {
      author: true,
      allowedEditors: true,
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <FadeIn className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)"}}>
          Статті<span className="text-accent">.</span>
        </h1>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin-panel/articles/new" 
            className="bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-accent dark:hover:text-white transition-all flex items-center space-x-2 text-sm shadow-sm hover:scale-105"
          >
            <Plus size={16} />
            <span>Нова Стаття</span>
          </Link>
          <Link 
            href="/admin-panel/articles/new-review" 
            className="bg-accent text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-[#ff1a53] transition-all flex items-center space-x-2 text-sm shadow-sm hover:scale-105"
          >
            <Plus size={16} />
            <span>Новий Огляд</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-6">
          <Link href={`?tab=all${q ? `&q=${q}` : ''}`} className={`font-bold uppercase tracking-widest text-xs pb-3 border-b-2 transition-colors -mb-[1px] ${tab === 'all' ? 'border-accent text-black dark:text-white' : 'border-transparent text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white'}`}>
            Всі матеріали
          </Link>
          <Link href={`?tab=articles${q ? `&q=${q}` : ''}`} className={`font-bold uppercase tracking-widest text-xs pb-3 border-b-2 transition-colors -mb-[1px] ${tab === 'articles' ? 'border-accent text-black dark:text-white' : 'border-transparent text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white'}`}>
            Статті
          </Link>
          <Link href={`?tab=reviews${q ? `&q=${q}` : ''}`} className={`font-bold uppercase tracking-widest text-xs pb-3 border-b-2 transition-colors -mb-[1px] ${tab === 'reviews' ? 'border-accent text-black dark:text-white' : 'border-transparent text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white'}`}>
            Огляди
          </Link>
        </div>
        
        <form method="GET" action="/admin-panel/articles" className="relative w-full sm:w-auto pb-2 sm:-mb-[1px]">
          {tab !== 'all' && <input type="hidden" name="tab" value={tab} />}
          <Search size={14} className="absolute left-3 top-2.5 sm:top-2 text-zinc-400" />
          <input 
            type="text" 
            name="q"
            defaultValue={q}
            placeholder="ПОШУК..." 
            className="pl-9 pr-4 py-1.5 text-xs font-bold tracking-widest uppercase bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:border-accent focus:bg-white dark:focus:bg-black transition-all w-full sm:w-48 placeholder:text-zinc-400"
          />
        </form>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-zinc-50 dark:bg-[#151515] border-b border-zinc-200 dark:border-zinc-800/50 text-zinc-500">
            <tr>
              <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Заголовок</th>
              <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Автор</th>
              <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Статус</th>
              <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Дата</th>
              <th className="p-6 font-bold uppercase tracking-widest text-[10px] text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {articles.map(article => {
              const isAuthor = article.authorId === userId;
              const isAllowed = article.allowedEditors.some(e => e.id === userId);
              const canEdit = isAdmin || isAuthor || isAllowed;

              return (
                <tr key={article.id} className="hover:bg-zinc-50 dark:hover:bg-[#1a1a1a] transition-colors group">
                  <td className="p-6 font-bold text-black dark:text-white group-hover:text-accent transition-colors">
                    <div className="flex flex-col gap-1.5 items-start">
                      {article.isTrackReview ? (
                        <span className="text-[8px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">Огляд</span>
                      ) : (
                        <span className="text-[8px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">Стаття</span>
                      )}
                      <div className="flex items-center gap-2">
                        <Link href={`/admin-panel/articles/${article.id}`} className="hover:underline hover:text-[#2A75FF] transition-colors">
                          {article.title}
                        </Link>
                        {article.isPinned && (
                          <Pin size={14} className="text-accent shrink-0" fill="currentColor" />
                        )}
                      </div>
                    </div>
                    {isAllowed && !isAuthor && !isAdmin && (
                      <span className="mt-1 inline-block text-[9px] font-black uppercase tracking-widest bg-lime-500/10 text-lime-500 px-2 py-0.5 rounded-full border border-lime-500/20">Спільний доступ</span>
                    )}
                  </td>
                  <td className="p-6 text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest text-xs">{article.author.name || article.author.email}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 text-[9px] rounded-full font-black uppercase tracking-widest border ${article.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-500 dark:border-green-500/20' : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20'}`}>
                      {article.status === 'PUBLISHED' ? 'Опубліковано' : 'Чернетка'}
                    </span>
                  </td>
                  <td className="p-6 text-zinc-500 font-medium uppercase tracking-widest text-xs">{article.createdAt.toLocaleDateString("uk-UA")}</td>
                  <td className="p-6 text-right flex justify-end items-center gap-2">
                    {canEdit ? (
                      <>
                        <PinButton articleId={article.id} isPinned={article.isPinned} />
                        <Link href={`/admin-panel/articles/${article.id}`} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-white/10 rounded-full transition-colors" title="Редагувати">
                          <Edit2 size={18} />
                        </Link>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 italic py-2">Немає доступу</span>
                    )}
                    
                    {(isAdmin || isAuthor) && (
                      <ConfirmDeleteButton 
                        onConfirm={deleteArticle.bind(null, article.id)} 
                        itemType="цю статтю" 
                      />
                    )}
                  </td>
                </tr>
              )
            })}
            
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-zinc-500 font-medium">
                  Ще немає статей. Створіть першу!
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </FadeIn>
  )
}
