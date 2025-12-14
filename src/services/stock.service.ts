import { redis } from '../utils/redis'

// Redis key patterns
const STOCK_KEY = (activityId: string) => `stock:${activityId}`
const PARTICIPATED_KEY = (activityId: string) => `participated:${activityId}`

// Lua 脚本：原子性扣减库存
const DEDUCT_STOCK_SCRIPT = `
local stock = tonumber(redis.call('GET', KEYS[1]))
if stock and stock > 0 then
    redis.call('DECR', KEYS[1])
    return 1
end
return 0
`

// Lua 脚本：检查并标记用户参与
const CHECK_AND_MARK_SCRIPT = `
local participated = redis.call('SISMEMBER', KEYS[1], ARGV[1])
if participated == 1 then
    return 0
end
redis.call('SADD', KEYS[1], ARGV[1])
return 1
`

export class StockService {
  // 预热库存到 Redis
  async warmup(activityId: string, stock: number): Promise<void> {
    await redis.set(STOCK_KEY(activityId), stock)
  }

  // 原子性扣减库存
  async deduct(activityId: string): Promise<boolean> {
    const result = await redis.eval(
      DEDUCT_STOCK_SCRIPT,
      1,
      STOCK_KEY(activityId)
    )
    return result === 1
  }

  // 回滚库存
  async rollback(activityId: string): Promise<void> {
    await redis.incr(STOCK_KEY(activityId))
  }

  // 获取当前库存
  async getStock(activityId: string): Promise<number> {
    const stock = await redis.get(STOCK_KEY(activityId))
    return stock ? parseInt(stock) : 0
  }


  // 检查用户是否已参与
  async hasParticipated(activityId: string, userId: string): Promise<boolean> {
    const result = await redis.sismember(PARTICIPATED_KEY(activityId), userId)
    return result === 1
  }

  // 检查并标记用户参与（原子操作）
  async checkAndMarkParticipation(activityId: string, userId: string): Promise<boolean> {
    const result = await redis.eval(
      CHECK_AND_MARK_SCRIPT,
      1,
      PARTICIPATED_KEY(activityId),
      userId
    )
    return result === 1
  }

  // 移除用户参与标记（用于回滚）
  async removeParticipation(activityId: string, userId: string): Promise<void> {
    await redis.srem(PARTICIPATED_KEY(activityId), userId)
  }
}

export const stockService = new StockService()
