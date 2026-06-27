"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

declare global {
  interface Window {
    SC: any;
  }
}

export function SoundCloudPlayer({ url }: { url: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Load SC Widget API
    if (!document.getElementById("sc-widget-api")) {
      const script = document.createElement("script");
      script.id = "sc-widget-api";
      script.src = "https://w.soundcloud.com/player/api.js";
      document.body.appendChild(script);
      
      script.onload = initWidget;
    } else {
      initWidget();
    }

    function initWidget() {
      if (!window.SC) {
        const scriptEl = document.getElementById("sc-widget-api");
        if (scriptEl) scriptEl.addEventListener("load", initWidget);
        return;
      }
      if (!iframeRef.current) return;
      
      const widget = window.SC.Widget(iframeRef.current);
      widgetRef.current = widget;

      widget.bind(window.SC.Widget.Events.READY, () => {
        widget.getDuration((d: number) => setDuration(d / 1000));
      });

      widget.bind(window.SC.Widget.Events.PLAY, () => setIsPlaying(true));
      widget.bind(window.SC.Widget.Events.PAUSE, () => setIsPlaying(false));
      widget.bind(window.SC.Widget.Events.FINISH, () => setIsPlaying(false));
      
      widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (progress: any) => {
        setCurrentTime(progress.currentPosition / 1000);
      });
    }

    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.unbind(window.SC.Widget.Events.READY);
          widgetRef.current.unbind(window.SC.Widget.Events.PLAY);
          widgetRef.current.unbind(window.SC.Widget.Events.PAUSE);
          widgetRef.current.unbind(window.SC.Widget.Events.FINISH);
          widgetRef.current.unbind(window.SC.Widget.Events.PLAY_PROGRESS);
        } catch (e) {
          // Ignore errors if iframe is already destroyed
        }
      }
    };
  }, []);

  const togglePlay = () => {
    if (!widgetRef.current) return;
    widgetRef.current.toggle();
  };

  const toggleMute = () => {
    if (!widgetRef.current) return;
    widgetRef.current.setVolume(isMuted ? 100 : 0);
    setIsMuted(!isMuted);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!widgetRef.current) return;
    const newTime = Number(e.target.value);
    widgetRef.current.seekTo(newTime * 1000);
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-full px-4 sm:px-5 py-3 shadow-xl transition-all w-full min-w-[280px] max-w-sm shrink-0 group hover:shadow-2xl hover:border-[#ff5500]/50 relative overflow-hidden">
      
      {/* Hidden SC Widget */}
      <iframe 
        ref={iframeRef}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        scrolling="no" 
        frameBorder="no" 
        allow="autoplay" 
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false`}
      />

      <button 
        onClick={togglePlay}
        className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#ff5500] text-white rounded-full hover:bg-[#ff3300] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5500]/50 shadow-md shadow-[#ff5500]/20"
      >
        {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-1" />}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1">
        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          <span>{formatTime(currentTime)}</span>
          <span className="text-[#ff5500] flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M11 6h2v12h-2zm-4 4h2v4H7zm8 2h2v4h-2zm-12-2h2v4H3zm16 1h2v2h-2z"/></svg>
            SOUNDCLOUD
          </span>
        </div>
        <div className="relative w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex items-center">
          <div 
            className="absolute top-0 left-0 h-full bg-[#ff5500] transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      <button 
        onClick={toggleMute}
        className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-zinc-400 hover:text-black dark:hover:text-white transition-colors focus:outline-none"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
}
