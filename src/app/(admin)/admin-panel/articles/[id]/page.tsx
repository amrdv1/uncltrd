import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Key } from "lucide-react";
import { updateArticle, grantEditPermission, deleteArticle } from "@/app/actions/articles";
import { MediaInputManager } from "@/components/admin/MediaInputManager";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { TrackReviewManager } from "@/components/admin/TrackReviewManager";
import { FadeIn } from "@/components/ui/FadeIn";

export default async function EditArticlePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const article = await db.article.findUnique({
    where: { id: params.id },
    include: { allowedEditors: true, author: true, media: true, trackReview: true }
  });

  if (!article) notFound();

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  const isAuthor = article.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  const isAllowedEditor = article.allowedEditors.some(e => e.id === session.user.id);

  if (!isAuthor && !isAdmin && !isAllowedEditor) {
    return (
      <div className="p-8 text-center text-red-600">
        You do not have permission to view or edit this article.
      </div>
    );
  }

  // Bind the article ID to the update action
  const updateArticleWithId = updateArticle.bind(null, article.id);
  const grantPermissionWithId = grantEditPermission.bind(null, article.id);

  return (
    <FadeIn className="max-w-4xl mx-auto pb-12">
      <div className="mb-12">
        <Link href="/admin-panel/articles" className="inline-flex items-center text-zinc-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold mb-6">
          <ArrowLeft size={14} className="mr-2" />
          В Усі Статті
        </Link>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)"}}>Редагувати {article.isTrackReview ? "Огляд" : "Статтю"}</h1>
        <p className="text-zinc-500 mt-2 font-medium">Автор: {article.author.name || article.author.email}</p>
      </div>

      <div className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full pointer-events-none" />
        <form action={updateArticleWithId} className="space-y-8 relative z-10">
          {article.isTrackReview ? (
            <input type="hidden" name="title" value={article.title} />
          ) : (
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Заголовок</label>
              <input 
                name="title" 
                type="text" 
                defaultValue={article.title}
                required 
                className="w-full px-5 py-4 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white text-xl font-bold transition-colors" 
              />
            </div>
          )}

          {!article.isTrackReview ? (
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">URL Обкладинки (Необов'язково)</label>
              <ImageUploadField 
                name="imageUrl" 
                defaultValue={article.imageUrl || ""}
                className="w-full px-5 py-4 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white transition-colors" 
              />
            </div>
          ) : (
            <input type="hidden" name="imageUrl" value={article.imageUrl || ""} />
          )}

          {article.isTrackReview && (
            <div className="mb-6">
              <TrackReviewManager 
                initialData={{
                  ...article.trackReview, 
                  articleId: article.id,
                  listenUrl: article.media.find(m => !m.url.includes('apple.com') && !m.url.includes('youtube.com') && !m.url.includes('youtu.be'))?.url || article.media.find(m => m.type === 'AUDIO')?.url || "",
                  appleUrl: article.media.find(m => m.url.includes('apple.com'))?.url || "",
                  youtubeUrl: article.media.find(m => m.url.includes('youtube.com') || m.url.includes('youtu.be'))?.url || ""
                }} 
                forceReview={true} 
              />
            </div>
          )}

          {!article.isTrackReview && (
            <input type="hidden" name="isTrackReview" value="false" />
          )}

          <div className="bg-zinc-50 dark:bg-[#151515] p-8 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-inner">
            <h3 className="font-bold uppercase tracking-widest text-[10px] text-zinc-500 mb-4">Галерея / Медіа</h3>
            <MediaInputManager initialMedia={article.media} />
          </div>

          {!article.isTrackReview ? (
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Категорія</label>
              <select 
                name="categoryId" 
                defaultValue={article.categoryId || ""}
                className="w-full px-5 py-4 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white font-medium transition-colors appearance-none"
              >
                <option value="">Без категорії</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" name="categoryId" value={article.categoryId || ""} />
          )}

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest flex justify-between">
              <span>Текст</span>
              <span className="text-zinc-500 dark:text-zinc-600 font-normal normal-case tracking-normal">Підтримується Markdown</span>
            </label>
            <textarea 
              name="content" 
              defaultValue={article.content}
              required 
              rows={15}
              className="w-full px-5 py-4 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white transition-colors resize-y font-mono text-sm leading-relaxed" 
            />
          </div>

          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800/50 flex flex-col sm:flex-row justify-end items-center gap-4">
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white hover:scale-105 transition-all text-xs"
            >
              Зберегти Зміни
            </button>
          </div>
        </form>
      </div>

      {/* Permissions Section (Only visible to Author and Admin) */}
      {(isAuthor || isAdmin) && (
        <div className="bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full pointer-events-none" />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white mb-8 flex items-center space-x-3 relative z-10" style={{ fontFamily: "var(--font-space-grotesk)"}}>
            <span className="bg-accent/10 text-accent p-2 rounded-xl"><Key size={20} /></span>
            <span>Доступ Редакторів</span>
          </h2>
          
          <div className="mb-10 relative z-10">
            <h3 className="text-[10px] font-bold text-zinc-500 mb-4 uppercase tracking-widest">Дозволені редактори:</h3>
            {article.allowedEditors.length === 0 ? (
              <p className="text-xs text-zinc-500 font-medium">Інші редактори не мають доступу до цієї статті.</p>
            ) : (
              <ul className="space-y-3">
                {article.allowedEditors.map(editor => (
                  <li key={editor.id} className="text-sm px-5 py-4 bg-zinc-50 dark:bg-[#151515] rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center group">
                    <span className="font-bold text-black dark:text-white">{editor.name || editor.email}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest bg-zinc-200 dark:bg-[#222] px-3 py-1 rounded-full">{editor.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800/50 pt-8 relative z-10">
            <h3 className="text-[10px] font-bold text-zinc-500 mb-4 uppercase tracking-widest">Надати доступ іншому редактору</h3>
            <form action={grantPermissionWithId} className="flex flex-col sm:flex-row gap-4">
              <input 
                name="editorEmail" 
                type="email" 
                required
                placeholder="editor@uncultured.media"
                className="flex-1 px-5 py-4 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white font-medium transition-colors"
              />
              <button type="submit" className="bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white hover:scale-[1.02] transition-all text-xs">
                Надати
              </button>
            </form>
          </div>
        </div>
      )}
    </FadeIn>
  );
}
