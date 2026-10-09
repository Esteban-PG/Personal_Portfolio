// Server-only: asks the Google Apps Script for the finance summary.
// The script URL and its read-only key live in Vercel env vars (never sent to the browser).
import { unstable_cache } from "next/cache"

export function dataConfigured() {
  return Boolean(process.env.FINANZAS_SCRIPT_URL && process.env.FINANZAS_SCRIPT_KEY)
}

async function fetchResumen() {
  const response = await fetch(process.env.FINANZAS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accion: "resumen", clave: process.env.FINANZAS_SCRIPT_KEY }),
    redirect: "follow", // Apps Script answers through a redirect to googleusercontent.com
    cache: "no-store",
  })
  const text = await response.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`El script no devolvió JSON (HTTP ${response.status}).`)
  }
  if (!data.ok) throw new Error(data.mensaje || "El script devolvió un error.")
  return data
}

// One call per minute at most, however often the page is opened.
const cachedResumen = unstable_cache(fetchResumen, ["finanzas-resumen"], { revalidate: 60 })

export async function getResumen() {
  if (!dataConfigured()) {
    return { data: null, error: "Falta configurar FINANZAS_SCRIPT_URL y FINANZAS_SCRIPT_KEY en Vercel." }
  }
  try {
    return { data: await cachedResumen(), error: null }
  } catch (error) {
    console.error("[finanzas] could not load summary:", error)
    return { data: null, error: String(error.message || error) }
  }
}
