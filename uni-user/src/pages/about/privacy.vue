<template>
  <view class="container">
    <wd-navbar title="隐私协议" left-arrow fixed placeholder @click-left="goBack" safe-area-inset-top />
    
    <scroll-view scroll-y class="content-scroll">
      <view class="article">
        <view class="section">
          <text class="p">感谢您选择 Green Recycle。我们非常重视您的个人信息和隐私保护。在您使用我们的服务前，请认真阅读本协议。</text>
        </view>

        <view class="section">
          <view class="h2">1. 信息收集</view>
          <text class="p">为了向您提供回收服务，我们可能会收集您的以下信息：</text>
          <text class="li">· 身份信息（如姓名、联系电话）</text>
          <text class="li">· 位置信息（用于上门回收服务）</text>
          <text class="li">· 设备信息（用于保障账号安全）</text>
        </view>

        <view class="section">
          <view class="h2">2. 信息使用</view>
          <text class="p">收集的信息将用于以下用途：</text>
          <text class="li">· 订单处理与回收员上门指引</text>
          <text class="li">· 积分结算与发放</text>
          <text class="li">· 客户服务与意见反馈处理</text>
        </view>

        <view class="section">
          <view class="h2">3. 信息共享</view>
          <text class="p">我们承诺不会将您的个人信息出售给第三方。仅在以下情况下共享：</text>
          <text class="li">· 经您明确同意后共享</text>
          <text class="li">· 向承担回收任务的工作人员提供必要的联系方式</text>
          <text class="li">· 根据法律法规要求必须提供的情况</text>
        </view>

        <view class="section">
          <view class="h2">4. 信息安全</view>
          <text class="p">我们采用加密技术及严格的安全管理流程，防止您的信息在传输或存储过程中被泄露、滥用或篡改。</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
const goBack = () => uni.navigateBack()
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $white;
  min-height: 100vh;
}

.content-scroll {
  height: calc(100vh - 44px);
}

.article {
  padding: 24px 20px;
  .section {
    margin-bottom: 24px;
    .h2 {
      font-size: 18px;
      font-weight: bold;
      color: $text-main;
      margin-bottom: 12px;
    }
    .p {
      font-size: 14px;
      color: $text-sub;
      line-height: 1.6;
      display: block;
      margin-bottom: 8px;
    }
    .li {
      font-size: 14px;
      color: $text-sub;
      line-height: 1.8;
      display: block;
      padding-left: 12px;
    }
  }
}
</style>

