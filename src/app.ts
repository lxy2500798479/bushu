import { Elysia } from 'elysia'
import { activityController } from './controllers/activity.controller'
import { seckillController } from './controllers/seckill.controller'
import { orderController } from './controllers/order.controller'

export const app = new Elysia()
  .get('/', () => ({ message: 'Flash Sale System API' }))
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .use(activityController)
  .use(seckillController)
  .use(orderController)
