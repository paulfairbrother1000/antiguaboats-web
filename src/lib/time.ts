// v1: treat input date as UTC day (good enough to get operational fast)

export function toAntiguaISO(dateYYYYMMDD: string, hhmm: string) {
  const [y, m, d] = dateYYYYMMDD.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));
  return dt.toISOString();
}

export function isoRangeOverlaps(aStartISO: string, aEndISO: string, bStartISO: string, bEndISO: string) {
  const aS = Date.parse(aStartISO);
  const aE = Date.parse(aEndISO);
  const bS = Date.parse(bStartISO);
  const bE = Date.parse(bEndISO);
  return aS < bE && bS < aE;
}
