import Link from "next/link";
import GalleryCarousel from "@/components/GalleryCarousel";
import CharterTiles from "@/components/CharterTiles";
import { SILVER_LADY_PHOTOS } from "@/lib/silverLadyPhotos";

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="overflow-hidden rounded-3xl border shadow-sm">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/antigua-hero.jpg"
                alt="Antigua waters"
                className="h-[520px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-center p-8 sm:p-12">
                <div className="max-w-xl text-white">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-slate-800">
                    <span className="h-2 w-2 rounded-full bg-sky-600" />
                    Premium speed boat charters • Jolly Harbour
                  </div>

                  <h1 className="mt-6 text-5xl font-extrabold leading-tight sm:text-6xl">
                    Fast. Private.
                    <br />
                    <span className="text-sky-300">Unforgettable.</span>
                  </h1>

                  <p className="mt-4 text-base text-white/90 sm:text-lg">
                    Premium speedboat charters from Jolly Harbour — turquoise bays, iconic beaches,
                    and sunset runs in style.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href="/availability?charter=day"
                      className="inline-flex items-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700"
                    >
                      Check Availability
                    </Link>
                    <Link
                      href="/charters"
                      className="inline-flex items-center rounded-xl bg-white/90 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-white"
                    >
                      View Charters
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEET ANTIGUA BOATS (new section, before Silver Lady) */}
      <section className="py-6">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl border bg-white p-7">
            <h2 className="text-3xl font-extrabold text-slate-900">Meet Antigua Boats</h2>

            <div className="mt-4 space-y-4 text-slate-700 leading-relaxed">
              <p>
                Antigua Boats is Antigua’s premier speed boat charter company — built for travellers
                who want to see the island at its most beautiful, in total comfort and privacy.
              </p>
              <p>
                Based in Jolly Harbour, we specialise in premium day charters, half-day escapes and
                unforgettable sunset cruises across the turquoise waters of Antigua &amp; Barbuda.
                Expect iconic beaches, hidden coves, and the kind of “pinch me” swim stops you’ll
                talk about for years.
              </p>
              <p>
                Our flagship vessel is a superb Nor-Tech 340 performance boat — fast, smooth and
                incredibly capable — paired with an experienced, qualified Captain and friendly crew
                who’ll make sure your day is safe, relaxed and genuinely special.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MEET SILVER LADY (kept, with added paragraph before carousel) */}
      <section className="py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">
                Meet <span className="text-sky-600">Silver Lady</span>
              </h2>
              <p className="mt-2 text-slate-600">
                A premium performance boat built for comfort, speed, and the best day on the water.
              </p>
            </div>

            <Link
              href="/charters/silver-lady"
              className="hidden items-center rounded-xl border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 sm:inline-flex"
            >
              View The Boat
            </Link>
          </div>

          {/* New paragraph BEFORE carousel */}
          <div className="mt-5 rounded-3xl border bg-white p-7">
            <p className="text-slate-700 leading-relaxed">
              Silver Lady is a Nor-Tech 340 designed for the Caribbean — thrilling performance when
              you want it, and a smooth, comfortable ride when you don’t. She’s perfect for island
              hopping, beach drop-offs, snorkelling stops, and sunset runs with your favourite
              people.
            </p>
          </div>

          <div className="mt-6">
            <GalleryCarousel
              images={SILVER_LADY_PHOTOS}
              heightClass="h-[520px]"
              caption="Silver Lady • Nor-Tech Performance"
              ctaHref="/availability?charter=day"
              ctaLabel="Book Silver Lady"
            />
          </div>
        </div>
      </section>

      {/* CHARTER TILES */}
      <CharterTiles />
    </main>
  );
}
