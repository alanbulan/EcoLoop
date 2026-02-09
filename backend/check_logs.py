import asyncio
from app.models import AuditLog
from tortoise import Tortoise

async def run():
    await Tortoise.init(
        db_url='sqlite://f:/Project/FPCY/backend/db.sqlite3',
        modules={'models': ['app.models']}
    )
    count = await AuditLog.all().count()
    print(f"Audit log count: {count}")
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(run())
