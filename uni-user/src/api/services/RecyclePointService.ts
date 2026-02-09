/**
 * B2修复: 回收点查询 API 服务，替代前端硬编码假数据
 */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'

export type RecyclePoint = {
  id: number
  name: string
  address: string
  phone: string | null
  latitude: number
  longitude: number
  tags: string[]
  distance?: string
}

export class RecyclePointService {
  public static getRecyclePointsApiV1RecyclePointsGet(
    lat?: number,
    lon?: number,
    radiusKm: number = 10
  ): CancelablePromise<Array<RecyclePoint>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/recycle_points',
      query: {
        lat,
        lon,
        radius_km: radiusKm,
      }
    })
  }
}
