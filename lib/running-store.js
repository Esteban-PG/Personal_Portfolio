// Server-only storage for /running logs (Upstash Redis via the Vercel
// Marketplace). All logs live in one hash: field = "YYYY-MM-DD", value = log.
import { Redis } from "@upstash/redis"

const HASH_KEY = "running:logs"

let cached = null

function client() {
  if (cached) return cached
  // The Vercel ↔ Upstash integration injects one of these two pairs.
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  cached = new Redis({ url, token })
  return cached
}

export function storageConfigured() {
  return client() !== null
}

export async function getLogs() {
  const redis = client()
  if (!redis) return { logs: {}, storageReady: false }
  try {
    const logs = (await redis.hgetall(HASH_KEY)) || {}
    return { logs, storageReady: true }
  } catch (error) {
    console.error("[running] could not read logs:", error)
    return { logs: {}, storageReady: false }
  }
}

export async function saveLog(date, log) {
  const redis = client()
  if (!redis) throw new Error("storage not configured")
  await redis.hset(HASH_KEY, { [date]: log })
}

export async function deleteLog(date) {
  const redis = client()
  if (!redis) throw new Error("storage not configured")
  await redis.hdel(HASH_KEY, date)
}
