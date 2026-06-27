"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export function CustomAudioPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-full px-4 sm:px-5 py-3 shadow-xl transition-all w-full min-w-[280px] max-w-sm shrink-0 group hover:shadow-2xl hover:border-accent/30 relative overflow-hidden">
      <audio ref={audioRef} src={src} preload="metadata" />

      <button 
        onClick={togglePlay}
        className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-accent dark:hover:bg-accent hover:text-white dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
      >
        {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-1" />}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1">
        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex items-center">
          <div 
            className="absolute top-0 left-0 h-full bg-accent transition-all duration-100 ease-linear rounded-full"
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
