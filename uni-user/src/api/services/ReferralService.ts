/**
 * T2: 推荐奖励 API 服务
 * 对接后端 /api/v1/referrals/* 接口
 */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'

/** 推荐信息 */
export interface ReferralInfo {
  invite_code: string
  referral_count: number
  total_reward_points: number
}

/** 绑定结果 */
export interface BindReferralResult {
  message: string
  referrer_reward: number
  invitee_reward: number
}

export class ReferralService {
  /** 获取/生成邀请码 */
  public static getInviteCode(userId: number): CancelablePromise<{ invite_code: string }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/referrals/invite-code/{user_id}',
      path: { user_id: userId },
    })
  }

  /** 绑定邀请码 */
  public static bindReferral(userId: number, inviteCode: string): CancelablePromise<BindReferralResult> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/referrals/bind',
      body: { user_id: userId, invite_code: inviteCode },
    })
  }

  /** 获取推荐统计信息 */
  public static getReferralInfo(userId: number): CancelablePromise<ReferralInfo> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/referrals/info/{user_id}',
      path: { user_id: userId },
    })
  }
}
