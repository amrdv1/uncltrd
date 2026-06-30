"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export function Lightbox({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-zoom-in relative w-full h-full">
        {children}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-accent transition p-2"
          >
            <X size={40} />
          </button>
          
          <div className="relative w-[90vw] h-[90vh]">
            <Image 
              src={src} 
              alt={alt} 
              fill 
              className="object-contain" 
              unoptimized={src.toLowerCase().endsWith('.gif') || src.includes('tiktokcdn.com') || src.includes('byteimg.com')}
            />
          </div>
        </div>
      )}
    </>
  );
}
