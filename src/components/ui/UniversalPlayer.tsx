import { CustomAudioPlayer } from "./CustomAudioPlayer";
import { SoundCloudPlayer } from "./SoundCloudPlayer";

export function UniversalPlayer({ url }: { url: string }) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace("www.", "");

    // Spotify Embed
    if (hostname === "open.spotify.com") {
      const pathname = parsedUrl.pathname; // e.g. /album/1wkk... or /track/1wkk...
      const embedUrl = `https://open.spotify.com/embed${pathname}`;
      return (
        <iframe 
          className="w-full max-w-sm rounded-2xl shadow-xl border-0 overflow-hidden"
          src={embedUrl} 
          width="100%" 
          height="152" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        />
      );
    }

    // Apple Music Embed
    if (hostname === "music.apple.com") {
      // Must include the search query parameters (like ?i=123) for tracks to load correctly!
      const pathname = parsedUrl.pathname;
      const search = parsedUrl.search;
      const embedUrl = `https://embed.music.apple.com${pathname}${search}`;
      return (
        <iframe 
          className="w-full max-w-sm rounded-xl shadow-xl border-0 overflow-hidden bg-transparent"
          src={embedUrl} 
          width="100%" 
          height="175" 
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" 
        />
      );
    }

    // SoundCloud Embed
    if (hostname === "soundcloud.com" || hostname === "on.soundcloud.com") {
      // You could use SoundCloudPlayer here, or a standard iframe.
      // Let's use standard iframe to be safe and consistent.
      const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
      return (
        <iframe 
          className="w-full max-w-sm rounded-xl shadow-xl border-0 overflow-hidden"
          src={embedUrl} 
          width="100%" 
          height="166" 
          allow="autoplay" 
          loading="lazy"
        />
      );
    }

    // YouTube Embed
    if (hostname === "youtube.com" || hostname === "youtu.be") {
      let videoId = "";
      if (hostname === "youtu.be") {
        videoId = parsedUrl.pathname.slice(1);
      } else {
        videoId = parsedUrl.searchParams.get("v") || "";
      }
      if (videoId) {
        return (
          <iframe 
            className="w-full max-w-sm rounded-xl shadow-xl border-0 overflow-hidden"
            src={`https://www.youtube.com/embed/${videoId}`} 
            width="100%" 
            height="215" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        );
      }
    }

    // Fallback: Custom Audio Player for direct files (.mp3, .wav)
    return <CustomAudioPlayer src={url} />;
    
  } catch (error) {
    // If URL is invalid, fallback to CustomAudioPlayer
    return <CustomAudioPlayer src={url} />;
  }
}
