/**
 * L: 全局 HTTP 错误拦截器
 * 职责: 统一处理 401 未授权、网络超时、服务端错误等场景
 * 在 App.vue 的 onLaunch 中调用 setupHttpInterceptor() 初始化
 */
import { ApiError } from '../api/core/ApiError'

/** 需要登录才能访问的页面路径 */
const AUTH_REQUIRED_PAGES = [
  '/pages/orders/orders',
  '/pages/appointment/appointment',
  '/pages/profile/profile',
  '/pages/address/address',
  '/pages/points/points',
  '/pages/messages/messages',
  '/pages/profile/wallet',
  '/pages/referral/referral',
  '/pages/shop/shop',
]

/** 白名单页面（无需登录） */
const PUBLIC_PAGES = [
  '/pages/index/index',
  '/pages/about/about',
  '/pages/about/intro',
  '/pages/history/history',
  '/pages/location/location',
]

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
      // 未授权: 清除本地状态，提示重新登录
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

  // 兜底: 未知错误
  console.error('[HTTP拦截器] 未处理的错误:', error)
}

/**
 * 处理 401 未授权
 * 清除用户状态，提示重新登录
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
      // 清除本地存储的用户信息
      uni.removeStorageSync('user_token')
      // 跳转到首页（首页会触发自动登录）
      uni.reLaunch({ url: '/pages/index/index' })
    },
  })
}

/**
 * M: 路由守卫 — 页面跳转前检查登录状态
 * 在 App.vue 的 onLaunch 中调用 setupRouteGuard() 初始化
 */
export function setupRouteGuard(): void {
  // 拦截 navigateTo
  uni.addInterceptor('navigateTo', {
    invoke(args: { url: string }) {
      return checkAuth(args.url) ? args : false
    },
  })

  // 拦截 redirectTo
  uni.addInterceptor('redirectTo', {
    invoke(args: { url: string }) {
      return checkAuth(args.url) ? args : false
    },
  })

  // switchTab 不拦截（tabBar 页面由微信登录自动处理）
}

/**
 * 检查目标页面是否需要登录
 * @returns true 允许跳转, false 拦截并提示
 */
function checkAuth(url: string): boolean {
  // 提取路径部分（去掉查询参数）
  const path = url.split('?')[0]

  // 白名单页面直接放行
  if (PUBLIC_PAGES.some(p => path.startsWith(p))) {
    return true
  }

  // 需要登录的页面检查 userId
  if (AUTH_REQUIRED_PAGES.some(p => path.startsWith(p))) {
    // 从 Pinia store 检查登录状态（通过 storage 判断，避免循环依赖）
    const userInfo = uni.getStorageSync('user_info')
    if (!userInfo) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return false
    }
  }

  return true
}
