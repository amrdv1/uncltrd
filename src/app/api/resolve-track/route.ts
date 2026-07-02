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
          return NextResponse.redirect(mp3Url);
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
