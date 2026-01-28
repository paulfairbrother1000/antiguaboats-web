// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Antigua Boats",
  description: "Premium speed boat charters from Jolly Harbour, Antigua",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">
        <SiteHeader />

        <div className="min-h-[calc(100vh-64px)]">{children}</div>

        <footer className="border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>© {new Date().getFullYear()} Antigua Boats • Jolly Harbour, Antigua</div>
              <div className="flex gap-4">
                <a className="hover:underline" href="#" aria-label="Facebook">Facebook</a>
                <a className="hover:underline" href="#" aria-label="Instagram">Instagram</a>
                <a className="hover:underline" href="#" aria-label="YouTube">YouTube</a>
                <a className="hover:underline" href="#" aria-label="TikTok">TikTok</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
