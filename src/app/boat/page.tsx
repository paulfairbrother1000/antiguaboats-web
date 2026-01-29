import Link from "next/link";
import BoatCarousel from "@/components/BoatCarousel";

const BOAT_IMAGES = Array.from({ length: 10 }, (_, i) => `/boat/img${i + 1}.jpg`);

const TECH_SPECS: { label: string; value: string }[] = [
  { label: "Model", value: "Nortech 390 Sport" },
  { label: "Year", value: "2024" },
  { label: "Power source", value: "Quad Mercury Racing 400R V-10" },
  { label: "Top speed", value: "70 mph" },
  { label: "Cruising speed", value: "35 mph" },
  { label: "Beverages", value: "Beer, wines, rum punch, water, sodas" },
];

export default function BoatPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative">
        <div className="relative h-[60vh] w-full overflow-hidden md:h-[70vh]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${BOAT_IMAGES[0]})` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
          <div className="relative mx-auto flex h-full max-w-6xl items-end px-4 pb-10 sm:px-6 lg:px-8">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              The incredible <span className="whitespace-nowrap">Silver Lady</span>
            </h1>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-lg leading-relaxed text-white/85">
            Meet <span className="font-semibold text-white">Silver Lady</span> — a head-turning Nor-Tech 390 Sport
            built for fast, smooth Caribbean runs and unforgettable days on the water. With serious power, a
            confidence-inspiring ride, and plenty of space to relax between swim stops, she’s the perfect platform
            for beach-hopping, sunset vibes, and arriving in style.
          </p>
        </div>
      </section>

      {/* TECH SPECS */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight">Tech spec</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TECH_SPECS.map((spec) => (
            <div key={spec.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
              <div className="text-sm font-medium uppercase tracking-wide text-white/60">{spec.label}</div>
              <div className="mt-1 text-lg font-semibold text-white">{spec.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PHOTO CAROUSEL */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Photos</h2>
          <p className="hidden text-sm text-white/60 sm:block">Swipe on mobile • Use arrows on desktop</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <BoatCarousel images={BOAT_IMAGES} />
        </div>
      </section>

      {/* VIDEO */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight">Video</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="relative aspect-video w-full">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/VIDEO_ID_HERE"
              title="Silver Lady video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ACTION BUTTONS */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/booking"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-base font-semibold text-black transition hover:bg-white/90"
          >
            Make booking
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10"
          >
            Contact us
          </Link>
        </div>
      </section>
    </main>
  );
}
