import { getRedisClient } from '@/lib/db/redis'

interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const redis = getRedisClient()
  const redisKey = `rate_limit:${key}`

  const current = await redis.incr(redisKey)
  if (current === 1) {
    await redis.expire(redisKey, windowSeconds)
  }

  const ttl = await redis.ttl(redisKey)

  if (current > maxAttempts) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(ttl, 1) }
  }

  return { allowed: true, remaining: maxAttempts - current, retryAfterSeconds: 0 }
}
