"""物料定价服务"""
from decimal import Decimal

from .model import PricingRule


class PricingService:
    @staticmethod
    async def calculate_final_amount(order, actual_weight: float, impurity_percent: float = 0.0) -> dict:
        """
        计算订单最终金额:
        1. 基础金额 = 重量 × 单价快照
        2. 杂质扣减
        3. 阶梯奖金（取最高优先级规则）
        """
        weight = Decimal(str(actual_weight))
        unit_price = order.unit_price_snapshot or Decimal('0.00')
        impurity = Decimal(str(impurity_percent))

        # 基础金额
        base_amount = (weight * unit_price).quantize(Decimal('0.01'))

        # 杂质扣减
        deduction_amount = (base_amount * (impurity / Decimal('100.0'))).quantize(Decimal('0.01'))
        after_deduction = base_amount - deduction_amount

        # 阶梯奖金 — 只取最高优先级规则
        bonus_amount = Decimal('0.00')
        if not order.material_id:
            await order.fetch_related('material')

        if order.material_id:
            rules = await PricingRule.filter(
                material_id=order.material_id,
                min_weight__lte=float(weight)
            ).order_by('-priority').limit(1)

            if rules:
                rule = rules[0]
                bonus_amount = (after_deduction * (rule.bonus_percent / Decimal('100.0'))).quantize(Decimal('0.01'))

        final_amount = (after_deduction + bonus_amount).quantize(Decimal('0.01'))

        return {
            "final_amount": final_amount,
            "bonus_amount": bonus_amount,
            "deduction_amount": deduction_amount,
        }
