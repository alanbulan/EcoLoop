<template>
  <view class="container">
    <wd-navbar title="积分商城" left-arrow fixed placeholder @click-left="handleBack" safe-area-inset-top />

    <!-- 积分余额头部 -->
    <view class="points-banner">
      <view class="points-inner">
        <text class="label">可用积分</text>
        <text class="value">{{ currentPoints }}</text>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view :class="['tab-item', activeTab === 'products' && 'active']" @click="switchTab('products')">
        <text>商品列表</text>
      </view>
      <view :class="['tab-item', activeTab === 'records' && 'active']" @click="switchTab('records')">
        <text>兑换记录</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view v-if="activeTab === 'products'" class="product-list">
      <!-- 骨架屏: 商品加载中 -->
      <view v-if="loading && products.length === 0" class="skeleton-products">
        <view class="sk-product" v-for="i in 3" :key="i">
          <view class="sk-block sk-img"></view>
          <view class="sk-info">
            <view class="sk-block sk-name"></view>
            <view class="sk-block sk-desc"></view>
            <view class="sk-block sk-price"></view>
          </view>
        </view>
      </view>
      <view v-else-if="products.length === 0 && !loading" class="empty-state">
        <view class="empty-illustration">
          <wd-icon name="shop" size="48px" color="rgba(7,193,96,0.6)" />
        </view>
        <text class="empty-title">暂无商品</text>
        <text class="empty-desc">商品上架后会在这里展示</text>
      </view>
      <view v-for="item in products" :key="item.id" class="product-card">
        <!-- 性能优化: 商品图片懒加载 -->
        <wd-img
          v-if="item.image_url"
          :src="item.image_url"
          :width="80"
          :height="80"
          round
          mode="aspectFill"
          custom-class="product-img"
          lazy-load
        />
        <view v-else class="product-img-placeholder">
          <wd-icon name="gift" size="32px" color="#ccc" />
        </view>
        <view class="product-info">
          <text class="product-name">{{ item.name }}</text>
          <text v-if="item.description" class="product-desc">{{ item.description }}</text>
          <view class="product-bottom">
            <view class="price-tag">
              <text class="price-num">{{ item.points_cost }}</text>
              <text class="price-unit">积分</text>
            </view>
            <text class="stock-text">{{ stockText(item.stock) }}</text>
          </view>
        </view>
        <wd-button
          type="success"
          size="small"
          :disabled="item.stock === 0 || currentPoints < item.points_cost"
          @click="exchangeProduct(item)"
        >
          兑换
        </wd-button>
      </view>
    </view>

    <!-- 兑换记录 -->
    <view v-if="activeTab === 'records'" class="record-list">
      <view v-if="records.length === 0 && !loading" class="empty-state">
        <view class="empty-illustration">
          <wd-icon name="notes" size="48px" color="rgba(7,193,96,0.6)" />
        </view>
        <text class="empty-title">暂无兑换记录</text>
        <text class="empty-desc">兑换商品后记录会在这里显示</text>
      </view>
      <wd-cell-group v-if="records.length > 0" border custom-style="border-radius: 16px; overflow: hidden; margin: 0 16px;">
        <wd-cell v-for="item in records" :key="item.id" :title="item.product_name" :label="item.created_at.slice(0, 10)">
          <template #value>
            <view class="record-value">
              <text class="record-points">-{{ item.points_spent }}积分</text>
              <text :class="['record-status', item.status]">{{ statusText(item.status) }}</text>
            </view>
          </template>
        </wd-cell>
      </wd-cell-group>
    </view>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
/**
 * T3: 积分商城页面 — 容器组件
 * 业务逻辑抽离至 composables/useShop.ts
 */
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useShop } from './composables/useShop'

const {
  products,
  records,
  currentPoints,
  loading,
  activeTab,
  exchangeProduct,
  switchTab,
  stockText,
  statusText,
  fetchProducts,
  handleBack,
} = useShop()

/** 下拉刷新 */
onPullDownRefresh(async () => {
  if (activeTab.value === 'products') {
    await fetchProducts()
  }
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $bg-color;
  min-height: 100vh;
}

/* 积分余额横幅 */
.points-banner {
  background: linear-gradient(135deg, $primary-color 0%, #06ad56 100%);
  padding: 24px 16px;

  .points-inner {
    text-align: center;
    .label { font-size: 13px; color: rgba(255,255,255,0.85); display: block; margin-bottom: 4px; }
    .value { font-size: 36px; font-weight: 800; color: #fff; }
  }
}

/* Tab 切换栏 */
.tab-bar {
  display: flex;
  background: $white;
  border-bottom: 1px solid $border-color;
  position: sticky;
  top: 0;
  z-index: 10;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 14px 0;
    font-size: 14px;
    color: $text-sub;
    position: relative;
    transition: color 0.2s;

    &.active {
      color: $primary-color;
      font-weight: 600;
      &::after {
        content: '';
        position: absolute;
        bottom: 0; left: 50%;
        transform: translateX(-50%);
        width: 24px; height: 3px;
        background: $primary-color;
        border-radius: 2px;
      }
    }
  }
}

/* 商品列表 */
.product-list {
  padding: 16px;
}

.product-card {
  @include card;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  @include list-item-enter;
  &:active {
    transform: scale(0.985);
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
  }

  .product-img-placeholder {
    width: 80px; height: 80px;
    border-radius: 12rpx;
    background: $bg-color;
    @include flex-center;
    flex-shrink: 0;
  }

  .product-info {
    flex: 1;
    min-width: 0;

    .product-name {
      font-size: 15px;
      font-weight: 600;
      color: $text-main;
      display: block;
      @include text-ellipsis;
    }

    .product-desc {
      font-size: 12px;
      color: $text-light;
      display: block;
      margin-top: 4px;
      @include text-ellipsis;
    }

    .product-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;

      .price-tag {
        display: flex;
        align-items: baseline;
        gap: 2px;
        .price-num { font-size: 18px; font-weight: 800; color: $primary-color; }
        .price-unit { font-size: 11px; color: $text-light; }
      }

      .stock-text { font-size: 11px; color: $text-light; }
    }
  }
}

/* 兑换记录 */
.record-list {
  padding: 16px 0;
}

.record-value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .record-points { font-size: 14px; font-weight: 600; color: $error-color; }
  .record-status {
    font-size: 11px;
    margin-top: 2px;
    &.pending { color: $warning-color; }
    &.shipped { color: #3b82f6; }
    &.completed { color: $success-color; }
  }
}

/* B: 精致空状态（双圈渐变插图） */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;

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
  }
}

/* 骨架屏: 商品列表 */
.skeleton-products {
  .sk-product {
    display: flex;
    align-items: center;
    gap: 12px;
    background: $white;
    border-radius: 24rpx;
    padding: 32rpx;
    margin-bottom: 12px;
    .sk-block { @include skeleton-shimmer; }
    .sk-img { width: 80px; height: 80px; border-radius: 12rpx; flex-shrink: 0; }
    .sk-info {
      flex: 1;
      .sk-name { width: 60%; height: 28rpx; margin-bottom: 12rpx; }
      .sk-desc { width: 80%; height: 24rpx; margin-bottom: 12rpx; }
      .sk-price { width: 40%; height: 32rpx; }
    }
  }
}
</style>
