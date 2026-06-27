"use client";

import { useState } from "react";
import { Save, Globe, Palette, Shield, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { updateSiteConfig } from "@/app/actions/config";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { AccentColorPicker } from "@/components/ui/AccentColorPicker";
import { FadeIn } from "@/components/ui/FadeIn";

export default function SettingsClient({ initialConfig }: { initialConfig: any }) {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: "general", name: "Загальні", icon: <Globe size={18} /> },
    { id: "appearance", name: "Зовнішній вигляд", icon: <Palette size={18} /> },
  ];

  return (
    <FadeIn className="max-w-6xl mx-auto pb-12">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)"}}>
          Налаштування Системи<span className="text-accent">.</span>
        </h1>
        <p className="text-zinc-500 mt-2 font-medium">Керуйте глобальними параметрами вашого журналу.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-[#111] rounded-3xl p-4 shadow-sm border border-zinc-200 dark:border-zinc-800 sticky top-8 transition-colors">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                    activeTab === tab.id 
                      ? "bg-zinc-100 text-black border border-zinc-200 dark:bg-[#1a1a1a] dark:text-white dark:border-zinc-700/50" 
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-black dark:hover:bg-[#151515] dark:hover:text-white"
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-[#111] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors relative">
            
            {/* General Tab */}
            {activeTab === "general" && (
              <form action={async (formData) => {
                setSaving(true);
                await updateSiteConfig(formData);
                setSaving(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
              }}>
                <div className="p-8 md:p-12 relative z-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 text-black dark:text-white">Загальні налаштування</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Назва сайту</label>
                      <input 
                        type="text" 
                        name="siteName"
                        defaultValue={initialConfig.siteName}
                        className="w-full px-5 py-4 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white font-bold transition-colors" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Опис сайту (SEO)</label>
                      <textarea 
                        name="description"
                        defaultValue={initialConfig.description}
                        rows={3}
                        className="w-full px-5 py-4 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white transition-colors resize-none" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Контактний Email</label>
                        <input 
                          type="email" 
                          name="contactEmail"
                          defaultValue={initialConfig.contactEmail}
                          className="w-full px-5 py-4 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Мова за замовчуванням</label>
                        <select 
                          name="language"
                          defaultValue={initialConfig.language || "uk"}
                          className="w-full px-5 py-4 bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-accent text-black dark:text-white transition-colors appearance-none"
                        >  <option>Українська</option>
                          <option>English</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-800/50 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-black text-xs"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      <span>Зберегти зміни</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="p-8 md:p-12 relative z-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 text-black dark:text-white">Зовнішній вигляд</h2>
                
                <div className="space-y-12">
                  <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                      <Palette size={14} className="text-purple-500" />
                      Тема сайту
                    </h3>
                    <div className="p-6 border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-[#151515] rounded-2xl">
                      <ThemeSwitcher />
                    </div>
                    <p className="text-xs text-zinc-500 mt-3 font-medium">Оберіть основну тему для клієнтської частини сайту. Тема адмін-панелі перемикається разом із системою.</p>
                  </div>

                  <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800/50">
                    <h3 className="text-[10px] font-bold text-zinc-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={14} className="text-accent" />
                      Акцентний колір
                    </h3>
                    <div className="p-6 border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-[#151515] rounded-2xl">
                      <AccentColorPicker />
                    </div>
                    <p className="text-xs text-zinc-500 mt-4 font-medium">Цей колір використовується для кнопок, посилань та важливих елементів на сайті.</p>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    </FadeIn>
  );
}
