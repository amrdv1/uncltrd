import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import ytSearch from 'yt-search';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');
  const track = searchParams.get('track');
  let searchArtist = artist;
  let searchTrack = track;

  if (searchParams.has('url')) {
    const url = searchParams.get('url')!;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      const match = html.match(/<title>(.*?)<\/title>/);
      if (match && match[1]) {
        // e.g., "Never Gonna Give You Up - song and lyrics by Rick Astley | Spotify"
        const title = match[1].split('|')[0].trim(); 
        searchTrack = title;
        searchArtist = ""; // title usually contains both
      } else {
        return NextResponse.json({ error: 'Could not extract title' }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 });
    }
  } else if (!searchArtist || !searchTrack) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }
  
  try {
    const query = searchArtist ? `${searchArtist} ${searchTrack} audio` : `${searchTrack} audio`;
    const searchResult = await ytSearch(query);
    const video = searchResult.videos[0];
    
    if (!video) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
    
    const readable = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
      cancel() {
        stream.destroy();
      }
    });
    
    return new Response(readable, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Accept-Ranges': 'bytes'
      }
    });
  } catch (err) {
    console.error("YTDL Error:", err);
    return NextResponse.json({ error: 'Stream error' }, { status: 500 });
  }
}
