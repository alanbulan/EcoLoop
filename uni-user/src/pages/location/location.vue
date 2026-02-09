<template>
  <view class="container">
    <wd-navbar title="回收点查询" left-arrow fixed placeholder @click-left="goBack" safe-area-inset-top />
    
    <view class="search-box">
      <wd-search v-model="searchValue" placeholder="输入街道或小区名称" hide-cancel @search="handleSearch" />
    </view>

    <!-- C: 骨架屏替代 loading -->
    <view v-if="loading" class="map-placeholder">
      <view class="skeleton-map">
        <view class="sk-block sk-map-bg"></view>
        <view class="sk-map-pin"></view>
      </view>
      <text class="sk-hint">加载中...</text>
    </view>

    <view v-if="!loading && locations.length === 0 && !searchValue" class="map-placeholder">
      <wd-icon name="location" size="48px" color="#07c160" />
      <text>正在获取附近回收点...</text>
    </view>

    <view class="location-list">
      <view class="list-header">附近回收点 ({{ locations.length }})</view>
      <wd-card v-for="item in locations" :key="item.id" custom-class="loc-card">
        <view class="loc-info">
          <view class="loc-main">
            <text class="name">{{ item.name }}</text>
            <text class="dist">{{ item.distance || '' }}</text>
          </view>
          <text class="address">{{ item.address }}</text>
          <view class="tags">
            <text v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</text>
          </view>
        </view>
        <template #footer>
          <view class="loc-actions">
            <wd-button v-if="item.phone" size="small" plain @click="handleCall(item.phone!)">
              <wd-icon name="phone" size="14px" /> 电话
            </wd-button>
            <wd-button size="small" type="primary" @click="handleNav(item)">
              <wd-icon name="location" size="14px" /> 导航
            </wd-button>
          </view>
        </template>
      </wd-card>

      <!-- A: 精致空状态 -->
      <view v-if="!loading && locations.length === 0 && searchValue" class="empty-state">
        <view class="empty-illustration">
          <wd-icon name="location" size="48px" color="rgba(7,193,96,0.6)" />
        </view>
        <text class="empty-title">未找到匹配的回收点</text>
        <text class="empty-desc">试试换个关键词搜索</text>
      </view>
    </view>

    <!-- P1修复: 缺少 wd-toast 挂载点，导致 toast 不显示 -->
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
/**
 * A2修复: 回收点数据改为从后端 API 获取，清除所有硬编码假数据
 */
import { ref, onMounted } from 'vue'
import { useToast } from 'wot-design-uni'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { RecyclePointService, type RecyclePoint } from '../../api/services/RecyclePointService'

const toast = useToast()
const searchValue = ref('')
const locations = ref<RecyclePoint[]>([])
const allLocations = ref<RecyclePoint[]>([])
const loading = ref(false)
const userLat = ref<number | undefined>(undefined)
const userLon = ref<number | undefined>(undefined)

onMounted(() => {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      userLat.value = res.latitude
      userLon.value = res.longitude
      fetchPoints()
    },
    fail: () => {
      toast.info('无法获取位置，显示全部回收点')
      fetchPoints()
    }
  })
})

/** 下拉刷新 */
onPullDownRefresh(async () => {
  await fetchPoints()
  uni.stopPullDownRefresh()
})

const fetchPoints = async () => {
  loading.value = true
  try {
    const data = await RecyclePointService.getRecyclePointsApiV1RecyclePointsGet(
      userLat.value,
      userLon.value
    )
    allLocations.value = data
    locations.value = data
  } catch (e) {
    toast.error('获取回收点失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (!searchValue.value) {
    locations.value = allLocations.value
    return
  }
  const keyword = searchValue.value.toLowerCase()
  locations.value = allLocations.value.filter(
    item => item.name.toLowerCase().includes(keyword)
      || item.address.toLowerCase().includes(keyword)
  )
}

const goBack = () => uni.navigateBack()

const handleCall = (phone: string) => {
  uni.makePhoneCall({ phoneNumber: phone })
}

const handleNav = (item: RecyclePoint) => {
  uni.openLocation({
    latitude: item.latitude,
    longitude: item.longitude,
    name: item.name,
    address: item.address
  })
}
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $bg-color;
  min-height: 100vh;
}

.search-box {
  padding: 10px 16px;
  background: $white;
}

/* C: 骨架屏替代 loading */
.map-placeholder {
  height: 200px;
  background: $bg-color;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;

  .skeleton-map {
    position: relative;
    width: 80%;
    height: 120px;
    .sk-block { @include skeleton-shimmer; }
    .sk-map-bg { width: 100%; height: 100%; border-radius: 16rpx; }
    .sk-map-pin {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -80%);
      width: 24rpx;
      height: 32rpx;
      border-radius: 50% 50% 50% 0;
      background: rgba($primary-color, 0.3);
    }
  }

  .sk-hint {
    font-size: 24rpx;
    color: $text-light;
  }
}

.location-list {
  padding: 16px;
  .list-header {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
    color: $text-main;
  }
}

/* C+E: 卡片统一圆角阴影 + 按压反馈 + 入场动画 */
.loc-card {
  margin-bottom: 12px;
  border-radius: 24rpx !important;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03) !important;
  transition: transform 0.15s ease;
  @include list-item-enter;
  &:active {
    transform: scale(0.985);
  }
}

.loc-info {
  .loc-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    .name { font-size: 16px; font-weight: bold; color: $text-main; }
    .dist { font-size: 12px; color: $primary-color; }
  }
  .address { font-size: 13px; color: $text-sub; display: block; margin-bottom: 8px; }
  .tags {
    display: flex;
    gap: 6px;
    .tag {
      font-size: 10px;
      color: $text-light;
      background: $border-color;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }
}

.loc-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* A+B: 精致空状态（双圈渐变插图） */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;

  .empty-illustration {
    @include empty-illustration($primary-color);
  }

  .empty-title { font-size: 30rpx; font-weight: 600; color: $text-main; margin-bottom: 12rpx; }
  .empty-desc { font-size: 24rpx; color: $text-light; }
}
</style>