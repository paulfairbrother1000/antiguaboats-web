export type PaceShuttleRoute = {
  id: string;
  title: string;        // "Jolly Harbour → Shirley Heights"
  subtitle?: string;    // "Every Sunday" etc
  price_gbp?: number;
  next_departure?: string;
  image_url?: string;   // IMPORTANT: remote image
  href?: string;        // optional deep link
};

export async function fetchPaceShuttleRoutes(): Promise<PaceShuttleRoute[]> {
  const url = process.env.PACE_PARTNER_BASE_URL;
  const token = process.env.PACE_API_TOKEN;

  if (!url || !token) return [];

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return [];

    // Expecting: { routes: [...] }
    const json = (await res.json()) as { routes?: any[] };

    return (json.routes ?? []).map((r, idx) => ({
      id: String(r.id ?? idx),
      title: String(r.title ?? r.name ?? "Shuttle Route"),
      subtitle: r.subtitle ? String(r.subtitle) : undefined,
      price_gbp: typeof r.price_gbp === "number" ? r.price_gbp : undefined,
      next_departure: r.next_departure ? String(r.next_departure) : undefined,
      image_url: r.image_url ? String(r.image_url) : undefined,
      href: r.href ? String(r.href) : undefined,
    }));
  } catch {
    return [];
  }
}
