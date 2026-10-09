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
          <h2 className="text-lg font-semibold">Pay-per-seat charters</h2>
          <p className="mt-1">The seat price, minimum seats and maximum surcharge per seat are shown before booking and recorded with your acceptance. Every booking must accept the surcharge commitment. If the minimum is not met 24 hours before departure, Antigua Boats contributes towards the shortfall and the remainder is shared across booked seats within the agreed cap. If the trip cannot run, the booking is cancelled with a full refund. Promotional prices apply only to new bookings after the minimum has been met and within the promotion window. Existing bookings retain their agreed price.</p>
          <p className="mt-2">Payments, surcharges and refunds currently use the site’s mock flow. No real card charges or refunds are processed.</p>
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
