/**
 * L: 全局 HTTP 错误拦截器（回收员端）
 * 职责: 统一处理 401 未授权、网络超时、服务端错误等场景
 * 在 App.vue 的 onLaunch 中调用 setupHttpInterceptor() 初始化
 */
import { ApiError } from '../api/core/ApiError'

/** 是否正在显示登录提示（防止重复弹窗） */
let isShowingAuthTip = false

/**
 * 处理 API 错误的全局拦截器
 * 在 catch 块中调用此函数统一处理错误
 */
export function handleApiError(error: unknown): void {
  if (error instanceof ApiError) {
    const status = error.status

    if (status === 401) {
      handleUnauthorized()
      return
    }

    if (status === 403) {
      uni.showToast({ title: '无权限访问', icon: 'none' })
      return
    }

    if (status === 404) {
      uni.showToast({ title: '请求的资源不存在', icon: 'none' })
      return
    }

    if (status >= 500) {
      uni.showToast({ title: '服务器繁忙，请稍后重试', icon: 'none' })
      return
    }

    // 其他 4xx 错误: 尝试提取后端返回的 detail 信息
    const detail = (error.body as { detail?: string })?.detail
    if (detail) {
      uni.showToast({ title: detail, icon: 'none' })
      return
    }
  }

  // 网络错误（非 ApiError）
  if (error && typeof error === 'object' && 'errMsg' in error) {
    const errMsg = (error as { errMsg: string }).errMsg
    if (errMsg.includes('timeout')) {
      uni.showToast({ title: '网络超时，请检查网络连接', icon: 'none' })
      return
    }
    if (errMsg.includes('fail')) {
      uni.showToast({ title: '网络连接失败', icon: 'none' })
      return
    }
  }

  console.error('[HTTP拦截器] 未处理的错误:', error)
}

/**
 * 处理 401 未授权
 */
function handleUnauthorized(): void {
  if (isShowingAuthTip) return
  isShowingAuthTip = true

  uni.showModal({
    title: '登录已过期',
    content: '请重新登录以继续使用',
    showCancel: false,
    confirmText: '确定',
    success: () => {
      isShowingAuthTip = false
      uni.removeStorageSync('user_token')
      uni.reLaunch({ url: '/pages/index/index' })
    },
  })
}

/**
 * M: 路由守卫 — 回收员端所有页面都需要登录
 * 在 App.vue 的 onLaunch 中调用 setupRouteGuard() 初始化
 */
export function setupRouteGuard(): void {
  // 回收员端: 拦截 navigateTo，检查是否已登录
  uni.addInterceptor('navigateTo', {
    invoke(args: { url: string }) {
      return checkCollectorAuth() ? args : false
    },
  })

  uni.addInterceptor('redirectTo', {
    invoke(args: { url: string }) {
      return checkCollectorAuth() ? args : false
    },
  })
}

/**
 * 检查回收员是否已登录
 */
function checkCollectorAuth(): boolean {
  const userInfo = uni.getStorageSync('user_info')
  if (!userInfo) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return false
  }
  return true
}
