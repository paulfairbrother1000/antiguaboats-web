"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Slot = "FD" | "AM" | "PM" | "SS";

const SLOT_LABEL: Record<Slot, string> = {
  FD: "Full Day Charter",
  AM: "½ Day (Morning)",
  PM: "½ Day (Afternoon)",
  SS: "Sunset Cruise",
};

const SLOT_SHORT: Record<Slot, string> = { FD: "FD", AM: "AM", PM: "PM", SS: "SS" };

function isoDate(d: Date) {
  // Use noon local time for stable YYYY-MM-DD keys across timezones
  const localNoon = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  return localNoon.toISOString().slice(0, 10);
}

function makeDate(y: number, m: number, day: number) {
  // noon local time avoids DST/timezone edge cases when using toISOString
  return new Date(y, m, day, 12, 0, 0);
}

function startOfMonth(d: Date) {
  return makeDate(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return makeDate(d.getFullYear(), d.getMonth() + 1, 0);
}

// Monday-first: Mon=0 ... Sun=6
function weekdayIndexMonFirst(d: Date) {
  const js = d.getDay(); // Sun=0 ... Sat=6
  return (js + 6) % 7; // Mon=0 ... Sun=6
}

function addDays(d: Date, n: number) {
  return makeDate(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function sameDay(a?: Date, b?: Date) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

type DayAvail = {
  date: string; // YYYY-MM-DD
  booked: Slot[];
  available: Slot[];
  sold_out: boolean;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function BookingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<Slot | undefined>(undefined);
  const [guests, setGuests] = useState<number>(6);
  const [nobu, setNobu] = useState<boolean>(false);

  // Month state (display month)
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()));

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
    const m = startOfMonth(month);
    // Keep your UTC range fetch (fine) but keys will match because isoDate normalises to YYYY-MM-DD
    const from = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), 1));
    const to = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0));
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

  // Build calendar grid (always 7 columns, Monday-first, includes outside days)
  const calendarDays = useMemo(() => {
    const mStart = startOfMonth(month);
    const mEnd = endOfMonth(month);

    const gridStart = addDays(mStart, -weekdayIndexMonFirst(mStart));
    const gridEnd = addDays(mEnd, 6 - weekdayIndexMonFirst(mEnd));

    const days: { date: Date; inMonth: boolean }[] = [];
    for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
      days.push({ date: d, inMonth: d.getMonth() === month.getMonth() });
    }
    return days;
  }, [month]);

  const monthLabel = useMemo(() => {
    return month.toLocaleString("en-GB", { month: "long", year: "numeric" });
  }, [month]);

  return (
    <main className="bg-white text-slate-900">
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
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Book Charter</h1>
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

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
                {/* Month header */}
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="text-3xl font-semibold tracking-tight">{monthLabel}</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMonth((m) => startOfMonth(makeDate(m.getFullYear(), m.getMonth() - 1, 1)))}
                      className="rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
                      aria-label="Previous month"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => setMonth((m) => startOfMonth(makeDate(m.getFullYear(), m.getMonth() + 1, 1)))}
                      className="rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Weekday header */}
                <div className="grid grid-cols-7 gap-2 px-1 pb-2">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-slate-500">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-2 px-1">
                  {calendarDays.map(({ date, inMonth }) => {
                    const cls = dayClass(date);
                    const isUnavailable = cls === "unavailable";
                    const isSelected = sameDay(date, selectedDate);
                    const outside = !inMonth;

                    const bg =
                      cls === "unavailable"
                        ? "bg-slate-900 text-white border-slate-900"
                        : cls === "partial"
                          ? "bg-slate-400 text-white border-slate-400"
                          : "bg-white text-slate-900 border-slate-200";

                    const outsideText = outside ? "text-slate-300" : "";
                    const ring = isSelected ? "ring-2 ring-slate-900 ring-offset-2" : "";

                    return (
                      <button
                        key={isoDate(date)}
                        type="button"
                        disabled={isUnavailable}
                        onClick={() => {
                          if (isUnavailable) return;
                          setSelectedDate(date);
                        }}
                        className={[
                          "h-12 w-12 rounded-xl border text-sm font-semibold transition",
                          bg,
                          outside ? "opacity-70" : "",
                          outsideText,
                          isUnavailable ? "cursor-not-allowed opacity-80" : "hover:opacity-95",
                          ring,
                        ].join(" ")}
                        aria-label={isoDate(date)}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
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
                            selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white",
                            enabled ? "hover:bg-slate-50" : "opacity-40 cursor-not-allowed",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-semibold">{SLOT_LABEL[slot]}</div>
                            <div className="text-xs font-bold sm:hidden">{SLOT_SHORT[slot]}</div>
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
                    <div className="text-sm text-slate-600">Includes up to 6. Guests 7–8: +$100 each.</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-sm font-semibold">Options</div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">Nobu trip</div>
                      <div className="text-sm text-slate-600">$250 fuel surcharge</div>
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
                    <div className="mt-2 text-xs text-slate-500">Available on Full Day Charter only.</div>
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
                  <span className="font-semibold">{selectedSlot ? SLOT_SHORT[selectedSlot] : "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-600">Guests</span>
                  <span className="font-semibold">{guests}</span>
                </div>
              </div>

              <div className="my-4 border-t border-slate-200" />

              {loadingQuote && <div className="text-sm text-slate-500">Calculating…</div>}

              {quote && (
                <div className="space-y-2">
                  {quote.breakdown.map((b, i) => (
                    <div key={i} className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-700">{b.label}</span>
                      <span className="font-semibold">${(b.amount_cents / 100).toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="my-3 border-t border-slate-200" />
                  <div className="flex justify-between gap-3">
                    <span className="text-base font-semibold">Total</span>
                    <span className="text-base font-semibold">${(quote.total_amount_cents / 100).toFixed(0)}</span>
                  </div>
                </div>
              )}

              {!quote && !loadingQuote && (
                <div className="text-sm text-slate-500">Select a charter type to see the total.</div>
              )}

              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep(2)}
                className={[
                  "mt-6 w-full rounded-2xl px-5 py-3 text-base font-semibold transition",
                  canContinue ? "bg-slate-900 text-white hover:opacity-95" : "bg-slate-200 text-slate-500",
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
            <p className="mt-2 text-slate-600">Add any questions or useful context (occasion, timings, preferences, etc).</p>
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
            <p className="mt-2 text-slate-600">Next we’ll collect lead passenger details and take payment (Stripe).</p>
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
