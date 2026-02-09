import { createSSRApp } from "vue";
import App from "./App.vue";
import { OpenAPI } from "./api";
import { createPinia } from 'pinia';

export function createApp() {
  // 从环境变量读取 API 基础地址，默认 localhost
  OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const app = createSSRApp(App);
  app.use(createPinia());
  
  return {
    app,
  };
}
