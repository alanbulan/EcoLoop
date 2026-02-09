<div align="center">

# EcoLoop User

**智能废品回收平台 — 用户端小程序**

[![Vue](https://img.shields.io/badge/Vue-3.4+-4FC08D.svg)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://typescriptlang.org)
[![UniApp](https://img.shields.io/badge/UniApp-4.x-2B9939.svg)](https://uniapp.dcloud.net.cn)
[![Wot Design](https://img.shields.io/badge/Wot_Design_Uni-1.14+-FF6A00.svg)](https://wot-design-uni.pages.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)

</div>

---

## 简介

EcoLoop User 是面向普通用户的微信小程序端，提供废品回收预约、订单追踪、积分商城、邀请奖励等功能，让回收变得简单便捷。

## 功能页面

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | `/pages/index` | 物料分类展示、快捷入口、公告 |
| 预约回收 | `/pages/appointment` | 选择物料、填写地址、提交订单 |
| 订单列表 | `/pages/orders` | 订单状态筛选、评价入口 |
| 订单历史 | `/pages/history` | 历史订单记录 |
| 地址管理 | `/pages/address` | 地址 CRUD、省市区解析 |
| 附近站点 | `/pages/location` | 地图展示回收站点 |
| 消息中心 | `/pages/messages` | 通知列表、已读标记 |
| 积分中心 | `/pages/points` | 积分余额、积分明细 |
| 积分商城 | `/pages/shop` | 商品列表、积分兑换、兑换记录 |
| 邀请好友 | `/pages/referral` | 邀请码、绑定、奖励统计 |
| 个人中心 | `/pages/profile` | 用户信息、钱包、设置入口 |
| 钱包 | `/pages/profile/wallet` | 余额、提现 |
| 关于我们 | `/pages/about` | 应用信息、版本 |
| 功能介绍 | `/pages/about/intro` | 平台功能说明 |
| 隐私协议 | `/pages/about/privacy` | 隐私政策 |
| 意见反馈 | `/pages/about/feedback` | 用户反馈提交 |

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.4+ | UI 框架（Script Setup） |
| TypeScript | 5.0+ | 类型安全 |
| UniApp | 4.x | 跨端框架（微信小程序） |
| Wot Design Uni | 1.14+ | UI 组件库 |
| Pinia | 3.0+ | 全局状态管理 |
| Vite | 5.2+ | 构建工具 |
| SCSS | - | 样式预处理 |

## 项目结构

```
uni-user/
├── src/
│   ├── api/                   # API 层（OpenAPI 生成）
│   │   ├── core/              # 请求核心（拦截器、错误处理）
│   │   ├── models/            # 数据模型类型
│   │   └── services/          # 按模块划分的 API 服务
│   ├── composables/           # 全局 Composables
│   │   └── useHttpInterceptor.ts
│   ├── pages/                 # 页面（每页自包含）
│   │   ├── index/
│   │   │   ├── index.vue      # 容器组件
│   │   │   └── composables/   # 页面级业务逻辑
│   │   │       └── useHome.ts
│   │   ├── orders/
│   │   │   ├── orders.vue
│   │   │   └── composables/
│   │   │       ├── useOrderList.ts
│   │   │       └── useOrderReview.ts
│   │   └── ...
│   ├── stores/                # Pinia 状态仓库
│   │   ├── user.ts            # 用户状态（持久化）
│   │   └── config.ts          # 系统配置
│   ├── static/                # 静态资源（logo、tabbar 图标）
│   ├── styles/
│   │   └── variables.scss     # 设计令牌（颜色、间距、圆角）
│   ├── pages.json             # 路由配置
│   ├── manifest.json          # 小程序配置
│   ├── App.vue                # 根组件（路由守卫）
│   └── main.ts                # 入口
├── openapi.json               # OpenAPI 规范文件
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 架构模式

遵循 **Container + Composable + Dumb Component** 模式：

- `index.vue` — 容器组件，负责数据编排，< 150 行
- `composables/use*.ts` — 业务逻辑抽离，返回响应式数据
- `components/*.vue` — 纯展示组件（如需要）

## 快速开始

```bash
# 安装依赖
npm install

# 微信小程序开发
npm run dev:mp-weixin

# H5 开发
npm run dev:h5

# 类型检查
npm run type-check

# 生产构建
npm run build:mp-weixin
```

使用微信开发者工具导入 `dist/dev/mp-weixin` 目录预览。

---

<div align="center">

[返回项目主页](../README.md)

</div>
