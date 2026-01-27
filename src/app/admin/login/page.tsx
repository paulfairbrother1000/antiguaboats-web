"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function submit() {
    setErr(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });

    const json = await res.json();
    if (!res.ok) {
      setErr(json.error ?? "Login failed");
      return;
    }
    router.push("/admin/bookings");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
      <div className="mt-6 rounded-2xl border bg-white p-6">
        <label className="block text-sm text-slate-600">Password</label>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          className="mt-1 w-full rounded-xl border px-3 py-2"
        />
        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
        <button onClick={submit} className="mt-5 w-full rounded-xl bg-sky-600 text-white py-3 font-semibold hover:bg-sky-700">
          Sign in
        </button>
      </div>
    </main>
  );
}
