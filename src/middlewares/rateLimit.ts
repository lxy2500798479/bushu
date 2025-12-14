import { redis } from '../utils/redis'

const RATE_LIMIT_KEY = (userId: string) => `rate:${userId}`
const DEFAULT_LIMIT = 10 // 每个时间窗口最大请求数
const DEFAULT_WINDOW = 1 // 时间窗口（秒）

export interface RateLimitConfig {
  limit?: number
  window?: number
}

export class RateLimiter {
  private limit: number
  private window: number

  constructor(config: RateLimitConfig = {}) {
    this.limit = config.limit || DEFAULT_LIMIT
    this.window = config.window || DEFAULT_WINDOW
  }

  async isAllowed(userId: string): Promise<boolean> {
    const key = RATE_LIMIT_KEY(userId)
    const current = await redis.incr(key)
    
    if (current === 1) {
      await redis.expire(key, this.window)
    }
    
    return current <= this.limit
  }

  async getRemainingRequests(userId: string): Promise<number> {
    const key = RATE_LIMIT_KEY(userId)
    const current = await redis.get(key)
    const used = current ? parseInt(current) : 0
    return Math.max(0, this.limit - used)
  }
}

export const rateLimiter = new RateLimiter()
