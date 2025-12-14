import { prisma } from '../utils/prisma'
import { OrderStatus } from '../types/activity'

export class OrderService {
  // 创建订单
  async create(activityId: string, userId: string, orderId: string) {
    return prisma.order.create({
      data: {
        id: orderId,
        activityId,
        userId,
        status: 'PENDING'
      }
    })
  }

  // 更新订单状态
  async updateStatus(orderId: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status }
    })
  }

  // 根据 ID 获取订单
  async getById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: { activity: true }
    })
  }

  // 获取用户订单列表
  async getByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { activity: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  // 检查用户是否已有该活动订单
  async hasOrder(activityId: string, userId: string): Promise<boolean> {
    const order = await prisma.order.findUnique({
      where: { activityId_userId: { activityId, userId } }
    })
    return !!order
  }
}

export const orderService = new OrderService()
