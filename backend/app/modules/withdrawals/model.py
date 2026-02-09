"""提现模型"""
from tortoise import fields, models


class Withdrawal(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField('models.User', related_name='withdrawals')
    order = fields.OneToOneField('models.Order', related_name='withdrawal', null=True)
    amount = fields.DecimalField(max_digits=10, decimal_places=2)
    status = fields.CharField(max_length=20, default="pending")
    channel = fields.CharField(max_length=50)
    request_date = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "withdrawals"
