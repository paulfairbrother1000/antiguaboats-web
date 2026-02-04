import Link from "next/link";
import PaceShuttleTiles, { type ShuttleRoutesResponse } from "@/components/PaceShuttleTiles";

export const dynamic = "force-dynamic";

function deriveMeta(data: ShuttleRoutesResponse | null | undefined) {
  const first = data?.tiles?.[0];

  const country = first?.country?.trim() || "Antigua and Barbuda";
  const vehicleType = first?.vehicle_type?.trim() || "Speed Boat";

  return { country, vehicleType };
}

function getYouTubeEmbedUrl(url?: string) {
  if (!url) return null;

  try {
    const u = new URL(url);

    // youtu.be/<id>
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (u.hostname.includes("youtube.com")) {
      // youtube.com/watch?v=<id>
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;

      const parts = u.pathname.split("/").filter(Boolean);

      // youtube.com/embed/<id>
      const embedIndex = parts.indexOf("embed");
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIndex + 1]}`;
      }

      // youtube.com/live/<id>
      const liveIndex = parts.indexOf("live");
      if (liveIndex >= 0 && parts[liveIndex + 1]) {
        return `https://www.youtube.com/embed/${parts[liveIndex + 1]}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export default async function RestaurantShuttlePage() {
  let metaData: ShuttleRoutesResponse | null = null;

  try {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

    // IMPORTANT PERFORMANCE FIX:
    // - We only need this for light meta (country/vehicleType) and for initial tiles data.
    // - Do NOT allow this to block the whole page for ~20s.
    // - Use a short abort timeout + small revalidate to keep responses fast.
    const controller = new AbortController();
    const timeoutMs = 1500; // keep page fast even if upstream is slow
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${base}/api/shuttle-routes`, {
      signal: controller.signal,
      // Allow platform caching (API should still enforce correctness).
      // We only "hint" caching here to avoid blocking SSR.
      next: { revalidate: 10 },
    });

    clearTimeout(timer);

    if (res.ok) {
      metaData = (await res.json()) as ShuttleRoutesResponse;
    }
  } catch {
    // Silent fallback to defaults
  }

  const { country, vehicleType } = deriveMeta(metaData);

  const title = "Restaurant Shuttle";
  const subtitle = "Arrive by sea for lunch at Nobu, Catherine’s Café and more.";
  const hero = "/charters/shuttle/hero.jpg";

  // Same video as the other charter pages for now
  const youtubeUrl = "https://www.youtube.com/live/pIfhcodEbls";
  const embed = getYouTubeEmbedUrl(youtubeUrl);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* PAGE HEADER (match other charter pages: button in top-right, level with title) */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-500">Charters</div>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            {title}
          </h1>
        </div>

        <Link
          href="/charters"
          className="shrink-0 rounded-2xl border px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Back to Charters
        </Link>
      </div>

      {/* HERO (now includes overlaid title like the other charter pages) */}
      <section className="mt-6 overflow-hidden rounded-3xl border bg-slate-100">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero}
            alt={title}
            className="h-[320px] w-full object-cover md:h-[420px]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/35" />

          {/* Overlay: title + subtitle (like other charter pages) */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full p-6 md:p-10">
              <div className="max-w-4xl">
                <div className="text-sm font-semibold text-white/80">Charters</div>
                <div className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">
                  {title}
                </div>
                <div className="mt-2 text-white/90 md:text-lg">{subtitle}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works (unchanged copy, but now sits under hero like other pages) */}
      <section className="mt-10 rounded-3xl border bg-white p-7">
        <h2 className="text-xl font-extrabold text-slate-900">How it works</h2>

        <div className="mt-4 space-y-3 text-slate-700 leading-relaxed">
          <p>
            Antigua Boats is a proud partner of{" "}
            <a
              href="https://www.paceshuttles.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline"
            >
              Pace Shuttles
            </a>
            .
          </p>

          <p>
            <a
              href="https://www.paceshuttles.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline"
            >
              Pace Shuttles
            </a>{" "}
            is an organisation which allows local{" "}
            <span className="font-semibold">{vehicleType}</span> operators in{" "}
            <span className="font-semibold">{country}</span> to provide luxury{" "}
            <span className="font-semibold">{vehicleType}</span> shuttle journeys to stunning
            destinations at accessible prices on a per-seat charging basis.
          </p>

          <p>
            Journeys are selected on the{" "}
            <a
              href="https://www.paceshuttles.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline"
            >
              Pace Shuttles
            </a>{" "}
            portal which identifies and manages the appropriate operators, seat allocation, pricing
            and payment.
          </p>
        </div>
      </section>

      {/* Routes section (keep API tile component exactly as-is) */}
      <section className="mt-8">
        <PaceShuttleTiles initialData={metaData} />
      </section>

      {/* YouTube (full width like the other charter pages) */}
      {embed && (
        <section className="mt-10 overflow-hidden rounded-3xl border bg-black">
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <iframe
              className="absolute inset-0 h-full w-full"
              src={embed}
              title="Restaurant Shuttle video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* Good to know (unchanged) */}
      <section className="mt-10 rounded-3xl border bg-white p-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-slate-900">Good to know</h2>

            <p className="mt-3 text-slate-700 leading-relaxed">
              Visit{" "}
              <a
                href="https://www.paceshuttles.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline"
              >
                www.paceshuttles.com
              </a>{" "}
              to book your <span className="font-semibold">{vehicleType}</span> shuttle in{" "}
              <span className="font-semibold">{country}</span>.
            </p>

            <p className="mt-3 text-slate-700 leading-relaxed">
              <span className="font-semibold">Note:</span> Although Antigua Boats is a member of the{" "}
              <a
                href="https://www.paceshuttles.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline"
              >
                Pace Shuttles
              </a>{" "}
              network, you will not necessarily receive your ride from Antigua Boats. Vessels from
              all participating operators are available to the{" "}
              <span className="font-semibold">{vehicleType}</span> selection process, and are
              allocated 24 hours prior to the journey taking place.
            </p>
          </div>

          <div className="shrink-0">
            <a href="https://www.paceshuttles.com" target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/paceshuttles-logo.jpeg"
                alt="Pace Shuttles"
                className="h-16 w-auto rounded-xl border bg-white p-2 hover:opacity-90"
              />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
