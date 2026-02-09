import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ConfigService } from '../api';

/** 回收员首页配置类型 */
interface CollectorConfig {
  stats_items?: Array<{ key: string; label: string }>
  [key: string]: unknown
}

export const useConfigStore = defineStore('config', () => {
    const collectorConfig = ref<CollectorConfig | null>(null);
    const loading = ref(false);

    const fetchAllConfigs = async () => {
        loading.value = true;
        try {
            const configs = await ConfigService.getAllConfigsApiV1ConfigGet();
            // 类型断言: 后端返回动态 JSON 配置
            collectorConfig.value = (configs.collector_home as CollectorConfig) ?? null;
        } catch (e) {
            console.error('Failed to fetch configs', e);
        } finally {
            loading.value = false;
        }
    };

    return {
        collectorConfig,
        loading,
        fetchAllConfigs
    };
});
