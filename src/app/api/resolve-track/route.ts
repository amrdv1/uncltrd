import { NextResponse } from 'next/server';
import { spotify, youtube } from 'btch-downloader';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  if (searchParams.has('url')) {
    const url = searchParams.get('url')!;
    try {
      if (url.includes('spotify.com')) {
        const result = await spotify(url);
        if (result && result.status && result.result && result.result.formats && result.result.formats.length > 0) {
          const mp3Url = result.result.formats[0].url;
          
          const mp3Response = await fetch(mp3Url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          if (!mp3Response.ok) {
            return NextResponse.json({ error: 'Failed to download MP3 from provider' }, { status: 500 });
          }

          return new Response(mp3Response.body, {
            headers: {
              'Content-Type': 'audio/mpeg',
              'Accept-Ranges': 'bytes',
              'Content-Length': mp3Response.headers.get('content-length') || '',
            }
          });
        } else {
          return NextResponse.json({ error: 'Failed to extract Spotify MP3' }, { status: 400 });
        }
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const result = await youtube(url);
        if (result && result.status && result.mp3) {
          const mp3Response = await fetch(result.mp3, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          if (!mp3Response.ok) {
            return NextResponse.json({ error: 'Failed to download YouTube MP3' }, { status: 500 });
          }

          return new Response(mp3Response.body, {
            headers: {
              'Content-Type': 'audio/mpeg',
              'Accept-Ranges': 'bytes',
              'Content-Length': mp3Response.headers.get('content-length') || '',
            }
          });
        } else {
          return NextResponse.json({ error: 'Failed to extract YouTube MP3' }, { status: 400 });
        }
      } else if (url.includes('apple.com')) {
        const artist = searchParams.get('artist');
        const track = searchParams.get('track');
        if (artist && track) {
          const ytSearch = require('yt-search');
          // Clean the track name from special characters (like '!!!!!') that break yt-search
          const cleanTrack = track.replace(/[^\p{L}\p{N} ]/gu, '').trim() || track;
          const query = `${artist} ${cleanTrack}`;
          const r = await ytSearch(query);
          const videos = r.videos;
          if (videos.length > 0) {
            const firstVideoUrl = videos[0].url;
            const result = await youtube(firstVideoUrl);
            if (result && result.status && result.mp3) {
              const mp3Response = await fetch(result.mp3, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
              });

              if (!mp3Response.ok) {
                return NextResponse.json({ error: 'Failed to download Apple Music via YouTube' }, { status: 500 });
              }

              return new Response(mp3Response.body, {
                headers: {
                  'Content-Type': 'audio/mpeg',
                  'Accept-Ranges': 'bytes',
                  'Content-Length': mp3Response.headers.get('content-length') || '',
                }
              });
            }
          }
        }
        return NextResponse.json({ error: 'Failed to extract Apple Music MP3' }, { status: 400 });
      } else {
        return NextResponse.json({ error: 'Unsupported URL format' }, { status: 400 });
      }
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to process URL' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
}
