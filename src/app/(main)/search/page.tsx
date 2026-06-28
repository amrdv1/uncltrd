import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  
  let results: any[] = [];
  if (query.trim()) {
    // Fetch all published articles and filter in memory for case-insensitive search
    const allArticles = await db.article.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: { category: true, author: true },
      orderBy: { createdAt: "desc" }
    });

    const lowerQuery = query.toLowerCase().trim();
    results = allArticles.filter(a => 
      a.title.toLowerCase().includes(lowerQuery) || 
      a.content.toLowerCase().includes(lowerQuery)
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-8">
      <h1 className="text-4xl font-black mb-8 font-serif uppercase tracking-tighter">
        Пошук: {query}
      </h1>
      
      {query.trim() === "" ? (
        <p className="text-zinc-500 text-lg">Введіть щось для пошуку в сайдбарі ліворуч.</p>
      ) : results.length === 0 ? (
        <p className="text-zinc-500 text-lg">Нічого не знайдено за запитом "{query}". Спробуйте інші слова.</p>
      ) : (
        <div className="space-y-8">
          {results.map((article) => (
            <article key={article.id} className="flex gap-6 group">
              <div className="w-1/3 aspect-[4/3] bg-zinc-200 relative overflow-hidden rounded-lg">
                {article.imageUrl ? (
                  <Image 
                    src={article.imageUrl} 
                    alt={article.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    unoptimized={article.imageUrl?.toLowerCase().endsWith('.gif')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold uppercase tracking-widest text-xs">
                    {article.category?.name || "Новина"}
                  </div>
                )}
              </div>
              <div className="w-2/3 flex flex-col justify-center">
                {article.category && (
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    {article.category.name}
                  </span>
                )}
                <h2 className="text-2xl font-bold mb-3 font-serif group-hover:text-black transition-colors line-clamp-2 leading-tight">
                  <Link href={`/article/${article.slug}`}>
                    {article.title}
                  </Link>
                </h2>
                <p className="text-zinc-600 line-clamp-2 text-sm">{article.content.substring(0, 150)}...</p>
                <div className="mt-4 text-xs text-zinc-400 font-medium">
                  {article.createdAt.toLocaleDateString("uk-UA")} • {article.author.name || article.author.email}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
