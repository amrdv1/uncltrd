"use server";

import { db } from "@/lib/db";
import { auth, signOut } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { formatImageUrl } from "@/lib/utils";
import fs from "fs/promises";
import path from "path";

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
    
    // Save to public/uploads
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const publicPath = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      await fs.mkdir(publicPath, { recursive: true });
    } catch (e) {}
    
    await fs.writeFile(path.join(publicPath, filename), buffer);
    image = `/uploads/${filename}`;
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
      image: image || null,
    },
  });

  // Revalidate to update sidebar UI
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
