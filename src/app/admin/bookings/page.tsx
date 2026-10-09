import { sbServer } from "@/lib/supabaseServer";
export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const supa = sbServer();
  const { data: bookings } = await supa
    .from("bookings")
    .select("id,status,start_at,end_at,total_amount_cents,currency,refund_status,seat_count,seat_surcharge_cents")
    .order("start_at", { ascending: true })
    .limit(100);

  const {data:emails} = await supa.from("charter_email_queue").select("id,subject,state,attempts,last_error,created_at").order("created_at",{ascending:false}).limit(30);
  const {data:vehicle} = await supa.from("charter_vehicles").select("name,target_revenue_cents,min_seats,max_seats,contribution_cents,max_surcharge_cents,discount_percent").eq("slug","silver-lady").single();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
      <p className="mt-2 text-slate-600">Cancel a booking to free the slot. Refund is mocked for now.</p>

      {vehicle && <section className="mt-6 rounded-2xl border p-5"><h2 className="text-xl font-bold">{vehicle.name} — pay-per-seat settings</h2>
      <p className="mt-2">Target ${(vehicle.target_revenue_cents/100).toFixed(2)} · Minimum {vehicle.min_seats} · Capacity {vehicle.max_seats} · Contribution ${(vehicle.contribution_cents/100).toFixed(2)} · Surcharge cap ${(vehicle.max_surcharge_cents/100).toFixed(2)} per seat · Promotion {vehicle.discount_percent}%</p></section>}
      <div className="mt-6 space-y-3">
        {(bookings ?? []).map(b => (
          <form
            key={b.id}
            action="/admin/bookings/cancel"
            method="post"
            className="rounded-2xl border bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <input type="hidden" name="bookingId" value={b.id} />
            <div>
              <div className="font-mono text-xs text-slate-500">{b.id}</div>
              <div className="font-semibold text-slate-900">{b.start_at} → {b.end_at}</div>
              <div className="text-sm text-slate-600">
                Status: <span className="font-medium">{b.status}</span> • Refund: {b.refund_status ?? "none"} • Seats: {b.seat_count ?? "—"} • Surcharge: ${((b.seat_surcharge_cents ?? 0)/100).toFixed(2)} • Total: {(b.total_amount_cents/100).toFixed(2)} {b.currency}
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
      <section className="mt-10"><h2 className="text-xl font-bold">Charter email delivery</h2>
      {!process.env.RESEND_API_KEY || !process.env.CHARTER_EMAIL_FROM ? <p className="mt-2 text-amber-800">Email delivery connection is not configured. Messages remain queued until configured.</p> : null}
      <div className="mt-4 space-y-3">{(emails??[]).map(e=><div key={e.id} className="rounded-xl border p-4"><p className="font-semibold">{e.subject}</p><p className="text-sm">{e.state} · {e.attempts} delivery attempts{e.last_error ? ` · ${e.last_error}` : ""}</p></div>)}</div></section>
    </main>
  );
}
