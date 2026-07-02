import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { InlineAudioHydrator } from "@/components/ui/InlineAudioHydrator";
import { TelegramSpacer } from "@/components/ui/TelegramSpacer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <MobileNav />
      <Sidebar />
      <div className="flex-1 lg:ml-[320px] bg-white dark:bg-transparent text-black dark:text-white min-h-screen flex flex-col transition-colors overflow-x-hidden w-full">
        <TelegramSpacer />
        <main className="flex-1 w-full max-w-[1600px] mx-auto bg-white dark:bg-transparent transition-colors pt-16 lg:pt-0">
          {children}
        </main>
        <Footer />
      </div>
      <InlineAudioHydrator />
    </div>
  );
}
