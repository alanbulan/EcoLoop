"""订单业务逻辑 Service"""
import json
from decimal import Decimal

from app.common.audit_log import AuditLog
from app.modules.collectors.model import Collector
from app.modules.inventory.model import Inventory
from app.modules.materials.service import PricingService
from app.modules.notifications.service import NotificationService
from app.modules.users.model import User

from .model import Order


class OrderService:

    @staticmethod
    async def settle_order(order: Order, actual_weight: float, impurity_percent: float) -> Order:
        """
        订单结算核心流程:
        1. 快照单价兜底
        2. 调用定价服务计算最终金额
        3. 更新用户余额和积分
        4. 计算回收员佣金（10%）
        5. 更新库存
        6. 写入审计日志
        """
        # 1. 单价快照兜底
        if not order.unit_price_snapshot:
            await order.fetch_related("material")
            order.unit_price_snapshot = order.material.current_price if order.material else Decimal("0")

        # 2. 定价计算
        result = await PricingService.calculate_final_amount(order, actual_weight, impurity_percent)

        # 3. 更新订单字段
        order.weight_actual = actual_weight
        order.impurity_deduction_percent = impurity_percent
        order.applied_bonus_amount = result["bonus_amount"]
        order.amount_final = result["final_amount"]
        order.status = "completed"
        await order.save()

        # 4. 更新用户余额和积分
        user = await User.get(id=order.user_id)
        user.balance += result["final_amount"]
        user.points += int(actual_weight * 10)
        await user.save()

        # 5. 回收员佣金（10%）
        if order.collector_id:
            collector = await Collector.get(id=order.collector_id)
            commission = (result["final_amount"] * Decimal("0.1")).quantize(Decimal("0.01"))
            collector.balance += commission
            await collector.save()

        # 6. 库存入库
        inv, _ = await Inventory.get_or_create(material_id=order.material_id)
        inv.weight += Decimal(str(actual_weight))
        await inv.save()

        # 7. 审计日志
        await AuditLog.create(
            entity_type="order", entity_id=order.id,
            action="completed",
            new_value=json.dumps({"weight": actual_weight, "amount": float(result["final_amount"])}),
            operator_type="collector", operator_id=order.collector_id,
        )

        # 8. 发送通知给用户
        await NotificationService.send(
            user_id=order.user_id,
            title="订单已完成",
            content=f"您的回收订单#{order.id}已完成，实际重量{actual_weight}kg，收益¥{float(result['final_amount']):.2f}已到账。",
            type="order",
            related_entity_type="order",
            related_entity_id=order.id,
        )

        return order
