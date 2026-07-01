"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackCardProps {
  title: string;
  artist: string;
  coverUrl: string;
  slug: string;
  publicScore?: number;
  adminScore?: number;
  className?: string;
  tags?: string[];
  compact?: boolean;
  listenUrl?: string;
}

export function TrackCard({ 
  title, 
  artist, 
  coverUrl, 
  slug, 
  publicScore, 
  adminScore, 
  className,
  tags,
  compact = false,
  listenUrl
}: TrackCardProps) {
  return (
    <Link href={`/article/${slug}`} className={cn("group flex flex-col w-full h-full bg-[#111] rounded-xl transition-all duration-500 hover:-translate-y-2 hover:bg-[#151515] border border-zinc-800 hover:border-accent/50 hover:shadow-[0_20px_40px_-15px_rgba(255,51,102,0.15)] active:scale-[0.98]", compact ? "p-3" : "p-4", className)}>
      {/* Cover Image */}
      <div className={cn("relative w-full aspect-square overflow-hidden shadow-sm group-hover:shadow-lg transition-shadow duration-500 shrink-0", compact ? "rounded-lg mb-3" : "rounded-xl mb-4")}>
        <Image 
          src={coverUrl} 
          alt={title} 
          fill 
          sizes="(max-width: 768px) 65vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.21,0.47,0.32,0.98)] group-hover:scale-105" 
          unoptimized={coverUrl.toLowerCase().endsWith('.gif') || coverUrl.includes('tiktokcdn.com') || coverUrl.includes('byteimg.com')}
        />
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Play size={12} fill="currentColor" className="ml-0.5" />
        </div>
      </div>
      
      {/* Title & Artist */}
      <div className={compact ? "mb-2" : "mb-4"}>
        <h3 className={cn("text-white font-bold leading-tight mb-1 truncate group-hover:text-accent transition-colors font-antapani", compact ? "text-base" : "text-lg")}>
          {title}
        </h3>
        <p className="text-zinc-500 font-medium truncate text-sm font-antapani">
          {artist}
        </p>
      </div>

      {/* Ratings Row */}
      <div className={cn("flex items-center justify-between", compact ? "mb-3" : "mb-4")}>
        <div className="flex items-center gap-1">
          <div className="w-8 h-8 shrink-0 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-lg" title="Оцінка користувачів">
            {publicScore !== undefined && publicScore !== null ? publicScore : "-"}
          </div>
          <div className="w-8 h-8 shrink-0 rounded-full bg-transparent border border-zinc-600 text-white font-black flex items-center justify-center text-xs shadow-lg" title="Оцінка редакції">
            {adminScore !== undefined && adminScore !== null ? adminScore : "-"}
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 mt-auto">
        {listenUrl ? (
          <a href={listenUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex-1 bg-white text-black py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all">
            <Play size={12} fill="currentColor" /> Слухати
          </a>
        ) : (
          <div className="flex-1 bg-white text-black py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all opacity-50 cursor-not-allowed">
            <Music size={12} /> Немає лінку
          </div>
        )}
      </div>
    </Link>
  );
}
