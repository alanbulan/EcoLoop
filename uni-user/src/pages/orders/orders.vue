<template>
  <view class="container">
    <wd-navbar title="我的订单" fixed placeholder :bordered="false" safe-area-inset-top />

    <view class="order-list">
      <!-- Loading State: 骨架屏替代简单 loading -->
      <view v-if="loading && orders.length === 0" class="skeleton-orders">
        <view class="sk-order" v-for="i in 3" :key="i">
          <view class="sk-header">
            <view class="sk-block sk-id"></view>
            <view class="sk-block sk-badge"></view>
          </view>
          <view class="sk-body">
            <view class="sk-block sk-line-long"></view>
            <view class="sk-block sk-line-short"></view>
          </view>
          <view class="sk-footer">
            <view class="sk-block sk-btn"></view>
          </view>
        </view>
      </view>

      <!-- 精致空状态 -->
      <view v-else-if="orders.length === 0" class="empty-state">
        <view class="empty-illustration">
          <wd-icon name="list" size="48px" color="rgba(7,193,96,0.6)" />
        </view>
        <text class="empty-title">还没有预约记录</text>
        <text class="empty-desc">快去预约回收，为环保出一份力吧</text>
        <wd-button type="primary" size="small" round @click="goHome" custom-class="go-btn">去预约</wd-button>
      </view>

      <!-- Order Cards -->
      <view v-for="order in orders" :key="order.id" class="order-card-wrap" @click="showDetail(order)">
        <wd-card custom-class="refined-order-card">
          <template #title>
            <view class="card-header">
              <view class="order-id-box">
                <wd-icon name="order" size="14px" color="#999" />
                <text class="id-text">单号: {{ order.id }}</text>
              </view>
              <view :class="['status-badge', order.status || '']">
                {{ formatStatus(order.status || '') }}
              </view>
            </view>
          </template>

          <view class="card-body">
            <view class="info-line">
              <text class="label">回收地址</text>
              <text class="value">{{ order.address }}</text>
            </view>
            <view class="info-line">
              <text class="label">预约时间</text>
              <text class="value">{{ formatTime(order.date) }}</text>
            </view>
            
            <view v-if="order.status === 'completed'" class="settle-panel">
              <view class="settle-item">
                <text class="s-val">{{ order.weight_actual || '0' }}<text class="s-unit">kg</text></text>
                <text class="s-lab">实际重量</text>
              </view>
              <view class="settle-line"></view>
              <view class="settle-item">
                <!-- P1修复: 使用后端计算的 amount_final，而非硬编码 * 1.5 -->
                <text class="s-val price">¥{{ order.amount_final || 0 }}</text>
                <text class="s-lab">实际收益</text>
              </view>
            </view>
          </view>

          <template #footer>
            <view class="card-footer">
              <wd-button v-if="order.status === 'pending'" size="small" plain type="error" @click.stop="handleCancel(order.id)">取消预约</wd-button>
              <template v-else-if="order.status === 'completed'">
                <wd-button
                  size="small"
                  plain
                  @click.stop="handleReview(order)"
                  :disabled="!!reviewedOrders[String(order.id)]"
                >
                  {{ reviewedOrders[String(order.id)] ? '已评价' : '评价' }}
                </wd-button>
                <wd-button
                  size="small"
                  type="primary"
                  plain
                  :disabled="!!getWithdrawal(order.id)"
                  @click.stop="handleWithdrawFromOrder(order)"
                >
                  {{ getWithdrawal(order.id) ? formatWithdrawStatus(getWithdrawal(order.id).status) : '申请提现' }}
                </wd-button>
              </template>
            </view>
          </template>
        </wd-card>
      </view>
      
      <wd-loadmore v-if="orders.length > 0" :state="loading ? 'loading' : 'finished'" />
    </view>

    <wd-toast id="wd-toast" />
    <wd-message-box />

    <!-- 自定义底部导航栏: 替代原生 tabBar，图标颜色跟随绿色主题 -->
    <CustomTabBar current="orders" />

    <!-- Order Detail Popup -->
    <!-- 小程序兼容: 弹窗添加 lock-scroll 防止滚动穿透 -->
    <wd-popup v-model="showOrderDetail" position="center" round lock-scroll custom-style="width: 85%; max-height: 70vh;">
      <view class="detail-container">
        <view class="detail-header">
          <text class="title">订单详情</text>
          <wd-icon name="close" size="20px" color="#999" @click="showOrderDetail = false" />
        </view>
        <view class="detail-content" v-if="selectedOrder">
          <view class="detail-item">
            <text class="label">订单编号</text>
            <text class="value">{{ selectedOrder.id }}</text>
          </view>
          <view class="detail-item">
            <text class="label">当前状态</text>
            <text :class="['value', 'status', selectedOrder.status || '']">{{ formatStatus(selectedOrder.status || '') }}</text>
          </view>
          <view class="detail-item">
            <text class="label">回收物品</text>
            <text class="value">{{ selectedOrder.category || '未知物品' }}</text>
          </view>
          <view class="detail-item">
            <text class="label">预约时间</text>
            <text class="value">{{ formatTime(selectedOrder.appointment_time || selectedOrder.date) }}</text>
          </view>
          <view class="detail-item">
            <text class="label">回收地址</text>
            <text class="value">{{ selectedOrder.address }}</text>
          </view>
          <view class="detail-item" v-if="selectedOrder.remark">
            <text class="label">备注信息</text>
            <text class="value">{{ selectedOrder.remark }}</text>
          </view>
          
          <view class="divider" v-if="selectedOrder.status === 'completed'"></view>
          
          <template v-if="selectedOrder.status === 'completed'">
            <view class="detail-item">
              <text class="label">实际重量</text>
              <text class="value highlight">{{ selectedOrder.weight_actual }} kg</text>
            </view>
            <view class="detail-item">
              <text class="label">最终收益</text>
              <text class="value highlight price">¥ {{ selectedOrder.amount_final }}</text>
            </view>
          </template>
        </view>
        <view class="detail-footer" v-if="selectedOrder">
          <wd-button v-if="selectedOrder.status === 'pending'" block type="error" plain @click="handleCancel(selectedOrder.id)">取消预约</wd-button>
          <wd-button
            v-else-if="selectedOrder.status === 'completed'"
            block
            type="primary"
            plain
            :loading="withdrawing"
            :disabled="!!getWithdrawal(selectedOrder.id)"
            @click="handleWithdrawFromOrder(selectedOrder)"
          >
            {{ getWithdrawal(selectedOrder.id) ? formatWithdrawStatus(getWithdrawal(selectedOrder.id).status) : '申请提现到微信' }}
          </wd-button>
        </view>
      </view>
    </wd-popup>

    <!-- 评价弹窗 -->
    <!-- 小程序兼容: 底部弹窗添加 safe-area-inset-bottom 适配安全区 -->
    <wd-popup v-model="showReviewPopup" position="bottom" round safe-area-inset-bottom lock-scroll custom-style="max-height: 70vh;">
      <view class="review-container">
        <view class="review-header">
          <text class="title">评价订单</text>
          <wd-icon name="close" size="20px" color="#999" @click="showReviewPopup = false" />
        </view>

        <!-- 评分 -->
        <view class="review-section">
          <text class="section-label">服务评分</text>
          <view class="star-row">
            <view
              v-for="i in 5"
              :key="i"
              class="star-item"
              @click="reviewForm.rating = i"
            >
              <wd-icon
                :name="i <= reviewForm.rating ? 'star-fill' : 'star'"
                size="28px"
                :color="i <= reviewForm.rating ? '#faad14' : '#ddd'"
              />
            </view>
          </view>
        </view>

        <!-- 标签 -->
        <view class="review-section">
          <text class="section-label">评价标签</text>
          <view class="tag-row">
            <view
              v-for="tag in reviewTags"
              :key="tag"
              :class="['tag-item', { active: reviewForm.selectedTags.includes(tag) }]"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </view>
          </view>
        </view>

        <!-- 评价内容 -->
        <view class="review-section">
          <text class="section-label">评价内容（选填）</text>
          <!-- P0修复: 小程序中必须使用 wd-textarea 替代原生 textarea -->
          <wd-textarea
            v-model="reviewForm.content"
            placeholder="说说您的回收体验..."
            :maxlength="200"
            show-word-limit
            custom-class="review-textarea"
          />
        </view>

        <wd-button
          block
          type="primary"
          :loading="submittingReview"
          custom-class="submit-review-btn"
          @click="submitReview"
        >
          提交评价
        </wd-button>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
