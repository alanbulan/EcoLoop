<div align="center">

# EcoLoop Backend

**智能废品回收平台 — 后端 API 服务**

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com)
[![Tortoise ORM](https://img.shields.io/badge/Tortoise_ORM-0.19+-orange.svg)](https://tortoise.github.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)

</div>

---

## 简介

EcoLoop Backend 是基于 FastAPI 构建的 RESTful API 服务，采用领域驱动的模块化架构（Spring Boot 风格），为用户端、回收员端和管理后台提供统一的数据接口。

## 架构设计

```
app/
├── common/                # 公共基础设施
│   ├── audit_log.py       # 操作审计日志
│   ├── scheduler.py       # 定时任务调度器
│   └── logging_middleware.py  # 全局请求日志
├── core/
│   └── config.py          # 环境配置（Pydantic Settings）
├── modules/               # 业务模块（每个模块自包含）
│   ├── auth/              # 认证模块
│   │   ├── router.py      #   路由层
│   │   └── schemas.py     #   数据校验
│   ├── orders/            # 订单模块
│   │   ├── model.py       #   数据模型
│   │   ├── router.py      #   路由层
│   │   ├── schemas.py     #   数据校验
│   │   └── service.py     #   业务逻辑
│   └── ...                # 其余 15 个模块同构
├── registry.py            # 统一路由注册
└── models.py              # 统一模型导出（供 Tortoise ORM 发现）
```

每个模块遵循 **Router → Service → Model** 三层职责分离：
- Router: 参数校验、权限检查、调用 Service
- Service: 核心业务逻辑、事务管理
- Model: 数据定义、ORM 映射

## 业务模块

| 模块 | 路由前缀 | 功能 |
|------|----------|------|
| auth | `/api/v1/auth` | 微信登录、JWT Token 签发 |
| users | `/api/v1/users` | 用户信息、积分、统计 |
| orders | `/api/v1/orders` | 订单 CRUD、指派、完成、取消 |
| materials | `/api/v1/materials` | 物料列表、价格管理、历史记录 |
| collectors | `/api/v1/collectors` | 回收员注册、抢单、统计 |
| withdrawals | `/api/v1/withdrawals` | 提现申请、审核 |
| addresses | `/api/v1/addresses` | 地址 CRUD、默认地址 |
| inventory | `/api/v1/inventory` | 入库、出库、盘点 |
| notifications | `/api/v1/notifications` | 消息推送、已读标记 |
| reviews | `/api/v1/reviews` | 订单评价 |
| feedback | `/api/v1/feedback` | 用户反馈 |
| referrals | `/api/v1/referrals` | 邀请码、绑定、奖励 |
| shop | `/api/v1/shop` | 积分商城、兑换 |
| geo | `/api/v1/geo` | 地理编码、附近站点 |
| recycle_points | `/api/v1/recycle-points` | 回收站点管理 |
| config | `/api/v1/config` | 系统配置下发 |
| admin | `/api/v1/admin` | 管理后台登录、仪表盘、审计日志 |


## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.10+ | 运行时 |
| FastAPI | 0.100+ | 异步 Web 框架 |
| Tortoise ORM | 0.19+ | 异步 ORM（支持 SQLite / PostgreSQL） |
| FastAPI-Admin | 1.0+ | 可视化管理面板 |
| Pydantic | 2.0+ | 数据校验与序列化 |
| python-jose | - | JWT Token 生成与验证 |
| passlib | - | 密码哈希（bcrypt） |
| aioredis | 2.0+ | Redis 异步客户端 |
| Aerich | 0.7+ | 数据库迁移工具 |
| Pytest | 7.0+ | 单元测试框架 |
| httpx | 0.24+ | 异步 HTTP 客户端 |

## 快速开始

### 环境要求

- Python 3.10+
- Redis（FastAPI-Admin 依赖）

### 安装与运行

```bash
# 1. 创建虚拟环境
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 2. 安装依赖
pip install -r requirements.txt

# 3. 启动服务
uvicorn app.main:app --reload --port 8000
```

### 访问地址

| 地址 | 说明 |
|------|------|
| http://localhost:8000/docs | Swagger API 文档 |
| http://localhost:8000/redoc | ReDoc API 文档 |
| http://localhost:8000/admin | 管理面板（admin / admin） |

## 环境变量

在 `backend/.env` 中配置：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DATABASE_URL` | `sqlite://db.sqlite3` | 数据库连接 |
| `SECRET_KEY` | `dev-secret-key` | JWT 签名密钥 |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis 连接 |
| `WX_APPID` | - | 微信小程序 AppID |
| `WX_SECRET` | - | 微信小程序 Secret |

## 测试

```bash
pytest -v
```

测试覆盖：订单结算服务、定价服务、提现服务。

## 安全特性

- JWT Bearer Token 认证
- 管理员接口 `require_admin` 依赖注入
- 地址操作 `user_id` 所有权校验
- 关键写操作 `@atomic()` 事务保护
- Pydantic 严格字段校验（weight > 0, impurity 0-100）
- 全局异常处理（隐藏内部错误细节）
- 请求日志中间件（结构化日志）

---

<div align="center">

[返回项目主页](../README.md)

</div>
