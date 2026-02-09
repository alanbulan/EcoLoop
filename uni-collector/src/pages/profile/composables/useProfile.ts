/**
 * D1修复: 从 profile.vue 抽离个人中心业务逻辑
 * 职责: 统计数据获取、菜单导航、退出登录
 */
import { ref, type Ref } from 'vue'
import { CollectorService, type CollectorStats } from '../../../api'
import { useUserStore } from '../../../stores/user'
import { useMessage, useToast } from 'wot-design-uni'

export function useProfile(collectorId: Ref<number | null>) {
  const userStore = useUserStore()
  const message = useMessage()
  const toast = useToast()
  const stats = ref<CollectorStats>({ balance: 0, rating: 0, month_count: 0 })

  /** 获取回收员统计数据 */
  const fetchStats = async () => {
    if (!collectorId.value) return
    try {
      const data = await CollectorService.getCollectorStatsApiV1CollectorsCollectorIdStatsGet(collectorId.value)
      stats.value = data
    } catch (e) {
      console.warn('获取统计数据失败', e)
    }
  }

  /** 确保已登录 */
  const ensureLogin = async () => {
    if (!collectorId.value) {
      await userStore.login()
    }
  }

  // 导航方法
  const goInventory = () => uni.navigateTo({ url: '/pages/inventory/inventory' })
  const goOrders = () => uni.switchTab({ url: '/pages/index/index' })
  // ⚠️6修复: 导航到钱包页面（替代原来的 toast 占位）
  const goWallet = () => uni.navigateTo({ url: '/pages/wallet/wallet' })
  // G1修复: 替换"功能开发中"占位，导航到真实页面
  const goStats = () => uni.navigateTo({ url: '/pages/stats/stats' })
  const goUserInfo = () => uni.navigateTo({ url: '/pages/user-info/user-info' })
  const goSettings = () => uni.navigateTo({ url: '/pages/settings/settings' })
  const goAbout = () => uni.navigateTo({ url: '/pages/about/about' })

  /** 退出登录 */
  const handleLogout = () => {
    message.confirm({
      title: '退出登录',
      msg: '确定要退出当前账号吗？',
    }).then(() => {
      userStore.logout()
      toast.success('已退出登录')
    }).catch(() => {})
  }

  return {
    stats,
    fetchStats,
    ensureLogin,
    goInventory,
    goOrders,
    goWallet,
    goStats,
    goUserInfo,
    goSettings,
    goAbout,
    handleLogout,
  }
}
