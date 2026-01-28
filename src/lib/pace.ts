export type BusyBlock = { start_at: string; end_at: string; source: "pace" };

// OPTIONAL integration: if Pace is misconfigured/unavailable, return [] (don't break the site).
export async function fetchPaceBusyBlocks(fromISO: string, toISO: string): Promise<BusyBlock[]> {
  
  const enabled = (process.env.PACE_ENABLED ?? "false") === "true";
if (!enabled) return [];

  const url = process.env.PACE_BUSYBLOCKS_URL;
  const token = process.env.PACE_API_TOKEN;

  // If not configured, just return no blocks.
  if (!url || !token) return [];

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fromISO, toISO }),
      cache: "no-store",
    });
 
    // If Pace returns non-200 (e.g. 404), ignore and keep site running.
    if (!res.ok) return [];

    const json = (await res.json()) as { blocks?: { start_at: string; end_at: string }[] };
    return (json.blocks ?? []).map(b => ({ ...b, source: "pace" }));
  } catch {
    // Network/other failure: ignore.
    return [];
  }
}
