"use server";

import { db } from "@/lib/db";
import { auth, signOut } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;

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
