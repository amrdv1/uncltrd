import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: Request, props: { params: Promise<{ filename: string }> }) {
  try {
    const params = await props.params;
    const filename = params.filename;
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    const file = await readFile(filePath);
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filename.endsWith('.png')) contentType = 'image/png';
    else if (filename.endsWith('.gif')) contentType = 'image/gif';
    else if (filename.endsWith('.webp')) contentType = 'image/webp';
    else if (filename.endsWith('.mp4')) contentType = 'video/mp4';

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (err) {
    return new NextResponse('File not found', { status: 404 });
  }
}
