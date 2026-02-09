"""
统一模型导出 — 供 Tortoise ORM 模型发现使用
所有模块的 model 在此集中导出，确保 ForeignKey 字符串引用能正确解析
"""
# 用户模块
from app.modules.users.model import User
# 物料模块（含 Material, MaterialHistory, PricingRule）
from app.modules.materials.model import Material, MaterialHistory, PricingRule
# 回收员模块
from app.modules.collectors.model import Collector
# 订单模块
from app.modules.orders.model import Order
# 提现模块
from app.modules.withdrawals.model import Withdrawal
# 地址模块
from app.modules.addresses.model import Address
# 库存模块
from app.modules.inventory.model import Inventory
# 回收点模块
from app.modules.recycle_points.model import RecyclePoint
# 系统配置模块
from app.modules.config.model import SystemConfig
# 通知模块
from app.modules.notifications.model import Notification
# 评价模块
from app.modules.reviews.model import Review
# 积分商城模块
from app.modules.shop.model import ShopProduct, PointsExchange
# 公共模块
from app.common.audit_log import AuditLog
# 反馈模块
from app.modules.feedback.model import Feedback