/**
 * P3修复: 核心数据逻辑已抽离至 composables/useOrderList.ts
 * 此容器组件仅负责事件处理、格式化和 UI 绑定
 */
import { onMounted } from 'vue'
import { useToast, useMessage } from 'wot-design-uni'
import CustomTabBar from '../../components/CustomTabBar.vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useOrderList } from './composables/useOrderList'
import { useOrderReview } from './composables/useOrderReview'
import type { OrderListItem } from '../../api/models/OrderListItem'

const toast = useToast()
const message = useMessage()

const {
  orders,
  loading,
  showOrderDetail,
  selectedOrder,
  withdrawing,
  cancelOrder,
  submitWithdrawal,
  getWithdrawal,
  init,
} = useOrderList()

const {
  reviewedOrders,
  showReviewPopup,
  reviewForm,
  submittingReview,
  fetchReviewedOrders,
  handleReview,
  submitReview,
  reviewTags,
  toggleTag,
} = useOrderReview()

onMounted(() => {
  init()
  fetchReviewedOrders()
})

/** 下拉刷新 */
onPullDownRefresh(async () => {
  await init()
  await fetchReviewedOrders()
  uni.stopPullDownRefresh()
})

const showDetail = (order: OrderListItem) => {
  selectedOrder.value = order
  showOrderDetail.value = true
}

