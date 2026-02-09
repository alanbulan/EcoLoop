<template>
  <view class="container">
    <!-- Custom Navbar -->
    <wd-navbar 
      title="回收员工作台" 
      fixed 
      placeholder 
      :bordered="false"
      safe-area-inset-top
      custom-class="custom-nav"
    >
      <template #left>
        <view class="user-brief" v-if="userInfo">
          <wd-img round width="32px" height="32px" :src="userInfo?.avatar_url || '/static/logo.png'" />
          <text class="user-name">{{ userInfo.name }}</text>
        </view>
      </template>
    </wd-navbar>

    <!-- Stats Card -->
    <view class="stats-section">
      <view class="stats-card">
        <view class="stat-item">
          <text class="val">{{ stats.balance || '0.00' }}</text>
          <text class="lab">今日收益(元)</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="val">{{ stats.month_count || '0' }}</text>
          <text class="lab">本月完成</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="val">{{ stats.rating || '5.0' }}</text>
          <text class="lab">服务评分</text>
        </view>
      </view>
    </view>

    <!-- Tabs -->
    <view class="tab-wrap">
      <wd-tabs v-model="activeTab" sticky @change="handleTabChange" custom-class="custom-tabs">
        <wd-tab title="新订单" name="new">
          <view class="badge-dot" v-if="newOrdersCount > 0"></view>
        </wd-tab>
        <wd-tab title="进行中" name="ongoing" />
      </wd-tabs>
    </view>

    <!-- Order List -->
    <scroll-view 
      class="list-area" 
      scroll-y 
      @refresherrefresh="onRefresh" 
      :refresher-enabled="true" 
      :refresher-triggered="isRefreshing"
    >
      <!-- A: 精致空状态 -->
      <view v-if="displayOrders.length === 0 && !isRefreshing" class="empty-state">
        <view class="empty-illustration">
          <wd-icon name="list" size="48px" color="rgba(61,90,254,0.6)" />
        </view>
        <text class="empty-title">暂无相关订单</text>
        <text class="empty-desc">{{ activeTab === 'new' ? '新订单会实时推送到这里' : '接单后订单会显示在这里' }}</text>
      </view>

      <!-- 骨架屏: 订单加载中 -->
      <view v-if="displayOrders.length === 0 && isRefreshing" class="skeleton-orders">
        <view class="sk-order" v-for="i in 3" :key="i">
          <view class="sk-header">
            <view class="sk-block sk-id"></view>
            <view class="sk-block sk-badge"></view>
          </view>
          <view class="sk-body">
            <view class="sk-block sk-line-long"></view>
            <view class="sk-block sk-line-mid"></view>
          </view>
          <view class="sk-footer">
            <view class="sk-block sk-btn"></view>
          </view>
        </view>
      </view>
      
      <view class="order-list">
        <wd-card 
          v-for="order in displayOrders" 
          :key="order.id" 
          custom-class="order-card-refined"
        >
          <template #title>
            <view class="card-header">
              <view class="order-no">
                <text class="label">订单号</text>
                <text class="value">{{ order.id }}</text>
              </view>
              <view :class="['status-tag', order.status]">
                {{ formatStatus(order.status || '') }}
              </view>
            </view>
          </template>

          <view class="card-body">
            <view class="info-item">
              <view class="icon-box location">
                <wd-icon name="location" size="16px" color="#3D5afe" />
              </view>
              <view class="content">
                <text class="address">{{ order.address }}</text>
                <text class="distance">{{ calculateDistance(order) === '--' ? '距离未知' : `距离您 ${calculateDistance(order)}km` }}</text>
              </view>
            </view>
            <view class="info-item">
              <view class="icon-box time">
                <wd-icon name="time" size="16px" color="#8e8e93" />
              </view>
              <view class="content">
                <text class="time-val">{{ formatTime(order.date) }}</text>
              </view>
            </view>
            <view class="info-item" v-if="order.remark">
              <view class="icon-box note">
                <wd-icon name="edit-1" size="16px" color="#8e8e93" />
              </view>
              <view class="content">
                <text class="note-text">{{ order.remark }}</text>
              </view>
            </view>
          </view>

          <template #footer>
            <view class="card-footer">
              <wd-button 
                v-if="order.status === 'pending'" 
                type="primary" 
                size="large" 
                block
                round
                :loading="assigningId === order.id"
                @click="handleAssign(order.id)"
              >
                立即抢单
              </wd-button>
              <view v-if="order.status === 'scheduled'" class="btn-group">
                <wd-button size="large" plain round @click="handleCall(order)">
                  <wd-icon name="phone" size="16px" />
                  联系客户
                </wd-button>
                <wd-button 
                  type="warning" 
                  size="large" 
                  round 
                  @click="showCompleteDialog(order)"
                >
                  去结算
                </wd-button>
              </view>
            </view>
          </template>
        </wd-card>
      </view>
      
      <view class="list-footer" v-if="displayOrders.length > 0">
        <wd-divider>到底啦</wd-divider>
      </view>
    </scroll-view>

    <!-- Settle Popup -->
    <!-- 小程序兼容: 底部弹窗添加 safe-area-inset-bottom -->
    <wd-popup v-model="showModal" position="bottom" custom-class="settle-popup" round safe-area-inset-bottom lock-scroll>
      <view class="popup-content">
        <view class="popup-header">
          <text class="title">订单结算</text>
          <wd-icon name="close" size="24px" color="#999" @click="showModal = false" />
        </view>
        <view class="popup-body">
          <view class="input-section">
            <wd-input
              v-model="form.actual_weight"
              label="实际重量"
              placeholder="请输入重量"
              type="digit"
              suffix="kg"
              size="large"
              focus
            />
            <wd-input
              v-model="form.impurity_percent"
              label="杂质扣除"
              placeholder="请输入杂质率"
              type="digit"
              suffix="%"
              size="large"
            />
          </view>

          <view class="price-card" v-if="form.actual_weight">
            <view class="price-row">
              <text class="label">预计收益</text>
              <view class="price-val">
                <text class="symbol">¥</text>
                <text class="num">{{ calculatePrice() }}</text>
              </view>
            </view>
            <view class="price-detail">
              <text>单价: ¥{{ currentOrder?.unit_price_snapshot }}/kg</text>
              <text>净重: {{ (parseFloat(form.actual_weight) * (1 - parseFloat(form.impurity_percent || '0')/100)).toFixed(2) }}kg</text>
            </view>
          </view>
        </view>
        <view class="popup-footer">
          <wd-button block size="large" round @click="handleComplete">确认结算并完成</wd-button>
        </view>
      </view>
    </wd-popup>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
