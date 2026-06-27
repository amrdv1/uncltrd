import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getSiteConfig } from "@/app/actions/config";
import { cookies } from "next/headers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: "uncultured.",
    description: config.description,
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const rawAccentCookie = cookieStore.get("accentColor")?.value;
  let accentCookie = "345 100% 60%";
  if (rawAccentCookie) {
    try {
      accentCookie = decodeURIComponent(rawAccentCookie);
    } catch (e) {
      accentCookie = rawAccentCookie; // Fallback to raw if decode fails
    }
  }

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground selection:bg-accent selection:text-white min-h-screen" style={{ "--accent": accentCookie } as React.CSSProperties}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          enableColorScheme={false}
        >
          {/* Ambient Glow */}
          <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 dark:bg-accent/10 blur-[120px] mix-blend-screen opacity-50 dark:opacity-30"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] mix-blend-screen opacity-50 dark:opacity-30"></div>
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
