<template>
  <view class="container">
    <wd-navbar title="系统设置" left-arrow fixed placeholder @click-left="goBack" safe-area-inset-top />
    <view class="content">
      <wd-cell-group border custom-style="border-radius: 12px; overflow: hidden;">
        <wd-cell title="清除缓存" is-link @click="clearCache" />
        <wd-cell title="当前版本" :value="version" />
      </wd-cell-group>
    </view>
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { useToast } from 'wot-design-uni'

const toast = useToast()
const version = '1.0.0'
const goBack = () => uni.navigateBack()

const clearCache = () => {
  uni.clearStorageSync()
  toast.success('缓存已清除')
}
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
</style>
