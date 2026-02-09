/**
 * 企业库存管理业务逻辑
 * 职责: 库存列表获取、出库操作、分类样式
 */
import { ref, computed } from 'vue'
import { useToast } from 'wot-design-uni'
import { InventoryService, type InventoryItem } from '../../../api'
import { handleApiError } from '../../../composables/useHttpInterceptor'

export function useInventory() {
  const toast = useToast()
  const inventories = ref<InventoryItem[]>([])
  const showModal = ref(false)
  const loading = ref(false)
  const currentItem = ref<InventoryItem | null>(null)
  const form = ref({ weight: '', notes: '' })

  /** 库存总重量 */
  const totalWeight = computed(() =>
    inventories.value.reduce((sum, item) => sum + item.weight, 0)
  )

  /** 获取库存列表 */
  const fetchInventory = async () => {
    try {
      inventories.value = await InventoryService.getInventoryApiV1InventoryGet()
    } catch (e) {
      // N: 使用全局错误拦截器统一处理
      handleApiError(e)
    }
  }

  /** 打开出库弹窗 */
  const handleOutbound = (item: InventoryItem) => {
    currentItem.value = item
    form.value = { weight: '', notes: '' }
    showModal.value = true
  }

  /** 确认出库 */
  const confirmOutbound = async () => {
    if (!form.value.weight || parseFloat(form.value.weight) <= 0) {
      toast.info('请输入有效的重量')
      return
    }
    if (parseFloat(form.value.weight) > (currentItem.value?.weight || 0)) {
      toast.info('出库重量不能超过当前库存')
      return
    }

    loading.value = true
    try {
      await InventoryService.inventoryOutboundApiV1InventoryOutboundPost({
        material_id: currentItem.value!.material_id,
        weight: parseFloat(form.value.weight),
        notes: form.value.notes
      })
      toast.success('出库成功')
      showModal.value = false
      fetchInventory()
    } catch (e) {
      // N: 使用全局错误拦截器统一处理
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  /** 根据物料名称返回分类样式 */
  const getCategoryClass = (name: string) => {
    if (name.includes('纸')) return 'cat-paper'
    if (name.includes('塑')) return 'cat-plastic'
    if (name.includes('金')) return 'cat-metal'
    return 'cat-other'
  }

  /** 格式化更新时间 */
  const formatUpdateTime = (t: string) => {
    if (!t) return '刚刚'
    const date = new Date(t)
    return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return {
    inventories,
    showModal,
    loading,
    currentItem,
    form,
    totalWeight,
    fetchInventory,
    handleOutbound,
    confirmOutbound,
    getCategoryClass,
    formatUpdateTime,
  }
}
