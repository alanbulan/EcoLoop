"""物料相关模型"""
from tortoise import fields, models


class Material(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    category = fields.CharField(max_length=50)  # Paper, Plastic, Metal 等
    current_price = fields.DecimalField(max_digits=10, decimal_places=2)
    market_price = fields.DecimalField(max_digits=10, decimal_places=2)
    trend = fields.CharField(max_length=10, default="stable")  # up, down, stable
    unit = fields.CharField(max_length=10, default="kg")

    class Meta:
        table = "materials"

    def __str__(self):
        return self.name


class MaterialHistory(models.Model):
    id = fields.IntField(pk=True)
    material = fields.ForeignKeyField('models.Material', related_name='histories')
    price = fields.DecimalField(max_digits=10, decimal_places=2)
    date = fields.DateField(auto_now_add=True)

    class Meta:
        table = "material_history"
        unique_together = (("material", "date"),)


class PricingRule(models.Model):
    id = fields.IntField(pk=True)
    material = fields.ForeignKeyField('models.Material', related_name='pricing_rules')
    name = fields.CharField(max_length=50)
    min_weight = fields.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonus_percent = fields.DecimalField(max_digits=5, decimal_places=2, default=0)
    priority = fields.IntField(default=0)

    class Meta:
        table = "pricing_rules"

    def __str__(self):
        return f"{self.name} ({self.material.name})"
