import 'dotenv/config'
import { app } from './app'
import { connectDatabase, disconnectDatabase } from './utils/prisma'
import { connectRabbitMQ, disconnectRabbitMQ } from './utils/rabbitmq'
import { disconnectRedis } from './utils/redis'
import { consumerService } from './services/consumer.service'

const PORT = parseInt(process.env.PORT || '3000')

async function bootstrap() {
  try {
    // 连接数据库
    await connectDatabase()
    
    // 连接 RabbitMQ
    await connectRabbitMQ()
    
    // 启动订单消费者
    await consumerService.start()
    
    // 启动 HTTP 服务器
    app.listen(PORT)
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\nShutting down...')
  await disconnectDatabase()
  await disconnectRabbitMQ()
  await disconnectRedis()
  process.exit(0)
})

bootstrap()
