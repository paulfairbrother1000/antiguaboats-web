import Link from "next/link";
import PaceShuttleTiles from "@/components/PaceShuttleTiles";

export const dynamic = "force-dynamic";

type ShuttleTile = {
  country?: string;
  vehicle_type?: string;
};

type ShuttleRoutesResponse = {
  tiles?: ShuttleTile[];
};

function deriveMeta(data: ShuttleRoutesResponse | null | undefined) {
  const first = data?.tiles?.[0];

  const country = first?.country?.trim() || "Antigua and Barbuda";
  const vehicleType = first?.vehicle_type?.trim() || "Speed Boat";

  return { country, vehicleType };
}

export default async function RestaurantShuttlePage() {
  let metaData: ShuttleRoutesResponse | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/shuttle-routes`,
      { cache: "no-store" }
    );

    if (res.ok) {
      metaData = (await res.json()) as ShuttleRoutesResponse;
    }
  } catch {
    // Silent fallback to defaults
  }

  const { country, vehicleType } = deriveMeta(metaData);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-500">Charters</div>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-900">
            Restaurant Shuttle
          </h1>
          <p className="mt-2 text-slate-600">
            Arrive by sea for lunch at Nobu, Catherine’s Café and more.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/charters"
            className="rounded-2xl border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Back to Charters
          </Link>
          <Link
            href="/availability?charter=shuttle"
            className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Check Availability
          </Link>
        </div>
      </div>

      {/* 1) How it works */}
      <section className="mt-10 rounded-3xl border bg-white p-7">
        <h2 className="text-xl font-extrabold text-slate-900">How it works</h2>

        <div className="mt-4 space-y-3 text-slate-700 leading-relaxed">
          <p>
            Antigua Boats is a proud partner of the Pace Shuttle scheme.
          </p>

          <p>
            Pace Shuttles is an organisation which allows local{" "}
            <span className="font-semibold">{vehicleType}</span> operators in{" "}
            <span className="font-semibold">{country}</span> to provide luxury{" "}
            <span className="font-semibold">{vehicleType}</span> shuttle journeys to stunning
            destinations at accessible prices on a per-seat charging basis.
          </p>

          <p>
            Journeys are selected on the Pace Shuttle portal which identifies and manages the
            appropriate operators, seat allocation, pricing and payment.
          </p>
        </div>
      </section>

      {/* 2) PaceShuttles API tiles */}
      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Available shuttle routes
            </h2>
            <p className="mt-1 text-slate-600">
              Live seats and lowest available prices.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <PaceShuttleTiles />
        </div>
      </section>

      {/* 3) Good to know */}
      <section className="mt-10 rounded-3xl border bg-white p-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-slate-900">Good to know</h2>

            <p className="mt-3 text-slate-700 leading-relaxed">
              Visit{" "}
              <span className="font-semibold">www.paceshuttles.com</span> to book your{" "}
              <span className="font-semibold">{vehicleType}</span> shuttle in{" "}
              <span className="font-semibold">{country}</span>.
            </p>

            <p className="mt-3 text-slate-700 leading-relaxed">
              <span className="font-semibold">Note:</span> Although Antigua Boats is a member of the
              Pace Shuttle network, you will not necessarily receive your ride from Antigua Boats.
              Vessels from all participating operators are available to the Pace Shuttle{" "}
              <span className="font-semibold">{vehicleType}</span> selection process, and are
              allocated 24 hours prior to the journey taking place.
            </p>
          </div>

          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/paceshuttles-logo.jpeg"
              alt="Pace Shuttles"
              className="h-16 w-auto rounded-xl border bg-white p-2"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
