"""地理编码服务 — 使用 Nominatim (OpenStreetMap)"""
import logging
from typing import Optional, Dict

import httpx

logger = logging.getLogger(__name__)


class GeoService:
    BASE_URL = "https://nominatim.openstreetmap.org"
    USER_AGENT = "EcoLoopApp/1.0"

    @classmethod
    async def reverse_geocode(cls, lat: float, lon: float) -> Optional[str]:
        """坐标 → 地址（逆地理编码）"""
        async with httpx.AsyncClient() as client:
            try:
                params = {"lat": lat, "lon": lon, "format": "json", "accept-language": "zh"}
                headers = {"User-Agent": cls.USER_AGENT}
                resp = await client.get(f"{cls.BASE_URL}/reverse", params=params, headers=headers)
                data = resp.json()
                return data.get("display_name")
            except Exception as e:
                logger.warning("逆地理编码失败: %s", e)
                return None

    @classmethod
    async def geocode(cls, address: str) -> Optional[Dict[str, float]]:
        """地址 → 坐标（地理编码）"""
        async with httpx.AsyncClient() as client:
            try:
                params = {"q": address, "format": "json", "limit": 1}
                headers = {"User-Agent": cls.USER_AGENT}
                resp = await client.get(f"{cls.BASE_URL}/search", params=params, headers=headers)
                data = resp.json()
                if data:
                    return {"lat": float(data[0]["lat"]), "lon": float(data[0]["lon"])}
                return None
            except Exception as e:
                logger.warning("地理编码失败: %s", e)
                return None
