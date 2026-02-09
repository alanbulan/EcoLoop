"""订单评价路由"""
from fastapi import APIRouter, HTTPException
from tortoise.transactions import atomic

from app.modules.collectors.model import Collector
from app.modules.orders.model import Order

from .model import Review
from .schemas import CreateReviewSchema

router = APIRouter(tags=["reviews"])


@router.post("/reviews")
@atomic()
async def create_review(data: CreateReviewSchema):
    """用户提交订单评价"""
    order = await Order.get_or_none(id=data.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.user_id != data.user_id:
        raise HTTPException(status_code=403, detail="无权评价此订单")
    if order.status != "completed":
        raise HTTPException(status_code=400, detail="只能评价已完成的订单")
    # 防止重复评价
    existing = await Review.get_or_none(order_id=data.order_id)
    if existing:
        raise HTTPException(status_code=400, detail="该订单已评价")

    review = await Review.create(
        order_id=data.order_id,
        user_id=data.user_id,
        collector_id=order.collector_id,
        rating=data.rating,
        content=data.content,
        tags=data.tags,
    )

    # 更新回收员评分（加权平均）
    if order.collector_id:
        collector = await Collector.get(id=order.collector_id)
        review_count = await Review.filter(collector_id=collector.id).count()
        # 加权平均: (旧评分 * (n-1) + 新评分) / n
        if review_count > 1:
            collector.rating = round(
                (collector.rating * (review_count - 1) + data.rating) / review_count, 1
            )
        else:
            collector.rating = float(data.rating)
        await collector.save()

    return {
        "id": review.id,
        "rating": review.rating,
        "content": review.content,
        "message": "评价成功",
    }


@router.get("/reviews")
async def get_reviews(
    order_id: int | None = None,
    collector_id: int | None = None,
    user_id: int | None = None,
    limit: int = 50,
    offset: int = 0,
):
    """查询评价列表 — 支持按订单/回收员/用户过滤"""
    qs = Review.all().prefetch_related("user", "order")
    if order_id is not None:
        qs = qs.filter(order_id=order_id)
    if collector_id is not None:
        qs = qs.filter(collector_id=collector_id)
    if user_id is not None:
        qs = qs.filter(user_id=user_id)

    reviews = await qs.order_by("-created_at").limit(limit).offset(offset)
    return [
        {
            "id": r.id,
            "order_id": r.order_id,
            "user_name": r.user.full_name if r.user else "匿名",
            "rating": r.rating,
            "content": r.content,
            "tags": r.tags.split(",") if r.tags else [],
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M"),
        }
        for r in reviews
    ]
