"""提现 Schema"""
from pydantic import BaseModel, Field
from tortoise.contrib.pydantic import pydantic_model_creator
from .model import Withdrawal

Withdrawal_Pydantic = pydantic_model_creator(Withdrawal, name="Withdrawal")


class CreateWithdrawalSchema(BaseModel):
    user_id: int = Field(..., gt=0)
    amount: float = Field(..., gt=0)
    channel: str = "wechat"
    order_id: int | None = Field(None, gt=0)


class CollectorWithdrawalSchema(BaseModel):
    collector_id: int = Field(..., gt=0)
    amount: float = Field(..., gt=0)
    channel: str = "wechat"
