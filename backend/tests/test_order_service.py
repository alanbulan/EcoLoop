"""
订单结算核心业务逻辑测试
覆盖: OrderService.settle_order 全流程
"""
import pytest
from decimal import Decimal

from app.modules.users.model import User
from app.modules.materials.model import Material, PricingRule
from app.modules.collectors.model import Collector
from app.modules.orders.model import Order
from app.modules.orders.service import OrderService
from app.modules.inventory.model import Inventory


@pytest.mark.asyncio
async def test_settle_order_basic():
    """基础结算: 无杂质、无阶梯奖金"""
    user = await User.create(openid="test_u1", full_name="测试用户", password="x")
    mat = await Material.create(
        name="废纸", category="Paper",
        current_price=Decimal("1.50"), market_price=Decimal("1.80"), unit="kg",
    )
    collector = await Collector.create(name="回收员A", phone="13800000001")
    order = await Order.create(
        user=user, material=mat, address="测试地址",
        status="scheduled", unit_price_snapshot=Decimal("1.50"),
        collector=collector,
    )

    result = await OrderService.settle_order(order, actual_weight=10.0, impurity_percent=0.0)

    assert result.status == "completed"
    assert result.weight_actual == 10.0
    # 10 * 1.50 = 15.00
    assert result.amount_final == Decimal("15.00")

    # 验证用户余额和积分
    user = await User.get(id=user.id)
    assert user.balance == Decimal("15.00")
    assert user.points == 100  # 10kg * 10

    # 验证回收员佣金 (10%)
    collector = await Collector.get(id=collector.id)
    assert collector.balance == Decimal("1.50")

    # 验证库存入库
    inv = await Inventory.get(material_id=mat.id)
    assert inv.weight == Decimal("10.00")


@pytest.mark.asyncio
async def test_settle_order_with_impurity():
    """杂质扣减测试"""
    user = await User.create(openid="test_u2", full_name="测试用户2", password="x")
    mat = await Material.create(
        name="塑料", category="Plastic",
        current_price=Decimal("2.00"), market_price=Decimal("2.50"), unit="kg",
    )
    order = await Order.create(
        user=user, material=mat, address="测试地址",
        status="scheduled", unit_price_snapshot=Decimal("2.00"),
    )

    result = await OrderService.settle_order(order, actual_weight=20.0, impurity_percent=10.0)

    # 基础: 20 * 2.00 = 40.00
    # 杂质扣减: 40.00 * 10% = 4.00
    # 最终: 40.00 - 4.00 = 36.00
    assert result.amount_final == Decimal("36.00")
    assert result.impurity_deduction_percent == 10.0


@pytest.mark.asyncio
async def test_settle_order_with_bonus():
    """阶梯奖金测试"""
    user = await User.create(openid="test_u3", full_name="测试用户3", password="x")
    mat = await Material.create(
        name="金属", category="Metal",
        current_price=Decimal("5.00"), market_price=Decimal("6.00"), unit="kg",
    )
    # 创建阶梯规则: 满 10kg 奖励 5%
    await PricingRule.create(
        material=mat, name="满10kg奖励",
        min_weight=Decimal("10.0"), bonus_percent=Decimal("5.0"), priority=1,
    )

    order = await Order.create(
        user=user, material=mat, address="测试地址",
        status="scheduled", unit_price_snapshot=Decimal("5.00"),
    )

    result = await OrderService.settle_order(order, actual_weight=15.0, impurity_percent=0.0)

    # 基础: 15 * 5.00 = 75.00
    # 奖金: 75.00 * 5% = 3.75
    # 最终: 75.00 + 3.75 = 78.75
    assert result.amount_final == Decimal("78.75")
    assert result.applied_bonus_amount == Decimal("3.75")
