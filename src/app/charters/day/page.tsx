// src/app/charters/day/page.tsx
import CharterTemplate from "@/components/CharterTemplate";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

async function getCharterPriceUSD(charterSlug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from("charter_types")
    .select("base_price_cents, currency")
    .eq("slug", charterSlug)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) return null;

  // Prices are stored in cents
  return data.base_price_cents / 100;
}

export default async function FullDayCharterPage() {
  const title = "Full Day Charter";
  const charterSlug = "day";

  const priceUSD = await getCharterPriceUSD(charterSlug);

  const hoursLine = "10:00 – 17:00 – 7 hours";
  const tagline =
    "Full day of adventure in the magnificent Antiguan waters, beaches and coves.";

  const body = [
    "A full day charter is the ultimate way to experience Antigua’s coastline — unhurried, flexible, and designed around what you love most: swimming, exploring, relaxing, or a bit of everything.",
    "Your Captain will suggest beautiful bays, quiet swim spots and standout locations for a beach stop or lunch. Prefer to keep it spontaneous? No problem — we’ll shape the day around the conditions and your mood.",
    "Expect a comfortable, safe ride with an attentive crew who will take care of the details, so you can focus on the sun, the sea and the scenery. It’s a day made for memories.",
  ];

  // Images live here:
  // /public/charters/fullday/hero.jpg
  // /public/charters/fullday/img1.jpg ... img4.jpg
  const folder = "/charters/fullday";

  // YouTube (live link supported)
  const youtubeUrl = "https://www.youtube.com/live/pIfhcodEbls";

  // ✅ Lunch images: /public/food/img1.jpg ... img4.jpg
  const lunchImages = ["/food/img1.jpg", "/food/img2.jpg", "/food/img3.jpg", "/food/img4.jpg"];

  const lunchTile = (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Lunch Options</h2>

      <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-700">
        <p>
          On your day&apos;s charter, after a morning of fun we can deliver you in style to one of
          Antigua’s outstanding waterside restaurants for lunch. Let us know when you book your
          charter if you would like us to make reservations for you.
        </p>

        <p>Alternatively, you are free to bring your own snacks and lunches.</p>

        <p>
          For those wishing to stay onboard for a tasty, Caribbean inspired lunch without the
          hassle of procuring your own, we provide light, Caribbean inspired cuisine at an
          additional charge.
        </p>

        <p>We have Standard and vegan menus.</p>

        <p className="text-slate-600">
          Please remember our sports boat has no cooking facilities and our amazing crew are not
          gourmet chefs.
        </p>

        <p>
          However, our lunch partners produce amazing quality Caribbean flavours that our crew will
          present to you in the idyllic, unique Caribbean surroundings of a beautiful cove or beach.
        </p>

        <p className="font-semibold text-slate-800">
          Please include details of any allergies or specific requirements during the booking
          process.
        </p>
      </div>

      {/* Lunch photo tiles: 2 cols on desktop + mobile landscape; 1 col on mobile portrait */}
      <div className="mt-6 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2">
        {lunchImages.map((src) => (
          <div key={src} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <img src={src} alt="Lunch option" className="h-56 w-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <CharterTemplate
      title={title}
      subtitle="" // unused when structured header is provided
      body={body}
      folder={folder}
      youtubeUrl={youtubeUrl}
      priceUSD={priceUSD}
      hoursLine={hoursLine}
      tagline={tagline}
      afterGallery={lunchTile}
    />
  );
}
