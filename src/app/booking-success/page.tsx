import { Suspense } from "react";
import BookingSuccessClient from "./BookingSuccessClient";

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-16">Loading…</div>}>
      <BookingSuccessClient />
    </Suspense>
  );
}
