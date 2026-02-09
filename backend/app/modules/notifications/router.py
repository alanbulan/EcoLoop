"""消息通知路由"""
from fastapi import APIRouter, HTTPException

from .model import Notification
from .service import NotificationService

router = APIRouter(tags=["notifications"])


@router.get("/notifications")
async def get_notifications(user_id: int, limit: int = 50, offset: int = 0):
    """获取用户通知列表"""
    notifications = (
        await Notification.filter(user_id=user_id)
        .order_by("-created_at")
        .limit(limit).offset(offset)
    )
    return [
        {
            "id": n.id,
            "title": n.title,
            "content": n.content,
            "type": n.type,
            "is_read": n.is_read,
            "related_entity_type": n.related_entity_type,
            "related_entity_id": n.related_entity_id,
            "created_at": n.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
        for n in notifications
    ]


@router.get("/notifications/unread-count")
async def get_unread_count(user_id: int):
    """获取未读消息数量"""
    count = await NotificationService.get_unread_count(user_id)
    return {"count": count}


@router.put("/notifications/{notification_id}/read")
async def mark_read(notification_id: int, user_id: int):
    """标记单条消息已读"""
    n = await Notification.get_or_none(id=notification_id)
    if not n:
        raise HTTPException(status_code=404, detail="通知不存在")
    if n.user_id != user_id:
        raise HTTPException(status_code=403, detail="无权操作")
    n.is_read = True
    await n.save()
    return {"message": "已读"}


@router.put("/notifications/read-all")
async def mark_all_read(user_id: int):
    """标记全部已读"""
    count = await NotificationService.mark_all_read(user_id)
    return {"message": f"已标记 {count} 条为已读"}
