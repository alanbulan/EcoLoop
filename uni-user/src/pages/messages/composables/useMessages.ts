/**
 * 消息中心业务逻辑
 * 职责: 消息列表获取、已读标记、未读计数
 */
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'
import { useUserStore } from '../../../stores/user'
import { NotificationService, type NotificationItem } from '../../../api'
import { handleApiError } from '../../../composables/useHttpInterceptor'

export function useMessages() {
  const toast = useToast()
  const userStore = useUserStore()
  const messages = ref<NotificationItem[]>([])
  const loading = ref(false)
  const unreadCount = ref(0)

  /** 获取消息列表 */
  const fetchMessages = async () => {
    if (!userStore.userId) return
    loading.value = true
    try {
      messages.value = await NotificationService.getNotifications(userStore.userId)
    } catch (e) {
      console.warn('获取消息失败', e)
    } finally {
      loading.value = false
    }
  }

  /** 获取未读数 */
  const fetchUnreadCount = async () => {
    if (!userStore.userId) return
    try {
      const res = await NotificationService.getUnreadCount(userStore.userId)
      unreadCount.value = res.count
    } catch (e) {
      console.warn('获取未读数失败', e)
    }
  }

  /** 标记单条已读 */
  const markRead = async (item: NotificationItem) => {
    if (item.is_read || !userStore.userId) return
    try {
      await NotificationService.markRead(item.id, userStore.userId)
      item.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (e) {
      console.warn('标记已读失败', e)
    }
  }

  /** 全部标记已读 */
  const markAllRead = async () => {
    if (!userStore.userId) return
    try {
      await NotificationService.markAllRead(userStore.userId)
      messages.value.forEach(m => m.is_read = true)
      unreadCount.value = 0
      toast.success('已全部标记为已读')
    } catch (e) {
      // N: 使用全局错误拦截器统一处理
      handleApiError(e)
    }
  }

  /** 点击消息 — 标记已读并跳转 */
  const handleClick = (item: NotificationItem) => {
    markRead(item)
    // 根据关联实体类型跳转
    if (item.related_entity_type === 'order') {
      uni.switchTab({ url: '/pages/orders/orders' })
    } else if (item.related_entity_type === 'withdrawal') {
      uni.navigateTo({ url: '/pages/profile/wallet' })
    }
  }

  /** 通知类型对应的图标 */
  const getTypeIcon = (type: string) => {
    const map: Record<string, string> = {
      order: 'goods',
      withdrawal: 'money-circle',
      system: 'bell',
      promotion: 'gift',
    }
    return map[type] || 'bell'
  }

  /** 通知类型对应的颜色 (与 variables.scss 设计令牌保持一致) */
  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      order: '#07c160',      // $primary-color (用户端)
      withdrawal: '#fa8c16', // $warning-color
      system: '#1890ff',     // 系统蓝 (信息类)
      promotion: '#ff4d4f',  // $error-color
    }
    return map[type] || '#999999' // $text-light
  }

  return {
    messages,
    loading,
    unreadCount,
    fetchMessages,
    fetchUnreadCount,
    markRead,
    markAllRead,
    handleClick,
    getTypeIcon,
    getTypeColor,
  }
}
