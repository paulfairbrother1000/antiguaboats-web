import Image from "next/image";

type ShuttleRoutesResponse = {
  source: string;
  fetched_at: string;
  build_tag: string;
  tiles: Tile[];
};

type Tile = {
  route_id: string;
  country: string;
  vehicle_type: string;
  route_name: string;
  pickup: { id: string; name: string; image_url: string | null };
  destination: { id: string; name: string; image_url: string | null };
  schedule: string | null;
  cheapest: {
    unit_minor: number;
    currency: string;
    display_major_rounded_up: number;
    applies_to: { date_iso: string; pickup_time: string | null };
    max_qty_at_price?: number | null;
  };
};

function formatMoney(currency: string, displayMajorRoundedUp: number) {
  // You’re returning GBP today, but keep this generic
  const symbol =
    currency === "GBP" ? "£" :
    currency === "USD" ? "$" :
    currency === "EUR" ? "€" : "";

  return `${symbol}${displayMajorRoundedUp}`;
}

export default async function ShuttleRouteTiles() {
  // Server component: fetch from our own site (no CSP/CORS issues)
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/shuttle-routes`, {
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-semibold">Shuttle Routes</h2>
        <p className="mt-2 text-sm opacity-80">
          Routes are temporarily unavailable.
        </p>
      </section>
    );
  }

  const data = (await res.json()) as ShuttleRoutesResponse;
  const tiles = (data.tiles ?? []).slice(0, 12); // homepage cap

  if (!tiles.length) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-semibold">Shuttle Routes</h2>
        <p className="mt-2 text-sm opacity-80">
          No routes available right now.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Shuttle Routes</h2>
          <p className="mt-1 text-sm opacity-80">
            Live seats and lowest available prices.
          </p>
        </div>
        <div className="text-xs opacity-60">
          {data.source} • {new Date(data.fetched_at).toLocaleString()}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => {
          const img = t.pickup.image_url || t.destination.image_url || null;
          const price = formatMoney(t.cheapest.currency, t.cheapest.display_major_rounded_up);

          return (
            <a
              key={t.route_id}
              href="#"
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-sm transition hover:bg-white/10"
            >
              <div className="relative h-44 w-full">
                {img ? (
                  <Image
                    src={img}
                    alt={t.route_name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition group-hover:scale-[1.02]"
                    priority={false}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm opacity-70">
                    No image
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold leading-snug">
                      {t.route_name}
                    </div>
                    <div className="mt-1 text-sm opacity-80">
                      {t.schedule ?? "Schedule TBC"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wide opacity-70">From</div>
                    <div className="text-xl font-semibold">{price}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs opacity-70">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    {t.vehicle_type}
                  </span>
                  <span>
                    Next: {t.cheapest.applies_to.date_iso}
                    {t.cheapest.applies_to.pickup_time ? ` • ${t.cheapest.applies_to.pickup_time}` : ""}
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
