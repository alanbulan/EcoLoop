"""库存 Schema"""
from pydantic import BaseModel, Field


class InventoryOutboundSchema(BaseModel):
    material_id: int = Field(..., gt=0)
    weight: float = Field(..., gt=0)
    notes: str = ""
