import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url || !url.includes('spotify.com/album/')) {
    return NextResponse.json({ error: 'Valid Spotify Album URL is required' }, { status: 400 });
  }

  try {
    const embedUrl = url.replace('open.spotify.com/album/', 'open.spotify.com/embed/album/');
    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch Spotify embed' }, { status: 500 });
    }

    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);

    if (match && match[1]) {
      const data = JSON.parse(match[1]);
      const trackList = data.props.pageProps.state?.data?.entity?.trackList;

      if (!trackList) {
        return NextResponse.json({ error: 'No tracks found' }, { status: 404 });
      }

      const tracks = trackList.map((t: any) => ({
        title: t.title,
        subtitle: t.subtitle,
        url: `https://open.spotify.com/track/${t.uri.split(':')[2]}`
      }));

      return NextResponse.json({ tracks });
    } else {
      return NextResponse.json({ error: 'Could not extract album data' }, { status: 500 });
    }
  } catch (e) {
    console.error('Error fetching spotify album:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
