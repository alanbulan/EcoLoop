<template>
  <view class="container">
    <wd-navbar title="个人资料" left-arrow fixed placeholder @click-left="goBack" safe-area-inset-top />
    <view class="content">
      <wd-cell-group border custom-style="border-radius: 12px; overflow: hidden;">
        <wd-cell title="姓名" :value="userInfo?.name || '--'" />
        <wd-cell title="联系电话" :value="userInfo?.phone || '--'" />
        <wd-cell title="工号" :value="collectorId?.toString().padStart(3, '0') || '--'" />
      </wd-cell-group>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '../../stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { collectorId, userInfo } = storeToRefs(userStore)
const goBack = () => uni.navigateBack()
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
