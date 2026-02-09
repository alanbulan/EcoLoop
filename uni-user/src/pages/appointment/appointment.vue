<template>
  <view class="container">
    <wd-navbar title="预约回收" left-arrow @click-left="goBack" fixed placeholder safe-area-inset-top />

    <view class="content">
      <!-- Address Selection -->
      <view class="section-card address-card" @click="chooseAddress">
        <view v-if="selectedAddress" class="address-info">
          <view class="user-meta">
            <text class="name">{{ selectedAddress.receiver_name }}</text>
            <text class="phone">{{ selectedAddress.receiver_phone }}</text>
          </view>
          <view class="detail">
            <wd-icon name="location" size="14px" color="#07c160" />
            <text>{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}</text>
          </view>
        </view>
        <view v-else class="address-empty">
          <wd-icon name="add-circle" size="24px" color="#999" />
          <text>请选择回收地址</text>
        </view>
        <wd-icon name="arrow-right" size="16px" color="#ccc" />
      </view>

      <!-- Material Selection -->
      <view class="section-card material-card">
        <view class="mat-header">
          <text class="title">回收物品</text>
          <text class="price" v-if="material">预估单价: <text class="num">¥{{ material.current_price }}</text>/{{ material.unit }}</text>
        </view>
        <view class="mat-body">
          <view class="mat-selector" @click="showMaterialPicker = true">
            <view v-if="material" class="mat-tag">{{ material.name }}</view>
            <view v-else class="mat-placeholder">请选择回收物品</view>
            <wd-icon name="arrow-right" size="14px" color="#ccc" />
          </view>
          <view class="weight-input" v-if="material">
            <text class="lab">预估重量</text>
            <!-- P1修复: wd-input-number 无 unit 属性，改用文字标注 -->
            <wd-input-number v-model="form.estimated_weight" :min="1" :step="1" />
            <text class="weight-unit">kg</text>
          </view>
        </view>
      </view>

      <!-- Time Selection -->
      <view class="section-card time-card">
        <view class="section-title">预约上门时间</view>
        <!-- P0修复: wd-datetime-picker v-model 需要 number(时间戳)类型 -->
        <wd-datetime-picker
          v-model="form.appointment_time"
          type="datetime"
          label="预约时间"
          :min-date="minDate"
        />
      </view>

      <!-- Remarks -->
      <view class="section-card remark-card">
        <view class="section-title">备注说明</view>
        <wd-textarea
          v-model="form.remark"
          placeholder="有什么需要特别叮嘱回收员的吗？"
          :maxlength="100"
          show-word-limit
        />
      </view>
    </view>

    <!-- Bottom Action -->
    <view class="bottom-bar">
      <view class="tips">
        <wd-icon name="info-circle" size="12px" />
        <text>回收员将在预约时间段内上门，请保持电话畅通</text>
      </view>
      <wd-button block size="large" :loading="submitting" @click="submitOrder">立即预约</wd-button>
    </view>

    <wd-toast id="wd-toast" />
    <wd-message-box />

    <!-- Material Picker -->
    <!-- 小程序兼容: 底部弹窗添加 safe-area-inset-bottom -->
    <wd-popup v-model="showMaterialPicker" position="bottom" round safe-area-inset-bottom lock-scroll>
      <view class="picker-title">选择回收物品</view>
      <view class="material-grid">
        <view 
          v-for="item in allMaterials" 
          :key="item.id" 
          :class="['grid-item', material?.id === item.id ? 'active' : '']"
          @click="selectMaterial(item)"
        >
          <text class="name">{{ item.name }}</text>
          <text class="price">¥{{ item.current_price }}/{{ item.unit }}</text>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
/**
 * 预约回收页面 — 容器组件
 * 业务逻辑已抽离至 composables/useAppointment.ts
 */
import { useAppointment } from './composables/useAppointment'

const {
  material,
  allMaterials,
  showMaterialPicker,
  selectedAddress,
  submitting,
  minDate,
  form,
  selectMaterial,
  chooseAddress,
  submitOrder,
} = useAppointment()

const goBack = () => uni.navigateBack()
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $bg-color;
  min-height: 100vh;
  padding-bottom: 120px;
}

.content {
  padding: 12px 16px;
}

.section-card {
  background: $white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.address-card {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .address-info {
    flex: 1;
    .user-meta {
      margin-bottom: 6px;
      .name { font-size: 16px; font-weight: bold; margin-right: 8px; }
      .phone { font-size: 14px; color: $text-sub; }
    }
    .detail {
      font-size: 13px;
      color: $text-main;
      display: flex;
      align-items: center;
      gap: 4px;
      line-height: 1.4;
    }
  }
  
  .address-empty {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    color: $text-light;
    font-size: 15px;
  }
}

.material-card {
  .mat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    .title { font-size: 15px; font-weight: bold; }
    .price { 
      font-size: 12px; color: $text-light; 
      .num { color: $error-color; font-weight: bold; font-size: 14px; }
    }
  }
  .mat-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .mat-selector {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 4px;
      .mat-tag {
        background: rgba(7, 193, 96, 0.1);
        color: $primary-color;
        padding: 4px 12px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
      }
      .mat-placeholder {
        font-size: 14px;
        color: $text-light;
      }
    }
    
    .weight-input {
      display: flex;
      align-items: center;
      gap: 8px;
      .lab { font-size: 13px; color: $text-sub; }
      .weight-unit { font-size: 13px; color: $text-light; margin-left: 4px; }
    }
  }
}

.picker-title {
  padding: 20px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 0 20px 40px;
  
  .grid-item {
    border: 1px solid $border-color;
    border-radius: 12px;
    padding: 12px 8px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .name { font-size: 14px; color: $text-main; font-weight: 500; }
    .price { font-size: 11px; color: $text-light; }
    
    &.active {
      border-color: $primary-color;
      background: rgba(7, 193, 96, 0.05);
      .name { color: $primary-color; }
    }
  }
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 16px;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  
  .time-item {
    border: 1px solid $border-color;
    border-radius: 12px;
    padding: 10px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .day { font-size: 11px; color: $text-light; }
    .hour { font-size: 13px; color: $text-main; font-weight: 500; }
    
    &.active {
      background: rgba(7, 193, 96, 0.05);
      border-color: $primary-color;
      .hour { color: $primary-color; }
    }
  }
}

/* B: 底部操作栏毛玻璃效果 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
  box-shadow: 0 -4px 16px rgba(0,0,0,0.04);
  
  .tips {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: $text-light;
    margin-bottom: 12px;
    justify-content: center;
  }
}
</style>
