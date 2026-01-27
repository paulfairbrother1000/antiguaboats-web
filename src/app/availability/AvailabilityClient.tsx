"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type ApiDay = {
  date: string;
  slots: { slotId: string; label: string; start: string; end: string; available: boolean }[];
};

export default function AvailabilityClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const charter = sp.get("charter") ?? "day";

  const today = new Date();
  const fromDefault = today.toISOString().slice(0, 10);
  const toDefault = new Date(today.getTime() + 14 * 86400000).toISOString().slice(0, 10);

  const [from, setFrom] = useState(fromDefault);
  const [to, setTo] = useState(toDefault);
  const [days, setDays] = useState<ApiDay[]>([]);
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    const map: Record<string, string> = {
      day: "Day Charter Availability",
      "half-day": "½ Day Charter Availability",
      sunset: "Sunset Availability",
      "restaurant-shuttle": "Restaurant Shuttle (On Request)",
    };
    return map[charter] ?? "Availability";
  }, [charter]);

  async function load() {
    setLoading(true);
    const res = await fetch(
      `/api/availability?charter=${encodeURIComponent(charter)}&from=${from}&to=${to}`,
      { cache: "no-store" }
    );
    const json = await res.json();
    setDays(json.days ?? []);
    setLoading(false);
  }

  async function book(date: string, slotId: string) {
    const res = await fetch("/api/bookings/hold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ charter, date, slotId }),
    });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error ?? "Unable to create hold");
      return;
    }
    router.push(`/checkout?booking=${encodeURIComponent(json.bookingId)}`);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-600">
        Select a date and slot. (Pace Shuttles integration is disabled for now.)
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 items-end">
        <div>
          <label className="block text-sm text-slate-600">From</label>
          <input
            className="mt-1 border rounded-xl px-3 py-2"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600">To</label>
          <input
            className="mt-1 border rounded-xl px-3 py-2"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <button
          onClick={load}
          className="rounded-xl bg-sky-600 text-white px-5 py-2.5 font-medium hover:bg-sky-700"
        >
          {loading ? "Loading..." : "Check Availability"}
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {days.map((d) => (
          <div key={d.date} className="rounded-2xl border bg-white p-5">
            <div className="font-semibold text-slate-900">{d.date}</div>

            {d.slots.length === 0 ? (
              <div className="mt-2 text-sm text-slate-600">
                This charter is on request. Please use Contact to arrange.
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {d.slots.map((s) => (
                  <button
                    key={s.slotId}
                    disabled={!s.available}
                    onClick={() => book(d.date, s.slotId)}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      s.available ? "hover:shadow-md" : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="font-medium text-slate-900">{s.label}</div>
                    <div className="text-sm text-slate-600">
                      {s.start}–{s.end}
                    </div>
                    <div
                      className={`mt-2 text-sm font-medium ${
                        s.available ? "text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      {s.available ? "Available" : "Unavailable"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
