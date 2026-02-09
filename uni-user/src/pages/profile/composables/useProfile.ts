/**
 * 用户个人中心业务逻辑
 * 职责: 统计数据获取、用户信息补全、菜单导航、退出登录
 */
import { ref, type Ref, onMounted } from 'vue'
import { useMessage, useToast } from 'wot-design-uni'
import { useConfigStore } from '../../../stores/config'
import { useUserStore } from '../../../stores/user'
import { storeToRefs } from 'pinia'
import { UserService } from '../../../api/services/UserService'
import type { UserStats } from '../../../api/models/UserStats'

export function useProfile() {
  const message = useMessage()
  const toast = useToast()
  const configStore = useConfigStore()
  const userStore = useUserStore()
  const { profileConfig } = storeToRefs(configStore)
  const { userId } = storeToRefs(userStore)
  const stats = ref<UserStats>({ recycle_count: 0, carbon_offset: 0, total_earnings: 0 })

  /** 补全用户详细信息（首次进入时） */
  const ensureUserInfo = async () => {
    if (userId.value && !userStore.userInfo?.full_name) {
      try {
        const fullInfo = await UserService.getUserApiV1UsersUserIdGet(userId.value)
        userStore.userInfo = { ...userStore.userInfo, ...fullInfo }
      } catch (e) {
        console.warn('获取用户详情失败', e)
      }
    }
  }

  /** 获取用户统计数据 */
  const fetchStats = async () => {
    if (!userId.value) return
    try {
      stats.value = await UserService.getUserStatsApiV1UsersUserIdStatsGet(userId.value)
    } catch (e) {
      console.warn('获取统计数据失败', e)
    }
  }

  // 导航方法
  const goOrders = () => uni.switchTab({ url: '/pages/orders/orders' })
  const goWallet = () => uni.navigateTo({ url: '/pages/profile/wallet' })

  /** 菜单点击处理 */
  const handleMenuClick = (item: { title: string; icon: string; color: string; path: string }) => {
    if (item.path === 'call') {
      // 从配置中获取客服电话，兜底使用默认值
      const phone = profileConfig.value?.service_phone || '400-000-0000'
      uni.makePhoneCall({ phoneNumber: phone })
    } else if (item.path) {
      uni.navigateTo({ url: item.path })
    }
  }

  /** 退出登录 */
  const handleLogout = () => {
    message.confirm({
      title: '提示',
      msg: '确定要退出登录吗？',
    }).then(() => {
      userStore.logout()
      toast.success('已安全退出')
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/index/index' })
      }, 1000)
    }).catch(() => {})
  }

  onMounted(async () => {
    await ensureUserInfo()
    fetchStats()
  })

  return {
    profileConfig,
    userStore,
    stats,
    goOrders,
    goWallet,
    handleMenuClick,
    handleLogout,
  }
}
