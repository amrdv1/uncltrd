"use client";

import { changeUserRole } from "@/app/(admin)/admin-panel/users/actions";
import { useState } from "react";
import { toast } from "sonner";

export function ChangeRoleSelect({ userId, currentRole }: { userId: string, currentRole: string }) {
  const [isPending, setIsPending] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (newRole === currentRole) return;
    
    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("newRole", newRole);
      
      await changeUserRole(formData);
      toast.success("Роль успішно змінено");
    } catch (error: any) {
      toast.error(error.message || "Помилка при зміні ролі");
      e.target.value = currentRole; // Reset
    } finally {
      setIsPending(false);
    }
  };

  const getRoleColor = (role: string) => {
    if (role === "ADMIN") return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-500 dark:border-purple-500/20";
    if (role === "EDITOR") return "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-500/10 dark:text-lime-500 dark:border-lime-500/20";
    return "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
  };

  return (
    <div className="relative inline-block">
      <select 
        defaultValue={currentRole}
        onChange={handleChange}
        disabled={isPending}
        className={`appearance-none px-3 py-1 pr-6 text-[9px] rounded-full font-black uppercase tracking-widest border focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer transition-colors ${getRoleColor(currentRole)} ${isPending ? 'opacity-50' : ''}`}
      >
        <option value="USER" className="text-black bg-white dark:bg-[#111] dark:text-white">USER</option>
        <option value="EDITOR" className="text-black bg-white dark:bg-[#111] dark:text-white">EDITOR</option>
        <option value="ADMIN" className="text-black bg-white dark:bg-[#111] dark:text-white">ADMIN</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current">
        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
}
