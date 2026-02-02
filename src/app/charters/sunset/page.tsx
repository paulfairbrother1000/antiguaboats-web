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

export default async function SunsetCharterPage() {
  const title = "Sunset Cruise";
  const charterSlug = "sunset";

  const priceUSD = await getCharterPriceUSD(charterSlug);

  const hoursLine = "16:30 – 18:30 – 2 hours";
  const tagline =
    "Golden hour magic on the magnificent Antiguan waters, beaches and coves.";

  const body = [
    "There are few moments more special than being out on the water as the Caribbean sun begins to set. A sunset cruise is all about slowing down, soaking up the atmosphere, and enjoying Antigua at its most beautiful.",
    "We’ll take you to a scenic stretch of coastline where the light turns golden, the sea calms, and the island glows. It’s the perfect time for a relaxed drink, great conversation, and unforgettable photos.",
    "Ideal for couples, celebrations, or anyone looking for a truly memorable experience, our sunset cruises offer a calm, stylish end to the day — with the option to tailor the pace and route to suit your mood.",
  ];

  // Images must live here:
  // /public/charters/sunset/hero.jpg
  // /public/charters/sunset/img1.jpg ... img4.jpg
  const folder = "/charters/sunset";

  // Use same live video for now (can be changed later)
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