/**
 * P3修复: 核心业务逻辑已抽离至 composables/useOrderList.ts
 * 此容器组件仅负责事件编排和 UI 绑定
 */
import { onMounted } from 'vue'
import { useToast } from 'wot-design-uni'
import { useUserStore } from '../../stores/user'
import { storeToRefs } from 'pinia'
import { useOrderList } from './composables/useOrderList'
import type { Order } from '../../api'

const userStore = useUserStore()
const { collectorId, userInfo } = storeToRefs(userStore)
const toast = useToast()

const {
  activeTab,
  stats,
  isRefreshing,
  assigningId,
  showModal,
  currentOrder,
  form,
  newOrdersCount,
  displayOrders,
  fetchData,
  calculateDistance,
  calculatePrice,
  handleAssign: doAssign,
  showCompleteDialog,
  handleComplete: doComplete,
} = useOrderList(collectorId)

onMounted(async () => {
  if (!collectorId.value) {
    await userStore.login()
  }
  fetchData().catch(() => toast.error('加载失败'))
})

const onRefresh = () => {
  fetchData().catch(() => toast.error('加载失败'))
}

const handleTabChange = ({ name }: { name: string }) => {
  activeTab.value = name
}

const handleAssign = async (orderId: number) => {
  const success = await doAssign(orderId)
  if (success) {
    toast.success('抢单成功')
  }
}

const handleCall = (order: Order) => {
  // 使用订单中的 contact_phone 字段联系客户
  const phone = order.contact_phone
  if (!phone) {
    toast.info('该订单暂无联系电话')
    return
  }
  uni.makePhoneCall({ phoneNumber: phone })
}

const handleComplete = async () => {
  try {
    toast.loading('结算中...')
    await doComplete()
    toast.success('结算完成')
  } catch (e: unknown) {
    const err = e as Error
    toast.error(err.message || '结算失败')
  }
}

const formatStatus = (s: string) => {
  // I6修复: 增加 cancelled 状态显示
  const map: Record<string, string> = { 'pending': '待抢单', 'scheduled': '待回收', 'completed': '已完成', 'cancelled': '已取消' }
  return map[s] || s
}

const formatTime = (t: string) => {
  if (!t) return ''
  const date = new Date(t)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $bg-color;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.custom-nav {
  --navbar-background-color: #{$white};
  .user-brief {
    display: flex;
    align-items: center;
    gap: 8px;
    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: $text-main;
    }
  }
}

.stats-section {
  padding: 16px;
  background: $white;
}