const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

const handleCancel = (id: string | number) => {
  showOrderDetail.value = false
  message.confirm({
    title: '提示',
    msg: '确定要取消这个预约吗？',
  }).then(async () => {
    try {
      await cancelOrder(id)
      toast.success('已取消')
    } catch (e) {
      toast.error('取消失败')
    }
  }).catch(() => {})
}

const formatWithdrawStatus = (s: string) => {
  const map: Record<string, string> = { pending: '审核中', approved: '已到账', rejected: '已拒绝' }
  return map[s] || s
}

const handleWithdrawFromOrder = async (order: OrderListItem) => {
  try {
    await submitWithdrawal(order)
    toast.success('提现申请已提交')
  } catch (e: unknown) {
    const err = e as { body?: { detail?: string }; message?: string }
    toast.error(err?.body?.detail || err?.message || '网络错误')
  }
}

const formatStatus = (s: string) => {
  // I6修复: 增加 cancelled 状态显示
  const map: Record<string, string> = { 'pending': '待接单', 'scheduled': '上门中', 'completed': '已完成', 'cancelled': '已取消' }
  return map[s] || s
}

const formatTime = (t: string) => {
  return new Date(t).toLocaleString()
}
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $bg-color;
  min-height: 100vh;
}

.order-list {
  padding: 12px 16px;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding-top: 100rpx;
}

/* 骨架屏: 订单列表 */
.skeleton-orders {
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
      margin-bottom: 20rpx;
      .sk-id { width: 40%; height: 24rpx; }
      .sk-badge { width: 60rpx; height: 32rpx; border-radius: 6px; }
    }
    .sk-body {
      .sk-line-long { width: 80%; height: 28rpx; margin-bottom: 16rpx; }
      .sk-line-short { width: 50%; height: 28rpx; }
    }
    .sk-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 24rpx;
      .sk-btn { width: 120rpx; height: 48rpx; border-radius: 24rpx; }
    }
  }
}

/* A+B: 精致空状态样式（双圈渐变插图） */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;

  .empty-illustration {
    @include empty-illustration($primary-color);
  }

  .empty-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $text-main;
    margin-bottom: 12rpx;
  }

  .empty-desc {
    font-size: 24rpx;
    color: $text-light;
    margin-bottom: 40rpx;
  }

  .go-btn {
    min-width: 240rpx;
  }
}

