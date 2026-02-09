import asyncio
from tortoise import Tortoise

async def run():
    await Tortoise.init(
        db_url="postgres://postgres:123456@localhost:5432/green_recycle",
        modules={"models": ["app.models"]}
    )
    conn = Tortoise.get_connection("default")
    
    print("Truncating tables...")
    try:
        # Use CASCADE to handle foreign keys
        await conn.execute_script('TRUNCATE TABLE "users", "materials", "orders", "collectors", "withdrawals", "pricing_rules", "system_configs", "addresses" RESTART IDENTITY CASCADE;')
        print("Success: Tables truncated and sequences reset.")
    except Exception as e:
        print(f"Error truncating: {e}")

    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(run())
