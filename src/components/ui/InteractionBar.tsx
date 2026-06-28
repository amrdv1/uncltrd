"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { toggleLike, submitComment } from "@/app/actions/interactions";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

interface InteractionBarProps {
  articleId: string;
  initialLikes: any[];
  initialComments: any[];
  currentUserId?: string;
}

export function InteractionBar({ articleId, initialLikes, initialComments, currentUserId }: InteractionBarProps) {
  const [comments, setComments] = useState(initialComments);
  const [likes, setLikes] = useState(initialLikes);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasLiked = currentUserId ? likes.some(l => l.userId === currentUserId && l.isLike) : false;
  const hasDisliked = currentUserId ? likes.some(l => l.userId === currentUserId && !l.isLike) : false;

  const upvotes = likes.filter(l => l.isLike).length;
  const downvotes = likes.filter(l => !l.isLike).length;

  const handleLike = async (isLike: boolean) => {
    if (!currentUserId) return setShowLoginAlert(true);
    
    // Optimistic UI update
    let newLikes = [...likes];
    const existing = newLikes.find(l => l.userId === currentUserId);
    
    if (existing) {
      if (existing.isLike === isLike) {
        newLikes = newLikes.filter(l => l.id !== existing.id); // Toggle off
      } else {
        existing.isLike = isLike; // Switch
      }
    } else {
      newLikes.push({ id: "temp", userId: currentUserId, isLike }); // New vote
    }
    
    setLikes(newLikes);
    await toggleLike(articleId, isLike);
  };

  return (
    <>
      <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="flex items-center space-x-6 mb-12">
        <button 
          onClick={() => handleLike(true)}
          className={`flex items-center space-x-2 font-bold px-4 py-2 rounded-full border-2 transition ${hasLiked ? "border-accent text-accent bg-accent/10" : "border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"}`}
        >
          <ThumbsUp size={20} />
          <span>{upvotes}</span>
        </button>
        <button 
          onClick={() => handleLike(false)}
          className={`flex items-center space-x-2 font-bold px-4 py-2 rounded-full border-2 transition ${hasDisliked ? "border-black text-black bg-zinc-100 dark:border-white dark:text-white dark:bg-zinc-900" : "border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"}`}
        >
          <ThumbsDown size={20} />
          <span>{downvotes}</span>
        </button>
      </div>

      <div>
        <h3 className="text-2xl font-black uppercase tracking-widest font-serif mb-6 flex items-center">
          <MessageSquare size={24} className="mr-3 text-accent" /> Коментарі ({comments.length})
        </h3>
        
        {currentUserId ? (
          <form action={async (formData) => {
            const content = formData.get("content") as string;
            if (content) {
              // Very basic optimistic UI for comments
              setComments([...comments, { id: "temp", content, user: { name: "Ви", image: null }, createdAt: new Date() }]);
              await submitComment(articleId, formData);
            }
          }} className="mb-8">
            <textarea 
              name="content" 
              placeholder="Що думаєте?" 
              required
              className="w-full p-4 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-black dark:focus:border-white outline-none resize-none h-24 mb-3 bg-white dark:bg-zinc-900 text-black dark:text-white transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
            <button type="submit" className="bg-accent text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-black transition-colors">
              Надіслати
            </button>
          </form>
        ) : (
          <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-xl mb-8 text-center text-zinc-500 dark:text-zinc-400 font-medium transition-colors">
            <a href="/login" className="text-accent hover:underline font-bold">Увійдіть</a>, щоб залишити коментар.
          </div>
        )}

        <div className="space-y-6">
          {comments.slice().reverse().map((comment: any, i: number) => (
            <div key={i} className="flex space-x-4 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-100 dark:border-zinc-800/50 transition-colors">
              <div className="w-10 h-10 bg-black dark:bg-zinc-800 rounded-full text-white flex items-center justify-center font-bold shrink-0 overflow-hidden">
                {comment.user.image ? (
                  <img src={comment.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (comment.user.name || "U")[0].toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-black dark:text-white">{comment.user.name || "Анонім"}</span>
                  <span className="text-xs text-zinc-400">
                    {new Date(comment.createdAt).toLocaleDateString("uk-UA")}
                  </span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-zinc-400 italic">Ще немає коментарів. Будьте першим!</p>}
        </div>
      </div>
    </div>
      
    {mounted && createPortal(
        <AnimatePresence>
          {showLoginAlert && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-[#111] p-8 rounded-3xl shadow-xl max-w-sm w-full border border-zinc-200 dark:border-zinc-800 text-center relative overflow-hidden"
              >
                <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-black dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>Потрібна авторизація</h3>
                <p className="text-zinc-500 mb-8 font-medium text-sm">Ви повинні увійти, щоб голосувати за статтю.</p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLoginAlert(false)}
                    className="flex-1 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  >
                    ЗРОЗУМІЛО
                  </button>
                  <Link
                    href="/login"
                    className="flex-1 py-3 rounded-xl bg-accent text-white font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors flex items-center justify-center"
                  >
                    УВІЙТИ
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
