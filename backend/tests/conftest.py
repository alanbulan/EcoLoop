"""
测试配置 — 使用 SQLite 内存数据库，隔离测试环境
"""
import pytest
from tortoise import Tortoise


@pytest.fixture(autouse=True)
async def init_db():
    """每个测试用例前初始化内存数据库，测试后清理"""
    await Tortoise.init(
        db_url="sqlite://:memory:",
        modules={"models": ["app.models"]},
    )
    await Tortoise.generate_schemas()
    yield
    await Tortoise.close_connections()
