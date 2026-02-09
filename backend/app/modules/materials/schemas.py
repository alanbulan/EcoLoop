"""物料 Schema"""
from tortoise.contrib.pydantic import pydantic_model_creator
from .model import Material

Material_Pydantic = pydantic_model_creator(Material, name="Material")
