"""管理后台路由 — 登录、统计、图表、审计日志"""
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends
from tortoise.functions import Sum

from app.common.audit_log import AuditLog
from app.core.config import settings
from app.modules.orders.model import Order
from app.modules.withdrawals.model import Withdrawal

from .dependencies import _generate_admin_token, require_admin
from .schemas import AdminLoginSchema

router = APIRouter(tags=["admin"])


@router.post("/admin/login")
async def admin_login(data: AdminLoginSchema):
    """管理后台登录接口，返回 token"""
    from fastapi import HTTPException
    if data.username != settings.ADMIN_USERNAME or data.password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    return {"token": _generate_admin_token(), "username": data.username}


@router.get("/admin/audit_logs", dependencies=[Depends(require_admin)])
async def get_audit_logs(limit: int = 200, offset: int = 0):
    logs = await AuditLog.all().order_by("-created_at").limit(limit).offset(offset)
    return [
        {
            "id": log.id,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "action": log.action,
            "old_value": log.old_value,
            "new_value": log.new_value,
            "operator_type": log.operator_type,
            "operator_id": log.operator_id,
            "created_at": log.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for log in logs
    ]


@router.get("/admin/stats", dependencies=[Depends(require_admin)])
async def get_admin_stats():
    """管理后台统计数据"""
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = today_start + timedelta(days=1)

    revenue_data = (
        await Order.filter(status="completed", date__gte=today_start, date__lt=today_end)
        .annotate(total=Sum("amount_final"))
        .values("total")
    )
    revenue_total = revenue_data[0]["total"] if revenue_data and revenue_data[0]["total"] else 0

    weight_data = (
        await Order.filter(status="completed", date__gte=today_start, date__lt=today_end)
        .annotate(total=Sum("weight_actual"))
        .values("total")
    )
    weight_total = weight_data[0]["total"] if weight_data and weight_data[0]["total"] else 0

    pending_withdrawals = await Withdrawal.filter(status="pending").count()

    revenue_label = "今日成交额"
    weight_label = "今日回收重量"
    # 今日无数据时回退到近 7 日
    if not revenue_total and not weight_total:
        fallback_start = datetime.now() - timedelta(days=7)
        revenue_7d = (
            await Order.filter(status="completed", date__gte=fallback_start)
            .annotate(total=Sum("amount_final"))
            .values("total")
        )
        weight_7d = (
            await Order.filter(status="completed", date__gte=fallback_start)
            .annotate(total=Sum("weight_actual"))
            .values("total")
        )
        revenue_total = revenue_7d[0]["total"] if revenue_7d and revenue_7d[0]["total"] else 0
        weight_total = weight_7d[0]["total"] if weight_7d and weight_7d[0]["total"] else 0
        revenue_label = "近7日成交额"
        weight_label = "近7日回收重量"

    return {
        "revenue": float(revenue_total),
        "revenueLabel": revenue_label,
        "weight": float(weight_total),
        "weightLabel": weight_label,
        "pendingCount": pending_withdrawals,
        "pendingLabel": "待审核提现",
    }


@router.get("/admin/chart", dependencies=[Depends(require_admin)])
async def get_admin_chart():
    """管理后台图表数据 — 按物料类别统计回收重量"""
    data = (
        await Order.filter(status="completed")
        .annotate(total_weight=Sum("weight_actual"))
        .group_by("material__category")
        .values("material__category", "total_weight")
    )

    cat_map = {
        "Paper": "废纸", "Plastic": "塑料", "Metal": "金属",
        "Clothes": "衣物", "Appliance": "家电", "Glass": "玻璃",
    }

    return [
        {"name": cat_map.get(d["material__category"], d["material__category"]), "weight": float(d["total_weight"] or 0)}
        for d in data
    ]


# --- T4: 数据统计大屏增强 ---

@router.get("/admin/dashboard", dependencies=[Depends(require_admin)])
async def get_dashboard_data():
    """
    T4: 综合数据大屏 — 一次请求返回所有统计数据
    包含: 概览指标、订单趋势、收入趋势、用户增长、物料分布
    """
    from app.modules.users.model import User
    from app.modules.collectors.model import Collector
    from app.modules.materials.model import Material

    now = datetime.now()
    days_30 = now - timedelta(days=30)
    days_7 = now - timedelta(days=7)

    # 1. 概览指标
    total_users = await User.all().count()
    total_collectors = await Collector.all().count()
    total_orders = await Order.all().count()
    completed_orders = await Order.filter(status="completed").count()
    pending_orders = await Order.filter(status="pending").count()
    pending_withdrawals = await Withdrawal.filter(status="pending").count()

    total_revenue_data = (
        await Order.filter(status="completed")
        .annotate(total=Sum("amount_final"))
        .values("total")
    )
    total_revenue = float(total_revenue_data[0]["total"] or 0) if total_revenue_data else 0

    total_weight_data = (
        await Order.filter(status="completed")
        .annotate(total=Sum("weight_actual"))
        .values("total")
    )
    total_weight = float(total_weight_data[0]["total"] or 0) if total_weight_data else 0

    # 2. 近 30 天订单趋势（按天分组）
    order_trend = []
    for i in range(30):
        day = (now - timedelta(days=29 - i)).date()
        day_start = datetime.combine(day, datetime.min.time())
        day_end = day_start + timedelta(days=1)
        count = await Order.filter(date__gte=day_start, date__lt=day_end).count()
        completed = await Order.filter(
            status="completed", date__gte=day_start, date__lt=day_end
        ).count()
        order_trend.append({
            "date": day.isoformat(),
            "total": count,
            "completed": completed,
        })

    # 3. 近 30 天收入趋势
    revenue_trend = []
    for i in range(30):
        day = (now - timedelta(days=29 - i)).date()
        day_start = datetime.combine(day, datetime.min.time())
        day_end = day_start + timedelta(days=1)
        rev = (
            await Order.filter(status="completed", date__gte=day_start, date__lt=day_end)
            .annotate(total=Sum("amount_final"))
            .values("total")
        )
        revenue_trend.append({
            "date": day.isoformat(),
            "revenue": float(rev[0]["total"] or 0) if rev else 0,
        })

    # 4. 近 7 天新增用户
    new_users_7d = await User.filter(created_at__gte=days_7).count()

    # 5. 物料分布（按类别统计已完成订单重量）
    material_dist = (
        await Order.filter(status="completed")
        .prefetch_related("material")
        .annotate(total_weight=Sum("weight_actual"))
        .group_by("material_id")
        .values("material_id", "total_weight")
    )
    # 获取物料名称映射
    materials = await Material.all()
    mat_map = {m.id: m.name for m in materials}
    material_distribution = [
        {
            "name": mat_map.get(d["material_id"], f"物料#{d['material_id']}"),
            "weight": float(d["total_weight"] or 0),
        }
        for d in material_dist
        if d["total_weight"]
    ]

    return {
        "overview": {
            "total_users": total_users,
            "total_collectors": total_collectors,
            "total_orders": total_orders,
            "completed_orders": completed_orders,
            "pending_orders": pending_orders,
            "pending_withdrawals": pending_withdrawals,
            "total_revenue": total_revenue,
            "total_weight": total_weight,
            "new_users_7d": new_users_7d,
        },
        "order_trend": order_trend,
        "revenue_trend": revenue_trend,
        "material_distribution": material_distribution,
    }
