"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import { findTrackMedia } from "@/app/actions/search";
import { resetAdminRatings } from "@/app/actions/articles";

const AdminSlider = ({ label, value, setter, max, name }: any) => (
  <div>
    <div className="flex justify-between mb-1">
      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{label}</label>
      <span className="text-[10px] font-bold text-accent">{Math.round(value)} / {max}</span>
    </div>
    <input 
      type="hidden" 
      name={name} 
      value={Math.round(value)} 
    />
    <input 
      type="range" 
      min="0" 
      max={max} 
      step="0.01"
      value={value} 
      onChange={(e) => setter(Number(e.target.value))}
      className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
    />
  </div>
);

export function TrackReviewManager({ initialData, forceReview = false }: { initialData?: any, forceReview?: boolean }) {
  const [isTrackReview, setIsTrackReview] = useState(forceReview || (initialData ? true : false));
  const [artistName, setArtistName] = useState(initialData?.artistName || "");
  const [trackName, setTrackName] = useState(initialData?.trackName || "");
  const [releaseType, setReleaseType] = useState(initialData?.releaseType || "SINGLE");
  const [releaseDate, setReleaseDate] = useState(
    initialData?.releaseDate 
      ? new Date(initialData.releaseDate).toISOString().split('T')[0] 
      : ""
  );
  const [coverUrl, setCoverUrl] = useState(initialData?.coverUrl || "");
  const [listenUrl, setListenUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetRatings = async () => {
    if (!initialData?.articleId) return;
    if (!confirm("Ви впевнені, що хочете скинути всі оцінки редакції для цієї статті? Це видалить всі голоси адміністраторів.")) return;
    
    setResetting(true);
    try {
      await resetAdminRatings(initialData.articleId);
      alert("Оцінки редакції успішно скинуті!");
    } catch (e) {
      alert("Помилка при скиданні оцінок.");
    }
    setResetting(false);
  };

  const handleSearch = async () => {
    if (!artistName || !trackName) return alert("Введіть ім'я артиста та назву треку");
    setLoading(true);
    try {
      const result = await findTrackMedia(artistName, trackName);
      if (result.coverUrl) {
        setCoverUrl(result.coverUrl);
      }
      
      if (result.listenUrl) {
        setListenUrl(result.listenUrl);
      }

      if (result.releaseDate) {
        setReleaseDate(result.releaseDate);
      }

      if (!result.coverUrl && !result.releaseDate) {
        alert("Обкладинку та дату релізу не знайдено. Вставте їх вручну.");
      } else if (!result.coverUrl) {
        alert("Обкладинку не знайдено. Вставте посилання вручну.");
      } else if (!result.releaseDate) {
        alert("Дату релізу не знайдено. Вставте її вручну.");
      }
    } catch (e) {
      alert("Помилка пошуку");
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setter(data.url);
      } else {
        alert(data.error || "Помилка завантаження");
      }
    } catch (err) {
      alert("Помилка завантаження");
    }
    setLoading(false);
  };
  return (
    <div className="space-y-4">
      {!forceReview && (
        <div className="flex items-center space-x-3 mb-6 bg-zinc-50 dark:bg-[#151515] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <input 
            type="checkbox" 
            id="isTrackReview" 
            name="isTrackReview" 
            checked={isTrackReview} 
            onChange={(e) => setIsTrackReview(e.target.checked)}
            className="w-5 h-5 text-accent border-2 border-zinc-300 dark:border-zinc-700 rounded focus:ring-accent cursor-pointer bg-transparent"
          />
          <label htmlFor="isTrackReview" className="font-bold uppercase tracking-widest text-[10px] text-black dark:text-white cursor-pointer select-none">
            Ця стаття — Огляд Треку (Рейтинг)
          </label>
        </div>
      )}

      {forceReview && (
        <input type="hidden" name="isTrackReview" value="true" />
      )}

      {isTrackReview && (
        <div className="bg-zinc-50 dark:bg-[#111] p-8 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2 border-b border-zinc-200 dark:border-zinc-800/50 pb-4">
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">🎵</div>
            <h3 className="font-black uppercase tracking-widest text-sm text-black dark:text-white">Параметри треку</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Виконавець</label>
              <input 
                type="text" 
                name="artistName" 
                value={artistName} 
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-accent text-black dark:text-white transition-colors"
                placeholder="Наприклад: Kanye West"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Назва треку/релізу</label>
              <input 
                type="text" 
                name="trackName" 
                value={trackName} 
                onChange={(e) => setTrackName(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-accent text-black dark:text-white transition-colors"
                placeholder="Наприклад: Runaway"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Тип релізу</label>
              <select 
                name="releaseType"
                value={releaseType}
                onChange={(e) => setReleaseType(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-accent text-black dark:text-white transition-colors appearance-none"
              >
                <option value="SINGLE">Сингл</option>
                <option value="EP">EP (Міні-альбом)</option>
                <option value="ALBUM">Альбом</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Дата релізу</label>
              <input 
                type="date" 
                name="releaseDate"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-accent text-black dark:text-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Обкладинка (URL або Файл)</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                name="coverUrl" 
                value={coverUrl} 
                onChange={(e) => setCoverUrl(e.target.value)}
                className="flex-1 px-4 py-3 bg-white dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-accent text-black dark:text-white transition-colors text-sm"
                placeholder="https://..."
              />
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-black text-white dark:bg-white dark:text-black px-6 rounded-xl font-bold uppercase tracking-widest hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center text-xs h-[46px]"
                >
                  {loading ? "Пошук..." : <><Search size={16} className="mr-2" /> Знайти</>}
                </button>
                <label className="bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white px-6 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center text-xs h-[46px]">
                  Завантажити
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, setCoverUrl)} disabled={loading} />
                </label>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Вставте URL, знайдіть автоматично або завантажте файл з комп'ютера.</p>
          </div>

          {coverUrl && (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm mt-4">
              <Image src={coverUrl} alt="Cover Preview" fill className="object-cover" unoptimized={coverUrl.toLowerCase().endsWith('.gif') || coverUrl.includes('tiktokcdn.com') || coverUrl.includes('byteimg.com')} />
            </div>
          )}

          <div className="pt-4">
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Посилання на трек (Слухати) або Аудіофайл</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                name="listenUrl" 
                value={listenUrl} 
                onChange={(e) => setListenUrl(e.target.value)}
                className="flex-1 px-4 py-3 bg-white dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-accent text-black dark:text-white transition-colors text-sm"
                placeholder="https://music.apple.com/... або Spotify / YouTube"
              />
              <label className="bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white px-6 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center text-xs h-[46px]">
                Завантажити трек
                <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleUpload(e, setListenUrl)} disabled={loading} />
              </label>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase tracking-widest">Вставте URL або завантажте аудіофайл (.mp3, .wav) напряму.</p>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800/50 my-6" />

          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h4 className="font-bold uppercase tracking-widest text-[10px] text-accent">Оцінювання Треку</h4>
              
              {initialData?.articleId && (
                <button 
                  type="button" 
                  onClick={handleResetRatings}
                  disabled={resetting}
                  className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  {resetting ? "Скидання..." : "Анулювати Оцінки Редакції"}
                </button>
              )}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Після публікації огляду, зайдіть на сторінку статті на сайті і залиште свою індивідуальну оцінку через віджет. Загальна оцінка редакції буде автоматично розрахована як середнє значення оцінок усіх адміністраторів.</p>
          </div>
        </div>
      )}
    </div>
  );
}
