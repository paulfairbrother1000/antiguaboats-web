import Link from "next/link";
import GalleryCarousel from "@/components/GalleryCarousel";
import ShuttleRouteTiles from "@/components/ShuttleRouteTiles";

export default function HomePage() {
  return (
    <>
      {/* your existing hero etc */}
      <ShuttleRouteTiles />
      {/* rest of page */}
    </>
  );
}


type CharterTile = {
  title: string;
  desc: string;
  slug: string;
  imageSrc: string;
};

const charterTiles: CharterTile[] = [
  {
    title: "Full Day Charter",
    desc: "10:00–17:00 • Full day adventure around Antigua",
    slug: "day",
    imageSrc: "/DayCharter.jpeg",
  },
  {
    title: "½ Day Charter",
    desc: "10:00–13:00 or 14:00–17:00 • Quick island escape",
    slug: "half-day",
    imageSrc: "/HalfDayCharter.jpeg",
  },
  {
    title: "Sunset Cruise",
    desc: "16:30–18:30 • Golden hour magic",
    slug: "sunset",
    imageSrc: "/sunset.jpeg",
  },
  {
    title: "Restaurant Shuttle",
    desc: "Nobu & more • Arrive by sea (on request)",
    slug: "restaurant",
    imageSrc: "/RestaurantShuttle.jpeg",
  },
];

// These should exist in /public (or you can swap to Supabase URLs later)
const SILVER_LADY_PHOTOS: { url: string; alt?: string }[] = [
  { url: "/silverlady-1.jpg", alt: "Silver Lady at speed" },
  { url: "/silverlady-2.jpg", alt: "Silver Lady on the water" },
  { url: "/silverlady-3.jpg", alt: "Silver Lady in Jolly Harbour" },
];

export default function Home() {
  return (
    <div className="bg-white">
      {/* =========================
          TOP THIRD: HERO IMAGE
      ========================== */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-10">
          <div className="relative overflow-hidden rounded-3xl border bg-slate-100">
            {/* Hero image */}
            <img
              src="/antigua-hero.jpg"
              alt="Antigua turquoise water aerial"
              className="h-[520px] w-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

            <div className="absolute inset-0 flex items-center">
              <div className="px-8 sm:px-12 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Premium speed boat charters • Jolly Harbour
                </div>

                <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Fast. Private.
                  <br />
                  <span className="text-sky-300">Unforgettable.</span>
                </h1>

                <p className="mt-4 text-base sm:text-lg text-white/90">
                  Premium speedboat charters from Jolly Harbour — turquoise bays,
                  iconic beaches, and sunset runs in style.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/availability?charter=day"
                    className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-6 py-3 text-base font-semibold text-white hover:bg-sky-700"
                  >
                    Check Availability
                  </Link>

                  <Link
                    href="/charters"
                    className="inline-flex items-center justify-center rounded-2xl bg-white/90 px-6 py-3 text-base font-semibold text-slate-900 hover:bg-white"
                  >
                    View Charters
                  </Link>
                </div>

                {/* Social icons (optional placeholders) */}
                <div className="mt-8 hidden sm:flex items-center gap-3 text-white/80">
                  <span className="text-sm">Follow:</span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30">
                    IG
                  </span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30">
                    YT
                  </span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30">
                    TT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* =========================
          MIDDLE THIRD: BOAT SECTION (FULL WIDTH HERO IMAGE)
      ========================== */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        {/* Top row: text + stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Meet <span className="text-sky-600">Silver Lady</span>
            </h2>

            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              A premium performance boat built for comfort, speed, and the best
              day on the water. Perfect for beach hopping, snorkel stops, and
              arriving in style.
            </p>

            <div className="mt-6">
              <Link
                href="/charters/silver-lady"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50"
              >
                View The Boat
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border bg-white p-4">
              <div className="text-sm text-slate-500">Boat</div>
              <div className="mt-1 font-semibold text-slate-900">
                Nor-Tech Performance
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <div className="text-sm text-slate-500">Departing</div>
              <div className="mt-1 font-semibold text-slate-900">
                Jolly Harbour
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <div className="text-sm text-slate-500">Style</div>
              <div className="mt-1 font-semibold text-slate-900">
                Private Charter
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <div className="text-sm text-slate-500">Vibe</div>
              <div className="mt-1 font-semibold text-slate-900">
                Luxury & Fun
              </div>
            </div>
          </div>
        </div>

        {/* Full width hero carousel */}
        <div className="mt-10">
          <GalleryCarousel images={SILVER_LADY_PHOTOS} className="w-full" />
        </div>
      </section>

      {/* =========================
          BOTTOM THIRD: CHARTER TILES
      ========================== */}
      <section className="bg-slate-50 border-t">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Choose your charter
              </h3>
              <p className="mt-2 text-slate-600">
                From full day adventures to sunset cruises and restaurant
                shuttles.
              </p>
            </div>

            <Link
              href="/charters"
              className="hidden sm:inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 border hover:bg-slate-50"
            >
              View all
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {charterTiles.map((t) => (
              <Link
                key={t.slug}
                href={`/availability?charter=${encodeURIComponent(t.slug)}`}
                className="group overflow-hidden rounded-3xl border bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="relative">
                  <img
                    src={t.imageSrc}
                    alt={t.title}
                    className="h-44 w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-0 group-hover:opacity-100 transition" />
                </div>

                <div className="p-5">
                  <div className="text-lg font-bold text-slate-900">
                    {t.title}
                  </div>
                  <div className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {t.desc}
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                    Book now <span className="transition group-hover:translate-x-0.5">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 sm:hidden">
            <Link
              href="/charters"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-base font-semibold text-slate-900 border hover:bg-slate-50"
            >
              View all charters
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
