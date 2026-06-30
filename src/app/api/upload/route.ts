import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

if (ffmpegStatic && existsSync(ffmpegStatic)) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
} else {
  console.log("Could not find ffmpeg-static binary, relying on system ffmpeg");
}

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

    const isVideo = file.type.startsWith('video/');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalExt = path.extname(file.name);
    // Sanitize filename and use standard extension if missing
    let ext = originalExt || (isVideo ? '.mp4' : '.png');
    
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
    
    let finalUrl = `/uploads/${filename}`;
    let finalFilename = filename;

    const convertToGif = formData.get('convertToGif') === 'true';

    if (isVideo && convertToGif) {
      const gifFilename = `${uniqueSuffix}.gif`;
      const gifFilePath = path.join(uploadDir, gifFilename);
      
      await new Promise<void>((resolve, reject) => {
        ffmpeg(filePath)
          .outputOptions([
            '-vf', 'fps=12,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
            '-loop', '0'
          ])
          .toFormat('gif')
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .save(gifFilePath);
      });

      // Cleanup original video
      try {
        await unlink(filePath);
      } catch (e) {
        console.error('Failed to delete original video:', e);
      }

      finalUrl = `/uploads/${gifFilename}`;
      finalFilename = gifFilename;
    }

    return NextResponse.json({ url: finalUrl, filename: finalFilename });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
