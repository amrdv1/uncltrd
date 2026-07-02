"use client";

import { useState, useEffect } from "react";
import { CustomAudioPlayer } from "./CustomAudioPlayer";
import { Loader2, Music } from "lucide-react";

export function AlbumPlayer({ albumUrl }: { albumUrl: string }) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAlbum() {
      try {
        const res = await fetch(`/api/spotify-album?url=${encodeURIComponent(albumUrl)}`);
        const data = await res.json();
        
        if (data.tracks && data.tracks.length > 0) {
          setTracks(data.tracks);
        } else {
          setError(data.error || "Не вдалося завантажити альбом");
        }
      } catch (err) {
        setError("Помилка завантаження альбому");
      } finally {
        setLoading(false);
      }
    }
    
    fetchAlbum();
  }, [albumUrl]);

  if (loading) {
    return (
      <div className="w-full bg-[#111111] rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center gap-4 min-h-[200px]">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
        <p className="text-zinc-400 text-sm font-bold tracking-widest uppercase">Завантаження альбому...</p>
      </div>
    );
  }

  if (error || tracks.length === 0) {
    return (
      <div className="w-full bg-[#111111] rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center gap-2 min-h-[200px]">
        <p className="text-red-500 font-bold">{error || "Треки не знайдено"}</p>
      </div>
    );
  }

  const currentTrack = tracks[currentIndex];
  // Re-render CustomAudioPlayer completely when track changes to reset its internal state
  const playerKey = `player-${currentIndex}`;
  const streamUrl = `/api/resolve-track?url=${encodeURIComponent(currentTrack.url)}`;

  const handleEnded = () => {
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="w-full bg-[#111111] rounded-3xl p-6 shadow-2xl">
      <div className="mb-4">
        <h3 className="text-white font-bold text-lg mb-1">{currentTrack.title}</h3>
        <p className="text-zinc-400 text-sm">{currentTrack.subtitle || "Spotify Track"}</p>
      </div>
      
      <CustomAudioPlayer key={playerKey} src={streamUrl} onEnded={handleEnded} />
      
      <div className="mt-6 border-t border-zinc-800 pt-4">
        <div className="font-bold uppercase tracking-widest text-zinc-500 text-[10px] mb-3">Плейлист ({tracks.length} треків)</div>
        <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {tracks.map((track, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex items-center gap-3 w-full text-left p-2 rounded-xl transition-colors ${
                idx === currentIndex 
                  ? "bg-white/10 text-white" 
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="w-6 flex justify-center text-xs opacity-50 font-bold">
                {idx === currentIndex ? <Music className="w-3 h-3 text-white" /> : idx + 1}
              </div>
              <div className="flex-1 truncate font-medium text-sm">
                {track.title}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
