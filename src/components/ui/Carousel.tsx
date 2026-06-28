"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  itemWidth?: number;
}

export function Carousel({ children, className, itemWidth = 300 }: CarouselProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  React.useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -itemWidth, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: itemWidth, behavior: "smooth" });
    }
  };

  return (
    <div className={cn("relative group", className)}>
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto snap-x snap-proximity gap-4 md:gap-6 pb-4 -mx-4 px-4 scroll-pl-4 md:mx-0 md:px-0 md:scroll-pl-0 hide-scrollbar overscroll-x-contain touch-pan-x"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {React.Children.map(children, (child) => (
          <div className="snap-start shrink-0 w-[88vw] sm:w-[300px] md:w-[320px] flex">
            {child}
          </div>
        ))}
        {/* Invisible spacer to ensure right margin on the last item in Safari */}
        <div className="shrink-0 w-1 md:w-0" aria-hidden="true"></div>
      </div>

      {/* Navigation Buttons */}
      <div className={cn("hidden md:flex absolute top-1/2 -translate-y-1/2 left-2 md:left-4 transition-all duration-300 z-10", canScrollLeft ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none")}>
        <button 
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-zinc-200/90 hover:bg-zinc-300 dark:bg-zinc-700/90 dark:hover:bg-zinc-600 backdrop-blur-md text-black dark:text-white shadow-xl flex items-center justify-center border border-zinc-400 dark:border-zinc-500 hover:scale-110 active:scale-95 transition-all"
          aria-label="Попередні"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
      </div>

      <div className={cn("hidden md:flex absolute top-1/2 -translate-y-1/2 right-2 md:right-4 transition-all duration-300 z-10", canScrollRight ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none")}>
        <button 
          onClick={scrollRight}
          disabled={!canScrollRight}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-zinc-200/90 hover:bg-zinc-300 dark:bg-zinc-700/90 dark:hover:bg-zinc-600 backdrop-blur-md text-black dark:text-white shadow-xl flex items-center justify-center border border-zinc-400 dark:border-zinc-500 hover:scale-110 active:scale-95 transition-all"
          aria-label="Наступні"
        >
          <ChevronRight size={24} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
