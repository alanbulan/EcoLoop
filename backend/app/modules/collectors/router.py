"""回收员路由"""
import datetime

from fastapi import APIRouter, HTTPException

from .model import Collector
from app.modules.orders.model import Order

router = APIRouter(tags=["collectors"])


@router.get("/collectors/{collector_id}/stats")
async def get_collector_stats(collector_id: int):
    collector = await Collector.get_or_none(id=collector_id)
    if not collector:
        raise HTTPException(status_code=404, detail="Collector not found")

    now = datetime.datetime.now()
    month_orders = await Order.filter(
        collector_id=collector_id, status="completed",
        date__year=now.year, date__month=now.month,
    ).count()

    return {
        "balance": float(collector.balance),
        "rating": collector.rating,
        "month_count": month_orders,
    }


@router.get("/collectors")
async def get_collectors(limit: int = 200, offset: int = 0):
    collectors = await Collector.all().order_by("id").limit(limit).offset(offset)
    return [{"id": str(c.id), "name": c.name, "phone": c.phone} for c in collectors]