.stats-card {
  background: linear-gradient(135deg, $primary-color 0%, #5c7cff 100%);
  border-radius: 24rpx;
  padding: 40rpx 20rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 12rpx 32rpx rgba(61, 90, 254, 0.2);

  .stat-item {
    text-align: center;
    flex: 1;
    .val {
      font-size: 36rpx;
      font-weight: 800;
      color: $white;
      display: block;
      margin-bottom: 8rpx;
      /* D: 数字微动效 */
      @include number-animate;
    }
    .lab {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
  .stat-divider {
    width: 1rpx;
    height: 40rpx;
    background: rgba(255, 255, 255, 0.2);
  }
}

.tab-wrap {
  background: $white;
  position: sticky;
  top: 0;
  z-index: 10;
  .badge-dot {
    position: absolute;
    top: -4px;
    right: -8px;
    width: 8px;
    height: 8px;
    background: $error-color;
    border-radius: 50%;
    border: 2px solid #fff;
  }
}

.list-area {
  flex: 1;
}

.order-list {
  padding: 12px 16px;
}

/* C+E: 卡片统一圆角阴影 + 按压反馈 + 入场动画 */
.order-card-refined {
  margin-bottom: 16px !important;
  border-radius: 24rpx !important;
  border: none !important;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03) !important;
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  @include list-item-enter;
  &:active {
    transform: scale(0.985);
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06) !important;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  .order-no {
    .label { font-size: 24rpx; color: $text-light; margin-right: 8rpx; }
    .value { font-size: 24rpx; color: $text-sub; font-weight: 500; }
  }
  .status-tag {
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    border-radius: 8rpx;
    font-weight: 600;
    &.pending { color: $primary-color; background: rgba(61, 90, 254, 0.1); }
    &.scheduled { color: $warning-color; background: rgba(255, 149, 0, 0.1); }
    &.completed { color: $success-color; background: rgba(52, 199, 89, 0.1); }
    &.cancelled { color: $error-color; background: rgba(255, 77, 79, 0.1); }
  }
}

.card-body {
  padding: 8rpx 0;
  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 20rpx;
    margin-bottom: 24rpx;
    &:last-child { margin-bottom: 0; }
    
    .icon-box {
      width: 48rpx;
      height: 48rpx;
      border-radius: 12rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      background: $bg-color;
      &.location { background: rgba(61, 90, 254, 0.05); }
    }
    
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      .address { font-size: 28rpx; color: $text-main; font-weight: 600; line-height: 1.4; margin-bottom: 4rpx; }
      .distance { font-size: 22rpx; color: $primary-color; font-weight: 500; }
      .time-val { font-size: 26rpx; color: $text-sub; }
      .note-text { font-size: 26rpx; color: $text-light; font-style: italic; }
    }
  }
}

.card-footer {
  margin-top: 24rpx;
  .btn-group {
    display: flex;
    gap: 20rpx;
    button { flex: 1; }
  }
}

/* A+B: 精致空状态（双圈渐变插图） */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;

  .empty-illustration {
    @include empty-illustration($primary-color);
  }

  .empty-title { font-size: 30rpx; font-weight: 600; color: $text-main; margin-bottom: 12rpx; }
  .empty-desc { font-size: 24rpx; color: $text-light; }
}

.settle-popup {
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
      .input-section {
        background: $bg-color;
        border-radius: 20rpx;
        padding: 12rpx;
        margin-bottom: 32rpx;
      }
    }
    .price-card {
      background: linear-gradient(135deg, #fff9f0 0%, #fff1db 100%);
      border: 1px solid #ffe4bc;
      padding: 32rpx;
      border-radius: 20rpx;
      .price-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;
        .label { font-size: 28rpx; color: $warning-color; font-weight: 500; }
        .price-val {
          .symbol { font-size: 24rpx; color: $error-color; font-weight: bold; }
          .num { font-size: 48rpx; color: $error-color; font-weight: 800; margin-left: 4rpx; }
        }
      }
      .price-detail {
        font-size: 24rpx;
        color: $text-light;
        display: flex;
        justify-content: space-between;
      }
    }
  }
}

.list-footer {
  padding: 40rpx 0 60rpx;
}

/* 骨架屏: 订单列表 */
.skeleton-orders {
  padding: 12px 16px;
  .sk-order {
    background: $white;
    border-radius: 24rpx;
    padding: 32rpx;
    margin-bottom: 16px;
    box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
    .sk-block { @include skeleton-shimmer; }
    .sk-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24rpx;
      .sk-id { width: 50%; height: 24rpx; }
      .sk-badge { width: 80rpx; height: 32rpx; border-radius: 8rpx; }
    }
    .sk-body {
      .sk-line-long { width: 85%; height: 28rpx; margin-bottom: 16rpx; }
      .sk-line-mid { width: 55%; height: 26rpx; }
    }
    .sk-footer {
      margin-top: 24rpx;
      .sk-btn { width: 100%; height: 72rpx; border-radius: 36rpx; }
    }
  }
}
</style>
