"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/", label: "Home" },
  { href: "/charters", label: "Charters" },
  { href: "/boat", label: "The Boat" },
  { href: "/booking", label: "Availability" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/antigua-boats-logo.png"
            alt="Antigua Boats"
            className="h-24 md:h-26 w-auto"   // ✅ bigger
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                isActive(i.href) ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {i.label}
            </Link>
          ))}

          <Link
            href="/booking"
            className="ml-2 inline-flex items-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Book Now
          </Link>
        </nav>

        <button
          className="md:hidden inline-flex items-center justify-center rounded-xl border px-3 py-2 text-slate-700 hover:bg-slate-50"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <span className="text-lg leading-none">☰</span>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                  isActive(i.href) ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {i.label}
              </Link>
            ))}
            <Link
              href="/availability?charter=day"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
