export type ShuttleRoute = {
  id: string;
  title: string;
  from: string;
  to: string;
  frequency?: string;
  next_departure?: string;
  price?: number;
  currency?: string;
  image_url?: string;
  source: "pace";
};

export async function fetchPaceShuttleRoutes(): Promise<ShuttleRoute[]> {
  const url = process.env.PACE_SHUTTLES_SHUTTLE_ROUTES_URL;
  const token = process.env.PACE_API_TOKEN;

  if (!url || !token) return [];

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const json = (await res.json()) as any;

    // Expecting something like: { routes: [...] }
    const routes = (json.routes ?? json.data ?? []) as any[];

    return routes.map((r, idx) => ({
      id: String(r.id ?? idx),
      title: String(r.title ?? `${r.from ?? "Jolly Harbour"} → ${r.to ?? "Destination"}`),
      from: String(r.from ?? r.origin ?? "Jolly Harbour"),
      to: String(r.to ?? r.destination ?? "Destination"),
      frequency: r.frequency ? String(r.frequency) : undefined,
      next_departure: r.next_departure ? String(r.next_departure) : r.next ? String(r.next) : undefined,
      price: typeof r.price === "number" ? r.price : r.price ? Number(r.price) : undefined,
      currency: r.currency ? String(r.currency) : "USD",
      image_url: r.image_url ? String(r.image_url) : r.image ? String(r.image) : undefined,
      source: "pace",
    }));
  } catch {
    return [];
  }
}
