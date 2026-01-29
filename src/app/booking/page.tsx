"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DayPicker, type DayProps } from "react-day-picker";

import "react-day-picker/dist/style.css";

type Slot = "FD" | "AM" | "PM" | "SS";

const SLOT_LABEL: Record<Slot, string> = {
  FD: "Full Day Charter",
  AM: "½ Day (Morning)",
  PM: "½ Day (Afternoon)",
  SS: "Sunset Cruise",
};

const SLOT_SHORT: Record<Slot, string> = { FD: "FD", AM: "AM", PM: "PM", SS: "SS" };

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
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

  // Calendar month state (Monday start is default in many locales; we’ll enforce en-GB-ish behaviour via weekStartsOn=1)
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

  // Determine which days are selectable given current charter selection (charter-first flow)
  const disabledDays = useMemo(() => {
    if (!selectedSlot) {
      // Only disable fully sold-out days (still allow clicking days where some slots exist)
      return (date: Date) => {
        const key = isoDate(date);
        const day = availByDate.get(key);
        return day ? day.sold_out : false;
      };
    }
    // If slot selected, disable days where that slot isn’t available
    return (date: Date) => {
      const key = isoDate(date);
      const day = availByDate.get(key);
      if (!day) return false; // if not in range (other month days), allow; calendar will handle
      return !day.available.includes(selectedSlot);
    };
  }, [availByDate, selectedSlot]);

  // When date changes, if current selectedSlot is not available, clear it (date-first flow)
  useEffect(() => {
    if (!selectedDate) return;
    const key = isoDate(selectedDate);
    const day = availByDate.get(key);
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
      body: JSON.stringify({ slot_mode: selectedSlot, guests, nobu: selectedSlot === "FD" ? nobu : false }),
    })
      .then((r) => r.json())
      .then((data) => setQuote(data?.total_amount_cents ? data : null))
      .finally(() => setLoadingQuote(false));
  }, [selectedSlot, guests, nobu]);

  const selectedDayAvail = useMemo(() => {
    if (!selectedDate) return null;
    return availByDate.get(isoDate(selectedDate)) ?? null;
  }, [selectedDate, availByDate]);

  const canContinue =
    !!selectedDate && !!selectedSlot && !!selectedDayAvail?.available.includes(selectedSlot);

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
            {/* Calendar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Step 1 — select charter type and date</h2>
                  <p className="text-sm text-slate-600">
                    Days show what’s available: FD / AM / PM / SS.
                  </p>
                </div>
                {loadingAvail && <span className="text-sm text-slate-500">Loading…</span>}
              </div>

              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={month}
                onMonthChange={setMonth}
                weekStartsOn={1} // Monday
                disabled={disabledDays}
                components={{
  Day: (props: DayProps) => {
    const dayKey = isoDate(props.date);
    const day = availByDate.get(dayKey);
    const chips = day?.available ?? [];

    // react-day-picker passes button props for accessibility/selection
    return (
      <button
        {...props.buttonProps}
        className={[
          "h-full w-full rounded-xl p-1 transition",
          props.activeModifiers?.selected ? "bg-slate-900 text-white" : "hover:bg-slate-50",
          props.activeModifiers?.disabled ? "opacity-40 hover:bg-transparent" : "",
        ].join(" ")}
      >
        <div className="flex w-full flex-col items-center justify-center gap-1">
          <div className="text-sm">{props.date.getDate()}</div>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {(Object.keys(SLOT_SHORT) as Slot[]).map((slot) => {
              const available = chips.includes(slot);
              return (
                <span
                  key={slot}
                  className={[
                    "rounded px-1 py-0.5 text-[10px] font-semibold",
                    available
                      ? props.activeModifiers?.selected
                        ? "bg-white/90 text-slate-900"
                        : "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-400",
                  ].join(" ")}
                >
                  {SLOT_SHORT[slot]}
                </span>
              );
            })}
          </div>
        </div>
      </button>
    );
  },
}}

              />

              {/* Charter chooser */}
              <div className="mt-6">
                <h3 className="mb-2 text-base font-semibold">Charter type</h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.keys(SLOT_LABEL) as Slot[]).map((slot) => {
                    const dayAvail = selectedDayAvail?.available ?? null;
                    const enabled = !dayAvail || dayAvail.includes(slot); // if no date selected, allow selecting slot (charter-first mode)
                    const selected = selectedSlot === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot);
                          if (slot !== "FD") setNobu(false);
                        }}
                        disabled={!enabled}
                        className={[
                          "rounded-2xl border p-4 text-left shadow-sm transition",
                          selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white",
                          enabled ? "hover:bg-slate-50" : "opacity-40",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold">{SLOT_LABEL[slot]}</div>
                          <div className="text-xs font-bold sm:hidden">{SLOT_SHORT[slot]}</div>
                        </div>
                        <div className={selected ? "text-white/80" : "text-sm text-slate-600"}>
                          {slot === "FD" && "A full day adventure around Antigua"}
                          {slot === "AM" && "Morning slot"}
                          {slot === "PM" && "Afternoon slot"}
                          {slot === "SS" && "Golden hour cruise"}
                        </div>
                      </button>
                    );
                  })}
                </div>
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
                  <span className="font-semibold">
                    {selectedDate ? isoDate(selectedDate) : "—"}
                  </span>
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
                      <span className="font-semibold">
                        ${ (b.amount_cents / 100).toFixed(0) }
                      </span>
                    </div>
                  ))}
                  <div className="my-3 border-t border-slate-200" />
                  <div className="flex justify-between gap-3">
                    <span className="text-base font-semibold">Total</span>
                    <span className="text-base font-semibold">
                      ${ (quote.total_amount_cents / 100).toFixed(0) }
                    </span>
                  </div>
                </div>
              )}

              {!quote && !loadingQuote && (
                <div className="text-sm text-slate-500">
                  Select a charter type to see the total.
                </div>
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
            <p className="mt-2 text-slate-600">
              Add any questions or useful context (occasion, timings, preferences, etc).
            </p>
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
