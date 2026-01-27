import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-3xl border bg-white p-8">
        <h1 className="text-4xl font-bold text-slate-900">Antigua Boats</h1>
        <p className="mt-3 text-slate-600 text-lg">
          Premium speed boat charters from Jolly Harbour. Explore Antigua’s bays, beaches and sunsets aboard Silver Lady.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link href="/availability?charter=day" className="rounded-xl bg-sky-600 text-white px-5 py-3 font-semibold text-center hover:bg-sky-700">
            Check Availability
          </Link>
          <Link href="/charters" className="rounded-xl border px-5 py-3 font-semibold text-center hover:shadow-sm">
            View Charters
          </Link>
        </div>
      </div>
    </main>
  );
}
