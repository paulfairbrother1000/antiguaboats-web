// src/app/contact/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";

type Reason =
  | "Charter enquiry"
  | "Custom charter enquiry"
  | "Restaurant shuttle enquiry"
  | "Partnership / concierge"
  | "General question"
  | "Support / existing booking";

type CountryOption = {
  name: string;
  iso2: string;
  dial: string; // used to prefix mobile number
};

/**
 * Keep this list short + editable. Add more as needed.
 * dial codes are intentionally simple (no formatting beyond +XX).
 */
const COUNTRIES: CountryOption[] = [
  { name: "Antigua & Barbuda", iso2: "AG", dial: "+1" },
  { name: "United Kingdom", iso2: "GB", dial: "+44" },
  { name: "United States", iso2: "US", dial: "+1" },
  { name: "Canada", iso2: "CA", dial: "+1" },
  { name: "France", iso2: "FR", dial: "+33" },
  { name: "Germany", iso2: "DE", dial: "+49" },
  { name: "Netherlands", iso2: "NL", dial: "+31" },
  { name: "Spain", iso2: "ES", dial: "+34" },
];

const REASONS: Reason[] = [
  "Charter enquiry",
  "Custom charter enquiry",
  "Restaurant shuttle enquiry",
  "Partnership / concierge",
  "General question",
  "Support / existing booking",
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryIso2, setCountryIso2] = useState<CountryOption["iso2"]>("GB");
  const [mobileLocal, setMobileLocal] = useState("");
  const [reason, setReason] = useState<Reason>("Charter enquiry");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCountry = useMemo(() => {
    return COUNTRIES.find((c) => c.iso2 === countryIso2) ?? COUNTRIES[0];
  }, [countryIso2]);

  const mobileE164 = useMemo(() => {
    const digits = mobileLocal.replace(/[^\d]/g, "");
    if (!digits) return "";
    return `${selectedCountry.dial}${
      digits.startsWith("0") ? digits.slice(1) : digits
    }`;
  }, [mobileLocal, selectedCountry.dial]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitted(false);

    const f = firstName.trim();
    const l = lastName.trim();
    const em = email.trim();
    const msg = message.trim();
    const phoneDigits = mobileLocal.replace(/[^\d]/g, "");

    if (!f || !l) return setError("Please enter your first name and last name.");
    if (!em || !isValidEmail(em)) return setError("Please enter a valid email address.");
    if (!phoneDigits) return setError("Please enter your mobile number.");
    if (!msg) return setError("Please add a short message so we can help.");

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: f,
          lastName: l,
          email: em,
          countryIso2,
          countryDial: selectedCountry.dial,
          mobileLocal,
          mobileE164,
          reason,
          message: msg,
          pagePath: "/contact",
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Failed to send message.");
      }

      setSubmitted(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setCountryIso2("GB");
      setMobileLocal("");
      setReason("Charter enquiry");
      setMessage("");
    } catch (err: any) {
      setError(err?.message || "Something went wrong sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative h-[42vh] min-h-[320px] w-full overflow-hidden">
        {/* Swap this image to whatever hero you prefer */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/contact-hero.jpg)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/45" aria-hidden />

        <div className="relative mx-auto flex h-full max-w-6xl items-end px-4 pb-10 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur">
              <MessageCircle className="h-4 w-4" />
              We usually reply quickly
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Contact us
            </h1>
            <p className="mt-3 text-base text-white/90 sm:text-lg">
              Tell us what you’re planning and we’ll help you build the perfect day on the water.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* LEFT: INFO + SOCIAL */}
          <aside className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Get in touch</h2>
              <p className="mt-2 text-sm text-slate-600">
                For charters, restaurant shuttles, or custom itineraries—drop us a message and
                we’ll come back with options, timings, and pricing.
              </p>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3 text-slate-700">
                  <Phone className="h-4 w-4" />
                  <span>
                    Mobile / WhatsApp:{" "}
                    <span className="font-medium">Coming soon</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail className="h-4 w-4" />
                  <span>
                    Email:{" "}
                    <span className="font-medium">hello@antigua-boats.com</span>
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-semibold text-slate-900">Follow us</h3>
                <p className="mt-1 text-sm text-slate-600">
                  See recent trips, highlights, and availability updates.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="https://www.facebook.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </a>

                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>

                  <a
                    href="https://www.youtube.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </a>

                  {/* No official TikTok icon in lucide-react in many versions; use a simple text badge */}
                  <a
                    href="https://www.tiktok.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                    aria-label="TikTok"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-slate-900 text-[10px] font-bold leading-none text-white">
                      t
                    </span>
                    TikTok
                  </a>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  (Update these links to your real profiles when ready.)
                </p>
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-500">
              Prefer? You can also browse our{" "}
              <Link className="underline hover:text-slate-700" href="/charters">
                charters
              </Link>{" "}
              and message us with the date + headcount.
            </div>
          </aside>

          {/* RIGHT: FORM */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Send a message</h2>
              <p className="mt-2 text-sm text-slate-600">
                Fill in the details below and we’ll get back to you.
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-5">
                {/* Row 1 */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      First name
                    </label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                      placeholder="Paul"
                      autoComplete="given-name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Last name
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                      placeholder="Fairbrother"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Email
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                      placeholder="you@example.com"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Country
                    </label>
                    <select
                      value={countryIso2}
                      onChange={(e) => setCountryIso2(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-slate-500"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.iso2} value={c.iso2}>
                          {c.name} ({c.dial})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Mobile
                    </label>
                    <div className="mt-1 flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-slate-500">
                      <div className="flex items-center bg-slate-50 px-3 text-sm text-slate-700">
                        {selectedCountry.dial}
                      </div>
                      <input
                        value={mobileLocal}
                        onChange={(e) => setMobileLocal(e.target.value)}
                        className="w-full px-4 py-2 text-sm outline-none"
                        placeholder="e.g. 07911 123456"
                        inputMode="tel"
                        autoComplete="tel"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      We’ll use your country to format your number.{" "}
                      {mobileE164 ? (
                        <span className="font-medium text-slate-700">
                          Preview: {mobileE164}
                        </span>
                      ) : null}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-800">
                      Reason for contact
                    </label>
                    <select
                      value={reason}
                      onChange={(e) =>
                        setReason(e.target.value as Reason)
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-slate-500"
                    >
                      {REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-800">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1 min-h-[120px] w-full resize-y rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="Tell us your preferred date, headcount, and what kind of day you want…"
                  />
                </div>

                {/* Alerts */}
                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                {submitted ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Thanks — your message has been sent. We’ll get back to you shortly.
                  </div>
                ) : null}

                {/* Submit */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    By sending this form you agree we can contact you about your enquiry.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending…" : "Send message"}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 text-xs text-slate-500">
              Tip: when you’re ready, we can wire this to Zammad / email (Resend) and store
              enquiries in Supabase.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
