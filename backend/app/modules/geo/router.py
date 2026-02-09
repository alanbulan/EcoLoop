"""地理编码路由"""
from fastapi import APIRouter, HTTPException

from .service import GeoService

router = APIRouter(tags=["geo"])


@router.get("/geo/reverse")
async def reverse_geocode(lat: float, lon: float):
    address = await GeoService.reverse_geocode(lat, lon)
    if not address:
        raise HTTPException(status_code=400, detail="Could not resolve address")
    return {"address": address}


@router.get("/geo/geocode")
async def geocode(address: str):
    coords = await GeoService.geocode(address)
    if not coords:
        raise HTTPException(status_code=400, detail="Could not resolve coordinates")
    return coords
