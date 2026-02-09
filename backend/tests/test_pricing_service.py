"""
定价服务测试
覆盖: 基础计算、杂质扣减、阶梯奖金、无规则场景
"""
import pytest
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

from app.modules.materials.model import Material, PricingRule
from app.modules.materials.service import PricingService
from app.modules.users.model import User
from app.modules.orders.model import Order


@pytest.mark.asyncio
async def test_basic_pricing():
    """基础定价: 重量 × 单价"""
    user = await User.create(openid="p_test1", full_name="定价测试", password="x")
    mat = await Material.create(
        name="废纸", category="Paper",
        current_price=Decimal("1.00"), market_price=Decimal("1.00"), unit="kg",
    )
    order = await Order.create(
        user=user, material=mat, address="地址",
        status="scheduled", unit_price_snapshot=Decimal("1.00"),
    )

    result = await PricingService.calculate_final_amount(order, 10.0, 0.0)

    assert result["final_amount"] == Decimal("10.00")
    assert result["bonus_amount"] == Decimal("0.00")
    assert result["deduction_amount"] == Decimal("0.00")


@pytest.mark.asyncio
async def test_pricing_with_impurity():
    """杂质扣减计算"""
    user = await User.create(openid="p_test2", full_name="杂质测试", password="x")
    mat = await Material.create(
        name="塑料", category="Plastic",
        current_price=Decimal("2.00"), market_price=Decimal("2.00"), unit="kg",
    )
    order = await Order.create(
        user=user, material=mat, address="地址",
        status="scheduled", unit_price_snapshot=Decimal("2.00"),
    )

    result = await PricingService.calculate_final_amount(order, 10.0, 20.0)

    # 基础: 10 * 2.00 = 20.00
    # 扣减: 20.00 * 20% = 4.00
    # 最终: 20.00 - 4.00 = 16.00
    assert result["deduction_amount"] == Decimal("4.00")
    assert result["final_amount"] == Decimal("16.00")


@pytest.mark.asyncio
async def test_pricing_with_bonus_rule():
    """阶梯奖金规则"""
    user = await User.create(openid="p_test3", full_name="奖金测试", password="x")
    mat = await Material.create(
        name="金属", category="Metal",
        current_price=Decimal("3.00"), market_price=Decimal("3.00"), unit="kg",
    )
    # 满 5kg 奖励 10%
    await PricingRule.create(
        material=mat, name="满5kg奖励",
        min_weight=Decimal("5.0"), bonus_percent=Decimal("10.0"), priority=1,
    )
    # 满 20kg 奖励 15%（更高优先级）
    await PricingRule.create(
        material=mat, name="满20kg奖励",
        min_weight=Decimal("20.0"), bonus_percent=Decimal("15.0"), priority=2,
    )

    order = await Order.create(
        user=user, material=mat, address="地址",
        status="scheduled", unit_price_snapshot=Decimal("3.00"),
    )

    # 10kg — 应命中 5kg 规则（10% 奖金）
    result = await PricingService.calculate_final_amount(order, 10.0, 0.0)
    # 基础: 30.00, 奖金: 30.00 * 10% = 3.00, 最终: 33.00
    assert result["bonus_amount"] == Decimal("3.00")
    assert result["final_amount"] == Decimal("33.00")


@pytest.mark.asyncio
async def test_pricing_high_priority_rule():
    """高优先级规则优先"""
    user = await User.create(openid="p_test4", full_name="优先级测试", password="x")
    mat = await Material.create(
        name="衣物", category="Clothes",
        current_price=Decimal("1.00"), market_price=Decimal("1.00"), unit="kg",
    )
    await PricingRule.create(
        material=mat, name="低优先级",
        min_weight=Decimal("5.0"), bonus_percent=Decimal("5.0"), priority=1,
    )
    await PricingRule.create(
        material=mat, name="高优先级",
        min_weight=Decimal("5.0"), bonus_percent=Decimal("20.0"), priority=10,
    )

    order = await Order.create(
        user=user, material=mat, address="地址",
        status="scheduled", unit_price_snapshot=Decimal("1.00"),
    )

    result = await PricingService.calculate_final_amount(order, 10.0, 0.0)
    # 应取 priority=10 的 20% 奖金
    # 基础: 10.00, 奖金: 10.00 * 20% = 2.00
    assert result["bonus_amount"] == Decimal("2.00")
    assert result["final_amount"] == Decimal("12.00")
