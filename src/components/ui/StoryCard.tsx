import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StoryCardProps {
  category: string;
  title: string;
  image: string;
  date: string;
  author?: string;
  size?: "small" | "medium" | "large" | "hero" | "horizontal" | "review" | "carousel";
  className?: string;
  slug: string;
  trackRating?: number;
  adminRating?: number;
}

export function StoryCard({ category, title, image, date, author, size = "medium", className, slug, trackRating, adminRating }: StoryCardProps) {
  if (size === "hero" || size === "large" || size === "medium" || size === "small") {
    const isHero = size === "hero";
    
    // Define specific styles based on size
    let aspectClass = "";
    let titleClass = "";
    let padClass = "";
    
    if (size === "hero") {
      aspectClass = "aspect-[4/5] md:aspect-[16/9]";
      titleClass = "text-4xl md:text-6xl lg:text-7xl";
      padClass = "p-5 md:p-12";
    } else if (size === "large") {
      aspectClass = "aspect-[4/3] md:aspect-video";
      titleClass = "text-2xl md:text-4xl";
      padClass = "p-5 md:p-8";
    } else if (size === "medium") {
      aspectClass = "aspect-video";
      titleClass = "text-xl md:text-2xl";
      padClass = "p-4 md:p-6";
    } else { // small
      aspectClass = "aspect-video";
      titleClass = "text-lg md:text-xl";
      padClass = "p-3 md:p-5";
    }

    return (
      <Link href={`/article/${slug}`} className={cn("w-full group block relative overflow-hidden rounded-[2rem] ring-1 ring-black/10 dark:ring-white/10 shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] dark:hover:shadow-accent/20 transition-all duration-500 hover:-translate-y-2", className)}>
        <div className={cn("relative w-full overflow-hidden bg-zinc-100", aspectClass)}>
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.21,0.47,0.32,0.98)] group-hover:scale-110"
            priority={isHero}
          />
          {trackRating !== undefined && trackRating > 0 && adminRating !== undefined && adminRating > 0 && (
            <div className="absolute bottom-6 right-6 flex items-center gap-2 z-20">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-lg border-2 border-zinc-900" title="Оцінка користувачів">
                {trackRating}
              </div>
              <div className="w-10 h-10 rounded-full bg-transparent border-2 border-zinc-500 text-white font-black flex items-center justify-center text-sm shadow-lg backdrop-blur-md" title="Оцінка редакції">
                {adminRating}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          <div className={cn("absolute bottom-0 left-0 w-full text-white", padClass)}>
            <div className="flex items-center space-x-3 mb-2 md:mb-4">
              <span className="bg-accent text-white px-2.5 py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest font-serif rounded-sm">
                {category}
              </span>
              <span className="text-xs md:text-sm font-medium text-zinc-300 drop-shadow-md">{date}</span>
            </div>
            <h2 className={cn("font-black uppercase tracking-tighter leading-[0.95] font-serif mb-2 group-hover:text-accent transition-colors drop-shadow-lg", titleClass)} style={{ fontFamily: "var(--font-space-grotesk)"}}>
              {title}
            </h2>
            {author && isHero && <p className="text-sm md:text-lg font-medium text-zinc-300 drop-shadow-md mt-2 md:mt-4">By {author}</p>}
          </div>
        </div>
      </Link>
    );
  }

  if (size === "horizontal") {
    return (
      <Link href={`/article/${slug}`} className={cn("group flex flex-col md:flex-row gap-6", className)}>
        <div className="relative aspect-video md:w-64 lg:w-80 shrink-0 overflow-hidden bg-zinc-100 rounded-xl">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.21,0.47,0.32,0.98)] group-hover:scale-110"
          />
        </div>
        <div className="flex flex-col justify-center py-2">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-black font-serif">
              {category}
            </span>
            <span className="text-xs text-zinc-500">{date}</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight font-serif group-hover:text-zinc-600 transition-colors" style={{ fontFamily: "var(--font-space-grotesk)"}}>
            {title}
          </h3>
          {author && <p className="text-sm font-medium text-zinc-500 mt-4">By {author}</p>}
        </div>
      </Link>
    );
  }

  if (size === "carousel") {
    return (
      <Link href={`/article/${slug}`} className={cn("group flex flex-col w-full h-full bg-white/10 dark:bg-zinc-900/30 backdrop-blur-xl p-4 rounded-[2rem] border border-white/10 transition-all duration-500 hover:-translate-y-2 hover:bg-white/20 dark:hover:bg-zinc-800/50 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] active:scale-[0.98]", className)}>
        <div className="relative w-full aspect-square overflow-hidden shadow-sm group-hover:shadow-lg transition-shadow duration-500 shrink-0 rounded-xl mb-4">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.21,0.47,0.32,0.98)] group-hover:scale-110"
          />
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent font-serif">{category}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{date}</span>
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-zinc-300 transition-colors" style={{ fontFamily: "var(--font-space-grotesk)"}}>
            {title}
          </h3>
        </div>
      </Link>
    );
  }

  const aspectRatios = {
    review: "aspect-square shadow-xl rounded-none md:rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800",
  };

  const titleSizes = {
    review: "text-xl md:text-2xl font-black",
  };

  return (
    <Link 
      href={`/article/${slug}`} 
      className={cn(
        "group flex flex-col h-full bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50 p-2 -m-2 rounded-2xl transition-all duration-500", 
        className
      )}
    >
      <div className={cn("relative w-full overflow-hidden bg-zinc-100 rounded-xl shadow-sm group-hover:shadow-xl transition-shadow duration-500 shrink-0", aspectRatios.review)}>
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.21,0.47,0.32,0.98)] group-hover:scale-110"
        />
        {trackRating !== undefined && trackRating > 0 && adminRating !== undefined && adminRating > 0 && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xl border-2 border-white dark:border-zinc-900" title="Оцінка користувачів">
              {trackRating}
            </div>
            <div className="w-10 h-10 rounded-full bg-white dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-black flex items-center justify-center text-sm shadow-xl" title="Оцінка редакції">
              {adminRating}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col mt-4">
        {size !== "review" && (
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-black font-serif">
              {category}
            </span>
            <span className="text-xs text-zinc-500">{date}</span>
          </div>
        )}
        <h3 className={cn("font-black uppercase tracking-tighter leading-[0.95] font-serif group-hover:text-zinc-600 transition-colors", titleSizes.review)} style={{ fontFamily: "var(--font-space-grotesk)"}}>
          {title}
        </h3>
        {size === "review" && (
          <div className="flex items-center space-x-3 mt-3 opacity-60">
            <span className="text-[10px] font-bold uppercase tracking-widest font-serif">{category}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">{date}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
