"use server";

export async function findTrackMedia(artist: string, track: string) {
  const query = `${artist} ${track}`;
  let coverUrl = null;
  let listenUrl = null;
  let releaseDate = null;

  // 1. Apple Music Search
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        // Try to find exact artist match if possible to avoid wrong covers
        const exactMatch = data.results.find((r: any) => 
          r.artistName.toLowerCase().includes(artist.toLowerCase()) || 
          artist.toLowerCase().includes(r.artistName.toLowerCase())
        );
        const bestMatch = exactMatch || data.results[0];
        
        coverUrl = bestMatch.artworkUrl100.replace("100x100bb", "600x600bb");
        listenUrl = bestMatch.trackViewUrl;
        
        if (bestMatch.releaseDate) {
          releaseDate = new Date(bestMatch.releaseDate).toISOString().split('T')[0];
        }
      }
    }
  } catch (e) {
    console.error("Apple Music search failed", e);
  }

  // 2. Spotify Fallback via DuckDuckGo
  if (!listenUrl || !coverUrl) {
    try {
      const ddgRes = await fetch(`https://html.duckduckgo.com/html/?q=site:open.spotify.com/track+${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const ddgHtml = await ddgRes.text();
      const spotifyMatch = ddgHtml.match(/open\.spotify\.com%2Ftrack%2F([a-zA-Z0-9]+)/);
      if (spotifyMatch && !listenUrl) {
        listenUrl = `https://open.spotify.com/track/${spotifyMatch[1]}`;
      }
    } catch (e) {
      console.error("Spotify DDG search failed", e);
    }
  }

  // 3. YouTube Fallback for Listen URL
  if (!listenUrl) {
    try {
      const ytRes = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      const html = await ytRes.text();
      
      // Extract first video ID
      const match = html.match(/"videoId":"([^"]+)"/);
      if (match) {
        listenUrl = `https://www.youtube.com/watch?v=${match[1]}`;
      }
    } catch (e) {
      console.error("YouTube search failed", e);
    }
  }

  // 4. YouTube Fallback for Release Date
  if (!releaseDate) {
    try {
      let videoId = null;
      if (listenUrl && listenUrl.includes("youtube.com/watch?v=")) {
        videoId = new URL(listenUrl).searchParams.get("v");
      } else {
        const ytRes = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
        });
        const html = await ytRes.text();
        const match = html.match(/"videoId":"([^"]+)"/);
        if (match) videoId = match[1];
      }
      
      if (videoId) {
        const vRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
        });
        const vHtml = await vRes.text();
        const dateMatch = vHtml.match(/<meta itemprop="datePublished" content="([^"]+)">/);
        if (dateMatch) {
          releaseDate = new Date(dateMatch[1]).toISOString().split('T')[0];
        }
      }
    } catch (e) {
      console.error("YouTube date fallback failed", e);
    }
  }

  // 5. Genius Fallback via DuckDuckGo for Cover URL
  if (!coverUrl) {
    try {
      const ddgRes = await fetch(`https://html.duckduckgo.com/html/?q=site:genius.com+${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const ddgHtml = await ddgRes.text();
      const geniusMatch = ddgHtml.match(/genius\.com%2F([^&"']+)/);
      if (geniusMatch) {
        const geniusUrl = `https://genius.com/${decodeURIComponent(geniusMatch[1])}`;
        const gRes = await fetch(geniusUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const gHtml = await gRes.text();
        const coverMatch = gHtml.match(/<meta property="og:image" content="([^"]+)"/);
        if (coverMatch) {
          coverUrl = coverMatch[1];
        }
      }
    } catch (e) {
      console.error("Genius fallback failed", e);
    }
  }

  // 6. SoundCloud Fallback via DuckDuckGo for Listen URL
  if (!listenUrl) {
    try {
      const ddgRes = await fetch(`https://html.duckduckgo.com/html/?q=site:soundcloud.com+${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const ddgHtml = await ddgRes.text();
      const scMatch = ddgHtml.match(/soundcloud\.com%2F([^&"']+)/);
      if (scMatch) {
        listenUrl = `https://soundcloud.com/${decodeURIComponent(scMatch[1])}`;
      }
    } catch (e) {
      console.error("SoundCloud fallback failed", e);
    }
  }

  return { coverUrl, listenUrl, releaseDate };
}
