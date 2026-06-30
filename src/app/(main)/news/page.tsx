import { Metadata } from "next";
import { db } from "@/lib/db";
import { StoryCard } from "@/components/ui/StoryCard";
import { Carousel } from "@/components/ui/Carousel";

export const metadata: Metadata = {
  title: "Новини",
  description: "Стрічка усіх найсвіжіших публікацій, новин, релізів та оглядів зі світу українського хіп-хопу та андеграунд-культури на uncultured.",
  openGraph: {
    title: "Новини",
    description: "Стрічка усіх найсвіжіших публікацій, новин, релізів та оглядів зі світу українського хіп-хопу та андеграунд-культури на uncultured.",
    url: "https://uncultured.media/news",
    type: "website",
  },
  alternates: {
    canonical: "https://uncultured.media/news",
  }
};

export default async function NewsPage() {
  const articles = await db.article.findMany({
    where: { status: "PUBLISHED", isTrackReview: false },
    orderBy: { createdAt: "desc" },
    include: { author: true, category: true, trackReview: true },
  });

  return (
    <div className="flex flex-col pb-24">
      <section className="bg-white dark:bg-transparent border-b-2 border-zinc-200 dark:border-white/10 pt-12 pb-8 px-6 lg:px-12 mb-12 transition-colors">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter font-serif text-black dark:text-white transition-colors" style={{ fontFamily: "var(--font-space-grotesk)"}}>
            НОВИНИ<span className="text-accent">.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 font-medium pb-2">
            Стрічка усіх найсвіжіших публікацій.
          </p>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-12 w-full">
        {articles.length > 0 ? (
          <>
            {/* Mobile Carousel View */}
            <div className="md:hidden">
              <Carousel>
                {articles.map((article, i) => {
                  return (
                    <StoryCard
                      key={`mobile-news-${article.id}`}
                      size="large"
                      category={article.category?.name || "Новина"}
                      title={article.title}
                      image={article.isTrackReview && article.trackReview?.coverUrl ? article.trackReview.coverUrl : (article.imageUrl || "https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=1600")}
                      date={article.createdAt.toLocaleDateString("uk-UA")}
                      slug={article.slug}
                      trackRating={article.isTrackReview ? (article.trackReview?.totalScore || 0) : undefined}
                    />
                  );
                })}
              </Carousel>
            </div>

            {/* Desktop Grid View */}
            <div className="hidden md:grid grid-cols-12 gap-6">
              {articles.map((article, i) => {
                const size = i % 3 === 0 ? "medium" : "small";
                const colSpan = i % 3 === 0 ? "col-span-12 md:col-span-6 lg:col-span-4" : "col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-4";

                return (
                  <div key={`desktop-news-${article.id}`} className={colSpan}>
                    <StoryCard
                      size={size}
                      category={article.category?.name || "Новина"}
                      title={article.title}
                      image={article.isTrackReview && article.trackReview?.coverUrl ? article.trackReview.coverUrl : (article.imageUrl || "https://images.unsplash.com/photo-1493225457124-a1a2a5956093?auto=format&fit=crop&q=80&w=1600")}
                      date={article.createdAt.toLocaleDateString("uk-UA")}
                      slug={article.slug}
                      trackRating={article.isTrackReview ? (article.trackReview?.totalScore || 0) : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-xl text-zinc-500 font-medium">
            Новин поки немає.
          </div>
        )}
      </div>
    </div>
  );
}
