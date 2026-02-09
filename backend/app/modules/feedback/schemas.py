"""反馈 Schema — I3修复: 替代 raw dict 输入"""
from pydantic import BaseModel, Field


class CreateFeedbackSchema(BaseModel):
    """创建反馈请求"""
    user_id: int | None = Field(None, gt=0, description="用户ID")
    contact: str = Field("", max_length=100, description="联系方式")
    content: str = Field(..., min_length=1, max_length=2000, description="反馈内容")
