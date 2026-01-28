import Link from "next/link";
import PaceShuttleTiles from "@/components/PaceShuttleTiles";

export default function RestaurantShuttlePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-500">Charters</div>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-900">
            Restaurant Shuttle
          </h1>
          <p className="mt-2 text-slate-600">
            Arrive by sea for lunch at Nobu, Catherine’s Café and more.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/charters"
            className="rounded-2xl border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Back to Charters
          </Link>
          <Link
            href="/availability?charter=shuttle"
            className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Check Availability
          </Link>
        </div>
      </div>

      {/* 1) Intro paragraph (replace with your copy later) */}
      <section className="mt-10 rounded-3xl border bg-white p-7">
        <h2 className="text-xl font-extrabold text-slate-900">How it works</h2>
        <p className="mt-2 max-w-3xl text-slate-700 leading-relaxed">
          (Placeholder) We’ll pick you up from Jolly Harbour and take you by speedboat to Antigua’s
          best restaurants. Private, fast, and unforgettable — perfect for a lunch booking or sunset dinner.
        </p>
      </section>

      {/* 2) PaceShuttles API tiles */}
      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Available shuttle routes</h2>
            <p className="mt-1 text-slate-600">Live seats and lowest available prices.</p>
          </div>
        </div>

        <div className="mt-5">
          <PaceShuttleTiles />
        </div>
      </section>

      {/* 3) Footer info (replace later) */}
      <section className="mt-10 rounded-3xl border bg-white p-7">
        <h2 className="text-xl font-extrabold text-slate-900">Good to know</h2>
        <ul className="mt-3 list-disc pl-5 text-slate-700 space-y-2">
          <li>(Placeholder) Timing depends on sea conditions and your reservation.</li>
          <li>(Placeholder) Tell us dietary requirements and we’ll coordinate with the venue.</li>
          <li>(Placeholder) Fuel surcharge may apply for long-distance runs.</li>
        </ul>
      </section>
    </main>
  );
}
