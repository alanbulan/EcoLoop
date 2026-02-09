"""
T3: 积分商城模型
职责: 商品定义、兑换记录
"""
from tortoise import fields, models


class ShopProduct(models.Model):
    """积分商城商品"""
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    description = fields.TextField(null=True)
    image_url = fields.CharField(max_length=500, null=True)
    points_cost = fields.IntField()           # 兑换所需积分
    stock = fields.IntField(default=-1)       # 库存数量（-1=无限，0=售罄，>0=剩余数量）
    is_active = fields.BooleanField(default=True)
    sort_order = fields.IntField(default=0)   # 排序权重
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "shop_products"
        ordering = ["-sort_order", "-created_at"]


class PointsExchange(models.Model):
    """积分兑换记录"""
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField('models.User', related_name='exchanges')
    product = fields.ForeignKeyField('models.ShopProduct', related_name='exchanges')
    points_spent = fields.IntField()
    status = fields.CharField(max_length=20, default="pending")  # pending/shipped/completed
    remark = fields.TextField(null=True)      # 收货地址或备注
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "points_exchanges"
        ordering = ["-created_at"]
