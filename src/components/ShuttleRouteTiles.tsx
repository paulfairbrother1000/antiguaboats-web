"use client";

import { useEffect, useState } from "react";

type ShuttleRoute = {
  id: string;
  title: string;
  from: string;
  to: string;
  frequency?: string;
  next_departure?: string;
  price?: number;
  currency?: string;
  image_url?: string;
  source: "pace";
};

export default function ShuttleRouteTiles() {
  const [routes, setRoutes] = useState<ShuttleRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/pace/shuttles", { cache: "no-store" });
        const json = (await res.json()) as { routes?: ShuttleRoute[] };
        if (alive) setRoutes(json.routes ?? []);
      } catch {
        if (alive) setRoutes([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Shuttle Routes</h2>
            <p className="mt-2 text-slate-600">Live seats and lowest available prices.</p>
          </div>
          <div className="text-xs text-slate-400">{loading ? "Loading…" : "pace-shuttles"}</div>
        </div>

        {(!loading && routes.length === 0) && (
          <div className="mt-6 rounded-2xl border bg-white p-6 text-slate-600">
            No shuttle routes available yet (or Pace not connected).
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-3xl border bg-white shadow-sm">
              <div className="relative">
                {/* ✅ Use <img> so remote image domains don’t need Next image config */}
                <img
                  src={r.image_url || "/ShuttleCharter.jpeg"}
                  alt={r.title}
                  className="h-40 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="text-sm font-semibold">{r.from} → {r.to}</div>
                </div>
              </div>

              <div className="p-5">
                <div className="text-base font-bold text-slate-900">{r.title}</div>
                <div className="mt-2 text-sm text-slate-600">
                  {r.frequency ? <span>{r.frequency}</span> : <span>Restaurant shuttle</span>}
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div className="text-sm text-slate-600">
                    {r.next_departure ? (
                      <>
                        <div className="text-xs text-slate-500">Next</div>
                        <div className="font-semibold text-slate-800">{r.next_departure}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs text-slate-500">Next</div>
                        <div className="font-semibold text-slate-800">TBC</div>
                      </>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-500">From</div>
                    <div className="text-lg font-extrabold text-slate-900">
                      {typeof r.price === "number" ? `${r.currency ?? "USD"} ${r.price}` : "—"}
                    </div>
                  </div>
                </div>

                <a
                  href="/availability?charter=shuttle"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline"
                >
                  Check availability <span aria-hidden>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
