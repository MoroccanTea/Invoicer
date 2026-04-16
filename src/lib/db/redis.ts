import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

interface CachedRedis {
  client: Redis | null
}

declare global {
  var redis: CachedRedis | undefined
}

let cached: CachedRedis = global.redis || { client: null }

if (!global.redis) {
  global.redis = cached
}

export function getRedisClient(): Redis {
  if (cached.client) {
    return cached.client
  }

  cached.client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
  })

  cached.client.on('error', (err) => {
    console.error('Redis Client Error:', err)
  })

  cached.client.on('connect', () => {
    console.log('Redis Client Connected')
  })

  return cached.client
}

// Cache utilities
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient()
    const data = await client.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Redis cache get error:', error)
    return null
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttl: number = 3600
): Promise<void> {
  try {
    const client = getRedisClient()
    await client.set(key, JSON.stringify(value), 'EX', ttl)
  } catch (error) {
    console.error('Redis cache set error:', error)
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    const client = getRedisClient()
    await client.del(key)
  } catch (error) {
    console.error('Redis cache delete error:', error)
  }
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
  try {
    const client = getRedisClient()
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(...keys)
    }
  } catch (error) {
    console.error('Redis cache delete pattern error:', error)
  }
}

export default getRedisClient
