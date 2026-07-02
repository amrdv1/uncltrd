"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CustomAudioPlayer } from "@/components/ui/CustomAudioPlayer";

export function InlineAudioHydrator() {
  const [portals, setPortals] = useState<Array<{ container: Element, url: string, id: string }>>([]);

  useEffect(() => {
    let active = true;

    const hydratePlayers = () => {
      const containers = document.querySelectorAll('div[data-inline-audio]');
      const newPortals: Array<{ container: Element, url: string, id: string }> = [];
      let changed = false;

      containers.forEach(container => {
        if (container.hasAttribute('data-hydrated')) {
          return;
        }
        
        container.setAttribute('data-hydrated', 'true');
        const url = container.getAttribute('data-inline-audio');
        if (!url) return;
        
        const audioUrl = `/api/resolve-track?url=${encodeURIComponent(url)}`;
        newPortals.push({ container, url: audioUrl, id: Math.random().toString(36).substr(2, 9) });
        changed = true;
      });

      if (changed && active) {
        setPortals(prev => [...prev, ...newPortals]);
      }
    };

    hydratePlayers();
    
    const observer = new MutationObserver((mutations) => {
      let shouldHydrate = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldHydrate = true;
          break;
        }
      }
      if (shouldHydrate && active) hydratePlayers();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {portals.map((p) => createPortal(<CustomAudioPlayer src={p.url} />, p.container))}
    </>
  );
}
