<template>
  <view class="container">
    <wd-navbar title="消息中心" fixed placeholder left-arrow @click-left="goBack" safe-area-inset-top>
      <template #right>
        <view v-if="unreadCount > 0" class="read-all-btn" @click="markAllRead">
          <text>全部已读</text>
        </view>
      </template>
    </wd-navbar>

    <!-- C: 骨架屏替代简单 loading -->
    <view v-if="loading && messages.length === 0" class="skeleton-messages">
      <view class="sk-msg" v-for="i in 4" :key="i">
        <view class="sk-block sk-icon"></view>
        <view class="sk-body">
          <view class="sk-block sk-title"></view>
          <view class="sk-block sk-content"></view>
          <view class="sk-block sk-time"></view>
        </view>
      </view>
    </view>

    <!-- 精致空状态 -->
    <view v-else-if="!loading && messages.length === 0" class="empty-state">
      <view class="empty-illustration">
        <wd-icon name="bell" size="48px" color="rgba(7,193,96,0.6)" />
      </view>
      <text class="empty-title">暂无消息通知</text>
      <text class="empty-desc">回收进度、积分变动等消息会在这里提醒你</text>
    </view>

    <!-- 消息列表 -->
    <view v-else class="msg-list">
      <view
        v-for="item in messages"
        :key="item.id"
        class="msg-item"
        :class="{ unread: !item.is_read }"
        @click="handleClick(item)"
      >
        <view class="msg-icon" :style="{ background: getTypeColor(item.type) }">
          <wd-icon :name="getTypeIcon(item.type)" size="20px" color="#fff" />
        </view>
        <view class="msg-body">
          <view class="msg-header">
            <text class="msg-title">{{ item.title }}</text>
            <view v-if="!item.is_read" class="unread-dot" />
          </view>
          <text class="msg-content">{{ item.content }}</text>
          <text class="msg-time">{{ item.created_at }}</text>
        </view>
      </view>
    </view>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
/**
 * 消息中心页面 — 容器组件
 * 业务逻辑委托给 composables/useMessages.ts
 */
import { onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useMessages } from './composables/useMessages'

const {
  messages,
  loading,
  unreadCount,
  fetchMessages,
  fetchUnreadCount,
  markAllRead,
  handleClick,
  getTypeIcon,
  getTypeColor,
} = useMessages()

const goBack = () => uni.navigateBack()

onMounted(() => {
  fetchMessages()
  fetchUnreadCount()
})

onPullDownRefresh(async () => {
  await fetchMessages()
  await fetchUnreadCount()
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
@use "../../styles/variables.scss" as *;

.container {
  background: $bg-color;
  min-height: 100vh;
}

/* C: 骨架屏 — 消息列表 */
.skeleton-messages {
  padding: 20rpx 32rpx;

  .sk-msg {
    display: flex;
    gap: 24rpx;
    padding: 28rpx 24rpx;
    background: $white;
    border-radius: 16rpx;
    margin-bottom: 16rpx;
  }

  .sk-block { @include skeleton-shimmer; }
  .sk-icon { width: 72rpx; height: 72rpx; border-radius: 50%; flex-shrink: 0; }
  .sk-body {
    flex: 1;
    .sk-title { width: 40%; height: 28rpx; margin-bottom: 16rpx; }
    .sk-content { width: 80%; height: 24rpx; margin-bottom: 12rpx; }
    .sk-time { width: 30%; height: 22rpx; }
  }
}

.read-all-btn {
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  color: $primary-color;
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

.msg-list {
  padding: 20rpx 32rpx;
}

/* E: 消息列表入场动画 */
.msg-item {
  display: flex;
  gap: 24rpx;
  padding: 28rpx 24rpx;
  background: $white;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
  @include list-item-enter;

  &.unread {
    background: $bg-color;
  }
}

.msg-icon {
  flex-shrink: 0;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.msg-body {
  flex: 1;
  min-width: 0;
}

.msg-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.msg-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-main;
}

.unread-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: $error-color;
  flex-shrink: 0;
}

.msg-content {
  font-size: 24rpx;
  color: $text-sub;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.msg-time {
  font-size: 22rpx;
  color: $text-light;
  margin-top: 8rpx;
  display: block;
}
</style>
