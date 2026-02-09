"""用户模型"""
from tortoise import fields, models


class User(models.Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=50, unique=True, null=True)
    openid = fields.CharField(max_length=100, unique=True, null=True)
    phone = fields.CharField(max_length=20, unique=True, null=True)
    password = fields.CharField(max_length=128, null=True)  # fastapi-admin 需要
    full_name = fields.CharField(max_length=100, null=True)
    avatar_url = fields.CharField(max_length=500, null=True)
    balance = fields.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    points = fields.IntField(default=0)
    # T2: 推荐奖励机制 — 邀请码和推荐关系
    invite_code = fields.CharField(max_length=8, unique=True, null=True, index=True)
    referred_by = fields.ForeignKeyField('models.User', related_name='referrals', null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "users"

    def __str__(self):
        return self.full_name or self.username or str(self.id)
