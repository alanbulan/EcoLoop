"""回收点路由"""
import math

from fastapi import APIRouter

from .model import RecyclePoint

router = APIRouter(tags=["recycle_points"])


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """计算两点间的球面距离（公里）"""
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(d_lon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("/recycle_points")
async def get_recycle_points(
    lat: float | None = None,
    lon: float | None = None,
    radius_km: float = 10.0,
    limit: int = 50,
):
    """获取回收点列表，支持按距离排序"""
    points = await RecyclePoint.filter(status="active").limit(limit)

    result = []
    for p in points:
        item = {
            "id": p.id,
            "name": p.name,
            "address": p.address,
            "phone": p.phone,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "tags": [t.strip() for t in p.tags.split(",") if t.strip()],
        }
        if lat is not None and lon is not None:
            dist = _haversine_km(lat, lon, p.latitude, p.longitude)
            if dist > radius_km:
                continue
            item["distance"] = f"{dist:.1f}km" if dist >= 1 else f"{int(dist * 1000)}m"
            item["distance_value"] = dist
        result.append(item)

    # 按距离排序（如果有）
    if lat is not None and lon is not None:
        result.sort(key=lambda x: x.get("distance_value", 0))

    return result
