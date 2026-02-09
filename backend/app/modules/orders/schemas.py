"""订单 Schema"""
from pydantic import BaseModel, Field
from tortoise.contrib.pydantic import pydantic_model_creator
from .model import Order

Order_Pydantic = pydantic_model_creator(Order, name="Order")


class CreateOrderSchema(BaseModel):
    user_id: int = Field(..., gt=0)
    material_id: int = Field(..., gt=0)
    address: str = Field(..., min_length=5, max_length=255)
    estimated_weight: float = Field(0.0, ge=0.0)
    appointment_time: str | None = None
    remark: str | None = Field(None, max_length=500)


class AssignOrderSchema(BaseModel):
    collector_id: int = Field(..., gt=0, description="回收员ID")


class ClaimOrderSchema(BaseModel):
    collector_id: int = Field(..., gt=0, description="回收员ID")


class CompleteOrderSchema(BaseModel):
    actual_weight: float = Field(..., gt=0, description="实际称重(kg)")
    impurity_percent: float = Field(0.0, ge=0.0, le=100.0, description="杂质扣减百分比")
