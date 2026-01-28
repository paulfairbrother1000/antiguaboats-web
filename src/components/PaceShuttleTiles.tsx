"use client";

import { useEffect, useMemo, useState } from "react";

type ShuttleTile = {
  route_id: string;
  country?: string;
  vehicle_type?: string;
  route_name: string;
  pickup?: { id: string; name: string; image_url?: string };
  destination?: { id: string; name: string; image_url?: string };
  schedule?: string;

  cheapest?: {
    unit_minor?: number;
    currency?: string;
    display_major_rounded_up?: number;
    applies_to?: { date_iso?: string; pickup_time?: string };
    max_qty_at_price?: number;
  };

  // legacy/alternate fields (keep for safety)
  lowest_price?: number;
  currency?: string;
  available_seats?: number;
  seats_available?: number;
  min_price?: number;
  from_price?: number;

  pricing?: any;
  prices?: any[];
};

type ShuttleRoutesResponse = {
  source?: string;
  fetched_at?: string;
  tiles?: ShuttleTile[];
  error?: string;
  status?: number;
  body?: string;
};

function Skeleton() {
  return (
    <div className="rounded-3xl border bg-white p-6">
      <div className="h-5 w-48 rounded bg-slate-100" />
      <div className="mt-3 h-4 w-72 rounded bg-slate-100" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-2xl border bg-slate-50" />
        <div className="h-28 rounded-2xl border bg-slate-50" />
      </div>
    </div>
  );
}

function proxiedImageUrl(u?: string) {
  // Proxy remote images through our own domain.
  // src/app/api/img/route.ts
  return u ? `/api/img?url=${encodeURIComponent(u)}` : "/placeholder.jpg";
}

function formatMoney(currency: string | undefined, amountMajor: number) {
  const ccy = currency || "GBP";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: ccy,
      maximumFractionDigits: 0,
    }).format(amountMajor);
  } catch {
    return `${ccy} ${Math.round(amountMajor)}`;
  }
}

function pickCheapestFromPace(t: ShuttleTile): { major?: number; currency?: string } {
  const major = t?.cheapest?.display_major_rounded_up;
  const currency = t?.cheapest?.currency;

  if (typeof major === "number") {
    return { major, currency: typeof currency === "string" ? currency : "GBP" };
  }
  return {};
}

function pickLowestPriceFallback(t: ShuttleTile): { major?: number; currency?: string } {
  const anyT = t as any;
  const direct =
    anyT.lowest_price ??
    anyT.lowestPrice ??
    anyT.from_price ??
    anyT.fromPrice ??
    anyT.min_price ??
    anyT.minPrice ??
    anyT.lowest_available_price ??
    anyT.lowestAvailablePrice ??
    anyT.pricing?.lowest ??
    anyT.pricing?.from ??
    anyT.pricing?.min;

  if (typeof direct === "number") {
    const c =
      anyT.currency ??
      anyT.ccy ??
      anyT.iso_currency ??
      anyT.isoCurrency ??
      anyT.pricing?.currency ??
      anyT.pricing?.ccy;

    return { major: direct, currency: typeof c === "string" ? c : "GBP" };
  }

  const arr = [anyT.prices, anyT.fares, anyT.price_options, anyT.priceOptions].find(Array.isArray);
  if (Array.isArray(arr)) {
    const nums = arr
      .map((x: any) => x?.display_major_rounded_up ?? x?.amount ?? x?.price ?? x?.value ?? x?.cents)
      .filter((v: any) => typeof v === "number")
      .map((v: number) => (v > 10000 ? v / 100 : v));
    if (nums.length) {
      return { major: Math.min(...nums), currency: "GBP" };
    }
  }

  return {};
}

function deriveCountry(tiles: ShuttleTile[]): string | null {
  const countries = Array.from(
    new Set(
      tiles
        .map((t) => (t.country || "").trim())
        .filter(Boolean)
    )
  );

  if (!countries.length) return null;
  if (countries.length === 1) return countries[0];
  return "multiple countries";
}

