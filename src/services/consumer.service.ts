import { queueService } from './queue.service'
import { orderService } from './order.service'
import { stockService } from './stock.service'
import type { OrderMessage } from '../types/activity'
import { OrderStatus } from '../types/activity'

export class ConsumerService {
  async start() {
    console.log('🚀 Order consumer started')
    
    await queueService.consumeOrders(async (message: OrderMessage) => {
      await this.processOrder(message)
    })
  }

  private async processOrder(message: OrderMessage) {
    const { orderId, activityId, userId } = message
    
    try {
      // 创建订单记录
      await orderService.create(activityId, userId, orderId)
      
      // 更新订单状态为完成
      await orderService.updateStatus(orderId, OrderStatus.COMPLETED)
      
      console.log(`✅ Order ${orderId} completed`)
    } catch (error) {
      console.error(`❌ Order ${orderId} failed:`, error)
      
      // 回滚库存
      await stockService.rollback(activityId)
      await stockService.removeParticipation(activityId, userId)
      
      // 尝试更新订单状态为失败（如果订单已创建）
      try {
        await orderService.updateStatus(orderId, OrderStatus.FAILED)
      } catch {}
      
      throw error
    }
  }
}

export const consumerService = new ConsumerService()
