/**
 * T2: 推荐奖励业务逻辑
 * 职责: 邀请码获取/分享、绑定邀请码、推荐统计
 */
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../../stores/user'
import { ReferralService } from '../../../api/services/ReferralService'
import type { ReferralInfo } from '../../../api/services/ReferralService'
import { handleApiError } from '../../../composables/useHttpInterceptor'

export function useReferral() {
  const userStore = useUserStore()

  /** 推荐统计信息 */
  const referralInfo = ref<ReferralInfo>({
    invite_code: '',
    referral_count: 0,
    total_reward_points: 0,
  })

  /** 输入的邀请码（用于绑定） */
  const inputCode = ref('')

  /** 加载状态 */
  const loading = ref(false)

  /** 是否已绑定过邀请码 */
  const hasBound = ref(false)

  /** 获取推荐信息 */
  const fetchInfo = async () => {
    if (!userStore.userId) return
    loading.value = true
    try {
      const info = await ReferralService.getReferralInfo(userStore.userId)
      referralInfo.value = info
    } catch (e) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  /** 复制邀请码到剪贴板 */
  const copyInviteCode = () => {
    if (!referralInfo.value.invite_code) return
    uni.setClipboardData({
      data: referralInfo.value.invite_code,
      success: () => {
        uni.showToast({ title: '邀请码已复制', icon: 'success' })
      },
    })
  }

  /** 绑定邀请码 */
  const bindCode = async () => {
    if (!userStore.userId) return
    const code = inputCode.value.trim().toUpperCase()
    if (!code) {
      uni.showToast({ title: '请输入邀请码', icon: 'none' })
      return
    }
    if (code.length < 6) {
      uni.showToast({ title: '邀请码格式不正确', icon: 'none' })
      return
    }

    loading.value = true
    try {
      const result = await ReferralService.bindReferral(userStore.userId, code)
      hasBound.value = true
      uni.showToast({ title: result.message, icon: 'success' })
      // 绑定成功后刷新信息
      await fetchInfo()
    } catch (e) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  /** 返回上一页 */
  const handleBack = () => uni.navigateBack()

  onMounted(() => {
    fetchInfo()
  })

  return {
    referralInfo,
    inputCode,
    loading,
    hasBound,
    copyInviteCode,
    bindCode,
    fetchInfo,
    handleBack,
  }
}
