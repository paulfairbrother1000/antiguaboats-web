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

  // NOTE: Pace payload may include some of these (names can vary).
  // We’ll read them safely at runtime and show if present.
  lowest_price?: number;
  currency?: string;
  available_seats?: number;
  seats_available?: number;
  min_price?: number;
  from_price?: number;
};

type ShuttleRoutesResponse = {
  source?: string;
  fetched_at?: string;
  tiles?: ShuttleTile[];
  // If upstream error:
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
  // Proxy remote images through our own domain to avoid client DNS/CORS surprises.
  // Requires: src/app/api/img/route.ts
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

function pickPrice(t: ShuttleTile): number | undefined {
  const anyT = t as any;
  const v =
    anyT.lowest_price ??
    anyT.lowestPrice ??
    anyT.from_price ??
    anyT.fromPrice ??
    anyT.min_price ??
    anyT.minPrice;

  return typeof v === "number" ? v : undefined;
}

function pickCurrency(t: ShuttleTile): string | undefined {
  const anyT = t as any;
  const v = anyT.currency ?? anyT.ccy ?? anyT.iso_currency ?? anyT.isoCurrency;
  return typeof v === "string" ? v : undefined;
}

function formatMoney(currency: string | undefined, amount: number) {
  // Keep it robust if currency is missing/odd.
  const ccy = currency || "USD";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: ccy,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback
    return `${ccy} ${Math.round(amount)}`;
  }
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
          // If the proxy returned an error payload
          if (json?.error) {
            throw new Error(json.error);
          }
          setData(json);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "Failed to load shuttle routes");
        }
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
        <div className="text-sm font-semibold text-slate-900">
          Shuttle routes are not available yet.
        </div>
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
        <div className="text-sm font-semibold text-slate-900">
          No shuttle routes available right now.
        </div>
        <div className="mt-2 text-sm text-slate-600">Please check back soon.</div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tiles.map((t) => {
        const seats = pickSeats(t);
        const price = pickPrice(t);
        const currency = pickCurrency(t);

        return (
          <div key={t.route_id} className="overflow-hidden rounded-3xl border bg-white">
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
              {(typeof seats === "number" || typeof price === "number") && (
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-700">
                  {typeof seats === "number" && (
                    <div>
                      <span className="font-semibold">{seats}</span> seats
                    </div>
                  )}
                  {typeof price === "number" && (
                    <div>
                      from <span className="font-semibold">{formatMoney(currency, price)}</span>
                    </div>
                  )}
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
