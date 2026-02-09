<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { setupRouteGuard } from "./composables/useHttpInterceptor";

onLaunch(() => {
  console.log("App Launch");
  // M: 初始化路由守卫，拦截未登录回收员访问需要权限的页面
  setupRouteGuard();
});
onShow(() => {
  console.log("App Show");
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

/* 隐藏原生 tabBar，使用自定义 wd-tabbar 替代 */
uni-tabbar {
  display: none !important;
}
</style>
