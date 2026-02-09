<template>
  <view class="container">
    <wd-navbar title="我的钱包" left-arrow @click-left="goBack" fixed placeholder :bordered="false" safe-area-inset-top />

    <!-- 余额卡片 -->
    <view class="balance-section">
      <view class="balance-card">
        <text class="label">佣金余额 (元)</text>
        <text class="amount">{{ balance.toFixed(2) }}</text>
        <wd-button type="warning" size="medium" round @click="showForm = true">申请提现</wd-button>
      </view>
    </view>

    <!-- 提现记录 -->
    <view class="record-section">
      <view class="section-header">
        <text class="title">提现记录</text>
        <text class="tip">共 {{ withdrawals.length }} 条</text>
      </view>

      <!-- A: 精致空状态 -->
      <view v-if="withdrawals.length === 0" class="empty-state">
        <view class="empty-illustration">
          <wd-icon name="money-circle" size="48px" color="rgba(61,90,254,0.6)" />
        </view>
        <text class="empty-title">暂无提现记录</text>
        <text class="empty-desc">完成订单后可在此申请佣金提现</text>
      </view>

      <wd-cell-group v-else border custom-style="border-radius: 12px; overflow: hidden;" custom-class="record-group">
        <wd-cell v-for="item in withdrawals" :key="item.id" :label="item.request_date">
          <template #title>
            <view class="record-title">
              <text class="amount-text">¥{{ item.amount.toFixed(2) }}</text>
              <view :class="['status-tag', item.status]">
                {{ formatStatus(item.status) }}
              </view>
            </view>
          </template>
        </wd-cell>
      </wd-cell-group>
    </view>

    <!-- 提现弹窗 -->
    <!-- 小程序兼容: 底部弹窗添加 safe-area-inset-bottom -->
    <wd-popup v-model="showForm" position="bottom" round safe-area-inset-bottom lock-scroll custom-class="withdraw-popup">
      <view class="popup-content">
        <view class="popup-header">
          <text class="title">申请提现</text>
          <wd-icon name="close" size="24px" color="#999" @click="showForm = false" />
        </view>
        <view class="popup-body">
          <view class="balance-preview">
            <text class="lab">可提现金额</text>
            <text class="val">¥{{ balance.toFixed(2) }}</text>
          </view>
          <wd-input
            v-model="amount"
            label="提现金额"
            placeholder="请输入提现金额"
            type="digit"
            prefix="¥"
            size="large"
            focus
          />
        </view>
        <view class="popup-footer">
          <wd-button block size="large" round :loading="submitting" @click="submitWithdrawal">
            确认提现
          </wd-button>
        </view>
      </view>
    </wd-popup>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
/**
 * ⚠️6修复: 回收员佣金钱包页面
 * 容器组件: 仅负责生命周期编排和 UI 绑定
 * 业务逻辑: composables/useWallet.ts
 */
import { onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserStore } from '../../stores/user'
import { storeToRefs } from 'pinia'
import { useWallet } from './composables/useWallet'

const userStore = useUserStore()
const { collectorId } = storeToRefs(userStore)

const {
  balance,
  withdrawals,
  showForm,
  amount,
  submitting,
  fetchData,
  submitWithdrawal,
} = useWallet(collectorId)

onMounted(() => {
  if (collectorId.value) fetchData()
})

/** 下拉刷新 */
onPullDownRefresh(async () => {
  if (collectorId.value) await fetchData()
  uni.stopPullDownRefresh()
})

const goBack = () => uni.navigateBack()

const formatStatus = (s: string) => {
  const map: Record<string, string> = { pending: '审核中', approved: '已到账', rejected: '已拒绝' }
  return map[s] || s
}
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background: $bg-color;
  min-height: 100vh;
}

.balance-section {
  padding: 32rpx;
  background: $white;
}

.balance-card {
  background: linear-gradient(135deg, $primary-color 0%, #5c7cff 100%);
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  color: $white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 12rpx 32rpx rgba(61, 90, 254, 0.2);

  .label { font-size: 24rpx; opacity: 0.8; }
  .amount { font-size: 72rpx; font-weight: 800; letter-spacing: -2rpx; }
}

.record-section {
  padding: 32rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    .title { font-size: 32rpx; font-weight: bold; color: $text-main; }
    .tip { font-size: 24rpx; color: $text-light; }
  }
}

/* A+B: 精致空状态（双圈渐变插图） */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100rpx;

  .empty-illustration {
    @include empty-illustration($primary-color);
  }

  .empty-title { font-size: 30rpx; font-weight: 600; color: $text-main; margin-bottom: 12rpx; }
  .empty-desc { font-size: 24rpx; color: $text-light; }
}

.record-group {
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.02);
}

.record-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .amount-text { font-size: 32rpx; font-weight: 700; color: $text-main; }
  .status-tag {
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    border-radius: 8rpx;
    font-weight: 600;
    &.pending { color: $warning-color; background: rgba(255, 149, 0, 0.1); }
    &.approved { color: $success-color; background: rgba(52, 199, 89, 0.1); }
    &.rejected { color: $error-color; background: rgba(255, 59, 48, 0.1); }
  }
}

.withdraw-popup {
  .popup-content {
    padding: 40rpx 32rpx;
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40rpx;
      .title { font-size: 36rpx; font-weight: bold; color: $text-main; }
    }
    .popup-body {
      margin-bottom: 48rpx;
      .balance-preview {
        display: flex;
        justify-content: space-between;
        background: $bg-color;
        padding: 24rpx;
        border-radius: 16rpx;
        margin-bottom: 32rpx;
        .lab { font-size: 28rpx; color: $text-sub; }
        .val { font-size: 28rpx; color: $primary-color; font-weight: 700; }
      }
    }
  }
}
</style>
