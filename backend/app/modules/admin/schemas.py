"""管理后台 Schema"""
from pydantic import BaseModel


class AdminLoginSchema(BaseModel):
    username: str
    password: str
