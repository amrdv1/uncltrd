import { Metadata } from "next";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { MediaGallery } from "@/components/ui/MediaGallery";
import { InteractionBar } from "@/components/ui/InteractionBar";
import { Lightbox } from "@/components/ui/Lightbox";
import { RatingSliders } from "@/components/ui/RatingSliders";
import { CustomAudioPlayer } from "@/components/ui/CustomAudioPlayer";
import { UniversalPlayer } from "@/components/ui/UniversalPlayer";
import { AlbumPlayer } from "@/components/ui/AlbumPlayer";
import { SoundCloudPlayer } from "@/components/ui/SoundCloudPlayer";
import { Carousel } from "@/components/ui/Carousel";

const generatePlayerIframe = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    
    // Spotify
    if (parsedUrl.hostname === 'open.spotify.com') {
      const embedUrl = url.replace('open.spotify.com/', 'open.spotify.com/embed/');
      return `
        <div class="my-8 w-full min-w-[280px] max-w-sm xl:max-w-md mx-auto hidden [.in-telegram_&]:block" data-inline-audio="${url}"></div>
        <div class="my-8 w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 [.in-telegram_&]:hidden"><iframe style="border-radius:12px" src="${embedUrl}?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div>
      `;
    }
    
    // Apple Music
    if (parsedUrl.hostname === 'music.apple.com') {
      const embedUrl = url.replace('music.apple.com/', 'embed.music.apple.com/');
      return `
        <div class="my-8 w-full min-w-[280px] max-w-sm xl:max-w-md mx-auto hidden [.in-telegram_&]:block" data-inline-audio="${url}"></div>
        <div class="my-8 w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 [.in-telegram_&]:hidden"><iframe allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" frameborder="0" height="175" style="width:100%;max-width:660px;overflow:hidden;background:transparent;" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" src="${embedUrl}"></iframe></div>
      `;
    }
    
    // SoundCloud
    if (parsedUrl.hostname === 'soundcloud.com') {
      const encodedUrl = encodeURIComponent(url);
      return `<div class="my-8 w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800"><iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23000000&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe></div>`;
    }

    // YouTube
    if (parsedUrl.hostname === 'www.youtube.com' && parsedUrl.pathname === '/watch') {
      const videoId = parsedUrl.searchParams.get('v');
      if (videoId) {
        return `<div class="my-8 rounded-2xl overflow-hidden shadow-xl mx-auto w-full max-w-4xl border border-zinc-200 dark:border-zinc-800 aspect-video"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 100%;"></iframe></div>`;
      }
    }
    
    if (parsedUrl.hostname === 'youtu.be') {
      const videoId = parsedUrl.pathname.slice(1);
      if (videoId) {
        return `<div class="my-8 rounded-2xl overflow-hidden shadow-xl mx-auto w-full max-w-4xl border border-zinc-200 dark:border-zinc-800 aspect-video"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 100%;"></iframe></div>`;
      }
    }
  } catch (e) {
    return null;
  }
  return null;
};

