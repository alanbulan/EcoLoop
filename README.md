<div align="center">

# EcoLoop

**智能废品回收全栈平台**

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com)
[![Vue](https://img.shields.io/badge/Vue-3.5+-4FC08D.svg)](https://vuejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://typescriptlang.org)
[![UniApp](https://img.shields.io/badge/UniApp-4.x-2B9939.svg)](https://uniapp.dcloud.net.cn)

EcoLoop 是一个面向城市社区的智能废品回收平台，连接用户、回收员和管理后台，实现废品回收全流程数字化管理。

[用户端](#uni-user) | [回收员端](#uni-collector) | [管理后台](#green-recycle-admin) | [后端服务](#backend) | [快速开始](#快速开始) | [项目架构](#项目架构)

</div>

---

## 项目总览

EcoLoop 采用前后端分离的 Monorepo 架构，包含 4 个独立子项目：

| 子项目 | 技术栈 | 说明 |
|--------|--------|------|
| [`backend/`](./backend/) | Python, FastAPI, Tortoise ORM | RESTful API 服务，领域驱动模块化架构 |
| [`uni-user/`](./uni-user/) | Vue 3, TypeScript, UniApp, Wot Design | 用户端微信小程序 — 下单、追踪、积分商城 |
| [`uni-collector/`](./uni-collector/) | Vue 3, TypeScript, UniApp, Wot Design | 回收员端微信小程序 — 接单、完成、提现 |
| [`green-recycle-admin/`](./green-recycle-admin/) | React 19, TypeScript, Tailwind CSS | 管理后台 Web 端 — 数据大屏、订单管理、财务审核 |


## 核心功能

### 用户端 (uni-user)
- 一键预约上门回收，支持多种可回收物料
- 实时订单追踪与状态推送
- 地址管理（省市区智能解析）
- 积分体系 + 积分商城兑换
- 邀请好友奖励机制
- 订单评价与反馈系统
- 消息通知中心

### 回收员端 (uni-collector)
- 抢单大厅 + 指派订单管理
- 订单完成（称重、杂质率录入）
- 收入统计与佣金提现
- 库存盘点管理
- 个人资料与设置

### 管理后台 (green-recycle-admin)
- 数据统计大屏（订单趋势、收入趋势、物料分布）
- 订单全生命周期管理（创建 → 指派 → 完成 → 结算）
- 物料价格动态管理
- 回收员管理与指派
- 财务审核（提现审批）
- 操作审计日志

### 后端服务 (backend)
- 17 个领域驱动业务模块
- JWT 认证 + 管理员权限控制
- 定时任务调度（订单超时取消、提现超时拒绝）
- 全局请求日志中间件
- Pydantic 严格字段校验
- 数据库事务保护（竞态条件防护）

---

## 项目架构

```
EcoLoop/
├── backend/                  # FastAPI 后端服务
│   ├── app/
│   │   ├── common/           # 公共模块（审计日志、调度器、日志中间件）
│   │   ├── core/             # 核心配置
│   │   ├── modules/          # 17 个业务模块（领域驱动）
│   │   │   ├── auth/         # 认证（微信登录）
│   │   │   ├── users/        # 用户管理
│   │   │   ├── orders/       # 订单管理
│   │   │   ├── materials/    # 物料管理
│   │   │   ├── collectors/   # 回收员管理
│   │   │   ├── withdrawals/  # 提现管理
│   │   │   ├── inventory/    # 库存管理
│   │   │   ├── addresses/    # 地址管理
│   │   │   ├── notifications/# 通知管理
│   │   │   ├── reviews/      # 评价管理
│   │   │   ├── feedback/     # 反馈管理
│   │   │   ├── referrals/    # 推荐奖励
│   │   │   ├── shop/         # 积分商城
│   │   │   ├── geo/          # 地理服务
│   │   │   ├── recycle_points/# 回收站点
│   │   │   ├── config/       # 系统配置
│   │   │   └── admin/        # 管理后台
│   │   ├── registry.py       # 统一路由注册
│   │   └── models.py         # 统一模型导出
│   └── tests/                # 测试用例
├── uni-user/                 # 用户端小程序（Vue 3 + UniApp）
├── uni-collector/            # 回收员端小程序（Vue 3 + UniApp）
└── green-recycle-admin/      # 管理后台（React 19 + Vite）
```

---

## 技术栈

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.10+ | 运行时 |
| FastAPI | 0.100+ | Web 框架 |
| Tortoise ORM | 0.19+ | 异步 ORM |
| FastAPI-Admin | 1.0+ | 管理面板 |
| Pydantic | 2.0+ | 数据校验 |
| Aerich | 0.7+ | 数据库迁移 |
| Pytest | 7.0+ | 单元测试 |
| aioredis | 2.0+ | Redis 缓存 |

### 用户端 & 回收员端
| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5+ | UI 框架 |
| TypeScript | 5.0+ | 类型安全 |
| UniApp | 4.x | 跨端框架 |
| Wot Design Uni | 1.14+ | UI 组件库 |
| Pinia | 3.0+ | 状态管理 |
| Vite | 5.2+ | 构建工具 |
| SCSS | - | 样式预处理 |

### 管理后台
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5.8+ | 类型安全 |
| Vite | 6.2+ | 构建工具 |
| Tailwind CSS | 3.4+ | 原子化样式 |
| Recharts | 3.6+ | 数据可视化 |
| Leaflet | 1.9+ | 地图组件 |
| Lucide React | - | 图标库 |

---

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- Redis（后端 Admin 面板依赖）
- 微信开发者工具（小程序调试）

### 1. 克隆项目

```bash
git clone https://github.com/your-username/ecoloop.git
cd ecoloop
```

### 2. 启动后端

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API 文档: http://localhost:8000/docs
管理面板: http://localhost:8000/admin (admin / admin)

### 3. 启动管理后台

```bash
cd green-recycle-admin
npm install
npm run dev
```

### 4. 启动用户端 / 回收员端

```bash
# 用户端
cd uni-user
npm install
npm run dev:mp-weixin

# 回收员端
cd uni-collector
npm install
npm run dev:mp-weixin
```

使用微信开发者工具导入 `dist/dev/mp-weixin` 目录即可预览。

---

## API 概览

所有接口统一前缀 `/api/v1/`，主要模块：

| 模块 | 路径 | 说明 |
|------|------|------|
| 认证 | `/auth/*` | 微信登录、Token 签发 |
| 用户 | `/users/*` | 用户信息、积分、统计 |
| 订单 | `/orders/*` | CRUD、指派、完成、取消 |
| 物料 | `/materials/*` | 物料列表、价格历史 |
| 回收员 | `/collectors/*` | 注册、抢单、统计 |
| 提现 | `/withdrawals/*` | 申请、审核、记录 |
| 地址 | `/addresses/*` | CRUD、默认地址 |
| 库存 | `/inventory/*` | 入库、出库、盘点 |
| 通知 | `/notifications/*` | 消息列表、已读标记 |
| 评价 | `/reviews/*` | 订单评价 |
| 反馈 | `/feedback/*` | 用户反馈 |
| 推荐 | `/referrals/*` | 邀请码、绑定、统计 |
| 商城 | `/shop/*` | 商品列表、积分兑换 |
| 管理 | `/admin/*` | 登录、仪表盘、审计日志 |

---

## 开发规范

- 后端遵循 **Router → Service → Model** 三层架构
- 前端遵循 **Container + Composable + Dumb Component** 模式
- 所有代码注释使用中文
- TypeScript 严格模式，零 `any` 泄漏
- Pydantic Schema 严格字段校验
- 数据库操作使用事务保护关键路径

---

## 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

<div align="center">

**EcoLoop** — 让回收更简单，让地球更绿色

</div>
