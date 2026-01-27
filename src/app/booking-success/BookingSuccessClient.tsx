"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function BookingSuccessClient() {
  const sp = useSearchParams();
  const bookingId = sp.get("booking") ?? "";

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Booking confirmed</h1>
      <p className="mt-3 text-slate-700">
        Thanks — your booking is confirmed.
        {bookingId ? (
          <>
            {" "}
            Your reference is <span className="font-semibold">{bookingId}</span>.
          </>
        ) : null}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Back to home
        </Link>
        <Link
          href="/availability?charter=day"
          className="inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Book another charter
        </Link>
      </div>
    </main>
  );
}
