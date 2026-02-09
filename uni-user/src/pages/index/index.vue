<template>
  <view class="container">
    <!-- Custom Navbar -->
    <wd-navbar 
      title="EcoLoop" 
      fixed 
      placeholder 
      :bordered="false"
      safe-area-inset-top
      custom-class="custom-nav"
    >
      <template #left>
        <wd-icon name="location" size="18px" color="#07c160" />
        <text class="location-text">{{ cityName }}</text>
      </template>
      <template #right>
        <view class="nav-bell" @click="goMessages">
          <wd-icon name="bell" size="20px" color="#333" />
          <view v-if="unreadCount > 0" class="bell-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
        </view>
      </template>
    </wd-navbar>

    <!-- 骨架屏: 首页数据加载中 -->
    <view v-if="!homeConfig && materials.length === 0" class="skeleton-wrap">
      <view class="skeleton-banner">
        <view class="sk-block sk-banner"></view>
      </view>
      <view class="skeleton-stats">
        <view class="sk-block sk-stat" v-for="i in 3" :key="i"></view>
      </view>
      <view class="skeleton-actions">
        <view class="sk-action" v-for="i in 4" :key="i">
          <view class="sk-block sk-action-icon"></view>
          <view class="sk-block sk-action-text"></view>
        </view>
      </view>
      <view class="skeleton-cards">
        <view class="sk-card" v-for="i in 3" :key="i">
          <view class="sk-block sk-card-icon"></view>
          <view class="sk-card-info">
            <view class="sk-block sk-card-title"></view>
            <view class="sk-block sk-card-price"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- Banner — 性能优化: 启用图片懒加载 -->
    <view class="banner-section" v-if="homeConfig?.banners?.length">
      <!-- P0修复: wd-swiper indicator API 已更新，使用 :indicator 对象配置 -->
      <wd-swiper
        :list="homeConfig.banners.map((b: any) => b.image)"
        autoplay
        custom-style="height: 320rpx;"
        :indicator="{ type: 'dots-bar' }"
        lazy-load
        @click="handleBannerClick"
      />
    </view>

    <!-- Statistics Quick Look -->
    <view class="stats-card" v-if="homeConfig?.stats_labels">
      <template v-for="(stat, index) in homeConfig.stats_labels" :key="stat.key">
        <view class="stat-item">
          <text class="val">{{ getStatValue(stat.key) }}</text>
          <text class="lab">{{ stat.label }}</text>
        </view>
        <view class="stat-line" v-if="index < homeConfig.stats_labels.length - 1"></view>
      </template>
    </view>

    <!-- Quick Actions -->
    <view class="quick-actions" v-if="homeConfig?.quick_actions">
      <view 
        v-for="action in homeConfig.quick_actions" 
        :key="action.name" 
        class="action-item"
        @click="handleQuickAction(action)"
      >
        <view class="action-icon-box">
          <wd-icon :name="action.icon" size="24px" color="#07c160" />
        </view>
        <text class="action-name">{{ action.name }}</text>
      </view>
    </view>

    <!-- Materials List -->
    <view class="content-section">
      <view class="section-title-wrap">
        <text class="section-title">实时行情</text>
        <view class="section-more" @click="goHistory">
          <text>价格曲线</text>
          <wd-icon name="arrow-right" size="14px" />
        </view>
      </view>

      <view class="materials-list">
        <wd-card 
          v-for="item in materials" 
          :key="item.id" 
          custom-class="material-card-refined"
        >
          <view class="card-inner">
            <view :class="['mat-icon', 'cat-' + (item.category || 'other').toLowerCase()]">
              {{ item.name[0] }}
            </view>
            <view class="mat-info">
              <text class="mat-name">{{ item.name }}</text>
              <view class="price-box">
                <text class="currency">¥</text>
                <text class="price">{{ item.current_price }}</text>
                <text class="unit">/{{ item.unit }}</text>
              </view>
              <view :class="['trend-box', item.trend]">
                <wd-icon 
                  :name="item.trend === 'up' ? 'chart-up' : item.trend === 'down' ? 'chart-down' : 'minus'" 
                  size="12px" 
                />
                <text>{{ item.trend === 'up' ? '上涨' : item.trend === 'down' ? '下跌' : '平稳' }}</text>
              </view>
            </view>
            <wd-button 
              type="primary" 
              size="small" 
              round 
              @click="handleOrder(item)"
            >
              立即回收
            </wd-button>
          </view>
        </wd-card>
      </view>
    </view>

    <!-- Refined Toast -->
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
/**
 * P3修复: 核心数据逻辑已抽离至 composables/useHome.ts
 * 此容器组件仅负责事件处理和 UI 绑定
 */
import { ref } from 'vue'
import { type Material } from '../../api'
import { useToast } from 'wot-design-uni'
import { useHome } from './composables/useHome'
import { useMessages } from '../messages/composables/useMessages'

const toast = useToast()
const { userId, homeConfig, materials, getStatValue } = useHome()
const { unreadCount, fetchUnreadCount } = useMessages()

// H1修复: 城市名从定位获取，替代硬编码"上海"
const cityName = ref('定位中')
uni.getLocation({
  type: 'gcj02',
  success: (res) => {
    // 逆地理编码需要额外服务，小程序端简化处理
    cityName.value = '当前位置'
  },
  fail: () => {
    cityName.value = '未定位'
  },
})

// 首页加载时获取未读消息数
fetchUnreadCount()

const goMessages = () => {
  uni.navigateTo({ url: '/pages/messages/messages' })
}

const handleOrder = async (item: Material) => {
  if (!userId.value) {
    toast.info('请先登录')
    return
  }
  uni.navigateTo({
    url: `/pages/appointment/appointment?material=${encodeURIComponent(JSON.stringify(item))}`
  })
}

