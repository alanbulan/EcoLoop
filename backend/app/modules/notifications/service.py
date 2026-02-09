"""消息通知服务 — 统一发送入口，供其他模块调用"""
from .model import Notification


class NotificationService:

    @staticmethod
    async def send(
        user_id: int,
        title: str,
        content: str,
        type: str = "system",
        related_entity_type: str | None = None,
        related_entity_id: int | None = None,
    ) -> Notification:
        """创建一条通知"""
        return await Notification.create(
            user_id=user_id,
            title=title,
            content=content,
            type=type,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
        )

    @staticmethod
    async def get_unread_count(user_id: int) -> int:
        """获取未读消息数"""
        return await Notification.filter(user_id=user_id, is_read=False).count()

    @staticmethod
    async def mark_all_read(user_id: int) -> int:
        """标记全部已读，返回更新条数"""
        count = await Notification.filter(user_id=user_id, is_read=False).update(is_read=True)
        return count
