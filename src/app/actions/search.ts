"use server";

export async function findTrackMedia(artist: string, track: string) {
  const query = `${artist} ${track}`;
  let coverUrl = null;
  let appleUrl = null;
  let youtubeUrl = null;
  let listenUrl = null;
  let releaseDate = null;

  // 1. Apple Music Search (Broad search for albums/songs)
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        // Try to find exact artist match if possible to avoid wrong covers
        const exactMatch = data.results.find((r: any) => 
          r.artistName?.toLowerCase().includes(artist.toLowerCase()) || 
          artist.toLowerCase().includes(r.artistName?.toLowerCase() || "")
        );
        const bestMatch = exactMatch || data.results[0];
        
        if (bestMatch.artworkUrl100) {
          coverUrl = bestMatch.artworkUrl100.replace("100x100bb", "600x600bb");
        }
        if (bestMatch.trackViewUrl || bestMatch.collectionViewUrl) {
          appleUrl = bestMatch.trackViewUrl || bestMatch.collectionViewUrl;
        }
        
        if (bestMatch.releaseDate) {
          releaseDate = new Date(bestMatch.releaseDate).toISOString().split('T')[0];
        }
      }
    }
  } catch (e) {
    console.error("Apple Music search failed", e);
  }

  // 2. Deezer API Fallback for Cover URL
  if (!coverUrl) {
    try {
      const dzRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
      if (dzRes.ok) {
        const dzData = await dzRes.json();
        if (dzData.data && dzData.data.length > 0) {
          const exactMatch = dzData.data.find((r: any) => 
            r.artist?.name?.toLowerCase().includes(artist.toLowerCase())
          );
          const bestMatch = exactMatch || dzData.data[0];
          
          if (bestMatch.album && bestMatch.album.cover_xl) {
            coverUrl = bestMatch.album.cover_xl;
          } else if (bestMatch.album && bestMatch.album.cover_big) {
            coverUrl = bestMatch.album.cover_big;
          }

          if (!releaseDate && bestMatch.album?.id) {
            try {
              const albumRes = await fetch(`https://api.deezer.com/album/${bestMatch.album.id}`);
              if (albumRes.ok) {
                const albumData = await albumRes.json();
                if (albumData.release_date) {
                  releaseDate = albumData.release_date;
                }
              }
            } catch (e) {
              console.error("Deezer album fetch failed", e);
            }
          }
        }
      }
    } catch (e) {
      console.error("Deezer search failed", e);
    }
  }

  // 3. YouTube Fallback for Listen URL
  if (!youtubeUrl) {
    try {
      const ytRes = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Cookie": "CONSENT=YES+cb.20210328-17-p0.en+FX+478"
        }
      });
      const html = await ytRes.text();
      
      // Extract first video ID
      const match = html.match(/"videoId":"([^"]+)"/);
      if (match) {
        youtubeUrl = `https://www.youtube.com/watch?v=${match[1]}`;
      }
    } catch (e) {
      console.error("YouTube search failed", e);
    }
  }

  // 4. YouTube Fallback for Release Date
  if (!releaseDate) {
    try {
      let videoId = null;
      if (youtubeUrl && youtubeUrl.includes("youtube.com/watch?v=")) {
        videoId = new URL(youtubeUrl).searchParams.get("v");
      } else {
        const ytRes = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
          headers: { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Cookie": "CONSENT=YES+cb.20210328-17-p0.en+FX+478"
          }
        });
        const html = await ytRes.text();
        const match = html.match(/"videoId":"([^"]+)"/);
        if (match) videoId = match[1];
      }
      
      if (videoId) {
        const vRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
          headers: { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Cookie": "CONSENT=YES+cb.20210328-17-p0.en+FX+478"
          }
        });
        const vHtml = await vRes.text();
        const dateMatch = vHtml.match(/<meta itemprop="datePublished" content="([^"]+)">/);
        const altDateMatch = vHtml.match(/"publishDate":"([^"]+)"/);
        
        if (dateMatch) {
          releaseDate = new Date(dateMatch[1]).toISOString().split('T')[0];
        } else if (altDateMatch) {
          releaseDate = new Date(altDateMatch[1]).toISOString().split('T')[0];
        }
      }
    } catch (e) {
      console.error("YouTube date fallback failed", e);
    }
  }

  // Priority for listenUrl if needed as fallback (for backward compatibility if anything else uses it)
  listenUrl = youtubeUrl || appleUrl;

  return { coverUrl, listenUrl, appleUrl, youtubeUrl, releaseDate };
}