/* C+E: 卡片统一圆角阴影 + 按压反馈 + 入场动画 */
.order-card-wrap {
  margin-bottom: 16px;
  @include list-item-enter;
  .refined-order-card {
    border-radius: 24rpx !important;
    border: none !important;
    box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03) !important;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    &:active {
      transform: scale(0.985);
      box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06) !important;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  
  .order-id-box {
    display: flex;
    align-items: center;
    gap: 4px;
    .id-text { font-size: 12px; color: $text-light; }
  }
  
  .status-badge {
    font-size: 11px;
    padding: 2px 10px;
    border-radius: 6px;
    &.pending { color: $primary-color; background: rgba(7,193,96,0.1); }
    &.scheduled { color: $warning-color; background: rgba(250,140,22,0.1); }
    &.completed { color: $success-color; background: rgba(82,196,26,0.1); }
    &.cancelled { color: $error-color; background: rgba(255,77,79,0.1); }
  }
}

.card-body {
  padding: 4px 0;
  .info-line {
    display: flex;
    margin-bottom: 10px;
    font-size: 14px;
    &:last-child { margin-bottom: 0; }
    .label { color: $text-light; width: 70px; flex-shrink: 0; }
    .value { color: $text-main; flex: 1; font-weight: 500; }
  }
}

.settle-panel {
  margin-top: 16px;
  background: $bg-color;
  border-radius: 12px;
  padding: 16px 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  
  .settle-item {
    text-align: center;
    flex: 1;
    .s-val {
      font-size: 18px;
      font-weight: bold;
      color: $text-main;
      display: block;
      margin-bottom: 2px;
      .s-unit { font-size: 11px; margin-left: 2px; font-weight: normal; }
      &.price { color: $error-color; }
    }
    .s-lab { font-size: 11px; color: $text-light; }
  }
  .settle-line { width: 1px; height: 20px; background: $border-color; }
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}

.detail-container {
  padding: 24px;
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    .title { font-size: 18px; font-weight: bold; color: $text-main; }
  }
  
  .detail-content {
    .detail-item {
      display: flex;
      margin-bottom: 16px;
      font-size: 14px;
      line-height: 1.5;
      .label { width: 80px; color: $text-light; flex-shrink: 0; }
      .value { 
        color: $text-main; flex: 1; font-weight: 500; 
        &.status {
          &.pending { color: $primary-color; }
          &.scheduled { color: $warning-color; }
          &.completed { color: $success-color; }
          &.cancelled { color: $error-color; }
        }
        &.highlight { font-weight: bold; font-size: 16px; }
        &.price { color: $error-color; }
      }
    }
    
    .divider {
      height: 1px;
      background: $border-color;
      margin: 20px 0;
    }
  }
  
  .detail-footer {
    margin-top: 24px;
  }
}

.review-container {
  padding: 32rpx;

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;
    .title { font-size: 32rpx; font-weight: bold; color: $text-main; }
  }

  .review-section {
    margin-bottom: 28rpx;
    .section-label {
      font-size: 26rpx;
      color: $text-sub;
      margin-bottom: 16rpx;
      display: block;
    }
  }

  .star-row {
    display: flex;
    gap: 16rpx;
    .star-item { padding: 4rpx; }
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    .tag-item {
      padding: 8rpx 24rpx;
      border-radius: 24rpx;
      font-size: 24rpx;
      color: $text-sub;
      background: $bg-color;
      border: 2rpx solid transparent;
      &.active {
        color: $primary-color;
        background: rgba(7, 193, 96, 0.08);
        border-color: $primary-color;
      }
    }
  }

  /* P0修复: 评价输入框样式（已改用 wd-textarea 组件） */
  .review-textarea {
    margin-top: 8rpx;
  }

  /* B: 提交评价按钮主题化 */
  .submit-review-btn {
    margin-top: 24rpx;
  }
}
</style>
