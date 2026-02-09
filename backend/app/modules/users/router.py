"""用户路由"""
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, HTTPException

from .model import User
from .schemas import User_Pydantic
from app.modules.orders.model import Order

router = APIRouter(tags=["users"])


@router.get("/users/{user_id}/points")
async def get_user_points(user_id: int):
    """积分以 User.points 为唯一权威来源"""
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    total_points = user.points
    completed_orders = await Order.filter(user_id=user_id, status="completed").order_by("-date").limit(10)

    today_points = 0
    for o in completed_orders:
        if o.date.date() == date.today():
            today_points += int((o.weight_actual or 0) * 10)

    return {
        "current_points": total_points,
        "today_points": today_points,
        "total_points": total_points,
        "history": [
            {
                "reason": f"回收奖励 - 订单#{o.id}",
                "date": o.date.strftime("%Y-%m-%d %H:%M"),
                "amount": int((o.weight_actual or 0) * 10),
                "type": "in",
            }
            for o in completed_orders[:5]
        ],
    }


@router.get("/users/{user_id}", response_model=User_Pydantic)
async def get_user(user_id: int):
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return await User_Pydantic.from_tortoise_orm(user)


@router.get("/users/{user_id}/stats")
async def get_user_stats(user_id: int):
    completed_orders = await Order.filter(user_id=user_id, status="completed")
    recycle_count = len(completed_orders)
    total_weight = sum(o.weight_actual or Decimal("0") for o in completed_orders)
    total_earnings = sum(o.amount_final or Decimal("0") for o in completed_orders)

    return {
        "carbon_offset": float(total_weight) * 2.5,
        "recycle_count": recycle_count,
        "total_earnings": float(total_earnings),
    }
