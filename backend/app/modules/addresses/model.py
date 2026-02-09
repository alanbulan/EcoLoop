"""地址模型"""
from tortoise import fields, models


class Address(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="addresses")
    receiver_name = fields.CharField(max_length=50)
    receiver_phone = fields.CharField(max_length=20)
    province = fields.CharField(max_length=50)
    city = fields.CharField(max_length=50)
    district = fields.CharField(max_length=50)
    detail = fields.CharField(max_length=200)
    is_default = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "addresses"
