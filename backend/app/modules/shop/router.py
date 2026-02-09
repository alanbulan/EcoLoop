"""
T3: 积分商城路由
职责: 商品列表、积分兑换、兑换记录查询
"""
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from tortoise.transactions import atomic

from app.modules.users.model import User
from app.modules.notifications.service import NotificationService

from .model import ShopProduct, PointsExchange

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/shop", tags=["积分商城"])


class ExchangeRequest(BaseModel):
    """兑换请求"""
    user_id: int
    product_id: int
    remark: str | None = None  # 收货地址或备注


class ProductResponse(BaseModel):
    """商品响应"""
    id: int
    name: str
    description: str | None
    image_url: str | None
    points_cost: int
    stock: int
    is_active: bool


class ExchangeResponse(BaseModel):
    """兑换记录响应"""
    id: int
    product_name: str
    points_spent: int
    status: str
    remark: str | None
    created_at: str


# --- 接口 ---

@router.get("/products")
async def get_products():
    """获取商城商品列表（仅上架商品）"""
    products = await ShopProduct.filter(is_active=True).order_by("-sort_order", "-created_at")
    return [
        ProductResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            image_url=p.image_url,
            points_cost=p.points_cost,
            stock=p.stock,
            is_active=p.is_active,
        )
        for p in products
    ]


@router.post("/exchange")
@atomic()
async def exchange_product(req: ExchangeRequest):
    """
    积分兑换商品
    规则:
    - 用户积分必须足够
    - 商品必须上架且有库存
    - 扣减积分和库存
    """
    user = await User.get_or_none(id=req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    product = await ShopProduct.get_or_none(id=req.product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="商品不存在或已下架")

    # 库存检查: stock=-1 表示无限库存，stock>=0 表示有限库存
    if product.stock >= 0 and product.stock < 1:
        raise HTTPException(status_code=400, detail="商品库存不足")

    if user.points < product.points_cost:
        raise HTTPException(
            status_code=400,
            detail=f"积分不足，需要{product.points_cost}积分，当前{user.points}积分",
        )

    # 扣减积分
    user.points -= product.points_cost
    await user.save()

    # 扣减库存（stock=-1 表示无限库存，不扣减）
    if product.stock > 0:
        product.stock -= 1
        await product.save()

    # 创建兑换记录
    exchange = await PointsExchange.create(
        user=user,
        product=product,
        points_spent=product.points_cost,
        remark=req.remark,
    )

    # 通知用户
    await NotificationService.send(
        user_id=user.id,
        title="兑换成功",
        content=f"您已成功兑换「{product.name}」，消耗{product.points_cost}积分。",
        type="promotion",
    )

    logger.info(f"积分兑换: 用户={user.id}, 商品={product.name}, 积分={product.points_cost}")

    return {
        "message": "兑换成功",
        "exchange_id": exchange.id,
        "remaining_points": user.points,
    }


@router.get("/exchanges/{user_id}")
async def get_exchange_records(user_id: int):
    """获取用户兑换记录"""
    records = await PointsExchange.filter(user_id=user_id).prefetch_related("product")
    return [
        ExchangeResponse(
            id=r.id,
            product_name=r.product.name,
            points_spent=r.points_spent,
            status=r.status,
            remark=r.remark,
            created_at=r.created_at.isoformat(),
        )
        for r in records
    ]
