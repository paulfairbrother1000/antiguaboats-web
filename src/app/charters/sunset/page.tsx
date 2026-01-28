import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SunsetCruisePage() {
  const title = "Sunset Cruise";
  const sub = "16:30–18:30 • Golden hour magic";
  const hero = "/sunset.jpeg";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-500">Charters</div>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-slate-600">{sub}</p>
        </div>

        <Link
          href="/charters"
          className="rounded-2xl border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Back to Charters
        </Link>
      </div>

      {/* HERO */}
      <section className="mt-8 overflow-hidden rounded-3xl border bg-slate-100">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero} alt={title} className="h-[320px] w-full object-cover md:h-[420px]" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 flex items-end">
            <div className="p-6 md:p-10">
              <div className="text-3xl font-black tracking-tight text-white md:text-5xl">{title}</div>
              <div className="mt-2 text-white/90 md:text-lg">{sub}</div>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="mt-10 rounded-3xl border bg-white p-7">
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            There’s a reason sunset is everyone’s favourite time on the water. The light turns warm, the sea calms, and
            Antigua’s coastline looks absolutely spectacular.
          </p>
          <p>
            We’ll cruise to a beautiful viewpoint, pour a drink, and let the evening do its thing — perfect for couples,
            celebrations, or anyone who wants a “pinch me” Caribbean moment.
          </p>
          <p>
            If you’d like, we can include a swim stop before the sun dips, or keep it slow and scenic. Either way, you’ll
            head back with unreal photos and an even better feeling.
          </p>
        </div>
      </section>
    </main>
  );
}
