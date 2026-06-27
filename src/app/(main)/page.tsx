import { db } from "@/lib/db";
import { StoryCard } from "@/components/ui/StoryCard";
import { TrackCard } from "@/components/ui/TrackCard";
import { Carousel } from "@/components/ui/Carousel";
import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1510915361894-faa8b6332f2f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1520095972714-909e91b05382?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1470229722913-7c090be5c520?auto=format&fit=crop&q=80&w=800",
];

export default async function Home() {
  // 48 hours ago
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const articles = await db.article.findMany({
    where: { 
      status: "PUBLISHED", 
      isTrackReview: false,
      OR: [
        { isPinned: true },
        { createdAt: { gte: twoDaysAgo } }
      ]
    },
    include: { category: true, author: true, trackReview: true },
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" }
    ],
    take: 20
  });

  const reviews = await db.article.findMany({
    where: { status: "PUBLISHED", isTrackReview: true },
    include: { category: true, author: true, trackReview: true },
    orderBy: { createdAt: "desc" },
    take: 3
  });

  // Helper to get an article or fallback to a placeholder
  const getArticle = (index: number) => articles[index] || null;
  const formatDate = (date: Date) => date.toLocaleDateString("uk-UA");

  return (
    <div className="flex flex-col gap-12 md:gap-24 pb-24">
      {/* SECTION 1: Featured Story / Hero */}
      <section className="px-4 md:px-6 lg:px-12 pt-6">
        {articles.length > 0 && (
          <FadeIn>
            <StoryCard
              size="hero"
              category={articles[0].category?.name || "Новина"}
              title={articles[0].title}
              image={articles[0].isTrackReview && articles[0].trackReview?.coverUrl ? articles[0].trackReview.coverUrl : (articles[0].imageUrl || PLACEHOLDER_IMAGES[0])}
              date={formatDate(articles[0].createdAt)}
              author={articles[0].author.name || articles[0].author.email || undefined}
              slug={articles[0].slug}
              trackRating={articles[0].isTrackReview ? (articles[0].trackReview?.totalScore || 0) : undefined}
            />
          </FadeIn>
        )}
      </section>

      {/* SECTION 2: Latest News Feed */}
      <section className="px-4 md:px-6 lg:px-12">
        <div className="flex items-end justify-between gap-4 border-b-4 border-black pb-4 mb-6 md:mb-10">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter font-serif">Останні новини</h2>
          <Link href="/news" className="text-sm font-bold tracking-widest uppercase text-zinc-500 hover:text-black transition-colors shrink-0 whitespace-nowrap mb-1">Читати все</Link>
        </div>
        
        {/* Mobile Carousel View */}
        <div className="md:hidden">
          <Carousel>
            {[1, 2, 3, 4, 5].map((i, index) => {
              const article = getArticle(i);
              if (!article) return null;
              return (
                <StoryCard 
                  key={`mobile-${i}`}
                  size="large" 
                  category={article.category?.name || "Новина"} 
                  title={article.title} 
                  image={article.isTrackReview && article.trackReview?.coverUrl ? article.trackReview.coverUrl : (article.imageUrl || PLACEHOLDER_IMAGES[i])} 
                  date={formatDate(article.createdAt)} 
                  slug={article.slug}
                  trackRating={article.isTrackReview ? (article.trackReview?.totalScore || 0) : undefined}
                />
              )
            }).filter(Boolean)}
          </Carousel>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid grid-cols-12 gap-6">
          {/* 2 Large Articles (50% width each) */}
          {[1, 2].map((i, index) => {
            const article = getArticle(i);
            if (!article) return null;
            return (
              <FadeIn key={`desktop-large-${i}`} delay={index * 0.1} className="col-span-12 md:col-span-6">
                <StoryCard 
                  size="large" 
                  category={article.category?.name || "Новина"} 
                  title={article.title} 
                  image={article.isTrackReview && article.trackReview?.coverUrl ? article.trackReview.coverUrl : (article.imageUrl || PLACEHOLDER_IMAGES[i])} 
                  date={formatDate(article.createdAt)} 
                  slug={article.slug}
                  trackRating={article.isTrackReview ? (article.trackReview?.totalScore || 0) : undefined}
                />
              </FadeIn>
            )
          })}

          {/* 3 Medium Articles (33.3% width each) */}
          {[3, 4, 5].map((i, index) => {
            const article = getArticle(i);
            if (!article) return null;
            return (
              <FadeIn key={`desktop-medium-${i}`} delay={index * 0.1} className="col-span-12 md:col-span-4">
                <StoryCard 
                  size="medium" 
                  category={article.category?.name || "Культура"} 
                  title={article.title} 
                  image={article.isTrackReview && article.trackReview?.coverUrl ? article.trackReview.coverUrl : (article.imageUrl || PLACEHOLDER_IMAGES[i])} 
                  date={formatDate(article.createdAt)} 
                  slug={article.slug}
                  trackRating={article.isTrackReview ? (article.trackReview?.totalScore || 0) : undefined}
                />
              </FadeIn>
            )
          })}
        </div>
      </section>

      {/* SECTION 3: Latest Reviews (Compact) */}
      {reviews.length > 0 && (
        <section className="px-4 md:px-6 lg:px-12">
          <div className="flex items-end justify-between gap-4 border-b-4 border-black pb-4 mb-6 md:mb-10">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter font-serif">Останні 3 огляди</h2>
            <Link href="/category/reviews" className="text-sm font-bold tracking-widest uppercase text-zinc-500 hover:text-black transition-colors shrink-0 whitespace-nowrap mb-1">Більше оглядів</Link>
          </div>
          
          <div className="flex justify-start xl:justify-center">
            <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 hide-scrollbar snap-x snap-mandatory overscroll-x-contain touch-pan-x scroll-pl-4 sm:scroll-pl-0">
              {reviews.map((review, i) => (
                <FadeIn key={review.id} delay={i * 0.1} className="w-[65vw] sm:w-full shrink-0 snap-start flex">
                  {review.trackReview && (
                    <TrackCard
                      title={review.trackReview.trackName}
                      artist={review.trackReview.artistName}
                      coverUrl={review.trackReview.coverUrl || PLACEHOLDER_IMAGES[i]}
                      slug={review.slug}
                      publicScore={Math.round(review.trackReview.totalScore || 0)}
                      adminScore={Math.round((review.trackReview as any)?.adminTotal || 0)}
                      compact={true}
                    />
                  )}
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: Newsletter Banner */}
      <section className="px-4 md:px-6 lg:px-12">
        <div className="bg-black text-white p-8 md:p-12 lg:p-24 flex flex-col items-center text-center rounded-xl md:rounded-none w-full overflow-hidden">
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter font-serif mb-6 text-accent break-words w-full" style={{ fontFamily: "var(--font-space-grotesk)"}}>
            Приєднуйся до культури
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-zinc-400 max-w-2xl mb-8 md:mb-10">
            Отримуй найсвіжіші музичні новини, ексклюзивні інтерв'ю та культурні інсайди прямо у своєму месенджері.
          </p>
          <a 
            href="https://t.me/uncultured_media" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-black px-6 md:px-10 py-4 md:py-5 text-sm md:text-xl font-black uppercase tracking-widest hover:bg-white transition-colors font-serif whitespace-nowrap rounded-full md:rounded-none"
          >
            ПЕРЕЙТИ В TELEGRAM
          </a>
        </div>
      </section>
    </div>
  );
}
