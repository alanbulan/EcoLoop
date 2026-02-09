"""管理后台鉴权依赖"""
import hashlib
import time

from fastapi import HTTPException, Header

from app.core.config import settings


def _generate_admin_token() -> str:
    """基于 SECRET_KEY + 时间戳生成简单 token（有效期 24 小时）"""
    ts = str(int(time.time()) // 86400)
    raw = f"{settings.SECRET_KEY}:{settings.ADMIN_USERNAME}:{ts}"
    return hashlib.sha256(raw.encode()).hexdigest()


def _verify_admin_token(token: str) -> bool:
    """验证 admin token（当天和前一天的 token 都有效，避免跨天失效）"""
    for offset in [0, -1]:
        ts = str(int(time.time()) // 86400 + offset)
        raw = f"{settings.SECRET_KEY}:{settings.ADMIN_USERNAME}:{ts}"
        expected = hashlib.sha256(raw.encode()).hexdigest()
        if token == expected:
            return True
    return False


async def require_admin(authorization: str = Header(default="")):
    """管理后台鉴权依赖，从 Authorization header 提取 Bearer token"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未登录")
    token = authorization[7:]
    if not _verify_admin_token(token):
        raise HTTPException(status_code=401, detail="登录已过期，请重新登录")
