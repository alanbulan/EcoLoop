<template>
  <view class="container">
    <wd-navbar title="我的积分" left-arrow fixed placeholder @click-left="handleBack" safe-area-inset-top />
    
    <view class="points-header">
      <view class="points-card">
        <text class="label">当前积分</text>
        <text class="value">{{ pointsData.current_points }}</text>
        <view class="points-footer">
          <view class="footer-item">
            <text class="f-label">今日获得</text>
            <text class="f-value">+{{ pointsData.today_points }}</text>
          </view>
          <view class="footer-line"></view>
          <view class="footer-item">
            <text class="f-label">累计获得</text>
            <text class="f-value">{{ pointsData.total_points }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- T2+T3: 积分快捷入口 -->
    <view class="points-actions">
      <view class="action-btn" @click="goShop">
        <wd-icon name="shop" size="22px" color="#07c160" />
        <text class="action-text">积分商城</text>
      </view>
      <view class="action-btn" @click="goReferral">
        <wd-icon name="user-group" size="22px" color="#3b82f6" />
        <text class="action-text">邀请好友</text>
      </view>
    </view>

    <view class="history-section">
      <view class="section-header">
        <text class="title">积分明细</text>
      </view>
      
      <wd-cell-group border custom-style="border-radius: 16px; overflow: hidden;">
        <wd-cell v-for="(item, index) in pointsData.history" :key="index" :title="item.reason" :label="item.date">
          <template #value>
            <text :class="['amount', item.type]">{{ item.type === 'in' ? '+' : '-' }}{{ item.amount }}</text>
          </template>
        </wd-cell>
      </wd-cell-group>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { UserService } from '../../api/services/UserService'
import type { UserPoints } from '../../api/models/UserPoints'

const userStore = useUserStore()
const pointsData = ref<UserPoints>({
  current_points: 0,
  today_points: 0,
  total_points: 0,
  history: []
})

onMounted(() => {
  fetchPoints()
})

onPullDownRefresh(async () => {
  await fetchPoints()
  uni.stopPullDownRefresh()
})

const fetchPoints = async () => {
  if (!userStore.userId) return
  try {
    const data = await UserService.getUserPointsApiV1UsersUserIdPointsGet(userStore.userId)
    pointsData.value = data
  } catch (e) {
    console.error('Failed to fetch points', e)
  }
}

const handleBack = () => {
  uni.navigateBack()
}

/** T2: 跳转邀请好友 */
const goReferral = () => {
  uni.navigateTo({ url: '/pages/referral/referral' })
}

/** T3: 跳转积分商城 */
const goShop = () => {
  uni.navigateTo({ url: '/pages/shop/shop' })
}
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $bg-color;
  min-height: 100vh;
}

/* D: 积分头部渐变品牌感升级 */
.points-header {
  padding: 20px 16px;
  background: linear-gradient(135deg, $primary-color 0%, #06ad56 50%, $bg-color 100%);
  
  .points-card {
    background: $white;
    border-radius: 24rpx;
    padding: 30px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.06);
    
    .label {
      font-size: 14px;
      color: $text-sub;
      margin-bottom: 8px;
    }
    
    .value {
      font-size: 40px;
      font-weight: bold;
      color: $text-main;
      margin-bottom: 24px;
      /* D: 数字微动效 */
      @include number-animate;
    }
    
    .points-footer {
      width: 100%;
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-top: 1px solid $border-color;
      padding-top: 20px;
      
      .footer-item {
        text-align: center;
        .f-label { font-size: 12px; color: $text-light; display: block; }
        .f-value { font-size: 16px; font-weight: 600; color: $text-main; }
      }
      
      .footer-line { width: 1px; height: 20px; background: $border-color; }
    }
  }
}

/* T2+T3: 积分快捷入口 */
.points-actions {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  margin-bottom: 20px;

  .action-btn {
    flex: 1;
    background: $white;
    border-radius: 24rpx;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
    transition: transform 0.15s ease;

    &:active { transform: scale(0.97); }

    .action-text {
      font-size: 14px;
      font-weight: 600;
      color: $text-main;
    }
  }
}

.history-section {
  padding: 0 16px 30px;
  
  .section-header {
    margin-bottom: 12px;
    .title { font-size: 16px; font-weight: bold; color: $text-main; }
  }
  
  .amount {
    font-size: 16px;
    font-weight: bold;
    &.in { color: $primary-color; }
    &.out { color: $error-color; }
  }
}
</style>
