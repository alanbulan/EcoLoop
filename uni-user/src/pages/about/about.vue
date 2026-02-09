<template>
  <view class="container">
    <wd-navbar title="关于我们" left-arrow fixed placeholder @click-left="handleBack" safe-area-inset-top />
    
    <view class="about-content">
      <view class="logo-box">
        <wd-img :width="80" :height="80" round src="/static/logo.png" />
        <text class="app-name">{{ aboutConfig?.app_name || 'Green Recycle' }}</text>
        <text class="version">Version {{ aboutConfig?.version || '1.0.0' }}</text>
      </view>

      <view class="info-section">
        <wd-cell-group border custom-style="border-radius: 16px; overflow: hidden;">
          <wd-cell 
            v-for="link in aboutConfig?.links" 
            :key="link.title" 
            :title="link.title" 
            is-link 
            @click="handleLink(link)"
          />
        </wd-cell-group>
      </view>

      <view class="footer">
        <text>{{ aboutConfig?.copyright || 'Copyright © 2026 Green Recycle' }}</text>
        <text>All Rights Reserved</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useConfigStore } from '../../stores/config'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const configStore = useConfigStore()
const { aboutConfig } = storeToRefs(configStore)

onMounted(() => {
  if (!aboutConfig.value) {
    configStore.fetchAllConfigs()
  }
})

const handleBack = () => {
  uni.navigateBack()
}

const handleLink = (link: { title: string; path: string }) => {
  if (link.path === 'update') {
    uni.showToast({ title: '已是最新版本', icon: 'none' })
  } else if (link.path) {
    uni.navigateTo({ url: link.path })
  }
}
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $bg-color;
  min-height: 100vh;
}

.about-content {
  padding: 40px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .logo-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40px;
    
    .app-name {
      font-size: 24px;
      font-weight: bold;
      color: $text-main;
      margin-top: 16px;
    }
    
    .version {
      font-size: 14px;
      color: $text-light;
      margin-top: 8px;
    }
  }
  
  .info-section {
    width: 100%;
    margin-bottom: 60px;
  }
  
  .footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text {
      font-size: 12px;
      color: $text-light;
    }
  }
}
</style>
