import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgres://postgres:123456@localhost:5432/green_recycle"
    SECRET_KEY: str = "dev-secret-key"
    REDIS_URL: str = "redis://localhost:6379/0"
    # P2修复: CORS 允许的前端域名列表，生产环境通过 .env 配置
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    # P1修复: 微信小程序配置，从 .env 读取，避免硬编码
    WX_APP_ID: str = "YOUR_APP_ID"
    WX_APP_SECRET: str = "YOUR_APP_SECRET"
    # ⚠️4修复: 管理后台账号密码，生产环境通过 .env 配置
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin"
    # ⚠️3修复: 单笔提现上限（元）
    MAX_WITHDRAWAL_AMOUNT: float = 5000.0
    
    class Config:
        env_file = ".env"

settings = Settings()
