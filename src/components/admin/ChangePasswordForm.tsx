"use client";

import { useState } from "react";
import { changeUserPassword } from "@/app/(admin)/admin-panel/users/actions";
import { KeyRound, Check, X } from "lucide-react";

import { toast } from "sonner";

export function ChangePasswordForm({ userId, userName }: { userId: string, userName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("newPassword", password);
      
      await changeUserPassword(formData);
      setIsOpen(false);
      setPassword("");
      toast.success(`Пароль для користувача ${userName} успішно змінено!`);
    } catch (error) {
      toast.error("Помилка при зміні пароля");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
        title="Змінити пароль"
      >
        <KeyRound size={16} />
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input 
        type="text" 
        placeholder="Новий пароль" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="px-3 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-accent text-black dark:text-white w-32"
        required
        minLength={6}
      />
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="p-1.5 text-green-600 bg-green-100 dark:bg-green-900/30 rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
      >
        <Check size={14} />
      </button>
      <button 
        type="button" 
        onClick={() => { setIsOpen(false); setPassword(""); }}
        className="p-1.5 text-red-600 bg-red-100 dark:bg-red-900/30 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
      >
        <X size={14} />
      </button>
    </form>
  );
}