const parseMarkdown = (text: string) => {
  if (!text) return "";
  let html = text;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 text-black dark:text-white">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-black mt-8 mb-4 text-black dark:text-white">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black mt-10 mb-4 text-black dark:text-white">$1</h1>');
  
  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-[3px] border-accent pl-6 py-5 pr-5 my-8 text-lg italic font-medium text-zinc-800 dark:text-zinc-200 bg-accent/5 rounded-r-2xl leading-relaxed">$1</blockquote>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  
  // Links (Check for Music Players first)
  html = html.replace(/\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/gim, (match, linkText, url) => {
    const player = generatePlayerIframe(url);
    if (player) return player;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline font-bold">${linkText || url}</a>`;
  });

  // Raw URLs (if not inside an HTML attribute)
  html = html.replace(/(^|[^"'])(https?:\/\/(?:open\.spotify\.com|music\.apple\.com|soundcloud\.com|www\.youtube\.com\/watch|youtu\.be)[^\s<]+)/gim, (match, prefix, url) => {
    const player = generatePlayerIframe(url);
    if (player) return prefix + player;
    return match;
  });
  
  // Lists
  html = html.replace(/(?:^\- .*(?:\n|$))+/gim, (match) => {
    return '<ul class="list-disc pl-5 my-4 space-y-2 marker:text-accent">\n' + match.replace(/^\- (.*$)/gim, '<li>$1</li>') + '\n</ul>';
  });
  
  return html;
};

const renderContentWithMedia = (content: string, media: any[]) => {
  if (!content) return null;
  const regex = /\[media:(\d+)\]/g;
  const parts = content.split(regex);
  
  return parts.map((part, index) => {
    // Odd indexes are the captured group (the media number)
    if (index % 2 !== 0) {
      const mediaIndex = parseInt(part, 10) - 1;
      const mediaItem = media[mediaIndex];
      
      if (mediaItem) {
        if (mediaItem.type === "VIDEO") {
          let youtubeId = null;
          let instagramUrl = null;
          
          if (mediaItem.url.includes("youtube.com/watch")) {
            youtubeId = new URL(mediaItem.url).searchParams.get("v");
          } else if (mediaItem.url.includes("youtu.be/")) {
            youtubeId = mediaItem.url.split("youtu.be/")[1]?.split("?")[0];
          } else if (mediaItem.url.includes("instagram.com/")) {
            instagramUrl = mediaItem.url.split('?')[0].replace(/\/$/, '') + '/embed';
          }

          if (youtubeId) {
            return (
              <div key={index} className="my-8 rounded-2xl overflow-hidden shadow-xl mx-auto w-full max-w-4xl border border-zinc-200 dark:border-zinc-800 aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            );
          }
          
          if (instagramUrl) {
            return (
              <div key={index} className="my-8 rounded-2xl overflow-hidden shadow-xl mx-auto w-full max-w-sm md:max-w-md border border-zinc-200 dark:border-zinc-800 bg-white">
                <iframe
                  src={instagramUrl}
                  className="w-full aspect-[9/16] min-h-[600px] border-none"
                  scrolling="no"
                  allowTransparency
                  allow="encrypted-media"
                ></iframe>
              </div>
            );
          }

          return (
            <div key={index} className="my-8 rounded-2xl overflow-hidden shadow-xl mx-auto w-full max-w-4xl border border-zinc-200 dark:border-zinc-800">
              <video src={mediaItem.url} controls className="w-full h-auto bg-black" />
            </div>
          );
        } else {
          return (
            <div key={index} className="my-8 flex justify-center w-full px-6 md:px-16">
              <Lightbox src={mediaItem.url} alt={`Media ${part}`}>
                <img 
                  src={mediaItem.url} 
                  alt={`Media ${part}`} 
                  className="max-h-[280px] md:max-h-[350px] w-auto max-w-full rounded-xl shadow-md border border-border object-contain bg-secondary" 
                />
              </Lightbox>
            </div>
          );
        }
      }
      return <span key={index} className="text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded text-sm">[Файл {part} не знайдено]</span>;
    }
    return <div key={index} dangerouslySetInnerHTML={{ __html: parseMarkdown(part) }} />;
  });
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await db.article.findUnique({
    where: { slug: resolvedParams.slug, status: "PUBLISHED" },
    include: { author: true }
  });

  if (!article) return {};

  const siteUrl = "https://uncultured.media";
  const url = `${siteUrl}/article/${article.slug}`;
  const images = article.imageUrl ? [article.imageUrl] : [`${siteUrl}/logo-black.png`];
  const description = article.content.substring(0, 160).replace(/[#*`_[\]()]/g, '').trim() + "...";

  return {
    title: article.title,
    description: description,
    openGraph: {
      title: article.title,
      description: description,
      url,
      type: "article",
      publishedTime: article.createdAt.toISOString(),
      authors: [article.author.name || "uncultured."],
      images: images.map(img => ({ url: img })),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: description,
      images,
    },
    alternates: {
      canonical: url,
    }
  };
}

export default async function ArticlePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const decodedSlug = decodeURIComponent(params.slug);
  const session = await auth();
  const article = await db.article.findUnique({
    where: { slug: decodedSlug },
    include: { 
      author: true, 
      category: true,
      media: true,
      likes: true,
      comments: { include: { user: true } },
      trackReview: true,
      userRatings: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  if (article.isTrackReview && article.trackReview) {
    const publicTotal = Math.round(article.trackReview.totalScore || 0);
    const adminRatings = article.userRatings.filter((r: any) => r.user.role === 'ADMIN');
    let adminTotal = article.trackReview.adminTotal || 0;
    
    let cleanCoverUrl = article.trackReview.coverUrl || "";
    if (cleanCoverUrl.includes("url(")) {
      const match = cleanCoverUrl.match(/url\([^a-zA-Z0-9]*(https?:\/\/[^"'\s&]+)[^a-zA-Z0-9]*\)/);
      if (match) cleanCoverUrl = match[1];
    }
    
    let avgText = (article.trackReview as any).adminText || 0;
    let avgBeats = (article.trackReview as any).adminBeats || 0;
    let avgSound = (article.trackReview as any).adminSound || 0;
    let avgVibe = (article.trackReview as any).adminVibe || 0;
    let avgCharisma = (article.trackReview as any).adminCharisma || 0;

    if (adminRatings.length > 0) {
      const sum = adminRatings.reduce((acc: number, r: any) => acc + (r.text + r.beats + r.sound + r.vibe + r.charisma), 0);
      adminTotal = Math.round(sum / adminRatings.length);
      
      avgText = Math.round((adminRatings.reduce((acc: number, r: any) => acc + r.text, 0) / adminRatings.length) * 10) / 10;
      avgBeats = Math.round((adminRatings.reduce((acc: number, r: any) => acc + r.beats, 0) / adminRatings.length) * 10) / 10;
      avgSound = Math.round((adminRatings.reduce((acc: number, r: any) => acc + r.sound, 0) / adminRatings.length) * 10) / 10;
      avgVibe = Math.round((adminRatings.reduce((acc: number, r: any) => acc + r.vibe, 0) / adminRatings.length) * 10) / 10;
      avgCharisma = Math.round((adminRatings.reduce((acc: number, r: any) => acc + r.charisma, 0) / adminRatings.length) * 10) / 10;
    }
    
    // Prepare autoPreviewUrl for Spotify/YouTube/Apple via our btch-downloader proxy
    // The user wants Spotify and Apple Music to play in the custom mini player
    let autoPreviewUrl = null;
    if (article.media && article.media.length > 0) {
      const url = article.media[0].url.toLowerCase();
      if (url.includes('spotify.com') || url.includes('youtube.com') || url.includes('youtu.be') || url.includes('apple.com')) {
        let queryStr = `url=${encodeURIComponent(article.media[0].url)}`;
        if (article.trackReview) {
            queryStr += `&artist=${encodeURIComponent(article.trackReview.artistName)}&track=${encodeURIComponent(article.trackReview.trackName)}`;
        }
        autoPreviewUrl = `/api/resolve-track?${queryStr}`;
      }
    }
    
    return (
      <div className="bg-white dark:bg-[#050505] min-h-screen pt-8 pb-20 text-black dark:text-white font-sans transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <Link href={article.category ? `/category/${article.category.slug}${(article.category.slug === 'reviews' || article.category.name.toLowerCase() === 'огляди') ? '?view=all' : ''}` : "/"} className="inline-flex items-center text-[#2A75FF] hover:text-black dark:hover:text-white transition mb-6 font-bold uppercase tracking-widest text-xs">
            <ArrowLeft size={14} className="mr-2" />
            НАЗАД
          </Link>
          
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-6 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col md:flex-row gap-8 lg:gap-12 relative overflow-hidden transition-colors">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800 opacity-20 blur-[100px] rounded-full pointer-events-none" />
            
            {cleanCoverUrl ? (
              <div className="relative w-full md:w-72 lg:w-96 aspect-square flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 transition-colors">
                <Image src={cleanCoverUrl} alt="Cover" fill className="object-cover" priority unoptimized={cleanCoverUrl.toLowerCase().endsWith('.gif') || cleanCoverUrl.includes('tiktokcdn.com') || cleanCoverUrl.includes('byteimg.com')} />
              </div>
            ) : (
              <div className="w-full md:w-72 lg:w-96 aspect-square flex-shrink-0 rounded-2xl bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 z-10 transition-colors">
                <span className="text-zinc-400 dark:text-zinc-700 font-bold">Немає обкладинки</span>
              </div>
            )}
            
            <div className="flex-1 flex flex-col justify-center z-10 min-w-0">
              <h1 className={`${
                article.trackReview.trackName.length > 20 
                  ? "text-3xl md:text-4xl lg:text-5xl" 
                  : article.trackReview.trackName.length > 12 
                    ? "text-4xl md:text-5xl lg:text-5xl" 
                    : article.trackReview.trackName.length > 8
                      ? "text-4xl md:text-5xl lg:text-6xl"
                      : "text-5xl md:text-6xl lg:text-7xl"
              } font-black uppercase tracking-tighter leading-tight mb-4 break-words font-antapani`}>
                {article.trackReview.trackName}
              </h1>
              
              <div className="flex items-center gap-6 text-zinc-400 font-bold mb-10 text-sm md:text-base">
                <span>{article.trackReview.artistName}</span>
                <span>Реліз: {((article.trackReview as any).releaseDate || article.createdAt).toLocaleDateString("uk-UA")}</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 mt-auto">
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xl shadow-lg border-2 border-zinc-200 dark:border-zinc-900 transition-colors" title="Оцінка користувачів">
                    {publicTotal || "-"}
                  </div>
                  <div className="group relative cursor-help w-14 h-14 rounded-full bg-transparent border-2 border-zinc-400 dark:border-zinc-500 text-black dark:text-white font-black flex items-center justify-center text-xl shadow-lg backdrop-blur-md transition-colors">
                    {adminTotal || "-"}
                    
                    {(adminRatings.length > 0 || adminTotal > 0) && (
                      <div className="hidden md:block absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl z-50 p-4 min-w-[200px]">
                        <div className="font-bold uppercase tracking-widest text-zinc-500 mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2 text-center text-[10px]">Оцінка редакції</div>
                        <div className="space-y-2">
                          <div className="flex justify-between gap-4"><span>Текст / Рими:</span> <span className="font-bold text-accent">{avgText}</span></div>
                          <div className="flex justify-between gap-4"><span>Біт:</span> <span className="font-bold text-accent">{avgBeats}</span></div>
                          <div className="flex justify-between gap-4"><span>Звучання:</span> <span className="font-bold text-accent">{avgSound}</span></div>
                          <div className="flex justify-between gap-4"><span>Вайб:</span> <span className="font-bold text-accent">{avgVibe}</span></div>
                          <div className="flex justify-between gap-4"><span>Харизма:</span> <span className="font-bold text-accent">{avgCharisma}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {article.media && article.media.length > 0 ? (
                  article.media[0].url.match(/\.(mp3|wav|ogg|m4a|aac)$/i) || !article.media[0].url.match(/(spotify\.com|music\.apple\.com|soundcloud\.com|youtube\.com|youtu\.be)/i) ? (
                    <UniversalPlayer url={article.media[0].url} />
                  ) : article.media[0].url.toLowerCase().includes('spotify.com') || article.media[0].url.toLowerCase().includes('youtube.com') || article.media[0].url.toLowerCase().includes('youtu.be') || article.media[0].url.toLowerCase().includes('apple.com') ? (
                    <>
                      <div className="w-full min-w-[280px] max-w-sm xl:max-w-md mt-2 md:mt-0 hidden [.in-telegram_&]:block">
                        {article.media[0].url.toLowerCase().includes('spotify.com/album/') ? (
                          <AlbumPlayer albumUrl={article.media[0].url} />
                        ) : autoPreviewUrl ? (
                          <CustomAudioPlayer src={autoPreviewUrl} />
                        ) : (
                          <UniversalPlayer url={article.media[0].url} />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-4 [.in-telegram_&]:mt-2 w-full max-w-md">
                        {article.media.filter((m: any) => m.type === 'AUDIO').map((m: any, idx: number) => {
                          let pName = "СЛУХАТИ";
                          let pColor = "bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-black dark:text-white";
                          let url = m.url.toLowerCase();
                          if (url.includes('spotify.com')) {
                            pName = "Spotify";
                            pColor = "bg-[#1DB954]/10 dark:bg-[#1DB954]/20 hover:bg-[#1DB954]/20 dark:hover:bg-[#1DB954]/30 text-[#1DB954]";
                          } else if (url.includes('apple.com')) {
                            pName = "Apple Music";
                            pColor = "bg-[#FA243C]/10 dark:bg-[#FA243C]/20 hover:bg-[#FA243C]/20 dark:hover:bg-[#FA243C]/30 text-[#FA243C]";
                          } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
                            pName = "YouTube";
                            pColor = "bg-[#FF0000]/10 dark:bg-[#FF0000]/20 hover:bg-[#FF0000]/20 dark:hover:bg-[#FF0000]/30 text-[#FF0000]";
                          } else if (url.includes('soundcloud.com')) {
                            pName = "SoundCloud";
                            pColor = "bg-[#FF5500]/10 dark:bg-[#FF5500]/20 hover:bg-[#FF5500]/20 dark:hover:bg-[#FF5500]/30 text-[#FF5500]";
                          }
                          return (
                            <a key={idx} href={m.url} target="_blank" rel="noopener noreferrer" className={`${pColor} px-6 py-3 rounded-full font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 text-[10px] flex-1 min-w-[120px]`}>
                              {pName === "СЛУХАТИ" && <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />}
                              {pName}
                            </a>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full min-w-[280px] max-w-sm xl:max-w-md mt-2 md:mt-0 hidden [.in-telegram_&]:block">
                        <UniversalPlayer url={article.media[0].url} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-4 [.in-telegram_&]:mt-2 w-full max-w-md">
                        {article.media.filter((m: any) => m.type === 'AUDIO').map((m: any, idx: number) => {
                          let pName = "СЛУХАТИ";
                          let pColor = "bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-black dark:text-white";
                          let url = m.url.toLowerCase();
                          if (url.includes('spotify.com')) {
                            pName = "Spotify";
                            pColor = "bg-[#1DB954]/10 dark:bg-[#1DB954]/20 hover:bg-[#1DB954]/20 dark:hover:bg-[#1DB954]/30 text-[#1DB954]";
                          } else if (url.includes('apple.com')) {
                            pName = "Apple Music";
                            pColor = "bg-[#FA243C]/10 dark:bg-[#FA243C]/20 hover:bg-[#FA243C]/20 dark:hover:bg-[#FA243C]/30 text-[#FA243C]";
                          } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
                            pName = "YouTube";
                            pColor = "bg-[#FF0000]/10 dark:bg-[#FF0000]/20 hover:bg-[#FF0000]/20 dark:hover:bg-[#FF0000]/30 text-[#FF0000]";
                          } else if (url.includes('soundcloud.com')) {
                            pName = "SoundCloud";
                            pColor = "bg-[#FF5500]/10 dark:bg-[#FF5500]/20 hover:bg-[#FF5500]/20 dark:hover:bg-[#FF5500]/30 text-[#FF5500]";
                          }
                          return (
                            <a key={idx} href={m.url} target="_blank" rel="noopener noreferrer" className={`${pColor} px-6 py-3 rounded-full font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 text-[10px] flex-1 min-w-[120px]`}>
                              {pName === "СЛУХАТИ" && <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />}
                              {pName}
                            </a>
                          );
                        })}
                      </div>
                    </>
                  )
                ) : (
                  <button className="bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 px-8 py-3.5 rounded-full font-bold uppercase tracking-widest cursor-not-allowed flex items-center gap-2 transition-colors" title="Немає посилання на трек">
                    СЛУХАТИ
                  </button>
                )}
              </div>
              
              {/* Mobile-only Editorial Rating Breakdown */}
              {(adminRatings.length > 0 || adminTotal > 0) && (
                <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-8 w-full block md:hidden">
                  <div className="font-bold uppercase tracking-widest text-zinc-500 mb-4 text-[10px]">Оцінка редакції</div>
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex justify-between items-center text-sm"><span className="text-zinc-500 font-bold uppercase tracking-widest">Текст / Рими</span><span className="font-black text-lg text-blue-500">{avgText}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-zinc-500 font-bold uppercase tracking-widest">Біт</span><span className="font-black text-lg text-blue-500">{avgBeats}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-zinc-500 font-bold uppercase tracking-widest">Звучання</span><span className="font-black text-lg text-blue-500">{avgSound}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-zinc-500 font-bold uppercase tracking-widest">Вайб</span><span className="font-black text-lg text-accent">{avgVibe}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-zinc-500 font-bold uppercase tracking-widest">Харизма</span><span className="font-black text-lg text-accent">{avgCharisma}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-12">
            {!session?.user ? (
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center transition-colors">
                <p className="text-zinc-500 dark:text-zinc-400 font-bold">Щоб залишити рецензію, <Link href="/login" className="text-black dark:text-white underline hover:text-accent">увійдіть у свій акаунт</Link></p>
              </div>
            ) : (
              <RatingSliders 
                articleId={article.id}
                initialUserRating={article.userRatings?.find((r: any) => r.userId === session?.user?.id) || null}
                totalScores={article.trackReview}
                currentUserId={session?.user?.id}
                dynamicAdminTotal={adminTotal}
              />
            )}
          </div>
          
          <div className="mt-16 bg-zinc-50 dark:bg-zinc-900 p-8 lg:p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 transition-colors">
            <div className="flex items-center justify-between mb-10 border-b border-zinc-200 dark:border-zinc-800 pb-6">
              <h3 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase" style={{ fontFamily: "var(--font-space-grotesk)"}}>
                Рецензії користувачів
              </h3>
              <span className="bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-full text-lg font-bold">
                {article.userRatings.filter((r: any) => r.content).length}
              </span>
            </div>

            <div className="w-full">
              {article.userRatings.filter((r: any) => r.content).length === 0 ? (
                <p className="text-zinc-500 font-medium text-lg">Поки немає рецензій. Будьте першим!</p>
              ) : (
                <Carousel itemWidth={320} className="w-full">
                  {article.userRatings.filter((r: any) => r.content).map((rating: any) => {
                    const total = Math.round(rating.text + rating.beats + rating.sound + rating.vibe + rating.charisma);
                    const isEditorial = ["skyti@uncultured.media", "gorkai@uncultured.media", "leanoplav@uncultured.media"].includes(rating.user.email) || rating.user.role === 'ADMIN' || rating.user.role === 'EDITOR';
                    return (
                      <div key={rating.id} className={`w-full h-full shrink-0 snap-start bg-white dark:bg-black border ${isEditorial ? 'border-accent shadow-[0_0_20px_rgba(255,0,0,0.05)] dark:shadow-[0_0_20px_rgba(255,0,0,0.15)]' : 'border-zinc-200 dark:border-zinc-800'} rounded-2xl p-5 sm:p-8 transition-colors flex flex-col relative`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-14 h-14 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white font-bold text-xl uppercase overflow-hidden relative shadow-inner">
                              {rating.user.image ? (
                                <Image src={rating.user.image} alt="Avatar" fill className="object-cover" />
                              ) : (
                                (rating.user.name || rating.user.email)[0]
                              )}
                            </div>
                            <div className="min-w-0 flex-1 flex flex-col justify-center">
                              <p className="font-bold text-black dark:text-white text-base uppercase tracking-widest truncate" title={rating.user.name || rating.user.email}>{rating.user.name || rating.user.email}</p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                {isEditorial && (
                                  <span className="bg-accent text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-[3px] shrink-0">Редакція</span>
                                )}
                                <p className="text-[11px] text-zinc-500 shrink-0">{rating.createdAt.toLocaleDateString("uk-UA")}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0 ml-2">
                            <div className="text-4xl font-black text-black dark:text-white md:mb-2 font-antapani">{total}</div>
                            <div className="hidden md:flex gap-1 text-[10px] font-bold text-zinc-500 justify-end">
                              <div className="group/tooltip relative cursor-help">
                                <span className="text-blue-500">{rating.text}</span>
                                <div className="absolute bottom-full mb-2 right-0 bg-zinc-800 text-white text-[10px] px-3 py-1.5 rounded opacity-0 group-hover/tooltip:opacity-100 whitespace-nowrap pointer-events-none transition-opacity shadow-xl z-50">Текст / Рими</div>
                              </div>
                              <div className="group/tooltip relative cursor-help">
                                <span className="text-blue-500">{rating.beats}</span>
                                <div className="absolute bottom-full mb-2 right-0 bg-zinc-800 text-white text-[10px] px-3 py-1.5 rounded opacity-0 group-hover/tooltip:opacity-100 whitespace-nowrap pointer-events-none transition-opacity shadow-xl z-50">Біт</div>
                              </div>
                              <div className="group/tooltip relative cursor-help">
                                <span className="text-blue-500">{rating.sound}</span>
                                <div className="absolute bottom-full mb-2 right-0 bg-zinc-800 text-white text-[10px] px-3 py-1.5 rounded opacity-0 group-hover/tooltip:opacity-100 whitespace-nowrap pointer-events-none transition-opacity shadow-xl z-50">Звучання</div>
                              </div>
                              <div className="group/tooltip relative cursor-help">
                                <span className="text-accent">{rating.vibe}</span>
                                <div className="absolute bottom-full mb-2 right-0 bg-zinc-800 text-white text-[10px] px-3 py-1.5 rounded opacity-0 group-hover/tooltip:opacity-100 whitespace-nowrap pointer-events-none transition-opacity shadow-xl z-50">Вайб</div>
                              </div>
                              <div className="group/tooltip relative cursor-help">
                                <span className="text-accent">{rating.charisma}</span>
                                <div className="absolute bottom-full mb-2 right-0 bg-zinc-800 text-white text-[10px] px-3 py-1.5 rounded opacity-0 group-hover/tooltip:opacity-100 whitespace-nowrap pointer-events-none transition-opacity shadow-xl z-50">Харизма</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:hidden flex justify-between gap-1 text-[8px] sm:text-[10px] font-bold text-center mb-6 bg-zinc-50 dark:bg-zinc-900/50 py-2 px-1 rounded-xl">
                          <div className="flex-1">
                            <div className="text-zinc-400 uppercase tracking-tighter mb-0.5">Текст</div>
                            <div className="text-blue-500 text-xs sm:text-sm">{rating.text}</div>
                          </div>
                          <div className="flex-1 border-l border-zinc-200 dark:border-zinc-800">
                            <div className="text-zinc-400 uppercase tracking-tighter mb-0.5">Біт</div>
                            <div className="text-blue-500 text-xs sm:text-sm">{rating.beats}</div>
                          </div>
                          <div className="flex-1 border-l border-zinc-200 dark:border-zinc-800">
                            <div className="text-zinc-400 uppercase tracking-tighter mb-0.5">Звук</div>
                            <div className="text-blue-500 text-xs sm:text-sm">{rating.sound}</div>
                          </div>
                          <div className="flex-1 border-l border-zinc-200 dark:border-zinc-800">
                            <div className="text-zinc-400 uppercase tracking-tighter mb-0.5">Вайб</div>
                            <div className="text-accent text-xs sm:text-sm">{rating.vibe}</div>
                          </div>
                          <div className="flex-1 border-l border-zinc-200 dark:border-zinc-800">
                            <div className="text-zinc-400 uppercase tracking-tighter mb-0.5">Харизма</div>
                            <div className="text-accent text-xs sm:text-sm">{rating.charisma}</div>
                          </div>
                        </div>
                        
                        <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed whitespace-pre-wrap break-words overflow-hidden flex-1">{rating.content}</p>
                      </div>
                    );
                  })}
                </Carousel>
              )}
            </div>
          </div>
          
          {article.content && (
            <div className="mt-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 lg:p-12 transition-colors">
              <h3 className="text-2xl font-black text-black dark:text-white tracking-tighter uppercase mb-6 font-antapani">
                Опис / Редакційна думка
              </h3>
              <div className="prose dark:prose-invert prose-lg max-w-none">
                <div className="whitespace-pre-wrap font-medium text-zinc-700 dark:text-zinc-300">
                  {renderContentWithMedia(article.content, article.media)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-8">
      <Link href={article.category ? `/category/${article.category.slug}${(article.category.slug === 'reviews' || article.category.name.toLowerCase() === 'огляди') ? '?view=all' : ''}` : "/"} className="inline-flex items-center text-zinc-500 hover:text-black dark:hover:text-white transition mb-8 font-bold uppercase tracking-widest text-xs">
        <ArrowLeft size={14} className="mr-2" />
        НАЗАД
      </Link>

      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-4">
          {article.category?.name.toLowerCase() !== "огляди" && article.category?.name.toLowerCase() !== "reviews" && (
            <span className="bg-accent text-black px-3 py-1 text-xs font-bold uppercase tracking-widest font-serif">
              {article.category?.name || "Новина"}
            </span>
          )}
          <span className="text-sm font-medium text-zinc-500">
            {article.createdAt.toLocaleDateString("uk-UA")}
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] font-antapani mb-6">
          {article.title}
        </h1>
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center font-bold text-zinc-500">
            {(article.author.name || article.author.email || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-sm">Автор: {article.author.name || article.author.email}</p>
          </div>
        </div>
      </div>

      {article.imageUrl && (
        <div className="w-full mb-10 rounded-2xl overflow-hidden shadow-lg border border-border">
          <Lightbox src={article.imageUrl} alt={article.title}>
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-auto max-h-[300px] md:max-h-[450px] object-cover hover:scale-[1.02] transition duration-700" 
            />
          </Lightbox>
        </div>
      )}

      <div className="prose prose-lg prose-zinc dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-black prose-headings:font-antapani prose-headings:uppercase prose-headings:tracking-tighter transition-colors">
        <div className="whitespace-pre-wrap font-medium text-lg leading-relaxed text-zinc-800 dark:text-zinc-200 transition-colors">
          {renderContentWithMedia(article.content, article.media)}
        </div>
      </div>

      <InteractionBar 
        articleId={article.id} 
        initialLikes={article.likes} 
        initialComments={article.comments} 
        currentUserId={session?.user?.id}
      />
    </div>
  );
}
