import { db } from "@/lib/db";
import { StoryCard } from "@/components/ui/StoryCard";
import { TrackCard } from "@/components/ui/TrackCard";
import { Carousel } from "@/components/ui/Carousel";
import { notFound } from "next/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import Link from "next/link";

export default async function CategoryPage(props: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const decodedSlug = decodeURIComponent(params.slug);

  const category = await db.category.findUnique({
    where: { slug: decodedSlug },
  });

  if (!category) {
    notFound();
  }

  const isReviewsCategory = category.slug === "reviews" || category.name.toLowerCase() === "огляди";
  
  const viewParam = (searchParams.view as string) || "week"; // "week" or "all"
  const sortParam = (searchParams.sort as string) || "newest";
  const typeParam = (searchParams.type as string) || "ALL";
  const searchParam = (searchParams.q as string) || "";

  const buildHref = (view: string, type: string) => {
    let url = `?view=${view}&type=${type}`;
    if (view === "all" && sortParam !== "newest") url += `&sort=${sortParam}`;
    if (searchParam) url += `&q=${encodeURIComponent(searchParam)}`;
    return url;
  };

  const whereClause: any = { status: "PUBLISHED" };
  
  if (category.slug === 'news') {
    whereClause.isTrackReview = false;
  } else {
    whereClause.categoryId = category.id;
  }

  // Date calculation for the current week's release cycle
  // Use Kyiv timezone to avoid UTC offset issues
  const nowStr = new Date().toLocaleString("en-US", { timeZone: "Europe/Kyiv" });
  const now = new Date(nowStr);

  // Advance by 2 days so that Saturday and Sunday belong to the NEXT week's release cycle (since Friday is release day)
  now.setDate(now.getDate() + 2);

  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1 (Mon) to 7 (Sun)
  const daysSinceMonday = dayOfWeek - 1;

  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - daysSinceMonday);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const formattedFriday = friday.toLocaleDateString("uk-UA");

  let orderBy: any = { createdAt: "desc" };

  if (isReviewsCategory) {
    if (viewParam === "week") {
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      // Filter by the track's actual release date being this week
      whereClause.trackReview = {
        releaseDate: {
          gte: monday,
          lte: sunday
        }
      };
    } else {
      // view === "all"
      if (sortParam === "oldest") orderBy = { createdAt: "asc" };
      else if (sortParam === "best") orderBy = { trackReview: { adminTotal: "desc" } };
      else if (sortParam === "worst") orderBy = { trackReview: { adminTotal: "asc" } };
    }

    if (typeParam !== "ALL") {
      whereClause.trackReview = {
        ...whereClause.trackReview,
        releaseType: typeParam
      };
    }

    if (searchParam) {
      whereClause.trackReview = {
        ...whereClause.trackReview,
        OR: [
          { trackName: { contains: searchParam } },
          { artistName: { contains: searchParam } }
        ]
      };
    }
  }

  const articles = await db.article.findMany({
    where: whereClause,
    orderBy,
    include: { 
      author: true, 
      category: true, 
      trackReview: true,
      _count: {
        select: { comments: true, likes: true }
      }
    },
  });

  return (
    <div className="flex flex-col pb-24">
      <section className="bg-white dark:bg-transparent border-b-2 border-zinc-200 dark:border-white/10 pt-12 pb-8 px-4 md:px-6 lg:px-12 mb-8 transition-colors">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter font-serif text-black dark:text-white transition-colors" style={{ fontFamily: "var(--font-space-grotesk)"}}>
            {category.name}<span className="text-accent">.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 font-medium pb-2">
            Всі матеріали в категорії.
          </p>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-12 w-full">
        {isReviewsCategory && (
          <>
            <div className="flex flex-wrap gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800">
              <Link href={buildHref("week", typeParam)} className={`pb-4 px-2 md:px-6 font-bold uppercase tracking-widest text-xs md:text-sm border-b-2 transition-colors ${viewParam === "week" ? "border-black dark:border-white text-black dark:text-white" : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"}`}>
                Релізи ({formattedFriday})
              </Link>
              <Link href={buildHref("all", typeParam)} className={`pb-4 px-2 md:px-6 font-bold uppercase tracking-widest text-xs md:text-sm border-b-2 transition-colors ${viewParam === "all" ? "border-black dark:border-white text-black dark:text-white" : "border-transparent text-zinc-500 hover:text-black dark:hover:text-white"}`}>
                Усі огляди
              </Link>
            </div>

            {viewParam === "week" ? (
              <div className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors w-full">
                <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                  <Link href={buildHref("week", "ALL")} className={`px-5 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs transition-colors ${typeParam === "ALL" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"}`}>Всі</Link>
                  <Link href={buildHref("week", "ALBUM")} className={`px-5 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs transition-colors ${typeParam === "ALBUM" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"}`}>Альбоми</Link>
                  <Link href={buildHref("week", "EP")} className={`px-5 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs transition-colors ${typeParam === "EP" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"}`}>EP</Link>
                  <Link href={buildHref("week", "SINGLE")} className={`px-5 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs transition-colors ${typeParam === "SINGLE" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"}`}>Сингли</Link>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0">
                  <form action="" method="get" className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input type="hidden" name="view" value="week" />
                    <input type="hidden" name="type" value={typeParam} />
                    
                    <input 
                      type="text" 
                      name="q" 
                      defaultValue={searchParam} 
                      placeholder="ПОШУК..."
                      className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white px-4 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs outline-none focus:border-black dark:focus:border-white transition-colors w-full sm:w-64 placeholder:text-zinc-400"
                    />

                    <button type="submit" className="w-full sm:w-auto bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">ОК</button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors w-full">
                <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                  <Link href={buildHref("all", "ALL")} className={`px-5 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs transition-colors ${typeParam === "ALL" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"}`}>Всі</Link>
                  <Link href={buildHref("all", "ALBUM")} className={`px-5 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs transition-colors ${typeParam === "ALBUM" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"}`}>Альбоми</Link>
                  <Link href={buildHref("all", "EP")} className={`px-5 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs transition-colors ${typeParam === "EP" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"}`}>EP</Link>
                  <Link href={buildHref("all", "SINGLE")} className={`px-5 py-2.5 rounded-full font-bold uppercase tracking-widest text-xs transition-colors ${typeParam === "SINGLE" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"}`}>Сингли</Link>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0">
                  <form action="" method="get" className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input type="hidden" name="view" value="all" />
                    <input type="hidden" name="type" value={typeParam} />
                    
                    <input 
                      type="text" 
                      name="q" 
                      defaultValue={searchParam} 
                      placeholder="ПОШУК..."
                      className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white px-4 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs outline-none focus:border-black dark:focus:border-white transition-colors w-full sm:w-64 placeholder:text-zinc-400"
                    />

                    <select name="sort" defaultValue={sortParam} className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white px-4 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs outline-none focus:border-black dark:focus:border-white transition-colors w-full sm:w-auto cursor-pointer">
                      <option value="newest">Найновіші</option>
                      <option value="oldest">Найстаріші</option>
                      <option value="best">Найкращі</option>
                      <option value="worst">Найгірші</option>
                    </select>
                    
                    <button type="submit" className="w-full sm:w-auto bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">ОК</button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {articles.length > 0 ? (
          category.slug === "news" || category.name.toLowerCase() === "новини" || (isReviewsCategory && viewParam === "week") ? (
            <div className="w-full">
              <Carousel itemWidth={300} className="w-full">
                {articles.map((article, i) => (
                  <FadeIn key={article.id} delay={(i % 12) * 0.1} className="w-full h-full flex">
                    {article.isTrackReview && article.trackReview ? (
                      <TrackCard
                        title={article.trackReview.trackName}
                        artist={article.trackReview.artistName}
                        coverUrl={article.trackReview.coverUrl || "https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=1600"}
                        slug={article.slug}
                        publicScore={Math.round(article.trackReview.totalScore || 0)}
                        adminScore={Math.round((article.trackReview as any).adminTotal || 0)}
                      />
                    ) : (
                      <StoryCard
                        size="carousel"
                        category={article.category?.name || "Новина"}
                        title={article.title}
                        image={article.imageUrl || "https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=1600"}
                        date={article.createdAt.toLocaleDateString("uk-UA")}
                        slug={article.slug}
                      />
                    )}
                  </FadeIn>
                ))}
              </Carousel>
            </div>
          ) : (
            <div className="magazine-grid">
              {articles.map((article, i) => {
                const size = i % 3 === 0 ? "medium" : "small";
                const colSpan = i % 3 === 0 ? "col-span-12 md:col-span-6 lg:col-span-4" : "col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-4";

                return (
                  <FadeIn key={article.id} delay={(i % 12) * 0.1} className={colSpan}>
                    {article.isTrackReview && article.trackReview ? (
                      <TrackCard
                        title={article.trackReview.trackName}
                        artist={article.trackReview.artistName}
                        coverUrl={article.trackReview.coverUrl || "https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=1600"}
                        slug={article.slug}
                        publicScore={Math.round(article.trackReview.totalScore || 0)}
                        adminScore={Math.round((article.trackReview as any).adminTotal || 0)}
                      />
                    ) : (
                      <StoryCard
                        size={size}
                        category={article.category?.name || "Новина"}
                        title={article.title}
                        image={article.imageUrl || "https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=1600"}
                        date={article.createdAt.toLocaleDateString("uk-UA")}
                        slug={article.slug}
                      />
                    )}
                  </FadeIn>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-20 text-xl text-zinc-500 font-medium">
            У цій категорії поки немає публікацій.
          </div>
        )}
      </div>
    </div>
  );
}
