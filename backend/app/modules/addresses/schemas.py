"""地址 Schema"""
from pydantic import BaseModel, Field


class AddressCreate(BaseModel):
    user_id: int = Field(..., gt=0)
    receiver_name: str = Field(..., min_length=2, max_length=50)
    receiver_phone: str = Field(..., pattern=r"^1[3-9]\d{9}$")
    province: str = Field(..., min_length=2)
    city: str = Field(..., min_length=2)
    # ⚠️8修复: district 允许为空（前端正则解析可能无法提取区县）
    district: str = Field("", min_length=0)
    detail: str = Field(..., min_length=5, max_length=255)
    is_default: bool = False


class AddressResponse(AddressCreate):
    id: int
