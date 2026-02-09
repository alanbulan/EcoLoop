"""用户反馈路由"""
from fastapi import APIRouter, Depends

from app.modules.admin.dependencies import require_admin

from .model import Feedback
from .schemas import CreateFeedbackSchema

router = APIRouter(tags=["feedback"])


@router.post("/feedback")
async def create_feedback(data: CreateFeedbackSchema):
    """提交用户反馈 — I3修复: 使用 Pydantic schema 替代 raw dict"""
    obj = await Feedback.create(
        user_id=data.user_id,
        contact=data.contact,
        content=data.content,
    )
    return {"id": obj.id, "message": "反馈已提交"}


@router.get("/feedback", dependencies=[Depends(require_admin)])
async def list_feedback(limit: int = 50, offset: int = 0):
    """获取反馈列表（管理端）— 需要管理员权限"""
    items = await Feedback.all().order_by("-created_at").limit(limit).offset(offset)
    return [
        {
            "id": f.id,
            "user_id": f.user_id,
            "contact": f.contact,
            "content": f.content,
            "status": f.status,
            "created_at": f.created_at.isoformat() if f.created_at else None,
        }
        for f in items
    ]
