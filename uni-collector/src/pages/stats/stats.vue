<template>
  <view class="container">
    <wd-navbar title="任务统计" left-arrow fixed placeholder @click-left="goBack" safe-area-inset-top />
    <view class="content">
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-val">{{ stats.month_count || 0 }}</text>
          <text class="stat-lab">本月接单</text>
        </view>
        <view class="stat-card">
          <text class="stat-val">{{ stats.total_count || 0 }}</text>
          <text class="stat-lab">累计接单</text>
        </view>
        <view class="stat-card">
          <text class="stat-val">{{ Number(stats.total_weight || 0).toFixed(1) }}</text>
          <text class="stat-lab">累计重量(kg)</text>
        </view>
        <view class="stat-card">
          <text class="stat-val">{{ Number(stats.rating || 5.0).toFixed(1) }}</text>
          <text class="stat-lab">服务评分</text>
        </view>
      </view>
      <view class="tip-text">更多统计功能持续完善中</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { storeToRefs } from 'pinia'
import { OpenAPI } from '../../api/core/OpenAPI'
import { request as __request } from '../../api/core/request'

const userStore = useUserStore()
const { collectorId } = storeToRefs(userStore)
const goBack = () => uni.navigateBack()

const stats = ref<Record<string, number>>({})

onMounted(async () => {
  if (!collectorId.value) return
  try {
    const data = await __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/collectors/{collector_id}/stats',
      path: { collector_id: collectorId.value },
    })
    stats.value = data as Record<string, number>
  } catch (e) {
    console.error('获取统计数据失败', e)
  }
})
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $bg-color;
  min-height: 100vh;
}
.content {
  padding: 32rpx;
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}
.stat-card {
  background: $white;
  border-radius: 16rpx;
  padding: 40rpx 24rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
  .stat-val {
    font-size: 44rpx;
    font-weight: 800;
    color: $primary-color;
    display: block;
    margin-bottom: 12rpx;
  }
  .stat-lab {
    font-size: 24rpx;
    color: $text-light;
  }
}
.tip-text {
  text-align: center;
  color: $text-light;
  font-size: 24rpx;
  margin-top: 48rpx;
}
</style>
