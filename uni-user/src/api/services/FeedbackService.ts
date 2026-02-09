/**
 * 用户反馈 API 服务
 * 对接后端 /api/v1/feedback 接口
 */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'

/** 反馈提交参数 */
export interface FeedbackRequest {
  user_id?: number
  contact: string
  content: string
}

export class FeedbackService {
  /** 提交用户反馈 */
  public static submit(data: FeedbackRequest): CancelablePromise<{ id: number; message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/feedback',
      body: data,
    })
  }
}
