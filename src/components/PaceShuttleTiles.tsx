"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ShuttleTile = {
  route_id: string;
  country?: string;
  vehicle_type?: string;
  route_name: string;
  pickup?: { id: string; name: string; image_url?: string };
  destination?: { id: string; name: string; image_url?: string };
  schedule?: string;

  // Pace payload (current)
  cheapest?: {
    unit_minor?: number;
    currency?: string;
    display_major_rounded_up?: number;
    applies_to?: { date_iso?: string; pickup_time?: string };
    max_qty_at_price?: number;
  };

  // Legacy/alternate fields (keep for safety)
  lowest_price?: number;
  currency?: string;
  available_seats?: number;
  seats_available?: number;
  min_price?: number;
  from_price?: number;

  // sometimes present in other builds
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

function pickSeats(t: ShuttleTile): number | undefined {
  const anyT = t as any;
  const v =
    anyT.available_seats ??
    anyT.seats_available ??
    anyT.availableSeats ??
    anyT.seatsAvailable ??
    anyT.live_seats ??
    anyT.liveSeats;

  return typeof v === "number" ? v : undefined;
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

// fallback if cheapest isn’t present (keeps older builds working)
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

  // arrays (rare)
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

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="rounded-3xl border bg-white p-6">
        <div className="text-sm font-semibold text-slate-900">Shuttle routes are not available yet.</div>
        <div className="mt-2 text-sm text-slate-600">{error}</div>
        <div className="mt-4 text-sm text-slate-500">
          (Server proxy is{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5">/api/shuttle-routes</code>.)
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
    <div className="grid gap-4 sm:grid-cols-2">
      {tiles.map((t) => {
        const seats = pickSeats(t);

        // Prefer Pace "cheapest" (current API), fallback to older fields if needed
        const cheapest = pickCheapestFromPace(t);
        const fallback = pickLowestPriceFallback(t);

        const hasPrice =
          typeof cheapest.major === "number" || typeof fallback.major === "number";

        const priceMajor =
          typeof cheapest.major === "number" ? cheapest.major : fallback.major;

        const priceCurrency =
          typeof cheapest.major === "number" ? cheapest.currency : fallback.currency;

        return (
          <div key={t.route_id} className="relative overflow-hidden rounded-3xl border bg-white">
            {/* Price pill (top-right of card) */}
            {hasPrice && typeof priceMajor === "number" && (
              <div className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-slate-900 shadow">
                From {formatMoney(priceCurrency, priceMajor)}
              </div>
            )}

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

            <div className="p-5">
              <div className="text-sm font-semibold text-slate-500">{t.vehicle_type ?? "Shuttle"}</div>

              <div className="mt-1 text-lg font-extrabold text-slate-900">{t.route_name}</div>

              {/* Live meta (only show if present) */}
              {typeof seats === "number" && (
                <div className="mt-2 text-sm text-slate-700">
                  <span className="font-semibold">{seats}</span> seats
                </div>
              )}

              {t.schedule ? (
                <div className="mt-2 text-sm text-slate-600 whitespace-pre-line">{t.schedule}</div>
              ) : (
                <div className="mt-2 text-sm text-slate-600">Live availability and pricing</div>
              )}

              <div className="mt-4 flex items-center justify-between gap-3">
                <Link
                  href={`/availability?charter=shuttle&route_id=${encodeURIComponent(t.route_id)}`}
                  className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  View availability
                </Link>

                <div className="text-xs text-slate-500">
                  Updated: {data?.fetched_at ? new Date(data.fetched_at).toLocaleString() : "—"}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
