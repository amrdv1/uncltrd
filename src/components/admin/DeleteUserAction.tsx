"use client";

import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { deleteUser } from "@/app/(admin)/admin-panel/users/actions";
import { toast } from "sonner";

export function DeleteUserAction({ userId, userName }: { userId: string, userName: string }) {
  const handleDelete = async () => {
    try {
      await deleteUser(userId);
      toast.success(`Користувача ${userName} успішно видалено`);
    } catch (e: any) {
      toast.error(e.message || "Помилка при видаленні користувача");
    }
  };

  return <ConfirmDeleteButton onConfirm={handleDelete} itemType={`користувача ${userName}`} />;
}
