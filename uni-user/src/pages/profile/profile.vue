<template>
  <view class="container">
    <wd-navbar title="个人中心" fixed placeholder :bordered="false" safe-area-inset-top />

    <view class="user-header">
      <view class="header-bg"></view>
      <view class="user-card-refined">
        <view class="user-main">
          <wd-img 
            :width="64" 
            :height="64" 
            round 
            :src="userStore.userInfo?.avatar_url || '/static/logo.png'" 
            custom-class="avatar-img"
          />
          <view class="user-info">
            <text class="nickname">{{ userStore.userInfo?.full_name || '环保达人' }}</text>
            <view class="phone-badge">
              <wd-icon name="mobile" size="12px" />
              <text class="phone">{{ userStore.userInfo?.username || '未绑定手机' }}</text>
            </view>
          </view>
        </view>
        
        <view class="stats-grid">
          <view class="stat-box" @click="goOrders">
            <text class="num">{{ stats.recycle_count || 0 }}</text>
            <text class="lab">回收(次)</text>
          </view>
          <view class="stat-line"></view>
          <view class="stat-box">
            <text class="num">{{ Number(stats.carbon_offset || 0).toFixed(1) }}</text>
            <text class="lab">减碳(kg)</text>
          </view>
          <view class="stat-line"></view>
          <view class="stat-box" @click="goWallet">
            <text class="num">{{ Number(stats.total_earnings || 0).toFixed(1) }}</text>
            <text class="lab">收益(元)</text>
          </view>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <!-- P1修复: wd-cell-group 无 border-radius 属性，改用 custom-style -->
      <wd-cell-group border custom-style="border-radius: 16px; overflow: hidden;">
        <wd-cell 
          v-for="item in profileConfig?.menu_items" 
          :key="item.title"
          :title="item.title" 
          is-link 
          @click="handleMenuClick(item)"
        >
          <template #icon>
            <wd-icon :name="item.icon" size="18px" :color="item.color" custom-class="menu-icon" />
          </template>
        </wd-cell>
      </wd-cell-group>
    </view>

    <view class="action-section">
      <wd-button block plain type="error" size="large" @click="handleLogout">退出登录</wd-button>
    </view>

    <wd-message-box />
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
/**
 * 用户个人中心 — 容器组件
 * 业务逻辑已抽离至 composables/useProfile.ts
 */
import { useProfile } from './composables/useProfile'

const {
  profileConfig,
  userStore,
  stats,
  goOrders,
  goWallet,
  handleMenuClick,
  handleLogout,
} = useProfile()
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $bg-color;
  min-height: 100vh;
}

/* D: 个人中心渐变头部 */
.user-header {
  position: relative;
  padding-bottom: 20px;
  
  .header-bg {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 120px;
    background: linear-gradient(135deg, $primary-color 0%, #06ad56 50%, #059b4c 100%);
    opacity: 0.9;
  }
}

.user-card-refined {
  position: relative;
  margin: 10px 16px 0;
  background: $white;
  border-radius: 24rpx;
  padding: 24px;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.05);
  
  .user-main {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    
    .user-info {
      .nickname {
        font-size: 20px;
        font-weight: bold;
        color: $text-main;
        display: block;
        margin-bottom: 6px;
      }
      .phone-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: $bg-color;
        padding: 2px 8px;
        border-radius: 10px;
        color: $text-light;
        font-size: 12px;
      }
    }
  }
}

.stats-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid $border-color;
  
  .stat-box {
    text-align: center;
    flex: 1;
    .num { font-size: 18px; font-weight: 800; color: $text-main; display: block; margin-bottom: 4px; @include number-animate; }
    .lab { font-size: 11px; color: $text-light; }
  }
  .stat-line { width: 1px; height: 20px; background: $border-color; }
}

.menu-section {
  padding: 0 16px;
  margin-bottom: 24px;
  .menu-icon { margin-right: 8px; }
}

.action-section {
  padding: 0 32px;
  margin-top: 40px;
}
</style>
