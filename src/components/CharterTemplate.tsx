import Link from "next/link";

type CharterTemplateProps = {
  title: string;
  subtitle: string;
  body: string[]; // paragraphs
  folder: string; // e.g. "/charters/fullday"
  youtubeUrl?: string; // full youtube url or youtu.be link

  // Optional structured header lines (preferred)
  priceUSD?: number | null;
  hoursLine?: string;
  tagline?: string;
};

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

export default function CharterTemplate({
  title,
  subtitle,
  body,
  folder,
  youtubeUrl,
  priceUSD = null,
  hoursLine,
  tagline,
}: CharterTemplateProps) {
  const embed = getYouTubeEmbedUrl(youtubeUrl);

  // Standardised image paths
  const hero = `${folder}/hero.jpg`;
  const imgs = [1, 2, 3, 4].map((n) => `${folder}/img${n}.jpg`);

  const showStructuredHeader = Boolean(hoursLine || tagline || priceUSD !== null);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-500">Charters</div>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-900">{title}</h1>
        </div>

        <Link
          href="/charters"
          className="rounded-2xl border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Back to Charters
        </Link>
      </div>

      {/* Hero */}
      <section className="mt-8 overflow-hidden rounded-3xl border bg-slate-100">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero}
            alt={title}
            className="h-[320px] w-full object-cover md:h-[420px]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/35" />

          {/* Title + subtitle on hero */}
          <div className="absolute inset-0 flex items-end">
            <div className="p-6 md:p-10">
              <div className="text-3xl font-black tracking-tight text-white md:text-5xl">
                {title}
              </div>

              {showStructuredHeader ? (
                <div className="mt-3 space-y-1 text-white/90 md:text-lg">
                  {priceUSD !== null ? (
                    <div className="font-semibold">
                      ${Number(priceUSD).toLocaleString()}
                    </div>
                  ) : null}
                  {hoursLine ? <div>{hoursLine}</div> : null}
                  {tagline ? <div>{tagline}</div> : null}
                </div>
              ) : (
                <div className="mt-2 text-white/90 md:text-lg">{subtitle}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mt-10 rounded-3xl border bg-white p-7">
        <div className="space-y-4 text-slate-700 leading-relaxed">
          {body.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </section>

      {/* 2x2 Image Grid */}
      <section className="mt-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {imgs.map((src, idx) => (
            <div key={src} className="overflow-hidden rounded-3xl border bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${title} image ${idx + 1}`}
                className="h-56 w-full object-cover md:h-72"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* YouTube */}
      {embed && (
        <section className="mt-10 overflow-hidden rounded-3xl border bg-black">
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <iframe
              className="absolute inset-0 h-full w-full"
              src={embed}
              title={`${title} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* Footer buttons (below YouTube) */}
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/booking"
          className="inline-flex items-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Make booking
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Contact us
        </Link>
      </div>
    </main>
  );
}
