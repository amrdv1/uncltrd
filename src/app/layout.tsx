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
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const accentCookie = cookieStore.get("accentColor")?.value || "345 100% 60%";

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} style={{ "--accent": accentCookie } as React.CSSProperties} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground selection:bg-accent selection:text-white min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
