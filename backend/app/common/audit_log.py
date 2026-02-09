"""审计日志模型 — 跨模块共用"""
from tortoise import fields, models


class AuditLog(models.Model):
    id = fields.IntField(pk=True)
    entity_type = fields.CharField(max_length=50)  # 如 "order", "withdrawal"
    entity_id = fields.IntField()
    action = fields.CharField(max_length=50)  # 如 "status_change", "created"
    old_value = fields.TextField(null=True)
    new_value = fields.TextField(null=True)
    operator_type = fields.CharField(max_length=20)  # "user", "collector", "admin", "system"
    operator_id = fields.IntField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "audit_logs"
        indexes = [
            ("entity_type", "entity_id"),
        ]
