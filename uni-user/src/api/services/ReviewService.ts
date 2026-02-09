/**
 * 订单评价 API 服务
 */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'

/** 评价项类型 */
export interface ReviewItem {
  id: number
  order_id: number
  user_name: string
  rating: number
  content: string | null
  tags: string[]
  created_at: string
}

/** 创建评价参数 */
export interface CreateReviewParams {
  order_id: number
  user_id: number
  rating: number
  content?: string
  tags?: string
}

export class ReviewService {
  /** 提交评价 */
  public static createReview(data: CreateReviewParams): CancelablePromise<{ id: number; message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/reviews',
      body: data,
    })
  }

  /** 查询评价列表 */
  public static getReviews(params: {
    order_id?: number
    collector_id?: number
    user_id?: number
    limit?: number
  }): CancelablePromise<ReviewItem[]> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/reviews',
      query: params,
    })
  }
}
