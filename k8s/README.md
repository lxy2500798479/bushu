# Kubernetes 部署指南

## 目录结构

```
k8s/
├── namespace.yaml      # 命名空间
├── configmap.yaml      # 非敏感配置
├── secret.yaml         # 敏感配置（密码等）
├── deployment.yaml     # API 部署
├── service.yaml        # Service 配置
├── ingress.yaml        # Ingress 配置
├── hpa.yaml            # 自动扩缩容
├── mysql.yaml          # MySQL 部署
├── redis.yaml          # Redis 部署
└── rabbitmq.yaml       # RabbitMQ 部署
```

## 部署步骤

### 1. 构建并推送镜像

```bash
# 构建镜像
docker build -t your-registry/seckill-api:latest .

# 推送到镜像仓库
docker push your-registry/seckill-api:latest
```

### 2. 修改配置

编辑以下文件，替换为你的实际配置：

- `deployment.yaml`: 修改 `image` 为你的镜像地址
- `secret.yaml`: 修改数据库密码等敏感信息
- `ingress.yaml`: 修改 `host` 为你的域名

### 3. 按顺序部署

```bash
# 创建命名空间
kubectl apply -f k8s/namespace.yaml

# 部署配置
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# 部署中间件（如果使用 K8s 内部署）
kubectl apply -f k8s/mysql.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/rabbitmq.yaml

# 等待中间件就绪
kubectl wait --for=condition=ready pod -l app=mysql -n seckill --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis -n seckill --timeout=60s
kubectl wait --for=condition=ready pod -l app=rabbitmq -n seckill --timeout=60s

# 部署 API
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

# 部署 Ingress（可选）
kubectl apply -f k8s/ingress.yaml
```

### 4. 一键部署（所有资源）

```bash
kubectl apply -f k8s/
```

### 5. 初始化数据库

```bash
# 进入 API Pod 执行数据库迁移
kubectl exec -it deployment/seckill-api -n seckill -- bun run db:push
```

## 常用命令

```bash
# 查看所有资源
kubectl get all -n seckill

# 查看 Pod 日志
kubectl logs -f deployment/seckill-api -n seckill

# 查看 Pod 详情
kubectl describe pod -l app=seckill-api -n seckill

# 进入 Pod
kubectl exec -it deployment/seckill-api -n seckill -- sh

# 查看 HPA 状态
kubectl get hpa -n seckill

# 手动扩容
kubectl scale deployment seckill-api --replicas=5 -n seckill

# 删除所有资源
kubectl delete -f k8s/
```

## 访问方式

### NodePort 方式
```bash
# 获取节点 IP
kubectl get nodes -o wide

# 访问地址: http://<NODE_IP>:30080
```

### Ingress 方式
```bash
# 配置域名解析后访问
# http://seckill.example.com
```

### Port Forward（本地调试）
```bash
kubectl port-forward service/seckill-api-service 3000:80 -n seckill
# 访问 http://localhost:3000
```

## 生产环境建议

1. **数据库**: 使用云托管数据库（RDS/Cloud SQL）而非 K8s 部署
2. **Redis**: 使用 Redis Cluster 或托管服务（ElastiCache）
3. **RabbitMQ**: 使用托管服务或 RabbitMQ Operator
4. **Secret**: 使用 External Secrets Operator 或 HashiCorp Vault
5. **监控**: 部署 Prometheus + Grafana
6. **日志**: 部署 EFK/ELK Stack
