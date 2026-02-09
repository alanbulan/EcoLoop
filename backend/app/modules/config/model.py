"""系统配置模型"""
from tortoise import fields, models


class SystemConfig(models.Model):
    id = fields.IntField(pk=True)
    key = fields.CharField(max_length=50, unique=True)
    value = fields.JSONField()
    description = fields.CharField(max_length=200, null=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "system_configs"
