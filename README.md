<div align="center">

# EcoLoop

连接用户、回收员和管理端的废品回收业务工作空间。

![FastAPI](https://img.shields.io/badge/API-FastAPI-818cf8?style=flat-square)
![UniApp](https://img.shields.io/badge/Mini_Programs-UniApp-5eead4?style=flat-square)
![React](https://img.shields.io/badge/Admin-React_19-fb7185?style=flat-square)

[工程总览](#工程总览) · [开发启动](#开发启动) · [验证与部署前检查](#验证与部署前检查)

</div>

EcoLoop 包含 Python 后端、用户端小程序、回收员端小程序和 React 管理端。它们是独立的开发工程，不能在一个子目录安装依赖后假定其他端也已就绪。

## 工程总览

| 工程 | 技术与职责 | 配置入口 |
| --- | --- | --- |
| [backend](./backend) | FastAPI、Tortoise ORM，业务接口及内嵌管理面板 | [app/main.py](./backend/app/main.py) |
| [uni-user](./uni-user) | Vue / UniApp，用户预约、记录与积分界面 | [package.json](./uni-user/package.json) |
| [uni-collector](./uni-collector) | Vue / UniApp，回收员订单与执行界面 | [package.json](./uni-collector/package.json) |
| [green-recycle-admin](./green-recycle-admin) | React 管理端，订单、统计与业务管理 | [package.json](./green-recycle-admin/package.json) |

用户与回收员端的 UniApp 依赖使用不同的精确发行版本；不要按旧文档的统一版本表直接覆盖两端。管理端当前只有 dev/build/preview 脚本，不能把它的构建当作单元测试。

## 开发启动

```sh
git clone https://github.com/alanbulan/EcoLoop.git
cd EcoLoop
```

准备独立开发数据库和 Redis、兼容各 manifest 的 Python/Node 环境，以及微信开发者工具。下面每个代码块均从仓库根目录打开一个新终端执行；不要在 backend 目录里继续寻找前端子目录。

```sh
# 终端一：后端；先激活自己的 Python 虚拟环境
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

```sh
# 终端二：Web 管理端
cd green-recycle-admin
npm install
npm run dev
```

```sh
# 终端三：用户小程序
cd uni-user
npm install
npm run dev:mp-weixin
```

```sh
# 终端四：回收员小程序
cd uni-collector
npm install
npm run dev:mp-weixin
```

依赖安装优先遵循各子工程已有锁文件和包管理器。小程序使用微信开发者工具导入各自构建出的 `dist/dev/mp-weixin`，设置自己有权限的 AppID、API 地址及合法域名；真机 localhost 不等于开发电脑地址。

后端文档默认开发地址为 `http://127.0.0.1:8000/docs`。API 与内嵌 `/admin` 不等于 React 管理端；两者认证行为和访问控制要分别验证。

## 验证与部署前检查

**当前源码仍有必须处理的开发认证问题：** `backend/app/main.py` 的 `AdminLoginProvider.login` 使用固定的开发账号判断，没有在这里验证真实用户密码。本次只发现并明确记录，没有修改认证流程或宣称已修复；不要将该管理面板公开部署。上线前应接入密码哈希校验、真正的管理员身份与权限，并验证会话与失败行为。

后端启动会启动订单与提现相关定时任务，不能对生产数据库随意启动开发实例。涉及金额、订单状态和提现时，先使用虚构业务数据，避免定时任务改变真实状态。

| 层次 | 可执行检查或验收目标 |
| --- | --- |
| 用户/回收员类型 | 在各端执行 `npm run type-check` |
| 小程序构建 | 在各端执行 `npm run build:mp-weixin` |
| React 管理端构建 | `npm run build`；不等同于测试和类型检查全通过 |
| 后端业务 | 用户隔离、订单重复提交、状态转换、回收员权限与异常回滚 |
| 业务闭环 | 预约、接单、完成、取消、积分与财务状态的一致性 |
| 基础设施 | Redis 失效、数据库连接、调度任务重复执行、日志脱敏 |

本次核对了原 README、两端 UniApp 脚本、管理端 manifest 与后端入口；没有安装或运行应用、启动 Redis/数据库、执行财务操作或上传小程序。

## 维护与来源

完整历史功能清单可在 Git 历史中查看。保留原项目及依赖的署名与授权文件，不把依赖版本、任务入口或界面按钮的存在当作商业可交付证明。提交问题时附最小脱敏记录、实际工作目录和命令，不上传真实地址、手机或订单数据。
