import { Suspense } from "react";
import AvailabilityClient from "./AvailabilityClient";

export default function AvailabilityPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10">Loading…</div>}>
      <AvailabilityClient />
    </Suspense>
  );
}
