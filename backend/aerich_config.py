"""
Aerich 数据库迁移配置
用法:
  aerich --config aerich_config.TORTOISE_ORM init -t aerich_config.TORTOISE_ORM
  aerich --config aerich_config.TORTOISE_ORM init-db
  aerich --config aerich_config.TORTOISE_ORM migrate --name <描述>
  aerich --config aerich_config.TORTOISE_ORM upgrade
"""
from app.core.config import settings

TORTOISE_ORM = {
    "connections": {
        "default": settings.DATABASE_URL,
    },
    "apps": {
        "models": {
            "models": ["app.models", "aerich.models"],
            "default_connection": "default",
        },
    },
}
