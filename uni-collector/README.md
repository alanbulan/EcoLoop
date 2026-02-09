<div align="center">

# EcoLoop Collector

**智能废品回收平台 — 回收员端小程序**

[![Vue](https://img.shields.io/badge/Vue-3.5+-4FC08D.svg)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://typescriptlang.org)
[![UniApp](https://img.shields.io/badge/UniApp-4.x-2B9939.svg)](https://uniapp.dcloud.net.cn)
[![Wot Design](https://img.shields.io/badge/Wot_Design_Uni-1.14+-FF6A00.svg)](https://wot-design-uni.pages.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)

</div>

---

## 简介

EcoLoop Collector 是面向回收员的微信小程序工作台，提供抢单大厅、订单管理、收入统计、库存盘点、佣金提现等功能，帮助回收员高效完成回收任务。

## 功能页面

| 页面 | 路径 | 功能 |
|------|------|------|
| 工作台 | `/pages/index` | 抢单大厅 + 我的订单（双 Tab 切换） |
| 库存管理 | `/pages/inventory` | 库存列表、入库/出库操作 |
| 个人中心 | `/pages/profile` | 回收员信息、统计数据、功能入口 |
| 钱包 | `/pages/wallet` | 佣金余额、提现申请、提现记录 |
| 数据统计 | `/pages/stats` | 回收数据统计 |
| 个人信息 | `/pages/user-info` | 编辑个人资料 |
| 设置 | `/pages/settings` | 应用设置 |
| 关于 | `/pages/about` | 应用信息、版本 |

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5+ | UI 框架（Script Setup） |
| TypeScript | 5.0+ | 类型安全 |
| UniApp | 4.x | 跨端框架（微信小程序） |
| Wot Design Uni | 1.14+ | UI 组件库 |
| Pinia | 3.0+ | 全局状态管理 |
| Vite | 5.2+ | 构建工具 |
| SCSS | - | 样式预处理 |

## 项目结构

```
uni-collector/
├── src/
│   ├── api/                   # API 层（OpenAPI 生成）
│   │   ├── core/              # 请求核心
│   │   ├── models/            # 数据模型类型
│   │   └── services/          # API 服务
│   │       ├── AuthService.ts
│   │       ├── CollectorService.ts
│   │       ├── ConfigService.ts
│   │       ├── DefaultService.ts
│   │       └── InventoryService.ts
│   ├── composables/           # 全局 Composables
│   │   └── useHttpInterceptor.ts
│   ├── pages/                 # 页面（自包含）
│   │   ├── index/
│   │   │   ├── index.vue
│   │   │   └── composables/
│   │   │       └── useOrderList.ts
│   │   ├── inventory/
│   │   │   ├── inventory.vue
│   │   │   └── composables/
│   │   │       └── useInventory.ts
│   │   ├── profile/
│   │   │   ├── profile.vue
│   │   │   └── composables/
│   │   │       └── useProfile.ts
│   │   ├── wallet/
│   │   │   ├── wallet.vue
│   │   │   └── composables/
│   │   │       └── useWallet.ts
│   │   └── ...
│   ├── stores/                # Pinia 状态仓库
│   │   ├── user.ts
│   │   └── config.ts
│   ├── static/                # 静态资源
│   ├── styles/
│   │   └── variables.scss     # 设计令牌
│   ├── utils/
│   │   └── location.ts       # 定位工具
│   ├── pages.json             # 路由配置
│   ├── manifest.json          # 小程序配置
│   ├── App.vue                # 根组件（路由守卫）
│   └── main.ts               # 入口
├── package.json
├── tsconfig.json
└── vite.config.ts
```

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
