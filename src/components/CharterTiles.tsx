import Link from "next/link";

export type CharterTile = {
  title: string;
  desc: string;
  slug: "day" | "half-day" | "sunset" | "shuttle";
  imageSrc: string;
};

export const CHARTER_TILES: CharterTile[] = [
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
    slug: "shuttle",
    imageSrc: "/ShuttleCharter.jpeg",
  },
];

export default function CharterTiles({
  tiles = CHARTER_TILES,
  showViewAll = false,
}: {
  tiles?: CharterTile[];
  showViewAll?: boolean;
}) {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Choose your charter</h2>
            <p className="mt-2 text-slate-600">
              From full day adventures to sunset cruises and restaurant shuttles.
            </p>
          </div>

          {showViewAll && (
            <Link
              href="/charters"
              className="hidden sm:inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              View all
            </Link>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.slug} className="overflow-hidden rounded-3xl border bg-white shadow-sm">
              <div className="relative">
                <img src={t.imageSrc} alt={t.title} className="h-40 w-full object-cover" />
              </div>
              <div className="p-5">
                <div className="text-lg font-bold text-slate-900">{t.title}</div>
                <div className="mt-2 text-sm text-slate-600">{t.desc}</div>

                {/* ✅ Correct: links to charter detail pages */}
                <Link
                  href={`/charters/${t.slug}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline"
                >
                  Book now <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
