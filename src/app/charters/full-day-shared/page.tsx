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

export default async function FullDaySharedCharterPage() {
  const title = "Full Day Shared Charter";
  const charterSlug = "full-day-shared";

  const priceUSD = await getCharterPriceUSD(charterSlug);

  const hoursLine = "10:00 – 17:00 – 7 hours";
  const tagline =
    "A full day adventure around Antigua for your group of up to 4 people, sharing the charter with one other group.";

  const body = [
    "A Full Day Shared Charter is a brilliant way to enjoy the full Antigua Boats experience at a lower price, while sharing the day with one other small group.",
    "Your party of up to 4 guests will share the boat with one other booking group of up to 4 guests. There will be a maximum of two booking groups on each shared charter.",
    "The itinerary is much the same as our Full Day Charter, with access to beautiful bays, coves, beaches and swim stops around Antigua. Groups are free to be dropped off and picked up at local beach restaurants en route, or to bring their own lunch and beverages.",
    "Shared charters only run when two groups are booked to travel 24 hours before departure. If a second group has not booked in time, you can choose at booking whether you would prefer to cancel for a refund, switch to a same-day half day charter at no additional cost, or pay the balance and enjoy the boat as a Full Day Charter.",
    "You will be notified when your shared charter receives its second booking, so you can relax and look forward to your Antiguan adventure.",
  ];

  const folder = "/charters/fullday";
  const youtubeUrl = "https://www.youtube.com/live/pIfhcodEbls";

  return (
    <CharterTemplate
      title={title}
      subtitle=""
      body={body}
      folder={folder}
      youtubeUrl={youtubeUrl}
      priceUSD={priceUSD}
      hoursLine={hoursLine}
      tagline={tagline}
    />
  );
}