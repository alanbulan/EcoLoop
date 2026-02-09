import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AuthService } from '../api';

/** 用户信息类型 */
interface UserInfo {
    user_id?: number
    openid?: string
    full_name?: string | null
    avatar_url?: string | null
    username?: string
    balance?: string | null
    points?: number
    [key: string]: unknown
}

export const useUserStore = defineStore('user', () => {
    const userId = ref<number | null>(null);
    const userInfo = ref<UserInfo | null>(null);

    const login = async () => {
        try {
            // uni.login 返回包含 code 的登录结果
            const res: UniApp.LoginRes = await uni.login({
                provider: 'weixin'
            });
            
            if (res && res.code) {
                const loginData = await AuthService.wxLoginApiV1AuthLoginPost({
                    code: res.code
                });
                userId.value = loginData.user_id;
                userInfo.value = loginData;
                // M: 持久化用户信息供路由守卫检查
                uni.setStorageSync('user_info', JSON.stringify(loginData));
                return loginData;
            }
        } catch (e) {
            console.error('Login failed', e);
            throw e;
        }
    };

    const logout = () => {
        userId.value = null;
        userInfo.value = null;
        // M: 清除持久化的用户信息
        uni.removeStorageSync('user_info');
        uni.removeStorageSync('user_token');
    };

    // 应用启动时恢复登录状态
    const restore = () => {
        const stored = uni.getStorageSync('user_info');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                userId.value = data.user_id;
                userInfo.value = data;
            } catch { /* 解析失败忽略 */ }
        }
    };

    // 自动恢复
    restore();

    return {
        userId,
        userInfo,
        login,
        logout
    };
});
