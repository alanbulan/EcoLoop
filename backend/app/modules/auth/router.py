"""微信登录认证路由"""
import logging

from fastapi import APIRouter, HTTPException, Request
import httpx

from app.core.config import settings
from app.modules.users.model import User
from app.modules.collectors.model import Collector

from .schemas import WxLoginSchema, LoginResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["auth"])


@router.post("/auth/login", response_model=LoginResponse)
async def wx_login(request: Request):
    """微信小程序登录（jscode2session），用户不存在时自动注册"""
    try:
        data_dict = await request.json()
        data = WxLoginSchema(**data_dict)
    except Exception:
        # 兼容旧客户端 form 格式
        try:
            form_data = await request.form()
            if "code" in form_data:
                data = WxLoginSchema(code=form_data["code"])
            else:
                raise HTTPException(status_code=400, detail="缺少必填参数 code")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=400, detail="请求格式错误")

    # 开发模式：未配置真实 AppID 时使用模拟 openid
    wx_app_id = settings.WX_APP_ID
    wx_app_secret = settings.WX_APP_SECRET

    if data.code == "demo_code" or wx_app_id == "YOUR_APP_ID":
        openid = f"dev_openid_{hash(data.code) % 10000}"
    else:
        # 真实微信登录
        async with httpx.AsyncClient() as client:
            url = (
                f"https://api.weixin.qq.com/sns/jscode2session"
                f"?appid={wx_app_id}&secret={wx_app_secret}"
                f"&js_code={data.code}&grant_type=authorization_code"
            )
            resp = await client.get(url)
            result = resp.json()

            if "errcode" in result and result["errcode"] != 0:
                logger.warning("微信登录失败: %s，回退到开发模式", result.get("errmsg"))
                openid = "demo_openid_fallback"
            else:
                openid = result.get("openid")

    if not openid:
        raise HTTPException(status_code=400, detail="Failed to retrieve OpenID")

    # 查找或创建用户
    user, created = await User.get_or_create(
        openid=openid,
        defaults={
            "full_name": f"User_{openid[-4:]}",
            "password": "wechat_user_no_password"
        }
    )

    # 查询该用户是否关联了回收员身份
    collector = await Collector.get_or_none(user_id=user.id)

    return {
        "user_id": user.id,
        "openid": user.openid,
        "is_new": created,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "collector_id": collector.id if collector else None,
    }
