"use client";

import Image from "next/image";
import { Lightbox } from "./Lightbox";

export function MediaGallery({ media }: { media: { url: string; type: string }[] }) {
  if (!media || media.length === 0) return null;

  return (
    <div className="my-12">
      <h3 className="text-2xl font-black uppercase tracking-widest font-serif mb-6 border-b-2 border-black pb-2 inline-block">
        Галерея
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {media.map((item, i) => (
          <div key={i} className="relative aspect-square bg-zinc-100 rounded-xl overflow-hidden shadow-sm group">
            {item.type === "VIDEO" ? (
              <video 
                src={item.url} 
                controls 
                className="w-full h-full object-cover"
              />
            ) : (
              <Lightbox src={item.url} alt={`Gallery image ${i}`}>
                <Image 
                  src={item.url} 
                  alt={`Gallery item ${i + 1}`} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover/item:scale-105"
                  unoptimized={item.url.toLowerCase().endsWith('.gif')}
                />
              </Lightbox>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
