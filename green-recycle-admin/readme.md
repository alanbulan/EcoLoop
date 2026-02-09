<div align="center">

# EcoLoop Admin

**智能废品回收平台 — 管理后台**

[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6.svg)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2+-646CFF.svg)](https://vite.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4+-06B6D4.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)

</div>

---

## 简介

EcoLoop Admin 是面向平台运营人员的 Web 管理后台，提供数据大屏、订单管理、物料价格管理、回收员管理、财务审核等核心运营功能。

## 功能模块

| 模块 | 说明 |
|------|------|
| 数据大屏 | 概览指标卡片、30天订单趋势、收入趋势折线图、物料分布饼图 |
| 订单管理 | 订单列表、状态筛选、指派回收员、查看详情 |
| 价格管理 | 物料价格 CRUD、实时生效 |
| 回收员管理 | 回收员列表、状态管理 |
| 财务管理 | 提现申请审核（通过/拒绝）、搜索筛选 |
| 审计日志 | 操作记录查询、时间范围筛选 |

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5.8+ | 类型安全 |
| Vite | 6.2+ | 构建工具 |
| Tailwind CSS | 3.4+ | 原子化样式 |
| Recharts | 3.6+ | 数据可视化（折线图、饼图） |
| Leaflet | 1.9+ | 地图组件 |
| React Leaflet | 5.0+ | React 地图封装 |
| Lucide React | - | 图标库 |

## 项目结构

```
green-recycle-admin/
├── api/
│   ├── client.ts              # Axios 封装（拦截器、Token 注入）
│   └── services/              # API 服务层
│       ├── admin.ts           # 管理接口
│       ├── orders.ts          # 订单接口
│       ├── materials.ts       # 物料接口
│       └── collectors.ts      # 回收员接口
├── components/                # 页面组件
│   ├── Dashboard.tsx          # 数据大屏
│   ├── OrderManagement.tsx    # 订单管理
│   ├── PriceManagement.tsx    # 价格管理
│   ├── FinanceManagement.tsx  # 财务管理
│   ├── AuditLogManagement.tsx # 审计日志
│   ├── LoginPage.tsx          # 登录页
│   └── MapWidget.tsx          # 地图组件
├── hooks/                     # 自定义 Hooks（业务逻辑抽离）
│   ├── useAuth.ts             # 认证状态
│   ├── useOrders.ts           # 订单逻辑
│   ├── useMaterialPrices.ts   # 价格逻辑
│   ├── useFinance.ts          # 财务逻辑
│   ├── useCollectors.ts       # 回收员逻辑
│   ├── useDashboardData.ts    # 大屏数据
│   ├── useAuditLogs.ts        # 审计日志
│   ├── useLoginForm.ts        # 登录表单
│   └── useNavigation.ts       # 导航状态
├── types.ts                   # 全局类型定义
├── constants.ts               # 常量配置
├── formatters.ts              # 格式化工具
├── App.tsx                    # 根组件
├── index.tsx                  # 入口文件
└── index.html                 # HTML 模板
```

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

默认登录凭据: `admin` / `admin`

## 环境变量

在 `.env.local` 中配置：

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE_URL` | 后端 API 地址 |

---

<div align="center">

[返回项目主页](../README.md)

</div>
