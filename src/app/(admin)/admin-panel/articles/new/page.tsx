import { createArticle } from "@/app/actions/articles";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { MediaInputManager } from "@/components/admin/MediaInputManager";
import { FadeIn } from "@/components/ui/FadeIn";

export default async function NewArticlePage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  return (
    <FadeIn className="max-w-4xl mx-auto pb-12">
      <div className="mb-12">
        <Link href="/admin-panel/articles" className="inline-flex items-center text-zinc-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold mb-6">
          <ArrowLeft size={14} className="mr-2" />
          В Усі Статті
        </Link>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)"}}>Створити Новину / Статтю<span className="text-accent">.</span></h1>
        <p className="text-zinc-500 mt-2 font-medium">Звичайна публікація без рейтингів та оцінок.</p>
      </div>

      <div className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full pointer-events-none" />
        <form action={createArticle} className="space-y-8 relative z-10">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Заголовок</label>
            <input 
              name="title" 
              type="text" 
              required 
              className="w-full px-5 py-4 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white text-xl font-bold transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-700" 
              placeholder="Наприклад: Новий альбом вже в мережі!"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">URL Обкладинки (Необов'язково)</label>
            <input 
              name="imageUrl" 
              type="url" 
              className="w-full px-5 py-4 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-700" 
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase tracking-widest">Рекомендується співвідношення сторін 21:9 або 16:9 для новин.</p>
          </div>

          <div className="bg-zinc-50 dark:bg-[#151515] p-8 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-inner">
            <h3 className="font-bold uppercase tracking-widest text-[10px] text-zinc-500 mb-4">Галерея / Медіа (Необов'язково)</h3>
            <MediaInputManager />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Категорія</label>
            <select 
              name="categoryId" 
              className="w-full px-5 py-4 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white transition-colors appearance-none font-medium"
            >
              <option value="">Без категорії</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest flex justify-between">
              <span>Текст Статті</span>
              <span className="text-zinc-500 dark:text-zinc-600 font-normal normal-case tracking-normal">Підтримується Markdown та [media:N]</span>
            </label>
            <textarea 
              name="content" 
              rows={15} 
              required 
              className="w-full px-5 py-4 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white transition-colors resize-y font-mono text-sm leading-relaxed" 
              placeholder="Сьогодні ми поговоримо про...&#10;&#10;[media:1]&#10;&#10;Як бачите..."
            />
          </div>

          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" name="isDraft" className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-800 text-accent focus:ring-accent bg-zinc-50 dark:bg-[#151515] transition-colors" />
              <span className="font-bold uppercase tracking-widest text-[10px] text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors">Зберегти як чернетку</span>
            </label>
            
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white hover:scale-105 transition-all text-xs"
            >
              Опублікувати
            </button>
          </div>
        </form>
      </div>
    </FadeIn>
  )
}
