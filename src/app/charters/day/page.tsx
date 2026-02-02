import CharterTemplate from "@/components/CharterTemplate";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

async function getCharterPriceUSD(charterSlug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // NOTE:
  // Update table/column names here if yours differ.
  // Expected shape: table "charter_prices" with columns: slug (text), price_usd (numeric)
  const { data, error } = await supabase
    .from("charter_prices")
    .select("price_usd")
    .eq("slug", charterSlug)
    .maybeSingle();

  if (error) return null;
  if (!data?.price_usd && data?.price_usd !== 0) return null;

  return Number(data.price_usd);
}

export default async function FullDayCharterPage() {
  const title = "Full Day Charter";

  const charterSlug = "day";
  const priceUSD = await getCharterPriceUSD(charterSlug);

  const hoursLine = "10:00 – 17:00 – 7 hours";
  const tagline =
    "Full day of adventure in the  magnificent Antiguan waters, beaches and coves.";

  const body = [
    "A full day charter is the ultimate way to experience Antigua’s coastline — unhurried, flexible, and designed around what you love most: swimming, exploring, relaxing, or a bit of everything.",
    "Your Captain will suggest beautiful bays, quiet swim spots and standout locations for a beach stop or lunch. Prefer to keep it spontaneous? No problem — we’ll shape the day around the conditions and your mood.",
    "Expect a comfortable, safe ride with an attentive crew who will take care of the details, so you can focus on the sun, the sea and the scenery. It’s a day made for memories.",
  ];

  // Put images here: /public/charters/fullday/hero.jpg, img1.jpg ... img4.jpg
  const folder = "/charters/fullday";

  // YouTube (live link supported)
  const youtubeUrl = "https://www.youtube.com/live/pIfhcodEbls";

  return (
    <CharterTemplate
      title={title}
      subtitle="" // kept for backwards-compat; not used when hoursLine/tagline/priceUSD provided
      body={body}
      folder={folder}
      youtubeUrl={youtubeUrl}
      priceUSD={priceUSD}
      hoursLine={hoursLine}
      tagline={tagline}
    />
  );
}
