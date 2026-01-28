import Link from "next/link";
import GalleryCarousel from "@/components/GalleryCarousel";
import ShuttleRouteTiles from "@/components/ShuttleRouteTiles";
import { SILVER_LADY_PHOTOS } from "@/lib/silverLadyPhotos";

const COPY: Record<string, { title: string; intro: string; hero?: string }> = {
  "silver-lady": {
    title: "Silver Lady",
    intro: "Our flagship performance boat — fast, comfortable, and built for unforgettable sea days.",
  },
  day: {
    title: "Full Day Charter",
    intro: "A full day adventure around Antigua — beach hopping, snorkel stops, and the freedom to explore.",
    hero: "/DayCharter.jpeg",
  },
  "half-day": {
    title: "½ Day Charter",
    intro: "Perfect for a quick island escape — choose morning or afternoon and make it count.",
    hero: "/HalfDayCharter.jpeg",
  },
  sunset: {
    title: "Sunset Cruise",
    intro: "Golden hour magic — calm seas, warm light, and an iconic Antigua sunset.",
    hero: "/sunset.jpeg",
  },
  shuttle: {
    title: "Restaurant Shuttle",
    intro: "Arrive by sea — Nobu and other hotspots, with pickup from Jolly Harbour (on request).",
    hero: "/ShuttleCharter.jpeg",
  },
};

export default function CharterDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const c = COPY[slug] ?? {
    title: "Charter",
    intro: "Explore Antigua by speedboat.",
    hero: "/antigua-hero.jpg",
  };

  const isBoat = slug === "silver-lady";
  const isShuttle = slug === "shuttle";

  return (
    <main className="py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500">Charters</div>
            <h1 className="mt-2 text-4xl font-extrabold text-slate-900">{c.title}</h1>
            <p className="mt-3 max-w-2xl text-slate-600">{c.intro}</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/charters"
              className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Back to Charters
            </Link>
            <Link
              href={`/availability?charter=${isShuttle ? "shuttle" : "day"}`}
              className="inline-flex items-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Check Availability
            </Link>
          </div>
        </div>

        <div className="mt-8">
          {isBoat ? (
            <GalleryCarousel
              images={SILVER_LADY_PHOTOS}
              heightClass="h-[520px]"
              caption="Silver Lady • Nor-Tech Performance"
              ctaHref="/availability?charter=day"
              ctaLabel="Book Silver Lady"
            />
          ) : (
            <div className="overflow-hidden rounded-3xl border">
              <img src={c.hero} alt={c.title} className="h-[520px] w-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* ✅ Shuttle charter API info appears ONLY on the shuttle charter page */}
      {isShuttle && <ShuttleRouteTiles />}
    </main>
  );
}
