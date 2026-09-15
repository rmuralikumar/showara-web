import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { CityProvider } from "@/context/CityContext";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Showara — Cinema Ticket Booking",
    default: "Showara — Discover Movies & Book Cinema Tickets",
  },
  description:
    "Showara is the modern, cinematic ticket booking destination. Discover trending movies, pick premier seats in your city, and enjoy an effortless cinema experience.",
  keywords: [
    "movie tickets",
    "cinema booking",
    "showtimes",
    "theatre seats",
    "IMAX",
    "Dolby Atmos",
    "Showara",
  ],
  authors: [{ name: "Showara Entertainment" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Showara",
    title: "Showara — Discover Movies & Book Cinema Tickets",
    description:
      "Discover the latest blockbusters, select your favorite cinema screens, pick prime seats, and book tickets instantly.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/logo-icon-128.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#07090e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Anti-flash inline script to guarantee correct theme before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('showara_theme');
                  var isDark = false;
                  if (saved === 'dark') {
                    isDark = true;
                  } else if (saved === 'light') {
                    isDark = false;
                  } else {
                    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] antialiased selection:bg-[var(--brand-primary)] selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <CityProvider>
              <BookingProvider>
                <Header />
                <main className="flex-1 pb-20 md:pb-0 min-w-0 w-full max-w-full">{children}</main>
                <Footer />
                <MobileNav />
              </BookingProvider>
            </CityProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
