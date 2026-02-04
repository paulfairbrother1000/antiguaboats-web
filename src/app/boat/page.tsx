import Link from "next/link";
import BoatCarousel from "@/components/BoatCarousel";

const BOAT_IMAGES = Array.from({ length: 10 }, (_, i) => `/boat/img${i + 1}.jpg`);

const TECH_SPECS: { label: string; value: string }[] = [
  { label: "Model", value: "Nortech 390 Sport" },
  { label: "Year", value: "2024" },
  { label: "Power source", value: "Quad Mercury Racing 400R V-10" },
  { label: "Top speed", value: "100 mph" },
  { label: "Cruising speed", value: "35 mph" },
  { label: "Beverages", value: "Beer, wines, rum punch, water, sodas" },
];

export default function BoatPage() {
  return (
    <main className="bg-white text-slate-900">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="relative h-[52vh] overflow-hidden rounded-[28px] md:h-[58vh]">
          {/* background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${BOAT_IMAGES[0]})` }}
            aria-hidden="true"
          />

          {/* subtle overlay to keep white title readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10" />

          {/* title */}
          <div className="relative flex h-full items-center">
            <div className="px-6 sm:px-10">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                The incredible <span className="whitespace-nowrap">Silver Lady</span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-lg leading-relaxed text-slate-700">
            Meet <span className="font-semibold text-slate-900">Silver Lady</span> — a head-turning Nor-Tech 390 Sport
            built for fast, smooth Caribbean runs and unforgettable days on the water. With serious power, a
            confidence-inspiring ride, and plenty of space to relax between swim stops, she’s the perfect platform
            for beach-hopping, sunset vibes, and arriving in style. We’ll keep the drinks cold, the tunes flowing,
            and the day effortless — you just bring the good mood.
          </p>
        </div>
      </section>

      {/* TECH SPECS */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-slate-900">Tech spec</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TECH_SPECS.map((spec) => (
            <div
              key={spec.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {spec.label}
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{spec.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PHOTO CAROUSEL */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Photos</h2>
          <p className="hidden text-sm text-slate-500 sm:block">
            Swipe on mobile • Use arrows on desktop
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <BoatCarousel images={BOAT_IMAGES} />
        </div>
      </section>

      {/* VIDEO */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-slate-900">Video</h2>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-video w-full">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://youtu.be/xIzelCenvno"
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
            className="inline-flex items-center justify-center rounded-2xl bg-[#0B77C5] px-6 py-4 text-base font-semibold text-white transition hover:opacity-95"
          >
            Make booking
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Contact us
          </Link>
        </div>
      </section>
    </main>
  );
}
