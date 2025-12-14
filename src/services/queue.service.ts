import { getChannel, QUEUES } from '../utils/rabbitmq'
import type { OrderMessage } from '../types/activity'

export class QueueService {
  // 序列化订单消息
  serialize(message: OrderMessage): string {
    return JSON.stringify(message)
  }

  // 反序列化订单消息
  deserialize(data: string): OrderMessage {
    return JSON.parse(data) as OrderMessage
  }

  // 发布订单消息到队列
  async publishOrder(message: OrderMessage): Promise<void> {
    const channel = getChannel()
    const content = Buffer.from(this.serialize(message))
    channel.sendToQueue(QUEUES.ORDER, content, { persistent: true })
  }

  // 消费订单消息
  async consumeOrders(handler: (message: OrderMessage) => Promise<void>): Promise<void> {
    const channel = getChannel()
    
    await channel.consume(QUEUES.ORDER, async (msg) => {
      if (!msg) return
      
      try {
        const orderMessage = this.deserialize(msg.content.toString())
        await handler(orderMessage)
        channel.ack(msg)
      } catch (error) {
        console.error('Order processing failed:', error)
        // 处理失败，重新入队
        channel.nack(msg, false, true)
      }
    })
  }
}

export const queueService = new QueueService()
