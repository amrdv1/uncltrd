import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { updateProfile, toggleTwoFactor } from "@/app/actions/user";
import { User, Palette, Shield } from "lucide-react";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { AccentColorPicker } from "@/components/ui/AccentColorPicker";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch latest user data from DB to ensure it's up-to-date
  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-8">
      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] font-serif mb-12">
        Налаштування Профілю
      </h1>

      <div className="bg-white dark:bg-zinc-950 p-8 md:p-12 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors">
        
        <div className="flex items-center space-x-4 md:space-x-6 mb-10 pb-10 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shrink-0">
            {user.image ? (
              <img src={user.image} alt={user.name || "Avatar"} className="w-full h-full object-cover" />
            ) : (
              <User size={40} />
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

        <form action={updateProfile} className="space-y-6">
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
              className="bg-accent text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-colors shadow-lg text-sm"
            >
              Зберегти зміни
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-white dark:bg-zinc-950 p-8 md:p-12 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-8">
          <Palette className="text-accent" size={24} />
          <h2 className="text-2xl font-black uppercase tracking-tighter">Зовнішній вигляд</h2>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 uppercase tracking-wide">Тема інтерфейсу</label>
          <ThemeSwitcher />
          <p className="text-sm text-zinc-500 mt-3 mb-8">Змініть тему на світлу або темну, або виберіть "Авто" для адаптації до налаштувань вашого пристрою.</p>
        </div>

        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
          <label className="block text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 uppercase tracking-wide">Головний колір акцентів</label>
          <AccentColorPicker />
          <p className="text-sm text-zinc-500 mt-4">Оберіть ваш улюблений колір. Він буде використовуватись для кнопок, посилань та інших акцентних елементів по всьому сайту.</p>
        </div>
      </div>
    </div>
  );
}
