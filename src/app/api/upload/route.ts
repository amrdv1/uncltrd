import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const convertToGif = formData.get('convertToGif') === 'true';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const resourceType = isVideo ? 'video' : 'image';
    
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          resource_type: resourceType,
          folder: 'uncultured',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(buffer);
    });

    const result = uploadResult as any;
    let finalUrl = result.secure_url;

    // Cloudinary magic: Convert video to GIF on the fly using transformations!
    if (isVideo && convertToGif) {
      // Add transformations for optimized GIF rendering
      finalUrl = finalUrl.replace('/upload/', '/upload/w_800,f_gif,fl_lossy,q_auto,e_loop/');
      // Change extension
      finalUrl = finalUrl.replace(/\.(mp4|webm|mov)$/i, '.gif');
    }

    return NextResponse.json({ url: finalUrl, filename: result.public_id });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : ((error as any)?.message || JSON.stringify(error)) },
      { status: 500 }
    );
  }
}
