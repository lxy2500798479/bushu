import amqp, { type Connection, type Channel } from 'amqplib'

let connection: Connection | null = null
let channel: Channel | null = null

export const QUEUES = {
  ORDER: 'seckill_order_queue'
}

export async function connectRabbitMQ(): Promise<Channel> {
  if (channel) return channel

  const url = process.env.RABBITMQ_URL || 'amqp://localhost'
  const conn = await amqp.connect(url)
  connection = conn as unknown as Connection
  channel = await conn.createChannel()
  
  // 声明队列
  await channel.assertQueue(QUEUES.ORDER, { durable: true })
  
  console.log('✅ RabbitMQ connected')
  return channel
}

export function getChannel(): Channel {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized')
  }
  return channel
}

export async function disconnectRabbitMQ() {
  if (channel) await channel.close()
  if (connection) await (connection as unknown as amqp.ChannelModel).close()
}
