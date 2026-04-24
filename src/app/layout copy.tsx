// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Antigua Boats",
  description: "Premium speed boat charters from Jolly Harbour, Antigua",
  applicationName: "Antigua Boats",
  manifest: "/manifest.json",
  themeColor: "#0fb9b1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Antigua Boats",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PWA / Shortcut support */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0fb9b1" />

        {/* iOS "Add to Home Screen" support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Antigua Boats" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* Fallback icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
      </head>

      <body className="min-h-screen bg-white text-slate-900">
        <SiteHeader />

        <div className="min-h-[calc(100vh-64px)]">{children}</div>

        <footer className="border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>© {new Date().getFullYear()} Antigua Boats • Jolly Harbour, Antigua</div>
              <div className="flex gap-4">
                <a className="hover:underline" href="#" aria-label="Facebook">
                  Facebook
                </a>
                <a className="hover:underline" href="#" aria-label="Instagram">
                  Instagram
                </a>
                <a className="hover:underline" href="#" aria-label="YouTube">
                  YouTube
                </a>
                <a className="hover:underline" href="#" aria-label="TikTok">
                  TikTok
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
