import { Elysia } from 'elysia'
import { orderService } from '../services/order.service'

export const orderController = new Elysia({ prefix: '/api/orders' })
  // 查询订单详情
  .get('/:orderId', async ({ params, set }) => {
    const order = await orderService.getById(params.orderId)
    if (!order) {
      set.status = 404
      return { success: false, message: '订单不存在' }
    }
    return { success: true, data: order }
  })
  // 查询用户订单列表
  .get('/user/:userId', async ({ params }) => {
    const orders = await orderService.getByUserId(params.userId)
    return { success: true, data: orders }
  })
