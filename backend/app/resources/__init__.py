"""fastapi-admin 资源注册 — 使用模块化模型导入"""
from fastapi_admin.app import app
from fastapi_admin.resources import Model, Field

# 从新的模块路径导入模型
from app.modules.users.model import User
from app.modules.materials.model import Material, PricingRule
from app.modules.orders.model import Order
from app.modules.collectors.model import Collector
from app.modules.config.model import SystemConfig


@app.register
class SystemConfigResource(Model):
    label = "System Config"
    model = SystemConfig
    icon = "fas fa-cogs"
    fields = ["id", "key", "value", "description", "updated_at"]


@app.register
class UserResource(Model):
    label = "Users"
    model = User
    icon = "fas fa-user"
    page_pre_title = "user list"
    page_title = "Users"
    filters = [Field(name="username", label="Username")]
    fields = ["id", "username", "full_name", "created_at"]


@app.register
class MaterialResource(Model):
    label = "Materials"
    model = Material
    icon = "fas fa-box"
    fields = ["id", "name", "category", "current_price", "market_price", "trend", "unit"]


@app.register
class CollectorResource(Model):
    label = "Collectors"
    model = Collector
    icon = "fas fa-truck"
    fields = ["id", "name", "phone"]


@app.register
class OrderResource(Model):
    label = "Orders"
    model = Order
    icon = "fas fa-shopping-cart"
    fields = ["id", "user", "material", "address", "status", "weight_actual", "amount_final", "collector", "date"]


@app.register
class PricingRuleResource(Model):
    label = "Pricing Rules"
    model = PricingRule
    icon = "fas fa-tags"
    fields = ["id", "material", "name", "min_weight", "bonus_percent", "priority"]
