import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ConfigService } from '../api';

/** 首页配置类型 */
interface HomeConfig {
  banners?: Array<{ image: string; link?: string }>
  stats_labels?: Array<{ key: string; label: string }>
  quick_actions?: Array<{ name: string; icon: string; path: string }>
  [key: string]: unknown
}

/** 个人中心配置类型 */
interface ProfileConfig {
  menu_items?: Array<{ title: string; icon: string; color: string; path: string }>
  service_phone?: string
  [key: string]: unknown
}

/** 关于页配置类型 */
interface AboutConfig {
  app_name?: string
  version?: string
  copyright?: string
  links?: Array<{ title: string; path: string }>
  [key: string]: unknown
}

export const useConfigStore = defineStore('config', () => {
    const homeConfig = ref<HomeConfig | null>(null);
    const profileConfig = ref<ProfileConfig | null>(null);
    const aboutConfig = ref<AboutConfig | null>(null);
    const loading = ref(false);

    /** 缓存控制: 配置数据变更频率低，缓存5分钟减少重复请求 */
    const CACHE_TTL = 5 * 60 * 1000;
    let lastFetchTime = 0;

    /**
     * 获取全部配置
     * @param force 强制刷新，忽略缓存（下拉刷新时使用）
     */
    const fetchAllConfigs = async (force = false) => {
        // 缓存命中: 5分钟内不重复请求
        const now = Date.now();
        if (!force && lastFetchTime && (now - lastFetchTime < CACHE_TTL) && homeConfig.value) {
            return;
        }

        loading.value = true;
        try {
            const configs = await ConfigService.getAllConfigsApiV1ConfigGet();
            // 类型断言: 后端返回动态 JSON 配置
            homeConfig.value = (configs.home_page as HomeConfig) ?? null;
            profileConfig.value = (configs.profile_page as ProfileConfig) ?? null;
            aboutConfig.value = (configs.about_page as AboutConfig) ?? null;
            lastFetchTime = now;
        } catch (e) {
            console.error('Failed to fetch configs', e);
        } finally {
            loading.value = false;
        }
    };

    return {
        homeConfig,
        profileConfig,
        aboutConfig,
        loading,
        fetchAllConfigs
    };
});
