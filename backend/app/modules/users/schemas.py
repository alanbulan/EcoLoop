"""用户 Schema"""
from tortoise.contrib.pydantic import pydantic_model_creator
from .model import User

User_Pydantic = pydantic_model_creator(User, name="User", exclude=("password",))
