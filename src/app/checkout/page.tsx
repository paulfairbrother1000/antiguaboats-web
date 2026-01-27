import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-16">Loading…</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
