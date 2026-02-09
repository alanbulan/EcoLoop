<template>
  <view class="container">
    <!-- P1修复: wd-navbar 无 transparent 属性，移除 -->
    <wd-navbar title="个人中心" fixed placeholder :bordered="false" safe-area-inset-top />

    <view class="profile-header">
      <view class="header-content">
        <view class="user-info-box">
          <view class="avatar-wrap">
            <wd-img 
              :width="72" 
              :height="72" 
              round 
              :src="userInfo?.avatar_url || '/static/logo.png'"
              custom-class="avatar-shadow"
            />
            <view class="edit-badge">
              <wd-icon name="edit-1" size="12px" color="#fff" />
            </view>
          </view>
          <view class="user-text">
            <text class="nickname">{{ userInfo?.name || '未登录' }}</text>
            <view class="id-badge">
              <wd-icon name="user" size="12px" />
              <text>工号: {{ collectorId?.toString().padStart(3, '0') || '---' }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="header-bg-shape"></view>
    </view>

    <view class="stats-card-wrap">
      <view class="stats-card-inner">
        <view class="stat-item" @click="goOrders">
          <text class="val">{{ stats.month_count || 0 }}</text>
          <text class="lab">本月接单</text>
        </view>
        <view class="stat-line"></view>
        <view class="stat-item">
          <text class="val">{{ Number(stats.rating || 5.0).toFixed(1) }}</text>
          <text class="lab">服务评分</text>
        </view>
        <view class="stat-line"></view>
        <view class="stat-item" @click="goWallet">
          <text class="val">{{ Number(stats.balance || 0).toFixed(2) }}</text>
          <text class="lab">钱包余额</text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <view class="section-title">功能管理</view>
      <!-- P1修复: wd-cell-group 无 border-radius 属性，改用 custom-style -->
      <wd-cell-group border custom-style="border-radius: 12px; overflow: hidden;" custom-class="custom-cell-group">
        <wd-cell title="企业库存" is-link icon="app" @click="goInventory" />
        <!-- G1修复: 菜单项导航到真实页面 -->
        <wd-cell title="任务统计" is-link icon="chart-bar" @click="goStats" />
        <wd-cell title="我的钱包" is-link icon="money-circle" @click="goWallet" />
      </wd-cell-group>

      <view class="section-title">通用设置</view>
      <wd-cell-group border custom-style="border-radius: 12px; overflow: hidden;" custom-class="custom-cell-group">
        <wd-cell title="个人资料" is-link icon="user" @click="goUserInfo" />
        <wd-cell title="系统设置" is-link icon="setting" @click="goSettings" />
        <wd-cell title="关于我们" is-link icon="info-circle" @click="goAbout" />
      </wd-cell-group>
    </view>

    <view class="action-section">
      <wd-button block plain type="error" size="large" round @click="handleLogout">退出登录</wd-button>
    </view>

    <wd-message-box />
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
/**
 * D1修复: 业务逻辑已抽离至 composables/useProfile.ts
 * 此容器组件仅负责生命周期编排和 UI 绑定
 */
import { onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { storeToRefs } from 'pinia'
import { useProfile } from './composables/useProfile'

const userStore = useUserStore()
const { collectorId, userInfo } = storeToRefs(userStore)

const {
  stats,
  fetchStats,
  ensureLogin,
  goInventory,
  goOrders,
  goWallet,
  goStats,
  goUserInfo,
  goSettings,
  goAbout,
  handleLogout,
} = useProfile(collectorId)

onMounted(async () => {
  await ensureLogin()
  fetchStats()
})
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $bg-color;
  min-height: 100vh;
}

.profile-header {
  position: relative;
  height: 440rpx;
  background: linear-gradient(135deg, $primary-color 0%, #5c7cff 100%);
  padding-top: 120rpx;
  overflow: hidden;

  .header-content {
    position: relative;
    z-index: 2;
    padding: 40rpx 48rpx;
  }

  .user-info-box {
    display: flex;
    align-items: center;
    gap: 32rpx;

    .avatar-wrap {
      position: relative;
      .avatar-shadow {
        box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.15);
        border: 4rpx solid rgba(255,255,255,0.3);
      }
      .edit-badge {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 36rpx;
        height: 36rpx;
        background: $warning-color;
        border: 4rpx solid #fff;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    .user-text {
      .nickname {
        font-size: 40rpx;
        font-weight: 800;
        color: $white;
        display: block;
        margin-bottom: 12rpx;
      }
      .id-badge {
        display: inline-flex;
        align-items: center;
        gap: 8rpx;
        background: rgba(255,255,255,0.2);
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        color: $white;
        font-size: 22rpx;
        backdrop-filter: blur(4px);
      }
    }
  }

  .header-bg-shape {
    position: absolute;
    bottom: -100rpx;
    left: -10%;
    width: 120%;
    height: 200rpx;
    background: $bg-color;
    border-radius: 100% 100% 0 0;
    z-index: 1;
  }
}

.stats-card-wrap {
  margin: -60rpx 32rpx 0;
  position: relative;
  z-index: 10;
}

.stats-card-inner {
  background: $white;
  border-radius: 24rpx;
  padding: 40rpx 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.05);

  .stat-item {
    text-align: center;
    flex: 1;
    .val {
      font-size: 36rpx;
      font-weight: 800;
      color: $text-main;
      display: block;
      margin-bottom: 8rpx;
      /* D: 数字微动效 */
      @include number-animate;
    }
    .lab {
      font-size: 22rpx;
      color: $text-light;
    }
  }
  .stat-line {
    width: 2rpx;
    height: 40rpx;
    background: $border-color;
  }
}

.menu-section {
  padding: 40rpx 32rpx;
  
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: $text-sub;
    margin: 32rpx 0 16rpx 8rpx;
  }
  
  .custom-cell-group {
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.02);
    overflow: hidden;
  }
}

.action-section {
  padding: 0 48rpx 80rpx;
  margin-top: 20rpx;
}
</style>
