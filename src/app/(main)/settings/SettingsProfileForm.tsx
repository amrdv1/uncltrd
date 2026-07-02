"use client";

import { useState } from "react";
import { updateProfile, updateProfileJson, deleteAvatar } from "@/app/actions/user";
import { User, Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SettingsProfileFormProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
}

export function SettingsProfileForm({ user }: SettingsProfileFormProps) {
  const { update } = useSession();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const newName = formData.get("name") as string;
      const existingImage = formData.get("image") as string;
      const file = formData.get("avatarFile") as File;
      
      let base64Data: string | null = null;
      if (file && file.size > 0) {
        // Convert to Base64
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const b64 = window.btoa(binary);
        base64Data = `data:${file.type};base64,${b64}`;
      }

      // Use JSON Server Action instead of FormData to prevent iOS Safari/WKWebView fetch bugs
      const result = await updateProfileJson(newName, base64Data, existingImage);
      
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      
      // Force NextAuth to update the session cookie so the new name/avatar is reflected immediately
      try {
        await update({ name: newName });
      } catch (updateError) {
        console.error("NextAuth update error:", updateError);
        // We continue even if update fails, because router.refresh() will update the Server Component UI
      }
      
      // Refresh the page data so the Server Component UI updates with the new user prop
      router.refresh();
      
      toast.success("Зміни успішно збережено!");
    } catch (error) {
      console.error(error);
      toast.error("Не вдалося зберегти зміни. Спробуйте ще раз.");
    } finally {
      setIsPending(false);
    }
  };

  const confirmDeleteAvatar = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    try {
      await deleteAvatar();
      
      // Update session to reflect removed avatar
      await update();
      
      router.refresh();
      
      toast.success("Аватарку видалено!");
    } catch (error) {
      console.error(error);
      toast.error("Не вдалося видалити аватарку.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>
            
            <h3 className="text-2xl font-black text-center mb-2">
              Видалити аватарку?
            </h3>
            <p className="text-center text-muted-foreground mb-8 font-medium">
              Ваша фотографія буде назавжди видалена з нашої бази даних. Цю дію неможливо скасувати.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-4 px-6 rounded-xl font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
              >
                Скасувати
              </button>
              <button 
                onClick={confirmDeleteAvatar}
                className="flex-1 py-4 px-6 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-500/30"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card text-card-foreground p-8 md:p-12 rounded-2xl shadow-sm border border-border transition-colors">
        <div className="flex items-center space-x-4 md:space-x-6 mb-10 pb-10 border-b border-border">
          <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0">
            <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center text-muted-foreground overflow-hidden border-2 border-border">
              {user.image ? (
                <img src={user.image} alt={user.name || "Avatar"} className="w-full h-full object-cover" />
              ) : (
                <User size={40} />
              )}
            </div>
            {user.image && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting || isPending}
                className="absolute -bottom-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center border-2 border-white dark:border-zinc-950"
                title="Видалити аватарку"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold truncate">{user.name || "Користувач"}</h2>
            <p className="text-sm md:text-base text-muted-foreground font-medium truncate" title={user.email || ""}>{user.email}</p>
            <div className="mt-2 inline-block bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full">
              {user.role}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              Ваше ім'я / Нікнейм
            </label>
            <input 
              name="name" 
              type="text" 
              defaultValue={user.name || ""}
              required 
              className="w-full px-4 py-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-lg transition-colors" 
              placeholder="Введіть ваш нікнейм"
            />
          </div>

          <div>
            <input 
              name="image" 
              type="hidden" 
              value={user.image || ""}
            />
            
            <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              Аватарка
            </label>
            <input 
              name="avatarFile" 
              type="file" 
              accept="image/*"
              className="w-full px-4 py-3 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-accent file:text-white hover:file:bg-primary hover:file:text-primary-foreground transition-all"
            />
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
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
    </>
  );
}
