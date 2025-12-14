export enum ActivityStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface CreateActivityDto {
  name: string
  productName: string
  price: number
  stock: number
  startTime: Date
  endTime: Date
}

export interface Activity {
  id: string
  name: string
  productName: string
  price: number
  stock: number
  startTime: Date
  endTime: Date
  status: ActivityStatus
  createdAt: Date
  updatedAt: Date
}

export interface OrderMessage {
  orderId: string
  activityId: string
  userId: string
  timestamp: number
}

export interface SeckillResult {
  success: boolean
  orderId?: string
  message: string
}
