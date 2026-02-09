"""用户反馈模型"""
from tortoise import fields, models


class Feedback(models.Model):
    id = fields.IntField(pk=True)
    user_id = fields.IntField(null=True, index=True)
    contact = fields.CharField(max_length=100, null=True)  # 联系方式（手机号/邮箱）
    content = fields.TextField()  # 反馈内容
    status = fields.CharField(max_length=20, default="pending")  # pending / resolved
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "feedbacks"
