/**
 * P3修复: 订单页核心逻辑抽离
 * 职责: 订单列表获取、提现记录、取消订单、提现申请
 */
import { ref } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserStore } from '../../../stores/user'
import { OrderService } from '../../../api/services/OrderService'
import { WithdrawalService } from '../../../api/services/WithdrawalService'
import type { WithdrawalRecord } from '../../../api/models/WithdrawalRecord'
import type { OrderListItem } from '../../../api/models/OrderListItem'

export function useOrderList() {
  const orders = ref<OrderListItem[]>([])
  const loading = ref(false)
  const showOrderDetail = ref(false)
  const selectedOrder = ref<OrderListItem | null>(null)
  const userStore = useUserStore()
  const withdrawalsByOrderId = ref<Record<string, WithdrawalRecord>>({})
  const withdrawing = ref(false)

  const fetchOrders = async () => {
    loading.value = true
    try {
      // 传 userId 给后端过滤，不再前端过滤全量数据
      const data = await OrderService.getOrdersApiV1OrdersGet(100, 0, userStore.userId ?? undefined) as OrderListItem[]
      orders.value = data.reverse()
    } catch {
      throw new Error('获取订单失败')
    } finally {
      loading.value = false
    }
  }

  const fetchWithdrawals = async () => {
    if (!userStore.userId) return
    try {
      const list = await WithdrawalService.getUserWithdrawalsApiV1WithdrawalsGet(userStore.userId)
      withdrawalsByOrderId.value = (list || []).reduce((acc: Record<string, WithdrawalRecord>, w: WithdrawalRecord) => {
        if (w.order_id) acc[String(w.order_id)] = w
        return acc
      }, {} as Record<string, WithdrawalRecord>)
    } catch (e) {
      console.warn('获取提现记录失败', e)
    }
  }

  const cancelOrder = async (id: string | number) => {
    await OrderService.cancelOrderApiV1OrdersOrderIdDelete(Number(id))
    await fetchOrders()
  }

  const submitWithdrawal = async (order: OrderListItem) => {
    if (!userStore.userId) throw new Error('请先登录')
    const amount = Number(order.amount_final || 0)
    if (!amount || amount <= 0) throw new Error('该订单暂无可提现收益')
    if (getWithdrawal(order.id)) return

    withdrawing.value = true
    try {
      await WithdrawalService.createWithdrawalApiV1WithdrawalsPost({
        user_id: userStore.userId,
        order_id: Number(order.id),
        amount,
        channel: 'wechat'
      })
      showOrderDetail.value = false
      await fetchWithdrawals()
    } finally {
      withdrawing.value = false
    }
  }

  const getWithdrawal = (orderId: string | number) => {
    return withdrawalsByOrderId.value[String(orderId)]
  }

  // 初始化加载
  const init = () => {
    fetchOrders().catch(() => {})
    fetchWithdrawals()
  }

  onPullDownRefresh(async () => {
    await fetchOrders().catch(() => {})
    await fetchWithdrawals()
    uni.stopPullDownRefresh()
  })

  return {
    orders,
    loading,
    showOrderDetail,
    selectedOrder,
    withdrawing,
    withdrawalsByOrderId,
    fetchOrders,
    fetchWithdrawals,
    cancelOrder,
    submitWithdrawal,
    getWithdrawal,
    init,
  }
}
