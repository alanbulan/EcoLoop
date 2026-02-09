<template>
  <view class="container">
    <wd-navbar title="功能介绍" left-arrow fixed placeholder @click-left="goBack" safe-area-inset-top />
    
    <view class="intro-header">
      <view class="title-main">Green Recycle</view>
      <view class="title-sub">让回收变得更简单、更环保</view>
    </view>

    <view class="feature-list">
      <view class="feature-item" v-for="(item, index) in features" :key="index">
        <view class="item-icon">
          <wd-icon :name="item.icon" size="32px" color="#07c160" />
        </view>
        <view class="item-content">
          <text class="name">{{ item.name }}</text>
          <text class="desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>

    <view class="how-it-works">
      <view class="section-title">回收流程</view>
      <view class="steps">
        <view class="step">
          <view class="step-num">1</view>
          <text class="step-text">在线预约</text>
        </view>
        <view class="step-line"></view>
        <view class="step">
          <view class="step-num">2</view>
          <text class="step-text">上门回收</text>
        </view>
        <view class="step-line"></view>
        <view class="step">
          <view class="step-num">3</view>
          <text class="step-text">获得收益</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const goBack = () => uni.navigateBack()

const features = [
  { name: '在线预约', desc: '随时随地提交回收订单，专业人员准时上门', icon: 'time' },
  { name: '实时行情', desc: '价格公开透明，每日更新，绝无隐形扣费', icon: 'chart-bar' },
  { name: '多种品类', desc: '支持旧衣、塑料、金属、废纸等多种资源回收', icon: 'app' },
  { name: '积分奖励', desc: '每次回收均可获得积分，兑换丰厚礼品或现金', icon: 'money-circle' }
]
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $white;
  min-height: 100vh;
}

.intro-header {
  padding: 40px 20px;
  background: linear-gradient(180deg, rgba(7, 193, 96, 0.1) 0%, $white 100%);
  text-align: center;
  .title-main { font-size: 28px; font-weight: bold; color: $text-main; margin-bottom: 8px; }
  .title-sub { font-size: 14px; color: $text-sub; }
}

.feature-list {
  padding: 0 20px;
  .feature-item {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 32px;
    @include list-item-enter;
    .item-icon {
      width: 64px;
      height: 64px;
      background: rgba(7, 193, 96, 0.04);
      border-radius: 16px;
      @include flex-center;
    }
    .item-content {
      flex: 1;
      .name { font-size: 18px; font-weight: bold; color: $text-main; display: block; margin-bottom: 4px; }
      .desc { font-size: 13px; color: $text-light; line-height: 1.5; }
    }
  }
}

.how-it-works {
  margin: 40px 20px;
  padding: 24px;
  background: $bg-color;
  border-radius: 20px;
  .section-title { font-size: 16px; font-weight: bold; margin-bottom: 24px; text-align: center; }
  .steps {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      .step-num {
        width: 24px;
        height: 24px;
        background: $primary-color;
        color: $white;
        border-radius: 50%;
        @include flex-center;
        font-size: 12px;
        font-weight: bold;
      }
      .step-text { font-size: 12px; color: $text-main; font-weight: 500; }
    }
    .step-line { flex: 1; height: 1px; background: $border-color; margin: 0 10px; margin-bottom: 24px; }
  }
}
</style>
