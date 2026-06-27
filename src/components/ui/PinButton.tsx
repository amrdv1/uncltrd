"use client";

import { Pin, PinOff } from "lucide-react";
import { useTransition } from "react";
import { togglePinArticle } from "@/app/actions/articles";

export function PinButton({ 
  articleId, 
  isPinned 
}: { 
  articleId: string; 
  isPinned: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await togglePinArticle(articleId);
      } catch (error) {
        console.error("Failed to toggle pin:", error);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`p-2 rounded-lg transition-colors ${
        isPinned 
          ? "text-accent bg-accent/10 hover:bg-accent/20" 
          : "text-zinc-400 hover:text-black hover:bg-zinc-100"
      } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
      title={isPinned ? "Відкріпити" : "Закріпити"}
    >
      {isPinned ? <PinOff size={18} /> : <Pin size={18} />}
    </button>
  );
}
