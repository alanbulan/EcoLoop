"""订单评价 Schema"""
from pydantic import BaseModel, Field


class CreateReviewSchema(BaseModel):
    order_id: int = Field(..., gt=0)
    user_id: int = Field(..., gt=0)
    rating: int = Field(5, ge=1, le=5)
    content: str | None = Field(None, max_length=500)
    tags: str | None = Field(None, max_length=255)
