"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DayPicker } from "react-day-picker";
// IMPORTANT: do NOT import the default RDP stylesheet (it keeps fighting our layout)
// import "react-day-picker/dist/style.css";

type Slot = "FD" | "AM" | "PM" | "SS";

const SLOT_LABEL: Record<Slot, string> = {
  FD: "Full Day Charter",
  AM: "½ Day (Morning)",
  PM: "½ Day (Afternoon)",
  SS: "Sunset Cruise",
};

/**
 * Display prices (UI only).
 * Your /api/quote is still the source of truth for totals.
 */
const SLOT_PRICE_CENTS: Record<Slot, number> = {
  FD: 2200 * 100,
  AM: 1400 * 100,
  PM: 1400 * 100,
  SS: 800 * 100,
};

const EXTRA_GUEST_CENTS = 100 * 100; // guests 7–8
const NOBU_FUEL_CENTS = 250 * 100;

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function money(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

type DayAvail = {
  date: string; // YYYY-MM-DD
  booked: Slot[];
  available: Slot[];
  sold_out: boolean;
};

export default function BookingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<Slot | undefined>(undefined);
  const [guests, setGuests] = useState<number>(6);
  const [nobu, setNobu] = useState<boolean>(false);

  // Step 2 state
  const [comments, setComments] = useState<string>("");

  // Calendar month state (Monday start)
  const [month, setMonth] = useState<Date>(new Date());

  const [availability, setAvailability] = useState<DayAvail[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(false);

  const [quote, setQuote] = useState<null | {
    currency: string;
    breakdown: { label: string; amount_cents: number }[];
    total_amount_cents: number;
  }>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  // Fetch availability for visible month
  useEffect(() => {
    const from = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
    const to = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0));
    const fromStr = isoDate(from);
    const toStr = isoDate(to);

    setLoadingAvail(true);
    fetch(`/api/availability?from=${fromStr}&to=${toStr}`)
      .then((r) => r.json())
      .then((data) => setAvailability(Array.isArray(data) ? data : []))
      .finally(() => setLoadingAvail(false));
  }, [month]);

  const availByDate = useMemo(() => {
    const m = new Map<string, DayAvail>();
    for (const d of availability) m.set(d.date, d);
    return m;
  }, [availability]);

  const selectedDayAvail = useMemo(() => {
    if (!selectedDate) return null;
    return availByDate.get(isoDate(selectedDate)) ?? null;
  }, [selectedDate, availByDate]);

  // Helper: classify a day based on how many slots remain
  const dayClass = (date: Date) => {
    const day = availByDate.get(isoDate(date));
    if (!day) return "unknown";
    const count = day.available?.length ?? 0;
    if (count === 0) return "unavailable";
    if (count === 4) return "available";
    return "partial";
  };

  // Unavailable days are unclickable (disabled)
  const disabledDays = useMemo(() => {
    return (date: Date) => {
      const day = availByDate.get(isoDate(date));
      if (!day) return false;
      return (day.available?.length ?? 0) === 0;
    };
  }, [availByDate]);

  // When date changes, if slot no longer valid, clear it
  useEffect(() => {
    if (!selectedDate) return;
    const day = availByDate.get(isoDate(selectedDate));
    if (!day) return;

    if (selectedSlot && !day.available.includes(selectedSlot)) {
      setSelectedSlot(undefined);
      setNobu(false);
    }
  }, [selectedDate, availByDate, selectedSlot]);

  // Quote whenever slot/guests/nobu changes (and slot is selected)
  useEffect(() => {
    if (!selectedSlot) {
      setQuote(null);
      return;
    }
    if (nobu && selectedSlot !== "FD") setNobu(false);

    setLoadingQuote(true);
    fetch(`/api/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slot_mode: selectedSlot,
        guests,
        nobu: selectedSlot === "FD" ? nobu : false,
      }),
    })
      .then((r) => r.json())
      .then((data) => setQuote(data?.total_amount_cents ? data : null))
      .finally(() => setLoadingQuote(false));
  }, [selectedSlot, guests, nobu]);

  const canContinue =
    !!selectedDate && !!selectedSlot && !!selectedDayAvail?.available.includes(selectedSlot);

  const selectedAvailText = useMemo(() => {
    if (!selectedDate) return "";
    const day = selectedDayAvail;
    if (!day) return "";
    if ((day.available?.length ?? 0) === 0) return "Sold out";
    return (day.available ?? []).map((s) => SLOT_LABEL[s]).join(" • ");
  }, [selectedDate, selectedDayAvail]);

  // ---- Price summary (UI) ----
  const basePriceCents = selectedSlot ? SLOT_PRICE_CENTS[selectedSlot] : null;
  const extraGuestsCount = Math.max(0, guests - 6);
  const extraGuestsCents = extraGuestsCount * EXTRA_GUEST_CENTS;
  const nobuCents = selectedSlot === "FD" && nobu ? NOBU_FUEL_CENTS : 0;
  const extrasCents = extraGuestsCents + nobuCents;

  // Prefer API quote total if present, else fall back to local calc
  const totalCents =
    quote?.total_amount_cents ??
    (basePriceCents !== null ? basePriceCents + extrasCents : null);

  return (
    <main className="bg-white text-slate-900">
      {/* HARD RESET + CUSTOM RDP LAYOUT (fixes the “stacked pills” + merged weekday names) */}
      <style jsx global>{`
        /* Only affect this page's calendar instance */
        .ab-rdp .rdp {
          --ab-gap: 10px;
          width: 100%;
        }

        .ab-rdp .rdp-months,
        .ab-rdp .rdp-month {
          width: 100%;
        }

        .ab-rdp .rdp-caption {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 6px 10px 6px;
        }

        .ab-rdp .rdp-caption_label {
          font-weight: 700;
          font-size: 18px;
          color: #0f172a; /* slate-900 */
        }

        .ab-rdp .rdp-nav {
          display: flex;
          gap: 10px;
        }

        .ab-rdp .rdp-nav_button {
          border: 1px solid #e2e8f0; /* slate-200 */
          border-radius: 14px;
          padding: 10px 12px;
          background: #fff;
        }
        .ab-rdp .rdp-nav_button:hover {
          background: #f8fafc; /* slate-50 */
        }

        /* The critical part: force a real table grid with fixed columns */
        .ab-rdp .rdp-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: separate;
          border-spacing: var(--ab-gap);
        }

        .ab-rdp .rdp-head_cell {
          text-align: center;
          font-size: 12px;
          font-weight: 700;
          color: #64748b; /* slate-500 */
          padding: 0;
          height: 26px;
          width: calc((100% - (6 * var(--ab-gap))) / 7);
        }

        .ab-rdp .rdp-cell {
          padding: 0;
          width: calc((100% - (6 * var(--ab-gap))) / 7);
        }

        /* Day button fills the cell */
        .ab-rdp .rdp-day {
          width: 100%;
          height: 54px;
          border-radius: 18px;
          border: 1px solid #e2e8f0; /* slate-200 */
          background: #ffffff;
          font-weight: 700;
          color: #0f172a; /* slate-900 */
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
        }

        .ab-rdp .rdp-day:hover {
          background: #f8fafc; /* slate-50 */
        }

        .ab-rdp .rdp-day_outside {
          color: #cbd5e1; /* slate-300 */
        }

        .ab-rdp .rdp-day_disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Selected overrides */
        .ab-rdp .rdp-day_selected {
          background: #0f172a; /* slate-900 */
          border-color: #0f172a;
          color: #ffffff;
        }

        /* Today ring */
        .ab-rdp .rdp-day_today {
          box-shadow: 0 0 0 2px #cbd5e1 inset; /* slate-300 */
        }
      `}</style>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="relative h-[32vh] overflow-hidden rounded-[28px] md:h-[36vh]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(/booking-hero.jpg)` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/15 to-black/10" />
          <div className="relative flex h-full items-end px-6 pb-6 sm:px-10">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Book Charter
            </h1>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <StepPill active={step === 1}>Step 1</StepPill>
          <span>→</span>
          <StepPill active={step === 2}>Step 2</StepPill>
          <span>→</span>
          <StepPill active={step === 3}>Step 3</StepPill>
        </div>

        {step === 1 && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Calendar + Step 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Step 1 — select charter type and date</h2>
                  <p className="text-sm text-slate-600">
                    Black = unavailable • Grey = partly available • White = fully available
                  </p>
                </div>
                {loadingAvail && <span className="text-sm text-slate-500">Loading…</span>}
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 ab-rdp">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={month}
                  onMonthChange={setMonth}
                  weekStartsOn={1}
                  disabled={disabledDays}
                  showOutsideDays
                  modifiers={{
                    unavailable: (date) => dayClass(date) === "unavailable",
                    partial: (date) => dayClass(date) === "partial",
                    available: (date) => dayClass(date) === "available",
                  }}
                  modifiersClassNames={{
                    // Availability colour (applied to the day button)
                    unavailable: "bg-slate-900 text-white border-slate-900",
                    partial: "bg-slate-200 text-slate-900 border-slate-200",
                    available: "bg-white text-slate-900 border-slate-200",
                    selected: "bg-slate-900 text-white border-slate-900",
                  }}
                />
              </div>

              {/* Selected day availability summary */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">Selected date</div>
                <div className="mt-1 text-sm text-slate-700">
                  {selectedDate ? (
                    <>
                      <span className="font-semibold">{isoDate(selectedDate)}</span>
                      <span className="mx-2 text-slate-300">•</span>
                      <span>{selectedAvailText || "—"}</span>
                    </>
                  ) : (
                    <span className="text-slate-500">Select a date on the calendar.</span>
                  )}
                </div>
              </div>

              {/* Charter chooser (only after date selected) */}
              <div className="mt-6">
                <h3 className="mb-2 text-base font-semibold">Charter type</h3>

                {!selectedDate && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                    Select a date on the calendar to see what’s available.
                  </div>
                )}

                {selectedDate && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(Object.keys(SLOT_LABEL) as Slot[]).map((slot) => {
                      const enabled = selectedDayAvail?.available?.includes(slot) ?? false;
                      const selected = selectedSlot === slot;
                      const price = SLOT_PRICE_CENTS[slot];

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            if (!enabled) return;
                            setSelectedSlot(slot);
                            if (slot !== "FD") setNobu(false);
                          }}
                          disabled={!enabled}
                          className={[
                            "rounded-2xl border p-4 text-left shadow-sm transition",
                            selected
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white",
                            enabled ? "hover:bg-slate-50" : "opacity-40 cursor-not-allowed",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-semibold">{SLOT_LABEL[slot]}</div>
                            <div className={selected ? "text-white" : "text-slate-900"}>
                              <span className="text-base font-semibold">{money(price)}</span>
                            </div>
                          </div>
                          <div className={selected ? "text-white/80" : "text-sm text-slate-600"}>
                            {enabled ? "Available on this date" : "Unavailable on this date"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Guests + Nobu */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-sm font-semibold">Guests</div>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    >
                      −
                    </button>
                    <div className="min-w-[40px] text-center text-lg font-semibold">{guests}</div>
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
                      onClick={() => setGuests((g) => Math.min(8, g + 1))}
                    >
                      +
                    </button>
                    <div className="text-sm text-slate-600">
                      Includes up to 6. Guests 7–8: +$100 each.
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-sm font-semibold">Options</div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">Nobu trip</div>
                      <div className="text-sm text-slate-600">
                        {money(NOBU_FUEL_CENTS)} fuel surcharge
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-5 w-5"
                      checked={nobu}
                      onChange={(e) => setNobu(e.target.checked)}
                      disabled={selectedSlot !== "FD"}
                      title={selectedSlot !== "FD" ? "Nobu is only available on Full Day Charter" : ""}
                    />
                  </div>
                  {selectedSlot !== "FD" && (
                    <div className="mt-2 text-xs text-slate-500">
                      Available on Full Day Charter only.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold">Cost</h3>

              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-600">Date</span>
                  <span className="font-semibold">{selectedDate ? isoDate(selectedDate) : "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-600">Charter</span>
                  <span className="font-semibold">{selectedSlot ? SLOT_LABEL[selectedSlot] : "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-600">Guests</span>
                  <span className="font-semibold">{guests}</span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-slate-600">Base price</span>
                  <span className="font-semibold">
                    {basePriceCents !== null ? money(basePriceCents) : "—"}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-slate-600">Extras</span>
                  <span className="font-semibold">{selectedSlot ? money(extrasCents) : "—"}</span>
                </div>

                {selectedSlot && (
                  <div className="text-xs text-slate-500">
                    {extraGuestsCount > 0 ? `+${extraGuestsCount} extra guest(s)` : "No extra guests"}
                    {selectedSlot === "FD" && nobu ? " • Nobu fuel surcharge" : ""}
                  </div>
                )}
              </div>

              <div className="my-4 border-t border-slate-200" />

              {loadingQuote && <div className="text-sm text-slate-500">Calculating…</div>}

              {selectedSlot && !loadingQuote && (
                <div className="flex justify-between gap-3">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-base font-semibold">
                    {totalCents !== null ? money(totalCents) : "—"}
                  </span>
                </div>
              )}

              {!selectedSlot && !loadingQuote && (
                <div className="text-sm text-slate-500">Select a charter type to see the total.</div>
              )}

              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep(2)}
                className={[
                  "mt-6 w-full rounded-2xl px-5 py-3 text-base font-semibold transition",
                  canContinue
                    ? "bg-slate-900 text-white hover:opacity-95"
                    : "bg-slate-200 text-slate-500",
                ].join(" ")}
              >
                Continue
              </button>

              <div className="mt-4 text-sm text-slate-600">
                Need clarity?{" "}
                <Link href="/contact" className="font-semibold underline underline-offset-2">
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Step 2 — tell us more</h2>
            <p className="mt-2 text-slate-600">
              Add any questions or useful context (occasion, timings, preferences, etc).
            </p>

            <div className="mt-6">
              <label className="text-sm font-semibold text-slate-900">Comments</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={5}
                placeholder="e.g. celebrating a birthday, preferred departure time, music, food, itinerary…"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              />
              <div className="mt-2 text-xs text-slate-500">We’ll save this with your booking request.</div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white hover:opacity-95"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Step 3 — make payment</h2>
            <p className="mt-2 text-slate-600">
              Next we’ll collect lead passenger details and take payment (Stripe).
            </p>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">What we’ll submit</div>
              <div className="mt-2 space-y-1">
                <div>
                  <span className="text-slate-600">Date:</span>{" "}
                  <span className="font-semibold">{selectedDate ? isoDate(selectedDate) : "—"}</span>
                </div>
                <div>
                  <span className="text-slate-600">Charter:</span>{" "}
                  <span className="font-semibold">{selectedSlot ? SLOT_LABEL[selectedSlot] : "—"}</span>
                </div>
                <div>
                  <span className="text-slate-600">Guests:</span>{" "}
                  <span className="font-semibold">{guests}</span>
                </div>
                <div>
                  <span className="text-slate-600">Comments:</span>{" "}
                  <span className="font-semibold">{comments?.trim() ? "Included" : "—"}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white hover:opacity-95"
              >
                Pay now (mock)
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function StepPill({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-xs font-semibold",
        active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
