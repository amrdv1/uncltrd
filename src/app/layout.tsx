import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
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

const antapani = localFont({
  src: "./fonts/Antapani-ExtraBold.otf",
  variable: "--font-antapani",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const siteUrl = "https://uncultured.media";
  
  // Використовуємо затверджений SEO текст
  const siteDescription = "Головний медіа-портал про сучасну українську та світову музику. Релізи, огляди, новини та ексклюзиви зсередини індустрії.";
  
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "uncultured.",
      template: "%s | uncultured.",
    },
    description: siteDescription,
    keywords: [
      "uncultured",
      "uncultured media",
      "український реп",
      "хіп-хоп",
      "андеграунд",
      "музика",
      "релізи",
      "огляди",
      "новини музики",
      "uncultured ua"
    ],
    authors: [{ name: "uncultured." }],
    creator: "uncultured.",
    publisher: "uncultured.",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: "uncultured.",
      description: siteDescription,
      url: siteUrl,
      siteName: "uncultured.",
      images: [
        {
          url: `${siteUrl}/logo-black.png`,
          width: 1200,
          height: 630,
          alt: "uncultured. media",
        },
      ],
      locale: "uk_UA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "uncultured.",
      description: siteDescription,
      images: [`${siteUrl}/logo-black.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico?v=2" }
      ],
      apple: "/apple-touch-icon.png",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

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
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${antapani.variable}`} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root, body { --accent: ${accentCookie}; }` }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('gesturestart', function (e) {
                e.preventDefault();
              });
              document.addEventListener('touchmove', function(e) {
                if (e.touches.length > 1) {
                  e.preventDefault();
                }
              }, { passive: false });
            `
          }}
        />
      </head>
      <body className="antialiased bg-background text-foreground selection:bg-accent selection:text-white min-h-screen overflow-x-hidden">
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
