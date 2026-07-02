import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import ytSearch from 'yt-search';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');
  const track = searchParams.get('track');
  
  if (!artist || !track) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }
  
  try {
    const searchResult = await ytSearch(`${artist} ${track} audio`);
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
