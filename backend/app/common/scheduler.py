"""
T1: 定时任务调度器
职责: 管理后台周期性任务（订单超时取消、提现超时拒绝等）
技术方案: asyncio 原生定时任务，无额外依赖
在 FastAPI lifespan 中启动/停止
"""
import asyncio
import logging
from datetime import datetime, timedelta

logger = logging.getLogger("scheduler")


class SchedulerService:
    """轻量级异步定时任务调度器"""

    _tasks: list[asyncio.Task] = []

    @classmethod
    async def start(cls) -> None:
        """启动所有定时任务"""
        logger.info("定时任务调度器启动")
        cls._tasks = [
            asyncio.create_task(cls._run_periodic("订单超时取消", cls.cancel_expired_orders, interval=300)),
            asyncio.create_task(cls._run_periodic("提现超时拒绝", cls.reject_expired_withdrawals, interval=600)),
        ]

    @classmethod
    async def stop(cls) -> None:
        """停止所有定时任务"""
        for task in cls._tasks:
            task.cancel()
        if cls._tasks:
            await asyncio.gather(*cls._tasks, return_exceptions=True)
        cls._tasks.clear()
        logger.info("定时任务调度器已停止")

    @classmethod
    async def _run_periodic(cls, name: str, func, interval: int) -> None:
        """
        周期性执行任务的通用包装器
        :param name: 任务名称（用于日志）
        :param func: 异步任务函数
        :param interval: 执行间隔（秒）
        """
        # 首次启动延迟 10 秒，等待 ORM 初始化完成
        await asyncio.sleep(10)
        while True:
            try:
                count = await func()
                if count > 0:
                    logger.info(f"[{name}] 处理了 {count} 条记录")
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"[{name}] 执行失败: {e}")
            await asyncio.sleep(interval)

    @staticmethod
    async def cancel_expired_orders() -> int:
        """
        取消超时未被接单的订单
        规则: pending 状态超过 24 小时 → cancelled
        """
        from app.modules.orders.model import Order
        from app.modules.notifications.service import NotificationService

        cutoff = datetime.utcnow() - timedelta(hours=24)
        expired_orders = await Order.filter(
            status="pending",
            date__lt=cutoff,
        )

        count = 0
        for order in expired_orders:
            order.status = "cancelled"
            await order.save()
            count += 1

            # 通知用户订单已自动取消
            await NotificationService.send(
                user_id=order.user_id,
                title="订单已自动取消",
                content=f"您的回收订单#{order.id}因超过24小时未被接单，已自动取消。您可以重新预约。",
                type="order",
                related_entity_type="order",
                related_entity_id=order.id,
            )

        return count

    @staticmethod
    async def reject_expired_withdrawals() -> int:
        """
        拒绝超时未审核的提现申请
        规则: pending 状态超过 72 小时 → rejected
        同时退还用户余额
        """
        from app.modules.withdrawals.model import Withdrawal
        from app.modules.users.model import User
        from app.modules.notifications.service import NotificationService

        cutoff = datetime.utcnow() - timedelta(hours=72)
        expired_withdrawals = await Withdrawal.filter(
            status="pending",
            request_date__lt=cutoff,
        )

        count = 0
        for w in expired_withdrawals:
            w.status = "rejected"
            await w.save()

            # 退还用户余额
            user = await User.get(id=w.user_id)
            user.balance += w.amount
            await user.save()

            count += 1

            # 通知用户提现已自动拒绝
            await NotificationService.send(
                user_id=w.user_id,
                title="提现申请已过期",
                content=f"您的提现申请（¥{float(w.amount):.2f}）因超过72小时未审核，已自动退回。金额已返还至您的账户余额。",
                type="withdrawal",
                related_entity_type="withdrawal",
                related_entity_id=w.id,
            )

        return count
