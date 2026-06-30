import { Metadata } from "next";
import { db } from "@/lib/db";
import { StoryCard } from "@/components/ui/StoryCard";
import { TrackCard } from "@/components/ui/TrackCard";
import { Carousel } from "@/components/ui/Carousel";
import { notFound, redirect } from "next/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedTabs } from "@/components/ui/AnimatedTabs";
import { AnimatedTabContent } from "@/components/ui/AnimatedTabContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const siteUrl = "https://uncultured.media";
  const url = `${siteUrl}/category/${slug}`;
  
  const categories: Record<string, string> = {
    singles: "Сингли",
    albums: "Альбоми",
    clips: "Кліпи",
    reviews: "Огляди",
    playlists: "Плейлисти"
  };

  const title = categories[slug] ? categories[slug] : `Категорія ${slug}`;
  const description = categories[slug] 
    ? `Останні ${categories[slug].toLowerCase()} та новини на uncultured.`
    : `Усі матеріали з категорії ${slug} на uncultured.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    alternates: {
      canonical: url,
    }
  };
}

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

  if (category.slug === "news" || category.name.toLowerCase() === "новини") {
    redirect("/news");
  }

  const isReviewsCategory = category.slug === "reviews" || category.name.toLowerCase() === "огляди";
  
  const session = await auth();
  const userRole = session?.user?.role || "USER";
  const isAdminOrEditor = userRole === "ADMIN" || userRole === "EDITOR";
  
  // Date calculation for the current week's release cycle
  // Use Kyiv timezone to avoid UTC offset issues
  const nowStr = new Date().toLocaleString("en-US", { timeZone: "Europe/Kyiv" });
  const currentDate = new Date(nowStr);
  
  const currentDayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay(); // 1 (Mon) to 7 (Sun)
  const isBeforeFriday = currentDayOfWeek >= 1 && currentDayOfWeek <= 4; 
  
  const parsedOffset = parseInt(searchParams.offset as string) || 0;
  const weekOffset = Math.max(Math.min(parsedOffset, 0), -3);
  const isRestrictedWeekView = isReviewsCategory && isBeforeFriday && weekOffset === 0 && !isAdminOrEditor;

  const viewParam = (searchParams.view as string) || "all"; // "all" or "week"
  const sortParam = (searchParams.sort as string) || "newest";
  const typeParam = (searchParams.type as string) || "ALL";
  const searchParam = (searchParams.q as string) || "";
  const yearParam = (searchParams.year as string) || "ALL";

  const buildHref = (view: string, type: string, offset?: number) => {
    let url = `?view=${view}&type=${type}`;
    if (view === "all" && sortParam !== "newest") url += `&sort=${sortParam}`;
    if (view === "all" && yearParam !== "ALL") url += `&year=${yearParam}`;
    if (searchParam) url += `&q=${encodeURIComponent(searchParam)}`;
    const finalOffset = offset !== undefined ? offset : weekOffset;
    if (finalOffset !== 0) url += `&offset=${finalOffset}`;
    return url;
  };

  const whereClause: any = { status: "PUBLISHED" };
  
  if (category.slug === 'news') {
    whereClause.isTrackReview = false;
  } else {
    whereClause.categoryId = category.id;
  }

  const daysSinceMonday = currentDayOfWeek - 1;

  const monday = new Date(currentDate);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - daysSinceMonday + (weekOffset * 7));

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const formattedFriday = friday.toLocaleDateString("uk-UA");

  let orderBy: any = { createdAt: "desc" };

  if (isReviewsCategory) {
    orderBy = { trackReview: { releaseDate: "desc" } };
  }

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
      if (sortParam === "oldest") orderBy = { trackReview: { releaseDate: "asc" } };
      // "best" and "worst" will be sorted in JS after fetching to ensure they match the dynamically calculated scores.
      
      if (yearParam !== "ALL") {
        const year = parseInt(yearParam);
        if (!isNaN(year)) {
          whereClause.trackReview = {
            ...whereClause.trackReview,
            releaseDate: {
              gte: new Date(`${year}-01-01T00:00:00.000Z`),
              lte: new Date(`${year}-12-31T23:59:59.999Z`)
            }
          };
        }
      }
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

  let articles = await db.article.findMany({
    where: whereClause,
    orderBy,
    include: { 
      author: true, 
      category: true, 
      trackReview: true,
      userRatings: {
        include: { user: true }
      },
      _count: {
        select: { comments: true, likes: true }
      }
    },
  });

  if (isReviewsCategory && viewParam === "all") {
    if (sortParam === "best" || sortParam === "worst") {
      articles.sort((a, b) => {
        const getScore = (article: any) => {
          let admScore = article.trackReview?.adminTotal || 0;
          const adminRatings = article.userRatings?.filter((r: any) => r.user?.role === 'ADMIN') || [];
          if (adminRatings.length > 0) {
            const sum = adminRatings.reduce((acc: number, r: any) => acc + (r.text + r.beats + r.sound + r.vibe + r.charisma), 0);
            admScore = Math.round(sum / adminRatings.length);
          }
          return admScore;
        };
        const scoreA = getScore(a);
        const scoreB = getScore(b);
        
        if (scoreA === scoreB) {
          // fallback to release date
          const dateA = a.trackReview?.releaseDate?.getTime() || 0;
          const dateB = b.trackReview?.releaseDate?.getTime() || 0;
          return dateB - dateA; // always newer first for ties
        }
        
        return sortParam === "best" ? scoreB - scoreA : scoreA - scoreB;
      });
    }
  }

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
          <AnimatedTabs
            defaultTabId="all"
            tabs={[
              { id: "all", label: "Усі огляди", href: buildHref("all", typeParam) },
              { id: "week", label: `Релізи (${formattedFriday})`, href: buildHref("week", typeParam) }
            ]}
          />
        )}

        <AnimatedTabContent viewKey={viewParam}>
          {isReviewsCategory && (
            <>
              {viewParam === "week" ? (
              <div className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors w-full">
                {/* Week Navigation */}
                <div className="flex items-center gap-4 bg-white dark:bg-black rounded-full border border-zinc-200 dark:border-zinc-800 p-1 w-full xl:w-auto justify-between xl:justify-start">
                  <Link href={buildHref("week", typeParam, Math.min(weekOffset + 1, 0))} className={`p-2 rounded-full transition-colors ${weekOffset === 0 ? "opacity-30 pointer-events-none text-zinc-500" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white"}`}>
                    <ChevronLeft size={16} />
                  </Link>
                  <span className="font-bold uppercase tracking-widest text-[10px] min-w-[100px] text-center">
                    {weekOffset === 0 ? "Цей тиждень" : weekOffset === -1 ? "Минулий тиждень" : `${Math.abs(weekOffset)} тижнів тому`}
                  </span>
                  <Link href={buildHref("week", typeParam, Math.max(weekOffset - 1, -3))} className={`p-2 rounded-full transition-colors ${weekOffset <= -3 ? "opacity-30 pointer-events-none text-zinc-500" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white"}`}>
                    <ChevronRight size={16} />
                  </Link>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full xl:w-auto mt-4 xl:mt-0">
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

                    <select name="year" defaultValue={yearParam} className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-black dark:text-white px-4 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs outline-none focus:border-black dark:focus:border-white transition-colors w-full sm:w-auto cursor-pointer">
                      <option value="ALL">Всі роки</option>
                      {Array.from({ length: currentDate.getFullYear() - 2021 }, (_, i) => currentDate.getFullYear() - i).map(year => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>

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

        {isRestrictedWeekView && viewParam === "week" ? (
          <div className="py-24 text-center">
            <div className="inline-block p-6 bg-zinc-100 dark:bg-zinc-900 rounded-3xl mb-4">
              <Lock size={32} className="text-zinc-400" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter font-serif mb-2">Ця вкладка відкриється у п'ятницю</h3>
            <p className="text-zinc-500 font-medium">Поки що ви можете переглянути усі огляди!</p>
            <Link href={buildHref("all", "ALL")} className="mt-8 inline-block bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-transform hover:scale-105">
              Дивитись усі огляди
            </Link>
          </div>
        ) : articles.length > 0 ? (
          category.slug === "news" || category.name.toLowerCase() === "новини" || (isReviewsCategory && viewParam === "week") ? (
            <div className="w-full">
              <Carousel itemWidth={300} className="w-full">
                {articles.map((article, i) => (
                  <FadeIn key={article.id} delay={(i % 12) * 0.1} className="w-full h-full flex">
                    {article.isTrackReview && article.trackReview ? (() => {
                      let pubScore = article.trackReview?.totalScore || 0;
                      let admScore = (article.trackReview as any)?.adminTotal || 0;
                      
                      const adminRatings = article.userRatings?.filter((r: any) => r.user?.role === 'ADMIN') || [];
                      if (adminRatings.length > 0) {
                        const sum = adminRatings.reduce((acc: number, r: any) => acc + (r.text + r.beats + r.sound + r.vibe + r.charisma), 0);
                        admScore = Math.round(sum / adminRatings.length);
                      }
                      
                      const publicRatings = article.userRatings?.filter((r: any) => r.user?.role !== 'ADMIN') || [];
                      if (publicRatings.length > 0) {
                        const sumText = publicRatings.reduce((sum: number, r: any) => sum + r.text, 0) / publicRatings.length;
                        const sumBeats = publicRatings.reduce((sum: number, r: any) => sum + r.beats, 0) / publicRatings.length;
                        const sumSound = publicRatings.reduce((sum: number, r: any) => sum + r.sound, 0) / publicRatings.length;
                        const sumVibe = publicRatings.reduce((sum: number, r: any) => sum + r.vibe, 0) / publicRatings.length;
                        const sumCharisma = publicRatings.reduce((sum: number, r: any) => sum + r.charisma, 0) / publicRatings.length;
                        pubScore = Math.round(sumText + sumBeats + sumSound + sumVibe + sumCharisma);
                      }

                      return (
                        <TrackCard
                          title={article.trackReview!.trackName}
                          artist={article.trackReview!.artistName}
                          coverUrl={article.trackReview!.coverUrl || "https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=1600"}
                          slug={article.slug}
                          publicScore={publicRatings.length > 0 ? pubScore : undefined}
                          adminScore={adminRatings.length > 0 || admScore > 0 ? admScore : undefined}
                          listenUrl={article.trackReview!.listenUrl || undefined}
                        />
                      );
                    })() : (
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
                    {article.isTrackReview && article.trackReview ? (() => {
                      let pubScore = article.trackReview?.totalScore || 0;
                      let admScore = (article.trackReview as any)?.adminTotal || 0;
                      
                      const adminRatings = article.userRatings?.filter((r: any) => r.user?.role === 'ADMIN') || [];
                      if (adminRatings.length > 0) {
                        const sum = adminRatings.reduce((acc: number, r: any) => acc + (r.text + r.beats + r.sound + r.vibe + r.charisma), 0);
                        admScore = Math.round(sum / adminRatings.length);
                      }
                      
                      const publicRatings = article.userRatings?.filter((r: any) => r.user?.role !== 'ADMIN') || [];
                      if (publicRatings.length > 0) {
                        const sumText = publicRatings.reduce((sum: number, r: any) => sum + r.text, 0) / publicRatings.length;
                        const sumBeats = publicRatings.reduce((sum: number, r: any) => sum + r.beats, 0) / publicRatings.length;
                        const sumSound = publicRatings.reduce((sum: number, r: any) => sum + r.sound, 0) / publicRatings.length;
                        const sumVibe = publicRatings.reduce((sum: number, r: any) => sum + r.vibe, 0) / publicRatings.length;
                        const sumCharisma = publicRatings.reduce((sum: number, r: any) => sum + r.charisma, 0) / publicRatings.length;
                        pubScore = Math.round(sumText + sumBeats + sumSound + sumVibe + sumCharisma);
                      }

                      return (
                        <TrackCard
                          title={article.trackReview!.trackName}
                          artist={article.trackReview!.artistName}
                          coverUrl={article.trackReview!.coverUrl || "https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=1600"}
                          slug={article.slug}
                          publicScore={publicRatings.length > 0 ? pubScore : undefined}
                          adminScore={adminRatings.length > 0 || admScore > 0 ? admScore : undefined}
                          listenUrl={article.trackReview!.listenUrl || undefined}
                        />
                      );
                    })() : (
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
            </AnimatedTabContent>
      </div>
    </div>
  );
}
