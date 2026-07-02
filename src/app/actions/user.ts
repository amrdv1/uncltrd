"use server";

import { db } from "@/lib/db";
import { auth, signOut } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { formatImageUrl } from "@/lib/utils";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  let image = formData.get("image") as string;
  
  const file = formData.get("avatarFile") as File;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Cloudinary using base64
    const base64Data = buffer.toString("base64");
    const fileUri = `data:${file.type};base64,${base64Data}`;
    
    try {
      const uploadResult = await cloudinary.uploader.upload(fileUri, {
        folder: "uncultured_avatars",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" }
        ]
      });
      image = uploadResult.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Не вдалося завантажити зображення");
    }
  }

  image = formatImageUrl(image) || "";

  if (name && name !== session.user.name) {
    const existingName = await db.user.findFirst({
      where: { name: { equals: name } }
    });
    if (existingName) {
      throw new Error("Цей нікнейм вже зайнятий");
    }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: name || session.user.name,
      image: image !== "" ? image : session.user.image || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/settings");
}

export async function deleteAvatar() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { image: null }
  });

  revalidatePath("/");
  revalidatePath("/settings");
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function toggleTwoFactor(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const isEnabled = formData.get("isTwoFactorEnabled") === "true";

  await db.user.update({
    where: { id: session.user.id },
    data: {
      isTwoFactorEnabled: isEnabled,
    },
  });

  revalidatePath("/settings");
}
