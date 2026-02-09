<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { setupRouteGuard } from "./composables/useHttpInterceptor";

onLaunch(() => {
  console.log("App Launch");
  // M: 初始化路由守卫，拦截未登录回收员访问需要权限的页面
  setupRouteGuard();
  // 隐藏原生 tabBar，使用自定义 wd-tabbar 替代（解决图标颜色与蓝色主题不匹配）
  uni.hideTabBar({ animation: false });
});
onShow(() => {
  console.log("App Show");
  // 每次 App 显示时确保原生 tabBar 隐藏（防止切换 tab 时闪现）
  uni.hideTabBar({ animation: false });
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style lang="scss">
@use "./styles/variables.scss" as *;

/* Global Wot Design Uni Theme Overrides */
:root, page {
  --wd-color-primary: #{$primary-color};
  --wd-tabs-nav-active-color: #{$primary-color};
  --wd-tabs-nav-line-bg-color: #{$primary-color};
  --wd-button-primary-bg-color: #{$primary-color};
  --wd-button-primary-border-color: #{$primary-color};
}

/* Wot Design Uni components are styled individually via easycom */
</style>
