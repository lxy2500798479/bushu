import { prisma } from '../utils/prisma'
import { stockService } from './stock.service'
import type { CreateActivityDto, Activity } from '../types/activity'
import { ActivityStatus } from '../types/activity'

export class ActivityService {
  // 创建活动并预热库存
  async create(data: CreateActivityDto): Promise<Activity> {
    const activity = await prisma.activity.create({
      data: {
        name: data.name,
        productName: data.productName,
        price: data.price,
        stock: data.stock,
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'PENDING'
      }
    })

    // 预热库存到 Redis
    await stockService.warmup(activity.id, data.stock)

    return this.mapToActivity(activity)
  }

  // 根据 ID 获取活动
  async getById(id: string): Promise<Activity | null> {
    const activity = await prisma.activity.findUnique({ where: { id } })
    return activity ? this.mapToActivity(activity) : null
  }

  // 计算活动当前状态
  calculateStatus(startTime: Date, endTime: Date): ActivityStatus {
    const now = new Date()
    if (now < startTime) return ActivityStatus.PENDING
    if (now > endTime) return ActivityStatus.ENDED
    return ActivityStatus.ACTIVE
  }

  // 获取活动状态（包含实时库存）
  async getStatus(id: string) {
    const activity = await this.getById(id)
    if (!activity) return null

    const currentStock = await stockService.getStock(id)
    const currentStatus = this.calculateStatus(activity.startTime, activity.endTime)

    return {
      ...activity,
      status: currentStatus,
      currentStock
    }
  }


  // 映射数据库模型到业务类型
  private mapToActivity(dbActivity: any): Activity {
    return {
      id: dbActivity.id,
      name: dbActivity.name,
      productName: dbActivity.productName,
      price: Number(dbActivity.price),
      stock: dbActivity.stock,
      startTime: dbActivity.startTime,
      endTime: dbActivity.endTime,
      status: dbActivity.status as ActivityStatus,
      createdAt: dbActivity.createdAt,
      updatedAt: dbActivity.updatedAt
    }
  }
}

export const activityService = new ActivityService()
