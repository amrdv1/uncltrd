export async function fetchItunesCover(query: string): Promise<string | null> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      // iTunes provides artworkUrl100, we can change 100x100 to a larger size like 600x600
      if (result.artworkUrl100) {
        return result.artworkUrl100.replace('100x100bb', '600x600bb');
      }
    }
    return null;
  } catch (error) {
    console.error("iTunes fetch error:", error);
    return null;
  }
}
