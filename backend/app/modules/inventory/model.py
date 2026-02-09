"""库存模型"""
from tortoise import fields, models


class Inventory(models.Model):
    id = fields.IntField(pk=True)
    material = fields.ForeignKeyField('models.Material', related_name='inventories')
    weight = fields.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    last_updated = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "inventory"
