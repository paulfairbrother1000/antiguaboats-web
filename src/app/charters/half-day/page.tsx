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

  return data.base_price_cents / 100;
}

export default async function HalfDayCharterPage() {
  const title = "½ Day Charter";
  const charterSlug = "half-day";

  const priceUSD = await getCharterPriceUSD(charterSlug);

  const hoursLine = "10:00 – 13:00 or 14:00 – 17:00 – 3 hours";
  const tagline =
    "Quick island escape in the magnificent Antiguan waters, beaches and coves.";

  const body = [
    "Short on time but still want the “wow” factor? A half-day charter is the perfect way to escape the crowds and spend a few glorious hours on the water.",
    "We’ll recommend a plan that fits your timing and the conditions — perhaps a calm bay for swimming and snorkelling, a scenic coastal cruise, or a couple of standout stops for photos and a quick dip.",
    "It’s relaxed, effortless, and ideal for couples, families, or friends who want a premium experience without committing to a full day. Tell us your vibe — chilled, adventurous, or a bit of both — and we’ll tailor the trip.",
  ];

  // Standardised folder approach
  // Put images here:
  // /public/charters/halfday/hero.jpg
  // /public/charters/halfday/img1.jpg ... img4.jpg
  const folder = "/charters/halfday";

  // If you don't have a Half Day video yet, keep this undefined (video section will not render)
  const youtubeUrl = "https://www.youtube.com/live/pIfhcodEbls";

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
    />
  );
}
