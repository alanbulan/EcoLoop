<template>
  <!-- 自定义底部导航栏: 使用 wd-tabbar 替代原生 tabBar，解决图标颜色与主题不匹配问题 -->
  <wd-tabbar
    v-model="current"
    fixed
    bordered
    placeholder
    safe-area-inset-bottom
    :active-color="activeColor"
    :inactive-color="inactiveColor"
    @change="handleChange"
  >
    <wd-tabbar-item
      v-for="item in tabs"
      :key="item.name"
      :name="item.name"
      :title="item.title"
      :icon="item.icon"
    />
  </wd-tabbar>
</template>

<script setup lang="ts">
/**
 * 回收员端自定义 TabBar 组件
 * 使用 wd-tabbar 实现，active-color 与蓝色主题 (#3D5afe) 一致
 * 替代原生 tabBar 的绿色 PNG 图标
 */
import { ref, watch } from 'vue'

interface TabItem {
  name: string
  title: string
  icon: string
  path: string
}

const props = defineProps<{
  /** 当前激活的 tab name */
  active: string
}>()

/** 主题色: 回收员端蓝色 */
const activeColor = '#3D5afe'
const inactiveColor = '#999999'

/** Tab 配置 */
const tabs: TabItem[] = [
  { name: 'index', title: '工作台', icon: 'home', path: '/pages/index/index' },
  { name: 'inventory', title: '库存', icon: 'goods', path: '/pages/inventory/inventory' },
  { name: 'profile', title: '我的', icon: 'user', path: '/pages/profile/profile' },
]

const current = ref(props.active)

/** 监听外部 active 变化 */
watch(() => props.active, (val) => {
  current.value = val
})

/** 切换 tab 时使用 switchTab 导航 */
const handleChange = ({ value }: { value: string }) => {
  const target = tabs.find(t => t.name === value)
  if (target) {
    uni.switchTab({ url: target.path })
  }
}
</script>
