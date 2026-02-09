"""库存路由 — 需要管理员权限"""
import json
from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from tortoise.transactions import atomic

from app.common.audit_log import AuditLog
from app.modules.admin.dependencies import require_admin

from .model import Inventory
from .schemas import InventoryOutboundSchema

router = APIRouter(tags=["inventory"])


@router.post("/inventory/outbound", dependencies=[Depends(require_admin)])
@atomic()
async def inventory_outbound(data: InventoryOutboundSchema):
    """出库操作需要管理员权限"""
    inv = await Inventory.get_or_none(material_id=data.material_id)
    if not inv or inv.weight < Decimal(str(data.weight)):
        raise HTTPException(status_code=400, detail="库存不足")

    inv.weight -= Decimal(str(data.weight))
    await inv.save()

    await AuditLog.create(
        entity_type="inventory", entity_id=inv.id,
        action="outbound",
        new_value=json.dumps({"weight": data.weight, "notes": data.notes}),
        operator_type="admin",
    )
    return {"message": "库存已更新", "remaining_weight": float(inv.weight)}


@router.get("/inventory", response_model=List[dict], dependencies=[Depends(require_admin)])
async def get_inventory():
    """查看库存需要管理员权限"""
    inventories = await Inventory.all().prefetch_related("material")
    return [
        {
            "material_name": i.material.name,
            "material_id": i.material_id,
            "weight": float(i.weight),
            "last_updated": i.last_updated.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for i in inventories
    ]
