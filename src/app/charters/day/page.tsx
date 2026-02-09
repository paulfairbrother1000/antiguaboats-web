// src/app/charters/day/page.tsx
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

function moneyUSD(amount: number | null) {
  if (amount === null || !Number.isFinite(amount)) return null;
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

function youtubeEmbedUrl(url: string) {
  // Supports https://www.youtube.com/live/<id> and standard watch URLs
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      // /live/<id>
      const parts = u.pathname.split("/").filter(Boolean);
      const liveIdx = parts.indexOf("live");
      if (liveIdx >= 0 && parts[liveIdx + 1]) {
        return `https://www.youtube.com/embed/${parts[liveIdx + 1]}`;
      }
      // watch?v=<id>
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      // /embed/<id>
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIdx + 1]}`;
      }
    }
  } catch {
    // ignore
  }
  return url; // fallback (won't break build)
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

  // Existing 4 charter images (as before)
  const charterFolder = "/charters/fullday";
  const charterImages = ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"].map(
    (f) => `${charterFolder}/${f}`
  );

  // ✅ New lunch images
  const foodFolder = "/food";
  const lunchImages = ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"].map(
    (f) => `${foodFolder}/${f}`
  );

  // YouTube (live link supported)
  const youtubeUrl = "https://www.youtube.com/live/pIfhcodEbls";
  const youtubeEmbed = youtubeEmbedUrl(youtubeUrl);

  return (
    <main className="bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500">Charters</div>
            <h1 className="mt-2 text-4xl font-extrabold text-slate-900">{title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700">
              {priceUSD !== null && (
                <div className="text-2xl font-extrabold">{moneyUSD(priceUSD)}</div>
              )}
              <div className="text-sm font-semibold text-slate-600">{hoursLine}</div>
            </div>
            <p className="mt-3 max-w-2xl text-slate-600">{tagline}</p>
          </div>
        </div>

        {/* Hero */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200">
          <img
            src={`${charterFolder}/hero.jpg`}
            alt="Full Day Charter"
            className="h-[520px] w-full object-cover"
          />
        </div>

        {/* Body */}
        <div className="mt-8 space-y-4 text-base leading-relaxed text-slate-700">
          {body.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Existing 4 image tiles */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-lg font-semibold text-slate-900">Gallery</div>

          {/* 2 cols on desktop + mobile landscape; 1 col on mobile portrait */}
          <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2">
            {charterImages.map((src) => (
              <div
                key={src}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <img src={src} alt="Full Day Charter" className="h-56 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Lunch Options tile (below charter images, above YouTube) */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Lunch Options</h2>

          <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-700">
            <p>
              On your day&apos;s charter, after a morning of fun we can deliver you in style to one
              of Antigua’s outstanding waterside restaurants for lunch. Let us know when you book
              your charter if you would like us to make reservations for you.
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
              However, our lunch partners produce amazing quality Caribbean flavours that our crew
              will present to you in the idyllic, unique Caribbean surroundings of a beautiful cove
              or beach.
            </p>

            <p className="font-semibold text-slate-800">
              Please include details of any allergies or specific requirements during the booking
              process.
            </p>
          </div>

          {/* Lunch photo tiles */}
          <div className="mt-6 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2">
            {lunchImages.map((src) => (
              <div
                key={src}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <img src={src} alt="Lunch option" className="h-56 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* YouTube */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-lg font-semibold text-slate-900">Video</div>
          <div className="aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-black">
            <iframe
              src={youtubeEmbed}
              title="YouTube video"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </main>
  );
}
