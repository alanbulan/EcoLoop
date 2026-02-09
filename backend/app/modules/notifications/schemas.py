"""消息通知 Schema"""
from pydantic import BaseModel, Field


class CreateNotificationSchema(BaseModel):
    """创建通知（内部调用，非用户直接调用）"""
    user_id: int = Field(..., gt=0)
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)
    type: str = Field("system", pattern=r"^(order|withdrawal|system|promotion)$")
    related_entity_type: str | None = None
    related_entity_id: int | None = None
