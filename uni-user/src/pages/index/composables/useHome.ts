/**
 * P3修复: 首页核心逻辑抽离
 * 职责: 物料列表获取、用户统计、下拉刷新
 */
import { ref, onMounted } from 'vue'
import { type Material } from '../../../api'
import { useUserStore } from '../../../stores/user'
import { useConfigStore } from '../../../stores/config'
import { storeToRefs } from 'pinia'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { MaterialService } from '../../../api/services/MaterialService'
import { UserService } from '../../../api/services/UserService'
import type { UserStats } from '../../../api/models/UserStats'

export function useHome() {
  const userStore = useUserStore()
  const configStore = useConfigStore()
  const { userId } = storeToRefs(userStore)
  const { homeConfig } = storeToRefs(configStore)
  const materials = ref<Material[]>([])
  const loading = ref(false)
  const stats = ref<UserStats>({ recycle_count: 0, carbon_offset: 0, total_earnings: 0 })

  const fetchStats = async () => {
    if (!userId.value) return
    try {
      stats.value = await UserService.getUserStatsApiV1UsersUserIdStatsGet(userId.value)
    } catch (e) {
      console.warn('获取用户统计失败', e)
    }
  }

  const fetchMaterials = async () => {
    loading.value = true
    try {
      materials.value = await MaterialService.getMaterialsApiV1MaterialsGet()
    } catch {
      throw new Error('数据加载失败')
    } finally {
      loading.value = false
    }
  }

  const init = async () => {
    await configStore.fetchAllConfigs()
    await userStore.login()
    await Promise.all([fetchMaterials(), fetchStats()])
  }

  onMounted(() => init().catch(() => {}))

  onPullDownRefresh(async () => {
    await Promise.all([
      configStore.fetchAllConfigs(true),  // 下拉刷新: 强制跳过缓存
      fetchMaterials().catch(() => {}),
      fetchStats()
    ])
    uni.stopPullDownRefresh()
  })

  // 获取统计值的格式化显示
  const getStatValue = (key: string) => {
    const val = (stats.value as Record<string, number>)[key]
    if (!val) return '0'
    if (key === 'carbon_offset' || key === 'total_earnings') {
      return Number(val).toFixed(1)
    }
    return val
  }

  return {
    userId,
    homeConfig,
    materials,
    loading,
    stats,
    getStatValue,
    fetchMaterials,
  }
}
