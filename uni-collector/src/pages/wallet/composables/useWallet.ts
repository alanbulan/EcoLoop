/**
 * ⚠️6修复: 回收员钱包业务逻辑
 * 职责: 余额查询、提现记录、发起提现
 */
import { ref, type Ref } from 'vue'
import { CollectorService, type CollectorWithdrawal } from '../../../api/services/CollectorService'
import { useToast } from 'wot-design-uni'
import { handleApiError } from '../../../composables/useHttpInterceptor'

export function useWallet(collectorId: Ref<number | null>) {
  const toast = useToast()
  const balance = ref(0)
  const withdrawals = ref<CollectorWithdrawal[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const showForm = ref(false)
  const amount = ref('')

  /** 获取余额 + 提现记录 */
  const fetchData = async () => {
    if (!collectorId.value) return
    loading.value = true
    try {
      const [stats, records] = await Promise.all([
        CollectorService.getCollectorStatsApiV1CollectorsCollectorIdStatsGet(collectorId.value),
        CollectorService.getCollectorWithdrawals(collectorId.value),
      ])
      balance.value = stats.balance || 0
      withdrawals.value = records
    } catch (e) {
      console.warn('获取钱包数据失败', e)
    } finally {
      loading.value = false
    }
  }

  /** 发起提现 */
  const submitWithdrawal = async () => {
    const val = parseFloat(amount.value)
    if (!val || val <= 0) {
      toast.error('请输入有效金额')
      return
    }
    if (val > balance.value) {
      toast.error('提现金额不能超过可用余额')
      return
    }
    if (!collectorId.value) return

    submitting.value = true
    try {
      await CollectorService.createCollectorWithdrawal(collectorId.value, val)
      toast.success('提现申请已提交，等待审核')
      showForm.value = false
      amount.value = ''
      await fetchData()
    } catch (e: unknown) {
      // N: 使用全局错误拦截器处理 401/403/500 等通用错误
      handleApiError(e)
    } finally {
      submitting.value = false
    }
  }

  return {
    balance,
    withdrawals,
    loading,
    submitting,
    showForm,
    amount,
    fetchData,
    submitWithdrawal,
  }
}
