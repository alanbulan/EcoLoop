"""回收员模型"""
from tortoise import fields, models


class Collector(models.Model):
    id = fields.IntField(pk=True)
    user = fields.OneToOneField('models.User', related_name='collector_profile', null=True)
    name = fields.CharField(max_length=100)
    phone = fields.CharField(max_length=20, unique=True)
    balance = fields.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    rating = fields.FloatField(default=5.0)
    status = fields.CharField(max_length=20, default="active")

    class Meta:
        table = "collectors"

    def __str__(self):
        return self.name
