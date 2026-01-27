"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const booking = sp.get("booking") || "";
  const [status, setStatus] = useState("Ready to pay (mock).");
  const [error, setError] = useState<string | null>(null);

  async function confirmMockPayment() {
    if (!booking) return;
    setStatus("Confirming booking…");
    setError(null);

    const res = await fetch("/api/bookings/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ booking_id: booking }),
    });

    const j = await res.json();
    if (!res.ok) {
      setError(j.error || "Failed to confirm");
      setStatus("Error");
      return;
    }

    router.push(`/booking-success?id=${encodeURIComponent(booking)}`);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
      <p className="mt-2 text-slate-600">Payment is mocked. Clicking pay will confirm and reserve your booking.</p>

      <div className="mt-6 rounded-2xl border bg-white p-5">
        <div className="text-sm text-slate-500">Booking ID</div>
        <div className="font-mono text-sm break-all">{booking || "Missing booking id"}</div>

        <div className="mt-4 text-sm text-slate-700">{status}</div>
        {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}

        <button
          onClick={confirmMockPayment}
          disabled={!booking}
          className="mt-6 w-full rounded-xl bg-sky-600 py-3 text-white font-semibold disabled:bg-slate-300"
        >
          Pay now (mock) — confirm booking
        </button>
      </div>
    </main>
  );
}
