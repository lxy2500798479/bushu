# Requirements Document

## Introduction

本文档定义了一个基于 Elysia + Redis + RabbitMQ + MySQL 的高并发秒杀系统。系统旨在处理大量并发请求，通过 Redis 缓存库存、RabbitMQ 异步处理订单，确保在高并发场景下的数据一致性和系统稳定性。

## Glossary

- **Flash_Sale_System**: 秒杀系统，处理限时抢购活动的核心系统
- **Seckill_Activity**: 秒杀活动，包含商品、库存、开始/结束时间等信息
- **Seckill_Order**: 秒杀订单，用户成功抢购后生成的订单记录
- **Stock_Cache**: Redis 中的库存缓存，用于快速扣减库存
- **Order_Queue**: RabbitMQ 订单队列，用于异步处理订单创建
- **Rate_Limiter**: 限流器，控制用户请求频率

## Requirements

### Requirement 1: 秒杀活动管理

**User Story:** As a 管理员, I want 创建和管理秒杀活动, so that 可以配置商品的秒杀时间和库存。

#### Acceptance Criteria

1. WHEN 管理员创建秒杀活动 THEN Flash_Sale_System SHALL 在数据库中存储活动信息并将库存预热到 Redis
2. WHEN 秒杀活动开始时间到达 THEN Flash_Sale_System SHALL 自动开启活动允许用户参与
3. WHEN 秒杀活动结束时间到达 THEN Flash_Sale_System SHALL 自动关闭活动拒绝新的请求
4. WHEN 查询活动状态 THEN Flash_Sale_System SHALL 返回活动的当前状态和剩余库存

### Requirement 2: 库存管理

**User Story:** As a 系统, I want 使用 Redis 管理库存, so that 可以支持高并发的库存扣减操作。

#### Acceptance Criteria

1. WHEN 秒杀活动创建 THEN Flash_Sale_System SHALL 将库存数量同步到 Redis 缓存
2. WHEN 用户发起秒杀请求 THEN Flash_Sale_System SHALL 使用 Redis Lua 脚本原子性扣减库存
3. WHEN Redis 库存扣减成功 THEN Flash_Sale_System SHALL 返回扣减成功状态
4. WHEN Redis 库存不足 THEN Flash_Sale_System SHALL 立即返回库存不足错误
5. WHEN 订单处理失败 THEN Flash_Sale_System SHALL 回滚 Redis 库存

### Requirement 3: 订单异步处理

**User Story:** As a 系统, I want 使用 RabbitMQ 异步处理订单, so that 可以削峰填谷提高系统吞吐量。

#### Acceptance Criteria

1. WHEN 库存扣减成功 THEN Flash_Sale_System SHALL 将订单信息发送到 RabbitMQ 队列
2. WHEN 消费者接收到订单消息 THEN Flash_Sale_System SHALL 在 MySQL 中创建订单记录
3. WHEN 订单创建成功 THEN Flash_Sale_System SHALL 更新订单状态为已完成
4. WHEN 订单创建失败 THEN Flash_Sale_System SHALL 回滚 Redis 库存并记录失败日志
5. WHEN 序列化订单消息 THEN Flash_Sale_System SHALL 使用 JSON 格式编码订单数据
6. WHEN 反序列化订单消息 THEN Flash_Sale_System SHALL 解析 JSON 恢复订单对象

### Requirement 4: 用户秒杀接口

**User Story:** As a 用户, I want 参与秒杀活动, so that 可以以优惠价格购买商品。

#### Acceptance Criteria

1. WHEN 用户发起秒杀请求 THEN Flash_Sale_System SHALL 验证活动状态和用户资格
2. WHEN 用户已参与过同一活动 THEN Flash_Sale_System SHALL 拒绝重复参与
3. WHEN 秒杀成功 THEN Flash_Sale_System SHALL 返回订单号和排队状态
4. WHEN 秒杀失败 THEN Flash_Sale_System SHALL 返回明确的失败原因

### Requirement 5: 限流与防护

**User Story:** As a 系统, I want 实现请求限流, so that 可以保护系统免受恶意请求攻击。

#### Acceptance Criteria

1. WHEN 用户请求频率超过阈值 THEN Rate_Limiter SHALL 拒绝请求并返回限流提示
2. WHILE 系统处于高负载状态 THEN Flash_Sale_System SHALL 启用降级策略
3. WHEN 检测到异常请求模式 THEN Flash_Sale_System SHALL 记录日志并触发告警

### Requirement 6: 订单查询

**User Story:** As a 用户, I want 查询我的秒杀订单状态, so that 可以了解订单处理进度。

#### Acceptance Criteria

1. WHEN 用户查询订单 THEN Flash_Sale_System SHALL 返回订单的当前状态
2. WHEN 订单正在处理中 THEN Flash_Sale_System SHALL 返回排队位置或预计等待时间
3. WHEN 订单不存在 THEN Flash_Sale_System SHALL 返回订单未找到错误
