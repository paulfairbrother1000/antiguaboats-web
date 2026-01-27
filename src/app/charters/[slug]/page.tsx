import { sbServer } from "@/lib/supabaseServer";
import { GalleryCarousel } from "@/components/GalleryCarousel";
import { CharterPricingCard } from "@/components/CharterPricingCard";

const FALLBACK: Record<string, any> = {
  "day": { bullets: ["10:00–17:00", "Private charter", "Bays & beaches", "Captain-led local knowledge"] },
  "half-day": { bullets: ["AM 10:00–13:00", "PM 14:00–17:00", "Private charter", "Fast-paced and flexible"] },
  "sunset": { bullets: ["16:30–18:30", "Sunset views", "Perfect for photos", "Relaxed cruise"] },
  "restaurant-shuttle": { bullets: ["On-request timing", "Waterfront drop-off", "Fast & fun", "Perfect for dinner"] },
};

export default async function CharterDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const supa = sbServer();

  const { data: ct } = await supa
    .from("charter_types")
    .select("id, slug, title, subtitle, description, base_price_cents, currency, active")
    .eq("slug", slug)
    .maybeSingle();

  if (!ct) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold">Not found</h1>
      </main>
    );
  }

  const { data: photos } = await supa
    .from("charter_type_photos")
    .select("url, caption, sort_order")
    .eq("charter_type_id", ct.id)
    .order("sort_order", { ascending: true });

  const images = (photos ?? []).map(p => ({ url: p.url, caption: p.caption }));
  const priceUSD = ct.base_price_cents ? Math.round(ct.base_price_cents / 100) : 0;
  const bullets = FALLBACK[slug]?.bullets ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <h1 className="text-4xl font-bold text-slate-900">{ct.title}</h1>
          {ct.subtitle && <p className="mt-2 text-slate-600 text-lg">{ct.subtitle}</p>}

          <div className="mt-6">
            <GalleryCarousel images={images} />
          </div>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-slate-900">About this charter</h2>
            <p className="mt-3 text-slate-700 leading-relaxed">{ct.description}</p>
          </section>
        </div>

        <div className="lg:col-span-4">
          <CharterPricingCard title={ct.title} priceUSD={priceUSD} bullets={bullets} charterSlug={slug} />
        </div>
      </div>
    </main>
  );
}
