<template>
  <!-- 自定义底部导航栏: 使用 wd-tabbar 替代原生 tabBar，图标颜色跟随主题色 -->
  <wd-tabbar
    v-model="active"
    fixed
    placeholder
    bordered
    safe-area-inset-bottom
    active-color="#07c160"
    inactive-color="#999999"
    @change="handleChange"
  >
    <wd-tabbar-item name="index" title="首页" icon="home" />
    <wd-tabbar-item name="orders" title="订单" icon="list" />
    <wd-tabbar-item name="profile" title="我的" icon="user" />
  </wd-tabbar>
</template>

<script setup lang="ts">
/**
 * 用户端自定义底部导航栏
 * 使用 wd-tabbar 组件，图标颜色跟随主题色 #07c160
 * 替代原生 tabBar 的绿色 PNG 图标
 */
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  /** 当前激活的 tab 名称 */
  current: string
}>()

const active = ref(props.current)

// 同步外部 current 变化
watch(() => props.current, (val) => {
  active.value = val
})

// 挂载时隐藏原生 tabBar（微信小程序必须通过 API 隐藏）
onMounted(() => {
  uni.hideTabBar({ animation: false })
})

/** tab 路由映射表 */
const tabRoutes: Record<string, string> = {
  index: '/pages/index/index',
  orders: '/pages/orders/orders',
  profile: '/pages/profile/profile',
}

/** 切换 tab 时使用 switchTab 导航 */
const handleChange = ({ value }: { value: string }) => {
  const url = tabRoutes[value]
  if (url) {
    uni.switchTab({ url })
  }
}
</script>
