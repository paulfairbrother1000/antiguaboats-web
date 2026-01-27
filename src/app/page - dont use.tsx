// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { GalleryCarousel } from "@/components/GalleryCarousel";

type CharterTile = {
  slug: "day" | "half-day" | "sunset" | "restaurant-shuttle";
  title: string;
  subtitle: string;
  priceLine: string;
  img: string;
};

const CHARTERS: CharterTile[] = [
  {
    slug: "day",
    title: "Day Charter",
    subtitle: "10:00 – 17:00 • Full-day adventure",
    priceLine: "Private charter • Premium experience",
    img: "https://iodbbhhovoxidlbgyjhc.supabase.co/storage/v1/object/public/antiguaboats/DayCharter.jpeg",
  },
  {
    slug: "half-day",
    title: "½ Day Charter",
    subtitle: "10:00 – 13:00 or 14:00 – 17:00",
    priceLine: "Perfect quick escape",
    img: "https://iodbbhhovoxidlbgyjhc.supabase.co/storage/v1/object/public/antiguaboats/HalfDayCharter.jpeg",
  },
  {
    slug: "sunset",
    title: "Sunset Cruise",
    subtitle: "16:30 – 18:30 • Golden hour",
    priceLine: "Relaxed vibe • Stunning views",
    img: "https://iodbbhhovoxidlbgyjhc.supabase.co/storage/v1/object/public/antiguaboats/sunset.jpeg",
  },
  {
    slug: "restaurant-shuttle",
    title: "Restaurant Shuttle",
    subtitle: "Fast, stylish transfers",
    priceLine: "Nobu & more • On request",
    img: "https://iodbbhhovoxidlbgyjhc.supabase.co/storage/v1/object/public/antiguaboats/ShuttleCharter.jpeg",
  },
];

const SILVER_LADY_MAIN =
  "https://iodbbhhovoxidlbgyjhc.supabase.co/storage/v1/object/public/antiguaboats/2024-boatheroshot.jpeg";

const SILVER_LADY_GALLERY = [
  "https://iodbbhhovoxidlbgyjhc.supabase.co/storage/v1/object/public/antiguaboats/2024-nor-tech-390-sport-center-console-power-9949293-20250916181903715-1.webp",
  "https://iodbbhhovoxidlbgyjhc.supabase.co/storage/v1/object/public/antiguaboats/2024-nor-tech-390-sport-center-console-power-9949293-20250916181903670-0.webp",
  "https://iodbbhhovoxidlbgyjhc.supabase.co/storage/v1/object/public/antiguaboats/2024-nor-tech-390-sport-center-console-power-9949293-20250916181903724-2.webp",
  "https://iodbbhhovoxidlbgyjhc.supabase.co/storage/v1/object/public/antiguaboats/2024-nor-tech-390-sport-center-console-power-9949293-20250916181903733-3.webp",
  "https://iodbbhhovoxidlbgyjhc.supabase.co/storage/v1/object/public/antiguaboats/2024-nor-tech-390-sport-center-console-power-9949293-20250916181903742-4.webp",
  "https://iodbbhhovoxidlbgyjhc.supabase.co/storage/v1/object/public/antiguaboats/2024-nor-tech-390-sport-center-console-power-9949293-20250916181903783-8.webp",
  "https://iodbbhhovoxidlbgyjhc.supabase.co/storage/v1/object/public/antiguaboats/2024-nor-tech-390-sport-center-console-power-9949293-20250916181903812-11.webp",
];

function AccentPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold"
      style={{
        backgroundColor: "rgba(var(--ab-accent) / 0.12)",
        color: "rgb(var(--ab-accent))",
      }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white shadow-sm transition hover:opacity-95"
      style={{ backgroundColor: "rgb(var(--ab-accent))" }}
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold border transition hover:bg-slate-50"
      style={{ borderColor: "rgba(var(--ab-accent) / 0.35)", color: "rgb(15 23 42)" }}
    >
      {children}
    </Link>
  );
}

