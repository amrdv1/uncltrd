import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatImageUrl } from "@/lib/utils";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    const body = await req.json();
    const { name, imageBase64, existingImageUrl } = body;

    let image = existingImageUrl || "";

    if (imageBase64) {
      try {
        const uploadResult = await cloudinary.uploader.upload(imageBase64, {
          folder: "uncultured_avatars",
          transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }]
        });
        image = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        return NextResponse.json({ error: "Не вдалося завантажити зображення" }, { status: 400 });
      }
    }

    image = formatImageUrl(image) || "";

    if (name && name !== session.user.name) {
      const existingName = await db.user.findFirst({
        where: { name: { equals: name } }
      });
      if (existingName) {
        return NextResponse.json({ error: "Цей нікнейм вже зайнятий" }, { status: 400 });
      }
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: name || session.user.name,
        image: image !== "" ? image : session.user.image || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
