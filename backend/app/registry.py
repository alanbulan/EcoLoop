"""
统一路由注册 — 替代旧的 routers/api.py
所有模块路由在此集中注册，API 路径保持不变
"""
from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.config.router import router as config_router
from app.modules.addresses.router import router as addresses_router
from app.modules.users.router import router as users_router
from app.modules.orders.router import router as orders_router
from app.modules.materials.router import router as materials_router
from app.modules.collectors.router import router as collectors_router
from app.modules.withdrawals.router import router as withdrawals_router
from app.modules.inventory.router import router as inventory_router
from app.modules.admin.router import router as admin_router
from app.modules.geo.router import router as geo_router
from app.modules.recycle_points.router import router as recycle_points_router
from app.modules.notifications.router import router as notifications_router
from app.modules.reviews.router import router as reviews_router
from app.modules.referrals.router import router as referrals_router
from app.modules.shop.router import router as shop_router
from app.modules.feedback.router import router as feedback_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(config_router)
router.include_router(addresses_router)
router.include_router(users_router)
router.include_router(orders_router)
router.include_router(materials_router)
router.include_router(collectors_router)
router.include_router(withdrawals_router)
router.include_router(inventory_router)
router.include_router(admin_router)
router.include_router(geo_router)
router.include_router(recycle_points_router)
router.include_router(notifications_router)
router.include_router(reviews_router)
router.include_router(referrals_router)
router.include_router(shop_router)
router.include_router(feedback_router)
