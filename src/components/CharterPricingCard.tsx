import Link from "next/link";

export function CharterPricingCard(props: {
  title: string;
  priceUSD: number;
  bullets: string[];
  charterSlug: string;
}) {
  const { title, priceUSD, bullets, charterSlug } = props;

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <div className="text-right">
          <div className="text-xs text-slate-500">Starting from</div>
          <div className="text-2xl font-bold text-slate-900">${priceUSD.toLocaleString()}</div>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {bullets.map(b => (
          <li key={b} className="flex gap-2">
            <span className="text-sky-600">✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 grid grid-cols-1 gap-2">
        <Link
          href={`/availability?charter=${encodeURIComponent(charterSlug)}`}
          className="rounded-xl bg-sky-600 text-white text-center py-2.5 font-medium hover:bg-sky-700"
        >
          Check Availability
        </Link>
      </div>
    </div>
  );
}
