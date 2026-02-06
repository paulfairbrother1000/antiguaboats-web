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
    desc: "09:30–13:00 or 14:00–17:30 • Quick island escape",
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

export const dynamic = "force-dynamic";
 
export default function ChartersPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* HERO */}
      <section className="-mx-4 overflow-hidden rounded-3xl border bg-slate-100 md:mx-0">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/charter-hero.jpeg"
            alt="Antigua & Barbuda charter hero"
            className="h-[320px] w-full object-cover md:h-[420px]"
          />

          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute inset-0 flex items-center">
            <div className="px-6 md:px-10">
              <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                World class charter destination
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO COPY */}
      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-slate-900 md:text-2xl">
          There are few pleasures in life that compare to a luxury charter in the turquoise waters of Antigua &amp;
          Barbuda.
        </h2>

        <div className="mt-4 space-y-4 text-slate-700 leading-relaxed">
          <p>
            At Antigua Boats we can’t wait to share the beauty of these magnificent shores. We provide an experienced
            and qualified Captain, alongside an amazing crew member who will ensure that your charter is as comfortable,
            safe and enjoyable as is humanly possible.
          </p>

          <p>
            We have plenty of ideas regarding how to spend your time with us, but are happy to hear your own, especially
            if you’re keen to focus on swimming in deserted beautiful spots, or searching out the local wildlife.
          </p>

          <p>
            With the exception of the Restaurant Shuttle, for our charters we provide the tunes, the beer, wine and rum
            punch, and you are also free to bring your own.
          </p>

          <p className="font-semibold text-slate-900">
            Let us know what kind of charter you’re interested in below, and we’ll do the rest.
          </p>
        </div>
      </section>

      {/* CHARTER OPTIONS */}
      <section className="mt-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {charterTiles.map((tile) => (
            <div key={tile.slug} className="overflow-hidden rounded-3xl border bg-white">
              {/* Image should be clickable */}
              <Link href={`/charters/${tile.slug}`} className="block">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tile.imageSrc}
                    alt={tile.title}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </Link>

              <div className="p-5">
                <div className="text-base font-extrabold text-slate-900">{tile.title}</div>
                <div className="mt-1 text-sm text-slate-600">{tile.desc}</div>

                <div className="mt-4">
                  <Link
                    href={`/charters/${tile.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-800"
                  >
                    More Info <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
