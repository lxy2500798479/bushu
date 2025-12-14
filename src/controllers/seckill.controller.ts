import { Elysia, t } from 'elysia'
import { seckillService } from '../services/seckill.service'
import { rateLimiter } from '../middlewares/rateLimit'

export const seckillController = new Elysia({ prefix: '/api/seckill' })
  .post('/:activityId', async ({ params, body, set }) => {
    const { activityId } = params
    const { userId } = body

    // 限流检查
    const allowed = await rateLimiter.isAllowed(userId)
    if (!allowed) {
      set.status = 429
      return { success: false, message: '请求过于频繁，请稍后重试' }
    }

    // 执行秒杀
    const result = await seckillService.execute(userId, activityId)
    
    if (!result.success) {
      set.status = 400
      return result
    }

    return result
  }, {
    body: t.Object({
      userId: t.String()
    })
  })
