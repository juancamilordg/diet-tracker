/**
 * Convert a Date to a local YYYY-MM-DD string (using the browser's local timezone).
 * Avoids the UTC-shift bug in toISOString().split('T')[0].
 */
export function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
