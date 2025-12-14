# Implementation Plan

- [x] 1. 项目基础设施搭建




  - [ ] 1.1 安装依赖并配置环境
    - 安装 amqplib (RabbitMQ 客户端)、fast-check (属性测试)
    - 更新 .env 配置文件添加 RabbitMQ 和 MySQL 连接


    - 更新 Prisma schema 使用 MySQL
    - _Requirements: 1.1, 2.1, 3.1_

  - [x] 1.2 创建数据库模型

    - 创建 Activity 和 Order 模型
    - 运行 Prisma migrate 生成数据库表
    - _Requirements: 1.1, 3.2_

- [ ] 2. Redis 库存服务实现
  - [ ] 2.1 实现 Redis 连接和 Lua 脚本
    - 创建 StockService 类
    - 实现库存扣减 Lua 脚本 (原子操作)
    - 实现库存回滚方法
    - 实现库存查询方法
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 2.2 编写库存扣减属性测试
    - **Property 2: 库存扣减正确性 (不超卖)**

    - **Validates: Requirements 2.2, 2.3, 2.4**
  - [ ]* 2.3 编写库存回滚属性测试
    - **Property 5: 库存回滚一致性**
    - **Validates: Requirements 2.5, 3.4**

- [ ] 3. RabbitMQ 消息队列服务实现
  - [x] 3.1 实现 RabbitMQ 连接和队列服务

    - 创建 QueueService 类
    - 实现消息发布方法
    - 实现消息消费方法

    - 实现订单消息序列化/反序列化
    - _Requirements: 3.1, 3.5, 3.6_
  - [ ]* 3.2 编写消息序列化 Round-Trip 属性测试
    - **Property 4: 订单消息 Round-Trip**
    - **Validates: Requirements 3.5, 3.6**

- [ ] 4. 活动管理服务实现
  - [ ] 4.1 实现 ActivityService
    - 创建活动 (同时预热 Redis 库存)
    - 查询活动详情
    - 计算活动状态 (基于时间)

    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1_
  - [ ]* 4.2 编写活动状态属性测试
    - **Property 6: 活动状态时间约束**
    - **Validates: Requirements 1.2, 1.3**

  - [ ]* 4.3 编写活动创建一致性属性测试
    - **Property 1: 活动创建数据一致性**
    - **Validates: Requirements 1.1, 2.1**

- [x] 5. Checkpoint - 确保所有测试通过

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. 秒杀核心服务实现
  - [ ] 6.1 实现 SeckillService
    - 验证活动状态

    - 检查用户参与记录 (Redis Set)
    - 调用库存扣减
    - 发送订单消息到队列

    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ]* 6.2 编写用户唯一参与属性测试
    - **Property 3: 用户参与唯一性**
    - **Validates: Requirements 4.2**

- [x] 7. 订单服务实现


  - [ ] 7.1 实现 OrderService
    - 创建订单记录
    - 更新订单状态
    - 查询订单详情
    - _Requirements: 3.2, 3.3, 6.1_
  - [x]* 7.2 编写订单查询属性测试


    - **Property 8: 订单状态查询完整性**
    - **Validates: Requirements 6.1**

- [ ] 8. 订单消费者实现
  - [ ] 8.1 实现订单消费者
    - 监听 RabbitMQ 订单队列
    - 创建 MySQL 订单记录
    - 处理失败时回滚库存

    - _Requirements: 3.2, 3.3, 3.4_

- [x] 9. 限流中间件实现



  - [ ] 9.1 实现 Rate Limiter
    - 基于 Redis 的滑动窗口限流
    - 配置限流阈值和时间窗口

    - _Requirements: 5.1_
  - [ ]* 9.2 编写限流属性测试
    - **Property 7: 限流阈值有效性**
    - **Validates: Requirements 5.1**


- [ ] 10. API 路由整合
  - [ ] 10.1 实现活动管理 API
    - POST /api/activities - 创建活动
    - GET /api/activities/:id - 查询活动
    - _Requirements: 1.1, 1.4_
  - [ ] 10.2 实现秒杀 API
    - POST /api/seckill/:activityId - 参与秒杀
    - 整合限流中间件
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1_
  - [ ] 10.3 实现订单查询 API
    - GET /api/orders/:orderId - 查询订单
    - GET /api/orders/user/:userId - 用户订单列表
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 11. 启动消费者和服务整合
  - [ ] 11.1 整合所有服务到主入口
    - 初始化 Redis、RabbitMQ、MySQL 连接
    - 启动订单消费者
    - 启动 Elysia 服务器
    - _Requirements: All_

- [ ] 12. Final Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.
