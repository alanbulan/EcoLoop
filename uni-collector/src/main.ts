import { createSSRApp } from "vue";
import App from "./App.vue";
import { OpenAPI } from "./api";
import { createPinia } from 'pinia'; // P0修复: 注册 Pinia 状态管理

export function createApp() {
  // 从环境变量读取 API 基础地址，默认 localhost
  OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const app = createSSRApp(App);
  app.use(createPinia()); // P0修复: 必须在使用 store 前注册 Pinia
  return {
    app,
  };
}
