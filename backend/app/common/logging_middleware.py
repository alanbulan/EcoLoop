"""
统一请求/响应日志中间件
记录每个 API 请求的方法、路径、状态码、耗时
"""
import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("ecoloop.api")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """结构化请求日志中间件"""

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        method = request.method
        path = request.url.path

        # 跳过静态资源和健康检查
        if path.startswith("/admin/statics") or path == "/":
            return await call_next(request)

        try:
            response = await call_next(request)
            elapsed_ms = (time.perf_counter() - start) * 1000
            logger.info(
                "[%s] %s → %d (%.1fms)",
                method, path, response.status_code, elapsed_ms,
            )
            return response
        except Exception as exc:
            elapsed_ms = (time.perf_counter() - start) * 1000
            logger.error(
                "[%s] %s → 500 (%.1fms) %s",
                method, path, elapsed_ms, str(exc),
            )
            raise
