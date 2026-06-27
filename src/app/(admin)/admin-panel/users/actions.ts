"use server"

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function changeUserPassword(formData: FormData) {
  const userId = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!userId || !newPassword) {
    throw new Error("Missing required fields");
  }

  const session = await auth();
  const allowedEmails = ["gokrai@uncultured.media", "leanoplav@uncultured.media", "skyti@uncultured.media"];
  if (session?.user?.role !== "ADMIN" && !allowedEmails.includes(session?.user?.email?.toLowerCase() || "")) {
    throw new Error("Unauthorized");
  }

  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  revalidatePath("/admin-panel/users");
  
  return { success: true };
}

export async function changeUserRole(formData: FormData) {
  const userId = formData.get("userId") as string;
  const newRole = formData.get("newRole") as string;

  if (!userId || !newRole) {
    throw new Error("Missing required fields");
  }

  const session = await auth();
  const allowedEmails = ["gokrai@uncultured.media", "leanoplav@uncultured.media", "skyti@uncultured.media"];
  if (session?.user?.role !== "ADMIN" && !allowedEmails.includes(session?.user?.email?.toLowerCase() || "")) {
    throw new Error("Unauthorized");
  }

  // Prevent changing your own role to avoid locking yourself out
  if (session.user.id === userId) {
    throw new Error("Cannot change your own role");
  }

  await db.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  revalidatePath("/admin-panel/users");
  
  return { success: true };
}
