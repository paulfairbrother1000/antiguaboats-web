import Link from "next/link";

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
    slug: "restaurant-shuttle",
    imageSrc: "/ShuttleCharter.jpeg",
  },
];

export default function ChartersPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="text-sm font-semibold text-slate-500">Charters</div>
      <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Charter</h1>
      <p className="mt-2 text-slate-600 max-w-2xl">
        Explore Antigua by speedboat — from beach-hopping and snorkel stops to sunset runs and VIP restaurant shuttles.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-4">
        {charterTiles.map((t) => (
          <Link
            key={t.slug}
            href={t.slug === "restaurant-shuttle" ? "/charters/restaurant-shuttle" : `/charters/${t.slug}`}
            className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md transition"
          >
            <img src={t.imageSrc} alt={t.title} className="h-40 w-full object-cover" />
            <div className="p-4">
              <div className="text-base font-extrabold text-slate-900">{t.title}</div>
              <div className="mt-2 text-sm text-slate-600">{t.desc}</div>
              <div className="mt-4 text-sm font-semibold text-sky-700 group-hover:underline">
                Book now <span aria-hidden>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
