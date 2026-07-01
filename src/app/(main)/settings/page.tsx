import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { updateProfile, toggleTwoFactor } from "@/app/actions/user";
import { User, Palette, Shield } from "lucide-react";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { AccentColorPicker } from "@/components/ui/AccentColorPicker";
import { SettingsProfileForm } from "./SettingsProfileForm";

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

      <SettingsProfileForm user={{
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role
      }} />

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
