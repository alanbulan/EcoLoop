"""
T2: 推荐奖励机制路由
职责: 邀请码生成、绑定推荐关系、查询推荐记录
"""
import logging
import random
import string

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from tortoise.transactions import atomic

from app.modules.users.model import User
from app.modules.notifications.service import NotificationService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/referrals", tags=["推荐奖励"])

# 推荐奖励积分配置
REFERRER_REWARD_POINTS = 100   # 邀请人获得积分
INVITEE_REWARD_POINTS = 50     # 被邀请人获得积分


def _generate_invite_code(length: int = 6) -> str:
    """生成随机邀请码（大写字母+数字）"""
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=length))


class BindReferralRequest(BaseModel):
    """绑定推荐关系请求"""
    user_id: int
    invite_code: str


class ReferralInfo(BaseModel):
    """推荐信息响应"""
    invite_code: str
    referral_count: int
    total_reward_points: int


# --- 接口 ---

@router.get("/invite-code/{user_id}")
async def get_or_create_invite_code(user_id: int):
    """获取用户邀请码（不存在则自动生成）"""
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    if not user.invite_code:
        # 生成唯一邀请码（最多重试 5 次）
        for _ in range(5):
            code = _generate_invite_code()
            exists = await User.filter(invite_code=code).exists()
            if not exists:
                user.invite_code = code
                await user.save()
                break
        else:
            raise HTTPException(status_code=500, detail="邀请码生成失败，请重试")

    return {"invite_code": user.invite_code}


@router.post("/bind")
@atomic()
async def bind_referral(req: BindReferralRequest):
    """
    绑定推荐关系
    规则:
    - 被邀请人不能已有推荐人
    - 不能自己邀请自己
    - 邀请码必须有效
    """
    user = await User.get_or_none(id=req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    if user.referred_by_id:
        raise HTTPException(status_code=400, detail="您已绑定过邀请码")

    referrer = await User.get_or_none(invite_code=req.invite_code)
    if not referrer:
        raise HTTPException(status_code=404, detail="邀请码无效")

    if referrer.id == user.id:
        raise HTTPException(status_code=400, detail="不能使用自己的邀请码")

    # 绑定推荐关系
    user.referred_by = referrer
    await user.save()

    # 双方获得积分奖励
    referrer.points += REFERRER_REWARD_POINTS
    await referrer.save()

    user.points += INVITEE_REWARD_POINTS
    await user.save()

    # 通知邀请人
    await NotificationService.send(
        user_id=referrer.id,
        title="邀请奖励到账",
        content=f"您邀请的好友已注册，获得{REFERRER_REWARD_POINTS}积分奖励！",
        type="promotion",
    )

    # 通知被邀请人
    await NotificationService.send(
        user_id=user.id,
        title="邀请码绑定成功",
        content=f"成功绑定邀请码，获得{INVITEE_REWARD_POINTS}积分奖励！",
        type="promotion",
    )

    logger.info(f"推荐绑定成功: 邀请人={referrer.id}, 被邀请人={user.id}")

    return {
        "message": "绑定成功",
        "referrer_reward": REFERRER_REWARD_POINTS,
        "invitee_reward": INVITEE_REWARD_POINTS,
    }


@router.get("/info/{user_id}", response_model=ReferralInfo)
async def get_referral_info(user_id: int):
    """获取用户的推荐统计信息"""
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    # 确保有邀请码
    if not user.invite_code:
        code = _generate_invite_code()
        user.invite_code = code
        await user.save()

    # 统计推荐人数
    referral_count = await User.filter(referred_by_id=user_id).count()

    return ReferralInfo(
        invite_code=user.invite_code,
        referral_count=referral_count,
        total_reward_points=referral_count * REFERRER_REWARD_POINTS,
    )
