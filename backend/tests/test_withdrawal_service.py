"""
提现业务逻辑测试
覆盖: 余额校验、重复提现、审批/拒绝退款
"""
import pytest
from decimal import Decimal

from fastapi import HTTPException

from app.modules.users.model import User
from app.modules.materials.model import Material
from app.modules.orders.model import Order
from app.modules.withdrawals.model import Withdrawal
from app.modules.withdrawals.service import WithdrawalService


@pytest.mark.asyncio
async def test_create_withdrawal_success():
    """正常提现"""
    user = await User.create(
        openid="w_test1", full_name="提现用户", password="x",
        balance=Decimal("100.00"),
    )
    mat = await Material.create(
        name="废纸", category="Paper",
        current_price=Decimal("1.00"), market_price=Decimal("1.00"), unit="kg",
    )
    order = await Order.create(
        user=user, material=mat, address="地址",
        status="completed", amount_final=Decimal("50.00"),
    )

    w = await WithdrawalService.create_user_withdrawal(
        user_id=user.id, amount=50.0, channel="wechat", order_id=order.id,
    )

    assert w.amount == Decimal("50.00")
    assert w.status == "pending"

    # 验证余额已扣减
    user = await User.get(id=user.id)
    assert user.balance == Decimal("50.00")


@pytest.mark.asyncio
async def test_create_withdrawal_insufficient_balance():
    """余额不足应拒绝"""
    user = await User.create(
        openid="w_test2", full_name="穷用户", password="x",
        balance=Decimal("10.00"),
    )

    with pytest.raises(HTTPException) as exc_info:
        await WithdrawalService.create_user_withdrawal(
            user_id=user.id, amount=100.0, channel="wechat",
        )
    assert exc_info.value.status_code == 400
    assert "余额不足" in exc_info.value.detail


@pytest.mark.asyncio
async def test_duplicate_order_withdrawal():
    """同一订单不能重复提现"""
    user = await User.create(
        openid="w_test3", full_name="重复提现", password="x",
        balance=Decimal("200.00"),
    )
    mat = await Material.create(
        name="塑料", category="Plastic",
        current_price=Decimal("2.00"), market_price=Decimal("2.00"), unit="kg",
    )
    order = await Order.create(
        user=user, material=mat, address="地址",
        status="completed", amount_final=Decimal("80.00"),
    )

    # 第一次提现成功
    await WithdrawalService.create_user_withdrawal(
        user_id=user.id, amount=80.0, channel="wechat", order_id=order.id,
    )

    # 第二次应失败
    with pytest.raises(HTTPException) as exc_info:
        await WithdrawalService.create_user_withdrawal(
            user_id=user.id, amount=80.0, channel="wechat", order_id=order.id,
        )
    assert "已有提现记录" in exc_info.value.detail


@pytest.mark.asyncio
async def test_approve_withdrawal():
    """审批通过"""
    user = await User.create(
        openid="w_test4", full_name="审批用户", password="x",
        balance=Decimal("100.00"),
    )
    w = await WithdrawalService.create_user_withdrawal(
        user_id=user.id, amount=50.0, channel="wechat",
    )

    result = await WithdrawalService.approve_withdrawal(w.id)
    assert result["message"] == "已通过"

    w = await Withdrawal.get(id=w.id)
    assert w.status == "approved"


@pytest.mark.asyncio
async def test_reject_withdrawal_refund():
    """拒绝提现应退还余额"""
    user = await User.create(
        openid="w_test5", full_name="拒绝用户", password="x",
        balance=Decimal("100.00"),
    )
    w = await WithdrawalService.create_user_withdrawal(
        user_id=user.id, amount=60.0, channel="wechat",
    )

    # 提现后余额 40
    user = await User.get(id=user.id)
    assert user.balance == Decimal("40.00")

    result = await WithdrawalService.reject_withdrawal(w.id, "测试拒绝")
    assert result["message"] == "已拒绝，余额已退还"

    # 余额应恢复到 100
    user = await User.get(id=user.id)
    assert user.balance == Decimal("100.00")