const handleBannerClick = (e: { index: number }) => {
  if (!homeConfig.value?.banners) return
  const banner = homeConfig.value.banners[e.index]
  if (banner && banner.link) {
    uni.navigateTo({ url: banner.link })
  }
}

const handleQuickAction = (action: { name: string; path: string }) => {
  if (action.path === 'scan') {
    uni.scanCode({
      success: () => toast.success('扫码成功'),
      fail: () => toast.error('扫码取消')
    })
  } else if (action.path === 'points') {
    uni.navigateTo({ url: '/pages/points/points' })
  } else if (action.path === 'location') {
    uni.navigateTo({ url: '/pages/location/location' })
  } else if (action.path === 'home') {
    uni.navigateTo({ url: '/pages/appointment/appointment' })
  } else if (action.path === 'referral') {
    uni.navigateTo({ url: '/pages/referral/referral' })
  } else if (action.path === 'shop') {
    uni.navigateTo({ url: '/pages/shop/shop' })
  } else {
    toast.info(`点击了 ${action.name}`)
  }
}

const goHistory = () => {
  uni.navigateTo({ url: '/pages/history/history' })
}
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

/* 全局使用设计令牌 */
.container {
  background-color: $bg-color;
  min-height: 100vh;
}

.custom-nav {
  --navbar-background-color: #{$white};
  .location-text {
    font-size: 14px;
    font-weight: 500;
    margin-left: 4px;
    color: $text-main;
  }
}

.nav-bell {
  position: relative;
  padding: 4px;
  .bell-badge {
    position: absolute;
    top: -2px;
    right: -6px;
    min-width: 16px;
    height: 16px;
    line-height: 16px;
    text-align: center;
    font-size: 10px;
    color: $white;
    background: $error-color;
    border-radius: 8px;
    padding: 0 4px;
  }
}

.banner-section {
  padding: 16px 16px 12px;
}

/* D: 统计卡片渐变品牌感 */
.stats-card {
  margin: 0 16px 20px;
  background: linear-gradient(135deg, $primary-color 0%, #06ad56 50%, #059b4c 100%);
  border-radius: 24rpx;
  padding: 40rpx 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 12rpx 32rpx rgba(7, 193, 96, 0.18);

  .stat-item {
    text-align: center;
    flex: 1;
    .val {
      font-size: 36rpx;
      font-weight: 800;
      color: $white;
      display: block;
      margin-bottom: 8rpx;
      /* D: 数字微动效 */
      @include number-animate;
    }
    .lab {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
  .stat-line {
    width: 1rpx;
    height: 40rpx;
    background: rgba(255, 255, 255, 0.2);
  }
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  padding: 0 20px 20px;
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    .action-icon-box {
      width: 48px;
      height: 48px;
      background: $white;
      border-radius: 14px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .action-name {
      font-size: 12px;
      color: $text-sub;
    }
  }
}

.content-section {
  padding: 0 16px;
  
  .section-title-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: $text-main;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        bottom: 2px;
        left: 0;
        width: 100%;
        height: 6px;
        background: rgba(7, 193, 96, 0.1);
        z-index: -1;
      }
    }
    
    .section-more {
      font-size: 13px;
      color: $text-light;
      display: flex;
      align-items: center;
    }
  }
}

/* C+E: 物料卡片按压反馈 + 入场动画 */
.materials-list {
  .material-card-refined {
    margin-bottom: 12px !important;
    border: none !important;
    border-radius: 24rpx !important;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03) !important;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    @include list-item-enter;
    &:active {
      transform: scale(0.985);
      box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06) !important;
    }
    
    .card-inner {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  }
}

.mat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: $white;
  
  &.cat-paper { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
  &.cat-plastic { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
  &.cat-metal { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
  &.cat-other { background: linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%); }
}

.mat-info {
  flex: 1;
  .mat-name {
    font-size: 16px;
    font-weight: 600;
    color: $text-main;
    display: block;
    margin-bottom: 4px;
  }
  .price-box {
    display: flex;
    align-items: baseline;
    .currency { font-size: 12px; color: $error-color; font-weight: bold; }
    .price { font-size: 20px; color: $error-color; font-weight: 800; margin: 0 2px; }
    .unit { font-size: 11px; color: $text-light; }
  }
  .trend-box {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 4px;
    margin-top: 4px;
    
    &.up { color: $error-color; background: rgba(255,77,79,0.08); }
    &.down { color: $success-color; background: rgba(82,196,26,0.08); }
    &.stable { color: $text-light; background: $bg-color; }
  }
}

/* 骨架屏样式 */
.skeleton-wrap {
  padding: 16px;
}

.sk-block {
  @include skeleton-shimmer;
}

.skeleton-banner {
  margin-bottom: 20px;
  .sk-banner { width: 100%; height: 320rpx; border-radius: 16rpx; }
}

.skeleton-stats {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20px;
  .sk-stat { flex: 1; height: 120rpx; border-radius: 24rpx; }
}

.skeleton-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  .sk-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    .sk-action-icon { width: 48px; height: 48px; border-radius: 14px; }
    .sk-action-text { width: 40px; height: 12px; }
  }
}

.skeleton-cards {
  .sk-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20rpx;
    background: $white;
    border-radius: 24rpx;
    margin-bottom: 12px;
    .sk-card-icon { width: 56px; height: 56px; border-radius: 14px; flex-shrink: 0; }
    .sk-card-info {
      flex: 1;
      .sk-card-title { width: 60%; height: 28rpx; margin-bottom: 12rpx; }
      .sk-card-price { width: 40%; height: 36rpx; }
    }
  }
}
</style>
