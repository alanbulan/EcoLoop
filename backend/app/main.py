"""EcoLoop 后端入口 — 模块化架构"""
import logging
import os
from contextlib import asynccontextmanager

import aioredis
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_admin.app import app as admin_app
from fastapi_admin.providers.login import UsernamePasswordProvider
from tortoise.contrib.fastapi import register_tortoise

from app.common.logging_middleware import RequestLoggingMiddleware
from app.common.scheduler import SchedulerService
from app.core.config import settings
# 使用新的模块化路由注册
from app.registry import router as api_router
# 导入统一模型（确保 Tortoise ORM 能发现所有模型）
from app.models import User  # noqa: F401

# 导入 fastapi-admin 资源注册
from app.resources import *  # noqa: F401, F403

# 配置结构化日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


class AdminLoginProvider(UsernamePasswordProvider):
    async def login(self, username, password):
        if username == "admin" and password == "admin":
            return True
        return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    redis = aioredis.from_url(settings.REDIS_URL, encoding="utf8", decode_responses=True)

    await admin_app.configure(
        # I8修复: 移除外部 tabler.io URL，使用空字符串（管理后台 logo 非必需）
        logo_url="",
        template_folders=[os.path.join(os.path.dirname(__file__), "templates")],
        providers=[
            AdminLoginProvider(
                login_logo_url="",
                admin_model=User
            )
        ],
        redis=redis,
    )

    # T1: 启动定时任务调度器（订单超时取消、提现超时拒绝）
    await SchedulerService.start()

    yield

    # T1: 停止定时任务调度器
    await SchedulerService.stop()
    await redis.close()


app = FastAPI(
    title="EcoLoop Backend",
    lifespan=lifespan
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求日志中间件
app.add_middleware(RequestLoggingMiddleware)


# 全局异常处理 — 不向客户端泄露内部异常堆栈
logger = logging.getLogger("app.exception")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    # I7修复: print 改为 logging，生产环境不应使用 print
    logger.error(f"未处理异常: {traceback.format_exc()}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error"},
    )


# 注册 API 路由（路径前缀不变）
app.include_router(api_router, prefix="/api/v1")

# 挂载 fastapi-admin
app.mount("/admin", admin_app)

# Tortoise ORM 配置 — modules 指向新的统一模型导出
register_tortoise(
    app,
    db_url=settings.DATABASE_URL,
    modules={"models": ["app.models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)


@app.get("/")
async def root():
    return {"message": "Welcome to EcoLoop API"}
