<template>
  <view class="container">
    <wd-navbar title="邀请好友" left-arrow fixed placeholder @click-left="handleBack" safe-area-inset-top />

    <!-- 邀请码卡片 -->
    <view class="invite-header">
      <view class="invite-card">
        <view class="card-title">
          <wd-icon name="user-group" size="20px" color="#07c160" />
          <text class="title-text">我的邀请码</text>
        </view>
        <view class="code-display">
          <text class="code-text">{{ referralInfo.invite_code || '加载中...' }}</text>
        </view>
        <wd-button type="success" block size="large" @click="copyInviteCode" :disabled="!referralInfo.invite_code">
          复制邀请码
        </wd-button>
        <text class="invite-tip">分享邀请码给好友，双方均可获得积分奖励</text>
      </view>
    </view>

    <!-- 奖励说明 -->
    <view class="reward-section">
      <view class="section-header">
        <text class="title">奖励规则</text>
      </view>
      <view class="reward-rules">
        <view class="rule-item">
          <view class="rule-icon inviter">
            <wd-icon name="gift" size="18px" color="#fff" />
          </view>
          <view class="rule-content">
            <text class="rule-title">邀请人奖励</text>
            <text class="rule-desc">好友绑定邀请码后，您获得 100 积分</text>
          </view>
        </view>
        <view class="rule-item">
          <view class="rule-icon invitee">
            <wd-icon name="gift" size="18px" color="#fff" />
          </view>
          <view class="rule-content">
            <text class="rule-title">被邀请人奖励</text>
            <text class="rule-desc">绑定邀请码后，您获得 50 积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 推荐统计 -->
    <view class="stats-section">
      <view class="section-header">
        <text class="title">邀请统计</text>
      </view>
      <view class="stats-card">
        <view class="stat-item">
          <text class="stat-num">{{ referralInfo.referral_count }}</text>
          <text class="stat-label">已邀请(人)</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-num">{{ referralInfo.total_reward_points }}</text>
          <text class="stat-label">获得积分</text>
        </view>
      </view>
    </view>

    <!-- 绑定邀请码 -->
    <view class="bind-section">
      <view class="section-header">
        <text class="title">绑定邀请码</text>
      </view>
      <view class="bind-card">
        <wd-input
          v-model="inputCode"
          placeholder="请输入好友的邀请码"
          clearable
          :maxlength="6"
          :disabled="hasBound"
          custom-style="background: #f7f8fa; border-radius: 12px; padding: 0 16px;"
        />
        <wd-button
          type="success"
          block
          size="large"
          :loading="loading"
          :disabled="hasBound || !inputCode"
          custom-style="margin-top: 16px;"
          @click="bindCode"
        >
          {{ hasBound ? '已绑定' : '绑定邀请码' }}
        </wd-button>
      </view>
    </view>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
/**
 * T2: 邀请好友页面 — 容器组件
 * 业务逻辑抽离至 composables/useReferral.ts
 */
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useReferral } from './composables/useReferral'

const {
  referralInfo,
  inputCode,
  loading,
  hasBound,
  copyInviteCode,
  bindCode,
  fetchInfo,
  handleBack,
} = useReferral()

/** 下拉刷新 */
onPullDownRefresh(async () => {
  await fetchInfo()
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $bg-color;
  min-height: 100vh;
}

.invite-header {
  padding: 20px 16px;
  background: linear-gradient(135deg, $primary-color 0%, #06ad56 50%, $bg-color 100%);

  .invite-card {
    @include card;
    text-align: center;

    .card-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 20px;
      .title-text { font-size: 16px; font-weight: bold; color: $text-main; }
    }

    .code-display {
      background: $bg-color;
      border-radius: 16rpx;
      padding: 24px;
      margin-bottom: 20px;
      .code-text {
        font-size: 32px;
        font-weight: 800;
        color: $primary-color;
        letter-spacing: 6px;
      }
    }

    .invite-tip {
      display: block;
      margin-top: 12px;
      font-size: 12px;
      color: $text-light;
    }
  }
}

.reward-section, .stats-section, .bind-section {
  padding: 0 16px;
  margin-bottom: 20px;
}

.section-header {
  margin-bottom: 12px;
  .title { font-size: 16px; font-weight: bold; color: $text-main; }
}

.reward-rules {
  @include card;

  .rule-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    @include list-item-enter;

    &:not(:last-child) { border-bottom: 1px solid $border-color; }

    .rule-icon {
      width: 40px; height: 40px;
      border-radius: 50%;
      @include flex-center;
      &.inviter { background: $primary-color; }
      &.invitee { background: #3b82f6; }
    }

    .rule-content {
      .rule-title { font-size: 14px; font-weight: 600; color: $text-main; display: block; }
      .rule-desc { font-size: 12px; color: $text-sub; margin-top: 4px; display: block; }
    }
  }
}

.stats-card {
  @include card;
  display: flex;
  align-items: center;
  justify-content: space-around;
  transition: transform 0.15s ease;
  &:active { transform: scale(0.985); }

  .stat-item {
    text-align: center;
    .stat-num { font-size: 24px; font-weight: 800; color: $primary-color; display: block; }
    .stat-label { font-size: 12px; color: $text-light; margin-top: 4px; display: block; }
  }

  .stat-divider { width: 1px; height: 30px; background: $border-color; }
}

.bind-card {
  @include card;
  transition: transform 0.15s ease;
  &:active { transform: scale(0.985); }
}
</style>
