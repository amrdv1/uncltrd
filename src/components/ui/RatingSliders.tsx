"use client";

import { useState } from "react";
import { submitTrackRating } from "@/app/actions/interactions";
import { motion } from "framer-motion";

const Slider = ({ label, value, setter, max, score, overallScore, delay, disabled }: any) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="mb-6"
  >
    <div className="flex justify-between items-end mb-2">
      <span className="font-bold text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-300">{label}</span>
      <div className="text-right">
        <span className="text-2xl font-black text-black dark:text-white">{Math.round(value) || "-"}</span>
        <span className="text-xs text-zinc-500 ml-1">/ {max}</span>
      </div>
    </div>
    
    <input 
      type="range" 
      min="1" 
      max={max} 
      step="0.01"
      value={value || 1} 
      onChange={(e) => setter(Number(e.target.value))}
      className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent"
      disabled={disabled}
    />
    <div className="flex justify-between text-[10px] font-bold text-zinc-600 mt-1 uppercase">
      <span>Ваша: {Math.round(value) || 0}</span>
      <span>Середня: {overallScore?.toFixed(1) || 0}</span>
    </div>
  </motion.div>
);

export function RatingSliders({ articleId, initialUserRating, totalScores, currentUserId, dynamicAdminTotal }: any) {
  const [text, setText] = useState(initialUserRating?.text || 0);
  const [beats, setBeats] = useState(initialUserRating?.beats || 0);
  const [sound, setSound] = useState(initialUserRating?.sound || 0);
  const [vibe, setVibe] = useState(initialUserRating?.vibe || 0);
  const [charisma, setCharisma] = useState(initialUserRating?.charisma || 0);
  const [content, setContent] = useState(initialUserRating?.content || "");
  const [loading, setLoading] = useState(false);

  // Overall calculations based on all users (passed down from server)
  const isRated = !!initialUserRating;
  const userTotal = Math.round(text + beats + sound + vibe + charisma);
  const publicTotal = Math.round(totalScores?.totalScore || 0);
  const adminTotal = dynamicAdminTotal || totalScores?.adminTotal || 0;

  const handleSubmit = async () => {
    if (!currentUserId) return alert("Потрібно увійти, щоб оцінювати!");
    if (!text || !beats || !sound || !vibe || !charisma) {
      return alert("Оцініть усі критерії!");
    }
    if (!content || !content.trim()) {
      return alert("Напишіть короткий коментар-аргументацію до вашої оцінки!");
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append("text", Math.round(text).toString());
    formData.append("beats", Math.round(beats).toString());
    formData.append("sound", Math.round(sound).toString());
    formData.append("vibe", Math.round(vibe).toString());
    formData.append("charisma", Math.round(charisma).toString());
    if (content) formData.append("content", content);
    
    await submitTrackRating(articleId, formData);
    setLoading(false);
  };

  return (
    <div className="bg-zinc-50 dark:bg-[#111] rounded-2xl p-6 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden transition-colors">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row gap-12">
        
        {/* Left side: Total Score */}
        <div className="lg:w-1/3 flex flex-col justify-center items-center lg:items-start border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 pb-8 lg:pb-0 lg:pr-8">
          <div className="text-center lg:text-left mb-6 w-full">
            <h4 className="text-accent font-bold tracking-widest text-xs uppercase mb-2">Оцінка Редакції</h4>
            <div className="flex items-baseline justify-center lg:justify-start">
              <span className="text-6xl lg:text-7xl font-black text-black dark:text-white tracking-tighter" style={{ fontFamily: "var(--font-space-grotesk)"}}>
                {adminTotal || "-"}
              </span>
              <span className="text-lg lg:text-xl text-zinc-500 font-bold ml-2">/ 50</span>
            </div>
          </div>
          
          <div className="text-center lg:text-left w-full">
            <h4 className="text-blue-500 font-bold tracking-widest text-xs uppercase mb-2">Оцінка Користувачів</h4>
            <div className="flex items-baseline justify-center lg:justify-start">
              <span className="text-5xl lg:text-6xl font-black text-black dark:text-white tracking-tighter" style={{ fontFamily: "var(--font-space-grotesk)"}}>
                {publicTotal || "-"}
              </span>
              <span className="text-base lg:text-lg text-zinc-500 font-bold ml-2">/ 50</span>
            </div>
          </div>

          {currentUserId && isRated && (
            <div className="mt-6 inline-block bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 transition-colors">
              Ваш бал: <span className="text-black dark:text-white">{userTotal}</span>
            </div>
          )}
        </div>

        {/* Right side: Sliders */}
        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <Slider label="Текст / Рими" value={text} setter={setText} max={10} score={text} overallScore={totalScores?.scoreText} delay={0.1} disabled={!currentUserId} />
          <Slider label="Біт" value={beats} setter={setBeats} max={10} score={beats} overallScore={totalScores?.scoreBeats} delay={0.2} disabled={!currentUserId} />
          <Slider label="Звучання" value={sound} setter={setSound} max={10} score={sound} overallScore={totalScores?.scoreSound} delay={0.3} disabled={!currentUserId} />
          <Slider label="Вайб" value={vibe} setter={setVibe} max={10} score={vibe} overallScore={totalScores?.scoreVibe} delay={0.4} disabled={!currentUserId} />
          <Slider label="Харизма" value={charisma} setter={setCharisma} max={10} score={charisma} overallScore={totalScores?.scoreCharisma} delay={0.5} disabled={!currentUserId} />
        </div>
      </div>

      {currentUserId && (
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 relative z-10 transition-colors">
          <label className="block text-zinc-500 dark:text-zinc-400 font-bold tracking-widest text-xs uppercase mb-3">Ваша Рецензія <span className="text-red-500">(Обов'язково)</span></label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Напишіть свою думку про цей трек..."
            className="w-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-black dark:text-white text-sm outline-none focus:border-accent transition-colors resize-none h-24"
          />
        </div>
      )}

      <div className="mt-6 flex justify-end relative z-10">
        {currentUserId ? (
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-accent text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "Збереження..." : (isRated ? "Оновити оцінку" : "Оцінити трек")}
          </button>
        ) : (
          <div className="text-sm text-zinc-500 font-bold uppercase tracking-widest">
            Увійдіть, щоб оцінити
          </div>
        )}
      </div>
    </div>
  );
}
