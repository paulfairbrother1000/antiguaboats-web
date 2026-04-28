import Link from "next/link";
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

  const body: string[] = [];

  const folder = "/charters/fullday";
  const youtubeUrl = "https://www.youtube.com/live/pIfhcodEbls";

  const sharedCharterTiles = (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-white p-7">
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            A Full Day Shared Charter is a brilliant way to enjoy the full Antigua Boats experience
            at a lower price, while sharing the day with one other small group.
          </p>

          <p>
            Your party of up to 4 guests will share the boat with one other booking group of up to 4
            guests. There will be a maximum of two booking groups on each shared charter.
          </p>

          <p>
            The itinerary is much the same as our{" "}
            <Link href="/charters/day" className="font-semibold text-sky-700 hover:text-sky-800">
              Full Day Charter
            </Link>
            , with access to beautiful bays, coves, beaches and swim stops around Antigua.
          </p>

          <p>
            Groups are free to be dropped off and picked up at local beach restaurants en-route, or
            to bring their own lunch and beverages.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-7">
        <h2 className="text-xl font-black tracking-tight text-slate-900">
          How Full Day Shared Charter Works
        </h2>

        <div className="mt-4 space-y-4 text-slate-700 leading-relaxed">
          
         

          <p>
            At the time of booking, we ask you what you would like to do in if another party doesn't share the charter with you. We then
            automatically implement your choice 24 hours ahead of the booking.
          </p>

          <p>
            At the time of booking, we ask for your preference in the event that no other booking shares your charter. You may choose from:, :
          </p>

          <ul className="list-disc space-y-2 pl-6">
            <li>Cancel the booking and receive a full refund</li>
            <li>
              Same day {" "}
              <Link
                href="/charters/half-day"
                className="font-semibold text-sky-700 hover:text-sky-800"
              >
                ½ Day Morning Charter
              </Link>{" "}
              — the entire boat at no additional cost
            </li>
            <li>
              Same day {" "}
              <Link
                href="/charters/half-day"
                className="font-semibold text-sky-700 hover:text-sky-800"
              >
                ½ Day Afternoon Charter
              </Link>{" "}
              — the entire boat at no additional cost
            </li>
            <li>
              Same day {" "}
              <Link href="/charters/day" className="font-semibold text-sky-700 hover:text-sky-800">
                Full Day Charter
              </Link>
              , paying the balance between the full day charter cost and the Full Day Shared
              Charter.
            </li>
          </ul>

          <p>
            Your wishes made at booking time shall be automatically executed and billed where
            applicable 24 hours before the booking.
          </p>

          <p>
            Of course, if you’re booking a date that is already part booked this is not an issue. We
            clearly mark dates which are partly booked for Full Day Shared Charters.
          </p>
        </div>
      </div>
    </div>
  );

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
      beforeImages={sharedCharterTiles}
    />
  );
}