import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { UserProfile } from '../models/UserProfile'
import type { UserStats } from '../models/UserStats'
import type { UserPoints } from '../models/UserPoints'

export class UserService {
  /** 获取用户资料 */
  public static getUserApiV1UsersUserIdGet(userId: number): CancelablePromise<UserProfile> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/users/{user_id}',
      path: {
        user_id: userId
      }
    })
  }

  /** 获取用户统计数据 */
  public static getUserStatsApiV1UsersUserIdStatsGet(userId: number): CancelablePromise<UserStats> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/users/{user_id}/stats',
      path: {
        user_id: userId
      }
    })
  }

  /** 获取用户积分数据 */
  public static getUserPointsApiV1UsersUserIdPointsGet(userId: number): CancelablePromise<UserPoints> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/users/{user_id}/points',
      path: {
        user_id: userId
      }
    })
  }
}
