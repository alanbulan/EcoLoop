/**
 * A1修复: 回收员登录改为真实微信登录，替代硬编码假数据
 * 通过后端 /auth/login 获取 user_id + collector_id
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AuthService } from '../api'

/** 回收员用户信息类型 */
interface CollectorUserInfo {
    id: number
    name: string
    avatar_url?: string | null
    [key: string]: unknown
}

export const useUserStore = defineStore('user', () => {
    const collectorId = ref<number | null>(null)
    const userId = ref<number | null>(null)
    const userInfo = ref<CollectorUserInfo | null>(null)

    const login = async () => {
        try {
            // 微信登录获取 code
            const res: UniApp.LoginRes = await uni.login({ provider: 'weixin' })

            if (res && res.code) {
                const loginData = await AuthService.wxLoginApiV1AuthLoginPost({
                    code: res.code
                })
                userId.value = loginData.user_id
                collectorId.value = loginData.collector_id ?? null
                userInfo.value = {
                    id: loginData.user_id,
                    name: loginData.full_name || `回收员${loginData.user_id}`,
                    avatar_url: loginData.avatar_url,
                }
                // M: 持久化用户信息供路由守卫检查
                uni.setStorageSync('user_info', JSON.stringify({
                    user_id: loginData.user_id,
                    collector_id: loginData.collector_id,
                    ...userInfo.value,
                }))
                return loginData
            }
        } catch (e) {
            console.error('回收员登录失败', e)
            throw e
        }
    }

    const logout = () => {
        collectorId.value = null
        userId.value = null
        userInfo.value = null
        // M: 清除持久化的用户信息
        uni.removeStorageSync('user_info')
        uni.removeStorageSync('user_token')
    }

    // 应用启动时恢复登录状态
    const restore = () => {
        const stored = uni.getStorageSync('user_info')
        if (stored) {
            try {
                const data = JSON.parse(stored)
                userId.value = data.user_id
                collectorId.value = data.collector_id ?? null
                userInfo.value = { id: data.id, name: data.name, avatar_url: data.avatar_url }
            } catch { /* 解析失败忽略 */ }
        }
    }

    // 自动恢复
    restore()

    return {
        collectorId,
        userId,
        userInfo,
        login,
        logout
    }
})
