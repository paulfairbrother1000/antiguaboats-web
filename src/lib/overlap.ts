export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const aS = Date.parse(aStart);
  const aE = Date.parse(aEnd);
  const bS = Date.parse(bStart);
  const bE = Date.parse(bEnd);
  return aS < bE && bS < aE;
}