function CharterTileCard({ c }: { c: CharterTile }) {
  return (
    <Link
      href={`/charters/${c.slug}`}
      className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: "rgba(15, 23, 42, 0.08)" }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={c.img}
          alt={c.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={c.slug === "day"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-white text-xl font-bold drop-shadow">{c.title}</div>
          <div className="mt-1 text-white/90 text-sm drop-shadow">{c.subtitle}</div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">{c.priceLine}</div>
          <span
            className="text-sm font-semibold"
            style={{ color: "rgb(var(--ab-accent))" }}
          >
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <AccentPill>Premium speed boat charters • Jolly Harbour</AccentPill>

            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Antigua Boats
              <span className="block" style={{ color: "rgb(var(--ab-accent))" }}>
                Turquoise water. Fast boats. Proper memories.
              </span>
            </h1>

            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Explore Antigua in style aboard <span className="font-semibold text-slate-900">Silver Lady</span>.
              From full-day adventures to golden-hour sunset cruises, we deliver a premium, effortless charter
              experience — with instant booking and secure payment.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <PrimaryButton href="/charters">Browse Charters</PrimaryButton>
              <SecondaryButton href="/availability?charter=day">Check Availability</SecondaryButton>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-600">
              <span className="rounded-full border px-3 py-1">Instant booking</span>
              <span className="rounded-full border px-3 py-1">Pay in full to reserve</span>
              <span className="rounded-full border px-3 py-1">Crewed premium experience</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-[32px] border bg-white shadow-sm">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={SILVER_LADY_MAIN}
                  alt="Silver Lady at speed"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-slate-600">Featured boat</div>
                    <div className="text-xl font-bold text-slate-900">Silver Lady</div>
                  </div>
                  <Link
                    href="/the-boat"
                    className="font-semibold"
                    style={{ color: "rgb(var(--ab-accent))" }}
                  >
                    Meet the boat →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHARTER TILES */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Charters</h2>
            <p className="mt-2 text-slate-600">
              Choose your vibe — full day, half day, sunset, or a fast restaurant shuttle.
            </p>
          </div>
          <Link
            href="/charters"
            className="hidden sm:inline-flex font-semibold"
            style={{ color: "rgb(var(--ab-accent))" }}
          >
            View all →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CHARTERS.map(c => (
            <CharterTileCard key={c.slug} c={c} />
          ))}
        </div>
      </section>

      {/* ABOUT (Antigua Boats paragraph BEFORE meet Silver Lady, as requested) */}
      <section className="mx-auto max-w-6xl px-4 pb-2">
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">Antigua Boats</h2>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Antigua is bright, warm, and wildly beautiful — and the best way to experience it is from the water.
            Antigua Boats is a premium charter operator based in Jolly Harbour, focused on high-quality service,
            smooth booking, and unforgettable days out. Whether you want speed and sparkle or calm and sunset glow,
            we’ll tailor the experience and make it easy.
          </p>
        </div>
      </section>

      {/* MEET SILVER LADY + CAROUSEL */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <h2 className="text-3xl font-extrabold text-slate-900">Meet Silver Lady</h2>
            <p className="mt-2 text-slate-600 leading-relaxed">
              A Nor-Tech performance boat built for comfort and serious fun. Expect smooth cruising, big smiles,
              and the kind of turquoise-water photos you’ll keep forever.
            </p>

            <div className="mt-5 flex gap-3">
              <PrimaryButton href="/charters/day">Book a Day Charter</PrimaryButton>
              <SecondaryButton href="/availability?charter=day">Check dates</SecondaryButton>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={SILVER_LADY_MAIN}
                  alt="Silver Lady main"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            </div>

            <div className="rounded-3xl border bg-white shadow-sm p-3">
              <GalleryCarousel
                images={SILVER_LADY_GALLERY.map(url => ({
                  url,
                  alt: "Silver Lady gallery photo",
                }))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div
          className="rounded-[32px] p-8 sm:p-10 text-white shadow-sm"
          style={{
            background: `linear-gradient(135deg, rgba(var(--ab-accent) / 1) 0%, rgba(var(--ab-accent) / 0.75) 100%)`,
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-2xl font-extrabold">Ready to get on the water?</div>
              <div className="mt-2 text-white/90">
                Instant booking • Pay in full to reserve • Admin can manage cancellations
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/charters"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-white/95"
              >
                Choose a charter
              </Link>
              <Link
                href="/availability?charter=day"
                className="inline-flex items-center justify-center rounded-2xl border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10"
              >
                Check availability
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
