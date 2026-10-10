// Formatting helpers shared by the /finanzas client components (safe to import in the browser).

export const ZONA = "America/Costa_Rica"

// Miles con punto, igual que en el Sheet (₡10.562)
export const miles = n => String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
export const crc = v => (v === null || v === undefined ? "—" : `${v < 0 ? "-" : ""}₡${miles(v)}`)
export const pct = v => (v === null || v === undefined ? "—" : `${Math.round(v * 100)}%`)

// ₡8,5k / ₡12k — para etiquetas donde no cabe el monto completo
export function crcCorto(v) {
  if (Math.abs(v) < 1000) return crc(v)
  const k = v / 1000
  return `₡${(Math.abs(k) >= 10 ? Math.round(k) : k.toFixed(1)).toString().replace(".", ",")}k`
}

// "YYYY-MM-DD" → "9/10"
export const diaCorto = k => `${Number(k.slice(8, 10))}/${Number(k.slice(5, 7))}`

// "YYYY-MM-DD" en hora de Costa Rica, para comparar con inicio/fin del periodo
export const diaCR = iso => new Date(iso).toLocaleDateString("en-CA", { timeZone: ZONA })

// "YYYY-MM-DD" → 0 = lunes … 6 = domingo
export const diaSemana = k =>
  (new Date(Date.UTC(Number(k.slice(0, 4)), Number(k.slice(5, 7)) - 1, Number(k.slice(8, 10)))).getUTCDay() + 6) % 7

export const sinAnimacion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

export function estado(p) {
  if (p === null || p === undefined) return "neutral"
  if (p >= 1) return "malo"
  if (p >= 0.8) return "alerta"
  return "bien"
}
