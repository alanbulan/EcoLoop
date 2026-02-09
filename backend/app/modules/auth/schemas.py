"""认证 Schema"""
from typing import Optional

from pydantic import BaseModel


class WxLoginSchema(BaseModel):
    code: str


class LoginResponse(BaseModel):
    user_id: int
    openid: str
    is_new: bool
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    # 登录时返回回收员 ID（如果该用户关联了回收员身份）
    collector_id: Optional[int] = None
