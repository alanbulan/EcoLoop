<template>
  <view class="container">
    <wd-navbar title="价格行情" left-arrow fixed placeholder @click-left="goBack" safe-area-inset-top />
    
    <view class="chart-section">
      <view class="section-title-row">
        <text class="section-title">价格走势 (近 7 日)</text>
        <view class="mat-selector-tab" @click="showPicker = true">
          <text>{{ currentMaterial?.name || '选择物品' }}</text>
          <wd-icon name="arrow-down" size="12px" />
        </view>
      </view>
      <view class="chart-container">
        <!-- Using a more sophisticated CSS chart for immediate visualization -->
        <view class="real-chart">
          <view v-for="(item, index) in chartData" :key="index" class="chart-column">
            <view class="bar-wrap">
              <view class="bar" :style="{ height: item.value + '%' }">
                <text class="bar-val">¥{{ item.price }}</text>
              </view>
            </view>
            <text class="bar-label">{{ item.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="price-list">
      <view class="section-title">实时单价</view>
      <wd-cell-group border custom-style="border-radius: 16px; overflow: hidden;">
        <wd-cell 
          v-for="item in materials" 
          :key="item.id" 
          :title="item.name"
          @click="handleMaterialChange(item)"
          :custom-class="currentMaterial?.id === item.id ? 'active-cell' : ''"
        >
          <template #value>
            <text class="price">¥{{ item.current_price }}/{{ item.unit }}</text>
          </template>
        </wd-cell>
      </wd-cell-group>
    </view>

    <!-- Material Picker -->
    <!-- 小程序兼容: 底部弹窗添加 safe-area-inset-bottom -->
    <wd-popup v-model="showPicker" position="bottom" round safe-area-inset-bottom lock-scroll>
      <view class="picker-header">切换回收物品</view>
      <view class="picker-list">
        <view 
          v-for="item in materials" 
          :key="item.id" 
          class="picker-item" 
          @click="handleMaterialChange(item)"
        >
          {{ item.name }}
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { type Material, type MaterialHistoryItem } from '../../api'
import { MaterialService } from '../../api/services/MaterialService'
import { onPullDownRefresh } from '@dcloudio/uni-app'

const materials = ref<Material[]>([])
/** 图表数据: 物料价格历史 */
const chartData = ref<MaterialHistoryItem[]>([])
const currentMaterial = ref<Material | null>(null)
const showPicker = ref(false)

onMounted(async () => {
  try {
    const data = await MaterialService.getMaterialsApiV1MaterialsGet()
    materials.value = data
    if (data.length > 0) {
      handleMaterialChange(data[0])
    }
  } catch (e) {
    console.error('Failed to fetch materials', e)
  }
})

/** 下拉刷新: 重新加载物料和当前选中物料的历史 */
onPullDownRefresh(async () => {
  try {
    const data = await MaterialService.getMaterialsApiV1MaterialsGet()
    materials.value = data
    if (currentMaterial.value) {
      await fetchHistory(currentMaterial.value.id)
    }
  } catch (e) {
    console.error('刷新失败', e)
  } finally {
    uni.stopPullDownRefresh()
  }
})

const handleMaterialChange = (item: Material) => {
  currentMaterial.value = item
  showPicker.value = false
  fetchHistory(item.id)
}

const fetchHistory = async (materialId: number) => {
  try {
    const data = await MaterialService.getMaterialHistoryApiV1MaterialsMaterialIdHistoryGet(materialId)
    chartData.value = data
  } catch (e) {
    console.error('Failed to fetch history', e)
  }
}

const goBack = () => uni.navigateBack()
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $bg-color;
  min-height: 100vh;
}

.section-title {
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  color: $text-main;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  
  .mat-selector-tab {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: $primary-color;
    background: rgba(7, 193, 96, 0.05);
    padding: 4px 10px;
    border-radius: 12px;
  }
}

.chart-section {
  background: $white;
  margin-bottom: 12px;
  padding-bottom: 24px;
}

.chart-container {
  padding: 0 16px;
  height: 220px;
}

.real-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100%;
  padding-top: 30px;
  
  .chart-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    .bar-wrap {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      
      .bar {
        width: 16px;
        background: linear-gradient(180deg, $primary-color 0%, rgba(7, 193, 96, 0.2) 100%);
        border-radius: 8px 8px 0 0;
        position: relative;
        transition: height 0.3s ease;
        
        .bar-val {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          color: $primary-color;
          font-weight: bold;
          white-space: nowrap;
        }
      }
    }
    
    .bar-label {
      font-size: 11px;
      color: $text-light;
    }
  }
}

.price-list {
  padding: 0 16px 30px;
  .price {
    color: $error-color;
    font-weight: bold;
  }
}

.active-cell {
  background: rgba(7, 193, 96, 0.02) !important;
  :deep(.wd-cell__title) { color: $primary-color !important; font-weight: bold; }
}

.picker-header {
  padding: 20px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
}

.picker-list {
  padding-bottom: 40px;
  .picker-item {
    padding: 16px;
    text-align: center;
    font-size: 15px;
    border-top: 1px solid $border-color;
    &:active { background: $bg-color; }
  }
}
</style>
