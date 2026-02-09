"""系统配置路由"""
from fastapi import APIRouter, HTTPException

from .model import SystemConfig

router = APIRouter(tags=["config"])

# 默认配置（数据库无记录时的兜底）
DEFAULT_CONFIGS = {
    "home_page": {
        "banners": [],
        "stats_labels": [
            {"label": "减碳量(kg)", "key": "carbon_offset"},
            {"label": "回收次数", "key": "recycle_count"},
            {"label": "获得收益(元)", "key": "total_earnings"}
        ],
        "quick_actions": [
            {"name": "扫码回收", "icon": "scan", "path": "scan"},
            {"name": "上门回收", "icon": "home", "path": "home"},
            {"name": "回收点查询", "icon": "location", "path": "location"},
            {"name": "我的积分", "icon": "money-circle", "path": "points"}
        ]
    },
    "profile_page": {
        "menu_items": [
            {"title": "常用地址", "icon": "location", "path": "/pages/address/address", "color": "#07c160"},
            {"title": "我的积分", "icon": "money-circle", "path": "/pages/points/points", "color": "#fa8c16"},
            {"title": "联系客服", "icon": "chat", "path": "call", "color": "#07c160"},
            {"title": "关于我们", "icon": "info-circle", "path": "/pages/about/about", "color": "#999999"}
        ]
    },
    "collector_home": {
        "tabs": [
            {"id": "new", "name": "抢单大厅"},
            {"id": "my", "name": "待处理"}
        ],
        "stats_labels": [
            {"label": "本月接单", "key": "month_count"},
            {"label": "服务分", "key": "rating"},
            {"label": "钱包余额", "key": "balance"}
        ]
    },
    "about_page": {
        "version": "1.0.2",
        "app_name": "EcoLoop",
        "copyright": "Copyright © 2026 EcoLoop",
        "links": [
            {"title": "功能介绍", "path": "/pages/about/intro"},
            {"title": "投诉建议", "path": "/pages/about/feedback"},
            {"title": "检查更新", "path": "update"},
            {"title": "隐私协议", "path": "/pages/about/privacy"}
        ]
    }
}


@router.get("/config/{key}")
async def get_config(key: str):
    config = await SystemConfig.get_or_none(key=key)
    if config:
        return config.value

    # 数据库无记录时返回默认配置
    if key in DEFAULT_CONFIGS:
        return DEFAULT_CONFIGS[key]

    raise HTTPException(status_code=404, detail="Config not found")


@router.get("/config")
async def get_all_configs():
    configs = await SystemConfig.all()
    result = {c.key: c.value for c in configs}

    # 合并默认配置（数据库缺失的 key 用默认值补齐）
    for k, v in DEFAULT_CONFIGS.items():
        if k not in result:
            result[k] = v

    return result
