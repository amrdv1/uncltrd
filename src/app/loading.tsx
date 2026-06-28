import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
      <Loader2 size={48} className="animate-spin text-black dark:text-white mb-4" />
      <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">Завантаження...</p>
    </div>
  );
}
