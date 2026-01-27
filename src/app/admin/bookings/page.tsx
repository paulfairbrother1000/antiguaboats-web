import { sbServer } from "@/lib/supabaseServer";

export default async function AdminBookingsPage() {
  const supa = sbServer();
  const { data: bookings } = await supa
    .from("bookings")
    .select("id,status,start_at,end_at,total_amount_cents,currency,refund_status")
    .order("start_at", { ascending: true })
    .limit(100);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
      <p className="mt-2 text-slate-600">Cancel a booking to free the slot. Refund is mocked for now.</p>

      <div className="mt-6 space-y-3">
        {(bookings ?? []).map(b => (
          <form
            key={b.id}
            action="/api/admin/bookings/cancel"
            method="post"
            className="rounded-2xl border bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <input type="hidden" name="bookingId" value={b.id} />
            <div>
              <div className="font-mono text-xs text-slate-500">{b.id}</div>
              <div className="font-semibold text-slate-900">{b.start_at} → {b.end_at}</div>
              <div className="text-sm text-slate-600">
                Status: <span className="font-medium">{b.status}</span> • Refund: {b.refund_status ?? "none"} • Total: {(b.total_amount_cents/100).toFixed(2)} {b.currency}
              </div>
            </div>

            <div className="flex gap-2">
              <input name="reason" placeholder="Cancel reason (optional)" className="rounded-xl border px-3 py-2 text-sm w-full sm:w-64" />
              <button
                disabled={b.status !== "CONFIRMED"}
                className="rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ))}
      </div>
    </main>
  );
}
