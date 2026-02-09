"""订单模型"""
from tortoise import fields, models


class Order(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField('models.User', related_name='orders')
    material = fields.ForeignKeyField('models.Material', related_name='orders', null=True)
    address = fields.CharField(max_length=255)
    status = fields.CharField(max_length=20, default="pending", index=True)
    unit_price_snapshot = fields.DecimalField(max_digits=10, decimal_places=2, null=True)
    weight_actual = fields.DecimalField(max_digits=10, decimal_places=2, null=True)
    impurity_deduction_percent = fields.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    applied_bonus_amount = fields.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    amount_final = fields.DecimalField(max_digits=10, decimal_places=2, null=True)
    collector = fields.ForeignKeyField('models.Collector', related_name='orders', null=True, index=True)
    appointment_time = fields.DatetimeField(null=True, index=True)
    contact_phone = fields.CharField(max_length=20, null=True)
    remark = fields.TextField(null=True)
    date = fields.DatetimeField(auto_now_add=True, index=True)

    class Meta:
        table = "orders"
