"use client";

import { useState } from "react";
import { updateProfile, deleteAvatar } from "@/app/actions/user";
import { User, Trash2, Loader2 } from "lucide-react";

interface SettingsProfileFormProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
}

export function SettingsProfileForm({ user }: SettingsProfileFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await updateProfile(formData);
    } catch (error) {
      console.error(error);
      alert("Не вдалося зберегти зміни. Спробуйте ще раз.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm("Ви впевнені, що хочете видалити аватарку?")) return;
    
    setIsDeleting(true);
    try {
      await deleteAvatar();
    } catch (error) {
      console.error(error);
      alert("Не вдалося видалити аватарку.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 p-8 md:p-12 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="flex items-center space-x-4 md:space-x-6 mb-10 pb-10 border-b border-zinc-100 dark:border-zinc-800">
        <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0">
          <div className="w-full h-full rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 overflow-hidden border-2 border-zinc-200 dark:border-zinc-800">
            {user.image ? (
              <img src={user.image} alt={user.name || "Avatar"} className="w-full h-full object-cover" />
            ) : (
              <User size={40} />
            )}
          </div>
          {user.image && (
            <button
              type="button"
              onClick={handleDeleteAvatar}
              disabled={isDeleting || isPending}
              className="absolute -bottom-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
              title="Видалити аватарку"
            >
              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white truncate">{user.name || "Користувач"}</h2>
          <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-medium truncate" title={user.email || ""}>{user.email}</p>
          <div className="mt-2 inline-block bg-black dark:bg-white text-accent dark:text-black px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full">
            {user.role}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-2 uppercase tracking-wide">
            Ваше ім'я / Нікнейм
          </label>
          <input 
            name="name" 
            type="text" 
            defaultValue={user.name || ""}
            required 
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white text-lg transition-colors" 
            placeholder="Введіть ваш нікнейм"
          />
        </div>

        <div>
          <input 
            name="image" 
            type="hidden" 
            value={user.image || ""}
          />
          
          <label className="block text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-2 uppercase tracking-wide">
            Аватарка
          </label>
          <input 
            name="avatarFile" 
            type="file" 
            accept="image/*"
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-accent file:text-white hover:file:bg-black transition-all"
          />
        </div>

        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button 
            type="submit" 
            disabled={isPending || isDeleting}
            className="bg-accent text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-colors shadow-lg text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 size={18} className="animate-spin" />}
            {isPending ? "Збереження..." : "Зберегти зміни"}
          </button>
        </div>
      </form>
    </div>
  );
}
