"""提现业务逻辑 Service"""
from decimal import Decimal

from fastapi import HTTPException

from app.core.config import settings
from app.common.audit_log import AuditLog
from app.modules.collectors.model import Collector
from app.modules.notifications.service import NotificationService
from app.modules.orders.model import Order
from app.modules.users.model import User

from .model import Withdrawal


class WithdrawalService:

    @staticmethod
    async def create_user_withdrawal(
        user_id: int, amount: float, channel: str, order_id: int | None = None
    ) -> Withdrawal:
        """用户提现（可关联订单，也可不关联）"""
        if amount > settings.MAX_WITHDRAWAL_AMOUNT:
            raise HTTPException(status_code=400, detail=f"单笔提现不能超过 {settings.MAX_WITHDRAWAL_AMOUNT} 元")

        user = await User.get_or_none(id=user_id)
        if not user or user.balance < Decimal(str(amount)):
            raise HTTPException(status_code=400, detail="余额不足")

        # 订单关联校验（可选）
        if order_id:
            order = await Order.get_or_none(id=order_id)
            if not order:
                raise HTTPException(status_code=404, detail="订单不存在")
            if order.user_id != user_id:
                raise HTTPException(status_code=400, detail="订单不属于该用户")
            if order.status != "completed":
                raise HTTPException(status_code=400, detail="订单未完成")
            if await Withdrawal.get_or_none(order_id=order.id):
                raise HTTPException(status_code=400, detail="该订单已有提现记录")

        # 扣减余额
        user.balance -= Decimal(str(amount))
        await user.save()

        w = await Withdrawal.create(
            user=user, order_id=order_id, amount=amount,
            status="pending", channel=channel,
        )
        await AuditLog.create(
            entity_type="withdrawal", entity_id=w.id,
            action="created", new_value=str(amount),
            operator_type="user", operator_id=user.id,
        )
        return w

    @staticmethod
    async def create_collector_withdrawal(
        collector_id: int, amount: float, channel: str
    ) -> dict:
        """回收员佣金提现 — 从 Collector.balance 扣款，关联 User 创建 Withdrawal"""
        if amount > settings.MAX_WITHDRAWAL_AMOUNT:
            raise HTTPException(status_code=400, detail=f"单笔提现不能超过 {settings.MAX_WITHDRAWAL_AMOUNT} 元")

        collector = await Collector.get_or_none(id=collector_id)
        if not collector:
            raise HTTPException(status_code=404, detail="回收员不存在")
        if collector.balance < Decimal(str(amount)):
            raise HTTPException(status_code=400, detail="佣金余额不足")
        if not collector.user_id:
            raise HTTPException(status_code=400, detail="回收员未关联用户账号")

        user = await User.get(id=collector.user_id)

        collector.balance -= Decimal(str(amount))
        await collector.save()

        w = await Withdrawal.create(
            user=user, order_id=None, amount=amount,
            status="pending", channel=channel,
        )
        await AuditLog.create(
            entity_type="withdrawal", entity_id=w.id,
            action="created", new_value=f"回收员佣金提现 {amount}",
            operator_type="collector", operator_id=collector.id,
        )
        return {"id": w.id, "amount": float(w.amount), "status": w.status}

    @staticmethod
    async def approve_withdrawal(withdrawal_id: int) -> dict:
        """管理员审批通过提现"""
        w = await Withdrawal.get_or_none(id=withdrawal_id)
        if not w:
            raise HTTPException(status_code=404, detail="提现记录不存在")
        if w.status != "pending":
            raise HTTPException(status_code=400, detail="该提现已处理")

        w.status = "approved"
        await w.save()
        await AuditLog.create(
            entity_type="withdrawal", entity_id=w.id,
            action="approved", operator_type="admin",
        )
        # 通知用户提现已通过
        await NotificationService.send(
            user_id=w.user_id,
            title="提现已通过",
            content=f"您的提现申请（¥{float(w.amount):.2f}）已审批通过，请留意到账。",
            type="withdrawal",
            related_entity_type="withdrawal",
            related_entity_id=w.id,
        )
        return {"message": "已通过"}

    @staticmethod
    async def reject_withdrawal(withdrawal_id: int, reason: str) -> dict:
        """管理员拒绝提现 — 退还余额"""
        w = await Withdrawal.get_or_none(id=withdrawal_id).prefetch_related("user")
        if not w:
            raise HTTPException(status_code=404, detail="提现记录不存在")
        if w.status != "pending":
            raise HTTPException(status_code=400, detail="该提现已处理")

        w.status = "rejected"
        await w.save()

        w.user.balance += w.amount
        await w.user.save()

        await AuditLog.create(
            entity_type="withdrawal", entity_id=w.id,
            action="rejected", new_value=reason,
            operator_type="admin",
        )
        # 通知用户提现被拒绝
        await NotificationService.send(
            user_id=w.user_id,
            title="提现被拒绝",
            content=f"您的提现申请（¥{float(w.amount):.2f}）未通过审核，原因：{reason}。金额已退回余额。",
            type="withdrawal",
            related_entity_type="withdrawal",
            related_entity_id=w.id,
        )
        return {"message": "已拒绝，余额已退还"}
