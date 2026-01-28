import Link from "next/link";
import { fetchPaceShuttleRoutes } from "@/lib/paceShuttles";

export default async function PaceShuttleTiles() {
  const routes = await fetchPaceShuttleRoutes();

  if (!routes.length) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-slate-700">
        Shuttle routes are not available yet (PACE_SHUTTLES_URL / PACE_API_TOKEN not configured).
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {routes.map((r) => (
        <div key={r.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {/* ✅ Use plain <img> so remote images “just work” */}
          <div className="relative">
            <img
              src={r.image_url || "/ShuttleCharter.jpeg"}
              alt={r.title}
              className="h-44 w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
          </div>

          <div className="p-4">
            <div className="text-sm font-semibold text-slate-900">{r.title}</div>

            {r.subtitle && <div className="mt-1 text-xs text-slate-600">{r.subtitle}</div>}

            <div className="mt-3 flex items-end justify-between">
              <div className="text-xs text-slate-500">
                {r.next_departure ? <>Next: <span className="text-slate-700">{r.next_departure}</span></> : <span> </span>}
              </div>

              {typeof r.price_gbp === "number" && (
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">FROM</div>
                  <div className="text-lg font-bold text-slate-900">£{r.price_gbp}</div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Link
                href={r.href || "/availability?charter=shuttle"}
                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline"
              >
                View options <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
