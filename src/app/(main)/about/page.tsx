import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Про нас",
  description: "Дізнайтеся більше про проєкт uncultured. — медіа про сучасну українську та світову музику.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 font-sans min-h-[60vh]">
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-10 font-serif" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        Про нас
      </h1>
      
      <div className="prose prose-lg dark:prose-invert prose-zinc max-w-none">
        <p className="text-lg md:text-xl leading-relaxed text-zinc-700 dark:text-zinc-300">
          <strong>uncultured.</strong> — це проєкт, створений для популяризації сучасної української музичної індустрії та руйнування стереотипів про українську музику. 
        </p>
        
        <p className="text-lg md:text-xl leading-relaxed text-zinc-700 dark:text-zinc-300 mt-6">
          Ми хочемо показати, що українська музика — це не «крінж», а якісна, самобутня й різноманітна сцена, яка постійно розвивається та заслуговує на увагу.
        </p>
      </div>
    </div>
  );
}
