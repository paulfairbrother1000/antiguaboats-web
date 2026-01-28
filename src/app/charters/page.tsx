import CharterTiles from "@/components/CharterTiles";

export default function ChartersPage() {
  return (
    <main className="py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="text-4xl font-extrabold text-slate-900">Charters</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Choose the vibe — full day adventures, quick island escapes, golden hour sunsets, or a
          restaurant shuttle with a serious arrival.
        </p>
      </div>

      <CharterTiles showViewAll={false} />
    </main>
  );
}
