import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }
    
    // Only allow images and videos
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File type must be image or video' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalExt = path.extname(file.name);
    // Sanitize filename and use standard extension if missing
    let ext = originalExt || (file.type.startsWith('image/') ? '.png' : '.mp4');
    
    const filename = `${uniqueSuffix}${ext}`;
    
    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure dir exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }
    
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    // Return URL path
    const fileUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ url: fileUrl, filename });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
