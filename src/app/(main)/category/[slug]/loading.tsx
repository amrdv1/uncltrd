import { Loader2 } from "lucide-react";

export default function CategoryLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center w-full">
      <Loader2 size={48} className="animate-spin text-zinc-300 dark:text-zinc-700" />
      <p className="mt-4 text-sm font-bold uppercase tracking-widest text-zinc-500">Завантаження...</p>
    </div>
  );
}
