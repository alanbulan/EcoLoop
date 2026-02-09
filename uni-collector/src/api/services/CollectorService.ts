import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'

export type CollectorStats = {
  balance: number
  rating: number
  month_count: number
}

/** ⚠️6修复: 回收员提现记录类型 */
export type CollectorWithdrawal = {
  id: string
  amount: number
  status: string
  channel: string
  request_date: string
}

export class CollectorService {
  public static getCollectorStatsApiV1CollectorsCollectorIdStatsGet(
    collectorId: number
  ): CancelablePromise<CollectorStats> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/collectors/{collector_id}/stats',
      path: {
        collector_id: collectorId
      }
    })
  }

  /** ⚠️6修复: 获取回收员提现记录 */
  public static getCollectorWithdrawals(
    collectorId: number
  ): CancelablePromise<Array<CollectorWithdrawal>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/collector-withdrawals',
      query: { collector_id: collectorId }
    })
  }

  /** 回收员佣金提现 */
  public static createCollectorWithdrawal(
    collectorId: number,
    amount: number,
    channel: string = 'wechat'
  ): CancelablePromise<{ id: number; message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/collector-withdrawals',
      body: { collector_id: collectorId, amount, channel },
      mediaType: 'application/json',
    })
  }
}

