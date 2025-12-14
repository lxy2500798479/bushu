import { Elysia, t } from 'elysia'
import { activityService } from '../services/activity.service'

export const activityController = new Elysia({ prefix: '/api/activities' })
  // 创建活动
  .post('/', async ({ body }) => {
    const activity = await activityService.create({
      name: body.name,
      productName: body.productName,
      price: body.price,
      stock: body.stock,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime)
    })
    return { success: true, data: activity }
  }, {
    body: t.Object({
      name: t.String(),
      productName: t.String(),
      price: t.Number(),
      stock: t.Number(),
      startTime: t.String(),
      endTime: t.String()
    })
  })
  // 查询活动状态
  .get('/:id', async ({ params, set }) => {
    const status = await activityService.getStatus(params.id)
    if (!status) {
      set.status = 404
      return { success: false, message: '活动不存在' }
    }
    return { success: true, data: status }
  })
