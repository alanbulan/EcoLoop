"""回收点模型"""
from tortoise import fields, models


class RecyclePoint(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    address = fields.CharField(max_length=255)
    phone = fields.CharField(max_length=20, null=True)
    latitude = fields.FloatField()
    longitude = fields.FloatField()
    # 支持的回收类别，逗号分隔，如 "塑料,金属,废纸"
    tags = fields.CharField(max_length=255, default="")
    status = fields.CharField(max_length=20, default="active")
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "recycle_points"

    def __str__(self):
        return self.name
