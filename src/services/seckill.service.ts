import { activityService } from './activity.service'
import { stockService } from './stock.service'
import { queueService } from './queue.service'
import { ActivityStatus, type SeckillResult } from '../types/activity'

export class SeckillService {
  async execute(userId: string, activityId: string): Promise<SeckillResult> {
    // 1. 检查活动状态
    const activity = await activityService.getStatus(activityId)
    if (!activity) {
      return { success: false, message: '活动不存在' }
    }

    if (activity.status === ActivityStatus.PENDING) {
      return { success: false, message: '活动尚未开始' }
    }

    if (activity.status === ActivityStatus.ENDED) {
      return { success: false, message: '活动已结束' }
    }

    // 2. 检查用户是否已参与（原子操作）
    const canParticipate = await stockService.checkAndMarkParticipation(activityId, userId)
    if (!canParticipate) {
      return { success: false, message: '您已参与过此活动' }
    }

    // 3. 扣减库存
    const deducted = await stockService.deduct(activityId)
    if (!deducted) {
      // 库存不足，回滚参与标记
      await stockService.removeParticipation(activityId, userId)
      return { success: false, message: '库存不足' }
    }

    // 4. 生成订单 ID 并发送到队列
    const orderId = crypto.randomUUID()
    try {
      await queueService.publishOrder({
        orderId,
        activityId,
        userId,
        timestamp: Date.now()
      })

      return {
        success: true,
        orderId,
        message: '秒杀成功，订单处理中'
      }
    } catch (error) {
      // 发送失败，回滚库存和参与标记
      await stockService.rollback(activityId)
      await stockService.removeParticipation(activityId, userId)
      return { success: false, message: '系统繁忙，请稍后重试' }
    }
  }
}

export const seckillService = new SeckillService()
