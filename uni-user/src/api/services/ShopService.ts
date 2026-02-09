/**
 * T3: 积分商城 API 服务
 * 对接后端 /api/v1/shop/* 接口
 */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'

/** 商品信息 */
export interface ShopProduct {
  id: number
  name: string
  description: string | null
  image_url: string | null
  points_cost: number
  stock: number
  is_active: boolean
}

/** 兑换记录 */
export interface ExchangeRecord {
  id: number
  product_name: string
  points_spent: number
  status: string
  remark: string | null
  created_at: string
}

/** 兑换结果 */
export interface ExchangeResult {
  message: string
  exchange_id: number
  remaining_points: number
}

export class ShopService {
  /** 获取商品列表 */
  public static getProducts(): CancelablePromise<ShopProduct[]> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/shop/products',
    })
  }

  /** 兑换商品 */
  public static exchange(userId: number, productId: number, remark?: string): CancelablePromise<ExchangeResult> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/shop/exchange',
      body: { user_id: userId, product_id: productId, remark: remark || null },
    })
  }

  /** 获取兑换记录 */
  public static getExchangeRecords(userId: number): CancelablePromise<ExchangeRecord[]> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/shop/exchanges/{user_id}',
      path: { user_id: userId },
    })
  }
}
