import Link from "next/link";
import Image from "next/image";
import { PrivacyPolicyModal } from "@/components/ui/PrivacyPolicyModal";
export function Footer() {
  return (
    <footer className="bg-black text-white py-16 px-6 lg:px-12 border-t border-zinc-900 mt-20 font-sans">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Uncultured Logo"
              width={240}
              height={60}
              className="mb-6 animate-logo-pulse origin-left invert brightness-0"
            />
          </Link>
          <p className="text-zinc-400 max-w-sm mb-8 text-lg">
            Головний голос сучасного хіп-хопу та андеграунд-культури.
          </p>
          <div className="flex items-center space-x-6 text-zinc-400">
            <Link href="https://t.me/uncultured_media" target="_blank" rel="noopener noreferrer" className="hover:text-lime-400 transition-colors">
              <span className="sr-only">Telegram</span>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.2 3.45-.49.33-.94.5-1.34.49-.45-.01-1.3-.25-1.93-.46-.78-.26-1.4-.4-1.35-.85.03-.23.36-.47 1-.74 3.94-1.71 6.57-2.85 7.89-3.4 3.75-1.56 4.53-1.84 5.04-1.85.11 0 .36.03.49.14.11.09.14.22.15.33-.01.07-.01.12-.02.2z" />
              </svg>
            </Link>
            <Link href="#" className="hover:text-lime-400 transition-colors">
              <span className="sr-only">Instagram</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </Link>
            <Link href="#" className="hover:text-lime-400 transition-colors">
              <span className="sr-only">TikTok</span>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19.321 5.562a5.122 5.122 0 0 1-3.552-1.332 5.105 5.105 0 0 1-1.36-3.522h-3.442v15.221a3.633 3.633 0 1 1-3.633-3.633 3.59 3.59 0 0 1 1.761.455v-3.765a7.352 7.352 0 0 0-1.761-.212 7.382 7.382 0 1 0 7.382 7.382V8.497a8.55 8.55 0 0 0 4.605 1.341V6.264a5.132 5.132 0 0 1-1.29-.11z" /></svg>
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold uppercase mb-6 tracking-wider font-serif text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>Розділи</h3>
          <ul className="flex flex-col space-y-4 text-zinc-400">
            <li><Link href="/news" className="hover:text-white transition-colors">Новини</Link></li>
            <li><Link href="/category/singles" className="hover:text-white transition-colors">Сингли</Link></li>
            <li><Link href="/category/albums" className="hover:text-white transition-colors">Альбоми</Link></li>
            <li><Link href="/category/clips" className="hover:text-white transition-colors">Кліпи</Link></li>
            <li><Link href="/category/reviews" className="hover:text-white transition-colors">Огляди</Link></li>
            <li><Link href="/category/playlists" className="hover:text-white transition-colors">Плейлисти</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold uppercase mb-6 tracking-wider font-serif text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>Контакти</h3>
          <ul className="flex flex-col space-y-4 text-zinc-400">
            <li>
              <a href="mailto:a@uncultured.media" className="hover:text-white transition-colors block">
                a@uncultured.media
              </a>
            </li>
            <li>
              <a href="https://t.me/ceouncultured" target="_blank" rel="noopener noreferrer" className="hover:text-[#2AABEE] transition-colors flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.2 3.45-.49.33-.94.5-1.34.49-.45-.01-1.3-.25-1.93-.46-.78-.26-1.4-.4-1.35-.85.03-.23.36-.47 1-.74 3.94-1.71 6.57-2.85 7.89-3.4 3.75-1.56 4.53-1.84 5.04-1.85.11 0 .36.03.49.14.11.09.14.22.15.33-.01.07-.01.12-.02.2z" />
                </svg>
                @ceouncultured
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center text-zinc-500 text-sm gap-6">
        <p className="order-2 md:order-1">&copy; {new Date().getFullYear()} UNCULTURED. Всі права захищено.</p>
        <div className="flex items-center space-x-8 order-1 md:order-2 font-medium">
          <Link href="/about" className="hover:text-white transition-colors">Про нас</Link>
          <PrivacyPolicyModal />
        </div>
      </div>
    </footer>
  );
}
