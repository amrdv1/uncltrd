"use server";

export async function findTrackMedia(artist: string, track: string) {
  let coverUrl = null;
  let appleUrl = null;
  let youtubeUrl = null;
  let listenUrl = null;
  let releaseDate = null;

  // Clean the track name to improve Apple Music search accuracy
  const cleanTrack = track.replace(/\(feat\..*?\)/i, '').replace(/\[.*?\]/g, '').trim();
  const appleQuery = `${artist} ${cleanTrack}`;
  const query = `${artist} ${track}`;

  // 1. Apple Music Search via iTunes API (Robust)
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(appleQuery)}&entity=song&limit=10`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        // Try to find exact artist and track match
        const exactMatch = data.results.find((r: any) => {
          const rArtist = (r.artistName || "").toLowerCase();
          const rTrack = (r.trackName || "").toLowerCase();
          const sArtist = artist.toLowerCase();
          const sTrack = cleanTrack.toLowerCase();
          
          const artistMatch = rArtist.includes(sArtist) || sArtist.includes(rArtist) || rArtist.includes(sArtist.split(' ')[0]);
          const trackMatch = rTrack.includes(sTrack) || sTrack.includes(rTrack);
          return artistMatch && trackMatch;
        });
        
        if (exactMatch) {
          if (exactMatch.artworkUrl100) {
            coverUrl = exactMatch.artworkUrl100.replace("100x100bb", "600x600bb");
          }
          if (exactMatch.trackViewUrl || exactMatch.collectionViewUrl) {
            appleUrl = exactMatch.trackViewUrl || exactMatch.collectionViewUrl;
          }
          
          if (exactMatch.releaseDate) {
            releaseDate = new Date(exactMatch.releaseDate).toISOString().split('T')[0];
          }
        }
      }
    }
  } catch (e) {
    console.error("Apple Music search failed", e);
  }

  // 1.5 Spotify API Search (Official & Robust)
  if (!listenUrl && process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID.trim();
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET.trim();
      
      // Get Spotify Access Token
      const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64")
        },
        body: "grant_type=client_credentials"
      });
      
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        
        // Search for track with limit 10 to find exact match
        const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`
          }
        });
        
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.tracks?.items?.length > 0) {
            const exactMatch = searchData.tracks.items.find((item: any) => {
              const rTrack = (item.name || "").toLowerCase();
              const sArtist = artist.toLowerCase();
              const sTrack = cleanTrack.toLowerCase();
              
              // Check all artists on the track
              const artistMatch = item.artists.some((a: any) => {
                const aName = (a.name || "").toLowerCase();
                return aName.includes(sArtist) || sArtist.includes(aName) || aName.includes(sArtist.split(' ')[0]);
              });
              
              const trackMatch = rTrack.includes(sTrack) || sTrack.includes(rTrack);
              return artistMatch && trackMatch;
            });

            if (exactMatch) {
              listenUrl = exactMatch.external_urls.spotify;
            }
          }
        }
      }
    } catch (e) {
      console.error("Spotify API search failed", e);
    }
  }

  // 2. Deezer API Fallback for Cover URL
  if (!coverUrl) {
    try {
      const dzRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
      if (dzRes.ok) {
        const dzData = await dzRes.json();
        if (dzData.data && dzData.data.length > 0) {
          const exactMatch = dzData.data.find((r: any) => {
            const rArtist = (r.artist?.name || "").toLowerCase();
            const rTrack = (r.title || "").toLowerCase();
            const sArtist = artist.toLowerCase();
            const sTrack = cleanTrack.toLowerCase();
            
            const artistMatch = rArtist.includes(sArtist) || sArtist.includes(rArtist) || rArtist.includes(sArtist.split(' ')[0]);
            const trackMatch = rTrack.includes(sTrack) || sTrack.includes(rTrack);
            return artistMatch && trackMatch;
          });
          
          if (exactMatch) {
            if (exactMatch.album && exactMatch.album.cover_xl) {
              coverUrl = exactMatch.album.cover_xl;
            } else if (exactMatch.album && exactMatch.album.cover_big) {
              coverUrl = exactMatch.album.cover_big;
            }

            if (!releaseDate && exactMatch.album?.id) {
              try {
                const albumRes = await fetch(`https://api.deezer.com/album/${exactMatch.album.id}`);
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

  // Do not override listenUrl with youtubeUrl/appleUrl so that S field is kept for Spotify/Other
  listenUrl = null;

  return { coverUrl, listenUrl, appleUrl, youtubeUrl, releaseDate };
}