export default function PaceShuttleTiles() {
  const [data, setData] = useState<ShuttleRoutesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/shuttle-routes", { cache: "no-store" });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to load shuttle routes (HTTP ${res.status}). ${text}`);
        }

        const json = (await res.json()) as ShuttleRoutesResponse;

        if (!cancelled) {
          if (json?.error) throw new Error(json.error);
          setData(json);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load shuttle routes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const tiles = useMemo(() => data?.tiles ?? [], [data]);
  const country = useMemo(() => deriveCountry(tiles), [tiles]);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="rounded-3xl border bg-white p-6">
        <div className="text-sm font-semibold text-slate-900">Shuttle routes are not available yet.</div>
        <div className="mt-2 text-sm text-slate-600">{error}</div>
        <div className="mt-4 text-sm text-slate-500">
          (Server proxy is <code className="rounded bg-slate-100 px-1 py-0.5">/api/shuttle-routes</code>.)
        </div>
      </div>
    );
  }

  if (!tiles.length) {
    return (
      <div className="rounded-3xl border bg-white p-6">
        <div className="text-sm font-semibold text-slate-900">No shuttle routes available right now.</div>
        <div className="mt-2 text-sm text-slate-600">Please check back soon.</div>
      </div>
    );
  }

  return (
    <div>
      {/* Dynamic section title */}
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold text-slate-900">
          Available shuttle routes{country ? ` in ${country}` : ""}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tiles.map((t) => {
          const cheapest = pickCheapestFromPace(t);
          const fallback = pickLowestPriceFallback(t);

          const priceMajor =
            typeof cheapest.major === "number" ? cheapest.major : fallback.major;

          const priceCurrency =
            typeof cheapest.major === "number" ? cheapest.currency : fallback.currency;

          const hasPrice = typeof priceMajor === "number";

          return (
            <div key={t.route_id} className="overflow-hidden rounded-3xl border bg-white">
              {/* Images */}
              <div className="grid grid-cols-2 gap-0">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proxiedImageUrl(t.pickup?.image_url)}
                    alt={t.pickup?.name || "Pickup"}
                    className="h-36 w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (!img.dataset.fallback) {
                        img.dataset.fallback = "1";
                        img.src = "/placeholder.jpg";
                      }
                    }}
                  />
                  <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                    {t.pickup?.name ?? "Pickup"}
                  </div>
                </div>

                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proxiedImageUrl(t.destination?.image_url)}
                    alt={t.destination?.name || "Destination"}
                    className="h-36 w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (!img.dataset.fallback) {
                        img.dataset.fallback = "1";
                        img.src = "/placeholder.jpg";
                      }
                    }}
                  />
                  <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                    {t.destination?.name ?? "Destination"}
                  </div>
                </div>
              </div>

              {/* Price under images (right aligned) */}
              <div className="flex items-center justify-end px-4 pt-2">
                {hasPrice ? (
                  <div className="text-sm font-extrabold text-slate-900">
                    From {formatMoney(priceCurrency, priceMajor as number)}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500"> </div>
                )}
              </div>

              {/* Content (tighter spacing) */}
              <div className="px-4 pb-4 pt-2">
                <div className="text-sm font-semibold text-slate-500">
                  Return trip by {t.vehicle_type ?? "Shuttle"}
                </div>

                <div className="mt-1 text-lg font-extrabold text-slate-900">{t.route_name}</div>

                {t.schedule ? (
                  <div className="mt-2 text-sm text-slate-600 whitespace-pre-line">{t.schedule}</div>
                ) : (
                  <div className="mt-2 text-sm text-slate-600">Live availability and pricing</div>
                )}

                <div className="mt-3 flex items-center justify-end">
                  <div className="text-xs text-slate-500">
                    Updated: {data?.fetched_at ? new Date(data.fetched_at).toLocaleString() : "—"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
