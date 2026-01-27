"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const bookingId = sp.get("booking") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function payNow() {
    setLoading(true);
    setError(null);

    try {
      // TODO: mock Stripe for now – call your confirm endpoint
      const res = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Payment failed");
        setLoading(false);
        return;
      }

      router.push(`/booking-success?booking=${encodeURIComponent(bookingId)}`);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>

      {!bookingId ? (
        <div className="mt-4 rounded-2xl border bg-white p-5">
          <p className="text-slate-700">Missing booking reference.</p>
          <div className="mt-4">
            <Link className="text-sky-700 hover:underline" href="/availability?charter=day">
              Go to availability
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border bg-white p-6">
          <div className="text-slate-700">
            Booking reference: <span className="font-semibold">{bookingId}</span>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
          ) : null}

          <button
            onClick={payNow}
            disabled={loading}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {loading ? "Processing…" : "Pay now (mock)"}
          </button>

          <p className="mt-3 text-xs text-slate-500">
            Payment is mocked for now. This will reserve the booking once Stripe is wired in.
          </p>
        </div>
      )}
    </main>
  );
}
