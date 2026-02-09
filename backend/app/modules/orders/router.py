"""订单路由"""
from fastapi import APIRouter, Depends, HTTPException
from tortoise.transactions import atomic

from app.common.audit_log import AuditLog
from app.modules.addresses.model import Address
from app.modules.admin.dependencies import require_admin
from app.modules.collectors.model import Collector
from app.modules.materials.model import Material
from app.modules.notifications.service import NotificationService
from app.modules.users.model import User

from .model import Order
from .schemas import (
    AssignOrderSchema, ClaimOrderSchema, CompleteOrderSchema,
    CreateOrderSchema, Order_Pydantic,
)
from .service import OrderService

router = APIRouter(tags=["orders"])


@router.delete("/orders/{order_id}")
async def cancel_order(order_id: int):
    """I6修复: 取消订单改为设置 status='cancelled'，保留记录用于审计"""
    order = await Order.get_or_none(id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending orders can be cancelled")
    order.status = "cancelled"
    await order.save()
    return {"message": "Order cancelled"}


@router.get("/orders")
async def get_orders(
    user_id: int | None = None,
    collector_id: int | None = None,
    status: str | None = None,
    limit: int = 100, offset: int = 0,
):
    """支持按 user_id / collector_id / status 过滤"""
    qs = Order.all().prefetch_related("user", "material")
    if user_id is not None:
        qs = qs.filter(user_id=user_id)
    if collector_id is not None:
        qs = qs.filter(collector_id=collector_id)
    if status is not None:
        qs = qs.filter(status=status)

    orders = await qs.order_by("-date").limit(limit).offset(offset)
    return [
        {
            "id": str(o.id),
            "user_id": str(o.user_id),
            "user_name": o.user.full_name if o.user else "未知用户",
            "address": o.address,
            "contact_phone": o.contact_phone or "",
            "status": o.status,
            "weight_actual": float(o.weight_actual) if o.weight_actual else 0,
            "amount_final": float(o.amount_final) if o.amount_final else 0,
            "unit_price_snapshot": float(o.unit_price_snapshot) if o.unit_price_snapshot else 0,
            "collector_id": str(o.collector_id) if o.collector_id else None,
            "date": o.date.strftime("%Y-%m-%d"),
            "category": o.material.category if o.material else "Other",
            "appointment_time": o.appointment_time.isoformat() if o.appointment_time else None,
            "remark": o.remark,
        }
        for o in orders
    ]


@router.post("/orders", response_model=Order_Pydantic)
async def create_order(order_data: CreateOrderSchema):
    user = await User.get_or_none(id=order_data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    material = await Material.get_or_none(id=order_data.material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # 从用户默认地址获取联系电话
    contact_phone = None
    default_addr = await Address.filter(user_id=user.id, is_default=True).first()
    if default_addr:
        contact_phone = default_addr.receiver_phone
    else:
        any_addr = await Address.filter(user_id=user.id).first()
        if any_addr:
            contact_phone = any_addr.receiver_phone

    order = await Order.create(
        user=user, material=material, address=order_data.address,
        status="pending", unit_price_snapshot=material.current_price,
        appointment_time=order_data.appointment_time, remark=order_data.remark,
        contact_phone=contact_phone,
    )
    return await Order_Pydantic.from_tortoise_orm(order)


@router.put("/orders/{order_id}/assign", response_model=Order_Pydantic, dependencies=[Depends(require_admin)])
async def assign_order(order_id: int, data: AssignOrderSchema):
    order = await Order.get_or_none(id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending orders can be assigned")
    collector = await Collector.get_or_none(id=data.collector_id)
    if not collector:
        raise HTTPException(status_code=404, detail="Collector not found")
    order.collector = collector
    order.status = "scheduled"
    await order.save()
    # F5修复: 分配回收员时写入审计日志，供时间线展示
    await AuditLog.create(
        entity_type="order", entity_id=order.id,
        action="assigned", new_value="scheduled",
        operator_type="admin", operator_id=None,
    )
    return await Order_Pydantic.from_tortoise_orm(order)


@router.put("/orders/{order_id}/claim", response_model=Order_Pydantic)
@atomic()
async def claim_order(order_id: int, data: ClaimOrderSchema):
    order = await Order.get_or_none(id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Order is already claimed or processed")
    collector = await Collector.get_or_none(id=data.collector_id)
    if not collector:
        raise HTTPException(status_code=404, detail="Collector not found")
    order.collector = collector
    order.status = "scheduled"
    await order.save()
    await AuditLog.create(
        entity_type="order", entity_id=order.id,
        action="claimed", new_value="scheduled",
        operator_type="collector", operator_id=collector.id,
    )
    # 通知用户订单已被接单
    await NotificationService.send(
        user_id=order.user_id,
        title="订单已接单",
        content=f"回收员{collector.name}已接单，将按预约时间上门回收。",
        type="order",
        related_entity_type="order",
        related_entity_id=order.id,
    )
    return await Order_Pydantic.from_tortoise_orm(order)


@router.put("/orders/{order_id}/complete", response_model=Order_Pydantic)
@atomic()
async def complete_order(order_id: int, data: CompleteOrderSchema):
    """结算逻辑委托给 OrderService"""
    order = await Order.get_or_none(id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "scheduled":
        raise HTTPException(status_code=400, detail="Only scheduled orders can be completed")
    order = await OrderService.settle_order(order, data.actual_weight, data.impurity_percent)
    return await Order_Pydantic.from_tortoise_orm(order)


@router.get("/orders/{order_id}/timeline")
async def get_order_timeline(order_id: int):
    """F5修复: 获取订单状态变更时间线（从审计日志读取真实时间）"""
    order = await Order.get_or_none(id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # 订单创建时间始终存在
    timeline = [
        {
            "step": "created",
            "label": "订单提交",
            "time": order.date.strftime("%Y-%m-%d %H:%M"),
            "done": True,
        }
    ]

    # 从审计日志查询状态变更记录
    logs = (
        await AuditLog.filter(entity_type="order", entity_id=order_id)
        .order_by("created_at")
    )

    # 查找分配/接单记录
    assign_log = next(
        (l for l in logs if l.action in ("assigned", "claimed")), None
    )
    timeline.append({
        "step": "assigned",
        "label": "已分配回收员",
        "time": assign_log.created_at.strftime("%Y-%m-%d %H:%M") if assign_log else None,
        "done": order.status in ("scheduled", "completed"),
    })

    # 查找完成记录
    complete_log = next(
        (l for l in logs if l.action == "completed"), None
    )
    timeline.append({
        "step": "completed",
        "label": "订单完成",
        "time": complete_log.created_at.strftime("%Y-%m-%d %H:%M") if complete_log else None,
        "done": order.status == "completed",
    })

    return timeline
