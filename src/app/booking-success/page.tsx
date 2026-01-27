"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function BookingSuccess() {
  const sp = useSearchParams();
  const id = sp.get("id");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Booking confirmed 🎉</h1>
      <p className="mt-2 text-slate-600">Your reservation is secured.</p>

      {id && (
        <div className="mt-6 rounded-2xl border bg-white p-5">
          <div className="text-sm text-slate-500">Booking ID</div>
          <div className="font-mono text-sm break-all">{id}</div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Link className="rounded-xl border px-4 py-2" href="/charters">Back to Charters</Link>
        <Link className="rounded-xl bg-sky-600 text-white px-4 py-2" href="/availability?charter=day">Book another</Link>
      </div>
    </main>
  );
}
