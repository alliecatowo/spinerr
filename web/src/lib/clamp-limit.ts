/** Parse a `limit` query value, falling back to `fallback` and capping at `max`. */
export function clampLimit(raw: string | null, fallback: number, max = 50): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}
