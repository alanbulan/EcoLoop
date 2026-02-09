"""地址路由 — 含所有权校验"""
from typing import List

from fastapi import APIRouter, HTTPException

from .model import Address
from .schemas import AddressCreate, AddressResponse

router = APIRouter(tags=["addresses"])


@router.get("/addresses", response_model=List[AddressResponse])
async def get_addresses(user_id: int):
    return await Address.filter(user_id=user_id).all()


@router.post("/addresses", response_model=AddressResponse)
async def create_address(data: AddressCreate):
    if data.is_default:
        await Address.filter(user_id=data.user_id).update(is_default=False)
    address = await Address.create(**data.dict())
    return address


@router.put("/addresses/{address_id}", response_model=AddressResponse)
async def update_address(address_id: int, data: AddressCreate):
    address = await Address.get_or_none(id=address_id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    # C1修复: 校验地址所有权，防止越权修改
    if address.user_id != data.user_id:
        raise HTTPException(status_code=403, detail="无权修改此地址")
    if data.is_default:
        await Address.filter(user_id=data.user_id).update(is_default=False)
    await address.update_from_dict(data.dict()).save()
    return address


@router.delete("/addresses/{address_id}")
async def delete_address(address_id: int, user_id: int):
    """删除时必须传 user_id，校验地址所有权"""
    address = await Address.get_or_none(id=address_id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    if address.user_id != user_id:
        raise HTTPException(status_code=403, detail="无权删除此地址")
    await address.delete()
    return {"message": "Deleted"}
