export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Terms &amp; Conditions (Mock)</h1>
      <p className="mt-3 text-slate-600">
        This is a placeholder page for now.
      </p>

      <div className="mt-8 space-y-4 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold">1. Booking & payment</h2>
          <p className="mt-1">
            Bookings are confirmed on payment. Prices shown are in USD unless stated otherwise.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Cancellations</h2>
          <p className="mt-1">
            Cancellation terms will be defined here (mock).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Weather & safety</h2>
          <p className="mt-1">
            Charters may be rescheduled due to safety or weather conditions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Contact</h2>
          <p className="mt-1">
            Contact us for any questions (mock).
          </p>
        </section>
      </div>
    </main>
  );
}
