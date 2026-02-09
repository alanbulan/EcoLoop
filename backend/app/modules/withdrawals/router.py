"""提现路由 — 路由层只负责参数校验和调用 service"""
from fastapi import APIRouter, Body, Depends
from tortoise.transactions import atomic

from app.modules.admin.dependencies import require_admin
from app.modules.collectors.model import Collector

from .model import Withdrawal
from .schemas import CollectorWithdrawalSchema, CreateWithdrawalSchema, Withdrawal_Pydantic
from .service import WithdrawalService

router = APIRouter(tags=["withdrawals"])


@router.get("/withdrawals")
async def get_user_withdrawals(user_id: int, limit: int = 100, offset: int = 0):
    """用户查看自己的提现记录"""
    withdrawals = (
        await Withdrawal.filter(user_id=user_id)
        .prefetch_related("user", "order")
        .order_by("-request_date")
        .limit(limit).offset(offset)
    )
    return [
        {
            "id": str(w.id),
            "order_id": str(w.order_id) if w.order_id else None,
            "user_id": str(w.user_id),
            "user_name": w.user.full_name or w.user.username or f"用户{w.user_id}",
            "amount": float(w.amount),
            "status": w.status,
            "channel": w.channel,
            "request_date": w.request_date.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for w in withdrawals
    ]


@router.get("/admin/withdrawals", dependencies=[Depends(require_admin)])
async def get_withdrawals():
    """管理后台查看全部提现记录"""
    withdrawals = await Withdrawal.all().prefetch_related("user").order_by("-request_date")
    return [
        {
            "id": str(w.id),
            "order_id": str(w.order_id) if w.order_id else None,
            "user_id": str(w.user_id),
            "user_name": w.user.full_name or w.user.username or f"用户{w.user_id}",
            "amount": float(w.amount),
            "status": w.status,
            "channel": w.channel,
            "request_date": w.request_date.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for w in withdrawals
    ]


@router.post("/withdrawals", response_model=Withdrawal_Pydantic)
@atomic()
async def create_withdrawal(data: CreateWithdrawalSchema):
    """用户发起提现"""
    w = await WithdrawalService.create_user_withdrawal(
        user_id=data.user_id, amount=data.amount,
        channel=data.channel, order_id=data.order_id,
    )
    return await Withdrawal_Pydantic.from_tortoise_orm(w)


@router.put("/admin/withdrawals/{withdrawal_id}/approve", dependencies=[Depends(require_admin)])
@atomic()
async def approve_withdrawal(withdrawal_id: int):
    """管理员审批通过"""
    return await WithdrawalService.approve_withdrawal(withdrawal_id)


@router.put("/admin/withdrawals/{withdrawal_id}/reject", dependencies=[Depends(require_admin)])
@atomic()
async def reject_withdrawal(withdrawal_id: int, reason: str = Body(..., embed=True)):
    """管理员拒绝提现"""
    return await WithdrawalService.reject_withdrawal(withdrawal_id, reason)


# 回收员佣金提现相关端点

@router.get("/collector-withdrawals")
async def get_collector_withdrawals(collector_id: int, limit: int = 100, offset: int = 0):
    """回收员查看自己的提现记录（通过 Collector.user_id 关联 Withdrawal）"""
    collector = await Collector.get_or_none(id=collector_id)
    if not collector or not collector.user_id:
        return []

    withdrawals = (
        await Withdrawal.filter(user_id=collector.user_id)
        .prefetch_related("user")
        .order_by("-request_date")
        .limit(limit).offset(offset)
    )
    return [
        {
            "id": str(w.id),
            "amount": float(w.amount),
            "status": w.status,
            "channel": w.channel,
            "request_date": w.request_date.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for w in withdrawals
    ]


@router.post("/collector-withdrawals")
@atomic()
async def create_collector_withdrawal(data: CollectorWithdrawalSchema):
    """回收员佣金提现"""
    return await WithdrawalService.create_collector_withdrawal(
        collector_id=data.collector_id, amount=data.amount, channel=data.channel,
    )
