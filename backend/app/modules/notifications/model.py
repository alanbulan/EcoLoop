"""消息通知模型"""
from tortoise import fields, models


class Notification(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField('models.User', related_name='notifications')
    title = fields.CharField(max_length=100)
    content = fields.TextField()
    # 通知类型: order(订单), withdrawal(提现), system(系统), promotion(活动)
    type = fields.CharField(max_length=20, default="system", index=True)
    is_read = fields.BooleanField(default=False, index=True)
    # 关联实体（可选，用于点击跳转）
    related_entity_type = fields.CharField(max_length=50, null=True)
    related_entity_id = fields.IntField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True, index=True)

    class Meta:
        table = "notifications"
        ordering = ["-created_at"]
