/**
 * P3修复: 从 index.vue 抽离订单列表核心逻辑
 * 职责: 订单数据获取、统计、Tab 切换、抢单、结算
 */
import { ref, computed, type Ref } from 'vue'
import { DefaultService, CollectorService, type Order, type CollectorStats } from '../../../api'
import { getCurrentLocation, getDistance } from '../../../utils/location'
import { handleApiError } from '../../../composables/useHttpInterceptor'

export function useOrderList(collectorId: Ref<number | null>) {
  const activeTab = ref('new')
  const orders = ref<Order[]>([])
  const stats = ref<Partial<CollectorStats>>({})
  const isRefreshing = ref(false)
  const assigningId = ref<number | null>(null)
  const showModal = ref(false)
  const userLocation = ref<{ latitude: number; longitude: number } | null>(null)
  const currentOrder = ref<Order | null>(null)
  const form = ref({
    actual_weight: '',
    impurity_percent: '0'
  })

  // 新订单数量（用于 Tab 角标）
  const newOrdersCount = computed(() => orders.value.filter(o => o.status === 'pending').length)

  // 根据当前 Tab 过滤订单
  const displayOrders = computed(() => {
    if (activeTab.value === 'new') {
      return orders.value.filter(o => o.status === 'pending').reverse()
    }
    return orders.value.filter(o => o.status === 'scheduled').reverse()
  })

  /**
   * ⚠️2修复: 获取订单列表 + 统计数据
   * - pending 订单: 不传 collector_id，全部可见（抢单大厅）
   * - scheduled 订单: 传 collector_id，只看自己被指派的
   * 两组数据合并后由 displayOrders 按 tab 过滤展示
   */
  const fetchData = async () => {
    isRefreshing.value = true
    try {
      // 获取当前位置
      try {
        const loc = await getCurrentLocation()
        userLocation.value = { latitude: loc.latitude, longitude: loc.longitude }
      } catch (e) {
        console.warn('获取位置失败，将使用默认距离', e)
      }

      // 并行请求: 抢单大厅(pending) + 我的进行中(scheduled) + 统计
      const [pendingOrders, scheduledOrders, statsData] = await Promise.all([
        DefaultService.getOrdersApiV1OrdersGet(undefined, 'pending'),
        collectorId.value
          ? DefaultService.getOrdersApiV1OrdersGet(collectorId.value, 'scheduled')
          : Promise.resolve([]),
        collectorId.value
          ? CollectorService.getCollectorStatsApiV1CollectorsCollectorIdStatsGet(collectorId.value)
          : Promise.resolve({})
      ])
      // 合并两组订单，displayOrders 按 tab 过滤
      orders.value = [...pendingOrders, ...scheduledOrders]
      stats.value = statsData
    } catch {
      throw new Error('加载失败')
    } finally {
      isRefreshing.value = false
    }
  }

  // 计算订单距离（订单无坐标时显示"--"，不再使用随机数假数据）
  const calculateDistance = (order: Order & { latitude?: number; longitude?: number }) => {
    if (!userLocation.value || !order.latitude || !order.longitude) return '--'
    return getDistance(
      userLocation.value.latitude,
      userLocation.value.longitude,
      order.latitude,
      order.longitude
    )
  }

  // 计算结算价格
  const calculatePrice = () => {
    const w = parseFloat(form.value.actual_weight || '0')
    const i = parseFloat(form.value.impurity_percent || '0')
    const unitPrice = parseFloat(currentOrder.value?.unit_price_snapshot || '0')
    return (w * (1 - i / 100) * unitPrice).toFixed(2)
  }

  // 抢单（使用 /claim 端点）
  const handleAssign = async (orderId: number) => {
    if (!collectorId.value) return
    assigningId.value = orderId
    try {
      await DefaultService.claimOrderApiV1OrdersOrderIdClaimPut(orderId, {
        collector_id: collectorId.value
      })
      await fetchData()
      return true
    } catch (e: unknown) {
      // N: 使用全局错误拦截器处理通用错误，业务错误提取 detail
      handleApiError(e)
    } finally {
      assigningId.value = null
    }
  }

  // 打开结算弹窗
  const showCompleteDialog = (order: Order) => {
    currentOrder.value = order
    form.value.actual_weight = ''
    form.value.impurity_percent = '0'
    showModal.value = true
  }

  // 确认结算
  const handleComplete = async () => {
    if (!form.value.actual_weight) throw new Error('请输入实际重量')
    await DefaultService.completeOrderApiV1OrdersOrderIdCompletePut(currentOrder.value!.id, {
      actual_weight: parseFloat(form.value.actual_weight),
      impurity_percent: parseFloat(form.value.impurity_percent || '0')
    })
    showModal.value = false
    await fetchData()
  }

  return {
    activeTab,
    orders,
    stats,
    isRefreshing,
    assigningId,
    showModal,
    currentOrder,
    form,
    newOrdersCount,
    displayOrders,
    fetchData,
    calculateDistance,
    calculatePrice,
    handleAssign,
    showCompleteDialog,
    handleComplete,
  }
}
