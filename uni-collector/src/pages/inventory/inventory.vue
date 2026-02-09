<template>
  <view class="container">
    <wd-navbar title="企业库存" fixed placeholder :bordered="false" safe-area-inset-top />
    
    <view class="summary-section">
      <view class="total-card">
        <view class="card-left">
          <text class="label">当前总库存 (kg)</text>
          <text class="amount">{{ totalWeight.toFixed(2) }}</text>
        </view>
        <view class="card-right">
          <view class="icon-bg">
            <wd-icon name="chart-bar" size="48px" color="rgba(255,255,255,0.2)" />
          </view>
        </view>
      </view>
    </view>

    <view class="inventory-list">
      <view class="section-header">
        <text class="section-title">分品类详情</text>
        <text class="section-tip">共 {{ inventories.length }} 类物料</text>
      </view>
      
      <view class="card-grid">
        <wd-card v-for="item in inventories" :key="item.material_id" custom-class="inv-card-refined">
          <view class="card-top">
            <view class="mat-info">
              <view :class="['mat-icon', getCategoryClass(item.material_name)]">
                {{ item.material_name[0] }}
              </view>
              <text class="mat-name">{{ item.material_name }}</text>
            </view>
            <view class="mat-weight">
              <text class="num">{{ item.weight.toFixed(1) }}</text>
              <text class="unit">kg</text>
            </view>
          </view>
          
          <view class="card-bottom">
            <view class="update-time">
              <wd-icon name="time" size="12px" color="#8e8e93" />
              <text>{{ formatUpdateTime(item.last_updated) }}</text>
            </view>
            <wd-button size="small" type="primary" round plain @click="handleOutbound(item)">
              出库登记
            </wd-button>
          </view>
        </wd-card>
      </view>
    </view>

    <!-- Outbound Popup -->
    <!-- 小程序兼容: 底部弹窗添加 safe-area-inset-bottom -->
    <wd-popup v-model="showModal" position="bottom" round safe-area-inset-bottom lock-scroll custom-class="outbound-popup">
      <view class="popup-content">
        <view class="popup-header">
          <text class="title">库存出库</text>
          <wd-icon name="close" size="24px" color="#999" @click="showModal = false" />
        </view>
        <view class="popup-body">
          <view class="item-preview">
            <text class="label">物料名称</text>
            <text class="value">{{ currentItem?.material_name }}</text>
          </view>
          <view class="item-preview">
            <text class="label">当前库存</text>
            <text class="value highlight">{{ currentItem?.weight.toFixed(2) }} kg</text>
          </view>
          
          <view class="input-group">
            <wd-input
              v-model="form.weight"
              label="出库重量"
              placeholder="请输入出库重量"
              type="digit"
              suffix="kg"
              size="large"
            />
            <wd-input
              v-model="form.notes"
              label="备注说明"
              placeholder="选填：如目的地、经办人"
              size="large"
            />
          </view>
        </view>
        <view class="popup-footer">
          <wd-button block size="large" round @click="confirmOutbound" :loading="loading">确认出库</wd-button>
        </view>
      </view>
    </wd-popup>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
/**
 * 企业库存页面 — 容器组件
 * 业务逻辑已抽离至 composables/useInventory.ts
 */
import { onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useInventory } from './composables/useInventory'

const {
  inventories,
  showModal,
  loading,
  currentItem,
  form,
  totalWeight,
  fetchInventory,
  handleOutbound,
  confirmOutbound,
  getCategoryClass,
  formatUpdateTime,
} = useInventory()

onMounted(() => fetchInventory())

/** 下拉刷新 */
onPullDownRefresh(async () => {
  await fetchInventory()
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container { 
  background: $bg-color; 
  min-height: 100vh; 
}

.summary-section {
  padding: 32rpx;
  background: $white;
}

.total-card {
  background: linear-gradient(135deg, $primary-color 0%, #5c7cff 100%);
  padding: 48rpx 40rpx;
  border-radius: 24rpx;
  color: $white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 12rpx 32rpx rgba(61, 90, 254, 0.2);
  overflow: hidden;
  position: relative;
  
  .card-left {
    position: relative;
    z-index: 1;
    .label { font-size: 24rpx; opacity: 0.8; display: block; margin-bottom: 12rpx; }
    .amount { font-size: 64rpx; font-weight: 800; letter-spacing: -1rpx; }
  }
  
  .icon-bg {
    position: absolute;
    right: -20rpx;
    bottom: -20rpx;
    opacity: 0.5;
  }
}

.inventory-list {
  padding: 32rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    .section-title { font-size: 32rpx; font-weight: bold; color: $text-main; }
    .section-tip { font-size: 24rpx; color: $text-light; }
  }
}

/* C+E: 库存卡片按压反馈 + 入场动画 */
.inv-card-refined {
  margin-bottom: 24rpx !important;
  border-radius: 24rpx !important;
  border: none !important;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02) !important;
  padding: 32rpx !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  @include list-item-enter;
  &:active {
    transform: scale(0.985);
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05) !important;
  }
  
  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;
    
    .mat-info {
      display: flex;
      align-items: center;
      gap: 20rpx;
      .mat-icon {
        width: 72rpx;
        height: 72rpx;
        border-radius: 16rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 32rpx;
        font-weight: bold;
        color: $white;
        &.cat-paper { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
        &.cat-plastic { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
        &.cat-metal { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
        &.cat-other { background: linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%); }
      }
      .mat-name { font-size: 32rpx; font-weight: 600; color: $text-main; }
    }
    
    .mat-weight {
      text-align: right;
      .num { font-size: 40rpx; font-weight: 800; color: $primary-color; }
      .unit { font-size: 24rpx; color: $text-light; margin-left: 4rpx; }
    }
  }
  
  .card-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 24rpx;
    border-top: 2rpx solid $border-color;
    .update-time {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 22rpx;
      color: $text-light;
    }
  }
}

.outbound-popup {
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
      .item-preview {
        display: flex;
        justify-content: space-between;
        margin-bottom: 24rpx;
        background: $bg-color;
        padding: 24rpx;
        border-radius: 16rpx;
        .label { font-size: 28rpx; color: $text-sub; }
        .value { font-size: 28rpx; color: $text-main; font-weight: 600; }
        .highlight { color: $primary-color; }
      }
      .input-group {
        margin-top: 32rpx;
        :deep(.wd-input) { margin-bottom: 20rpx; }
      }
    }
  }
}
</style>
