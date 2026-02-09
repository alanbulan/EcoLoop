<template>
  <view class="container">
    <wd-navbar title="关于我们" left-arrow fixed placeholder @click-left="goBack" safe-area-inset-top />
    <view class="content">
      <view class="logo-section">
        <view class="app-icon">
          <wd-icon name="goods" size="48px" color="#3D5afe" />
        </view>
        <text class="app-name">Green Recycle</text>
        <text class="app-desc">回收员工作台</text>
        <text class="app-ver">v1.0.0</text>
      </view>
      <wd-cell-group border custom-style="border-radius: 12px; overflow: hidden; margin-top: 48rpx;">
        <wd-cell title="服务协议" is-link />
        <wd-cell title="隐私政策" is-link />
        <wd-cell title="检查更新" is-link @click="checkUpdate" />
      </wd-cell-group>
      <view class="copyright">Copyright 2026 Green Recycle</view>
    </view>
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { useToast } from 'wot-design-uni'

const toast = useToast()
const goBack = () => uni.navigateBack()
const checkUpdate = () => toast.info('已是最新版本')
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
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 0 32rpx;
  .app-icon {
    width: 120rpx;
    height: 120rpx;
    background: linear-gradient(135deg, #e8eaff 0%, #f0f4ff 100%);
    border-radius: 28rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 24rpx;
  }
  .app-name {
    font-size: 36rpx;
    font-weight: 800;
    color: $text-main;
    margin-bottom: 8rpx;
  }
  .app-desc {
    font-size: 24rpx;
    color: $text-light;
    margin-bottom: 8rpx;
  }
  .app-ver {
    font-size: 22rpx;
    color: $text-light;
  }
}
.copyright {
  text-align: center;
  color: $text-light;
  font-size: 22rpx;
  margin-top: 80rpx;
}
</style>
