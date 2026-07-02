"use client";

import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { CustomAudioPlayer } from "@/components/ui/CustomAudioPlayer";

export function InlineAudioHydrator() {
  useEffect(() => {
    // We run this periodically or on DOM changes to catch dynamically loaded markdown content
    const hydratePlayers = () => {
      const containers = document.querySelectorAll('div[data-inline-audio]');
      containers.forEach(container => {
        if (container.hasAttribute('data-hydrated')) return;
        container.setAttribute('data-hydrated', 'true');
        
        const url = container.getAttribute('data-inline-audio');
        if (!url) return;
        
        const audioUrl = `/api/resolve-track?url=${encodeURIComponent(url)}`;
        
        try {
          const root = createRoot(container);
          root.render(<CustomAudioPlayer src={audioUrl} />);
        } catch (e) {
          console.error("Failed to hydrate inline audio player", e);
        }
      });
    };

    hydratePlayers();
    
    // Set up a mutation observer to hydrate players that are loaded asynchronously (e.g. navigation)
    const observer = new MutationObserver((mutations) => {
      let shouldHydrate = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldHydrate = true;
          break;
        }
      }
      if (shouldHydrate) hydratePlayers();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  return null;
}
