import { NextResponse } from 'next/server';
import { spotify } from 'btch-downloader';

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
          // Fetch the stream and pipe it to the client with correct headers
          const mp3Response = await fetch(mp3Url, {
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
          });

          if (!mp3Response.ok) {
            return NextResponse.json({ error: 'Failed to download MP3 from provider' }, { status: 500 });
          }

          // Return the stream with proper audio/mpeg headers for Safari
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
      } else {
        return NextResponse.json({ error: 'Only Spotify URLs are supported via btch-downloader right now.' }, { status: 400 });
      }
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to process URL' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
}
