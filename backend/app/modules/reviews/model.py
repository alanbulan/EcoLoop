"""订单评价模型"""
from tortoise import fields, models


class Review(models.Model):
    id = fields.IntField(pk=True)
    order = fields.OneToOneField('models.Order', related_name='review')
    user = fields.ForeignKeyField('models.User', related_name='reviews')
    collector = fields.ForeignKeyField('models.Collector', related_name='reviews', null=True)
    # 评分 1-5
    rating = fields.IntField(default=5)
    content = fields.TextField(null=True)
    # 标签: 准时,态度好,分类专业 等
    tags = fields.CharField(max_length=255, null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "reviews"
