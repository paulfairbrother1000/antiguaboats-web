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
  // Depending on the payload, you may also have:
  // lowest_price?: number;
  // currency?: string;
  // available_seats?: number;
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
        <div className="text-sm font-semibold text-slate-900">Shuttle routes are not available yet.</div>
        <div className="mt-2 text-sm text-slate-600">
          {error}
        </div>
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
        <div className="mt-2 text-sm text-slate-600">
          Please check back soon.
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tiles.map((t) => (
        <div key={t.route_id} className="overflow-hidden rounded-3xl border bg-white">
          <div className="grid grid-cols-2 gap-0">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.pickup?.image_url || "/placeholder.jpg"}
                alt={t.pickup?.name || "Pickup"}
                className="h-36 w-full object-cover"
              />
              <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                {t.pickup?.name ?? "Pickup"}
              </div>
            </div>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.destination?.image_url || "/placeholder.jpg"}
                alt={t.destination?.name || "Destination"}
                className="h-36 w-full object-cover"
              />
              <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                {t.destination?.name ?? "Destination"}
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="text-sm font-semibold text-slate-500">
              {t.vehicle_type ?? "Shuttle"}
            </div>

            <div className="mt-1 text-lg font-extrabold text-slate-900">
              {t.route_name}
            </div>

            {t.schedule ? (
              <div className="mt-2 text-sm text-slate-600 whitespace-pre-line">
                {t.schedule}
              </div>
            ) : (
              <div className="mt-2 text-sm text-slate-600">
                Live availability and pricing
              </div>
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
      ))}
    </div>
  );
}
