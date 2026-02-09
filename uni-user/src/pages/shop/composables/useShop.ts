/**
 * T3: 积分商城业务逻辑
 * 职责: 商品列表、兑换操作、兑换记录
 */
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../../stores/user'
import { ShopService } from '../../../api/services/ShopService'
import { UserService } from '../../../api/services/UserService'
import type { ShopProduct, ExchangeRecord } from '../../../api/services/ShopService'
import { handleApiError } from '../../../composables/useHttpInterceptor'

export function useShop() {
  const userStore = useUserStore()

  /** 商品列表 */
  const products = ref<ShopProduct[]>([])
  /** 兑换记录 */
  const records = ref<ExchangeRecord[]>([])
  /** 当前积分 */
  const currentPoints = ref(0)
  /** 加载状态 */
  const loading = ref(false)
  /** 当前 Tab: products / records */
  const activeTab = ref<'products' | 'records'>('products')

  /** 获取商品列表 */
  const fetchProducts = async () => {
    loading.value = true
    try {
      products.value = await ShopService.getProducts()
    } catch (e) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  /** 获取兑换记录 */
  const fetchRecords = async () => {
    if (!userStore.userId) return
    loading.value = true
    try {
      records.value = await ShopService.getExchangeRecords(userStore.userId)
    } catch (e) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  /** 获取当前积分 */
  const fetchPoints = async () => {
    if (!userStore.userId) return
    try {
      const data = await UserService.getUserPointsApiV1UsersUserIdPointsGet(userStore.userId)
      currentPoints.value = data.current_points
    } catch (e) {
      console.warn('获取积分失败', e)
    }
  }

  /** 兑换商品 */
  const exchangeProduct = async (product: ShopProduct) => {
    if (!userStore.userId) return

    // 积分不足检查
    if (currentPoints.value < product.points_cost) {
      uni.showToast({ title: '积分不足', icon: 'none' })
      return
    }

    // 确认弹窗
    uni.showModal({
      title: '确认兑换',
      content: `确定使用 ${product.points_cost} 积分兑换「${product.name}」吗？`,
      confirmText: '确认兑换',
      confirmColor: '#07c160',
      success: async (res) => {
        if (!res.confirm) return
        loading.value = true
        try {
          const result = await ShopService.exchange(userStore.userId!, product.id)
          currentPoints.value = result.remaining_points
          uni.showToast({ title: '兑换成功', icon: 'success' })
          // 刷新商品列表（库存可能变化）
          await fetchProducts()
        } catch (e) {
          handleApiError(e)
        } finally {
          loading.value = false
        }
      },
    })
  }

  /** 切换 Tab */
  const switchTab = (tab: 'products' | 'records') => {
    activeTab.value = tab
    if (tab === 'records') {
      fetchRecords()
    }
  }

  /** 库存显示文本 */
  const stockText = (stock: number): string => {
    if (stock < 0) return '不限量'
    if (stock === 0) return '已售罄'
    return `剩余 ${stock} 件`
  }

  /** 兑换状态文本 */
  const statusText = (status: string): string => {
    const map: Record<string, string> = {
      pending: '待发货',
      shipped: '已发货',
      completed: '已完成',
    }
    return map[status] || status
  }

  /** 返回上一页 */
  const handleBack = () => uni.navigateBack()

  onMounted(async () => {
    await Promise.all([fetchProducts(), fetchPoints()])
  })

  return {
    products,
    records,
    currentPoints,
    loading,
    activeTab,
    exchangeProduct,
    switchTab,
    stockText,
    statusText,
    fetchProducts,
    handleBack,
  }
}
