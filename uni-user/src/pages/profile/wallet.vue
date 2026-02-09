<template>
  <view class="container">
    <wd-navbar title="我的钱包" left-arrow fixed placeholder @click-left="goBack" safe-area-inset-top />
    
    <view class="wallet-header">
      <view class="balance-card">
        <text class="label">可用余额 (元)</text>
        <view class="amount-wrap">
          <text class="symbol">¥</text>
          <text class="amount">{{ Number(userStore.userInfo?.balance || 0).toFixed(2) }}</text>
        </view>
        <wd-button type="primary" size="large" round block custom-class="withdraw-btn" @click="goOrdersForWithdraw">
          从订单发起提现
        </wd-button>
        <view class="withdraw-tip">提现必须绑定已完成订单</view>
      </view>
    </view>

    <view class="history-section">
      <view class="section-title">交易明细</view>
      <view class="history-list">
        <!-- A: 精致空状态 -->
        <view v-if="withdrawals.length === 0" class="empty">
          <view class="empty-illustration">
            <wd-icon name="money-circle" size="40px" color="rgba(7,193,96,0.6)" />
          </view>
          <text class="empty-title">暂无交易记录</text>
          <text class="empty-desc">完成回收订单后可申请提现</text>
        </view>
        <view v-for="item in withdrawals" :key="item.id" class="history-item">
          <view class="item-left">
            <text class="title">余额提现</text>
            <text class="date">{{ formatDate(item.request_date) }}</text>
          </view>
          <view class="item-right">
            <text class="value">-{{ item.amount }}</text>
            <text :class="['status', item.status]">{{ formatStatus(item.status) }}</text>
          </view>
        </view>
      </view>
    </view>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { WithdrawalService } from '../../api/services/WithdrawalService'
import type { WithdrawalRecord } from '../../api/models/WithdrawalRecord'

const userStore = useUserStore()
const withdrawals = ref<WithdrawalRecord[]>([])

const goBack = () => uni.navigateBack()
const goOrdersForWithdraw = () => uni.switchTab({ url: '/pages/orders/orders' })

onMounted(() => {
  fetchWithdrawals()
})

/** 下拉刷新 */
onPullDownRefresh(async () => {
  await fetchWithdrawals()
  uni.stopPullDownRefresh()
})

const fetchWithdrawals = async () => {
  if (!userStore.userId) return
  try {
    const data = await WithdrawalService.getUserWithdrawalsApiV1WithdrawalsGet(userStore.userId)
    withdrawals.value = (data as WithdrawalRecord[]) || []
  } catch (e) {
    console.warn('获取提现记录失败', e)
  }
}

const formatDate = (d: string) => new Date(d).toLocaleString()
const formatStatus = (s: string) => {
  const map: Record<string, string> = { 'pending': '审核中', 'approved': '已到账', 'rejected': '已拒绝' }
  return map[s] || s
}
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container { background: $bg-color; min-height: 100vh; }
/* D: 钱包头部渐变品牌感升级 */
.wallet-header {
  padding: 20px 16px;
  background: linear-gradient(135deg, $primary-color 0%, #06ad56 50%, $bg-color 100%);
  .balance-card {
    background: $white;
    padding: 30px 24px;
    border-radius: 24rpx;
    box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.06);
    .label { font-size: 14px; color: $text-light; margin-bottom: 12px; display: block; }
    .amount-wrap {
      display: flex;
      align-items: baseline;
      margin-bottom: 30px;
      .symbol { font-size: 24px; font-weight: bold; color: $text-main; margin-right: 4px; }
      .amount { font-size: 48px; font-weight: 800; color: $text-main; line-height: 1; }
    }
    .withdraw-btn { height: 50px; font-size: 16px; font-weight: bold; }
    .withdraw-tip { margin-top: 10px; font-size: 12px; color: $text-light; text-align: center; }
  }
}

.history-section {
  padding: 20px 16px;
  .section-title { font-size: 16px; font-weight: bold; color: $text-main; margin-bottom: 16px; }
  .history-list {
    background: $white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    .empty {
      padding: 60rpx 40rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      .empty-illustration {
        @include empty-illustration($primary-color, 160rpx);
      }
      .empty-title { font-size: 28rpx; font-weight: 600; color: $text-main; margin-bottom: 8rpx; }
      .empty-desc { font-size: 24rpx; color: $text-light; }
    }
    .history-item {
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid $border-color;
      @include list-item-enter;
      &:last-child { border-bottom: none; }
      .item-left {
        .title { font-size: 15px; color: $text-main; font-weight: 500; display: block; margin-bottom: 4px; }
        .date { font-size: 12px; color: $text-light; }
      }
      .item-right {
        text-align: right;
        .value { font-size: 16px; font-weight: bold; color: $text-main; display: block; margin-bottom: 4px; }
        .status { 
          font-size: 11px; padding: 2px 6px; border-radius: 4px;
          &.pending { color: $warning-color; background: rgba(250,140,22,0.1); }
          &.approved { color: $primary-color; background: rgba(7,193,96,0.1); }
        }
      }
    }
  }
}
</style>
